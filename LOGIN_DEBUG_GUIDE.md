# Login/Signup Debug Guide

## Vấn Đề Gặp Phải

**Hiện tượng:** Signup thành công nhưng Login bị sai thông tin

## ✅ Các Fix Đã Áp Dụng

### 1. Normalize Email & Password
**Vấn đề:**
- Email có thể có space ở đầu/cuối
- Email có thể viết HOA/thường khác nhau
- Password có thể có space không mong muốn

**Giải pháp:**
```typescript
// SignUp & Login
const trimmedEmail = email.trim().toLowerCase();
const trimmedPassword = password.trim();
```

### 2. Validation Cải Thiện

**SignUp:**
```typescript
- ✅ Check empty fields
- ✅ Check password match
- ✅ Check password length >= 6
- ✅ Trim & lowercase email
- ✅ Success message trước khi chuyển màn hình
```

**Login:**
```typescript
- ✅ Check empty fields
- ✅ Trim & lowercase email
- ✅ Better error message
- ✅ Console log để debug
- ✅ Success message khi login thành công
```

### 3. Debug Logging

Đã thêm console logs trong `APIService.js`:
```javascript
console.log(`[API] POST /auth/signup`, { email, password: '***' });
console.log(`[API] Response 201 Created`);
console.log(`[API] POST /auth/login`, { email, password: '***' });
console.log(`[API] Response 200 OK`);
```

## 🧪 Cách Test

### Test Case 1: Normal Flow
```
1. SignUp:
   Email: test@example.com
   Password: 123456
   Confirm: 123456
   
2. Expected:
   ✅ Alert "Đăng ký thành công!"
   ✅ Navigate to Login
   
3. Login:
   Email: test@example.com
   Password: 123456
   
4. Expected:
   ✅ Alert "Đăng nhập thành công!"
   ✅ Navigate to Home
```

### Test Case 2: Email với Space
```
1. SignUp:
   Email: " test@example.com "  (có space)
   Password: 123456
   
2. Login:
   Email: "test@example.com"     (không space)
   
3. Expected:
   ✅ Vẫn login được (đã trim)
```

### Test Case 3: Email HOA/thường
```
1. SignUp:
   Email: TEST@EXAMPLE.COM
   Password: 123456
   
2. Login:
   Email: test@example.com
   
3. Expected:
   ✅ Vẫn login được (đã lowercase)
```

### Test Case 4: Password với Space
```
1. SignUp:
   Email: test@example.com
   Password: " 123456 "  (có space)
   
2. Login:
   Email: test@example.com
   Password: "123456"     (không space)
   
3. Expected:
   ✅ Vẫn login được (đã trim)
```

## 🔍 Debug Steps

### Bước 1: Check Request Payload

Mở React Native Debugger hoặc Console:
```
[API] POST https://be-service-od7h.onrender.com/auth/signup
{
  "email": "test@example.com",
  "password": "123456"
}
[API] Response 201 Created

[API] POST https://be-service-od7h.onrender.com/auth/login
{
  "email": "test@example.com",
  "password": "123456"
}
[API] Response 200 OK hoặc 401 Unauthorized
```

### Bước 2: Check Backend Response

Nếu login fail:
```javascript
[API] Error response: { "error": "Invalid credentials" }
```

### Bước 3: Verify Stored Data

Kiểm tra backend database xem email đã lưu như thế nào:
- Email có phải lowercase không?
- Email có space không?
- Password có được hash đúng không?

## 🐛 Common Issues

### Issue 1: Password không match
**Nguyên nhân:** Space ở đầu/cuối password

**Fix:**
```typescript
const trimmedPassword = password.trim();
```

### Issue 2: Email không tìm thấy
**Nguyên nhân:** 
- Signup: "Test@Example.com"
- Login: "test@example.com"

**Fix:**
```typescript
const trimmedEmail = email.trim().toLowerCase();
```

### Issue 3: Backend return 401
**Nguyên nhân:** Backend check password không đúng

**Debug:**
```javascript
// Check backend logs
// Verify password hashing algorithm
// Check if password is stored correctly
```

## 📋 Checklist

Khi test signup/login:
- [ ] Email không có space
- [ ] Email là lowercase
- [ ] Password không có space
- [ ] Password >= 6 ký tự
- [ ] Confirm password match
- [ ] Check console logs
- [ ] Check network requests
- [ ] Verify backend response

## 🔧 Troubleshooting

### Nếu vẫn login fail:

1. **Clear app data:**
   ```bash
   adb shell pm clear com.cuonglevant.examapp
   ```

2. **Test với Postman/curl:**
   ```bash
   # Signup
   curl -X POST https://be-service-od7h.onrender.com/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"123456"}'
   
   # Login
   curl -X POST https://be-service-od7h.onrender.com/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"123456"}'
   ```

3. **Check backend logs:**
   - Xem backend có nhận được request không
   - Check email được lưu như thế nào
   - Verify password hash

4. **Test với user khác:**
   - Tạo email mới
   - Đảm bảo email chưa tồn tại
   - Test lại flow

## 📊 Expected Behavior

### Signup Flow:
```
Input → Trim & Lowercase → Validate → API Call → Success Message → Navigate to Login
```

### Login Flow:
```
Input → Trim & Lowercase → Validate → API Call → Success Message → Navigate to Home
```

## 🎯 Current Implementation

### SignUpScreen.tsx
```typescript
const trimmedEmail = email.trim().toLowerCase();
const trimmedPassword = password.trim();

await AuthService.register({ 
  username: trimmedEmail, 
  email: trimmedEmail, 
  password: trimmedPassword 
});
```

### LogInScreen.tsx
```typescript
const trimmedEmail = email.trim().toLowerCase();
const trimmedPassword = password.trim();

await AuthService.login({ 
  username: trimmedEmail, 
  email: trimmedEmail,
  password: trimmedPassword 
});
```

### AuthService.js
```javascript
login: ({ username, email, password }) => 
  APIService.signin({ email: email || username, password })

register: ({ username, email, password }) => 
  APIService.signup({ email: email || username, password })
```

## ✅ Verification Steps

1. **Test signup:**
   ```
   Email: test123@example.com
   Password: test123
   → Should show success alert
   ```

2. **Test login với exact same credentials:**
   ```
   Email: test123@example.com
   Password: test123
   → Should navigate to Home
   ```

3. **Test login với different case:**
   ```
   Email: TEST123@EXAMPLE.COM
   Password: test123
   → Should still work (lowercase conversion)
   ```

4. **Test login với spaces:**
   ```
   Email: " test123@example.com "
   Password: " test123 "
   → Should still work (trim)
   ```

---

**Updated:** October 12, 2025  
**Status:** ✅ Fixed with email normalization and validation
