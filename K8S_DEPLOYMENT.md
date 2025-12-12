# Kubernetes Deployment Guide

## Prerequisites

- Kubernetes cluster with kubectl configured
- Docker installed for building images
- Domain name configured (e.g., passkey.andrewaryo.com)
- Traefik ingress controller installed
- cert-manager installed for SSL certificates

## Configuration

### 1. Update Domain Configuration

Before deploying, update the domain in these files:

**k8s/05-app-deployment.yaml**
- Update `RP_ID` to your domain
- Update `ORIGIN` to your HTTPS URL

**k8s/06-ingress.yaml**
- Update `host` to your domain
- Update TLS secret name if needed

### 2. Update Secrets

**k8s/02-secret.yaml**
```yaml
stringData:
  DB_PASSWORD: your-secure-password
  SESSION_SECRET: your-secure-session-secret-min-32-chars
```

## Build and Push Docker Image

### 1. Build the image
```bash
docker build -t andrew4coding/circle-calculator:latest .
```

### 2. Test locally (optional)
```bash
docker run -p 8080:8080 \
  -e DB_HOST=localhost \
  -e DB_USER=postgres \
  -e DB_PASSWORD=my-secret-pw \
  -e DB_NAME=webauthn_db \
  -e DB_PORT=5432 \
  -e SESSION_SECRET=test-secret \
  andrew4coding/circle-calculator:latest
```

### 3. Push to registry
```bash
docker push andrew4coding/circle-calculator:latest
```

## Deploy to Kubernetes

### 1. Apply all configurations in order
```bash
kubectl apply -f k8s/00-namespace.yaml
kubectl apply -f k8s/01-configmap.yaml
kubectl apply -f k8s/02-secret.yaml
kubectl apply -f k8s/03-postgres-pvc.yaml
kubectl apply -f k8s/04-postgres-deployment.yaml
kubectl apply -f k8s/05-app-deployment.yaml
kubectl apply -f k8s/06-ingress.yaml
```

Or apply all at once:
```bash
kubectl apply -f k8s/
```

### 2. Verify deployment
```bash
# Check namespace
kubectl get ns circle-calculator

# Check pods
kubectl get pods -n circle-calculator

# Check services
kubectl get svc -n circle-calculator

# Check ingress
kubectl get ingress -n circle-calculator

# View logs
kubectl logs -n circle-calculator -l app=circle-calculator --tail=100
```

### 3. Check PostgreSQL
```bash
# Test database connection
kubectl exec -n circle-calculator -it deployment/postgres -- psql -U postgres -d webauthn_db -c "\dt"
```

## Troubleshooting

### Pod not starting
```bash
# Describe pod
kubectl describe pod -n circle-calculator <pod-name>

# Check logs
kubectl logs -n circle-calculator <pod-name>

# Check init container logs
kubectl logs -n circle-calculator <pod-name> -c wait-for-postgres
```

### Database connection issues
```bash
# Check if postgres is ready
kubectl exec -n circle-calculator deployment/postgres -- pg_isready

# Check postgres logs
kubectl logs -n circle-calculator deployment/postgres

# Test connection from app pod
kubectl exec -n circle-calculator deployment/circle-calculator-app -- nc -zv postgres 5432
```

### SSL Certificate issues
```bash
# Check certificate status
kubectl describe certificate -n circle-calculator circle-calculator-tls

# Check cert-manager logs
kubectl logs -n cert-manager deployment/cert-manager
```

## Updating the Application

### 1. Make code changes

### 2. Rebuild and push image
```bash
docker build -t andrew4coding/circle-calculator:latest .
docker push andrew4coding/circle-calculator:latest
```

### 3. Restart deployment
```bash
kubectl rollout restart deployment/circle-calculator-app -n circle-calculator

# Watch rollout status
kubectl rollout status deployment/circle-calculator-app -n circle-calculator
```

## Scaling

### Scale up/down
```bash
kubectl scale deployment/circle-calculator-app -n circle-calculator --replicas=3
```

### Auto-scaling (optional)
```bash
kubectl autoscale deployment circle-calculator-app -n circle-calculator \
  --cpu-percent=80 \
  --min=2 \
  --max=5
```

## Cleanup

### Remove all resources
```bash
kubectl delete namespace circle-calculator
```

Or remove specific resources:
```bash
kubectl delete -f k8s/
```

## Production Checklist

- [ ] Update domain name in ingress and app deployment
- [ ] Change database password in secrets
- [ ] Change session secret (use strong random string)
- [ ] Configure proper resource limits
- [ ] Set up monitoring and alerts
- [ ] Configure backup for PostgreSQL PVC
- [ ] Enable pod disruption budget
- [ ] Configure network policies
- [ ] Set up logging aggregation
- [ ] Test passkey registration and login
- [ ] Verify HTTPS is working
- [ ] Test on multiple devices

## Important Notes

1. **HTTPS Required**: WebAuthn (passkeys) requires HTTPS in production. The ingress is configured for HTTPS with Let's Encrypt.

2. **Domain Configuration**: Update `RP_ID` and `ORIGIN` to match your domain exactly.

3. **Database Persistence**: The PostgreSQL data is stored in a PVC. Backup regularly.

4. **Session Storage**: Currently using in-memory sessions. For production with multiple replicas, consider using Redis or PostgreSQL session store.

5. **Secrets Management**: Use Kubernetes secrets or external secret managers (like Sealed Secrets, External Secrets Operator) for sensitive data.
