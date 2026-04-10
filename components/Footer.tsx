'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer>
      <div className="footer-grid">
        <div className="footer-brand">
          <Link href="/" className="logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="logo-icon">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            VIRTMCU
          </Link>
          <p>The high-performance bridge between Renode flexibility and QEMU speed. Built for modern digital twins.</p>
        </div>
        <div className="footer-col">
          <h4>Platform</h4>
          <ul>
            <li>
              <Link href="/#features">Features</Link>
            </li>
            <li>
              <Link href="https://github.com/RefractSystems/virtmcu/blob/main/docs/ARCHITECTURE.md">Architecture</Link>
            </li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Developers</h4>
          <ul>
            <li>
              <Link href="https://github.com/RefractSystems/virtmcu">GitHub</Link>
            </li>
            <li>
              <Link href="/docs">Documentation</Link>
            </li>
            <li>
              <Link href="/llms.txt">llms.txt</Link>
            </li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            <li>
              <Link href="https://refractsystems.com">Refract Systems</Link>
            </li>
            <li>
              <Link href="https://firmwarestudio.com">FirmwareStudio</Link>
            </li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Legal</h4>
          <ul>
            <li>
              <Link href="/privacy">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/tos">Terms of Service</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} Refract Systems. All rights reserved.
      </div>
    </footer>
  );
}
