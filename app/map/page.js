'use client';
import { useEffect, useState } from 'react';
import MapView from '../../components/MapView';

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

  if (error) return <div className="container"><div className="alert error">{error}</div></div>;
  if (!reports) return <div className="container"><p className="empty">Loading map…</p></div>;
  return <MapView reports={reports} />;
}
