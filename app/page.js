'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { prepareImage } from '../lib/image';
import { getPosition, reverseGeocode } from '../lib/geo';
import { getDeviceId } from '../lib/device';

// Original artwork: a road running to the horizon with an amber centre line and a few potholes.
function HeroArt() {
  return (
    <svg viewBox="0 0 1200 700" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1f2937" />
          <stop offset="1" stopColor="#111827" />
        </linearGradient>
        <linearGradient id="road" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1f2937" />
          <stop offset="1" stopColor="#0b1220" />
        </linearGradient>
        <radialGradient id="glow" cx="600" cy="300" r="420" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f59e0b" stopOpacity="0.35" />
          <stop offset="1" stopColor="#f59e0b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1200" height="700" fill="url(#sky)" />
      <g className="road">
      <rect x="-600" y="0" width="2400" height="700" fill="url(#glow)" />
      <polygon points="585,300 615,300 1400,700 -200,700" fill="url(#road)" />
      <g stroke="rgba(255,255,255,0.22)" strokeWidth="1.5">
        <line x1="585" y1="300" x2="-200" y2="700" />
        <line x1="615" y1="300" x2="1400" y2="700" />
      </g>
      <g fill="#f59e0b">
        <polygon points="598.75,325 601.25,325 602.25,345 597.75,345" />
        <polygon points="596.25,375 603.75,375 605.5,410 594.5,410" />
        <polygon points="592.5,450 607.5,450 610.5,510 589.5,510" />
        <polygon points="587,560 613,560 617.5,650 582.5,650" />
      </g>
      <g stroke="rgba(255,255,255,0.14)" strokeWidth="1">
        <ellipse cx="470" cy="560" rx="78" ry="13" fill="#0b1220" />
        <ellipse cx="790" cy="505" rx="52" ry="8" fill="#0b1220" />
        <ellipse cx="690" cy="645" rx="96" ry="17" fill="#0b1220" />
        <ellipse cx="330" cy="660" rx="70" ry="12" fill="#0b1220" />
      </g>
      <g fill="rgba(148,163,184,0.22)">
        <ellipse cx="470" cy="561" rx="60" ry="8" />
        <ellipse cx="790" cy="506" rx="40" ry="5" />
        <ellipse cx="690" cy="646" rx="76" ry="11" />
        <ellipse cx="330" cy="661" rx="54" ry="7" />
      </g>
      </g>
    </svg>
  );
}

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
    <main>
      {/* Hero */}
      <section className="hero">
        <div className="hero-art"><HeroArt /></div>
        <div className="hero-photo" />
        <div className="hero-shade" />
        <div className="wrap">
          <span className="eyebrow">Community road reporting</span>
          <h1>
            Spot a pothole.<br />
            Report it in <em>seconds.</em>
          </h1>
          <p>Snap a photo, tag the spot, and watch every report land on the map.</p>
          <div className="cta">
            <a href="#report" className="btn primary">Report a pothole</a>
            <Link href="/map" className="btn light">View the map</Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">How it works</span>
            <h2 className="h2">Three steps. No account.</h2>
          </div>
          <div className="steps">
            <div className="step">
              <div className="num">01</div>
              <h3>Snap</h3>
              <p>Take a clear photo of the pothole. Blurry shots are caught before they are sent.</p>
            </div>
            <div className="step">
              <div className="num">02</div>
              <h3>Locate</h3>
              <p>Your GPS position is added automatically, or you can type the place yourself.</p>
            </div>
            <div className="step">
              <div className="num">03</div>
              <h3>Track</h3>
              <p>Follow each report from pending to resolved, and see everyone's pins on the map.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Report form */}
      <section id="report" className="section white">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Report</span>
            <h2 className="h2">Tell us where it is.</h2>
          </div>

          <div className="formgrid">
            <div>
              <span className="field-label"><i>01</i>Photo</span>
              <div className="photo">
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo.dataUrl} alt="Pothole preview" />
                ) : (
                  <div className="hint"><b>+</b>Add a photo</div>
                )}
              </div>
              <div className="btnrow">
                <button className="btn primary" onClick={() => cameraRef.current.click()}>Take photo</button>
                <button className="btn" onClick={() => galleryRef.current.click()}>Gallery</button>
              </div>
              <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={onFile} />
              <input ref={galleryRef} type="file" accept="image/*" hidden onChange={onFile} />
            </div>

            <div>
              <div className="field">
                <span className="field-label"><i>02</i>Location</span>
                {locating ? (
                  <span className="muted">Getting your location…</span>
                ) : coords ? (
                  <div className="coords">{coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}</div>
                ) : (
                  <button className="btn" onClick={fetchLocation}>Use my GPS location</button>
                )}

                {coords && address && <div className="muted" style={{ marginTop: 8 }}>{address}</div>}

                <label className="switch">
                  <input type="checkbox" checked={manual} onChange={(e) => setManual(e.target.checked)} />
                  Type the location myself
                </label>
                {manual && (
                  <input
                    type="text"
                    className="line-input"
                    style={{ marginTop: 12 }}
                    placeholder="Street, area, city"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                )}
              </div>

              <div className="field">
                <label className="field-label" htmlFor="msg"><i>03</i>Note (optional)</label>
                <textarea
                  id="msg"
                  className="line-input"
                  maxLength={200}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              {error && <div className="alert error">{error}</div>}
              {done && (
                <div className="alert ok">
                  Reported! See it in <Link href="/dashboard">My reports</Link>.
                </div>
              )}

              <button className="btn primary block" onClick={submit} disabled={busy}>
                {busy ? 'Submitting…' : 'Submit report'}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
