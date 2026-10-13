#!/bin/sh
# Parse templates using throwaway certificates. Does not install/start any service.
set -eu
root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
check_dir=$(mktemp -d /tmp/polad-config-check.XXXXXX)
trap 'rm -rf -- "$check_dir"' EXIT HUP INT TERM
openssl req -x509 -newkey rsa:2048 -nodes -keyout "$check_dir/key.pem" \
  -out "$check_dir/cert.pem" -days 1 -subj /CN=localhost >/dev/null 2>&1
for template in nginx-http.conf.example nginx.conf.example; do
  sed -e "s|/etc/letsencrypt/live/REPLACE_WITH_CERTIFICATE_NAME/fullchain.pem|$check_dir/cert.pem|g" \
      -e "s|/etc/letsencrypt/live/REPLACE_WITH_CERTIFICATE_NAME/privkey.pem|$check_dir/key.pem|g" \
      "$root/deploy/$template" > "$check_dir/site.conf"
  printf 'pid %s/nginx.pid; error_log stderr; events {} http { access_log off; include %s/site.conf; }\n' \
    "$check_dir" "$check_dir" > "$check_dir/nginx.conf"
  nginx -t -c "$check_dir/nginx.conf" -p "$check_dir"
done
cp "$root/deploy/polad-charkhesh.service.example" "$check_dir/polad-charkhesh.service"
chmod 644 "$check_dir/polad-charkhesh.service"
systemd-analyze verify "$check_dir/polad-charkhesh.service"
printf 'Nginx and systemd template parsing passed. Live host/TLS/reboot verification is still required.\n'
