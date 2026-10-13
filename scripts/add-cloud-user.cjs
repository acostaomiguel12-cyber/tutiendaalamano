// Crea o actualiza un admin en la nube (service_role). Uso:
// node scripts/add-cloud-user.cjs <email> <password> <role> <roleTitle> <name>
// No imprime secretos.
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
  const [email, password, role, roleTitle, ...nameParts] = process.argv.slice(2);
  if (!email || !password || !role) {
    console.log('Uso: email password role [roleTitle] [name]');
    process.exit(1);
  }
  const sb = createClient(url, key);
  const hash = await bcrypt.hash(password, 12);
  const name = nameParts.join(' ') || email.split('@')[0];
  const initials = name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const { data, error } = await sb
    .from('admin_users')
    .upsert(
      {
        email: email.toLowerCase(),
        password_hash: hash,
        role,
        role_title: roleTitle || role,
        name,
        avatar_initials: initials,
        last_login: new Date().toISOString(),
      },
      { onConflict: 'email' }
    )
    .select('id,email,role');
  if (error) {
    console.log('ERROR: ' + error.message.slice(0, 120));
    process.exit(1);
  }
  console.log('OK upsert ' + (data && data[0] ? data[0].email + ' [' + data[0].role + ']' : email));
})();
