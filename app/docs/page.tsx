'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const NAV_SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'installation', label: 'Installation' },
  { id: 'architecture', label: 'Architecture' },
  { id: 'usage', label: 'Usage' },
  { id: 'sync', label: 'Synchronization' },
  { id: 'faq', label: 'FAQ' },
];

export default function Docs() {
  const [activeSection, setActiveSection] = useState('overview');
  const revealRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const onScroll = () => {
      let current = 'overview';
      document.querySelectorAll<HTMLElement>('.doc-section[id]').forEach((s) => {
        if (window.scrollY >= s.offsetTop - 140) current = s.id;
      });
      setActiveSection(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('active');
        }),
      { threshold: 0.08 },
    );
    revealRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const addToRefs = useCallback((el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <Navbar activeSection="docs" />

      <div className="docs-hero-bar" style={{ paddingTop: '160px', paddingBottom: '80px', textAlign: 'center' }}>
        <div className="docs-hero-inner" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="hero-eyebrow">[ DOCUMENTATION ]</div>
          <h1 style={{ fontSize: '48px', marginBottom: '24px' }}>Virtmcu Reference</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>
            Technical documentation for the high-performance QEMU/Renode bridge.
          </p>
        </div>
      </div>

      <div className="section-container" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '60px', paddingTop: '40px' }}>
        <aside style={{ position: 'sticky', top: '120px', height: 'fit-content' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {NAV_SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`docs-nav-btn ${activeSection === s.id ? 'active' : ''}`}
                style={{
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  color: activeSection === s.id ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  backgroundColor: activeSection === s.id ? 'var(--accent-blue-dim)' : 'transparent',
                  fontWeight: activeSection === s.id ? '700' : '500',
                  cursor: 'pointer',
                  fontSize: '15px',
                  transition: 'all 0.2s ease'
                }}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        <main style={{ minWidth: 0 }}>
          <section id="overview" className="doc-section reveal" ref={addToRefs} style={{ marginBottom: '80px' }}>
            <h2 style={{ fontSize: '32px', marginBottom: '24px', fontWeight: '800' }}>Overview</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '17px', lineHeight: '1.8' }}>
              Virtmcu is a specialized framework designed to bridge the gap between **QEMU** (a high-performance emulator) and **Renode** (a flexible embedded systems simulator). It enables developers to define hardware using Renode's `.repl` files while leveraging QEMU's native execution speed.
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '17px', lineHeight: '1.8' }}>
              By integrating with **FirmwareStudio**, Virtmcu provides a seamless workflow for developing, testing, and synchronizing firmware with physical-world simulations.
            </p>
          </section>

          <section id="installation" className="doc-section reveal" ref={addToRefs} style={{ marginBottom: '80px' }}>
            <h2 style={{ fontSize: '32px', marginBottom: '24px', fontWeight: '800' }}>Installation</h2>
            <div style={{ background: 'white', padding: '32px', borderRadius: '16px', border: '1px solid var(--border-primary)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '12px', fontWeight: '700' }}>1. Clone the Repository</h3>
              <pre className="mono" style={{ background: '#0F172A', color: '#F8FAFC', padding: '20px', borderRadius: '10px', marginBottom: '24px', overflowX: 'auto', fontSize: '14px' }}>
                git clone https://github.com/RefractSystems/virtmcu.git<br />
                cd virtmcu
              </pre>
              <h3 style={{ fontSize: '20px', marginBottom: '12px', fontWeight: '700' }}>2. Install Dependencies</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Ensure you have Python 3.10+ and the required build tools installed.</p>
              <pre className="mono" style={{ background: '#0F172A', color: '#F8FAFC', padding: '20px', borderRadius: '10px', overflowX: 'auto', fontSize: '14px' }}>
                pip install -r requirements.txt
              </pre>
            </div>
          </section>

          <section id="architecture" className="doc-section reveal" ref={addToRefs} style={{ marginBottom: '80px' }}>
            <h2 style={{ fontSize: '32px', marginBottom: '24px', fontWeight: '800' }}>Architecture</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              {[
                { title: 'Patched QEMU', desc: 'Custom arm-generic-fdt patches for dynamic machine loading.' },
                { title: 'repl2qemu', desc: 'Sophisticated translator for Renode platform descriptions.' },
                { title: 'Native Plugins', desc: 'High-performance models written in C and Rust.' },
                { title: 'Zenoh Sync', desc: 'Real-time clock synchronization for physical simulation.' }
              ].map((item, i) => (
                <div key={i} style={{ padding: '24px', background: 'white', borderRadius: '12px', border: '1px solid var(--border-primary)', boxShadow: 'var(--shadow-sm)' }}>
                  <h4 style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--accent-blue)', fontWeight: '700' }}>{item.title}</h4>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="usage" className="doc-section reveal" ref={addToRefs} style={{ marginBottom: '80px' }}>
            <h2 style={{ fontSize: '32px', marginBottom: '24px', fontWeight: '800' }}>Usage</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '17px' }}>
              Generate a Device Tree Blob from your Renode platform description:
            </p>
            <pre className="mono" style={{ background: '#0F172A', color: '#F8FAFC', padding: '20px', borderRadius: '10px', marginBottom: '24px', overflowX: 'auto', fontSize: '14px' }}>
              ./repl2qemu.py platforms/stm32f4.repl -o build/stm32f4.dtb
            </pre>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '17px' }}>
              Launch the simulation with dynamic hardware:
            </p>
            <pre className="mono" style={{ background: '#0F172A', color: '#F8FAFC', padding: '20px', borderRadius: '10px', overflowX: 'auto', fontSize: '14px' }}>
              qemu-system-arm -machine virtmcu,fdt=build/stm32f4.dtb -kernel firmware.bin
            </pre>
          </section>
        </main>
      </div>

      <Footer />
    </>
  );
}
