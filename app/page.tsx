'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/client/firebase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const TERMINAL_SEQUENCE = [
  { delay: 600, type: 'cmd', text: '> ./repl2qemu.py platforms/stm32f4.repl' },
  { delay: 400, type: 'info', text: '⏺ Parsing Renode platform description...' },
  { delay: 300, type: 'info', text: '⏺ Generating Device Tree Source (DTS)...' },
  { delay: 500, type: 'success', text: '✓ DTS generated: build/stm32f4.dts' },
  { delay: 400, type: 'cmd', text: '> dtc -I dts -O dtb build/stm32f4.dts -o build/stm32f4.dtb' },
  { delay: 300, type: 'info', text: '⏺ Compiling Device Tree Blob...' },
  { delay: 700, type: 'success', text: '✓ DTB compiled: build/stm32f4.dtb' },
  { delay: 800, type: 'sep', text: ' ' },
  { delay: 400, type: 'cmd', text: '> qemu-system-arm -machine virtmcu,fdt=build/stm32f4.dtb -nographic' },
  { delay: 200, type: 'info', text: '⏺ Initializing Virtmcu machine...' },
  { delay: 100, type: 'detail', text: '  CPU: Cortex-M4 @ 168MHz' },
  { delay: 100, type: 'detail', text: '  Memory: 1MB Flash, 192KB SRAM' },
  { delay: 100, type: 'info', text: '⏺ Hot-plugging Zenoh Time Master...' },
  { delay: 400, type: 'success', text: '⏺ Clock synchronized with MuJoCo (Physics: 1.0x RT)' },
  { delay: 700, type: 'sep', text: ' ' },
  { delay: 200, type: 'info', text: '⏺ Booting firmware...' },
  { delay: 100, type: 'detail', text: '  [UART0] Hello, Virtmcu World!' },
  { delay: 100, type: 'detail', text: '  [UART0] Initializing Zenoh networking...' },
  { delay: 100, type: 'detail', text: '  [UART0] Waiting for lockstep sync...' },
  { delay: 400, type: 'success', text: '✓ Lockstep active. Simulation running.' },
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
    title: 'Dynamic Hardware Modeling',
    desc: 'Load full hardware descriptions from Device Tree Blobs at runtime. No re-compilation required for peripheral changes.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="20" height="8" rx="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" />
        <path d="M6 6h.01M6 18h.01" />
      </svg>
    ),
  },
  {
    title: 'Renode Parity',
    desc: 'Run your existing Renode .repl platform files on QEMU. Benefit from Renode\'s flexibility and QEMU\'s native execution speed.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    title: 'Digital Twin Sync',
    desc: 'Deterministic lockstep synchronization with external physics engines like MuJoCo using the Zenoh protocol.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    title: 'Native Performance',
    desc: 'High-performance peripheral models written in C or Rust. Integrated directly into the QEMU Object Model (QOM).',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
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
          <div className="hero-eyebrow reveal" ref={addToRefs}>
            [ HIGH-PERFORMANCE FIRMWARE SIMULATION ]
          </div>
          <h1 className="reveal" ref={addToRefs}>
            Bridge the Gap Between Flexibility and Performance.
          </h1>
          <p className="reveal" ref={addToRefs}>
            Virtmcu enables embedded systems engineers to run Renode platforms on QEMU with native speed and deterministic Digital Twin synchronization.
          </p>
          <div className="hero-btns reveal" ref={addToRefs}>
            <Link href="https://github.com/RefractSystems/virtmcu" className="btn btn-cta">
              View on GitHub &rarr;
            </Link>
            <Link href="https://github.com/RefractSystems/virtmcu/blob/main/docs/ARCHITECTURE.md" className="btn btn-outline">
              Read Architecture
            </Link>
          </div>

          <AnimatedTerminal sequence={TERMINAL_SEQUENCE} title="virtmcu — simulation-log" />
        </section>

        {/* ── Features ───────────────────────────────────── */}
        <section id="features" className="section-container">
          <div className="section-header reveal" ref={addToRefs}>
            <span className="section-label">CORE CAPABILITIES</span>
            <h2>Designed for Modern Embedded Workflows</h2>
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
              <div className="stat-val">10x</div>
              <div className="stat-label">Faster than Interpreted Models</div>
            </div>
            <div className="stat-item">
              <div className="stat-val">100%</div>
              <div className="stat-label">Deterministic Sync</div>
            </div>
            <div className="stat-item">
              <div className="stat-val">GPL</div>
              <div className="stat-label">Open Source Core</div>
            </div>
          </div>
        </section>

        {/* ── CTA / Newsletter ────────────────────────────── */}
        <section id="updates" className="section-container">
          <div className="newsletter-wrapper reveal" ref={addToRefs}>
            <span className="section-label">STAY INFORMED</span>
            <h2>Get the Latest Updates on Virtmcu</h2>
            <p>Join our mailing list to receive technical updates on new peripheral models and synchronization features.</p>

            <form className="slop-free-form" onSubmit={handleSubscribe}>
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
