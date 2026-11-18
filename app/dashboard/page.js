'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getDeviceId } from '../../lib/device';

const COLORS = { pending: 'var(--pending)', acknowledged: 'var(--acknowledged)', resolved: 'var(--resolved)' };

export default function Dashboard() {
  const [reports, setReports] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/report?deviceId=${encodeURIComponent(getDeviceId())}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Could not load reports');
        setReports(data.reports);
      })
      .catch((e) => setError(e.message));
  }, []);

  const count = (s) => (reports ? reports.filter((r) => r.status === s).length : '–');

  return (
    <main className="page">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow">Dashboard</span>
          <h1 className="h2">My reports</h1>
          <p className="lede">Every pothole you have reported from this device, and where it stands.</p>
        </div>

        <div className="stats">
          {['pending', 'acknowledged', 'resolved'].map((s) => (
            <div className="stat" key={s} style={{ '--c': COLORS[s] }}>
              <b>{count(s)}</b>
              <small>{s}</small>
            </div>
          ))}
        </div>

        {error && <div className="alert error">{error}</div>}

        {reports && reports.length === 0 && (
          <div className="empty">
            <p>No reports yet.</p>
            <Link href="/#report" className="btn primary">Report your first pothole</Link>
          </div>
        )}

        {reports && reports.length > 0 && (
          <ul className="rlist">
            {reports.map((r) => (
              <li className="report" key={r._id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="thumb" src={r.image} alt="Pothole" />
                <div>
                  <span className="status" style={{ '--c': COLORS[r.status] }}>{r.status}</span>
                  <div className="addr">
                    {r.address || (r.latitude != null ? `${r.latitude.toFixed(4)}, ${r.longitude.toFixed(4)}` : 'No location')}
                  </div>
                  {r.message && <div className="muted">{r.message}</div>}
                  <div className="muted" style={{ marginTop: 6 }}>{new Date(r.createdAt).toLocaleString()}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
