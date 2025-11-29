Deployment steps for grader.fewestmoves.com

Overview
- This repo contains a React client in `client/` and an Express server in `server/`.
- The provided `Dockerfile` builds the React app and runs the Node server which serves the built static files.
- Example `nginx` config is in `deploy/nginx/grader.fewestmoves.com.conf` (adjust paths as needed).

1) DNS
- In your DNS provider, create either:
  - An A record for `grader` pointing to your server's public IP (recommended), OR
  - A CNAME for `grader` pointing to a managed host name (if using a PaaS that provides that).

2) Build and run with Docker (on your server)
- Copy the repo to the server or push to a registry.
- Build the image:
  ```bash
  docker build -t fmc-grader:latest /path/to/repo
  ```
- Run the container (expose port 5000):
  ```bash
  docker run -d --name fmc-grader -p 5000:5000 \
    -e CLIENT_ORIGIN=https://grader.fewestmoves.com \
    fmc-grader:latest
  ```

3) Using systemd + nginx on the host (recommended pattern)
- Install `nginx` and `certbot` on the host.
- Place the nginx site file at `/etc/nginx/sites-available/grader.fewestmoves.com` and symlink to `sites-enabled`.
- Ensure `location /.well-known/acme-challenge/` points to `/var/www/certbot` as in the sample config.
- Restart nginx to pick up the HTTP -> HTTPS redirect.

4) Obtain TLS cert with Certbot
- Run certbot to obtain certificates and let it edit nginx for you (example):
  ```bash
  sudo mkdir -p /var/www/certbot
  sudo chown $USER /var/www/certbot
  sudo nginx -t && sudo systemctl reload nginx
  sudo certbot certonly --webroot -w /var/www/certbot -d grader.fewestmoves.com
  ```
- Alternatively, use `certbot --nginx` to have it update nginx configs automatically.

5) Final nginx configuration
- After certificates are issued, ensure the `ssl_certificate` and `ssl_certificate_key` paths in the nginx config match the certbot output (usually in `/etc/letsencrypt/live/grader.fewestmoves.com/`).
- Reload nginx: `sudo nginx -t && sudo systemctl reload nginx`.

6) Environment & tips
- Set `CLIENT_ORIGIN` env var so CORS allows the correct origin (see `server/index.js`).
- If you prefer a managed host, you can deploy the `client` to Vercel/Netlify and the `server` to Render/Heroku; then set `grader.fewestmoves.com` CNAME to the managed host.

If you want, I can:
- add a `docker-compose.yml` to run both the Node app and an nginx reverse proxy, OR
- create a Heroku/Render deployment guide instead of a self-hosted nginx setup.
