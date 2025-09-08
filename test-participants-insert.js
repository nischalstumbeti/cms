// Test script to verify participants table insert
// Run this with: node test-participants-insert.js

const { createClient } = require('@supabase/supabase-js');

// Replace with your actual Supabase URL and key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your_supabase_url';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your_supabase_key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testParticipantInsert() {
  try {
    console.log('Testing participant insert...');
    
    // Test data
    const testParticipant = {
      name: 'Test User',
      email: 'test@example.com',
      profession: 'student',
      other_profession: null,
      gender: 'male',
      contest_type: 'photography',
      profile_photo_url: null,
      upload_enabled: false,
      login_enabled: true
    };

    console.log('Inserting participant:', testParticipant);

    const { data, error } = await supabase
      .from('participants')
      .insert([testParticipant])
      .select();

    if (error) {
      console.error('Error inserting participant:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
    } else {
      console.log('Successfully inserted participant:', data);
    }

    // Clean up - delete the test participant
    if (data && data[0]) {
      const { error: deleteError } = await supabase
        .from('participants')
        .delete()
        .eq('id', data[0].id);
      
      if (deleteError) {
        console.error('Error deleting test participant:', deleteError);
      } else {
        console.log('Test participant deleted successfully');
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Check table structure first
async function checkTableStructure() {
  try {
    console.log('Checking participants table structure...');
    
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error checking table structure:', error);
    } else {
      console.log('Table structure check passed');
      if (data && data.length > 0) {
        console.log('Sample record:', data[0]);
      }
    }
  } catch (error) {
    console.error('Error checking table structure:', error);
  }
}

async function main() {
  await checkTableStructure();
  await testParticipantInsert();
}

main();
