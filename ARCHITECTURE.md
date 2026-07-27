# CivicMitra Node + MongoDB Architecture

## Overview
This project now has a Node.js Express backend with MongoDB for core civic engagement data. Firebase remains available for the frontend auth and the existing UI integration, but the backend data layer is now centered around MongoDB.

## Core Components
- Express server: server.ts
- Database connection: server/config/database.ts
- Models:
  - User
  - Challenge
  - Completion
  - Event
  - QuizQuestion
  - QuizAttempt
- Routes:
  - /api/health
  - /api/auth/profile
  - /api/challenges
  - /api/events
  - /api/quiz-questions
  - /api/completions
  - /api/quiz-attempts

## Data Model Mapping
- users -> User collection
- challenges -> Challenge collection
- completions -> Completion collection
- events -> Event collection
- quiz_questions -> QuizQuestion collection
- quiz_attempts -> QuizAttempt collection

## Environment Variables
- MONGODB_URI
- PORT

## Next Step
Start MongoDB locally or use MongoDB Atlas, then run:
- npm install
- npm run dev
