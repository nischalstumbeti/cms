// Test script to verify admin password logging functionality
// Run this after starting the development server

const testPasswordLogging = async () => {
  console.log('🧪 Testing Admin Password Logging Functionality...\n');

  // Test 1: Admin Login with Password Logging
  console.log('1. Testing Admin Login with Password Logging:');
  try {
    const loginResponse = await fetch('http://localhost:3000/api/admin-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com', // Replace with actual admin email
        password: 'admin123' // Replace with actual admin password
      }),
    });

    const loginData = await loginResponse.json();
    console.log('Login Response:', loginData);
    
    if (loginData.success) {
      console.log('✅ Login successful - Password should be logged in console\n');
    } else {
      console.log('❌ Login failed:', loginData.error, '\n');
    }
  } catch (error) {
    console.log('❌ Login test error:', error.message, '\n');
  }

  // Test 2: Admin Password Retrieval API
  console.log('2. Testing Admin Password Retrieval API:');
  try {
    const passwordResponse = await fetch('http://localhost:3000/api/admin-password-log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com' // Replace with actual admin email
      }),
    });

    const passwordData = await passwordResponse.json();
    console.log('Password API Response:', passwordData);
    
    if (passwordData.success) {
      console.log('✅ Password retrieval successful - Password should be logged in console\n');
    } else {
      console.log('❌ Password retrieval failed:', passwordData.error, '\n');
    }
  } catch (error) {
    console.log('❌ Password API test error:', error.message, '\n');
  }

  console.log('🧪 Test completed. Check the server console for password logs.');
  console.log('Expected logs:');
  console.log('- 🔐 Admin Login Attempt: (with password)');
  console.log('- ✅ Admin Login Successful: (with password)');
  console.log('- 🔐 Admin Password Log - Page View: (when viewing admin pages)');
  console.log('- 🔐 Admin Password Fetched for Logging: (when password not in localStorage)');
};

// Run the test
testPasswordLogging();
