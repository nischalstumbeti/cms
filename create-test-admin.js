// Script to create a test admin with logging
// Run this in your browser console

async function createTestAdmin() {
  const testAdmin = {
    name: "Test Super Admin",
    email: "superadmin@test.com",
    phone: "1234567890",
    department: "IT Department",
    government: "central",
    place: "Test City",
    role: "superadmin",
    password: "password123",
    permissions: {
      can_manage_announcements: true,
      can_manage_participants: true,
      can_manage_submissions: true,
      can_manage_admins: true,
      can_manage_settings: true,
      can_export_data: true
    }
  };

  console.log('👤 Creating Test Admin:', testAdmin);

  try {
    const response = await fetch('/api/admins', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testAdmin),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Test Admin Created Successfully!');
      console.log('📧 Email:', testAdmin.email);
      console.log('🔑 Password:', testAdmin.password);
      console.log('👑 Role:', testAdmin.role);
      console.log('🔗 Login URL: /admin-login');
    } else {
      console.log('❌ Failed to create test admin:', result);
    }
    
    return result;
  } catch (error) {
    console.error('💥 Error creating test admin:', error);
    return null;
  }
}

// Auto-run the function
createTestAdmin();
