import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://psouhrqpuuetspajpjpj.supabase.co"
const SUPABASE_KEY = "sb_publishable_vVoHB6DnOx5X0fATNiDhYw_Pk9gs5ZP"

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
