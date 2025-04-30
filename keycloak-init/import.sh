#!/bin/bash

# Wait for Keycloak to become available
echo "Waiting for Keycloak to start..."
until curl -s --head --fail http://localhost:8080/health/ready; do
    sleep 5
done

echo "Keycloak is ready!"

# Create the monitoring realm
/opt/keycloak/bin/kcadm.sh config credentials --server http://localhost:8080 --realm master --user admin --password admin_password
/opt/keycloak/bin/kcadm.sh create realms -f /opt/keycloak/data/import/realm-monitoring.json

echo "Keycloak initialization completed!"
