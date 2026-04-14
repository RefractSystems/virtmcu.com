'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/client/firebase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const TERMINAL_SEQUENCE = [
  {
    delay: 600,
    type: 'cmd',
    text: '> ./scripts/run.sh --repl test/phase3/test_board.repl --kernel firmware.elf',
  },
  { delay: 400, type: 'info', text: '⏺ Parsing Renode platform description (.repl -> .dtb)...' },
  { delay: 300, type: 'info', text: '⏺ Applying YAML OpenUSD platform alignment...' },
  { delay: 500, type: 'success', text: '✓ Device Tree Blob generated: build/board.dtb' },
  {
    delay: 400,
    type: 'cmd',
    text: '> qemu-system-arm -machine arm-generic-fdt -hw-dtb build/board.dtb -nographic',
  },
  { delay: 300, type: 'info', text: '⏺ Initializing virtmcu QOM plugins...' },
  { delay: 100, type: 'detail', text: '  Module: hw-virtmcu-zenoh.so loaded' },
  { delay: 100, type: 'detail', text: '  Module: hw-virtmcu-sal-aal.so loaded' },
  {
    delay: 100,
    type: 'info',
    text: '⏺ Connecting to Zenoh Federation Bus (tcp/localhost:7447)...',
  },
  { delay: 400, type: 'success', text: '⏺ Clock Slaved: suspend mode (Physics Master: MuJoCo)' },
  { delay: 700, type: 'sep', text: ' ' },
  { delay: 200, type: 'info', text: '⏺ Booting firmware...' },
  { delay: 100, type: 'detail', text: '  [UART0] virtmcu: starting multi-node mesh' },
  { delay: 100, type: 'detail', text: '  [UART0] eth0: deterministic delivery active' },
  { delay: 100, type: 'detail', text: '  [UART0] Waiting for global T=0 boundary...' },
  { delay: 400, type: 'success', text: '✓ Lockstep active. Deterministic simulation running.' },
  { delay: 4000, type: 'reset', text: '' },
];

function AnimatedTerminal({
  sequence,
  title,
  className,
}: {
  sequence: Array<{ delay: number; type: string; text: string }>;
  title: string;
  className?: string;
}) {
  const [lines, setLines] = useState<Array<{ type: string; text: string }>>([]);
  const [cursor, setCursor] = useState(true);
  const bodyRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setCursor((c) => !c), 530);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [lines]);

  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setStarted(true);
      },
      { threshold: 0.2 },
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let idx = 0;
    let tid: ReturnType<typeof setTimeout>;

    const next = () => {
      if (idx >= sequence.length) return;
      const item = sequence[idx++];
      if (item.type === 'reset') {
        tid = setTimeout(() => {
          setLines([]);
          idx = 0;
          next();
        }, item.delay);
        return;
      }
      setLines((prev) => [...prev, { type: item.type, text: item.text }]);
      tid = setTimeout(next, item.delay);
    };

    tid = setTimeout(next, 800);
    return () => clearTimeout(tid);
  }, [started, sequence]);

  return (
    <div className={`terminal ${className || ''}`} ref={sectionRef}>
      <div className="terminal-header">
        <div className="terminal-dots">
          <span />
          <span />
          <span />
        </div>
        <span className="terminal-title">{title}</span>
      </div>
      <div className="terminal-body" ref={bodyRef}>
        {lines.map((line, i) => (
          <div key={i} className={`t-line t-${line.type}`}>
            {line.text}
          </div>
        ))}
        <span className={`t-cursor ${cursor ? 'on' : 'off'}`}>█</span>
      </div>
    </div>
  );
}

const features = [
  {
    title: 'Deterministic Multi-Node',
    desc: 'Virtual-timestamped Ethernet and UART delivery ensures reproducible results across distributed QEMU instances, immune to host jitter.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    title: 'Cooperative Time Slaving',
    desc: 'QEMU acts as a time-slave to physics engines like MuJoCo or NVIDIA Omniverse, advancing only when granted time quanta by the master clock.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    title: 'Dynamic QOM Plugins',
    desc: 'Compile peripherals in C or Rust as shared libraries. Load at runtime with -device — no QEMU recompilation required.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="20" height="8" rx="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" />
        <path d="M6 6h.01M6 18h.01" />
      </svg>
    ),
  },
  {
    title: 'SAL/AAL Boundary',
    desc: 'Sensor and Actuator Abstraction Layers translate raw MMIO registers into continuous physical properties (force, torque, acceleration).',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    title: 'Co-Simulation Models',
    desc: 'SystemC TLM-2.0 integration for co-simulation with external Verilated models and FPGA hardware over UDP.',
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
        <rect x="9" y="9" width="6" height="6" />
        <line x1="9" y1="1" x2="9" y2="4" />
        <line x1="15" y1="1" x2="15" y2="4" />
        <line x1="9" y1="20" x2="9" y2="23" />
        <line x1="15" y1="20" x2="15" y2="23" />
        <line x1="20" y1="9" x2="23" y2="9" />
        <line x1="20" y1="14" x2="23" y2="14" />
        <line x1="1" y1="9" x2="4" y2="9" />
        <line x1="1" y1="14" x2="4" y2="14" />
      </svg>
    ),
  },
];

