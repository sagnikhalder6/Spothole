'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/', label: 'Report', icon: '📸' },
  { href: '/dashboard', label: 'My reports', icon: '📋' },
  { href: '/map', label: 'Map', icon: '🗺️' },
];

export default function Nav() {
  const path = usePathname();
  return (
    <nav className="nav">
      {items.map((i) => (
        <Link key={i.href} href={i.href} className={path === i.href ? 'active' : ''}>
          <span>{i.icon}</span>
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
