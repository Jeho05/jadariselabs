const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env.local', 'utf-8');
for (const line of env.split('\n')) {
  if (line.includes('=')) {
    const [key, ...rest] = line.split('=');
    const val = rest.join('=').replace(/'|"/g, '').trim();
    if(key.trim()) process.env[key.trim()] = val;
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if(!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE config");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const PLANS = {
    free: 50,
    starter: 200,
    pro: -1,
};

async function resetCredits() {
    console.log("Fetching profiles...");
    const { data: profiles, error: fetchError } = await supabase.from('profiles').select('id, username, plan, credits');
    
    if(fetchError) {
        console.error("Error fetching profiles:", fetchError);
        process.exit(1);
    }
    
    console.log(`Found ${profiles.length} profiles.`);
    let updatedCount = 0;
    
    for (const profile of profiles) {
        let defaultCredits = PLANS[profile.plan] || 50;
        
        // If pro, it's -1. Assuming DB keeps it -1.
        if (profile.credits !== defaultCredits) {
            console.log(`Updating ${profile.username || profile.id} (${profile.plan}). Credits: ${profile.credits} -> ${defaultCredits}`);
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ credits: defaultCredits })
                .eq('id', profile.id);
            
            if(updateError) {
                console.error(`Error updating ${profile.id}:`, updateError);
            } else {
                updatedCount++;
            }
        } else {
            console.log(`Skipping ${profile.username || profile.id} (already has ${defaultCredits} credits).`);
        }
    }
    
    console.log(`\nOperation completed! Updated ${updatedCount} profiles.`);
}

resetCredits();
