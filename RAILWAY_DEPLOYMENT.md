# Spring Boot Backend - Railway Deployment Guide

## ✅ Build Status
- JAR built successfully: `smartcity-api-1.0.0.jar` (49MB)
- All models fixed (explicit getters/setters)
- Java 17 compiler configured
- Railway config files ready

## 🚀 Deploy to Railway

### Step 1: Railway Project Setup
1. Go to your Railway project: https://railway.com/project/c68beb3b-e1e0-40ee-9b7c-4e502b379f15
2. Click **New Service** → **GitHub Repo**
3. Select: `2400031255/smartCity-2`
4. **IMPORTANT:** Set **Root Directory** to `springboot`

### Step 2: Add MySQL Database
1. In Railway project, click **New** → **Database** → **Add MySQL**
2. Railway will auto-create these environment variables:
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLDATABASE`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`

### Step 3: Add Environment Variables to Spring Boot Service
Click on your Spring Boot service → **Variables** tab → Add:

```
PORT=8080
JWT_SECRET=smart-city-secret-key-2024-nikhil-railway
```

**Note:** MySQL variables are auto-linked if you added MySQL database in same project.

### Step 4: Deploy
Railway will automatically:
1. Detect `nixpacks.toml` → use Java 17 + Maven
2. Run: `mvn clean package -DskipTests`
3. Start: `java -jar target/smartcity-api-1.0.0.jar`

### Step 5: Get Your Backend URL
After deployment completes (~3-5 minutes):
1. Click **Settings** → **Networking** → **Generate Domain**
2. Your backend URL will be: `https://your-service.up.railway.app`

### Step 6: Test the Backend
```bash
# Health check
curl https://your-service.up.railway.app/api/health

# Should return: {"status":"ok","time":1234567890}
```

## 📋 API Endpoints

Base URL: `https://your-service.up.railway.app/api`

### Authentication
- `POST /api/register` - Register user
- `POST /api/login` - Login user
- `GET /api/health` - Health check

### Issues (requires JWT token)
- `GET /api/issues` - Get issues
- `POST /api/issues` - Create issue
- `PUT /api/issues/:id` - Update issue
- `DELETE /api/issues/:id` - Delete issue

### Tourist Places
- `GET /api/places` - Get all places
- `POST /api/places` - Add place (admin only)
- `PUT /api/places/:id` - Update place (admin only)
- `DELETE /api/places/:id` - Delete place (admin only)

### Emergency Numbers
- `GET /api/emergency` - Get emergency numbers
- `POST /api/emergency` - Add emergency number (admin only)
- `DELETE /api/emergency/:id` - Delete emergency number (admin only)

### Buses
- `GET /api/buses` - Get bus routes
- `POST /api/buses` - Add bus route (admin only)
- `DELETE /api/buses/:id` - Delete bus route (admin only)

### Alerts
- `GET /api/alerts` - Get recent alerts
- `POST /api/alerts` - Add alert (admin only)
- `DELETE /api/alerts/:id` - Delete alert (admin only)

### Users (admin only)
- `GET /api/users` - Get all users
- `PUT /api/users/:id` - Update user

## 🔑 Default Credentials

**Admin:**
- Username: `nikhil`
- Password: `nikhil2006`

## 🔧 Troubleshooting

### Build fails on Railway
- Check Railway logs for Maven errors
- Ensure Java 17 is being used (nixpacks.toml forces this)
- Verify all model classes have getters/setters

### Database connection fails
- Verify MySQL service is running in Railway
- Check environment variables are set correctly
- Ensure `MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD` are present

### App crashes on startup
- Check Railway logs: `View Logs` button
- Verify `PORT` environment variable is set
- Check MySQL connection string is correct

## 📦 Files Pushed to GitHub

Latest commit: `829f7f4`

- ✅ All 6 model classes (explicit getters/setters)
- ✅ `pom.xml` (Java 17 config)
- ✅ `railway.json` (build + start commands)
- ✅ `Procfile` (Railway start command)
- ✅ `nixpacks.toml` (force Java 17)
- ✅ `application.properties` (Railway MySQL env vars)

## 🌐 Connect Frontend to Backend

Once deployed, update your frontend `.env.local`:

```
VITE_API_URL=https://your-service.up.railway.app/api
```

Then rebuild and redeploy your Netlify frontend.
