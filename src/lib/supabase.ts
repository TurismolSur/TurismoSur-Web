import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL =
	process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://cdfgpaylmqxzzegyiyxo.supabase.co';

export const SUPABASE_ANON_KEY =
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'sb_publishable_dhFXJCc-mQ6QDQAXsHYUDw_L7OPNxxi';

// Este es el cliente oficial que usarán tus Repositorios (Capa de Datos)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);