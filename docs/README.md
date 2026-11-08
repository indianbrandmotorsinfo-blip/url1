# URL Management Dashboard

A clean, fast homepage for your personal and work links (GitHub, AWS Console, Grafana, Jenkins and so on). Each link is a card. Click the name and it opens in a new tab. Search is instant. You, the single admin, can sign in to add, edit and delete links; visitors never see those controls.

## What you get

- **Frontend:** React, TypeScript, Vite, Material UI
- **Backend:** FastAPI (Python) with JWT login and bcrypt password hashing
- **Database:** SQLite in a persistent Docker volume (tables: `admin`, `urls`)
- **Edge:** Nginx with HTTPS, security headers and rate limiting
- **Delivery:** GitHub Actions with lint, tests, Trivy security gate and SSH deployment to an OCI Ubuntu VM

## How the pieces fit

```
Browser ──HTTPS──► nginx (80/443) ──► frontend (static files, port 8080)
                        │
                        └── /api/* ──► backend (FastAPI, port 8000) ──► SQLite (/data volume)
```

Only `nginx` is exposed to the internet. `frontend` and `backend` are reachable only inside the Docker network.

## Project layout

```
backend/            FastAPI app (app/), tests (tests/), Dockerfile
frontend/           React app (src/), Dockerfile, nginx.conf for static files
nginx/              Edge Nginx config (HTTPS, headers, rate limits)
scripts/backup.sh   Database backup helper
docs/               This documentation
.github/workflows/  CI/CD pipeline
docker-compose.yml  The three containers
.env.example        Settings you copy to .env on the server
```

## Which guide do I read?

| I want to... | Read |
|---|---|
| Run it on my own computer | [INSTALL.md](INSTALL.md) |
| Put it on the internet, start to finish | [DEPLOYMENT.md](DEPLOYMENT.md) |
| Create and prepare the OCI VM | [OCI_SETUP.md](OCI_SETUP.md) |
| Point my domain at the VM | [GODADDY_DNS.md](GODADDY_DNS.md) |
| Understand or change the Nginx config | [NGINX_SETUP.md](NGINX_SETUP.md) |
| Get and renew the HTTPS certificate | [SSL_SETUP.md](SSL_SETUP.md) |
| Understand the containers | [DOCKER.md](DOCKER.md) |
| Set up automatic deployments | [GITHUB_ACTIONS.md](GITHUB_ACTIONS.md) |
| Back up or restore my links | [BACKUP_RESTORE.md](BACKUP_RESTORE.md) |
| Fix something that is broken | [TROUBLESHOOTING.md](TROUBLESHOOTING.md) |

**First time deploying?** Follow [DEPLOYMENT.md](DEPLOYMENT.md). It links to the other guides in the right order.
