# API Testing Guide

## 🔧 **Fixed Build Error**

The `child_process` error has been resolved by:
1. **Moving email functionality to server-side API routes**
2. **Updated Next.js config** to handle Node.js modules properly
3. **Client-side code now uses fetch** to call API endpoints

## 📁 **New API Routes Created**

### **1. Generate OTP API**
- **Endpoint**: `POST /api/generate-otp`
- **Purpose**: Generate and send OTP via email
- **Server-side only**: Uses nodemailer safely

### **2. Verify OTP API**
- **Endpoint**: `POST /api/verify-otp`
- **Purpose**: Verify OTP and return participant ID
- **Server-side only**: Uses Supabase functions

## 🧪 **Testing the APIs**

### **Test Generate OTP**
```bash
curl -X POST http://localhost:3000/api/generate-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email address."
}
```

### **Test Verify OTP**
```bash
curl -X POST http://localhost:3000/api/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "otp": "123456"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully.",
  "participantId": "uuid-here"
}
```

## 🔍 **Error Handling**

### **Common Error Responses**
```json
// Invalid email
{
  "success": false,
  "message": "Email is required"
}

// Participant not found or login disabled
{
  "success": false,
  "message": "Participant not found or login disabled"
}

// Invalid OTP
{
  "success": false,
  "message": "Invalid or expired OTP"
}

// Email sending failed
{
  "success": false,
  "message": "Failed to send OTP email"
}
```

## 🚀 **Build Process**

The build error is now fixed because:

1. **Server-side modules** (nodemailer, child_process) are only used in API routes
2. **Client-side code** uses standard fetch API
3. **Webpack configuration** properly handles Node.js modules
4. **No direct imports** of server-side modules in client code

## ✅ **Verification Steps**

1. **Run the build**: `npm run build`
2. **Should complete without errors**
3. **Test the application**: `npm run dev`
4. **Verify OTP functionality** works end-to-end

## 🔧 **Architecture**

```
Client (Browser)
    ↓ fetch()
API Routes (Server)
    ↓ nodemailer
Email Service
    ↓ Supabase RPC
Database Functions
```

This architecture ensures:
- ✅ **No client-side Node.js modules**
- ✅ **Secure server-side email handling**
- ✅ **Proper separation of concerns**
- ✅ **Build compatibility**

The application should now build and run without the `child_process` error! 🎉
