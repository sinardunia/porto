import { createClient } from "@supabase/supabase-js";

const getSupabaseUrl = () => {
  const url = import.meta.env.SUPABASE_URL;
  if (!url) throw new Error("Missing SUPABASE_URL environment variable.");
  return url;
};

const getSupabaseAnonKey = () => {
  const key = import.meta.env.SUPABASE_ANON_KEY;
  if (!key) throw new Error("Missing SUPABASE_ANON_KEY environment variable.");
  return key;
};

const getSupabaseServiceRoleKey = () => {
  const key = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable.");
  return key;
};

export const createSupabaseClient = () =>
  createClient(getSupabaseUrl(), getSupabaseAnonKey());

export const createSupabaseAdminClient = () =>
  createClient(getSupabaseUrl(), getSupabaseServiceRoleKey());
