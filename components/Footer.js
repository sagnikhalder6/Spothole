'use client';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const path = usePathname();
  if (path === '/map') return null; // the map fills the screen
  return (
    <footer className="footer">
      <div className="wrap">
        <span>Spothole · Community road reporting</span>
        <span>Map © OpenStreetMap contributors</span>
      </div>
    </footer>
  );
}
