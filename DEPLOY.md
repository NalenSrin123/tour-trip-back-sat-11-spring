# Deploy Guide — Tour Trip (Free Tier)

Stack: Spring Boot 4 (Java 21) + React/Vite + PostgreSQL
Free services: **Render** (backend) + **Vercel** (frontend) + **Neon** (Postgres)

---

## 1. Database — Neon (done ✓)

Neon project **tour-trip** created (Singapore region).

- **JDBC URL** (for `DB_URL`):
  `jdbc:postgresql://ep-noisy-sun-a17wnobk-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`
- **User**: `neondb_owner`
- **Password**: `npg_yNaPu8eO4jrh`

## 2. Backend — Render (free web service)

1. Push this repo to GitHub (already set up: `origin` remote).
2. Sign up at https://render.com with your GitHub account.
3. **New → Web Service** → connect your repo.
4. Settings:
   - **Root Directory**: leave empty (repo root)
   - **Runtime**: Java
   - **Build Command**: `./mvnw clean package -DskipTests`
   - **Start Command**: `java -jar target/tour-trip-api-*.jar`
   - **Instance Type**: Free
5. **Environment** (Env Variables tab):

   | Key | Value |
   |-----|-------|
   | `DB_URL` | `jdbc:postgresql://ep-xxx.aws.neon.tech/neondb?sslmode=require` |
   | `DB_USERNAME` | *(Neon user)* |
   | `DB_PASSWORD` | *(Neon password)* |
   | `JWT_SECRET` | *(a long random string, 64+ chars)* |
   | `CORS_ALLOWED_ORIGINS` | `https://your-app.vercel.app` |
   | `MAIL_USERNAME` | *(your Gmail)* |
   | `MAIL_PASSWORD` | *(Gmail app password)* |

6. Deploy → wait for build (~3-5 min on first run, free tier is slow).
7. Your API URL: `https://tour-trip-api.onrender.com`

## 3. Frontend — Vercel (free)

1. Sign up at https://vercel.com with GitHub.
2. **Add New Project** → import your repo.
3. Settings:
   - **Root Directory**: `tour-trip-web`
   - **Framework Preset**: Vite (auto-detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables**:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://tour-trip-api.onrender.com` |

5. Deploy → your site: `https://your-app.vercel.app`
6. Go back to Render → update `CORS_ALLOWED_ORIGINS` to `https://your-app.vercel.app` → redeploy.

## 4. Verify

- Open `https://your-app.vercel.app` → homepage loads, tour images show.
- Sign in with `admin@gmail.com` / `admin123`.
- Check `/admin` dashboard, tours, bookings.
- Test booking flow end-to-end.

---

## Known Limitations (Free Tier)

- **Render free**: instance sleeps after 15 min idle → first request takes ~30-50s to wake up.
- **Uploads**: files uploaded via admin are stored on Render's ephemeral disk → **lost on redeploy**. Seed images (committed in `uploads/`) survive because they're in the repo. For production use, switch to Cloudinary or S3.
- **Neon free**: 0.5 GB storage, pauses after 5 days of inactivity → click "Resume" in Neon dashboard.
- **JWT secret**: must be a long random string in production. Generate one: `python -c "import secrets; print(secrets.token_hex(32))"` or use an online random string generator.
