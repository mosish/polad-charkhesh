# VPS deployment preparation

No deployment has been performed. The brief explicitly withholds deployment authorization.

1. Install Node 24 LTS and the project's pnpm version on Linux.
2. Install locked dependencies, run `pnpm typecheck`, `pnpm test`, and `pnpm build`.
3. Configure stable, random `SESSION_SECRET`, `COOKIE_SECRET`, and a separate first-run `SETUP_TOKEN` in a server-only environment file. Production fails without session/cookie secrets. Do not use VITE-prefixed variables for secrets.
4. Set `NODE_ENV=production`, `HOST=127.0.0.1`, `PORT=3001`, and absolute persistent paths for `DATABASE_PATH` and `UPLOAD_DIR`.
5. Run `pnpm start` under systemd using a dedicated unprivileged service account. Set WorkingDirectory to the project. Protect the environment file and data directory permissions.
6. Place Nginx with HTTPS in front of port 3001. Forward the original Host and a sanitized X-Forwarded-For. The application trusts only loopback proxies. Do not expose the internal listener or database.
7. Configure `poladcharkhesh.ir` and `poladcharkhesh.com` DNS and certificates. The .ir origin defaults to Persian; .com defaults to English. A language query/preference overrides the default. Validate canonicals, alternates, sitemap and robots after applying the real origins.
8. Visit `/admin` over HTTPS, provide SETUP_TOKEN, and create the administrator. Remove the setup token from the environment afterward. Never ship test credentials.
9. Replace family-reference imagery with approved product assets as available. Independently verify manufacturer specifications, source claims, company contacts and commercial copy before public launch.
10. Back up SQLite using its supported online backup procedure or a clean stopped-service copy, and back up uploads. Verify restoration in a separate environment. Keep offsite backups encrypted and access-controlled.

## Nginx example

```nginx
server {
  listen 443 ssl;
  server_name poladcharkhesh.ir poladcharkhesh.com;
  # Configure ssl_certificate and ssl_certificate_key for your certificates.
  client_max_body_size 12m;
  location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Set an HTTP-to-HTTPS redirect separately. Monitor service health and storage capacity, rotate operational logs, and schedule encrypted backups. Verify Secure/HttpOnly/SameSite cookies and unauthorized API responses after deployment. No raw secrets, .env values or runtime data should be committed.

The Node/SQLite output is not a Cloudflare Worker bundle. Publishing through hosted Sites would require a platform persistence/auth adaptation and separate authorization; the current project has no registered Site ID.
