// Debug Supabase connection and database structure
// Run this with: node debug-supabase-connection.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('=== Supabase Connection Debug ===');
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey ? 'Present' : 'Missing');
console.log('Key length:', supabaseKey ? supabaseKey.length : 0);

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration!');
  console.error('Please check your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('\n=== Testing Supabase Connection ===');
    
    // Test 1: Check if we can connect to Supabase
    console.log('1. Testing basic connection...');
    const { data: testData, error: testError } = await supabase
      .from('participants')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Connection failed:', testError);
      return;
    }
    console.log('✅ Connection successful');
    
    // Test 2: Check table structure
    console.log('\n2. Checking participants table structure...');
    const { data: structureData, error: structureError } = await supabase
      .from('participants')
      .select('*')
      .limit(1);
    
    if (structureError) {
      console.error('❌ Table structure check failed:', structureError);
    } else {
      console.log('✅ Table structure check passed');
      if (structureData && structureData.length > 0) {
        console.log('Sample record fields:', Object.keys(structureData[0]));
      }
    }
    
    // Test 3: Try a simple insert (will be rolled back)
    console.log('\n3. Testing insert operation...');
    const testParticipant = {
      name: 'Test User Debug',
      email: 'test-debug@example.com',
      profession: 'student',
      other_profession: null,
      gender: 'male',
      contest_type: 'photography',
      profile_photo_url: null,
      upload_enabled: false,
      login_enabled: true
    };
    
    console.log('Test data:', testParticipant);
    
    const { data: insertData, error: insertError } = await supabase
      .from('participants')
      .insert([testParticipant]);
    
    if (insertError) {
      console.error('❌ Insert test failed:', insertError);
      console.error('Error details:', {
        message: insertError.message,
        code: insertError.code,
        details: insertError.details,
        hint: insertError.hint,
        status: insertError.status,
        statusText: insertError.statusText
      });
    } else {
      console.log('✅ Insert test successful');
      console.log('Inserted data:', insertData);
      
      // Clean up - delete the test record
      if (insertData && insertData[0]) {
        const { error: deleteError } = await supabase
          .from('participants')
          .delete()
          .eq('id', insertData[0].id);
        
        if (deleteError) {
          console.error('Warning: Could not delete test record:', deleteError);
        } else {
          console.log('✅ Test record cleaned up');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error.constructor.name);
  }
}

testConnection();
