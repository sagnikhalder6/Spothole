'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { prepareImage } from '../lib/image';
import { getPosition, reverseGeocode } from '../lib/geo';
import { getDeviceId } from '../lib/device';

export default function ReportPage() {
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);

  const [photo, setPhoto] = useState(null); // { dataUrl }
  const [coords, setCoords] = useState(null);
  const [address, setAddress] = useState('');
  const [manual, setManual] = useState(false);
  const [message, setMessage] = useState('Dangerous pothole here! Please repair it soon.');
  const [locating, setLocating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function fetchLocation() {
    setLocating(true);
    setError('');
    try {
      const pos = await getPosition();
      setCoords(pos);
      setManual(false);
      const found = await reverseGeocode(pos.latitude, pos.longitude);
      if (found) setAddress(found);
    } catch (e) {
      setManual(true);
      setError('Could not get your location. Please type it in manually.');
    } finally {
      setLocating(false);
    }
  }

  async function onFile(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = ''; // lets you pick the same file again
    if (!file) return;
    setError('');
    setDone(false);
    try {
      const prepared = await prepareImage(file);
      if (prepared.blurry) {
        setPhoto(null);
        setError('That photo looks blurry. Please retake it or choose a clearer one.');
        return;
      }
      setPhoto(prepared);
      if (!coords) fetchLocation();
    } catch (err) {
      setError(err.message);
    }
  }

  async function submit() {
    setError('');
    if (!photo) return setError('Take or choose a photo of the pothole first.');
    if (!coords && !address.trim()) return setError('Allow GPS or type the location manually.');

    setBusy(true);
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId: getDeviceId(),
          image: photo.dataUrl,
          latitude: coords ? coords.latitude : null,
          longitude: coords ? coords.longitude : null,
          address,
          message,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      setDone(true);
      setPhoto(null);
      setCoords(null);
      setAddress('');
      setManual(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container">
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="preview" src={photo.dataUrl} alt="Pothole preview" />
      ) : (
        <div className="preview placeholder">
          📷
          <small>No photo yet</small>
        </div>
      )}

      <div className="row">
        <button className="btn" onClick={() => cameraRef.current.click()}>Take photo</button>
        <button className="btn alt" onClick={() => galleryRef.current.click()}>Gallery</button>
      </div>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={onFile} />
      <input ref={galleryRef} type="file" accept="image/*" hidden onChange={onFile} />

      <span className="label">Location</span>
      <div className="card">
        {locating ? (
          <span className="muted">Getting your location…</span>
        ) : coords ? (
          <div>📍 {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}</div>
        ) : (
          <button className="btn alt" onClick={fetchLocation}>Use my GPS location</button>
        )}

        {coords && address && <div className="muted" style={{ marginTop: 6 }}>{address}</div>}

        <label className="switch">
          <span className="muted">Type the location myself</span>
          <input type="checkbox" checked={manual} onChange={(e) => setManual(e.target.checked)} />
        </label>
        {manual && (
          <input
            type="text"
            style={{ marginTop: 8 }}
            placeholder="Street, area, city"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        )}
      </div>

      <label className="label" htmlFor="msg">Note (optional)</label>
      <textarea id="msg" maxLength={200} value={message} onChange={(e) => setMessage(e.target.value)} />

      {error && <div className="alert error">{error}</div>}
      {done && (
        <div className="alert ok">
          Reported! See it in <Link href="/dashboard">My reports</Link>.
        </div>
      )}

      <button className="btn primary" onClick={submit} disabled={busy}>
        {busy ? 'Submitting…' : 'Submit report'}
      </button>
    </div>
  );
}
