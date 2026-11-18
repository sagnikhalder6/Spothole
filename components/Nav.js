'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/', label: 'Report' },
  { href: '/dashboard', label: 'My reports' },
  { href: '/map', label: 'Map' },
];

// On the home page the header floats over the hero; everywhere else it is a solid dark bar.
export default function Nav() {
  const path = usePathname();
  return (
    <header className={`header${path === '/' ? ' over' : ''}`}>
      <div className="wrap">
        <Link href="/" className="brand" aria-label="Spothole home">
          <span className="brand-mark" />
          <span className="brand-text">Spothole</span>
        </Link>
        <nav className="links">
          {items.map((i) => (
            <Link key={i.href} href={i.href} className={path === i.href ? 'active' : ''}>
              {i.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
