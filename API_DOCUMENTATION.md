# API Documentation - Exam Grading System

## Base URL
**Production:** `https://be-service-od7h.onrender.com`

## Authentication Endpoints

### POST /auth/signup
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `201 Created`
```json
{
  "message": "User created successfully"
}
```

---

### POST /auth/login
Login to existing account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "token": "jwt_token_here",
  "user": {
    "email": "user@example.com"
  }
}
```

---

## Exam Management Endpoints

### GET /exams
List all exams with optional filters.

**Query Parameters:**
- `student_id` (optional): Filter by student ID
- `exam_code` (optional): Filter by exam code

**Response:** `200 OK`
```json
[
  {
    "_id": "exam_id",
    "student_id": "SBD12345",
    "exam_code": "DE001",
    "total_score": 8.5,
    "score_p1": 3.0,
    "score_p2": 2.5,
    "score_p3": 3.0,
    "created_at": "2025-10-12T10:30:00Z"
  }
]
```

---

### POST /exams
Create a new exam record.

**Request Body:**
```json
{
  "student_id": "SBD12345",
  "exam_code": "DE001",
  "total_score": 8.5
}
```

**Response:** `201 Created`
```json
{
  "_id": "exam_id",
  "student_id": "SBD12345",
  "exam_code": "DE001",
  "total_score": 8.5
}
```

---

### GET /exams/{exam_id}
Get details of a specific exam.

**Response:** `200 OK`
```json
{
  "_id": "exam_id",
  "student_id": "SBD12345",
  "exam_code": "DE001",
  "total_score": 8.5,
  "answers": [[1, "A"], [2, "B"], [3, "C"]]
}
```

---

### PUT /exams/{exam_id}
Update an existing exam.

**Request Body:**
```json
{
  "total_score": 9.0
}
```

---

### DELETE /exams/{exam_id}
Delete an exam record.

**Response:** `200 OK`

---

## Correct Answers Endpoints

### GET /correctans
List all correct answer sets.

**Response:** `200 OK`
```json
[
  {
    "exam_code": "DE001",
    "answers": [[1, "A"], [2, "B"], [3, "C"]],
    "created_at": "2025-10-12T10:00:00Z"
  }
]
```

---

### POST /correctans
Create correct answers by scanning images.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `exam_code` (string, required): Exam code
- `p1_img` (file, required): Part 1 answer sheet image
- `p2_img` (file, required): Part 2 answer sheet image
- `p3_img` (file, required): Part 3 answer sheet image

**Response:** `201 Created`
```json
{
  "exam_code": "DE001",
  "answers": [[1, "A"], [2, "B"], [3, "C"]],
  "total_questions": 50
}
```

---

### GET /correctans/{exam_code}
Get correct answers for a specific exam code.

**Response:** `200 OK`
```json
{
  "exam_code": "DE001",
  "answers": [[1, "A"], [2, "B"], [3, "C"]]
}
```

---

### PUT /correctans/{exam_code}
Update correct answers for an exam.

**Request Body:**
```json
{
  "answers": [[1, "A"], [2, "C"], [3, "B"]]
}
```

---

### DELETE /correctans/{exam_code}
Delete correct answers for an exam.

---

## Direct Scan Endpoints (No Session)

### POST /scan/student_id
Scan student ID from image.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `image` (file, required): Image containing student ID

**Response:** `200 OK`
```json
{
  "student_id": "SBD12345"
}
```

---

### POST /scan/exam_code
Scan exam code from image.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `image` (file, required): Image containing exam code

**Response:** `200 OK`
```json
{
  "exam_code": "DE001"
}
```

---

### POST /scan/answers
Scan answer sheets (all parts).

**Content-Type:** `multipart/form-data`

**Form Data:**
- `p1_img` (file, optional): Part 1 answer sheet
- `p2_img` (file, optional): Part 2 answer sheet
- `p3_img` (file, optional): Part 3 answer sheet

**Response:** `200 OK`
```json
{
  "p1": {
    "answers": [[1, "A"], [2, "B"]],
    "filled": 2,
    "total": 20
  },
  "p2": {
    "answers": [[1, "C"], [2, "D"]],
    "filled": 2,
    "total": 15
  },
  "p3": {
    "answers": [[1, "A"], [2, "B"]],
    "filled": 2,
    "total": 15
  }
}
```

---

## Session-Based Grading Flow (Advanced)

### POST /exam/session/start
Start a new grading session.

**Response:** `201 Created`
```json
{
  "session_id": "session_uuid_here"
}
```

---

### POST /exam/session/student_id
Upload student ID to session.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `session_id` (string, required)
- `image` (file, required)

**Response:** `200 OK`
```json
{
  "student_id": "SBD12345"
}
```

---

### POST /exam/session/exam_code
Upload exam code to session.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `session_id` (string, required)
- `image` (file, required)

**Response:** `200 OK`
```json
{
  "exam_code": "DE001"
}
```

---

### POST /exam/session/part/{part_name}
Upload exam part to session.

**Path Parameters:**
- `part_name`: One of `p1`, `p2`, `p3`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `session_id` (string, required)
- `image` (file, required)

**Response:** `200 OK`
```json
{
  "part": "p1",
  "answers": [[1, "A"], [2, "B"]],
  "filled": 2
}
```

---

### POST /exam/session/finish
Finish grading session and save exam.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `session_id` (string, required)
- `created_by` (string, optional): User ID who created the exam

**Response:** `201 Created`
```json
{
  "exam_id": "exam_id_here",
  "student_id": "SBD12345",
  "exam_code": "DE001",
  "score_p1": 3.0,
  "score_p2": 2.5,
  "score_p3": 3.0,
  "total_score": 8.5
}
```

---

## Health & Info Endpoints

### GET /
Get API information.

**Response:** `200 OK`
```json
{
  "name": "Exam Grading API",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/auth/*",
    "exams": "/exams",
    "correctans": "/correctans",
    "scan": "/scan/*",
    "session": "/exam/session/*"
  }
}
```

---

### GET /health
Check system health.

**Response:** `200 OK`
```json
{
  "status": "healthy",
  "services": {
    "database": "connected",
    "ocr": "available"
  },
  "metrics": {
    "uptime": 3600,
    "requests_today": 150
  }
}
```

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "error": "Error message here",
  "details": "Additional error details"
}
```

**Common Status Codes:**
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Authentication required or failed
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Notes

1. **Image Upload**: All image uploads should be in JPEG or PNG format
2. **Session Expiry**: Grading sessions expire after 1 hour of inactivity
3. **Rate Limiting**: API has rate limiting of 100 requests per minute per IP
4. **CORS**: API allows cross-origin requests from approved domains
5. **Authentication**: Most endpoints require JWT token in Authorization header
