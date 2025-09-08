// Check environment variables
// Run this with: node check-env.js

require('dotenv').config();

console.log('=== Environment Variables Check ===');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing');
console.log('Key length:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length : 0);

// Check if .env.local exists
const fs = require('fs');
const path = require('path');

const envLocalPath = path.join(process.cwd(), '.env.local');
const envPath = path.join(process.cwd(), '.env');

console.log('\n=== Environment Files Check ===');
console.log('.env.local exists:', fs.existsSync(envLocalPath));
console.log('.env exists:', fs.existsSync(envPath));

if (fs.existsSync(envLocalPath)) {
  console.log('\n.env.local contents:');
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  console.log(envContent);
}
