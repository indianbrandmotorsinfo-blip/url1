# SSL setup (Let's Encrypt)

HTTPS certificates are free from Let's Encrypt and issued by a tool called Certbot, installed on the VM itself. The Nginx container reads the certificates from the VM's `/etc/letsencrypt` folder.

**Order matters:** get the certificate **before** the first deployment. Nginx refuses to start without it, and Certbot needs port 80 free while it works.

## Before you start

- DNS already points to the VM: `dig +short myurls.yashwanthgowdam.in` shows its IP ([GODADDY_DNS.md](GODADDY_DNS.md)).
- Ports 80 and 443 are open in OCI and in the VM firewall ([OCI_SETUP.md](OCI_SETUP.md)).
- The dashboard containers are **not** running yet (`docker ps` shows no `urlmgmt-*` containers).

## 1. Install Certbot

On the VM:

```bash
sudo snap install --classic certbot
sudo ln -sf /snap/bin/certbot /usr/bin/certbot
certbot --version
```

- `snap install` gets the Certbot version maintained by the Certbot team.
- `ln -sf` makes the `certbot` command available everywhere.

Expected: a line like `certbot 3.x.x`.

## 2. Request the certificate

Replace the email with yours (Let's Encrypt sends expiry warnings there):

```bash
sudo certbot certonly --standalone \
  -d myurls.yashwanthgowdam.in \
  --email you@example.com --agree-tos --no-eff-email \
  --pre-hook "docker stop urlmgmt-nginx || true" \
  --post-hook "docker start urlmgmt-nginx || true"
```

What each part does:

- `certonly --standalone` runs a tiny temporary web server on port 80 to prove you control the domain.
- `-d` is the domain the certificate covers.
- `--pre-hook` / `--post-hook` stop Nginx before each renewal (to free port 80) and start it afterwards. Certbot **saves these hooks** and reuses them for automatic renewals. The `|| true` keeps things working when the container does not exist yet.

Expected output ends with:

```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/myurls.yashwanthgowdam.in/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/myurls.yashwanthgowdam.in/privkey.pem
```

Confirm:

```bash
sudo ls /etc/letsencrypt/live/myurls.yashwanthgowdam.in/
```

You should see `fullchain.pem` and `privkey.pem`.

## 3. Automatic renewal

The snap installs a systemd timer that tries renewal twice a day and renews only when the certificate has under 30 days left. Check it exists:

```bash
systemctl list-timers | grep certbot
```

Test the whole renewal process without changing anything real:

```bash
sudo certbot renew --dry-run
```

Expected: `Congratulations, all simulated renewals succeeded`. During the test Nginx stops for a few seconds and starts again. Verify afterwards:

```bash
docker ps --format '{{.Names}}  {{.Status}}'
```

All `urlmgmt-*` containers should be `Up ... (healthy)`.

A real renewal causes about 10 to 20 seconds of downtime roughly every 60 days. For a personal dashboard that is acceptable.

## 4. HTTP to HTTPS redirect

Already configured in `nginx/conf.d/myurls.conf`: every `http://` request gets a `301` redirect to `https://`. Test after deployment:

```bash
curl -I http://myurls.yashwanthgowdam.in
```

Expected first lines:

```
HTTP/1.1 301 Moved Permanently
Location: https://myurls.yashwanthgowdam.in/
```

## 5. Check the live certificate

```bash
echo | openssl s_client -connect myurls.yashwanthgowdam.in:443 -servername myurls.yashwanthgowdam.in 2>/dev/null | openssl x509 -noout -dates -issuer
```

Expected: `notAfter` about 90 days away and `issuer=... Let's Encrypt`.

## Troubleshooting

- `Timeout during connect` or `Connection refused`: port 80 is blocked (OCI security list or VM firewall), or something else is listening on it. Run `sudo ss -tlnp | grep ':80 '`.
- `DNS problem: NXDOMAIN`: DNS is not ready; wait and re-check with `dig`.
- Too many failed attempts: Let's Encrypt limits retries. Wait an hour, or test with `--dry-run` first.
