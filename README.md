# CodeVector Product Catalogue

A production-quality product catalogue application designed to handle a large feed of **200,000 products**. It implements fast, reliable, and stable **cursor (keyset) pagination** to query products newest-first, preventing skipped or duplicated results when concurrent updates occur.

The project consists of:
1. **Server API**: Built with Node.js, Express.js, MongoDB Atlas, and Mongoose.
2. **Frontend UI**: Built with React, Vite, and Tailwind CSS.

---

## Folder Structure

```text
codevector/
├── server/
│   ├── seed/
│   │   └── seed.js             # Seeding script for 200,000 products using insertMany()
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js           # Mongoose MongoDB connection
│   │   │   └── env.js          # Zod environment variable validator
│   │   ├── controllers/
│   │   │   └── product.controller.js # Cursor pagination and query logic
│   │   ├── models/
│   │   │   └── product.model.js # Product schema with compound indexes
│   │   ├── routes/
│   │   │   ├── index.js        # API route aggregator
│   │   │   └── product.routes.js # Endpoint routing mapping
│   │   └── server.js           # Express app setup and server listener
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── products.js     # API service and offline mock simulation
│   │   ├── components/
│   │   │   ├── CategoryFilter.jsx # Dropdown category selector
│   │   │   ├── EmptyState.jsx  # Nice empty state component
│   │   │   ├── ProductCard.jsx # Product card UI displaying details
│   │   │   └── ProductSkeleton.jsx # Pulse skeleton loaders
│   │   ├── App.jsx             # Main UI layout and manual pagination logic
│   │   └── main.jsx
│   ├── package.json
│   └── tailwind.config.js
└── package.json                # Root package.json managing script commands
```

---

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB Atlas, Mongoose, dotenv, @faker-js/faker
- **Frontend**: React (Vite), Tailwind CSS

---

## Installation

To install all dependencies for both the frontend and server, run the following command at the root of the repository:

```bash
npm run install:all
```

---

## Environment Variables

### Server Configuration
Create a `.env` file in the `server/` directory:

```ini
# MongoDB Connection URI (Local or Atlas)
MONGODB_URI="mongodb+srv://admin:<password>@cluster0.1tlgs3g.mongodb.net/codevector?appName=Cluster0"

# Server Port
PORT=5000

# Environment Mode
NODE_ENV=development

# Allowed CORS Origins (comma-separated frontend URLs)
CORS_ORIGINS="*"
```

### Frontend Configuration
The frontend automatically defaults to `http://localhost:5000/api` for local development. If needed, you can define `VITE_API_BASE_URL` in a `.env` file in the `frontend/` directory to override it.

---

## Seed Database

To seed exactly **200,000 products** into the MongoDB database in fast batches of 1,000 using Mongoose's `insertMany()`, run:

```bash
npm run seed
```

This drops the existing collection, generates realistic product names, prices, categories, and random creation dates using Faker, and completes in ~40 seconds.

---

## Run Project

Run both the frontend and server concurrently:

### 1. Start the Server API
```bash
npm run dev:server
```
The server will start on [http://localhost:5000](http://localhost:5000).

### 2. Start the React Frontend
```bash
npm run dev:frontend
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

---

## API Endpoints

All API endpoints are prefixed with `/api`.

### 1. GET `/api/products`
Retrieves a paginated list of products sorted by newest first.

- **Query Parameters**:
  - `limit` (optional, default: `20`, max: `100`): The number of products to return.
  - `category` (optional): Filter products by a specific category.
  - `cursor` (optional): The serialized cursor string (`createdAt_id`) returned from the previous request's `nextCursor`.

- **Response Format**:
```json
{
  "products": [
    {
      "_id": "64bc12...",
      "uniqueId": "5f1a-b3c4...",
      "name": "Handcrafted Keyboard",
      "category": "Electronics",
      "price": 129.99,
      "createdAt": "2026-06-23T12:00:00.000Z",
      "updatedAt": "2026-06-23T12:00:00.000Z"
    }
  ],
  "nextCursor": {
    "id": "64bc12...",
    "createdAt": "2026-06-23T12:00:00.000Z"
  },
  "hasMore": true
}
```

### 2. GET `/api/products/categories`
Retrieves a list of all distinct category names in the catalog.
