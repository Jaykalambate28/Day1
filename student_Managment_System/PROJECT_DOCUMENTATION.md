# Project Documentation: Student Management System

---

## 📖 Overview

This document provides a comprehensive guide to the **Student Management System** built with **Nuxt 4** (Vue 3) and **MySQL**. It covers the architecture, setup instructions, database schema, API endpoints, front‑end components, the newly added **photo upload** feature, and recommendations for further improvements.

---

## 🚀 Technology Stack

- **Frontend**: Vue 3 (Composition API) with Nuxt 4 (Nitro server‑side rendering)
- **Backend**: Nuxt Nitro API routes (`server/api/...`)
- **Database**: MySQL (`student_db`)
- **Styling**: Scoped vanilla CSS within Vue components
- **Package Manager**: npm

---

## 📁 Project Structure

```
student_Management_System/
├── nuxt.config.js               # Global Nuxt configuration (runtime config, modules, etc.)
├── package.json                # Dependencies & npm scripts
├── pages/                      # Nuxt auto‑routing for Vue pages
│   ├── index.vue               # Simple admin login page
│   └── dashboard.vue           # Main CRUD UI, student list, stats, photo upload UI
├── public/                     # Static assets served as‑is
│   └── uploads/                # **Generated** folder for student photos (created at runtime)
├── server/                     # Server‑side Nitro handlers
│   ├── utils/                  # Helper utilities
│   │   └── db.js               # MySQL connection‑pool wrapper
│   └── api/                    # RESTful endpoints for `/api/students`
│       ├── index.get.js        # GET all students
│       ├── index.post.js       # POST new student (multipart for photos)
│       ├── [id].put.js         # PUT update student (multipart support)
│       └── [id].delete.js      # DELETE student (removes photo file)
└── ...                         # Other Nuxt generated directories (node_modules, .nuxt, etc.)
```

---

## 🛠️ Setup & Development

1. **Clone the repository** (if not already local)
   ```bash
   git clone <repo‑url>
   cd student_Managment_System
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure the database**
   - Ensure MySQL is running locally (default host `localhost`, port `3306`).
   - Create the database and tables (see **Database Schema** section).
   - Optionally, copy the runtime config from `nuxt.config.js` to environment variables or update the hard‑coded values in `server/utils/db.js` to match your credentials.
4. **Run the development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.
5. **Hot‑reloading** – Changes to Vue components or API routes are reflected automatically.

---

## 📚 Database Schema

### 1. Database Creation
```sql
CREATE DATABASE IF NOT EXISTS student_db;
USE student_db;
```

### 2. `student` Table (with photo column)
```sql
CREATE TABLE IF NOT EXISTS student (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) DEFAULT '',
  course VARCHAR(255) DEFAULT '',
  admission_date DATE NOT NULL,
  photo VARCHAR(255) DEFAULT NULL   -- Stores relative path e.g. /uploads/abc.png
);
```
> **Note** – The `photo` column was added by the *photo upload* feature (see Implementation Plan).

---

## 📡 API Endpoints

| Method | Route | Description | File |
|--------|-------|-------------|------|
| **GET** | `/api/students` | Retrieve all student records (ordered by newest first) | [index.get.js](file:///p:/internship/Day1/student_Managment_System/server/api/students/index.get.js) |
| **POST** | `/api/students` | Create a new student. Accepts multipart/form‑data for optional photo upload. | [index.post.js](file:///p:/internship/Day1/student_Managment_System/server/api/students/index.post.js) |
| **PUT** | `/api/students/:id` | Update an existing student. Supports multipart/form‑data to replace the photo. | [\[id\].put.js](file:///p:/internship/Day1/student_Managment_System/server/api/students/[id].put.js) |
| **DELETE** | `/api/students/:id` | Delete a student and remove the associated photo file from `public/uploads/`. | [\[id\].delete.js](file:///p:/internship/Day1/student_Managment_System/server/api/students/[id].delete.js) |

### Request/Response Examples

**POST (Create) – multipart**
```http
POST /api/students HTTP/1.1
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...

