# Lab 5 – NorthStar Client Portal (EJS + AngularJS + MongoDB + File Storage)

This project demonstrates **two UI approaches** and **two persistence approaches** in one Express app:

## ✅ UI Layer
- **EJS (Server-Side Rendering)** pages for classic SSR routes
- **AngularJS (Client-Side SPA)** served under `/app`

## ✅ Persistence Layer
- **File-based persistence** using `backend/data/clients.json`
- **MongoDB persistence** using **Mongoose** (when MongoDB is running)

> Writes are done **to the JSON file always** and also **to MongoDB if available**.
> Reads prefer MongoDB when connected, otherwise fall back to the JSON file.

---

## 1) Prerequisites
- Node.js (v18+ recommended)
- (Optional but recommended) MongoDB running locally

If you have MongoDB locally, start it and keep it running.

Default Mongo URI used by the app:
```
mongodb://127.0.0.1:27017/northstar_lab5
```

You can override it with:
```
set MONGO_URI=mongodb://127.0.0.1:27017/northstar_lab5
```

---

## 2) Install & Run

```bash
cd backend
npm install
npm start
```

Server:
- SSR (EJS): `http://localhost:3000/clients`
- AngularJS: `http://localhost:3000/app`
- API: `http://localhost:3000/api/clients`

---

## 3) API Endpoints
These are used by AngularJS and can also be tested in Postman.

- `GET /api/clients` → list
- `GET /api/clients/:id` → details
- `POST /api/clients` → create
- `PUT /api/clients/:id` → update
- `DELETE /api/clients/:id` → delete

Payload example:
```json
{
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "riskCategory": "Medium"
}
```

---

## 4) Notes (Mongo + File Together)
- If MongoDB is **connected**, the app will try to **seed MongoDB from the JSON file** if Mongo is empty.
- If MongoDB is **not connected**, everything still works using the JSON file.
