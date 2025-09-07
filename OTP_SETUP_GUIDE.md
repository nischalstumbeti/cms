# OTP Authentication & Admin Login Control Setup Guide

## 🎯 **Overview**

This guide covers the implementation of:
1. **Admin Control**: Enable/disable participant login per user
2. **OTP Authentication**: Email-based OTP login for participants
3. **Enhanced Admin Panel**: Complete participant management with login controls

## 🗄️ **Database Setup**

### **Step 1: Run Migration Script**

Execute the SQL commands from `database-migration.sql` in your Supabase SQL editor:

```sql
-- This will create:
-- ✅ login_enabled field in participants table
-- ✅ participant_otps table for OTP storage
-- ✅ Database functions for OTP generation/verification
-- ✅ RLS policies and triggers
-- ✅ Admin settings for global login control
```

### **Step 2: Verify Database Changes**

After running the migration, you should see:
- `participants` table with new `login_enabled` column
- `participant_otps` table for OTP management
- New database functions: `generate_participant_otp()`, `verify_participant_otp()`
- `participant_login_status` view for admin dashboard

## 🔧 **Code Changes Made**

### **1. Updated Participant Interface**
```typescript
export interface Participant {
  // ... existing fields
  login_enabled?: boolean;  // NEW: Admin can enable/disable login
  created_at?: string;      // NEW: Registration timestamp
  updated_at?: string;      // NEW: Last update timestamp
}
```

### **2. Enhanced ContestContext**
- ✅ `updateParticipantLoginStatus()` - Toggle participant login
- ✅ `generateOTP()` - Generate and send OTP via email
- ✅ `verifyOTP()` - Verify OTP and authenticate user
- ✅ Updated data mapping for all new fields

### **3. New OTP Login Form**
- ✅ `ParticipantOTPLoginForm` - Two-step OTP authentication
- ✅ Email validation and OTP generation
- ✅ OTP verification with 6-digit input
- ✅ Resend OTP functionality
- ✅ Proper error handling and user feedback

### **4. Enhanced Admin Panel**
- ✅ **Login Status Column** - Shows enabled/disabled status
- ✅ **Toggle Switch** - Enable/disable participant login
- ✅ **Detailed View** - Complete participant information modal
- ✅ **Real-time Updates** - Changes reflect immediately

## 🚀 **Features Implemented**

### **Admin Features**
1. **Individual Login Control**: Toggle login for each participant
2. **Bulk Management**: View all participants with login status
3. **Detailed Information**: Complete participant profiles
4. **Real-time Updates**: Instant status changes
5. **Export Functionality**: CSV export with login status

### **Participant Features**
1. **Secure OTP Login**: Email-based authentication
2. **Two-Step Process**: Email → OTP verification
3. **Auto-expiry**: OTPs expire in 10 minutes
4. **Resend Functionality**: Request new OTP if needed
5. **Login Status Check**: Only enabled participants can login

### **Security Features**
1. **OTP Expiry**: 10-minute expiration time
2. **Single Use**: OTPs can only be used once
3. **Email Validation**: Only registered participants can receive OTPs
4. **Login Control**: Admins can disable access instantly
5. **Automatic Cleanup**: Expired OTPs are automatically removed

## 📋 **Setup Checklist**

### **Database Setup**
- [ ] Run `database-migration.sql` in Supabase
- [ ] Verify new tables and functions are created
- [ ] Check RLS policies are active
- [ ] Test OTP generation function

### **Environment Variables**
- [ ] Ensure SMTP settings are configured in `.env.local`
- [ ] Verify Supabase connection is working
- [ ] Test email sending functionality

### **Application Testing**
- [ ] Test participant registration
- [ ] Test OTP generation and email sending
- [ ] Test OTP verification and login
- [ ] Test admin login control toggle
- [ ] Test participant detail modal
- [ ] Test CSV export functionality

## 🔍 **Usage Instructions**

### **For Admins**
1. **Go to Admin Panel** → **Participants**
2. **View Login Status** - See which participants can login
3. **Toggle Login** - Use the switch to enable/disable access
4. **View Details** - Click "View Details" for complete information
5. **Export Data** - Download participant list with login status

### **For Participants**
1. **Go to Login Page** → Enter registered email
2. **Check Email** → Receive 6-digit OTP
3. **Enter OTP** → Complete authentication
4. **Access Portal** → Submit contest entries

## 🚨 **Important Notes**

### **OTP Security**
- OTPs expire in 10 minutes
- Each OTP can only be used once
- Old OTPs are automatically cleaned up
- Only enabled participants can receive OTPs

### **Admin Controls**
- Login status changes are immediate
- Disabled participants cannot login even with valid OTP
- All changes are logged and tracked
- Real-time updates across all admin sessions

### **Email Requirements**
- SMTP server must be properly configured
- Email templates are customizable
- OTP emails include security information
- Failed email sends are logged

## 🔧 **Troubleshooting**

### **Common Issues**
1. **OTP not received**: Check SMTP configuration
2. **Login disabled**: Admin must enable participant login
3. **OTP expired**: Request new OTP (10-minute limit)
4. **Database errors**: Verify migration script ran successfully

### **Debug Steps**
1. Check browser console for errors
2. Verify Supabase connection
3. Test database functions directly
4. Check email server logs
5. Verify environment variables

## 📈 **Benefits**

1. **Enhanced Security**: OTP-based authentication
2. **Admin Control**: Granular login management
3. **Better UX**: Clear status indicators and feedback
4. **Audit Trail**: Complete participant activity tracking
5. **Scalability**: Handles large numbers of participants
6. **Flexibility**: Easy to enable/disable access as needed

## 🎉 **Ready to Use!**

Your ContestZen application now has:
- ✅ Secure OTP authentication
- ✅ Admin login controls
- ✅ Enhanced participant management
- ✅ Real-time status updates
- ✅ Complete audit trail

The system is production-ready and provides a secure, scalable solution for contest management!