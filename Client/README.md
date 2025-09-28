# VideoAI - Transform Videos into Viral Short Clips

## Project Overview

VideoAI is an AI-powered video editing application that transforms long-form content into engaging short clips ready for social media. Upload videos or paste YouTube links for instant processing.

**Author**: aravind

## Features

- Upload video files directly
- Process YouTube videos via URL
- AI-powered clip generation
- Real-time processing status
- Download generated clips
- User authentication and management

## Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies
npm i

# Step 4: Start the development server
npm run dev
```

## Technologies Used

This project is built with:

- **Frontend**: Vite, TypeScript, React, shadcn-ui, Tailwind CSS
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Cloud Storage**: AWS S3
- **Authentication**: JWT
- **Video Processing**: youtube-dl-exec

## Project Structure

```
Client/
├── src/
│   ├── components/     # React components
│   ├── pages/         # Page components
│   ├── lib/           # API services and utilities
│   └── hooks/         # Custom React hooks

Server/
├── controllers/       # Route controllers
├── models/           # Database models
├── routes/           # API routes
├── services/         # Business logic
└── config/           # Configuration files
```

## Development

- **Frontend**: `npm run dev` (runs on port 5173)
- **Backend**: `npm run dev` (runs on port 3000)

## Deployment

The application can be deployed to any hosting platform that supports Node.js and React applications.
