import { toast } from "sonner";

interface ApiErrorOptions {
  context?: string;
  showToast?: boolean;
  defaultMessage?: string;
}

/**
 * Обрабатывает ошибки API с возможностью показа toast-уведомления
 * и возвращает пользовательское сообщение
 */
export function handleApiError(
  error: unknown,
  options: ApiErrorOptions = {}
): string {
  const {
    context = '',
    showToast = true,
    defaultMessage = 'Произошла ошибка при работе с API'
  } = options;

  let userMessage = defaultMessage;
  let errorDetails = '';

  // Приводим ошибку к строке для анализа
  const errorStr = error instanceof Error
    ? error.message
    : String(error);

  // Определяем тип ошибки
  if (errorStr.includes('404')) {
    userMessage = 'Ресурс не найден';
  } else if (errorStr.includes('400')) {
    userMessage = 'Неверные данные запроса';
  } else if (errorStr.includes('422')) {
    userMessage = 'Ошибка валидации данных';
    // Извлекаем детали ошибки валидации
    try {
      const match = errorStr.match(/HTTP 422: (.*)/);
      if (match && match[1]) {
        const errorData = JSON.parse(match[1]);
        if (errorData.detail && Array.isArray(errorData.detail)) {
          errorDetails = errorData.detail
            .map((err: any) => `Поле ${err.loc.join('.')}: ${err.msg}`)
            .join('\n');
          userMessage = 'Ошибка валидации данных';
        }
      }
    } catch (e) {
      console.error('Ошибка при парсинге деталей валидации:', e);
    }
  } else if (errorStr.includes('500')) {
    userMessage = 'Внутренняя ошибка сервера';
  } else if (errorStr.includes('fetch') || errorStr.includes('network')) {
    userMessage = 'Проблема с подключением к серверу';
  }

  // Формируем полное сообщение
  const fullMessage = context
    ? `${userMessage} при ${context}`
    : userMessage;

  // Логируем ошибку
  console.error(`API Error ${context ? `[${context}]` : ''}:`, error);
  if (errorDetails) {
    console.error('Детали ошибки:', errorDetails);
  }

  // Показываем toast при необходимости
  if (showToast) {
    toast.error(fullMessage, {
      description: errorDetails || undefined,
      duration: errorDetails ? 6000 : 3000
    });
  }

  return fullMessage;
}
