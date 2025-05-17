import { KeycloakService } from "./keycloak-service"
import { logger } from "./logger"

// Создаем и экспортируем экземпляр сервиса Keycloak
export const keycloakService = new KeycloakService({
  baseUrl: process.env.KEYCLOAK_HOST || "http://localhost:8080",
  realm: "monitoring",
  clientId: process.env.KEYCLOAK_CLIENT_ID || "",
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || "",
  logger: logger,
})

// Реэкспортируем класс KeycloakService для использования в других модулях
export { KeycloakService }
