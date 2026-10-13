// Crea/actualiza el password de un admin en Supabase (hash bcrypt, nunca en claro).
// Uso:  ADMIN_EMAIL=admin@tutiendaalamano.co ADMIN_PASSWORD='...' npm run seed:admin
// Requiere SUPABASE_URL + (SUPABASE_SERVICE_ROLE_KEY o SUPABASE_ANON_KEY) en .env.local
import 'dotenv/config';
import { config as dotenvConfig } from 'dotenv';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

dotenvConfig({ path: '.env.local' });

const DEFAULT_SUPABASE_URL = '';
const DEFAULT_SUPABASE_KEY = '';

const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || '';
const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL).replace(/\/+$/, '');
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY;

if (!email || !password || password.length < 10) {
  console.error('Define ADMIN_EMAIL y ADMIN_PASSWORD (mínimo 10 caracteres).');
  process.exit(1);
}
if (!url || !key) {
  console.error('Falta SUPABASE_URL / key en .env.local.');
  process.exit(1);
}

const sb = createClient(url, key);
const hash = await bcrypt.hash(password, 12);
const { data, error } = await sb
  .from('admin_users')
  .update({ password_hash: hash })
  .eq('email', email)
  .select('id,email');

if (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
if (!data || data.length === 0) {
  console.error(`No existe admin_users con email ${email}. Créalo primero (seed del schema).`);
  process.exit(1);
}
console.log(`OK password actualizado para ${email}. Ya puedes borrar ADMIN_PASSWORD del entorno.`);
