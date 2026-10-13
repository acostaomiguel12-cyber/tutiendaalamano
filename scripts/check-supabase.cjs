// Diagnóstico de conexión Supabase (no imprime secretos).
const fs = require('fs');
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
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || '';
  if (!url || !key) {
    console.log('SIN_CONFIG');
    return;
  }
  const sb = createClient(url, key);
  for (const t of ['products', 'categories', 'coupons', 'admin_users', 'orders', 'page_layouts', 'store_theme_configs']) {
    try {
      const { count, error } = await sb.from(t).select('id', { count: 'exact', head: true });
      console.log(t + ': ' + (error ? 'ERROR(' + error.code + ':' + error.message.slice(0, 60) + ')' : count));
    } catch (e) {
      console.log(t + ': FALLO(' + String(e.message || e).slice(0, 60) + ')');
    }
  }
})();
