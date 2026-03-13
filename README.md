# Scalable REST API & Frontend Assignment

This project consists of a secure and scalable Node.js/Express backend and a modern React (Next.js) frontend.

## 🚀 Features

### Backend
- **User Authentication**: Register & Login with JWT and Bcrypt hashing.
- **Role-Based Access Control (RBAC)**: Support for `user` and `admin` roles.
- **CRUD Operations**: Manage Tasks with ownership security.
- **API Versioning**: Standardized `/api/v1` routing.
- **Validation**: Input validation using `Zod`.
- **Security**: Implementation of `Helmet`, `CORS`, and JWT protection.
- **Documentation**: Interactive API docs available via Swagger.

### Frontend
- **Authentication Flow**: Login and Registration pages with JWT storage.
- **Protected Dashboard**: Tasks management interface accessible only to logged-in users.
- **State Management**: React hooks for local state and Axios for API calls.
- **Styling**: Premium UI built with Tailwind CSS and Lucide icons.
- **Feedback**: Toast notifications for success/error messages.

## 🛠️ Tech Stack
- **Backend**: Node.js, Express, TypeScript, MongoDB (Mongoose)
- **Frontend**: Next.js, React, Tailwind CSS, Axios
- **Database**: MongoDB

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally or URI)

### Backend Setup
1. `cd backend`
2. `npm install`
3. Create `.env` file (see `.env.example` or use defaults in code)
4. `npm run dev` (runs on port 5000)
5. Swagger Docs: `http://localhost:5000/api-docs`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev` (runs on port 3000)

## 📄 Documentation
Detailed scalability notes can be found in `SCALABILITY.md`.
