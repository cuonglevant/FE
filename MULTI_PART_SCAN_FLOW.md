# Multi-Part Scanning Flow - Hướng Dẫn Sử Dụng

## 📋 Tổng Quan

Flow chấm điểm mới cho phép chụp **từng phần riêng biệt** của bài thi và gửi đến các endpoint tương ứng.

### ✨ Tính Năng Chính

1. **Chụp Mã Đề Thi** → `POST /scan/exam_code`
2. **Chụp Phần 1** → Lưu tạm
3. **Chụp Phần 2** → Lưu tạm  
4. **Chụp Phần 3** → Lưu tạm
5. **Review Screen** → Xem lại tất cả ảnh + Nhập Student ID ✨
6. **Gửi Tất Cả** → `POST /scan/answers` (p1_img, p2_img, p3_img)
7. **Lưu Kết Quả** → `POST /exams`

---

## 🔄 Luồng Hoạt Động

### Bước 1: Chọn Đáp Án Đã Tạo
```
Home Screen
  → Click vào ExamCard (đáp án đã tạo sẵn)
  → Navigate to MultiPartScanScreen with examCode
```

### Bước 2: Chụp Từng Phần
```
MultiPartScanScreen
  ├─ 1. Chụp Mã Đề
  │    ├─ Mở camera
  │    ├─ Chụp ảnh
  │    ├─ Gọi POST /scan/exam_code
  │    └─ Hiển thị mã đề đã quét
  │
  ├─ 2. Chụp Phần 1
  │    ├─ Mở camera
  │    ├─ Chụp ảnh
  │    └─ Lưu tạm vào state
  │
  ├─ 3. Chụp Phần 2
  │    ├─ Mở camera
  │    ├─ Chụp ảnh
  │    └─ Lưu tạm vào state
  │
  └─ 4. Chụp Phần 3
       ├─ Mở camera
       ├─ Chụp ảnh
       └─ Lưu tạm vào state
```

### Bước 3: Review Trước Khi Nộp (MỚI) ✨
```
ReviewScanScreen
  ├─ Hiển thị tất cả ảnh đã chụp
  ├─ Hiển thị mã đề đã quét
  ├─ Nhập Student ID thủ công
  ├─ Nút "Quay lại chụp lại" (nếu cần)
  └─ Nút "Nộp bài và chấm điểm"
```

### Bước 4: Hoàn Thành Chấm Điểm
```
Khi nhấn "Nộp bài và chấm điểm":
  ├─ Gọi POST /scan/answers với 3 files (p1_img, p2_img, p3_img)
  ├─ Nhận kết quả từng phần:
  │    ├─ p1: { answers: [], score: X }
  │    ├─ p2: { answers: [], score: Y }
  │    └─ p3: { answers: [], score: Z }
  │
  ├─ Tính tổng điểm: total_score = X + Y + Z
  │
  ├─ Gọi POST /exams để lưu kết quả:
  │    {
  │      exam_code: "TO01",
  │      student_id: "SBD12345" (nhập thủ công),
  │      total_score: 8.5,
  │      score_p1: 3.0,
  │      score_p2: 2.5,
  │      score_p3: 3.0,
  │      answers: [...]
  │    }
  │
  └─ Navigate to ResultsScreen
```

---

## 🎨 Giao Diện Người Dùng

### Màn Hình MultiPartScanScreen

```
┌─────────────────────────────────────┐
│  Chấm điểm từng phần                │
│  Đề: TO01                           │
├─────────────────────────────────────┤
│  Tiến độ: 4/4 ✅                     │
│  ████████████████████████████       │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │ ✓ Mã đề thi         [Ảnh]  │   │
│  │   Chụp lại                  │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ ✓ Phần 1            [Ảnh]  │   │
│  │   Chụp lại                  │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ ✓ Phần 2            [Ảnh]  │   │
│  │   Chụp lại                  │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ ✓ Phần 3            [Ảnh]  │   │
│  │   Chụp lại                  │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  [➡️ Tiếp tục xem lại]             │
│  [ Hủy ]                            │
└─────────────────────────────────────┘
```

