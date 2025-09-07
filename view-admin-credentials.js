// Script to view all admin credentials from the database
// Run this in your browser console on the admin page

async function viewAdminCredentials() {
  try {
    console.log('🔍 Fetching all admin credentials...');
    
    const response = await fetch('/api/admins', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('👥 All Admin Credentials:');
    console.log('========================');
    
    if (data.admins && data.admins.length > 0) {
      data.admins.forEach((admin, index) => {
        console.log(`\n${index + 1}. Admin Details:`);
        console.log(`   ID: ${admin.id}`);
        console.log(`   Name: ${admin.name}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Password: ${admin.password}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Department: ${admin.department}`);
        console.log(`   Government: ${admin.government}`);
        console.log(`   Place: ${admin.place}`);
        console.log(`   Created: ${admin.created_at}`);
        console.log(`   Updated: ${admin.updated_at}`);
        console.log('   ---');
      });
    } else {
      console.log('❌ No admins found in the database');
    }
    
    return data.admins;
  } catch (error) {
    console.error('💥 Error fetching admin credentials:', error);
    return null;
  }
}

// Auto-run the function
viewAdminCredentials();
