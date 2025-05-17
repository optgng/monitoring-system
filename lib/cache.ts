// Тип для кэшированных данных
interface CacheEntry<T> {
  data: T
  timestamp: number
}

// Класс для управления кэшем
class Cache<T> {
  private cache: Map<string, CacheEntry<T>>
  private ttl: number // время жизни кэша в миллисекундах

  constructor(ttl: number = 5 * 60 * 1000) {
    // По умолчанию 5 минут
    this.cache = new Map()
    this.ttl = ttl
  }

  // Получение данных из кэша
  get(key: string): T | null {
    const entry = this.cache.get(key)
    const now = Date.now()

    // Если записи нет или она устарела, возвращаем null
    if (!entry || now - entry.timestamp > this.ttl) {
      if (entry) {
        // Удаляем устаревшую запись
        this.cache.delete(key)
      }
      return null
    }

    return entry.data
  }

  // Сохранение данных в кэш
  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  // Удаление данных из кэша
  delete(key: string): void {
    this.cache.delete(key)
  }

  // Очистка всего кэша
  clear(): void {
    this.cache.clear()
  }

  // Очистка устаревших записей
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key)
      }
    }
  }

  // Получение размера кэша
  size(): number {
    return this.cache.size
  }
}

// Создаем и экспортируем кэш для профилей пользователей
export const profileCache = new Cache<any>()

// Экспортируем класс Cache для использования в других модулях
export { Cache }
