# ThreatFox IOC API

A full-featured RESTful API for managing ThreatFox Indicators of Compromise (IOCs) with authentication, authorization, and a modern web interface.

LIVE AT https://threat-intel-final-production.up.railway.app

## Features

### Core Functionality
- **3 Resource Types**: SHA256 hashes, malicious URLs, and IP:Port combinations
- **Full CRUD Operations**: Create, Read, Update, and Delete for all resources
- **Advanced Filtering**: Query by threat type, malware, reporter, and confidence level
- **Pagination**: Efficient data retrieval with customizable page sizes
- **Data Validation**: Automatic validation of IOC formats and constraints

### Security & Authentication
- **JWT Authentication**: Secure token-based authentication
- **User Registration & Login**: Complete user management system
- **Password Hashing**: Bcrypt encryption for secure password storage
- **Role-Based Access Control (RBAC)**: 4 user roles with different permissions
  - **Public**: Read-only access to high-confidence IOCs
  - **Analyst**: Full read access to all IOCs
  - **Researcher**: Create and update IOCs
  - **Admin**: Full access including delete operations

### Additional Features
- **Web UI**: Clean, modern interface for browsing IOCs
- **Error Handling**: Comprehensive error responses with meaningful messages
- **Testing**: 40+ unit tests covering CRUD, auth, and authorization
- **Production Ready**: Deployment configuration for Render
- **API Documentation**: Complete endpoint documentation with examples

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite with Sequelize ORM
- **Authentication**: JWT (jsonwebtoken) + bcryptjs
- **Testing**: Jest + Supertest
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Environment**: dotenv for configuration
- **CORS**: Enabled for cross-origin requests

## Project Structure

```
threatfox-ioc-api/
├── database/
│   ├── models/
│   │   ├── Sha256.js       # SHA256 hash model
│   │   ├── Url.js          # URL model
│   │   ├── IpPort.js       # IP:Port model
│   │   ├── User.js         # User model with auth
│   │   └── index.js        # Model exports
│   ├── config.js           # Database configuration
│   ├── setup.js            # Database initialization script
│   └── seed.js             # Data seeding script
├── routes/
│   ├── authRoutes.js       # Authentication endpoints
│   ├── sha256Routes.js     # SHA256 CRUD endpoints (protected)
│   ├── urlRoutes.js        # URL CRUD endpoints (protected)
│   └── ipPortRoutes.js     # IP:Port CRUD endpoints (protected)
├── middleware/
│   ├── auth.js             # JWT authentication & authorization
│   ├── logger.js           # Request logging
│   └── errorHandler.js     # Error handling
├── public/
│   ├── index.html          # Web UI
│   ├── styles.css          # Styling
│   └── app.js              # Frontend JavaScript
├── tests/
│   ├── auth.test.js        # Authentication & authorization tests
│   ├── sha256.test.js      # SHA256 CRUD tests
│   ├── url.test.js         # URL CRUD tests
│   └── ipPort.test.js      # IP:Port CRUD tests
├── server.js               # Main application entry point
├── package.json            # Dependencies and scripts
├── render.yaml             # Render deployment config
├── .env.example            # Environment variables template
└── .gitignore              # Git ignore rules
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sdgsdgfsd
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set your `JWT_SECRET`:
   ```env
   PORT=3000
   NODE_ENV=development
   DB_PATH=./database/threatfox.db
   JWT_SECRET=your-super-secret-jwt-key-change-this
   JWT_EXPIRES_IN=7d
   ```

4. **Set up the database**
   ```bash
   npm run setup
   ```

5. **Seed the database with CSV data**
   ```bash
   npm run seed
   ```
   This will import data from:
   - `full_sha256.csv` (~7,000 SHA256 hashes)
   - `full_urls.csv` (~12,000 malicious URLs)
   - `full_ip-port.csv` (~51,000 IP:Port combinations)

6. **Start the server**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

7. **Run tests**
   ```bash
   npm test
   ```

The API will be available at `http://localhost:3000`

The Web UI will be available at `http://localhost:3000/index.html`

## API Documentation

### Base URL
```
http://localhost:3000
```

### Root Endpoint

#### GET /api
Returns API information and available endpoints.

**Response:**
```json
{
  "message": "ThreatFox IOC API",
  "version": "2.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "sha256": "/api/sha256",
    "urls": "/api/urls",
    "ipports": "/api/ipports"
  },
  "documentation": "See README.md for full API documentation"
}
```

---

## Authentication Endpoints

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "analyst",
    "isActive": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /api/auth/login
Login with existing credentials.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "analyst"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### GET /api/auth/me
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "role": "analyst",
  "isActive": true
}
```

### PUT /api/auth/me
Update current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "username": "newusername",
  "email": "newemail@example.com"
}
```

