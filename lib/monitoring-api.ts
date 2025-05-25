interface DeviceMetric {
  name: string
  value: number
  labels: Record<string, string>
}

interface DeviceStatus {
  online: number
  offline: number
  total: number
  devices: Array<{ name: string; status: string }>
}

interface SystemMetrics {
  cpu: {
    average: number
    devices: Array<{ name: string; usage: number }>
  }
  memory: {
    usedPercent: number
    totalGB: number
    usedGB: number
    freeGB: number
    cachedGB: number
    buffersGB: number
  }
  disk: {
    usedTB: number
    totalTB: number
    freeTB: number
    usedPercent: number
    devices: Array<{
      name: string
      totalTB: number
      usedTB: number
      usedPercent: number
    }>
  }
}

class MonitoringAPI {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  }

  // Парсинг Prometheus метрик из текста
  private parsePrometheusMetrics(text: string): DeviceMetric[] {
    const lines = text.split('\n')
    const metrics: DeviceMetric[] = []

    for (const line of lines) {
      if (line.startsWith('#') || !line.trim()) continue

      const match = line.match(/^([a-zA-Z_:][a-zA-Z0-9_:]*)\{([^}]*)\}\s+([+-]?[0-9]*\.?[0-9]+(?:[eE][+-]?[0-9]+)?)/)
      if (match) {
        const [, name, labelsStr, value] = match
        const labels: Record<string, string> = {}

        // Парсинг лейблов
        const labelPairs = labelsStr.split(',')
        for (const pair of labelPairs) {
          const [key, val] = pair.split('=')
          if (key && val) {
            labels[key.trim()] = val.trim().replace(/"/g, '')
          }
        }

        metrics.push({
          name,
          value: parseFloat(value),
          labels
        })
      }
    }

    return metrics
  }

  // Получение всех метрик
  async getMetrics(): Promise<DeviceMetric[]> {
    const response = await fetch(`${this.baseUrl}/metrics`)
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }
    const text = await response.text()
    return this.parsePrometheusMetrics(text)
  }

  // Получение статуса устройств
  async getDevicesStatus(): Promise<DeviceStatus> {
    const metrics = await this.getMetrics()
    const deviceUpMetrics = metrics.filter(m => m.name === 'device_up')

    let online = 0
    let offline = 0

    const devices = deviceUpMetrics.map(metric => {
      const status = metric.value === 1 ? 'online' : 'offline'
      if (status === 'online') {
        online++
      } else {
        offline++
      }
      return {
        name: metric.labels.host_name || 'unknown',
        status
      }
    })

    return {
      online,
      offline,
      total: online + offline,
      devices
    }
  }

  // Получение всех системных метрик
  async getSystemMetrics(): Promise<SystemMetrics> {
    const metrics = await this.getMetrics()

    // CPU метрики
    const cpuMetrics = metrics.filter(m => m.name === 'cpu_usage_percent')
    const averageCpu = cpuMetrics.length > 0
      ? cpuMetrics.reduce((sum, m) => sum + m.value, 0) / cpuMetrics.length
      : 0

    const cpuDevices = cpuMetrics.map(m => ({
      name: m.labels.host_name || 'unknown',
      usage: m.value
    }))

    // Memory метрики
    const memoryUsageMetrics = metrics.filter(m => m.name === 'memory_usage_percent')
    const memoryTotalMetrics = metrics.filter(m => m.name === 'memory_total')
    const memoryUsedMetrics = metrics.filter(m => m.name === 'memory_used')
    const memoryFreeMetrics = metrics.filter(m => m.name === 'memory_free')
    const memoryCachedMetrics = metrics.filter(m => m.name === 'memory_Cached_bytes')
    const memoryBuffersMetrics = metrics.filter(m => m.name === 'memory_Buffers_bytes')

    const totalMemoryBytes = memoryTotalMetrics.reduce((sum, m) => sum + m.value, 0)
    const usedMemoryBytes = memoryUsedMetrics.reduce((sum, m) => sum + m.value, 0)
    const freeMemoryBytes = memoryFreeMetrics.reduce((sum, m) => sum + m.value, 0)
    const cachedMemoryBytes = memoryCachedMetrics.reduce((sum, m) => sum + m.value, 0)
    const buffersMemoryBytes = memoryBuffersMetrics.reduce((sum, m) => sum + m.value, 0)

    const avgMemoryUsage = memoryUsageMetrics.length > 0
      ? memoryUsageMetrics.reduce((sum, m) => sum + m.value, 0) / memoryUsageMetrics.length
      : 0

    // Disk метрики
    const diskUsageMetrics = metrics.filter(m => m.name === 'disk_usage_percent')
    const diskTotalMetrics = metrics.filter(m => m.name === 'disk_total')
    const diskUsedMetrics = metrics.filter(m => m.name === 'disk_used')
    const diskFreeMetrics = metrics.filter(m => m.name === 'disk_free')

    const totalDiskBytes = diskTotalMetrics.reduce((sum, m) => sum + m.value, 0)
    const usedDiskBytes = diskUsedMetrics.reduce((sum, m) => sum + m.value, 0)
    const freeDiskBytes = diskFreeMetrics.reduce((sum, m) => sum + m.value, 0)

    const avgDiskUsage = diskUsageMetrics.length > 0
      ? diskUsageMetrics.reduce((sum, m) => sum + m.value, 0) / diskUsageMetrics.length
      : 0

    const diskDevices = diskTotalMetrics.map(m => ({
      name: m.labels.host_name || 'unknown',
      totalTB: m.value / (1024 ** 4),
      usedTB: (diskUsedMetrics.find(u => u.labels.host_name === m.labels.host_name)?.value || 0) / (1024 ** 4),
      usedPercent: diskUsageMetrics.find(d => d.labels.host_name === m.labels.host_name)?.value || 0
    }))

    return {
      cpu: {
        average: averageCpu,
        devices: cpuDevices
      },
      memory: {
        usedPercent: avgMemoryUsage,
        totalGB: totalMemoryBytes / (1024 ** 3),
        usedGB: usedMemoryBytes / (1024 ** 3),
        freeGB: freeMemoryBytes / (1024 ** 3),
        cachedGB: cachedMemoryBytes / (1024 ** 3),
        buffersGB: buffersMemoryBytes / (1024 ** 3)
      },
      disk: {
        usedTB: usedDiskBytes / (1024 ** 4),
        totalTB: totalDiskBytes / (1024 ** 4),
        freeTB: freeDiskBytes / (1024 ** 4),
        usedPercent: avgDiskUsage,
        devices: diskDevices
      }
    }
  }
}

export const monitoringAPI = new MonitoringAPI()
