import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// PUT /api/participants/[id] - Update participant
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, age, profession, gender } = body

    // Validate required fields
    if (!name || !profession || !gender) {
      return NextResponse.json({ error: 'Name, profession, and gender are required' }, { status: 400 })
    }

    // Validate age if provided
    if (age !== null && (age < 1 || age > 150)) {
      return NextResponse.json({ error: 'Age must be between 1 and 150' }, { status: 400 })
    }

    // Validate gender
    const validGenders = ['male', 'female', 'other', 'prefer-not-to-say']
    if (!validGenders.includes(gender)) {
      return NextResponse.json({ error: 'Invalid gender value' }, { status: 400 })
    }

    // Get current participant data for mutation tracking
    const { data: currentData, error: fetchError } = await supabase
      .from('participants')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 })
    }

    // Update participant
    const { data, error } = await supabase
      .from('participants')
      .update({
        name,
        age: age || null,
        profession,
        gender,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating participant:', error)
      return NextResponse.json({ error: 'Failed to update participant' }, { status: 500 })
    }

    // Log mutations for tracking
    const mutations = []
    
    if (currentData.name !== name) {
      mutations.push({
        participant_id: params.id,
        field_name: 'name',
        old_value: currentData.name,
        new_value: name,
        mutation_type: 'update'
      })
    }
    
    if (currentData.age !== age) {
      mutations.push({
        participant_id: params.id,
        field_name: 'age',
        old_value: currentData.age?.toString() || null,
        new_value: age?.toString() || null,
        mutation_type: 'update'
      })
    }
    
    if (currentData.profession !== profession) {
      mutations.push({
        participant_id: params.id,
        field_name: 'profession',
        old_value: currentData.profession,
        new_value: profession,
        mutation_type: 'update'
      })
    }
    
    if (currentData.gender !== gender) {
      mutations.push({
        participant_id: params.id,
        field_name: 'gender',
        old_value: currentData.gender,
        new_value: gender,
        mutation_type: 'update'
      })
    }

    // Insert mutations if any
    if (mutations.length > 0) {
      const { error: mutationError } = await supabase
        .from('participant_mutations')
        .insert(mutations)

      if (mutationError) {
        console.error('Error logging mutations:', mutationError)
        // Don't fail the request if mutation logging fails
      }
    }

    return NextResponse.json({ participant: data })
  } catch (error) {
    console.error('Error in PUT /api/participants/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/participants/[id] - Get single participant
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Error fetching participant:', error)
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 })
    }

    return NextResponse.json({ participant: data })
  } catch (error) {
    console.error('Error in GET /api/participants/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
