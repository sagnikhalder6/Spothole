'use client';
import { useEffect, useState } from 'react';
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
    <div className="container">
      <div className="stats">
        {['pending', 'acknowledged', 'resolved'].map((s) => (
          <div className="stat" key={s}>
            <b style={{ color: COLORS[s] }}>{count(s)}</b>
            <small>{s}</small>
          </div>
        ))}
      </div>

      {error && <div className="alert error">{error}</div>}
      {reports && reports.length === 0 && <p className="empty">No reports yet. Report your first pothole!</p>}

      {reports && reports.map((r) => (
        <div className="card report" key={r._id}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="thumb" src={r.image} alt="Pothole" />
          <div>
            <span className="pill" style={{ background: COLORS[r.status] }}>{r.status}</span>
            <div className="addr">
              {r.address || (r.latitude != null ? `${r.latitude.toFixed(4)}, ${r.longitude.toFixed(4)}` : 'No location')}
            </div>
            {r.message && <div className="muted" style={{ marginTop: 4 }}>{r.message}</div>}
            <div className="muted" style={{ marginTop: 4 }}>{new Date(r.createdAt).toLocaleString()}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
