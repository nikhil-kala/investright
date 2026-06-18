# InvestRight Laravel Conversion — Status

**Last updated:** 2026-06-18  
**Backend:** Laravel 12 + MySQL (XAMPP)  
**Frontend:** React + Vite (unchanged UI)

---

## Progress Overview

| Stage | Status | Description |
|-------|--------|-------------|
| 1. Feature audit | ✅ Done | Mapped auth, chat, admin, credit cards, settings, contact, Gemini |
| 2. Laravel scaffold | ✅ Done | `backend/` — Laravel 12 + Sanctum |
| 3. MySQL schema | ✅ Done | Migrations + seeders on `investright` database |
| 4. Auth API | ✅ Done | login, register, logout, profile, reset password |
| 5. Chat API | ✅ Done | conversations, messages, admin stats |
| 6. Other APIs | ✅ Done | credit cards, settings, contact, admin users |
| 7. Frontend wiring | 🔄 In progress | apiClient + service refactors |
| 8. Chatbot migration | ⏳ Planned | Full `chatbotService.ts` logic → Laravel (Phase 2) |
| 9. Supabase removal | ⏳ Planned | After frontend fully switched |
| 10. Data migration | ✅ Skipped | No Supabase data to import |

---

## Project Structure

```
c:\xampp\htdocs\
├── investright-api/     ← Laravel API (XAMPP Apache)
└── investRight/
    └── investright/     ← React frontend (npm run dev)
```

---

## How to Run (Development)

### 1. Start MySQL (XAMPP Control Panel → MySQL)

### 2. Start Apache (XAMPP Control Panel → Apache)

### 3. One-time: map API hostname (choose one)

**Option A — Virtual host (recommended)**  
Add to `C:\Windows\System32\drivers\etc\hosts` (as Administrator):
```
127.0.0.1 investright-api.local
```
Virtual host config is in `c:\xampp\htdocs\investright-api\xampp-vhost.conf`  
(append to `C:\xampp\apache\conf\extra\httpd-vhosts.conf` if not already added, then restart Apache)

API URL: `http://investright-api.local/api`

**Option B — Subfolder (no hosts file)**  
API URL: `http://localhost/investright-api/public/api`  
Set in frontend `.env`: `VITE_API_URL=http://localhost/investright-api/public/api`

### 4. Start React frontend
```bash
cd c:\xampp\htdocs\investRight\investright
npm run dev
```
App: http://localhost:5173

### 5. Fallback: Laravel built-in server (if Apache not configured)
```bash
npm run api
```
API: http://localhost:8000/api — set `VITE_API_URL` accordingly.

---

## Environment files

**investright-api/.env** (Laravel — `c:\xampp\htdocs\investright-api\.env`):
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=investright
DB_USERNAME=root
DB_PASSWORD=

GEMINI_API_KEY=your-key-here
FRONTEND_URL=http://localhost:5173
```

**Root `.env`** (frontend):
```env
VITE_API_URL=http://localhost:8000/api
VITE_USE_LARAVEL_API=true
VITE_GEMINI_API_KEY=your-key-here
```

---

## Seeded Demo Accounts (MySQL)

| Email | Password | Role |
|-------|----------|------|
| kale.nikhil@gmail.com | Invest123 | admin |
| demo@investright.com | demo123 | admin |
| user@investright.com | user123 | user |

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/status` | No | Health check |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/register` | No | Register |
| POST | `/api/auth/logout` | Yes | Logout |
| GET | `/api/auth/profile` | Yes | Current user |
| PUT | `/api/auth/profile` | Yes | Update profile |
| POST | `/api/auth/reset-password/{id}` | Admin | Reset password |
| GET | `/api/chat/conversations` | Yes | User conversations |
| GET | `/api/chat/conversations/{id}` | Yes | Single conversation |
| POST | `/api/chat/messages` | Yes | Store message |
| POST | `/api/chat/conversations` | Yes | Store full conversation |
| GET | `/api/chat/admin/conversations` | Admin | All conversations |
| GET | `/api/chat/stats` | Admin | Dashboard stats |
| POST | `/api/chat/gemini` | Yes | Gemini proxy (server-side key) |
| GET/POST/PUT/DELETE | `/api/credit-cards` | Yes | Credit card CRUD |
| GET/PUT | `/api/settings` | Yes | User settings |
| POST | `/api/contact` | No | Contact form |
| GET | `/api/admin/users` | Admin | User list |

---

## What Still Uses Supabase / Client-Side

| Feature | Current | Target |
|---------|---------|--------|
| AI chatbot flow (`chatbotService.ts`) | Browser + Gemini key | Phase 2: Laravel service |
| Web search for credit cards | Browser | Phase 2: Laravel proxy |
| Auth (when `VITE_USE_LARAVEL_API=false`) | Supabase fallback | Remove after testing |
| Chat storage (when API disabled) | Supabase fallback | Remove after testing |

---

## What We Need From You

1. ~~**Confirm MySQL credentials**~~ — **Confirmed:** `investright` / `root` / no password (XAMPP defaults).

2. **Gemini API key** — Searched the full project: only **Google Gemini** is used (no ChatGPT/OpenAI). No real key is stored in the repo (only placeholders in `.env.example` — correct for security). **Action:** paste your key into:
   - Root `.env` → `VITE_GEMINI_API_KEY=...` (chatbot in browser, until Phase 2)
   - `c:\xampp\htdocs\investright-api\.env` → `GEMINI_API_KEY=...` (Laravel server-side proxy)

3. ~~**Supabase data migration**~~ — **Not required.** Fresh MySQL database only.

4. ~~**PHP in PATH**~~ — **Handled:** use `npm run api` or `scripts\api-serve.bat` (uses `C:\xampp\php\php.exe` directly).

---

## Quick Commands (no PHP PATH setup needed)

| Command | What it does |
|---------|----------------|
| `npm run api` | Start Laravel on http://localhost:8000 |
| `npm run dev` | Start React on http://localhost:5173 |
| `npm run api:migrate` | Run database migrations |
| `npm run api:seed` | Seed demo users |
| `npm run api:fresh` | Reset DB + re-seed |
| `scripts\api-artisan.bat migrate` | Run any artisan command |

---

## Next Steps (Automated)

- [ ] Finish React service refactors (auth, chat, settings, credit cards)
- [ ] Test login → dashboard → chat save flow end-to-end
- [ ] Port chatbot conversation flow to Laravel (preserve all 3800 lines of logic)
- [ ] Remove `@supabase/supabase-js` dependency
- [ ] Update deployment docs for Laravel + React split
