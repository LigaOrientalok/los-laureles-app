const SUPABASE_URL = "https://cmbajolccgeoosdvwcxv.supabase.co";
const SUPABASE_ANON_KEY = "TU_KEY_REAL";

// ✅ evita duplicado
if (!window.supabaseClient) {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

const supabase = window.supabaseClient;

// ✅ DB mínimo
const db = {
    async getTorneos() {
        const { data } = await supabase.from('torneos').select('*');
        return data || [];
    }
};