### Màn Hình ReviewScanScreen (MỚI) ✨

```
┌─────────────────────────────────────┐
│  Xem lại trước khi nộp              │
│  Đề: TO01                           │
├─────────────────────────────────────┤
│  Mã sinh viên *                     │
│  ┌─────────────────────────────┐   │
│  │ SBD12345_____________       │   │
│  └─────────────────────────────┘   │
│                                     │
│  Ảnh đã chụp                        │
│  ┌─────────────────────────────┐   │
│  │ 📄 Mã đề thi                │   │
│  │   [Large Image Preview]     │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ 📝 Phần 1                   │   │
│  │   [Large Image Preview]     │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ 📝 Phần 2                   │   │
│  │   [Large Image Preview]     │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ � Phần 3                   │   │
│  │   [Large Image Preview]     │   │
│  └─────────────────────────────┘   │
│                                     │
│  💡 Lưu ý: Kiểm tra kỹ...          │
├─────────────────────────────────────┤
│  [✅ Nộp bài và chấm điểm]         │
│  [← Quay lại chụp lại]             │
└─────────────────────────────────────┘
```

### Camera View
```
┌─────────────────────────────────────┐
│                                     │
│        [Camera Preview]             │
│                                     │
│                                     │
│                                     │
├─────────────────────────────────────┤
│  Đang chụp: Phần 2                  │
├─────────────────────────────────────┤
│  [Hủy]      ( ● )         [    ]   │
│                                     │
└─────────────────────────────────────┘
```

---

## 📡 API Endpoints Được Sử Dụng

### 1. Scan Exam Code
```typescript
POST /scan/exam_code
Content-Type: multipart/form-data

Body:
  image: File

Response:
{
  "exam_code": "TO01"
}
```

### 2. Scan All Answer Parts
```typescript
POST /scan/answers
Content-Type: multipart/form-data

Body:
  p1_img: File (optional)
  p2_img: File (optional)
  p3_img: File (optional)

Response:
{
  "p1": {
    "answers": [[1, "A"], [2, "B"], ...],
    "filled": 20,
    "total": 20,
    "score": 3.0
  },
  "p2": {
    "answers": [[1, "C"], [2, "D"], ...],
    "filled": 15,
    "total": 15,
    "score": 2.5
  },
  "p3": {
    "answers": [[1, "A"], [2, "B"], ...],
    "filled": 15,
    "total": 15,
    "score": 3.0
  }
}
```

### 3. Save Exam Results
```typescript
POST /exams

Body:
{
  "exam_code": "TO01",
  "student_id": "SBD12345",
  "total_score": 8.5,
  "score_p1": 3.0,
  "score_p2": 2.5,
  "score_p3": 3.0,
  "answers": [[1, "A"], [2, "B"], ...]
}

Response:
{
  "_id": "exam_id",
  "exam_code": "TO01",
  "student_id": "SBD12345",
  "total_score": 8.5,
  ...
}
```

---

## 💻 Code Structure

### Files Created/Modified

```
components/
├── Screens/
│   ├── MultiPartScanScreen.tsx         ← UPDATED: Navigate to review
│   └── ReviewScanScreen.tsx            ← NEW: Review before submit ✨
│
├── constants/
│   └── colors.ts                       ← UPDATED: Added blue & lightGray
│
└── home/
    └── Home.tsx                        ← UPDATED: Navigate to MultiPartScanScreen

services/
└── APIService.js                       ← UPDATED: Added scan methods

App.tsx                                 ← UPDATED: Added routes
```

### Key Components

#### 1. MultiPartScanScreen
```typescript
interface Props {
  route: {
    params: {
      examCode: string  // Mã đề từ ExamCard
    }
  }
}

State Management:
- currentPart: 'exam_code' | 'p1' | 'p2' | 'p3'
- capturedImages: { exam_code?, p1?, p2?, p3? }
- scanResults: { exam_code?, p1?, p2?, p3? }
- isProcessing: boolean
- isCameraActive: boolean
```

