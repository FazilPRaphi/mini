import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://szudqgfjnyijukihmezv.supabase.co';
const supabaseAnonKey = 'sb_publishable_qqiHBhhl-s2fsTtmk8IfQg_iTzOjsuw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAll() {
    const { data: bookings, error } = await supabase
        .from('appointment_bookings')
        .select('*');

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Total Bookings:', bookings.length);
        bookings.forEach(b => {
             console.log(`Booking ID: ${b.id}, Doctor: ${b.doctor_id}, Patient: ${b.patient_id}, Status: ${b.status}`);
        });
    }
}

checkAll();
