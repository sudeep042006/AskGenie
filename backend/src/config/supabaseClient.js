
// Ensure dotenv is loaded when running this file directly with Node so process.env values are available.
// Using ESM import for dotenv's config side-effect works in modern Node setups.
try {
	// eslint-disable-next-line import/no-unresolved
	await import('dotenv/config');
} catch (e) {
	// ignore: dotenv not present or already loaded
}

import { createClient } from '@supabase/supabase-js';

// Prefer process.env (Node) but allow Vite's import.meta.env to provide values when used in the browser/build.
const supabaseUrl = process.env.SUPABASE_URL || (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL));
const supabaseKey = process.env.SUPABASE_KEY || (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_SUPABASE_KEY || import.meta.env.SUPABASE_KEY));

let supabase = null;
if (supabaseUrl && supabaseKey) {
	supabase = createClient(supabaseUrl, supabaseKey);
	console.log('Supabase client created');
} else {
	console.warn('Warning: SUPABASE_URL or SUPABASE_KEY not set. Supabase client not created.');
}

export { supabase };
export default supabase;