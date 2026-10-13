// Limpia datos demo del seed (conserva admins). No imprime secretos.
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
  const sb = createClient(url, key);
  const tables = [
    'product_variants', 'order_items', 'wompi_transactions', 'shipping_guides',
    'products', 'orders', 'customers', 'customer_addresses', 'categories',
    'coupons', 'product_reviews', 'stock_alerts', 'notifications', 'admin_activity_logs',
  ];
  for (const t of tables) {
    try {
      const { data, error } = await sb.from(t).delete().neq('id', '00000000-0000-0000-0000-000000000000').select('id');
      if (error) throw error;
      console.log(t + ': ' + ((data || []).length + ' borradas'));
    } catch (e) {
      console.log(t + ': FALLO(' + String((e && e.message) || e).slice(0, 80) + ')');
    }
  }
})();
