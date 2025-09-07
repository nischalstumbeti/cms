import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/announcements/[id] - Fetch single announcement
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching announcement:', error)
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 })
    }

    return NextResponse.json({ announcement: data })
  } catch (error) {
    console.error('Error in GET /api/announcements/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/announcements/[id] - Update announcement
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { title, content, hyperlink, document_url, document_name, is_active, target_audience } = body

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (content !== undefined) updateData.content = content
    if (hyperlink !== undefined) updateData.hyperlink = hyperlink
    if (document_url !== undefined) updateData.document_url = document_url
    if (document_name !== undefined) updateData.document_name = document_name
    if (is_active !== undefined) updateData.is_active = is_active
    if (target_audience !== undefined) updateData.target_audience = target_audience

    const { data, error } = await supabase
      .from('announcements')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating announcement:', error)
      return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 })
    }

    return NextResponse.json({ announcement: data })
  } catch (error) {
    console.error('Error in PUT /api/announcements/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/announcements/[id] - Delete announcement
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Error deleting announcement:', error)
      return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Announcement deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/announcements/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