export default function Home() {
  const [email, setEmail] = useState('');
  const [honeyPot, setHoneyPot] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle',
  );

  const revealRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        }),
      { threshold: 0.1 },
    );
    revealRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const addToRefs = useCallback((el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el);
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeyPot) {
      setSubscribeStatus('success');
      setEmail('');
      return;
    }
    setSubscribeStatus('loading');
    try {
      if (!db) throw new Error('Firestore not initialized');
      await addDoc(collection(db, 'subscribers'), {
        email,
        subscribedAt: serverTimestamp(),
        source: 'virtmcu_homepage',
        honeyPot: honeyPot,
      });
      setSubscribeStatus('success');
      setEmail('');
      setTimeout(() => setSubscribeStatus('idle'), 3000);
    } catch (error) {
      console.error('Error adding document: ', error);
      setSubscribeStatus('error');
    }
  };

  return (
    <>
      <Navbar activeSection="" />

      <main>
        {/* ── Hero ───────────────────────────────────────── */}
        <section className="hero">
          <h1 className="reveal" ref={addToRefs}>
            Deterministic multi-node simulation for firmware development and testing.
          </h1>
          <p className="reveal" ref={addToRefs}>
            virtmcu is a high-performance simulation framework built on QEMU, designed to run
            distributed firmware in lockstep with continuous physics engines.
          </p>
          <div className="hero-btns reveal" ref={addToRefs}>
            <Link href="https://github.com/RefractSystems/virtmcu" className="btn btn-cta">
              Get Started &rarr;
            </Link>
            <Link href="/docs" className="btn btn-outline">
              Read Documentation
            </Link>
          </div>

          <AnimatedTerminal sequence={TERMINAL_SEQUENCE} title="virtmcu — simulation-log" />
        </section>

        {/* ── Features ───────────────────────────────────── */}
        <section id="features" className="section-container">
          <div className="section-header reveal" ref={addToRefs}>
            <span className="section-label">THE FIVE PILLARS</span>
            <h2>Architected for Absolute Determinism</h2>
          </div>
          <div className="grid-features">
            {features.map((feature, i) => (
              <div key={i} className="feature-card reveal" ref={addToRefs}>
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Stats ───────────────────────────────────────── */}
        <section className="stats-band">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-val">600+</div>
              <div className="stat-label">MIPS TCG Throughput</div>
            </div>
            <div className="stat-item">
              <div className="stat-val">0ns</div>
              <div className="stat-label">Inter-node Timing Jitter</div>
            </div>
            <div className="stat-item">
              <div className="stat-val">Open</div>
              <div className="stat-label">Zenoh Federation Bus</div>
            </div>
          </div>
        </section>

        {/* ── CTA / Newsletter ────────────────────────────── */}
        <section id="updates" className="section-container">
          <div className="newsletter-wrapper reveal" ref={addToRefs}>
            <span className="section-label">STAY INFORMED</span>
            <h2>Get the Latest Updates on VirtMCU</h2>
            <p>
              Join our mailing list to receive technical updates on new peripheral models and
              synchronization features.
            </p>

            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <input
                type="text"
                name="company_url"
                value={honeyPot}
                onChange={(e) => setHoneyPot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0 }}
              />
              <div className="form-input-group">
                <input
                  type="email"
                  placeholder="Enter your email address..."
                  required
                  className="input-terminal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={subscribeStatus === 'loading' || subscribeStatus === 'success'}
                />
                <button
                  type="submit"
                  className="btn btn-cta"
                  disabled={subscribeStatus === 'loading' || subscribeStatus === 'success'}
                >
                  {subscribeStatus === 'loading'
                    ? 'Connecting...'
                    : subscribeStatus === 'success'
                      ? '✓ Subscribed'
                      : 'Subscribe →'}
                </button>
              </div>

              {subscribeStatus === 'success' && (
                <p style={{ color: '#7ee787', fontSize: '14px', marginTop: '1rem' }}>
                  System verified. You&apos;re on the list for major updates.
                </p>
              )}

              {subscribeStatus === 'error' && (
                <p style={{ color: 'red', fontSize: '14px', marginTop: '1rem' }}>
                  Connection failed. Please try again.
                </p>
              )}
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
