# Spothole: Pothole Reporter

A mobile-friendly web app for reporting potholes. Take a photo, tag the location, and track your reports. Built with Next.js and MongoDB, deployed on Vercel.

**Live demo:** https://spothole.vercel.app/


## Features

- Take or choose a photo of a pothole
- Blur check: unclear photos are rejected and the user is asked to retake them
- Location from the device GPS, converted to a readable address, with a manual fallback if permission is denied
- "My reports" page showing each report's status (pending, acknowledged or resolved)
- Map showing everyone's reports, with pins coloured by status
- Works on phones and can be added to the home screen

## Tech stack

| Part | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router) | Pages and API in one project, one deploy |
| Database | MongoDB Atlas (free M0) | Simple document storage, free tier |
| Hosting | Vercel | Deploys straight from GitHub |
| Map | Leaflet + OpenStreetMap | No API key needed |
| Address lookup | OpenStreetMap Nominatim | Free reverse geocoding |

## Project structure

```
app/
  page.js                 Report page
  dashboard/page.js       My reports
  map/page.js             Map page
  api/report/route.js     API (save and load reports)
  layout.js, globals.css  Layout and styles
components/
  Nav.js, MapView.js
lib/
  mongodb.js              Cached database connection
  image.js                Resize + blur check
  geo.js                  GPS + address lookup
  device.js               Anonymous device id
```


## Limitations and next steps

- No login: reports are tied to a browser, so clearing site data loses "My reports".
- Anyone can submit, so a public version needs rate limiting.
- Status changes are done by hand in Atlas. An admin page would be the natural next feature.
- Images stored in the database are fine for a demo but should move to object storage (for example Vercel Blob) at scale.
- Possible additions: duplicate detection for nearby reports, severity rating, and notifications when a status changes.

## Credits

Map data © OpenStreetMap contributors. Original project idea from [alienx5499/Pot-Hole-Detector](https://github.com/alienx5499/Pot-Hole-Detector).
