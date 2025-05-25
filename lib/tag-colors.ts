// Предопределенные цвета в формате HEX с соответствующими цветами текста
export const TAG_COLORS = [
  { bg: "#3b82f6", text: "#ffffff" }, // blue-500
  { bg: "#22c55e", text: "#ffffff" }, // green-500
  { bg: "#ef4444", text: "#ffffff" }, // red-500
  { bg: "#ca8a04", text: "#ffffff" }, // yellow-600
  { bg: "#a855f7", text: "#ffffff" }, // purple-500
  { bg: "#ec4899", text: "#ffffff" }, // pink-500
  { bg: "#6366f1", text: "#ffffff" }, // indigo-500
  { bg: "#0891b2", text: "#ffffff" }, // cyan-600
  { bg: "#14b8a6", text: "#ffffff" }, // teal-500
  { bg: "#f97316", text: "#ffffff" }, // orange-500
  { bg: "#65a30d", text: "#ffffff" }, // lime-600
  { bg: "#059669", text: "#ffffff" }, // emerald-600
  { bg: "#e11d48", text: "#ffffff" }, // rose-600
  { bg: "#0284c7", text: "#ffffff" }, // sky-600
  { bg: "#c026d3", text: "#ffffff" }, // fuchsia-600
  { bg: "#d97706", text: "#ffffff" }, // amber-600
  { bg: "#7c3aed", text: "#ffffff" }, // violet-600
  { bg: "#2563eb", text: "#ffffff" }, // blue-600
  { bg: "#16a34a", text: "#ffffff" }, // green-600
  { bg: "#dc2626", text: "#ffffff" }, // red-600
  { bg: "#9333ea", text: "#ffffff" }, // purple-600
  { bg: "#db2777", text: "#ffffff" }, // pink-600
  { bg: "#4f46e5", text: "#ffffff" }, // indigo-600
  { bg: "#0e7490", text: "#ffffff" }, // cyan-700
  { bg: "#0d9488", text: "#ffffff" }, // teal-600
  { bg: "#ea580c", text: "#ffffff" }, // orange-600
  { bg: "#4d7c0f", text: "#ffffff" }, // lime-700
  { bg: "#047857", text: "#ffffff" }, // emerald-700
  { bg: "#be123c", text: "#ffffff" }, // rose-700
  { bg: "#0369a1", text: "#ffffff" }  // sky-700
];

// Кеш для консистентного отображения тегов
const tagColorCache = new Map<string, typeof TAG_COLORS[0]>();

/**
 * Более надежная хеш-функция для строк
 * Использует простую прогрессию для более равномерного распределения
 */
function hashString(str: string): number {
  let hash = 0;
  if (str.length === 0) return hash;

  // Используем только первые 8 символов для лучшего распределения
  const maxChars = Math.min(str.length, 8);

  for (let i = 0; i < maxChars; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Конвертируем в 32-битное целое
  }

  // Убедимся, что хеш положительный
  return Math.abs(hash);
}

/**
 * Получает цвет для тега, гарантируя его консистентность
 */
export function getTagColor(tag: string): typeof TAG_COLORS[0] {
  // Проверяем кеш
  if (tagColorCache.has(tag)) {
    return tagColorCache.get(tag)!;
  }

  // Генерируем индекс цвета на основе хеша тега
  const colorIndex = hashString(tag) % TAG_COLORS.length;
  const color = TAG_COLORS[colorIndex];

  // Сохраняем в кеш
  tagColorCache.set(tag, color);

  return color;
}

/**
 * Получает встроенные стили для тега
 */
export function getTagStyle(tag: string): React.CSSProperties {
  const color = getTagColor(tag);
  return {
    backgroundColor: color.bg,
    color: color.text,
    fontWeight: 500,
    borderRadius: '0.25rem',
    padding: '0.125rem 0.5rem',
    border: 'none',
    transition: 'opacity 150ms ease-in-out'
  };
}

/**
 * Очищает кеш цветов (используется для тестирования)
 */
export function clearTagColorCache(): void {
  tagColorCache.clear();
}

/**
 * Возвращает все доступные цвета
 */
export function getAllTagColors(): typeof TAG_COLORS {
  return [...TAG_COLORS];
}

/**
 * Получает стили для hover эффекта
 */
export function getTagHoverStyle(tag: string): React.CSSProperties {
  return {
    opacity: 0.9,
    cursor: 'pointer'
  };
}

/**
 * Возвращает цвета для всех тегов (для отладки)
 */
export function getAllTagsWithColors(tags: string[]): { tag: string; color: typeof TAG_COLORS[0] }[] {
  return tags.map(tag => ({
    tag,
    color: getTagColor(tag)
  }));
}
