import { NextRequest, NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase';
import * as XLSX from 'xlsx';

// Helper function to truncate text to Excel's character limit
function truncateForExcel(text: string | null | undefined, maxLength: number = 32767): string {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// Helper function to sanitize data for Excel export
function sanitizeForExcel(data: any): any {
  const sanitized = { ...data };
  
  // Truncate long text fields
  if (sanitized['Profile Photo URL']) {
    sanitized['Profile Photo URL'] = truncateForExcel(sanitized['Profile Photo URL'], 1000);
  }
  
  if (sanitized['Other Profession']) {
    sanitized['Other Profession'] = truncateForExcel(sanitized['Other Profession'], 500);
  }
  
  if (sanitized['Department']) {
    sanitized['Department'] = truncateForExcel(sanitized['Department'], 500);
  }
  
  if (sanitized['Place']) {
    sanitized['Place'] = truncateForExcel(sanitized['Place'], 500);
  }
  
  // Ensure all string fields are properly handled
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = truncateForExcel(sanitized[key], 32767);
    }
  });
  
  return sanitized;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = supabaseClient;
    
    // Fetch all participants
    const { data: participants, error: participantsError } = await supabase
      .from('participants')
      .select('*')
      .order('created_at', { ascending: false });

    if (participantsError) {
      console.error('Error fetching participants:', participantsError);
      return NextResponse.json({ error: 'Failed to fetch participants' }, { status: 500 });
    }

    // Fetch all admins
    const { data: admins, error: adminsError } = await supabase
      .from('admins')
      .select('*')
      .order('created_at', { ascending: false });

    if (adminsError) {
      console.error('Error fetching admins:', adminsError);
      return NextResponse.json({ error: 'Failed to fetch admins' }, { status: 500 });
    }

    // Prepare participants data for Excel
    const participantsData = participants.map((participant: any, index: number) => {
      const data = {
        'S.No': index + 1,
        'User Type': 'Participant',
        'ID': participant.id,
        'Name': participant.name,
        'Email': participant.email,
        'Profession': participant.profession,
        'Other Profession': participant.other_profession || '',
        'Gender': participant.gender,
        'Profile Photo URL': participant.profile_photo_url || '',
        'Login Enabled': participant.login_enabled !== false ? 'Yes' : 'No',
        'Upload Enabled': participant.upload_enabled === true ? 'Yes' : 'No',
        'Registration Date': participant.created_at ? new Date(participant.created_at).toLocaleDateString('en-IN') : '',
        'Last Updated': participant.updated_at ? new Date(participant.updated_at).toLocaleDateString('en-IN') : ''
      };
      
      return sanitizeForExcel(data);
    });

    // Prepare admins data for Excel
    const adminsData = admins.map((admin: any, index: number) => {
      const data = {
        'S.No': participants.length + index + 1,
        'User Type': 'Admin',
        'ID': admin.id,
        'Name': admin.name,
        'Email': admin.email,
        'Phone': admin.phone,
        'Department': admin.department,
        'Government': admin.government === 'state' ? 'State Government' : 
                     admin.government === 'central' ? 'Central Government' : 
                     admin.government === 'outsource' ? 'Outsourced' : 'Other',
        'Place': admin.place,
        'Role': admin.role === 'superadmin' ? 'Super Admin' : 'Admin',
        'Registration Date': admin.created_at ? new Date(admin.created_at).toLocaleDateString('en-IN') : '',
        'Last Updated': admin.updated_at ? new Date(admin.updated_at).toLocaleDateString('en-IN') : ''
      };
      
      return sanitizeForExcel(data);
    });

    // Combine all users data
    const allUsersData = [...participantsData, ...adminsData];

    // Create a new workbook
    const workbook = XLSX.utils.book_new();

    // Create worksheets with proper options to handle large datasets
    const allUsersSheet = XLSX.utils.json_to_sheet(allUsersData, {
      header: Object.keys(allUsersData[0] || {}),
      skipHeader: false
    });
    
    const participantsSheet = XLSX.utils.json_to_sheet(participantsData, {
      header: Object.keys(participantsData[0] || {}),
      skipHeader: false
    });
    
    const adminsSheet = XLSX.utils.json_to_sheet(adminsData, {
      header: Object.keys(adminsData[0] || {}),
      skipHeader: false
    });

    // Add worksheets to workbook
    XLSX.utils.book_append_sheet(workbook, allUsersSheet, 'All Users');
    XLSX.utils.book_append_sheet(workbook, participantsSheet, 'Participants');
    XLSX.utils.book_append_sheet(workbook, adminsSheet, 'Administrators');

    // Generate Excel file buffer with compression
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'buffer',
      compression: true
    });

    // Create response with Excel file
    const response = new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.xlsx"`,
        'Content-Length': excelBuffer.length.toString(),
      },
    });

    return response;

  } catch (error) {
    console.error('Error exporting users:', error);
    return NextResponse.json({ error: 'Failed to export users data' }, { status: 500 });
  }
}
