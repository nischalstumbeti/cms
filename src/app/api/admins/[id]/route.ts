import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/admins/[id] - Get single admin
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching admin:', error)
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    // Remove password from response
    const { password, ...adminWithoutPassword } = data
    return NextResponse.json({ admin: adminWithoutPassword })
  } catch (error) {
    console.error('Error in GET /api/admins/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/admins/[id] - Update admin
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, email, phone, department, government, place, role, password, permissions } = body


    // Validate required fields
    if (!name || !email || !phone || !department || !government || !place || !role) {
      return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 })
    }

    // Validate government type
    const validGovernments = ['state', 'central', 'outsource', 'other']
    if (!validGovernments.includes(government)) {
      return NextResponse.json({ error: 'Invalid government type' }, { status: 400 })
    }

    // Validate role
    const validRoles = ['admin', 'superadmin']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Check if email already exists for another admin
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admins')
      .select('id')
      .eq('email', email)
      .neq('id', params.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError
    }

    if (existingAdmin) {
      return NextResponse.json({ error: 'An admin with this email already exists' }, { status: 400 })
    }

    // Prepare update data
    const updateData: any = {
      name,
      email,
      phone,
      department,
      government,
      place,
      role,
      updated_at: new Date().toISOString()
    }

    // Only include password if provided
    if (password && password.trim() !== '') {
      updateData.password = password
    }

    // Only include permissions if provided
    if (permissions) {
      updateData.permissions = permissions
    }

    const { data, error } = await supabase
      .from('admins')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('💥 Error updating admin:', {
        id: params.id,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      return NextResponse.json({ error: 'Failed to update admin' }, { status: 500 })
    }


    // Remove password from response
    const { password: _, ...adminWithoutPassword } = data
    return NextResponse.json({ admin: adminWithoutPassword })
  } catch (error) {
    console.error('Error in PUT /api/admins/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admins/[id] - Delete admin
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if admin exists
    const { data: existingAdmin, error: checkError } = await supabase
      .from('admins')
      .select('id, role')
      .eq('id', params.id)
      .single()

    if (checkError || !existingAdmin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    // Prevent deletion of superadmin if it's the last one
    if (existingAdmin.role === 'superadmin') {
      const { data: superadminCount, error: countError } = await supabase
        .from('admins')
        .select('id', { count: 'exact' })
        .eq('role', 'superadmin')

      if (countError) {
        throw countError
      }

      if (superadminCount && superadminCount.length <= 1) {
        return NextResponse.json({ error: 'Cannot delete the last superadmin' }, { status: 400 })
      }
    }

    const { error } = await supabase
      .from('admins')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting admin:', error)
      return NextResponse.json({ error: 'Failed to delete admin' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Admin deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/admins/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
