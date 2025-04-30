#!/bin/bash

# This script can be used to manually setup the Keycloak realm, client, and roles after Keycloak is running
# Execute this script on the host machine that has access to the Keycloak container

echo "Setting up Keycloak configuration..."

# Login to Keycloak admin CLI
echo "Logging in to Keycloak..."
docker exec keycloak /opt/keycloak/bin/kcadm.sh config credentials \
  --server http://localhost:8080 \
  --realm master \
  --user admin \
  --password admin_password

# Create the monitoring realm
echo "Creating monitoring realm..."
docker exec keycloak /opt/keycloak/bin/kcadm.sh create realms \
  -s realm=monitoring \
  -s enabled=true \
  -s displayName="Система Мониторинга"

# Create roles in the monitoring realm
echo "Creating roles..."
docker exec keycloak /opt/keycloak/bin/kcadm.sh create roles \
  -r monitoring \
  -s name=admin \
  -s description="Администратор системы"

docker exec keycloak /opt/keycloak/bin/kcadm.sh create roles \
  -r monitoring \
  -s name=manager \
  -s description="Руководитель"

docker exec keycloak /opt/keycloak/bin/kcadm.sh create roles \
  -r monitoring \
  -s name=support \
  -s description="Специалист технической поддержки"

docker exec keycloak /opt/keycloak/bin/kcadm.sh create roles \
  -r monitoring \
  -s name=user \
  -s description="Обычный пользователь"

# Create the client
echo "Creating client..."
CLIENT_ID=$(docker exec keycloak /opt/keycloak/bin/kcadm.sh create clients \
  -r monitoring \
  -s clientId=monitoring-system \
  -s enabled=true \
  -s publicClient=false \
  -s clientAuthenticatorType=client-secret \
  -s 'redirectUris=["http://localhost:3000/*"]' \
  -s 'webOrigins=["http://localhost:3000"]' \
  -s directAccessGrantsEnabled=true \
  -i)

echo "Client created with ID: $CLIENT_ID"

# Generate a new client secret
echo "Generating client secret..."
CLIENT_SECRET=$(docker exec keycloak /opt/keycloak/bin/kcadm.sh get clients/$CLIENT_ID/client-secret \
  -r monitoring | grep -o '"value" : "[^"]*"' | cut -d'"' -f4)

echo "Client secret: $CLIENT_SECRET"

# Create test users
echo "Creating test users..."

# Admin user
docker exec keycloak /opt/keycloak/bin/kcadm.sh create users \
  -r monitoring \
  -s username=admin \
  -s enabled=true \
  -s email=admin@example.com \
  -s firstName=Админ \
  -s lastName=Системы

docker exec keycloak /opt/keycloak/bin/kcadm.sh set-password \
  -r monitoring \
  --username admin \
  --new-password admin123

docker exec keycloak /opt/keycloak/bin/kcadm.sh add-roles \
  -r monitoring \
  --uusername admin \
  --rolename admin

# Manager user
docker exec keycloak /opt/keycloak/bin/kcadm.sh create users \
  -r monitoring \
  -s username=manager \
  -s enabled=true \
  -s email=manager@example.com \
  -s firstName=Иван \
  -s lastName=Руководитель

docker exec keycloak /opt/keycloak/bin/kcadm.sh set-password \
  -r monitoring \
  --username manager \
  --new-password manager123

docker exec keycloak /opt/keycloak/bin/kcadm.sh add-roles \
  -r monitoring \
  --uusername manager \
  --rolename manager

# Support user
docker exec keycloak /opt/keycloak/bin/kcadm.sh create users \
  -r monitoring \
  -s username=support \
  -s enabled=true \
  -s email=support@example.com \
  -s firstName=Алексей \
  -s lastName=Техподдержка

docker exec keycloak /opt/keycloak/bin/kcadm.sh set-password \
  -r monitoring \
  --username support \
  --new-password support123

docker exec keycloak /opt/keycloak/bin/kcadm.sh add-roles \
  -r monitoring \
  --uusername support \
  --rolename support

echo "Keycloak setup completed!"
echo "-----------------------------------------------------"
echo "Client ID: monitoring-system"
echo "Client Secret: $CLIENT_SECRET"
echo "-----------------------------------------------------"
echo "Save these values for your application configuration!"
