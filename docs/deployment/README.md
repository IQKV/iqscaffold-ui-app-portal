## 📱 Deployment Guide

### Overview

The IQ Key Value App Portal is deployed using Helm charts and automated CI/CD pipelines. The service provides a React-based application portal UI with Nginx serving, runtime configuration via ConfigMap, and SPA routing support for the main application dashboard.

### Prerequisites

- Kubernetes 1.19+
- Helm 3.2.0+
- Nginx Ingress Controller
- TLS certificates (for production)

### Environments

| Environment | Namespace      | Purpose                     |
| ----------- | -------------- | --------------------------- |
| SIT         | `iqkv-sit-env` | Feature branch testing      |
| UAT         | `iqkv-uat-env` | Pre-production validation   |
| PRD         | `iqkv-prd-env` | Live production environment |

### Automated Deployment (CI/CD)

#### Drone Pipeline Overview

The service uses Drone CI/CD pipeline with 10 stages:

1. **VerifyCode** - Code quality, tests, static analysis
2. **PublishArtifacts** - Build artifacts to registry
3. **PublishDockerImage** - Container images to registry
4. **DeployWorkInProgress** - WIP branch auto-deployment
5. **RollbackWorkInProgress** - WIP rollback
6. **PromoteFeatureDeployment** - Feature branch promotion
7. **RollbackFeatureDeployment** - Feature rollback
8. **PromoteDeployment** - Release promotion
9. **RollbackDeployment** - Release rollback
10. **ReleasePackage** - Automated version management

#### Branch Deployment Strategy

| Branch Type | Auto Deploy | Manual Promote | Target Environment |
| ----------- | ----------- | -------------- | ------------------ |
| `wip`       | ✅ SIT      | -              | SIT                |
| `feature/*` | -           | ✅ SIT         | SIT                |
| `dev`       | -           | ✅ UAT         | UAT                |
| Tags        | -           | ✅ PRD         | PRD                |

<details>
<summary>Deployment Commands</summary>

The pipeline uses these Helm commands for deployment:

```bash
# Development (WIP branches)
helm upgrade --install --atomic --wait --timeout 5m iqscaffold-ui-mantine-app-portal ./ \
  --values ./values.yaml \
  --values ./values-test.yaml \
  --set image.tag=wip \
  --set app.env.apiServerUrl="https://api.iqkv.site" \
  --namespace iqkv-sit-env

# Production (Tagged releases)
helm upgrade --install --atomic --wait --timeout 5m iqscaffold-ui-mantine-app-portal ./ \
  --values ./values.yaml \
  --values ./values-prd.yaml \
  --set image.tag=${DRONE_TAG} \
  --set app.env.apiServerUrl="https://api.iqkv.site" \
  --namespace iqkv-prd-env
```

</details>

### Manual Deployment

#### Quick Start

<details>
<summary>Quick Start Commands</summary>

```bash
# Clone Helm charts
git clone <HELM_CHARTS_REPOSITORY> charts
cd charts/IQKV/iqscaffold-ui-mantine-app-portal

# Deploy to development
helm upgrade --install app-portal ./ \
  --values values-sit.yaml \
  --set app.env.apiServerUrl="https://api.iqkv.site" \
  --namespace iqkv-sit-env \
  --create-namespace
```

</details>

#### Environment-Specific Deployments

<details>
<summary>Development Deployment</summary>

```bash
helm upgrade --install app-portal ./ \
  --values values-sit.yaml \
  --namespace iqkv-sit-env \
  --create-namespace
```

</details>

<details>
<summary>Production Deployment</summary>

```bash
helm upgrade --install app-portal ./ \
  --values values-prd.yaml \
  --set app.env.apiServerUrl="https://api.iqkv.site" \
  --set app.env.authDomainAuth="https://auth.iqkv.site" \
  --set app.env.authDomainApp="https://app.iqkv.site" \
  --namespace iqkv-prd-env \
  --create-namespace
```

</details>

### Configuration

#### Required Configuration

| Setting          | Environment Variable     | Required | Description              |
| ---------------- | ------------------------ | -------- | ------------------------ |
| API Server URL   | `app.env.apiServerUrl`   | ✅       | Backend API endpoint     |
| Auth Domain Auth | `app.env.authDomainAuth` | ✅       | Authentication domain    |
| Auth Domain App  | `app.env.authDomainApp`  | ✅       | Application domain       |
| Redirect URLs    | `app.env.authRedirect*`  | ✅       | Post-auth redirect paths |

#### External Dependencies

The service connects to these external components:

- **API Gateway**: Backend API services
- **User Service**: Authentication and user management
- **Auth Portal**: Authentication flow integration
- **CDN/Load Balancer**: Static asset delivery

#### Service Configuration

| Setting        | Dev      | Production       |
| -------------- | -------- | ---------------- |
| Replicas       | 1        | 3                |
| CPU Request    | 100m     | 500m             |
| Memory Request | 128Mi    | 512Mi            |
| Autoscaling    | Disabled | 3-10 replicas    |
| Ingress        | Enabled  | Enabled with TLS |
| Monitoring     | Disabled | Enabled          |

<details>
<summary>Application-Specific Configuration</summary>

