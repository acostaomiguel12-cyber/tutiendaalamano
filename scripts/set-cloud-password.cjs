// Fija password_hash del admin en la nube (service_role, sin exponer secretos).
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

function loadEnv(p) {
  const out = {};
  try {
    for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch {}
  return out;
}

(async () => {
  const env = loadEnv('.env.local');
  const url = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || '').replace(/\/+$/, '');
  const key = env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !key) {
    console.log('Falta service_role');
    process.exit(1);
  }
  const email = process.argv[2] || 'admin@tutiendaalamano.co';
  const password = process.argv[3] || '';
  if (password.length < 1) {
    console.log('Falta password');
    process.exit(1);
  }
  const sb = createClient(url, key);
  const hash = await bcrypt.hash(password, 12);
  const { data, error } = await sb
    .from('admin_users')
    .update({ password_hash: hash })
    .eq('email', email.toLowerCase())
    .select('id,email');
  if (error) {
    console.log('ERROR: ' + error.message.slice(0, 100));
    process.exit(1);
  }
  if (!data || data.length === 0) {
    console.log('SIN_FILA: ' + email);
    process.exit(1);
  }
  console.log('OK password fijado para ' + email);
})();
