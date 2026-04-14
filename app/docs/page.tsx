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

      <div
        className="docs-hero-bar"
        style={{ paddingTop: '160px', paddingBottom: '80px', textAlign: 'center' }}
      >
        <div className="docs-hero-inner" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="hero-eyebrow">[ DOCUMENTATION ]</div>
          <h1 style={{ fontSize: '48px', marginBottom: '24px' }}>Virtmcu Reference</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>
            Technical documentation for the high-performance QEMU/Renode bridge.
          </p>
        </div>
      </div>

      <div
        className="docs-content-wrapper"
        style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '0 24px' }}
      >
        <div className="docs-grid-layout">
          <aside className="docs-sidebar">
            <nav className="docs-side-nav">
              {NAV_SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`docs-nav-btn ${activeSection === s.id ? 'active' : ''}`}
                >
                  {s.label}
                </button>
              ))}
            </nav>
          </aside>

          <main className="docs-main-content">
            <section id="overview" className="doc-section reveal" ref={addToRefs}>
              <h2>Overview</h2>
              <p>
                Virtmcu is a **deterministic multi-node firmware simulation framework** built on
                QEMU 9.2.0. It acts as the QEMU layer of the **FirmwareStudio** digital twin
                platform, where a physics engine (MuJoCo) drives the master clock and QEMU runs
                firmware in lockstep with the physical world.
              </p>
              <p>
                Traditional emulators suffer from wall-clock scheduling jitter. Virtmcu solves this
                using **cooperative time slaving** and **virtual-timestamped message delivery** over
                the Zenoh federation bus, ensuring that multi-node interactions are 100%
                reproducible.
              </p>
            </section>

            <section id="installation" className="doc-section reveal" ref={addToRefs}>
              <h2>Installation</h2>
              <div className="docs-card">
                <h3>1. Clone and Submodules</h3>
                <pre className="mono">
                  git clone https://github.com/RefractSystems/virtmcu.git
                  <br />
                  cd virtmcu
                  <br />
                  git submodule update --init --recursive
                </pre>
                <h3>2. Setup Environment</h3>
                <p>
                  The setup script applies the <span className="mono">arm-generic-fdt</span> patches
                  and builds QEMU as a module-aware emulator.
                </p>
                <pre className="mono">
                  make setup
                  <br />
                  make venv
                  <br />
                  source .venv/bin/activate
                </pre>
              </div>
            </section>

            <section id="architecture" className="doc-section reveal" ref={addToRefs}>
              <h2>Architecture</h2>
              <p>
                Virtmcu is built on five architectural pillars designed to provide a deterministic
                boundary between firmware and physics.
              </p>
              <div className="docs-features-grid">
                {[
                  {
                    title: 'Cooperative Time Slaving',
                    desc: 'Hooks the TCG loop to block execution at quantum boundaries, waiting for external time grants via Zenoh.',
                  },
                  {
                    title: 'Deterministic Communication',
                    desc: 'Virtual-timestamped delivery for Ethernet and UART, ensuring causal ordering across nodes without wall-clock scheduling.',
                  },
                  {
                    title: 'SAL/AAL Boundary',
                    desc: 'Bridging firmware and physics. Translates raw MMIO register values into continuous physical properties like force and torque.',
                  },
                  {
                    title: 'Dynamic QOM Plugins',
                    desc: 'Eliminates recompiling QEMU. Peripherals compile to .so modules and are auto-discovered at runtime.',
                  },
                  {
                    title: 'Co-Simulation Models',
                    desc: 'SystemC TLM-2.0 integration for co-simulation with external Verilated models and FPGA hardware over UDP.',
                  },
                ].map((item, i) => (
                  <div key={i} className="docs-feature-item">
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="usage" className="doc-section reveal" ref={addToRefs}>
              <h2>Usage</h2>
              <p>
                Launch a simulation using a Renode <span className="mono">.repl</span> file as the
                platform description:
              </p>
              <pre className="mono">
                ./scripts/run.sh --repl platform.repl --kernel firmware.elf
              </pre>
              <p>To run in lockstep with a Zenoh time master (e.g., FirmwareStudio):</p>
              <pre className="mono">
                ./scripts/run.sh --dtb board.dtb --kernel firmware.elf \<br />
                &nbsp;&nbsp;-device zenoh-clock,node=0,router=tcp/localhost:7447
              </pre>
            </section>

            <section id="sync" className="doc-section reveal" ref={addToRefs}>
              <h2>Synchronization</h2>
              <p>
                Virtmcu supports three distinct clock modes to balance performance and precision:
              </p>
              <div className="docs-sync-box">
                <ul>
                  <li>
                    <strong>Standalone:</strong> Free-running TCG at maximum host speed. Used for
                    development and CI.
                  </li>
                  <li>
                    <strong>Slaved-Suspend:</strong> Cooperative halting at TB boundaries. ~95%
                    throughput. Recommended for most FirmwareStudio workloads.
                  </li>
                  <li>
                    <strong>Slaved-Icount:</strong> Exact nanosecond virtual time. Required for
                    firmware measuring sub-quantum intervals (PWM, µs DMA).
                  </li>
                </ul>
              </div>
            </section>

            <section id="faq" className="doc-section reveal" ref={addToRefs}>
              <h2>FAQ & Learning Path</h2>
              <div className="docs-features-grid">
                {[
                  {
                    q: 'How should I approach learning the system?',
                    a: 'Start with the tutorials in the `tutorial/` folder. Lessons 1 & 2 cover QEMU internals, 5 & 9 cover SystemC, and 7 covers the Zenoh message bus.',
                  },
                  {
                    q: 'Why no Python in the simulation loop?',
                    a: "Python's GIL and garbage collector introduce milliseconds of latency. We write native C plugins (.so files) that achieve near-native performance for MMIO. Python is strictly reserved for offline tooling.",
                  },
                  {
                    q: 'Why Zenoh instead of sockets?',
                    a: 'Standard sockets ruin determinism because the host OS network stack introduces random latency. Zenoh provides virtual-timestamped delivery across nodes, guaranteeing causal ordering.',
                  },
                  {
                    q: 'How do I add a new peripheral?',
                    a: 'Start with `hw/dummy/dummy.c` as a learning template. Do not copy-paste complex upstream QEMU peripheral code without understanding it; start simple and build up.',
                  },
                ].map((faq, i) => (
                  <div key={`faq-${i}`} className="docs-feature-item">
                    <h4>{faq.q}</h4>
                    <p>{faq.a}</p>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>

      <Footer />
    </>
  );
}
