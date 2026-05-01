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
  { id: 'curriculum', label: 'Masterclass Curriculum' },
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
          <h1 style={{ fontSize: '48px', marginBottom: '24px' }}>VirtMCU Reference</h1>
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
                VirtMCU is **The Matrix for Microcontrollers**—a globally deterministic, lockstep simulation framework built on
                QEMU 11.0.0. It allows you to boot thousands of microcontrollers, wire them via virtual buses, and synchronize them with 3D physics engines like MuJoCo or NVIDIA Omniverse.
              </p>
              <p>
                Unlike traditional emulators that suffer from wall-clock scheduling jitter, VirtMCU guarantees **zero-jitter execution** and **bit-for-bit reproducibility** across all nodes using the Zenoh federation bus. You run the exact same firmware binaries you deploy to real hardware.
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
                VirtMCU is engineered for absolute determinism, enabling you to escape the simulation trap and eradicate ghost bugs.
              </p>
              <div className="docs-features-grid">
                {[
                  {
                    title: 'Zero-Jitter Execution Engine',
                    desc: 'The core TCG loop runs decoupled from wall-clock time. Host OS preemption and thread pausing have zero impact on the simulated progression of time.',
                  },
                  {
                    title: 'SystemC TLM-2.0 Integration',
                    desc: 'Bring your Verilated hardware and FPGA IP directly into the simulation mesh over a high-throughput, low-latency UDP data plane.',
                  },
                  {
                    title: 'Rust-Native Extensibility',
                    desc: 'Write peripheral models in memory-safe Rust. Dynamic plugins load instantly via FFI boundaries without recompiling the QEMU core.',
                  },
                  {
                    title: 'Cyber-Physical Boundaries',
                    desc: 'Translate virtual MMIO register writes directly into simulated physical torque, force, and acceleration within physics engines.',
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
                VirtMCU supports three distinct clock modes to balance performance and precision:
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

            <section id="curriculum" className="doc-section reveal" ref={addToRefs}>
              <h2>The Masterclass Curriculum</h2>
              <p>
                The VirtMCU documentation is structured as a comprehensive Masterclass to take you from firmware basics to advanced distributed systems.
              </p>
              <div className="docs-features-grid">
                {[
                  {
                    title: 'Part I: Fundamentals',
                    desc: 'Deep dive into SoC Anatomy, MMIO, QEMU Architecture, the Object Model (QOM), and Parallel Discrete Event Simulation (PDES).',
                  },
                  {
                    title: 'Part IV: Practical Mastery',
                    desc: 'Interactive lessons on Dynamic Machines, Rust Migration, and parsing .repl to Device Trees (DTB).',
                  },
                  {
                    title: 'Part V: Distributed Systems',
                    desc: 'Master the Zenoh Clock, Co-Simulation, SystemC CAN bus integration, and Interactive UART across nodes.',
                  },
                  {
                    title: 'Part VIII: War Stories',
                    desc: 'Real-world debugging postmortems, including the FlexRay SIGSEGV, CI ASan Failures, and QEMU Plugin Visibility.',
                  },
                ].map((item, i) => (
                  <div key={i} className="docs-feature-item" style={{ borderLeft: '4px solid var(--accent-blue)' }}>
                    <h4>{item.title}</h4>
                    <p>{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="faq" className="doc-section reveal" ref={addToRefs}>
              <h2>FAQ</h2>
              <div className="docs-features-grid">
                {[
                  {
                    q: 'How should I approach learning the system?',
                    a: 'Follow the Masterclass Curriculum in order. Start with Part I to build fundamental intuition before writing code in Part IV.',
                  },
                  {
                    q: 'Why no Python in the simulation loop?',
                    a: "Python's GIL and garbage collector introduce milliseconds of latency. We write native Rust plugins or C (.so) files that achieve near-native performance for MMIO.",
                  },
                  {
                    q: 'Why Zenoh instead of standard UDP sockets?',
                    a: 'Standard sockets ruin determinism because the host OS network stack introduces random latency. Zenoh provides virtual-timestamped delivery across nodes, guaranteeing exact causal ordering.',
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
