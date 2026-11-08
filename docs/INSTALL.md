# Install and run locally

This guide runs the dashboard on your own computer for development. For the internet-facing setup, use [DEPLOYMENT.md](DEPLOYMENT.md).

## 1. Install the tools

You need:

| Tool | Version | Check with |
|---|---|---|
| Python | 3.12 or newer | `python3 --version` |
| Node.js | 22 or newer | `node --version` |
| Git | any | `git --version` |

Expected output looks like `Python 3.12.3` and `v22.x.x`.

## 2. Get the code

```bash
git clone https://github.com/<your-user>/<your-repo>.git url-dashboard
cd url-dashboard
```

`git clone` downloads the project; `cd` moves into its folder.

## 3. Start the backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
```

- `python3 -m venv .venv` creates an isolated Python environment in `.venv`.
- `source .venv/bin/activate` switches your terminal to use it (your prompt starts with `(.venv)`). On Windows PowerShell use `.venv\Scripts\Activate.ps1`.
- `pip install ...` installs the backend libraries plus test and lint tools.

Set the settings the backend needs, then start it:

```bash
export ADMIN_USERNAME=admin
export ADMIN_PASSWORD='dev-password-123'
export JWT_SECRET="$(openssl rand -hex 32)"
export DATABASE_URL='sqlite:///./dev.db'
uvicorn app.main:app --reload --port 8000
```

- `export` sets environment variables for this terminal only.
- `DATABASE_URL` points SQLite at a local file instead of the Docker volume path.
- `uvicorn` runs the API; `--reload` restarts it when you edit code.

Expected output ends with:

```
INFO:     Application startup complete.
INFO:     Uvicorn running on http://127.0.0.1:8000
```

Check it from a second terminal:

```bash
curl http://localhost:8000/api/health
```

Expected output: `{"status":"ok"}`

Leave this terminal running.

## 4. Start the frontend

Open a **new** terminal:

```bash
cd url-dashboard/frontend
npm install
npm run dev
```

- `npm install` downloads the frontend libraries (takes a minute the first time).
- `npm run dev` starts the Vite dev server and forwards `/api` requests to the backend on port 8000.

Expected output includes `Local:   http://localhost:5173/`.

Open <http://localhost:5173> in your browser. Click **Admin Login** and sign in with the username and password you exported above.

## 5. Run the checks

Backend (from `backend/`, with the virtual environment active):

```bash
ruff check .
pytest -q
```

Frontend (from `frontend/`):

```bash
npm run lint
npm test
npm run build
```

All five commands should finish without errors. The pipeline runs exactly these.

## Notes

- Your local `dev.db` file is ignored by Git.
- Changing `ADMIN_USERNAME` or `ADMIN_PASSWORD` and restarting the backend updates the admin account automatically.
- Passwords must be 12 to 72 characters. `JWT_SECRET` must be at least 32 characters.
