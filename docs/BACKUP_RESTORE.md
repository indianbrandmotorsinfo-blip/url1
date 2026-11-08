# Backup and restore

All your links live in one SQLite file, `/data/urls.db`, inside the Docker volume `urlmgmt-data`. Back up that file.

## Make a backup

On the VM:

```bash
cd /opt/url-dashboard
./scripts/backup.sh
```

Expected output: `Backup written to ./backups/urls-2026-11-08_101500.db`

The script uses SQLite's online backup, so the copy is consistent even while the site is running, and it keeps the 14 newest backups.

### Automatic daily backups

```bash
crontab -e
```

Add this line (runs every day at 02:30), then save:

```
30 2 * * * cd /opt/url-dashboard && ./scripts/backup.sh >> /opt/url-dashboard/backups/backup.log 2>&1
```

Check with `crontab -l`. Create the folder first so the log file can be written: `mkdir -p /opt/url-dashboard/backups`.

### Keep a copy off the server

A backup on the same VM does not protect you if the VM is lost. From your own computer:

```bash
scp -i oci_deploy.pem ubuntu@<PUBLIC_IP>:/opt/url-dashboard/backups/urls-*.db ./my-backups/
```

## Restore a backup

Choose the file, for example `backups/urls-2026-11-08_101500.db`.

```bash
cd /opt/url-dashboard
docker compose stop backend

docker run --rm \
  -v urlmgmt-data:/data \
  -v "$PWD/backups":/backup:ro \
  alpine sh -c "cp /backup/urls-2026-11-08_101500.db /data/urls.db && rm -f /data/urls.db-wal /data/urls.db-shm && chown 10001 /data/urls.db"

docker compose start backend
```

Step by step:

- `docker compose stop backend` stops the app so nothing writes during the restore.
- The `docker run` command starts a throwaway container that mounts the data volume, copies your backup over `urls.db`, deletes leftover write-ahead files, and gives the file back to the app's user (UID 10001).
- `docker compose start backend` brings the app back.

Verify:

```bash
docker compose ps
curl -fsS https://myurls.yashwanthgowdam.in/api/urls
```

You should see your links as JSON.

If the restored database has an older admin password, the backend replaces it with the one in `.env` on startup, so you can always log in with the current `.env` values.

## Move to a new server

1. Set up the new VM ([OCI_SETUP.md](OCI_SETUP.md)), DNS and certificate.
2. Copy your latest backup to the new VM.
3. Deploy once so the volume exists, then restore using the steps above.
