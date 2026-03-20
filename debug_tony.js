import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://szudqgfjnyijukihmezv.supabase.co';
const supabaseAnonKey = 'sb_publishable_qqiHBhhl-s2fsTtmk8IfQg_iTzOjsuw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUser() {
    const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .ilike('full_name', '%tony%');

    if (pError) {
        console.error('Profile Error:', pError);
    } else {
        console.log('Tony Profiles Found:');
        profiles.forEach(p => {
            console.log(`ID: ${p.id}, Name: ${p.full_name}, Phone: ${p.phone}`);
        });
    }
}

checkUser();
