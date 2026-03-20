import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://szudqgfjnyijukihmezv.supabase.co';
const supabaseAnonKey = 'sb_publishable_qqiHBhhl-s2fsTtmk8IfQg_iTzOjsuw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkBookings() {
    const fazilId = 'e902ef55-f927-4df4-a03e-9aa09304aa49';
    
    const { data: bDoc, error: eDoc } = await supabase
        .from('appointment_bookings')
        .select('*')
        .eq('doctor_id', fazilId);
        
    const { data: bPat, error: ePat } = await supabase
        .from('appointment_bookings')
        .select('*')
        .eq('patient_id', fazilId);

    console.log('Bookings as Doctor for Fazil:', bDoc?.length || 0);
    console.log('Bookings as Patient for Fazil:', bPat?.length || 0);
    
    if (bDoc?.length > 0) {
        bDoc.forEach(b => console.log(`As Doctor: ID ${b.id}, Patient ${b.patient_id}`));
    }
}

checkBookings();
