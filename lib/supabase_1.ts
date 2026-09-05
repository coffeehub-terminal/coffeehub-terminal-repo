import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://gjqcdikvegarpwllpaov.supabase.co";
const supabaseAnonKey = "sb_publishable_TgrFdSEX3hRXuwPFYbYlHw_WGcqel9V";
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
