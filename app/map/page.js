'use client';
import { useEffect, useState } from 'react';
import MapView from '../../components/MapView';

const LEGEND = [
  ['Pending', '#f59e0b'],
  ['Acknowledged', '#2563eb'],
  ['Resolved', '#16a34a'],
];

export default function MapPage() {
  const [reports, setReports] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/report?scope=map')
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || 'Could not load the map');
        setReports(data.reports);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <main className="page"><div className="wrap"><div className="alert error">{error}</div></div></main>
    );
  }
  if (!reports) {
    return (
      <main className="page"><div className="wrap"><p className="empty">Loading map…</p></div></main>
    );
  }

  return (
    <div className="mapwrap">
      <MapView reports={reports} />
      <div className="legend">
        {LEGEND.map(([label, color]) => (
          <span key={label} style={{ '--c': color }}>{label}</span>
        ))}
      </div>
    </div>
  );
}