#### 2. API Service Methods
```typescript
APIService.scanExamCode(imageFile)
  → POST /scan/exam_code
  → Returns: { exam_code: string }

APIService.scanAnswers(p1File, p2File, p3File)
  → POST /scan/answers
  → Returns: { p1: {...}, p2: {...}, p3: {...} }

APIService.createExam(examData)
  → POST /exams
  → Returns: { _id, exam_code, total_score, ... }
```

---

## 🎯 User Journey

### Scenario: Giáo viên chấm bài thi

1. **Đăng nhập vào app**
2. **Vào Home screen** → Thấy danh sách đáp án đã tạo
3. **Click vào ExamCard "TOÁN - TO01"**
4. **Màn hình MultiPartScanScreen mở ra**
5. **Chụp mã đề:**
   - Click "📷 Chụp Mã đề thi"
   - Camera mở
   - Chụp ảnh mã đề
   - Ảnh được gửi đến `/scan/exam_code`
   - Hiển thị "✅ Thành công: Mã đề TO01"
6. **Chụp Phần 1:**
   - Click "📷 Chụp Phần 1"
   - Chụp ảnh
   - Hiển thị "✅ Đã chụp: Phần 1"
7. **Chụp Phần 2:**
   - Click "📷 Chụp Phần 2"
   - Chụp ảnh
   - Hiển thị "✅ Đã chụp: Phần 2"
8. **Chụp Phần 3:**
   - Click "📷 Chụp Phần 3"
   - Chụp ảnh
   - Hiển thị "✅ Đã chụp: Phần 3"
9. **Review Screen (MỚI):** ✨
   - Click "➡️ Tiếp tục xem lại"
   - Màn hình ReviewScanScreen mở ra
   - Xem lại tất cả 4 ảnh đã chụp
   - Nhập Student ID: "SBD12345"
   - Kiểm tra lại thông tin
   - (Option) Click "← Quay lại chụp lại" nếu cần
10. **Hoàn thành:**
    - Click "✅ Nộp bài và chấm điểm"
    - Ảnh 3 phần được gửi đến `/scan/answers`
    - Nhận điểm từng phần
    - Lưu kết quả vào `/exams`
    - Hiển thị "✅ Hoàn thành: Tổng điểm 8.5"
11. **Xem kết quả:**
    - Navigate to ResultsScreen
    - Hiển thị chi tiết điểm từng phần

---

## 🔧 Features

### ✅ Implemented
- [x] Chụp từng phần riêng biệt
- [x] Preview ảnh đã chụp (thumbnail)
- [x] Chụp lại bất kỳ phần nào
- [x] Progress indicator
- [x] Auto-advance sau mỗi lần chụp
- [x] **Review screen trước khi submit** ✨
- [x] **Nhập Student ID thủ công** ✨
- [x] **Xem lại tất cả ảnh full size** ✨
- [x] **Quay lại chụp lại từ review screen** ✨
- [x] Validation đầy đủ 4 phần
- [x] Error handling
- [x] Loading states

### 🎨 UI/UX Features
- [x] Color-coded progress (blue = current, green = completed)
- [x] Thumbnail preview trong MultiPartScanScreen
- [x] **Full-size preview trong ReviewScanScreen** ✨
- [x] Clear visual feedback
- [x] Part labels in Vietnamese
- [x] Cancel button
- [x] Retake functionality
- [x] **Student ID input với validation** ✨

### 🔐 Error Handling
- [x] Camera permission check
- [x] Network error handling
- [x] API error messages
- [x] Incomplete scan validation
- [x] **Student ID required validation** ✨

---

## 🚀 Usage Example

### From Home Screen
```typescript
<ExamCard 
  title="TOÁN"
  code="TO01"
  onPress={() => navigation.navigate('MultiPartScanScreen', { 
    examCode: 'TO01' 
  })}
/>
```

### Manual Navigation
```typescript
navigation.navigate('MultiPartScanScreen', {
  examCode: 'TO01'  // Required
});
```

---

## 🐛 Known Limitations

