# Workout Tracker API

A comprehensive workout tracking API built with NestJS, TypeORM, and designed for serverless deployment on AWS Lambda.

## Features

- **User Authentication**: JWT-based authentication with signup, login, and profile management
- **Exercise Management**: Catalog of exercises with custom exercise creation
- **Workout Programs**: Create and manage workout programs with schedules
- **Session Logging**: Track workout sessions with sets, reps, weights, and RPE
- **Progress Analytics**: View progress over time with statistics and graphs
- **Search & History**: Powerful search using Elasticsearch
- **AI Coach**: AI-powered workout plan generation and recommendations using Groq
- **File Storage**: Upload progress photos and documents to S3
- **Caching**: Redis caching for improved performance

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with TypeORM
- **Caching**: Redis
- **Search**: Elasticsearch
- **File Storage**: AWS S3
- **AI**: Groq API
- **Deployment**: AWS Lambda with Serverless Framework

## Project Structure

```
src/
├── modules/          # Feature modules
│   ├── user/        # User authentication and profile
│   │   ├── use-cases/    # Business logic services
│   │   ├── tests/        # Unit tests
│   │   ├── model.ts      # TypeORM entity
│   │   ├── controller.ts # HTTP endpoints
│   │   └── module.ts     # NestJS module
│   ├── exercise/    # Exercise catalog
│   ├── program/     # Workout programs
│   ├── session/     # Workout sessions
│   ├── analytics/   # Progress tracking
│   ├── search/      # Elasticsearch integration
│   ├── ai-coach/    # AI recommendations
│   └── files/       # File management
├── services/        # Shared services
│   ├── redis.service.ts
│   ├── elasticsearch.service.ts
│   ├── s3.service.ts
│   ├── groq.service.ts
│   └── logger.service.ts
├── middlewares/     # Global middlewares
│   ├── logging.middleware.ts
│   └── error.middleware.ts
├── config/          # Configuration files
│   ├── env.config.ts
│   ├── database.config.ts
│   ├── redis.config.ts
│   ├── elasticsearch.config.ts
│   └── aws.config.ts
├── utils/           # Utility functions
│   ├── response.util.ts
│   ├── date.util.ts
│   └── validation.util.ts
├── app.module.ts    # Root module
└── main.ts          # Application entry point
```

## Prerequisites

- Node.js 20.x or higher
- PostgreSQL database
- Redis server
- Elasticsearch cluster
- AWS account with S3 access
- Groq API key

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd workout-tracker-api
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and fill in your configuration:
- Database credentials (PostgreSQL)
- Redis connection details
- Elasticsearch endpoint
- AWS credentials and S3 bucket name
- Groq API key
- JWT secrets

## Running the Application

### Development Mode

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000/api/v1`

### Production Mode

```bash
npm run build
npm run start:prod
```

### Serverless Offline (Local Lambda Simulation)

```bash
npm run serverless:offline
```

## Database Migrations

Generate a new migration:
```bash
npm run migration:generate -- src/migrations/MigrationName
```

Run migrations:
```bash
npm run migration:run
```

Revert last migration:
```bash
npm run migration:revert
```

## Deployment

### Deploy to AWS Lambda

Development:
```bash
npm run deploy:dev
```

Production:
```bash
npm run deploy:prod
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/signup` - Register a new user
- `POST /api/v1/auth/login` - Login and get JWT token
- `GET /api/v1/auth/me` - Get current user profile (protected)
- `PUT /api/v1/auth/profile` - Update user profile (protected)

### Other Modules

Additional endpoints will be available as you implement other modules (Exercise, Program, Session, Analytics, etc.)

## Testing

Run unit tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run test coverage:
```bash
npm run test:cov
```

Run e2e tests:
```bash
npm run test:e2e
```

## Environment Variables

See `.env.example` for all required environment variables.

Key variables:
- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`
- `ELASTICSEARCH_NODE`, `ELASTICSEARCH_USERNAME`, `ELASTICSEARCH_PASSWORD`
- `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`
- `GROQ_API_KEY`
- `JWT_SECRET`, `JWT_REFRESH_SECRET`

## Architecture Highlights

### Custom Module Pattern

Each module follows a consistent structure:
- **model.ts**: TypeORM entity definition
- **controller.ts**: NestJS controller with HTTP endpoints
- **module.ts**: NestJS module configuration
- **use-cases/**: Injectable services containing business logic
- **tests/**: Unit and integration tests

### Services Layer

Global services are available throughout the application:
- **RedisService**: Caching operations
- **ElasticsearchService**: Search and analytics
- **S3Service**: File upload/download
- **GroqService**: AI-powered features
- **LoggerService**: Structured logging

### Middleware

- **LoggingMiddleware**: HTTP request/response logging
- **GlobalExceptionFilter**: Standardized error handling

## Next Steps

To continue building the application:

1. **Implement remaining modules**: Exercise, Program, Session, Analytics, Search, AI Coach, Files
2. **Add comprehensive tests**: Unit tests for all use-cases
3. **Set up CI/CD**: Automated testing and deployment
4. **Add API documentation**: Swagger/OpenAPI documentation
5. **Implement rate limiting**: Protect API endpoints
6. **Add monitoring**: CloudWatch logs and metrics
7. **Database migrations**: Create migrations for all entities

## License

UNLICENSED

## Author

Your Name
