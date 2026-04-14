'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Navbar({ activeSection }: { activeSection?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className={`main-navbar ${scrolled ? 'scrolled' : ''}`.trim()}>
      <div className="nav-container">
        <Link href="/" className="logo" onClick={closeMenu}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="logo-icon">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          VIRTMCU
        </Link>

        <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          <Link
            href="/#features"
            className={activeSection === 'features' ? 'active' : ''}
            onClick={closeMenu}
          >
            Features
          </Link>
          <Link
            href="https://github.com/RefractSystems/virtmcu/blob/main/docs/ARCHITECTURE.md"
            onClick={closeMenu}
          >
            Architecture
          </Link>
          <Link
            href="/docs"
            className={activeSection === 'docs' ? 'active' : ''}
            onClick={closeMenu}
          >
            Documentation
          </Link>
          <Link href="https://github.com/RefractSystems/virtmcu" className="btn btn-cta" onClick={closeMenu}>
            GitHub
          </Link>
        </div>

        <button
          className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}
          aria-label="Toggle menu"
          onClick={() => setMobileMenuOpen((o) => !o)}
          style={{ display: 'none' }} // Hidden for now as simple desktop nav
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
}
