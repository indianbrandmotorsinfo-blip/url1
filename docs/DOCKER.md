# Docker guide

## The three containers

| Service | Container name | Image | Listens on | Purpose |
|---|---|---|---|---|
| `backend` | `urlmgmt-backend` | built from `backend/` | 8000 (internal) | FastAPI API and SQLite |
| `frontend` | `urlmgmt-frontend` | built from `frontend/` | 8080 (internal) | Serves the built React app |
| `nginx` | `urlmgmt-nginx` | `nginx:1.27-alpine` | 80 and 443 (public) | HTTPS, headers, rate limits, routing |

All three use `restart: always`, so they start again after a crash or a VM reboot (Docker itself starts at boot).

Every service has a **health check**:

- backend calls `/api/health`, which also runs a database query,
- frontend and nginx fetch a page on localhost.

Nginx only starts once the backend and frontend are healthy.

## Persistent data

The database lives in the named volume `urlmgmt-data`, mounted at `/data` inside the backend. It survives rebuilds, restarts and `docker compose down`. It is deleted only by `docker compose down -v` or `docker volume rm urlmgmt-data`. **Never run those unless you have a backup** ([BACKUP_RESTORE.md](BACKUP_RESTORE.md)).

## Settings

The backend reads these from `.env` (see `.env.example`): `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `JWT_SECRET`, `JWT_EXPIRE_MINUTES`, `LOG_LEVEL`. After editing `.env`:

```bash
docker compose up -d
```

Compose notices the changed values and recreates the backend. Changing the admin username or password takes effect at startup; the stored admin account is updated automatically.

## Everyday commands

Run these from `/opt/url-dashboard` on the VM.

| Command | What it does |
|---|---|
| `docker compose ps` | Shows containers and their health |
| `docker compose logs --tail=100 backend` | Last 100 backend log lines |
| `docker compose logs -f` | Follows all logs live (`Ctrl+C` to stop) |
| `docker compose up -d --build` | Rebuilds images and starts or updates containers |
| `docker compose restart backend` | Restarts one service |
| `docker compose down` | Stops and removes containers (data volume is kept) |
| `docker image prune -f` | Deletes unused old images to free disk space |

Expected `docker compose ps` output:

```
NAME               STATUS
urlmgmt-backend    Up 2 minutes (healthy)
urlmgmt-frontend   Up 2 minutes (healthy)
urlmgmt-nginx      Up 2 minutes (healthy)
```

## Security in the images

- The backend runs as a non-root user (UID 10001) and the frontend uses the unprivileged Nginx image.
- Only Nginx publishes ports.
- Images are scanned by Trivy on every pipeline run ([GITHUB_ACTIONS.md](GITHUB_ACTIONS.md)).
