// Offline operator recovery, requiring direct access to the protected server DB.
import { db, audit, transaction } from '../api/database';
const username = process.argv[2], confirmation = process.argv[3];
if (!username || confirmation !== '--revoke-all-sessions') {
  console.error('Usage: DATABASE_PATH=/absolute/platform.sqlite node --import tsx scripts/reset-admin-mfa.ts USERNAME --revoke-all-sessions');
  process.exitCode = 1;
} else {
  const admin = db.prepare('SELECT id,username FROM admins WHERE username=?').get(username.toLowerCase());
  if (!admin) throw new Error('Administrator not found.');
  transaction(() => {
    db.prepare('DELETE FROM sessions WHERE admin_id=?').run(admin.id);
    db.prepare('DELETE FROM admin_mfa WHERE admin_id=?').run(admin.id);
    audit('server-operator', 'MFA_RESET_REQUIRES_REENROLLMENT', String(admin.id));
  });
  console.log('MFA reset; all account sessions revoked. Password and fresh enrollment are required.');
}
db.close();
