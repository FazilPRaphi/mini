import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://szudqgfjnyijukihmezv.supabase.co';
const supabaseAnonKey = 'sb_publishable_qqiHBhhl-s2fsTtmk8IfQg_iTzOjsuw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUser() {
    // Note: We can only query profiles, not the auth.users table with anon key usually
    // but maybe we can find the profile by some other field or just list them
    const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .limit(20);

    if (pError) {
        console.error('Profile Error:', pError);
    } else {
        console.log('Profiles Sample:');
        profiles.forEach(p => {
            console.log(`ID: ${p.id}, Name: ${p.full_name}, Phone: ${p.phone}`);
        });
    }
}

checkUser();
