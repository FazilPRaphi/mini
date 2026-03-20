import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://szudqgfjnyijukihmezv.supabase.co';
const supabaseAnonKey = 'sb_publishable_qqiHBhhl-s2fsTtmk8IfQg_iTzOjsuw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkBookings() {
    // Dr. Tony Stark ID: 28c915ff-d050-4c79-8137-cb6bef595a19
    const tonyId = '28c915ff-d050-4c79-8137-cb6bef595a19';
    
    const { data: bookings, error } = await supabase
        .from('appointment_bookings')
        .select('*')
        .or(`doctor_id.eq.${tonyId},patient_id.eq.${tonyId}`);

    if (error) {
        console.error('Booking Error:', error);
    } else {
        console.log('Bookings for Tony:');
        bookings.forEach(b => {
            console.log(`ID: ${b.id}, Doctor: ${b.doctor_id}, Patient: ${b.patient_id}, Status: ${b.status}`);
        });
    }
}

checkBookings();
