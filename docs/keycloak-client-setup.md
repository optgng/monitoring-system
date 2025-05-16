# Keycloak Client Configuration Guide

This guide explains how to properly configure your Keycloak client for the monitoring system.

## 1. Create a Client in the Monitoring Realm

1. Log in to the Keycloak Admin Console
2. Select the "monitoring" realm
3. Go to "Clients" in the left sidebar
4. Click "Create client"

## 2. Basic Settings

- **Client ID**: `monitoring-system` (must match KEYCLOAK_CLIENT_ID in .env)
- **Name**: Monitoring System
- **Description**: Client for the monitoring system
- **Always display in console**: OFF
- **Client Authentication**: ON (this is important for service account)
- **Authorization**: OFF
- Click "Next"

## 3. Capability Config

- **Standard flow**: ON
- **Direct access grants**: ON
- **Service accounts roles**: ON (this is crucial for admin API access)
- **Implicit flow**: OFF
- **OAuth 2.0 Device Authorization Grant**: OFF
- **OIDC CIBA Grant**: OFF
- Click "Next"

## 4. Login Settings

- **Root URL**: Your application URL (e.g., http://localhost:3000)
- **Home URL**: /
- **Valid redirect URIs**: 
  - http://localhost:3000/*
  - Your production URL/*
- **Web origins**: 
  - http://localhost:3000
  - Your production URL
- Click "Save"

## 5. Configure Service Account Roles

1. Go to the "Service Account Roles" tab for your client
2. Click "Assign Role"
3. Filter by clients and select "realm-management"
4. Assign the following roles:
   - manage-users
   - view-users
   - query-users
   - query-groups
   - manage-clients

## 6. Get Client Secret

1. Go to the "Credentials" tab for your client
2. Copy the client secret
3. Add it to your .env file as KEYCLOAK_CLIENT_SECRET

## 7. Verify Configuration

1. Go to your application
2. Visit /api/debug/keycloak to check if the configuration is working
