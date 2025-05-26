import { KeycloakService } from "./keycloak-service"
import { logger } from "./logger"

// Создаем и экспортируем экземпляр сервиса Keycloak
export const keycloakService = new KeycloakService()

// Реэкспортируем класс KeycloakService для использования в других модулях
export { KeycloakService }
