# Intelligent Metro Network

Intelligent Metro Network is a MERN-based Bangalore Metro ticket booking project with:
- a React frontend
- an Express + Node.js backend
- MongoDB for users and tickets
- a Gemini-powered metro assistant with local fallback support

## Project Structure

```text
intelligent-metro/
├── src/              # React frontend
├── public/           # Static assets
├── server/           # Express + MongoDB backend
└── scripts/          # Submission helper script
```

## Requirements

Install these first:
- Node.js 18+ recommended
- npm
- MongoDB Atlas connection string
- Gemini API key (optional, but recommended for AI assistant)

## Environment Setup

Create this file:

`/Users/sakshamgupta/Documents/IA2_train/intelligent-metro/server/.env`

Add:

```env
PORT=5002
MONGODB_URI=your-mongodb-connection-string
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash-lite
CLIENT_ORIGIN=http://localhost:3000
```

Notes:
- `MONGODB_URI` is required for signup, login, and ticket booking.
- `GEMINI_API_KEY` is used by the AI assistant.
- If Gemini fails, the assistant falls back to local Bangalore Metro data.

## Install Dependencies

Frontend:

```bash
cd /Users/sakshamgupta/Documents/IA2_train/intelligent-metro
npm install
```

Backend:

```bash
cd /Users/sakshamgupta/Documents/IA2_train/intelligent-metro/server
npm install
```

## Start the Project

Start backend first:

```bash
cd /Users/sakshamgupta/Documents/IA2_train/intelligent-metro/server
npm run dev
```

Expected backend URL:

```text
http://localhost:5002
```

Then start frontend in a second terminal:

```bash
cd /Users/sakshamgupta/Documents/IA2_train/intelligent-metro
npm start
```

Expected frontend URL:

```text
http://localhost:3000
```

## How to Use

1. Open `http://localhost:3000`
2. Create an account using `Sign Up`
3. Log in
4. Book tickets through the dashboard
5. Confirm the ticket to store it in MongoDB
6. Use the `Metro AI Help` button to ask Bangalore Metro questions

## Backend Features

- `POST /api/auth/signup` creates a user
- `POST /api/auth/login` logs in an existing user
- `POST /api/tickets` stores booked tickets in MongoDB
- `POST /api/assistant/chat` replies using Gemini or local metro fallback
- `GET /api/health` checks backend status

## Database Collections

When the app runs successfully, MongoDB will create collections such as:
- `users`
- `tickets`

You can view them in MongoDB Compass after connecting with the same `MONGODB_URI`.

## Common Problems

If frontend shows `Proxy error`:
- make sure backend is running on port `5002`
- make sure frontend was restarted after any `package.json` proxy change

If signup or booking fails:
- check `MONGODB_URI` in `server/.env`
- verify MongoDB Atlas network access and credentials

If assistant fails:
- check `GEMINI_API_KEY`
- check backend terminal logs
- the app should still answer with local fallback data

## Build Frontend

```bash
cd /Users/sakshamgupta/Documents/IA2_train/intelligent-metro
npm run build
```

## Submission Zip

Use:

```bash
cd /Users/sakshamgupta/Documents/IA2_train/intelligent-metro
npm run zip:submission
```

## Tech Stack

- React
- React Router
- Bootstrap / React-Bootstrap
- Node.js
- Express
- MongoDB / Mongoose
- Google Gemini API