| Setting             | Dev        | Production | Description                |
| ------------------- | ---------- | ---------- | -------------------------- |
| MSW (Mock Service)  | false      | false      | Enable mock service worker |
| Log Level           | debug      | warn       | Application logging level  |
| CSP Policy          | Relaxed    | Strict     | Content Security Policy    |
| Security Headers    | Basic      | Enhanced   | HTTP security headers      |
| Rate Limiting       | None       | 100/min    | Request rate limiting      |
| Dashboard Redirects | /dashboard | /dashboard | Post-login redirect path   |

</details>

### Monitoring & Health Checks

#### Health Endpoints

- **Liveness**: `/` (port 8080)
- **Readiness**: `/` (port 8080)
- **Health Check**: `/health` (port 8080)
- **Metrics**: `/metrics` (port 8080, production only)

#### Monitoring Stack

Production deployments include:

- Prometheus ServiceMonitor
- Alerting rules for service health
- Grafana dashboards

<details>
<summary>Application-Specific Alerts</summary>

| Alert                      | Condition                         | Severity | Description                    |
| -------------------------- | --------------------------------- | -------- | ------------------------------ |
| AppPortalDown              | Service unavailable > 1 minute    | Critical | Service is down                |
| AppPortalHighMemory        | Memory usage > 80%                | Warning  | High memory consumption        |
| AppPortalHighLatency       | Response time > 2 seconds         | Warning  | High response times            |
| AppPortalHighErrorRate     | Error rate > 5%                   | Warning  | High error rate                |
| AppPortalCertificateExpiry | TLS certificate expires < 30 days | Warning  | Certificate expiring soon      |
| AppPortalDashboardErrors   | Dashboard load errors > 10/min    | Warning  | Dashboard functionality issues |

</details>

### Troubleshooting

#### Common Issues

<details>
<summary>Service Unavailable</summary>

```bash
# Check service logs
kubectl logs deployment/iqscaffold-ui-mantine-app-portal -n iqkv-sit-env

# Check pod status
kubectl get pods -l app.kubernetes.io/name=iqscaffold-ui-mantine-app-portal -n iqkv-sit-env

# Check ingress configuration
kubectl describe ingress iqscaffold-ui-mantine-app-portal -n iqkv-sit-env
```

</details>

<details>
<summary>Configuration Issues</summary>

```bash
# View ConfigMap
kubectl describe configmap iqscaffold-ui-mantine-app-portal-config -n iqkv-sit-env

# Check runtime configuration
kubectl exec -it deployment/iqscaffold-ui-mantine-app-portal -n iqkv-sit-env -- \
  cat /usr/share/nginx/html/config.js

# Verify init container logs
kubectl logs deployment/iqscaffold-ui-mantine-app-portal -c config-init -n iqkv-sit-env
```

</details>

<details>
<summary>Test Health Endpoints</summary>

```bash
# Port forward to access health endpoints
kubectl port-forward deployment/iqscaffold-ui-mantine-app-portal 8080:8080 -n iqkv-sit-env

# Test health endpoints
curl http://localhost:8080/
curl http://localhost:8080/health

# Test API connectivity (from browser console)
# Check window.VITE_API_SERVER_URL configuration
```

</details>

<details>
<summary>Dashboard and SPA Routing Issues</summary>

```bash
# Check SPA routing configuration
kubectl exec -it deployment/iqscaffold-ui-mantine-app-portal -n iqkv-sit-env -- \
  cat /usr/share/nginx/site.conf

# Test SPA routes
curl -H "Accept: text/html" http://localhost:8080/dashboard
curl -H "Accept: text/html" http://localhost:8080/profile

# Check CORS headers for cross-domain requests
curl -H "Origin: https://auth.iqkv.site" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization" \
  -X OPTIONS https://app.iqkv.site/
```

</details>

<details>
<summary>Authentication Integration Issues</summary>

```bash
# Test auth domain connectivity
curl -v https://auth.iqkv.site/.well-known/openid_configuration

# Check redirect configuration
kubectl exec -it deployment/iqscaffold-ui-mantine-app-portal -n iqkv-sit-env -- \
  grep -i redirect /usr/share/nginx/html/config.js

# Verify API server connectivity
kubectl exec -it deployment/iqscaffold-ui-mantine-app-portal -n iqkv-sit-env -- \
  curl -v https://api.iqkv.site/health
```

</details>

#### Rollback

<details>
<summary>Rollback Commands</summary>

```bash
# Rollback to previous version
helm rollback iqscaffold-ui-mantine-app-portal -n iqkv-prd-env

# Or uninstall completely
helm uninstall iqscaffold-ui-mantine-app-portal -n iqkv-prd-env
```

</details>

### Security

- TLS enabled in production with Let's Encrypt certificates
- Strict Content Security Policy in production
- Enhanced security headers (HSTS, X-Frame-Options, etc.)
- CORS configured for iqkv.site subdomains only
- Rate limiting enabled in production
- Non-root container execution
- Read-only root filesystem in production
- Runtime configuration injection via ConfigMap
- No sensitive data in container images
- SPA routing security with proper fallback handling
- Dashboard access control integration with auth service
