# Expense Tracker Backend

This is the backend for the Expense Tracker application, built with Node.js, Express, MongoDB, and Mongoose.

## Features

- User authentication with JWT
- Password hashing with bcrypt
- Expense CRUD operations
- Protected routes
- Category-based filtering and date-based sorting for expenses
- Centralized error handling

## Prerequisites

- Node.js
- MongoDB Atlas account

## Getting Started

1.  Clone the repository
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the root directory and add the following:
    ```env
    MONGODB_URI=your_mongodb_connection_string
    PORT=5000
    JWT_SECRET=your_jwt_secret
    JWT_EXPIRE=30d
    ```
4.  Start the server:
    - For production: `npm start`
    - For development: `npm run dev`

## API Endpoints

### Authentication

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |

**Example Register Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Expenses (Protected)

Requires `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/expenses` | Create a new expense |
| GET | `/api/expenses` | Get all expenses (supports `?category=Food`) |
| GET | `/api/expenses/:id` | Get a single expense by ID |
| PUT | `/api/expenses/:id` | Update an expense by ID |
| DELETE | `/api/expenses/:id` | Delete an expense by ID |

**Example Expense Body:**
```json
{
  "title": "Grocery",
  "amount": 50,
  "category": "Food",
  "description": "Weekly grocery shopping",
  "date": "2023-10-27"
}
```

## Folder Structure

- `server.js`: Entry point
- `config/`: Database configuration
- `controllers/`: Business logic
- `middleware/`: Auth and error handling middleware
- `models/`: Mongoose schemas
- `routes/`: API route definitions
