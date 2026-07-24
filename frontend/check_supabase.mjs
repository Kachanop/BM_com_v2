import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = Object.fromEntries(
  fs.readFileSync('.env', 'utf8')
    .trim()
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const [key, ...rest] = line.split('=');
      return [key, rest.join('=').replace(/^"|"$/g, '')];
    })
);

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

const check = async () => {
  console.log('URL:', env.VITE_SUPABASE_URL);
  console.log('KEY present:', Boolean(env.VITE_SUPABASE_ANON_KEY));

  for (const table of ['profiles', 'orders']) {
    const { data, error, count } = await supabase.from(table).select('*', { count: 'exact', head: true });
    console.log(table, 'count:', count, 'error:', error?.message || 'none');
  }

  const { data, error } = await supabase.from('profiles').select('id, role, full_name').limit(5);
  console.log('profiles sample error:', error?.message || 'none');
  console.log('profiles sample data:', JSON.stringify(data, null, 2));
};

check().catch((err) => {
  console.error('SCRIPT ERROR', err);
  process.exit(1);
});
