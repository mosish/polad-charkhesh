#!/usr/bin/env bash
# Root-only, VPS-local backup. Never run with bash -x.
set -Eeuo pipefail
umask 077
[[ $EUID == 0 ]] || { echo 'Run as root.' >&2; exit 1; }
ROOT=/var/backups/polad-charkhesh/encrypted
CONFIG=/etc/polad-charkhesh
RELEASE=/opt/polad-charkhesh/current
NODE=/usr/local/bin/node
[[ -x $NODE ]] || NODE=/usr/bin/node
for command in age age-keygen tar flock df du; do command -v "$command" >/dev/null; done
exec 9>/run/lock/polad-backup.lock
flock -n 9 || { echo 'Another backup is running.' >&2; exit 1; }
install -d -m 0700 "$ROOT"
[[ ! -L $ROOT && ! -L $CONFIG/backup-age.key ]] || exit 1
if [[ ! -f $CONFIG/backup-age.key ]]; then age-keygen -o "$CONFIG/backup-age.key"; fi
chmod 0600 "$CONFIG/backup-age.key"
RECIPIENT=$(age-keygen -y "$CONFIG/backup-age.key")
# shellcheck disable=SC1091
set -a; source "$CONFIG/env"; set +a
[[ ${DATABASE_PATH:-} == /* && ${UPLOAD_DIR:-} == /* ]] || exit 1
AVAILABLE=$(df -PB1 "$ROOT" | awk 'NR==2 {print $4}')
SOURCE_SIZE=$(du -sb "$DATABASE_PATH" "$UPLOAD_DIR" | awk '{total+=$1} END {print total}')
((AVAILABLE > SOURCE_SIZE * 4 + 1073741824)) || { echo 'Insufficient backup disk headroom.' >&2; exit 1; }
STAGE=$(mktemp -d "$ROOT/.working.XXXXXX")
VERIFY=$(mktemp -d "$ROOT/.verify.XXXXXX")
WAS_ACTIVE=0
cleanup() {
  if [[ $WAS_ACTIVE == 1 ]]; then systemctl start polad-charkhesh; fi
  for directory in "$STAGE" "$VERIFY"; do
    [[ $directory == "$ROOT"/.working.* || $directory == "$ROOT"/.verify.* ]] || continue
    [[ $(dirname -- "$directory") == "$ROOT" && ! -L $directory ]] && rm -rf -- "$directory"
  done
}
trap cleanup EXIT
cd "$RELEASE"
if systemctl is-active --quiet polad-charkhesh; then WAS_ACTIVE=1; systemctl stop polad-charkhesh; fi
"$NODE" --import tsx scripts/backup-data.ts "$STAGE"
if [[ $WAS_ACTIVE == 1 ]]; then systemctl start polad-charkhesh; WAS_ACTIVE=0; fi
SNAPSHOT=$(find "$STAGE" -mindepth 1 -maxdepth 1 -type d -name 'backup-*' -print -quit)
[[ $SNAPSHOT == "$STAGE"/backup-* && ! -L $SNAPSHOT ]] || exit 1
NAME=$(basename -- "$SNAPSHOT")
install -d -m 0700 "$STAGE/configuration"
install -m 0600 "$CONFIG/env" "$STAGE/configuration/env"
ARCHIVE="$ROOT/$NAME.tar.age"
[[ ! -e $ARCHIVE && ! -e $ARCHIVE.partial ]] || exit 1
tar -C "$STAGE" -cf - "$NAME" configuration | age -r "$RECIPIENT" -o "$ARCHIVE.partial"
# Verify decryption, complete restore, SQLite integrity and every uploaded-file hash.
age -d -i "$CONFIG/backup-age.key" "$ARCHIVE.partial" | tar -C "$VERIFY" --no-same-owner --no-same-permissions -xf -
"$NODE" --import tsx scripts/verify-backup.ts "$VERIFY/$NAME"
cmp "$STAGE/configuration/env" "$VERIFY/configuration/env"
mv -- "$ARCHIVE.partial" "$ARCHIVE"
sha256sum "$ARCHIVE" > "$ARCHIVE.sha256"
printf 'Encrypted local backup verified: %s\n' "$ARCHIVE"
# Rotate only this script's encrypted archives, after successful restore testing.
# Keep at least the latest 30 archives. Older plaintext backups are untouched.
mapfile -t ARCHIVES < <(find "$ROOT" -maxdepth 1 -type f -name 'backup-*.tar.age' -printf '%f\n' | sort -r)
for ((i=30; i<${#ARCHIVES[@]}; i++)); do
  FILE="$ROOT/${ARCHIVES[$i]}"
  [[ $FILE == "$ROOT"/backup-*.tar.age && ! -L $FILE ]] || exit 1
  rm -f -- "$FILE" "$FILE.sha256"
done
