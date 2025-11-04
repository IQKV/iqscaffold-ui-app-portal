# Runtime Configuration Guide

This document explains how to configure the React 19 application at runtime using the `public/config.js` file.

## Overview

The application supports runtime configuration through JavaScript variables exposed on the `window` object. This allows you to modify application behavior without rebuilding the Docker image, making it ideal for containerized deployments.

## How It Works

1. **Build Time**: Environment variables are bundled into the application during `vite build`
2. **Runtime**: The `public/config.js` file overrides build-time values via `window` globals
3. **Application**: The app reads the final merged configuration

```html
<!-- index.html loads config before the app -->
<script src="/config.js"></script>
<script type="module" src="/src/main.tsx"></script>
```

## Configuration Variables

### Required Configuration

```javascript
// public/config.js
window.VITE_API_URL_SERVER = "https://api.example.com";
window.VITE_AUTH_DOMAIN_AUTH = "https://auth.example.com";
window.VITE_AUTH_DOMAIN_APP = "https://app.example.com";
```

### Complete Configuration

```javascript
// All available configuration options
window.VITE_API_URL_SERVER = "https://api.example.com";
window.VITE_ENABLE_MSW = "false";
window.VITE_LOG_LEVEL = "warn";
window.VITE_AUTH_DOMAIN_AUTH = "https://auth.example.com";
window.VITE_AUTH_DOMAIN_APP = "https://app.example.com";
window.VITE_AUTH_REDIRECT_AFTER_LOGIN = "/dashboard";
window.VITE_AUTH_REDIRECT_AFTER_LOGOUT = "/auth/login";
window.VITE_AUTH_REDIRECT_AFTER_SIGNUP = "/auth/verify-email";
```

## Environment Examples

### Development

```javascript
window.VITE_API_URL_SERVER = "http://localhost:3000";
window.VITE_ENABLE_MSW = "true";
window.VITE_LOG_LEVEL = "debug";
window.VITE_AUTH_DOMAIN_AUTH = "http://localhost:5173";
window.VITE_AUTH_DOMAIN_APP = "http://localhost:5173";
```

### Production

```javascript
window.VITE_API_URL_SERVER = "https://api.production.com";
window.VITE_ENABLE_MSW = "false";
window.VITE_LOG_LEVEL = "error";
window.VITE_AUTH_DOMAIN_AUTH = "https://auth.production.com";
window.VITE_AUTH_DOMAIN_APP = "https://app.production.com";
```

## Docker Usage

### Simple Volume Mount

```bash
# Create config file
echo 'window.VITE_API_URL_SERVER = "https://api.example.com";' > config.js

# Run container with config
docker run -v $(pwd)/config.js:/usr/share/nginx/html/config.js:ro your-app:latest
```

### Docker Compose

```yaml
version: "3.8"
services:
  react-app:
    image: your-app:latest
    ports:
      - "80:80"
    volumes:
      - ./config.js:/usr/share/nginx/html/config.js:ro
    environment:
      - NODE_ENV=production
```

## Kubernetes ConfigMap

For detailed Kubernetes setup, see [kubernetes-configmap.md](./kubernetes-configmap.md).

### Quick Setup

```bash
# Create ConfigMap
kubectl create configmap app-config \
  --from-literal=config.js='window.VITE_API_URL_SERVER = "https://api.k8s.com";'

# Mount in deployment
kubectl patch deployment react-app -p '{
  "spec": {
    "template": {
      "spec": {
        "volumes": [{"name": "config", "configMap": {"name": "app-config"}}],
        "containers": [{
          "name": "react-app",
          "volumeMounts": [{
            "name": "config",
            "mountPath": "/usr/share/nginx/html/config.js",
            "subPath": "config.js"
          }]
        }]
      }
    }
  }
}'
```

## Configuration Reference

| Variable                          | Type   | Default                 | Description                                           |
| --------------------------------- | ------ | ----------------------- | ----------------------------------------------------- |
| `VITE_API_URL_SERVER`             | string | `http://localhost:3000` | Backend API base URL                                  |
| `VITE_ENABLE_MSW`                 | string | `false`                 | Enable Mock Service Worker                            |
| `VITE_LOG_LEVEL`                  | string | `info`                  | Log level: `silent`, `error`, `warn`, `info`, `debug` |
| `VITE_AUTH_DOMAIN_AUTH`           | string | `http://localhost:5173` | Authentication service domain                         |
| `VITE_AUTH_DOMAIN_APP`            | string | `http://localhost:5173` | App domain for auth callbacks                         |
| `VITE_AUTH_REDIRECT_AFTER_LOGIN`  | string | `/`                     | Post-login redirect path                              |
| `VITE_AUTH_REDIRECT_AFTER_LOGOUT` | string | `/auth/login`           | Post-logout redirect path                             |
| `VITE_AUTH_REDIRECT_AFTER_SIGNUP` | string | `/auth/verify-email`    | Post-signup redirect path                             |

## Troubleshooting

### Configuration Not Loading

1. **Check file exists**: Verify `config.js` is accessible at `/config.js`
2. **Check syntax**: Ensure valid JavaScript syntax in config file
3. **Check timing**: Config must load before main application script
4. **Check browser**: Open DevTools and verify `window.VITE_*` variables exist

### Common Issues

```bash
# Verify config file in container
docker exec -it container-name cat /usr/share/nginx/html/config.js

# Check nginx serves config correctly
curl http://localhost/config.js

# Test in browser console
console.log(window.VITE_API_URL_SERVER);
```

## Best Practices

1. **Always validate**: Test configuration changes in non-production first
2. **Use version control**: Store config files in version control
3. **Document changes**: Keep track of configuration modifications
4. **Monitor impact**: Watch application behavior after config changes
5. **Backup configs**: Maintain backups of working configurations

## Security Notes

- **No secrets**: Never put sensitive data in `config.js` (it's publicly accessible)
- **Use HTTPS**: Always use HTTPS URLs in production configurations
- **Validate inputs**: The application should validate configuration values
- **Access control**: Restrict who can modify configuration files
