# Voting System - Debugging Guide

## ✅ What Was Fixed

### 1. **Error Handling in VotingInterface**
- Previously, errors were silently caught and the page refreshed even on failures
- Now shows proper error messages with specific guidance based on error type
- Handles all common errors: 401 (auth), 400 (duplicate/closed), 404 (not found)

### 2. **API Interceptor Enhanced**
- Added warnings when secret key is missing
- Added response interceptor to catch and log auth errors
- Better debugging information in console

### 3. **Debug Utilities**
- Added `window.checkAuth()` - Check authentication status in browser console
- Added `window.clearAuth()` - Clear all auth data if needed
- Auto-loads when app starts

---

## 🔍 How to Debug Voting Issues

### Step 1: Check Authentication in Browser Console
Open your browser's Developer Tools (F12) and run:
```javascript
checkAuth()
```

You should see:
```
🔐 Authentication Status Check
  ✅ Secret Key present: true
  ✅ Auth Token present: true
  ✅ User Data present: true
  🔑 Secret Key (first 10 chars): 56ed9b58b1...
  👤 User: { email: "...", area: "...", department: "..." }
```

**If any are `false`**, the user is not properly logged in.

---

### Step 2: Check Network Tab
1. Open Developer Tools → Network tab
2. Click a vote button
3. Find the `/api/voting/vote` request
4. Check **Request Headers** - must include:
   ```
   X-Secret-Key: <your-secret-key>
   ```

**If missing**, the interceptor isn't working.

---

### Step 3: Check Backend Response
Look at the response from `/api/voting/vote`:

#### ✅ Success (200):
```json
{
  "message": "Vote recorded successfully",
  "vote": { ... }
}
```

#### ❌ Error (401):
```json
{
  "error": "INVALID_SECRET_KEY"
}
```
**Fix**: Re-login with correct secret key

#### ❌ Error (400):
```json
{
  "error": "DUPLICATE_VOTE"
}
```
**Fix**: Normal - user already voted

---

## 🛠️ Common Fixes

### Issue: "No secret_key found in localStorage"
**Solution**: User needs to log in
```javascript
// In browser console, check:
localStorage.getItem('secret_key')
// Should return a long hex string
```

### Issue: "Invalid secret key" error
**Solution**: 
1. Clear auth data: `clearAuth()`
2. Log in again with correct secret key from .env file

### Issue: "DUPLICATE_VOTE" error
**Solution**: This is expected behavior - user already voted

### Issue: "VOTING_CLOSED" error
**Solution**: The rumor is locked - voting period ended

---

## 📝 Manual Test Checklist

1. ✅ Login with a valid secret key (e.g., from `.env` file)
2. ✅ Run `checkAuth()` in console - all should be `true`
3. ✅ Navigate to a rumor detail page
4. ✅ Open Network tab
5. ✅ Click FACT or LIE button
6. ✅ Verify request has `X-Secret-Key` header
7. ✅ Check response status and message
8. ✅ Verify success toast appears
9. ✅ Try voting again - should show "Already voted"

---

## 🎯 Expected API Behavior

### Endpoint: `POST /api/voting/vote`

**Request:**
```json
{
  "rumorId": "uuid-string",
  "voteType": "FACT" // or "LIE"
}
```

**Headers:**
```
Content-Type: application/json
X-Secret-Key: <user-secret-key>
```

**Success Response (200):**
```json
{
  "message": "Vote recorded successfully",
  "vote": {
    "rumorId": "...",
    "voteType": "FACT",
    "weight": 1.0,
    "isWithinArea": true,
    "timestamp": "2026-02-07T12:00:00"
  }
}
```

**Error Responses:**
- `401` - Missing or invalid X-Secret-Key header
- `400` - Duplicate vote or voting closed
- `404` - Rumor not found

---

## 🚨 If Still Not Working

1. **Check Backend is Running**
   - Verify backend is running on `http://localhost:3008`
   - Test with: `curl http://localhost:3008/api/health` (if available)

2. **Check CORS**
   - Backend must allow requests from `http://localhost:3000`
   - Check console for CORS errors

3. **Verify Secret Key**
   - The secret key in localStorage must match a valid user in the backend
   - Use one from `.env` file to test

4. **Check Environment Variables**
   - Verify `.env` has: `NEXT_PUBLIC_API_URL=http://localhost:3008/api`
   - Restart Next.js dev server after changing .env

---

## 🔧 Emergency Reset

If everything is broken:
```javascript
// In browser console:
clearAuth()
// Then reload page and log in again
```

---

## 📞 Support Checklist

When reporting issues, provide:
1. Output of `checkAuth()` in console
2. Screenshot of Network tab showing the vote request
3. Backend response status and message
4. Browser console errors (if any)
