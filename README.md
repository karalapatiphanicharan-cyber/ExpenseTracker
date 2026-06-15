# Expense Tracker

A full-stack expense tracking application built with Node.js, Express, MongoDB, and React (Vite).

## Features

- **Authentication:** Secure user registration and login with JWT and bcrypt.
- **Expense Management:** Full CRUD operations for personal expenses.
- **Dashboard:** Visualization of expenses by category and monthly spending trends.
- **Search & Filter:** Easily find transactions by title or category.
- **Responsive Design:** Premium, minimalist UI that works on all devices.

## Tech Stack

- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Frontend:** React (Vite), Tailwind CSS, React Router, Recharts, Lucide React, Axios

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account

### 1. Backend Setup

1.  Navigate to the root directory.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the root directory:
    ```env
    MONGODB_URI=your_mongodb_connection_string
    PORT=5000
    JWT_SECRET=your_jwt_secret
    JWT_EXPIRE=30d
    ```
4.  Start the backend server:
    - Production: `npm start`
    - Development: `npm run dev`

### 2. Frontend Setup

1.  Navigate to the `client` directory.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `client` directory:
    ```env
    VITE_API_URL=http://localhost:5000/api
    ```
4.  Start the frontend development server:
    ```bash
    npm run dev
    ```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Expenses (Protected)
- `GET /api/expenses` - Get all user expenses (supports `?category=`)
- `POST /api/expenses` - Create new expense
- `GET /api/expenses/:id` - Get single expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
