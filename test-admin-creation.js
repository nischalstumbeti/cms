// Test script to verify admin creation
// Run this in your browser console to test the admin creation

async function testAdminCreation() {
  try {
    const testAdmin = {
      name: "Test Admin",
      email: "test@example.com",
      phone: "1234567890",
      department: "Test Department",
      government: "state",
      place: "Test City",
      role: "admin",
      permissions: {
        can_manage_announcements: true,
        can_manage_participants: true,
        can_manage_submissions: true,
        can_manage_admins: false,
        can_manage_settings: false,
        can_export_data: true,
      }
    };

    console.log('Testing admin creation with data:', testAdmin);
    
    const response = await fetch('/api/test-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testAdmin),
    });

    const result = await response.json();
    console.log('Response:', result);
    
    if (response.ok) {
      console.log('✅ Admin creation test passed');
    } else {
      console.log('❌ Admin creation test failed:', result);
    }
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Run the test
testAdminCreation();
