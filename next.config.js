/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // Прокси для API мониторинга
      {
        source: '/api/monitoring/:path*',
        destination: 'http://monitoring-service.localhost:8000/api/v1/:path*',
      },
      // Прокси для API дашбордов
      {
        source: '/api/dashboards/:path*',
        destination: 'http://dashboards-service.localhost:8050/api/:path*',
      },
      // Прокси для Prometheus
      {
        source: '/api/prometheus/:path*',
        destination: 'http://prometheus.localhost:9090/api/v1/:path*',
      },
      // Прокси для Grafana
      {
        source: '/api/grafana/:path*',
        destination: 'http://grafana.localhost:3001/api/:path*',
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
