# Deployment guide

This is the master checklist for putting the dashboard on `https://myurls.yashwanthgowdam.in`. Do the steps in order; each links to a detailed guide.

## What happens on every deployment

When you push to `main`, GitHub Actions:

1. runs lint and tests,
2. builds the Docker images and scans them with Trivy,
3. cancels immediately if the security policy fails,
4. otherwise connects to the OCI VM over SSH with your PEM key,
5. uploads the latest code, builds images, starts the containers and restarts Nginx,
6. waits until all containers report healthy, then checks `https://myurls.yashwanthgowdam.in/api/health`.

## One-time setup

| Step | What | Guide |
|---|---|---|
| 1 | Create the OCI VM, open ports 80 and 443, install Docker | [OCI_SETUP.md](OCI_SETUP.md) |
| 2 | Point `myurls` at the VM's public IP | [GODADDY_DNS.md](GODADDY_DNS.md) |
| 3 | Get the Let's Encrypt certificate (must happen **before** the first start) | [SSL_SETUP.md](SSL_SETUP.md) |
| 4 | Create the `.env` file on the VM (below) | this page |
| 5 | Add the four GitHub secrets | [GITHUB_ACTIONS.md](GITHUB_ACTIONS.md) |
| 6 | Push to `main` and watch the pipeline | below |

### Step 4: create `.env` on the VM

On the VM:

```bash
cd /opt/url-dashboard
nano .env
```

Paste the following and change the values:

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<a long password, 12-72 characters, no $ or quotes>
JWT_SECRET=<output of: openssl rand -hex 32>
JWT_EXPIRE_MINUTES=480
LOG_LEVEL=INFO
```

Save with `Ctrl+O`, `Enter`, then exit with `Ctrl+X`. Lock the file down:

```bash
chmod 600 .env
```

`.env` stays on the server only. The pipeline never uploads or overwrites it.

### Step 6: first deployment

Commit and push:

```bash
git add .
git commit -m "Initial deployment"
git push origin main
```

Open the **Actions** tab of your GitHub repository. You should see four jobs turn green: backend, frontend, security gate, deploy. Then open <https://myurls.yashwanthgowdam.in>.

## Verify

```bash
curl -fsS https://myurls.yashwanthgowdam.in/api/health
```

Expected output: `{"status":"ok"}`

Then in the browser: the page loads over HTTPS (padlock), **Admin Login** works, and you can add a link.

## Everyday updates

Change code, commit, push to `main`. The pipeline does the rest. Pull requests run the checks and the security scan but never deploy.

## Manual deployment (without GitHub Actions)

On the VM, from `/opt/url-dashboard` after copying new code there:

```bash
docker compose up -d --build --remove-orphans
docker compose restart nginx
docker compose ps
```

All three services should show `healthy`.

## Roll back

Re-run an older successful workflow from the Actions tab (**Re-run all jobs**), or `git revert` the bad commit and push. Your data is in a Docker volume and is not touched by deployments.
