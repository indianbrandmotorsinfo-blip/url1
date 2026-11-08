# Troubleshooting

Start with these two commands on the VM (`cd /opt/url-dashboard`):

```bash
docker compose ps
docker compose logs --tail=80
```

## The site does not open at all

| Check | Command | Healthy result |
|---|---|---|
| DNS | `dig +short myurls.yashwanthgowdam.in` | The VM's IP |
| Containers | `docker compose ps` | Three `healthy` containers |
| Ports listening | `sudo ss -tlnp \| grep -E ':80 \|:443 '` | Docker listening on both |
| OCI security list | OCI Console | Ingress rules for 80 and 443 |
| VM firewall | `sudo iptables -L INPUT -n` | ACCEPT rules for 80 and 443 |

Most "site unreachable" problems are the OCI security list or the VM firewall ([OCI_SETUP.md](OCI_SETUP.md), steps 3 and 5).

## Nginx keeps restarting

```bash
docker compose logs --tail=50 nginx
```

- `cannot load certificate ... No such file`: the certificate does not exist yet. Follow [SSL_SETUP.md](SSL_SETUP.md), then `docker compose up -d`.
- `host not found in upstream`: backend or frontend is not running. Check `docker compose ps` and their logs.
- Syntax error after an edit: run `docker compose exec nginx nginx -t` (if it is running) or fix the file and restart.

## Backend is unhealthy or restarting

```bash
docker compose logs --tail=80 backend
```

- `ADMIN_PASSWORD ... Set ADMIN_PASSWORD in .env` or validation errors: `.env` is missing or a value is too short. Password needs 12 to 72 characters; `JWT_SECRET` needs 32 or more.
- `unable to open database file`: the volume permissions are wrong. Fix with:

  ```bash
  docker run --rm -v urlmgmt-data:/data alpine chown -R 10001 /data
  docker compose restart backend
  ```

## I cannot log in

- "Incorrect username or password": the admin is whatever `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env` say. To change it, edit `.env`, run `docker compose up -d`, wait 20 seconds, and try again.
- "Too many attempts": login is limited to 5 per minute per IP. Wait a minute.
- The password contains `$` or quotes: Docker Compose treats `$` specially. Choose a password without `$`, `"`, `'` or `\`.
- Logged out unexpectedly: sessions last `JWT_EXPIRE_MINUTES` (default 8 hours), and changing `JWT_SECRET` signs everyone out.

## Certificate problems

- Browser shows a certificate warning: certificate expired or missing. Run `sudo certbot certificates` and `sudo certbot renew`.
- Renewal fails: run `sudo certbot renew --dry-run` and read the message. Usually port 80 is blocked or DNS changed.

## The GitHub Actions run failed

Open the failed job and read the first red step.

| Failing step | Likely cause | Fix |
|---|---|---|
| Lint / Test | Code problem | Reproduce locally with the commands in [INSTALL.md](INSTALL.md) |
| Evaluate vulnerability policy | Security gate | See [GITHUB_ACTIONS.md](GITHUB_ACTIONS.md), "If the gate fails" |
| Configure SSH / Upload latest code | Wrong secret, or `OCI_KNOWN_HOSTS` does not match the server | Re-check the four secrets; regenerate known hosts with `ssh-keyscan -H <IP>` |
| `Permission denied (publickey)` | Public key not on the VM | Append `oci_deploy.pem.pub` to `~/.ssh/authorized_keys` on the VM |
| Build and start containers: `test -f .env` fails | `.env` missing on VM | Create it as described in [DEPLOYMENT.md](DEPLOYMENT.md) |
| Verify container health | A container is unhealthy | The step prints the last logs; fix the cause and re-run |
| Verify the public site | DNS, firewall or certificate | Use the "site does not open" table above |

## Links do not save, or I see an error banner

The message under the form comes from the server. Common ones:

- `url: must be a valid http:// or https:// address`: the address must start with `http://` or `https://`. The form adds `https://` for you when you type just `github.com`.
- `Please sign in again.`: your session expired. Log in again.

## Out of disk space

```bash
df -h /
docker system df
docker image prune -af
```

`image prune -af` removes unused images; your data volume is not affected.

## Still stuck

Collect the output of `docker compose ps` and `docker compose logs --tail=100`, and check the browser's developer console (F12 → Console and Network) for the failing request.
