import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/admin-password-log - Get admin password for logging
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Find admin by email to get password
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    // Return admin data including password for logging
    return NextResponse.json({ 
      success: true, 
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        password: admin.password, // Include password for logging
        role: admin.role,
        department: admin.department,
        government: admin.government,
        place: admin.place
      },
      message: 'Password retrieved for logging' 
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
