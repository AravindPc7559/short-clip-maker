# VideoAI Backend

AI-powered video editing backend that transforms long-form content into engaging short clips.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the server:**
   ```bash
   npm run dev
   ```

## Environment Setup

See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for detailed configuration instructions.

### Required Environment Variables

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT token secret key

### Optional Environment Variables

- `AWS_S3_BUCKET` - S3 bucket for file storage (uses local storage if not set)
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)

## API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

### Video Upload
- `POST /upload/video` - Upload video file
- `POST /upload/youtube` - Upload via YouTube URL
- `GET /upload/status/:jobId` - Check upload status

### Video Processing
- `POST /video/process/:jobId` - Start video processing
- `GET /video/list` - Get user videos
- `GET /video/status/:id` - Get video status
- `GET /video/result/:id` - Get video result
- `DELETE /video/:id` - Delete video

### Clips Management
- `GET /clips/user` - Get user clips
- `GET /clips/:id` - Get clip details
- `DELETE /clips/:id` - Delete clip

### Jobs Management
- `POST /jobs/create` - Create processing job
- `GET /jobs/user` - Get user jobs
- `GET /jobs/:id` - Get job details

## Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **AWS S3** - File storage
- **youtube-dl-exec** - YouTube video downloading

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

## Project Structure

```
Server/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── models/          # Database models
├── routes/          # API routes
├── services/        # Business logic
├── middlewares/     # Custom middlewares
├── uploads/         # Local file storage
└── server.js        # Entry point
```

## License

MIT License - see LICENSE file for details.