### PUT /api/auth/change-password
Change user password (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

---

## SHA256 Hash Endpoints

**Note:** POST, PUT, DELETE operations require authentication and appropriate role permissions.

### GET /api/sha256
Retrieve all SHA256 hashes with pagination and filtering.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `threat_type` (optional): Filter by threat type
- `malware` (optional): Filter by malware name (partial match)
- `reporter` (optional): Filter by reporter name
- `min_confidence` (optional): Minimum confidence level (0-100)

**Example Request:**
```bash
GET /api/sha256?page=1&limit=10&threat_type=payload&min_confidence=90
```

**Response:**
```json
{
  "total": 150,
  "page": 1,
  "limit": 10,
  "data": [
    {
      "id": 1,
      "ioc_id": "1667148",
      "ioc_value": "4ac33e95d7d1bf205c8bd021886a8edc5d405d65389edb3b0c65d62c12ace47d",
      "threat_type": "payload",
      "malware": "win.stealc",
      "malware_printable": "Stealc",
      "confidence_level": 95,
      "first_seen_utc": "2025-12-04T06:09:51.000Z",
      "last_seen_utc": null,
      "reference": "https://analytics.dugganusa.com/api/v1/stix-feed",
      "tags": "dugganusa,github,pattern-38,stealc,supply-chain",
      "reporter": "duggusa",
      "createdAt": "2025-12-07T15:30:00.000Z",
      "updatedAt": "2025-12-07T15:30:00.000Z"
    }
  ]
}
```

### GET /api/sha256/:id
Retrieve a single SHA256 hash by ID.

**Example Request:**
```bash
GET /api/sha256/1
```

**Response:**
```json
{
  "id": 1,
  "ioc_id": "1667148",
  "ioc_value": "4ac33e95d7d1bf205c8bd021886a8edc5d405d65389edb3b0c65d62c12ace47d",
  "threat_type": "payload",
  "malware": "win.stealc",
  "malware_printable": "Stealc",
  "confidence_level": 95,
  "first_seen_utc": "2025-12-04T06:09:51.000Z",
  "last_seen_utc": null,
  "reference": "https://analytics.dugganusa.com/api/v1/stix-feed",
  "tags": "dugganusa,github,pattern-38,stealc,supply-chain",
  "reporter": "duggusa",
  "createdAt": "2025-12-07T15:30:00.000Z",
  "updatedAt": "2025-12-07T15:30:00.000Z"
}
```

**Error Response (404):**
```json
{
  "error": "Not Found",
  "message": "SHA256 hash not found"
}
```

### POST /api/sha256
Create a new SHA256 hash entry.

**Request Body:**
```json
{
  "ioc_id": "TEST001",
  "ioc_value": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "threat_type": "payload",
  "malware": "test.malware",
  "malware_printable": "Test Malware",
  "confidence_level": 95,
  "first_seen_utc": "2025-12-07T10:00:00.000Z",
  "reporter": "test_user",
  "tags": "test,sample",
  "reference": "https://example.com/reference"
}
```

**Response (201):**
```json
{
  "id": 101,
  "ioc_id": "TEST001",
  "ioc_value": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "threat_type": "payload",
  "malware": "test.malware",
  "malware_printable": "Test Malware",
  "confidence_level": 95,
  "first_seen_utc": "2025-12-07T10:00:00.000Z",
  "reporter": "test_user",
  "tags": "test,sample",
  "reference": "https://example.com/reference",
  "createdAt": "2025-12-07T15:30:00.000Z",
  "updatedAt": "2025-12-07T15:30:00.000Z"
}
```

**Error Response (400):**
```json
{
  "error": "Validation Error",
  "message": "Validation len on ioc_value failed"
}
```

### PUT /api/sha256/:id
Update an existing SHA256 hash entry.

**Request Body:**
```json
{
  "confidence_level": 100,
  "tags": "updated,verified"
}
```

**Response (200):**
```json
{
  "id": 1,
  "ioc_id": "1667148",
  "ioc_value": "4ac33e95d7d1bf205c8bd021886a8edc5d405d65389edb3b0c65d62c12ace47d",
  "threat_type": "payload",
  "malware": "win.stealc",
  "malware_printable": "Stealc",
  "confidence_level": 100,
  "first_seen_utc": "2025-12-04T06:09:51.000Z",
  "last_seen_utc": null,
  "reference": "https://analytics.dugganusa.com/api/v1/stix-feed",
  "tags": "updated,verified",
  "reporter": "duggusa",
  "createdAt": "2025-12-07T15:30:00.000Z",
  "updatedAt": "2025-12-07T16:00:00.000Z"
}
```

### DELETE /api/sha256/:id
Delete a SHA256 hash entry.

**Response (204):**
No content

**Error Response (404):**
```json
{
  "error": "Not Found",
  "message": "SHA256 hash not found"
}
```

---

## URL Endpoints

### GET /api/urls
Retrieve all URLs with pagination and filtering.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `threat_type` (optional): Filter by threat type
- `malware` (optional): Filter by malware name (partial match)
- `reporter` (optional): Filter by reporter name
- `min_confidence` (optional): Minimum confidence level (0-100)

**Example Request:**
```bash
GET /api/urls?threat_type=payload_delivery&limit=20
```

**Response:**
```json
{
  "total": 85,
  "page": 1,
  "limit": 20,
  "data": [
    {
      "id": 1,
      "ioc_id": "1668950",
      "ioc_value": "http://195.133.9.204/skare.odd",
      "threat_type": "payload_delivery",
      "malware": "unknown",
      "malware_printable": "Unknown malware",
      "confidence_level": 100,
      "first_seen_utc": "2025-12-07T13:05:49.000Z",
      "last_seen_utc": null,
      "reference": "",
      "tags": "ClickFix,Fake OS Update,xHamster",
      "reporter": "HuntYethHounds",
      "createdAt": "2025-12-07T15:30:00.000Z",
      "updatedAt": "2025-12-07T15:30:00.000Z"
    }
  ]
}
```

### GET /api/urls/:id
Retrieve a single URL by ID.

**Example Request:**
```bash
GET /api/urls/1
```

### POST /api/urls
Create a new URL entry.

**Request Body:**
```json
{
  "ioc_id": "TEST_URL001",
  "ioc_value": "http://malicious-site.com/payload",
  "threat_type": "payload_delivery",
  "malware": "test.malware",
  "malware_printable": "Test Malware",
  "confidence_level": 90,
  "first_seen_utc": "2025-12-07T10:00:00.000Z",
  "reporter": "test_user"
}
```

**Response (201):**
Returns the created URL object.

### PUT /api/urls/:id
Update an existing URL entry.

### DELETE /api/urls/:id
Delete a URL entry.

---

## IP:Port Endpoints

### GET /api/ipports
Retrieve all IP:Port combinations with pagination and filtering.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `threat_type` (optional): Filter by threat type
- `malware` (optional): Filter by malware name (partial match)
- `reporter` (optional): Filter by reporter name
- `min_confidence` (optional): Minimum confidence level (0-100)

**Example Request:**
```bash
GET /api/ipports?threat_type=botnet_cc&min_confidence=75
```

**Response:**
```json
{
  "total": 200,
  "page": 1,
  "limit": 50,
  "data": [
    {
      "id": 1,
      "ioc_id": "1668961",
      "ioc_value": "138.226.236.41:8443",
      "threat_type": "botnet_cc",
      "malware": "elf.mirai",
      "malware_printable": "Mirai",
      "confidence_level": 75,
      "first_seen_utc": "2025-12-07T15:06:25.000Z",
      "last_seen_utc": null,
      "reference": "https://bazaar.abuse.ch/sample/6a1f3f2805f56b4e7fcf6e8c15542754442b33af9451ff300d446a24b5289e4b/",
      "tags": "Mirai",
      "reporter": "abuse_ch",
      "createdAt": "2025-12-07T15:30:00.000Z",
      "updatedAt": "2025-12-07T15:30:00.000Z"
    }
  ]
}
```

### GET /api/ipports/:id
Retrieve a single IP:Port by ID.

**Example Request:**
```bash
GET /api/ipports/1
```

### POST /api/ipports
Create a new IP:Port entry.

**Request Body:**
```json
{
  "ioc_id": "TEST_IP001",
  "ioc_value": "192.168.1.1:8080",
  "threat_type": "botnet_cc",
  "malware": "test.malware",
  "malware_printable": "Test Malware",
  "confidence_level": 85,
  "first_seen_utc": "2025-12-07T10:00:00.000Z",
  "reporter": "test_user"
}
```

**Response (201):**
Returns the created IP:Port object.

### PUT /api/ipports/:id
Update an existing IP:Port entry.

### DELETE /api/ipports/:id
Delete an IP:Port entry.

---

## Error Responses

The API uses standard HTTP status codes and returns errors in JSON format:

### 400 Bad Request
```json
{
  "error": "Validation Error",
  "message": "Validation len on ioc_value failed"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 409 Conflict
```json
{
  "error": "Duplicate Entry",
  "message": "A record with this value already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

## Data Models

### SHA256 Hash
- `id`: Integer (Primary Key)
- `ioc_id`: String (Unique)
- `ioc_value`: String (64 characters, hex)
- `threat_type`: String
- `malware`: String (nullable)
- `malware_printable`: String (nullable)
- `confidence_level`: Integer (0-100)
- `first_seen_utc`: Date
- `last_seen_utc`: Date (nullable)
- `reference`: Text (nullable)
- `tags`: Text (nullable)
- `reporter`: String

### URL
- `id`: Integer (Primary Key)
- `ioc_id`: String (Unique)
- `ioc_value`: Text (Valid URL)
- `threat_type`: String
- `malware`: String (nullable)
- `malware_printable`: String (nullable)
- `confidence_level`: Integer (0-100)
- `first_seen_utc`: Date
- `last_seen_utc`: Date (nullable)
- `reference`: Text (nullable)
- `tags`: Text (nullable)
- `reporter`: String

### IP:Port
- `id`: Integer (Primary Key)
- `ioc_id`: String (Unique)
- `ioc_value`: String (Format: IP:Port)
- `threat_type`: String
- `malware`: String (nullable)
- `malware_printable`: String (nullable)
- `confidence_level`: Integer (0-100)
- `first_seen_utc`: Date
- `last_seen_utc`: Date (nullable)
- `reference`: Text (nullable)
- `tags`: Text (nullable)
- `reporter`: String

## Role-Based Access Control

### Permission Matrix

| Operation | Public | Analyst | Researcher | Admin |
|-----------|--------|---------|------------|-------|
| GET (View IOCs) | ✅ | ✅ | ✅ | ✅ |
| POST (Create IOCs) | ❌ | ❌ | ✅ | ✅ |
| PUT (Update IOCs) | ❌ | ❌ | ✅ | ✅ |
| DELETE (Remove IOCs) | ❌ | ❌ | ❌ | ✅ |
| User Management | ❌ | ❌ | ❌ | ✅ |

### Role Descriptions

- **Public**: Unauthenticated users or basic read-only access
- **Analyst**: Security analysts who need to view and query IOC data
- **Researcher**: Threat researchers who can contribute new IOCs and update existing ones
- **Admin**: Full system access including deletion and user management

## Testing

Run the test suite:
```bash
npm test
```

Test coverage includes:
- **Authentication**: Registration, login, profile management, password changes
- **Authorization**: Role-based access control for all protected endpoints
- **CRUD Operations**: Create, read, update, delete for all resource types
- **Error Handling**: Validation errors, authentication failures, not found errors
- **Edge Cases**: Duplicate entries, invalid data formats, missing required fields

Total: 40+ unit tests

## Deployment

### Deploy to Render

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Complete ThreatFox IOC API"
   git push origin main
   ```

2. **Create a new Web Service on Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will auto-detect the `render.yaml` configuration

3. **Set Environment Variables**
   - `JWT_SECRET` will be auto-generated
   - Verify `NODE_ENV=production`

4. **Deploy**
   - Render will automatically:
     - Install dependencies
     - Set up the database
     - Seed with IOC data
     - Start the server

5. **Access your API**
   - Your API will be available at: `https://your-app-name.onrender.com`
   - Web UI: `https://your-app-name.onrender.com/index.html`

### Manual Deployment

For other platforms, ensure you:
1. Set all environment variables from `.env.example`
2. Run `npm install`
3. Run `npm run setup` to create database tables
4. Run `npm run seed` to populate with IOC data
5. Run `npm start` to start the server

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
DB_PATH=./database/threatfox.db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

**Important**: Never commit your `.env` file. Use `.env.example` as a template.

## Web UI Usage

1. **Access the UI**: Navigate to `http://localhost:3000/index.html`
2. **Register/Login**: Click "Login" in the navigation to create an account
3. **Browse IOCs**: Use the navigation to view SHA256 hashes, URLs, or IP:Port combinations
4. **Filter & Search**: Use the search and filter options to find specific IOCs
5. **View Stats**: The home page shows total counts for each IOC type

## API Usage Examples

### Using cURL

**Register a new user:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"researcher1","email":"researcher@example.com","password":"secure123"}'
```

**Login and get token:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"researcher@example.com","password":"secure123"}'
```

**Query IOCs with authentication:**
```bash
curl -X GET "http://localhost:3000/api/sha256?limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Create a new IOC (requires researcher/admin role):**
```bash
curl -X POST http://localhost:3000/api/sha256 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "ioc_id":"CUSTOM001",
    "ioc_value":"a1b2c3d4e5f6...",
    "threat_type":"payload",
    "confidence_level":95,
    "first_seen_utc":"2025-12-07T10:00:00Z",
    "reporter":"researcher1"
  }'
```

## License

MIT

## Data Source

This project uses data from [ThreatFox](https://threatfox.abuse.ch/) by abuse.ch.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## Support

For issues or questions:
- Create an issue on GitHub
- Check existing documentation
- Review test files for usage examples
