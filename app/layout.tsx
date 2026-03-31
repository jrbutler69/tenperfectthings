import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Ten Perfect Things',
  description: 'Things my friends can\'t live without — a style guide from real people.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
              <Link href="/" className="site-logo">
                ten <span>perfect</span> things
              </Link>
              <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                <Link href="/" style={{ fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--warm-gray)', textDecoration: 'none' }}>
                  All Profiles
                </Link>
                <Link href="/submit" className="btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
                  Submit Yours
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <main>
          {children}
        </main>

        <footer style={{ borderTop: '1px solid var(--border)', marginTop: '6rem', padding: '3rem 2rem', textAlign: 'center' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <p className="site-logo" style={{ marginBottom: '0.5rem' }}>ten <span>perfect</span> things</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--warm-gray)' }}>Things my friends can't live without.</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--warm-gray)', marginTop: '1.5rem' }}>
              <Link href="/submit" style={{ color: 'var(--ink)', textDecoration: 'none' }}>Submit your ten things</Link>
              {' · '}
              <Link href="/admin" style={{ color: 'var(--warm-gray)', textDecoration: 'none' }}>Admin</Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}