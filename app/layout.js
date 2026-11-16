import './globals.css';
import Nav from '../components/Nav';

export const metadata = {
  title: 'Pot Hole Detector',
  description: 'Report potholes with a photo and location.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#111827',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="topbar">🕳️ Pot Hole Detector</div>
        {children}
        <Nav />
      </body>
    </html>
  );
}
