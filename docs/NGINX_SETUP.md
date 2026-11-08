# Nginx setup

Nginx is the only container exposed to the internet. It terminates HTTPS, adds security headers, applies rate limits and forwards requests:

- `/api/...` goes to the FastAPI backend
- everything else goes to the frontend container (the built React app)

The files, all inside `nginx/` and mounted read-only into the container:

| File | Purpose |
|---|---|
| `nginx.conf` | Global settings: logging, gzip, rate-limit zones |
| `conf.d/myurls.conf` | The site: HTTP redirect, HTTPS server, routes, headers |
| `proxy_params.conf` | Headers passed to the backend and frontend |

You do not need to install Nginx on the VM. It runs in Docker.

## What the site config does

**HTTP (port 80)**

- `/nginx-health` answers `ok`. Docker uses it for the health check.
- Everything else redirects to HTTPS with a `301`.

**HTTPS (port 443)**

- Uses the Let's Encrypt files from `/etc/letsencrypt` ([SSL_SETUP.md](SSL_SETUP.md)).
- Allows only TLS 1.2 and 1.3.
- Sends these security headers on every response:

| Header | Why |
|---|---|
| `Strict-Transport-Security` | Browsers always use HTTPS for this site |
| `X-Content-Type-Options: nosniff` | Stops content-type guessing |
| `X-Frame-Options: DENY` | Prevents embedding in other sites (clickjacking) |
| `Referrer-Policy` | Limits what is sent to other sites |
| `Permissions-Policy` | Disables camera, microphone and location |
| `Content-Security-Policy` | Only allows scripts, fonts and connections from this site (XSS defence) |

**Rate limits**

| Route | Limit |
|---|---|
| `POST /api/auth/login` | 5 requests per minute per IP (burst 5) |
| other `/api/` routes | 20 requests per second per IP (burst 40) |

Over the limit, Nginx replies `429 Too Many Requests` and the UI shows a friendly message.

## Check the configuration

After any edit, test the syntax **before** restarting:

```bash
cd /opt/url-dashboard
docker compose exec nginx nginx -t
```

Expected:

```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

Apply the change without downtime:

```bash
docker compose exec nginx nginx -s reload
```

## View logs

```bash
docker compose logs --tail=100 nginx
docker compose logs -f nginx
```

The second command follows the log live; stop with `Ctrl+C`.

## Changing the domain

The domain appears twice in `nginx/conf.d/myurls.conf` (`server_name`) and twice in the `ssl_certificate` paths. It also appears in `.github/workflows/deploy.yml` (`DOMAIN`) and [SSL_SETUP.md](SSL_SETUP.md). Change all of them, get a certificate for the new name, and redeploy.

## Checking headers from outside

```bash
curl -sI https://myurls.yashwanthgowdam.in | grep -iE 'strict|content-security|x-frame|x-content'
```

All four headers should appear.
