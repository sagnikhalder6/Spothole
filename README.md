# Pot Hole Detector (lite)

A phone-friendly web app to report potholes. One project, one deploy, hosted on Vercel.

- Take or choose a photo (blurry photos are rejected)
- Location from GPS, or typed in by hand
- "My reports" page with status (pending / acknowledged / resolved)
- Map of everyone's reports (OpenStreetMap, no API key)

No login, no Twitter, no separate backend server. The only outside service is a free MongoDB database.

## How it fits together

```
app/page.js            the Report page
app/dashboard/page.js  My reports
app/map/page.js        Map
app/api/report/route.js   the "backend": saves and loads reports in MongoDB
lib/                   small helpers (photo shrink + blur check, GPS, device id, DB connection)
```

You don't need to touch the backend. `app/api/report/route.js` is the only server code, and Vercel runs it for you automatically.

## Step 1: Free database (MongoDB Atlas)

1. Sign up at mongodb.com/atlas and create a free **M0** cluster.
2. **Database Access** → Add a database user. Pick a username and password (save them).
3. **Network Access** → Add IP address → **Allow access from anywhere** (`0.0.0.0/0`). Vercel needs this because its IPs change.
4. **Database** → Connect → Drivers → copy the connection string. It looks like `mongodb+srv://user:<password>@cluster0.xxxx.mongodb.net/...`. Replace `<password>` with your real password.

## Step 2: Run it on your computer (optional but recommended)

You need Node.js 18+.

```bash
npm install
cp .env.example .env.local      # on Windows: copy .env.example .env.local
```
Open `.env.local` and paste your connection string after `MONGODB_URI=`. Then:

```bash
npm run dev
```
Open http://localhost:3000. GPS works on `localhost`.

## Step 3: Put it on GitHub

Create a new GitHub repo and push this folder (`.env.local` is ignored, so your password stays private).

## Step 4: Deploy on Vercel

1. Go to vercel.com → **Add New → Project** → import your GitHub repo.
2. Under **Environment Variables**, add `MONGODB_URI` with your connection string.
3. Click **Deploy**.

Open the link Vercel gives you on your phone. In the browser menu choose **Add to Home Screen** and it behaves like an app.

## Good to know

- GPS only works on `https` pages. Vercel links are https, so use the deployed link on your phone. A plain `http://192.168...` address will not give location.
- Photos are shrunk to about 800 px in the browser and stored inside MongoDB. That keeps this simple and avoids image-hosting accounts. It's fine for a project or demo, but a big public app should use proper image storage.
- Anyone can submit reports (there is no login). Add rate limiting before using it publicly.
- Reports start as `pending`. To change one to `acknowledged` or `resolved`, edit its `status` field in Atlas (Browse Collections → `pothole` → `reports`).
- Blur strictness is `BLUR_THRESHOLD` in `lib/image.js`. Raise it if blurry photos get through, lower it if sharp photos get rejected.
- Address lookup uses OpenStreetMap's free service. If it fails, coordinates are shown instead.