### Current Limitations
1. ~~**Student ID:** Hiện tại dùng timestamp, chưa có màn hình scan student ID~~ ✅ FIXED: Nhập thủ công
2. **Offline Mode:** Không hỗ trợ chấm offline
3. **Batch Processing:** Chỉ chấm từng bài một

### Future Enhancements
- ~~[ ] Thêm scan Student ID~~ ✅ DONE: Manual input
- [x] **Review screen trước khi submit** ✅ DONE
- [ ] Offline support với sync sau
- [ ] Batch processing nhiều bài cùng lúc
- [ ] Auto-detect Student ID từ ảnh
- [ ] Edit answers manually
- [ ] Export results to PDF/Excel

---

## 📊 Performance

### Optimizations
- ✅ Fast camera switching
- ✅ Efficient image storage
- ✅ Minimal re-renders
- ✅ Proper cleanup on unmount

### Network
- API calls: 2-3 requests per exam
- Image upload: ~1-3MB per exam
- Response time: ~2-5s per scan

---

## 🧪 Testing

### Manual Testing Steps
1. Login to app
2. Navigate to Home
3. Click on an exam card
4. Verify MultiPartScanScreen opens
5. Test camera capture for each part
6. Verify retake functionality
7. Complete all 4 parts
8. **Verify ReviewScanScreen opens** ✨
9. **Check all images are displayed correctly** ✨
10. **Test Student ID input validation** ✨
11. **Test "Quay lại chụp lại" button** ✨
12. **Enter Student ID and submit** ✨
13. Verify API calls success
14. Check results screen

### Test Data
```typescript
Sample Exam:
- Code: TO01
- Parts: 3
- Questions: 50 total (20 + 15 + 15)
```

---

## 📖 Documentation References

- **API Documentation:** `API_DOCUMENTATION.md`
- **Project Summary:** `PROJECT_SUMMARY.md`
- **Test Results:** `TEST_RESULTS.md`

---

## 🎓 How It Works

### State Flow
```
MultiPartScanScreen State:
  currentPart = 'exam_code'
  capturedImages = {}
  scanResults = {}

After Capturing All Parts:
  capturedImages = {
    exam_code: { uri, fileName },
    p1: { uri, fileName },
    p2: { uri, fileName },
    p3: { uri, fileName }
  }
  scanResults.exam_code = "TO01"
  
  → Navigate to ReviewScanScreen with:
    - examCode
    - scannedExamCode
    - images (all 4)

ReviewScanScreen State:
  studentId = ""
  isSubmitting = false
  
After User Input:
  studentId = "SBD12345"
  
After Submit:
  → Send images to API
  → Get results
  → Save to database
  → Navigate to ResultsScreen
```

### Image Handling
```typescript
1. Camera.takePhoto()
   → Returns: { path: string }

2. RNFS.copyFile(photo.path, destPath)
   → Saves to app documents folder

3. Create file object:
   {
     uri: 'file://...',
     type: 'image/jpeg',
     name: 'p1_123456789.jpg'
   }

4. FormData.append('p1_img', fileObject)
   → Ready for API upload
```

---

## 💡 Tips & Best Practices

### For Users
- ✅ Giữ camera ổn định khi chụp
- ✅ Chụp trong điều kiện ánh sáng tốt
- ✅ Đảm bảo toàn bộ phần trong khung hình
- ✅ Kiểm tra preview trước khi tiếp tục
- ✅ Sử dụng "Chụp lại" nếu ảnh không rõ
- ✅ **Xem kỹ tất cả ảnh trong Review Screen** ✨
- ✅ **Nhập đúng mã sinh viên** ✨
- ✅ **Có thể quay lại chụp lại nếu cần** ✨

### For Developers
- ✅ Always check camera permissions
- ✅ Handle file cleanup on unmount
- ✅ Validate image files before upload
- ✅ Show loading states during API calls
- ✅ Proper error handling and user feedback

---

**Created:** October 12, 2025  
**Last Updated:** October 12, 2025  
**Version:** 1.0.0
