// Gets the phone/browser GPS position. Needs https (works on localhost and on Vercel).
export function getPosition() {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return reject(new Error('Location is not supported here'));
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => reject(new Error(err.message || 'Location permission denied')),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  });
}

// Free reverse geocoding (coordinates -> address) from OpenStreetMap. No API key needed.
// If it fails we simply show the coordinates instead.
export async function reverseGeocode(latitude, longitude) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
    );
    if (!res.ok) return '';
    const json = await res.json();
    return json.display_name || '';
  } catch (e) {
    return '';
  }
}
