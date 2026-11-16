'use client';
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

const COLORS = { pending: '#f59e0b', acknowledged: '#2563eb', resolved: '#16a34a' };

// Map tiles come from OpenStreetMap, so no API key is needed.
export default function MapView({ reports }) {
  const ref = useRef(null);

  useEffect(() => {
    let map;
    let cancelled = false;

    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled || !ref.current) return;

      map = L.map(ref.current).setView([20.59, 78.96], 5); // whole-country view until we have pins
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      const points = [];
      reports.forEach((r) => {
        const pos = [r.latitude, r.longitude];
        points.push(pos);
        const text = document.createElement('div');
        text.textContent = `${r.status}${r.address ? ' – ' + r.address : ''}`;
        L.circleMarker(pos, {
          radius: 9,
          color: '#fff',
          weight: 2,
          fillColor: COLORS[r.status] || '#6b7280',
          fillOpacity: 0.95,
        })
          .addTo(map)
          .bindPopup(text);
      });

      if (points.length) map.fitBounds(points, { padding: [40, 40], maxZoom: 16 });
    })();

    return () => {
      cancelled = true;
      if (map) map.remove();
    };
  }, [reports]);

  return <div ref={ref} className="map" />;
}
