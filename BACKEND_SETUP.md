# Backend Configuration Guide

## 🔧 Setup Instructions

### 1. Environment Variables
Copy the example environment file and configure it:
```bash
cp .env.example .env.local
```

### 2. Required Variables
```env
# API Backend URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# NextAuth Secret (generate a random 32+ character string)
AUTH_SECRET=your-secure-random-string-here

# NextAuth URL (your frontend URL)
NEXTAUTH_URL=http://localhost:3000
```

### 3. Backend Expectations
Your backend API should have these endpoints:

#### Authentication Endpoints:
- `POST /users/login` - User login
- `POST /users/register` - User registration  
- `POST /users/logout` - User logout
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `POST /users/forgot-password` - Password reset request
- `PUT /users/reset-password` - Password reset confirmation

#### Other Endpoints:
- `GET /recipes` - Get recipes
- `POST /recipes` - Create recipe
- `GET /recipes/:id` - Get recipe by ID
- `GET /restaurants` - Get restaurants
- `GET /doctors` - Get doctors
- `GET /markets` - Get markets

### 4. Expected Response Format

#### Login Response:
```json
{
  "user": {
    "_id": "user_id",
    "username": "username",
    "email": "email@example.com",
    "photo": "photo_url",
    "role": "user" | "professional" | "admin"
  },
  "token": "jwt_token_here"
}
```

#### Error Response:
```json
{
  "message": "Error description"
}
```

### 5. Authentication Flow
1. User logs in via NextAuth
2. NextAuth calls your backend `/users/login`
3. Backend returns user data + JWT token
4. Frontend stores JWT in NextAuth session
5. Subsequent API calls use JWT token for authentication

### 6. Common Issues & Solutions

#### Issue: "Network Error" or "Connection Refused"
- Check if your backend server is running
- Verify the `NEXT_PUBLIC_API_URL` is correct
- Ensure CORS is configured on your backend

#### Issue: Authentication not working
- Check `AUTH_SECRET` is set and consistent
- Verify backend returns expected user data format
- Check JWT token is being passed correctly

#### Issue: API calls failing
- Verify all endpoints match the expected format
- Check backend error responses include `message` field
- Ensure proper HTTP status codes are returned

### 7. Development vs Production

#### Development:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXTAUTH_URL=http://localhost:3000
```

#### Production:
```env
NEXT_PUBLIC_API_URL=https://your-api.com/api/v1
NEXTAUTH_URL=https://your-frontend.com
```

## 🚀 Quick Start
1. Start your backend server on port 5000
2. Copy `.env.example` to `.env.local`
3. Update the environment variables
4. Run `npm run dev`
5. Test authentication flow
