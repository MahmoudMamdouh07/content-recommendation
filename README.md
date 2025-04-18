# Personalized Content Recommendation System

A robust recommendation system that provides personalized content suggestions based on user interactions, preferences, and content metadata.

## Features

- **User Interactions Tracking**: Records when users view, like, bookmark, or rate content
- **Content-Based Recommendation Algorithm**: Suggests content based on user's past interactions and preferences
- **RESTful API**: Clean, well-documented API endpoints with robust error handling
- **Joi Validation**: Request validation using Joi schema validation
- **Caching**: Redis integration for improved performance
- **MongoDB Storage**: Persistent data storage for users, content, and interactions

## Tech Stack

- **Backend**: Node.js with Express
- **Language**: TypeScript
- **Database**: MongoDB
- **Caching**: Redis
- **Validation**: Joi
- **Testing**: Jest with ts-jest

## Prerequisites

- Node.js (v20.12.2)
- MongoDB (local or remote)
- Docker desktop
- Redis (docker run -p 6379:6379 redis) running redis locally on port 6379

## Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd recommendation-system
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a .env file based on .env.example
   ```
   cp .env.example .env
   ```

4. Edit the .env file with your MongoDB and Redis connection details

## Running the Project

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build the Project**
   ```bash
   npm run build
   ```

3. **Start the Server**
   ```bash
   npm start
   ```

4. **Development Mode**
   ```bash
   npm run dev
   ```

## Testing

Run the test suite:
```
npm test
```

Run tests in watch mode:
```
npm run test:watch
```

## Building for Production

Build the TypeScript code:
```
npm run build
```

Start the production server:
```
npm start
```

## API Endpoints

### Record a User Interaction

```
POST /api/interactions
```

Request body:
```json
{
  "userId": "user-uuid",
  "contentId": "content-uuid",
  "type": "view|like|bookmark|rate",
  "rating": 5 // Optional, required for "rate" type, 1-5 stars
}
```

### Get User's Interactions

```
GET /api/interactions/user/:userId
```

Query parameters:
- `type`: Optional filter by interaction type

### Get Personalized Recommendations

```
GET /api/recommendations/:userId
```

Query parameters:
- `limit`: Maximum number of recommendations to return (default: 10)
- `type`: Content type filter (e.g., "article", "video")
- `tags`: Tags to filter by, comma-separated (e.g., "technology,science")

### Filter Content

```
GET /api/recommendations/content/filter
```

Query parameters:
- `type`: Content type filter (e.g., "article", "video")
- `tags`: Tags to filter by, comma-separated (e.g., "technology,science")
- `limit`: Maximum number of results to return (default: 10)
- `offset`: Pagination offset (default: 0)

## Data Models

### User Model
- `id`: UUID - Unique identifier
- `username`: String - Username
- `preferences`: String[] - Array of tags representing preferences

### Content Model
- `id`: UUID - Unique identifier
- `title`: String - Content title
- `type`: String - Content type (e.g., "article", "video")
- `tags`: String[] - Content tags
- `popularity`: Number - Popularity score
- `createdAt`: Date - Creation date

### Interaction Model
- `userId`: String - User UUID
- `contentId`: String - Content UUID
- `type`: String - Interaction type (view, like, bookmark, rate)
- `timestamp`: Date - Interaction time
- `rating`: Number - Optional rating (1-5 stars)

## Validation

All API endpoints are validated using Joi validation middleware:

- Request validation with detailed error messages
- Automatic type conversion and normalization
- Cross-field validation (e.g., rating required only for 'rate' interactions)

## License

ISC

## API Usage

### Sign Up User
- **Route**: `POST /api/auth/signup`
- **Input**:
  ```json
  {
    "username": "string",
    "password": "string",
    "preferences": ["string"]
  }
  ```
- **Output**:
  ```json
  {
    "status": "success",
    "message": "User created successfully",
    "body": {
      "id": "string",
      "username": "string",
      "preferences": ["string"]
    }
  }
  ```

### Sign In User
- **Route**: `POST /api/auth/signin`
- **Input**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Output**:
  ```json
  {
    "status": "success",
    "message": "User authenticated successfully",
    "body": {
      "token": "string",
      "username": "string"
    }
  }
  ```

### Add Content (Admin Only) (after signup a new user, change the role from database to admin)(can be optimized later on by adding a route to add employees or admins by an existing admin)
- **Route**: `POST /api/content`
- **Input**:
  ```json
  {
    "title": "string",
    "type": "string",
    "tags": ["string"]
  }
  ```
- **Output**:
  ```json
  {
    "status": "success",
    "message": "Content created successfully",
    "body": {
      "id": "string",
      "title": "string",
      "type": "string",
      "tags": ["string"]
    }
  }
  ```

### Add Interaction
- **Route**: `POST /api/interactions`
- **Input**:
  ```json
  {
    "userId": "string",
    "contentId": "string",
    "type": "string",
    "duration": "number" // Optional, for view interactions
  }
  ```
- **Output**:
  ```json
  {
    "status": "success",
    "message": "Interaction recorded successfully",
    "body": {
      "id": "string",
      "userId": "string",
      "contentId": "string",
      "type": "string"
    }
  }
  ``` 