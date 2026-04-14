'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
          <Image src="/logo.svg" alt="Virtmcu Logo" width={28} height={28} className="logo-icon" unoptimized />
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
