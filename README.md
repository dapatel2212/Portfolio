# PortfolioHub — Full Stack Portfolio Platform

A multi-user portfolio platform where users build professional profiles, upload certificates, and share a unique link with interviewers. Interviewers can contact users directly through their portfolio, and the message lands in the user's Gmail inbox.

---

## 🗂 Project Structure

```
portfolio-platform/
│
├── backend/                    ← Node.js + Express REST API
│   ├── config/
│   │   ├── db.js               ← PostgreSQL connection
│   │   ├── cloudinary.js       ← File upload config (certs, photos)
│   │   ├── mailer.js           ← Gmail SMTP + email templates
│   │   └── schema.sql          ← Database schema (run once)
│   ├── middleware/
│   │   └── auth.js             ← JWT verify + isAdmin guard
│   ├── routes/
│   │   ├── auth.js             ← Register, login, me, change-password
│   │   ├── profile.js          ← Get/update profile, photo upload, public view
│   │   ├── certificates.js     ← Upload, list, update, delete certs
│   │   ├── projects.js         ← CRUD for projects
│   │   ├── contact.js          ← Contact form → Gmail + message inbox
│   │   └── admin.js            ← Admin: users, verify certs, analytics
│   ├── .env.example            ← Copy to .env and fill values
│   ├── package.json
│   └── server.js               ← Express app entry point
│
└── frontend/                   ← Next.js 14 app
    ├── src/
    │   ├── lib/
    │   │   ├── api.js           ← All API call functions
    │   │   └── auth.js          ← AuthContext + useAuth hook
    │   ├── components/
    │   │   └── user/
    │   │       └── Sidebar.js   ← Sidebar nav (user + admin)
    │   ├── styles/
    │   │   └── globals.css      ← Design system, CSS variables
    │   └── pages/
    │       ├── index.js                    ← Landing page
    │       ├── login.js                    ← Login
    │       ├── register.js                 ← Register
    │       ├── dashboard/
    │       │   ├── index.js                ← User dashboard home
    │       │   ├── profile.js              ← Edit profile + photo
    │       │   ├── certificates.js         ← Upload & manage certs
    │       │   ├── projects.js             ← Add & manage projects
    │       │   ├── inbox.js                ← Read contact messages
    │       │   └── share.js                ← Shareable link + QR code
    │       ├── portfolio/
    │       │   └── [slug].js               ← Public portfolio page
    │       └── admin/
    │           └── index.js                ← Admin dashboard
    ├── .env.local.example
    ├── next.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## ⚙️ Tech Stack

| Layer        | Technology              | Purpose                              |
|--------------|-------------------------|--------------------------------------|
| Frontend     | Next.js 14 (React)      | UI, routing, public pages (SSR/CSR)  |
| Styling      | Tailwind CSS + CSS Vars | Utility styling + design system      |
| Backend      | Node.js + Express       | REST API, auth, file handling        |
| Database     | PostgreSQL               | Users, profiles, certs, messages     |
| File Storage | Cloudinary               | Certificate PDF/images, photos       |
| Auth         | JWT + bcryptjs           | Stateless authentication             |
| Email        | Nodemailer + Gmail SMTP  | Contact messages → user's Gmail      |
| Deployment   | Vercel (FE) + Render (BE)| Free tier hosting                    |

---

## 🚀 Setup Guide

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. PostgreSQL Database

```bash
# Create database
psql -U postgres
CREATE DATABASE portfolio_platform;
\q

# Run schema
psql -U postgres -d portfolio_platform -f backend/config/schema.sql
```

### 3. Backend Environment

```bash
cd backend
cp .env.example .env
# Edit .env with your values:
```

**Required `.env` values:**

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=portfolio_platform
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=any_long_random_string_here_min_32_chars

CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret

GMAIL_USER=yourplatform@gmail.com
GMAIL_APP_PASSWORD=xxxx_xxxx_xxxx_xxxx   # See step 4

FRONTEND_URL=http://localhost:3000
```

### 4. Gmail App Password (for contact emails)

1. Go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Select **Mail** + **Windows Computer** (or any device)
3. Click **Generate**
4. Copy the 16-character password into `GMAIL_APP_PASSWORD`

> ⚠️ Your Google account must have 2-Factor Authentication enabled for App Passwords to work.

### 5. Cloudinary Account (free)