------WebKitFormBoundary...
Content-Disposition: form-data; name="name"

John Doe
------WebKitFormBoundary...
Content-Disposition: form-data; name="email"

john@example.com
------WebKitFormBoundary...
Content-Disposition: form-data; name="photo"; filename="john.png"
Content-Type: image/png

...binary data...
------WebKitFormBoundary--
```
**Response** (JSON)
```json
{ "id": 12, "name": "John Doe", "email": "john@example.com", "photo": "/uploads/1709231234567.png", ... }
```

---

## 🎨 Front‑End Overview (`pages/dashboard.vue`)

- **Stats Card** – Shows total number of students (`students.length`).
- **Live Search** – Computed `filteredStudents` updates instantly as the user types.
- **Add Student Form** – Includes an `<input type="file" accept="image/*">` for photo uploads. Uses `FormData` to send multipart data.
- **Edit Modal** – Mirrors the add form, allowing photo replacement.
- **Student Table** – New **Photo** column renders a circular avatar. If `photo` is missing, a styled initials placeholder is shown.
- **UX Touches** – Success/error toast notifications fade after 3 seconds.

> The UI code modifications can be inspected in [dashboard.vue](file:///p:/internship/Day1/student_Managment_System/pages/dashboard.vue).

---

## 📸 Photo Upload Feature (Implementation Summary)

1. **Database** – Added `photo VARCHAR(255)` column (see Implementation Plan).
2. **Backend** – Updated `index.post.js` and `[id].put.js` to:
   - Parse multipart form‑data via `readMultipartFormData`.
   - Store uploaded files under `public/uploads/` with a timestamp‑based unique name.
   - Save the relative file path in the `photo` column.
   - On updates, delete the previous photo file to avoid orphaned assets.
   - On delete, remove the stored image from disk.
3. **Frontend** – Added file input, preview logic, and FormData handling for both create and update actions.
4. **Static Serving** – Nuxt automatically serves files from `public/`; thus, a stored path like `/uploads/abc.png` is reachable via `http://localhost:3000/uploads/abc.png`.

---

## 📦 Verification & Testing

1. **Schema Verification** – Confirm the `photo` column exists:
   ```sql
   DESCRIBE student;
   ```
2. **Manual UI Test** – Add a student with a photo, verify:
   - Image appears in the table avatar column.
   - Image file exists under `public/uploads/`.
   - Editing the student replaces the photo and removes the old file.
   - Deleting the student also removes the associated file.
3. **Automated Checks** – (Optional) Write integration tests using `@nuxt/test-utils` to POST multipart data and assert DB/file side‑effects.

---

## ⚠️ Known Discrepancies & Recommendations (from Code Explanation)

- **Hard‑coded DB credentials** – `server/utils/db.js` currently uses static credentials. Replace with `useRuntimeConfig()` to read values from `nuxt.config.js` or environment variables.
- **Dead files** – `server/api/students/put.js` and `delete.js` are legacy and unused. They can be safely removed.
- **Missing route protection** – The `/dashboard` page is publicly accessible. Implement a simple middleware (e.g., `auth.global.js`) or server‑side session check to restrict access.
- **Unused fetch in login page** – The call to `/api/users` does not exist; delete it to avoid 404 noise.

---

## 📈 Future Enhancements

- **Authentication & Authorization** – JWT or session‑based login, route guards.
- **Responsive Design** – Enhance UI for mobile devices (currently desktop‑centric).
- **Image Optimization** – Resize/compress uploads on the server to reduce storage.
- **Dockerization** – Containerize the app and MySQL for easier deployment.
- **CI/CD Pipeline** – Add GitHub Actions for linting, unit tests, and automated deployment.

---

*Generated by Antigravity AI on $(date)*
