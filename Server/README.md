# 🚀 Bike Servicing Management API
### 📋 Summary

The Bike Servicing Management API is a backend service built to manage operations at a bike servicing center. It supports full CRUD functionality for users, bikes, and service records, while also offering special endpoints for assigning and completing services. Built with modern web technologies, this system ensures streamlined service tracking, user management, and overdue service monitoring.
### 🔗Live links
- #### live Link - `https://assignment-8-alpha-blond.vercel.app/`
- #### Repo Link - `https://github.com/sajib9988/Assignment-8`

### ⚒️Setup Guide
- `Clone this Repo`
```
git clone https://github.com/sajib9988/Assignment-8.git
```
- `Change Directory and install dependency`
```bash
cd /assignment-8-bike-service-server
npm install
```
- `Create a .env and replace values`
```bash
DATABASE_URL="your db url"
PORT = 5000
```

- `Now run your server`
```bash
npm run dev
```
### 🧰 Tech Stack

- Backend Runtime: Node.js

- Framework: Express.js

- Language: TypeScript

- Database: PostgreSQL

- ORM: Prisma ORM

- Validation: Zod

- UUID Handling: Prisma native UUID support

- Date Utility: date-fns

### ✨ Key Features
#### 🧑‍💼 user Management

- Add new users
- View all users or a single user
- Update user info
- Delete user records

#### 🏍️ Bike Management

- Register new bikes
- View all bikes or by ID
- Relate bikes to specific users

#### 🛠️ Service Record Management

- Create new service records
- Fetch all or individual service records
- Mark services as completed with optional custom completion date

#### ⏳ Special: Overdue & Pending Service Tracking

##### Get all services that are:

- "pending" or "in-progress"
- And were created more than 7 days ago

#### 🧯 Global Error Handling

- Consistent response structure for errors
- Optional stack trace in development mode
