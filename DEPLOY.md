# Mittiva — Deploy Guide

The local git repo is initialized and the first commit is made. You're at step 1 below.

---

## Step 1 — Create the GitHub repo (browser)

1. Open <https://github.com/new>
2. Fill in:
   - **Repository name**: `mittiva`
   - **Description** (optional): `Mittiva — practical AI for Chennai SMBs`
   - **Visibility**: **Public** (required for free GitHub Pages)
   - **Do NOT** check "Add a README", "Add .gitignore", or "Choose a license" — we already have those.
3. Click **Create repository**.

GitHub will show a page titled *"…or push an existing repository from the command line"*. Copy the URL it shows (looks like `https://github.com/YOUR_USERNAME/mittiva.git`).

---

## Step 2 — Push code from your Mac terminal

Open the macOS Terminal app and run these commands, one at a time:

```bash
cd ~/Documents/Claude/Projects/Webdeb/mittiva

# Pick up any uncommitted changes (e.g. this DEPLOY.md file).
# The "|| true" tail prevents the line from erroring if there's nothing new.
git add .
git commit -m "Include deploy guide and final touches" || true

git remote add origin https://github.com/YOUR_USERNAME/mittiva.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username (e.g. `vidyutpoddar`).

**Authentication prompt**: The first push will ask for your GitHub credentials. macOS handles this in one of two ways:

- A browser window opens → sign in to GitHub and authorize → done.
- Or it asks for "Password" in Terminal → that means it wants a **Personal Access Token**, not your account password. Create one at <https://github.com/settings/tokens> (Generate new token → classic → check the `repo` scope → copy the token → paste it as the password).

After the push succeeds, refresh your GitHub repo page — you should see all 16 files.

---

## Step 3 — Enable GitHub Pages

1. On your repo page, click **Settings** (top-right tab).
2. Left sidebar → **Pages**.
3. Under **Build and deployment**:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` / **`/ (root)`**
   - Click **Save**.
4. Wait ~60 seconds. GitHub will build and deploy.
5. Refresh the Pages settings page — at the top you'll see "Your site is live at `https://YOUR_USERNAME.github.io/mittiva/`".

Click that link — your site should load.

If you see a 404 or unstyled page, give it another minute. First deploy can take 2–3 minutes.

---

## Step 4 — Set up mittiva.io custom domain

The `CNAME` file in the repo already says `mittiva.io`, so GitHub knows to expect that domain. Now configure DNS.

### 4a — In GitHub Pages settings

1. Same page (**Settings → Pages**), scroll to **Custom domain**.
2. It should already show `mittiva.io` (read from the CNAME file). If not, type it in and click **Save**.
3. Leave the **Enforce HTTPS** checkbox unchecked for now — it greys out until DNS is verified.

### 4b — In your domain registrar's DNS settings

Wherever you bought mittiva.io (Namecheap, GoDaddy, Cloudflare Registrar, etc.), find the DNS management page and add these records:

**For the apex domain `mittiva.io`** — add four A records pointing to GitHub's IPs:

| Type | Host | Value             | TTL  |
|------|------|-------------------|------|
| A    | `@`  | `185.199.108.153` | Auto |
| A    | `@`  | `185.199.109.153` | Auto |
| A    | `@`  | `185.199.110.153` | Auto |
| A    | `@`  | `185.199.111.153` | Auto |

**For IPv6 support (optional but recommended)** — add four AAAA records:

| Type | Host | Value                   | TTL  |
|------|------|-------------------------|------|
| AAAA | `@`  | `2606:50c0:8000::153`   | Auto |
| AAAA | `@`  | `2606:50c0:8001::153`   | Auto |
| AAAA | `@`  | `2606:50c0:8002::153`   | Auto |
| AAAA | `@`  | `2606:50c0:8003::153`   | Auto |

**For www.mittiva.io** — add one CNAME record:

| Type  | Host  | Value                       | TTL  |
|-------|-------|-----------------------------|------|
| CNAME | `www` | `YOUR_USERNAME.github.io`   | Auto |

(replace `YOUR_USERNAME` with your GitHub username, lowercase)

DNS propagation takes anywhere from 10 minutes to 24 hours, usually under an hour.

### 4c — Enable HTTPS

Once GitHub verifies the DNS (check back in **Settings → Pages**), the **Enforce HTTPS** checkbox becomes available. Tick it. GitHub will issue a free Let's Encrypt cert. Now `https://mittiva.io` works.

---

## Step 5 — Future updates

Any time you change something in the `mittiva/` folder, push the update:

```bash
cd ~/Documents/Claude/Projects/Webdeb/mittiva
git add .
git commit -m "Describe what changed"
git push
```

GitHub Pages re-deploys automatically within ~60 seconds.

---

## Troubleshooting

**Site shows but logo / styles are broken.**
You're probably looking at the unsigned http version. Wait for HTTPS to provision, or check that the `CNAME` file has exactly `mittiva.io` (one line, no protocol, no trailing slash).

**`git push` fails with "permission denied".**
The Personal Access Token doesn't have `repo` scope, or you typed your GitHub password instead of a token. Generate a fresh token at <https://github.com/settings/tokens> with the `repo` checkbox ticked.

**Pages says "There isn't a GitHub Pages site here".**
The Pages settings haven't been saved yet — go back to **Settings → Pages** and pick the `main` branch + `/(root)` source.

**Custom domain shows "DNS check unsuccessful".**
DNS hasn't propagated yet. Wait an hour, then click **Check again** in Pages settings. You can verify your DNS with <https://www.whatsmydns.net/#A/mittiva.io> — when all the green checkmarks show GitHub's IPs, you're good.
