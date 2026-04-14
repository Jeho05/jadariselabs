import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testMigration() {
  console.log('Testing social_drafts new columns...');
  const { data: draftData, error: draftError } = await supabase
    .from('social_drafts')
    .select('provider_post_id, published_at')
    .limit(1);
    
  if (draftError) {
    console.error('Error querying social_drafts:', draftError.message);
  } else {
    console.log('social_drafts columns exist!');
  }

  console.log('Testing social_accounts table...');
  const { data: accData, error: accError } = await supabase
    .from('social_accounts')
    .select('id')
    .limit(1);

  if (accError) {
    console.error('Error querying social_accounts:', accError.message);
  } else {
    console.log('social_accounts table exists!');
  }
}

testMigration();