1. Sign up at [https://cloudinary.com](https://cloudinary.com)
2. Find your **Cloud Name, API Key, API Secret** in the Dashboard
3. Add them to `.env`

### 6. Frontend Environment

```bash
cd frontend
cp .env.local.example .env.local
# Edit:
# NEXT_PUBLIC_API_URL=http://localhost:5000/api
# NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 7. Create First Admin Account

```bash
# Start the backend
cd backend && npm run dev

# In another terminal, run this once:
node -e "
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ host: process.env.DB_HOST, port: process.env.DB_PORT, database: process.env.DB_NAME, user: process.env.DB_USER, password: process.env.DB_PASSWORD });
const hash = bcrypt.hashSync('your_admin_password', 12);
pool.query(\"INSERT INTO users (name, email, password, role) VALUES ('Admin', 'admin@yoursite.com', '\"+hash+\"', 'admin')\").then(() => { console.log('Admin created!'); process.exit(); });
"
```

### 8. Run the App

```bash
# Terminal 1 — Backend
cd backend
npm run dev    # runs on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev    # runs on http://localhost:3000
```

---

## 🔗 Routes Overview

### Public (no login needed)
| URL | Description |
|-----|-------------|
| `/` | Landing page |
| `/register` | Create account |
| `/login` | Sign in |
| `/portfolio/[slug]` | Public portfolio (interviewers visit this) |

### User Dashboard (login required)
| URL | Description |
|-----|-------------|
| `/dashboard` | Home with stats |
| `/dashboard/profile` | Edit bio, photo, skills, links |
| `/dashboard/certificates` | Upload & manage certificates |
| `/dashboard/projects` | Add projects |
| `/dashboard/inbox` | Read messages from interviewers |
| `/dashboard/share` | Get shareable link + QR code |

### Admin Panel (admin role required)
| URL | Description |
|-----|-------------|
| `/admin` | Stats + recent users + cert verification |
| `/admin/users` | Search, suspend, delete users |
| `/admin/certificates` | Verify uploaded certificates |

---

## 📧 How Contact → Gmail Works

```
Interviewer visits /portfolio/john-doe
         │
         ▼
Fills contact form (name, email, company, subject, message)
         │
         ▼
POST /api/contact/john-doe
         │
         ├─► Saves message to `messages` table in database
         │
         └─► Nodemailer sends formatted HTML email
               From:    your-platform@gmail.com
               To:      john.doe@gmail.com  ← user's registered email
               ReplyTo: interviewer@company.com  ← so user can reply directly
```

The user receives a beautifully formatted email in their Gmail. Clicking **"Reply to [Name]"** opens a reply pre-addressed to the interviewer.

---

## 🌐 Deployment

### Frontend → Vercel
```bash
cd frontend
npx vercel --prod
# Set environment variables in Vercel dashboard
```

### Backend → Render
1. Push backend folder to GitHub
2. Create a **Web Service** on [render.com](https://render.com)
3. Set all environment variables
4. Use `npm start` as start command

### Database → Supabase (free PostgreSQL)
1. Create project at [supabase.com](https://supabase.com)
2. Get the connection string
3. Run `schema.sql` in Supabase SQL editor

---

## 📋 API Endpoints Summary

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/change-password

GET    /api/profile
PUT    /api/profile
POST   /api/profile/photo
GET    /api/profile/stats
GET    /api/profile/public/:slug       ← No auth

GET    /api/certificates
POST   /api/certificates
PUT    /api/certificates/:id
DELETE /api/certificates/:id

GET    /api/projects
POST   /api/projects
PUT    /api/projects/:id
DELETE /api/projects/:id

POST   /api/contact/:slug              ← No auth (interviewers)
GET    /api/contact/inbox
PATCH  /api/contact/inbox/:id/read

GET    /api/admin/dashboard
GET    /api/admin/users
PATCH  /api/admin/users/:id/status
DELETE /api/admin/users/:id
GET    /api/admin/certificates
PATCH  /api/admin/certificates/:id/verify
```

---

## 🔮 Future Features to Add

- [ ] Password reset via email
- [ ] Experience / Education sections
- [ ] Portfolio themes (light/dark/custom)
- [ ] PDF resume generation from profile
- [ ] Google OAuth login
- [ ] Email notifications for new messages
- [ ] Analytics: chart of daily views
- [ ] Multiple admins support
