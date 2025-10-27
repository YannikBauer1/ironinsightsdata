import { createClient } from '@supabase/supabase-js';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  // Get Supabase credentials from runtime config or environment variables
  const supabaseUrl = config.public.supabaseUrl;
  const supabaseKey = config.public.supabaseKey;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    return {};
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  return {
    provide: {
      supabase
    }
  };
});
