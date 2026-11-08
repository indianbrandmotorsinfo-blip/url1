# GitHub Actions pipeline

The workflow is `.github/workflows/deploy.yml`.

## When it runs

| Event | Checks and security scan | Deploy |
|---|---|---|
| Pull request | yes | no |
| Push to `main` | yes | yes |
| Manual run (Actions tab → **Run workflow**) on `main` | yes | yes |

## Stages

1. **Backend:** installs dependencies, runs `ruff` (lint) and `pytest`.
2. **Frontend:** installs dependencies, runs ESLint, Vitest, then type-checks and builds.
3. **Security gate:** validates `docker-compose.yml`, builds the backend and frontend images, pulls the Nginx image, scans all three with Trivy and applies the policy below.
4. **Deploy:** only if everything above passed.

Stages 1 and 2 run in parallel. Stage 3 waits for both. Stage 4 waits for stage 3.

## Security policy

Trivy counts vulnerabilities across all three images that have a **fix available** (`--ignore-unfixed`):

| Severity | Rule | If broken |
|---|---|---|
| HIGH + CRITICAL | fewer than 2 combined | pipeline fails, nothing is deployed |
| LOW | fewer than 8 | pipeline fails, nothing is deployed |
| MEDIUM | any number | reported as a warning |
| Total | preferably fewer than 10 | reported as a warning |

The result table appears on the workflow run's **Summary** page, and the full JSON reports are attached as the `trivy-reports` artifact for 30 days.

**If the gate fails:** open the summary, then the artifact, find the package and update it. For Python packages, raise the version in `backend/requirements.txt`; for the base images, they update automatically on rebuild, so often you only need to re-run the workflow after a few days.

## GitHub secrets

Create them under **Repository → Settings → Secrets and variables → Actions → New repository secret**.

| Secret | Value | How to get it |
|---|---|---|
| `OCI_HOST` | The VM's public IP | OCI Console |
| `OCI_USER` | `ubuntu` | Default Ubuntu user |
| `OCI_SSH_PRIVATE_KEY` | Entire contents of `oci_deploy.pem`, including the `-----BEGIN` and `-----END` lines | `cat oci_deploy.pem` |
| `OCI_KNOWN_HOSTS` | Output of `ssh-keyscan -H <PUBLIC_IP>` | Run on your computer |

Use the full multi-line text for the private key. Do not add quotes.

Optional but recommended: create an **Environment** called `production` (Settings → Environments). The deploy job uses it, so you can add a required reviewer if you want to approve deployments manually.

## How the deployment works

1. Writes your PEM key to a file and configures SSH with password login disabled and strict host-key checking.
2. `rsync`s the repository to `/opt/url-dashboard` on the VM (excluding `.git`, `node_modules` and your `.env`).
3. Runs `docker compose up -d --build --remove-orphans` and restarts Nginx so config changes apply.
4. Polls `docker inspect` until all three containers are `healthy` (up to 200 seconds).
5. Requests `https://myurls.yashwanthgowdam.in/api/health` from the internet to prove the whole chain works.

If any step fails, the run turns red and the deploy log shows the last container logs.

## Faster builds (optional)

Generate and commit lock files once so installs are reproducible:

```bash
cd frontend && npm install && cd ..
git add frontend/package-lock.json
```

The pipeline and Dockerfile automatically use `npm ci` when `package-lock.json` exists.
