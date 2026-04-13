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
              Virtmcu is a **deterministic multi-node firmware simulation framework** built on QEMU 11.0.0-rc3. It acts as the QEMU layer of the **FirmwareStudio** digital twin platform, where a physics engine (MuJoCo) drives the master clock and QEMU runs firmware in lockstep with the physical world.
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '17px', lineHeight: '1.8' }}>
              Traditional emulators suffer from wall-clock scheduling jitter. Virtmcu solves this using **cooperative time slaving** and **virtual-timestamped message delivery** over the Zenoh federation bus, ensuring that multi-node interactions are 100% reproducible.
            </p>
          </section>

          <section id="installation" className="doc-section reveal" ref={addToRefs} style={{ marginBottom: '80px' }}>
            <h2 style={{ fontSize: '32px', marginBottom: '24px', fontWeight: '800' }}>Installation</h2>
            <div style={{ background: 'white', padding: '32px', borderRadius: '16px', border: '1px solid var(--border-primary)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '20px', marginBottom: '12px', fontWeight: '700' }}>1. Clone and Submodules</h3>
              <pre className="mono" style={{ background: '#0F172A', color: '#F8FAFC', padding: '20px', borderRadius: '10px', marginBottom: '24px', overflowX: 'auto', fontSize: '14px' }}>
                git clone https://github.com/RefractSystems/virtmcu.git<br />
                cd virtmcu<br />
                git submodule update --init --recursive
              </pre>
              <h3 style={{ fontSize: '20px', marginBottom: '12px', fontWeight: '700' }}>2. Setup Environment</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>The setup script applies the <span className="mono">arm-generic-fdt</span> patches and builds QEMU as a module-aware emulator.</p>
              <pre className="mono" style={{ background: '#0F172A', color: '#F8FAFC', padding: '20px', borderRadius: '10px', overflowX: 'auto', fontSize: '14px' }}>
                make setup<br />
                make venv<br />
                source .venv/bin/activate
              </pre>
            </div>
          </section>

          <section id="architecture" className="doc-section reveal" ref={addToRefs} style={{ marginBottom: '80px' }}>
            <h2 style={{ fontSize: '32px', marginBottom: '24px', fontWeight: '800' }}>Architecture</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '17px' }}>
              Virtmcu is built on five architectural pillars designed to provide a deterministic boundary between firmware and physics.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              {[
                { title: 'Cooperative Time Slaving', desc: 'Hooks the TCG loop to block execution at quantum boundaries, waiting for external time grants via Zenoh.' },
                { title: 'Deterministic Networking', desc: 'Virtual-timestamped delivery for Ethernet and UART, ensuring causal ordering across nodes.' },
                { title: 'SAL/AAL Boundary', desc: 'Translates raw MMIO register values into continuous physical properties like force and torque.' },
                { title: 'Dynamic QOM Plugins', desc: 'Peripherals compile to .so modules and are auto-discovered at runtime via QEMU\'s module system.' },
                { title: 'arm-generic-fdt', desc: 'Instantiates ARM hardware entirely from a Device Tree blob at runtime. No hardcoded C machine structs.' }
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
              Launch a simulation using a Renode <span className="mono">.repl</span> file as the platform description:
            </p>
            <pre className="mono" style={{ background: '#0F172A', color: '#F8FAFC', padding: '20px', borderRadius: '10px', marginBottom: '24px', overflowX: 'auto', fontSize: '14px' }}>
              ./scripts/run.sh --repl platform.repl --kernel firmware.elf
            </pre>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '17px' }}>
              To run in lockstep with a Zenoh time master (e.g., FirmwareStudio):
            </p>
            <pre className="mono" style={{ background: '#0F172A', color: '#F8FAFC', padding: '20px', borderRadius: '10px', overflowX: 'auto', fontSize: '14px' }}>
              ./scripts/run.sh --dtb board.dtb --kernel firmware.elf \<br />
              &nbsp;&nbsp;-device zenoh-clock,node=0,router=tcp/localhost:7447
            </pre>
          </section>

          <section id="sync" className="doc-section reveal" ref={addToRefs} style={{ marginBottom: '80px' }}>
            <h2 style={{ fontSize: '32px', marginBottom: '24px', fontWeight: '800' }}>Synchronization</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '17px' }}>
              Virtmcu supports three distinct clock modes to balance performance and precision:
            </p>
            <div style={{ background: '#F8FAFC', padding: '32px', borderRadius: '16px', border: '1px solid var(--border-primary)' }}>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <li>
                  <strong style={{ color: 'var(--text-primary)' }}>Standalone:</strong> Free-running TCG at maximum host speed. Used for development and CI.
                </li>
                <li>
                  <strong style={{ color: 'var(--text-primary)' }}>Slaved-Suspend:</strong> Cooperative halting at TB boundaries. ~95% throughput. Recommended for most FirmwareStudio workloads.
                </li>
                <li>
                  <strong style={{ color: 'var(--text-primary)' }}>Slaved-Icount:</strong> Exact nanosecond virtual time. Required for firmware measuring sub-quantum intervals (PWM, µs DMA).
                </li>
              </ul>
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </>
  );
}
