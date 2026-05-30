'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './slides.module.css';

export default function TalkSlidesPage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const slideRefs = useRef<(HTMLElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Set page-specific title and meta description dynamically in client component
  useEffect(() => {
    document.title = 'VirtMCU Deterministic Architecture | High-Performance Simulation Slides';
    
    // Set meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      'content',
      'Engineering Deterministic Cyber-Physical Worlds. High-speed emulation and cycle-accurate determinism via VirtMCU.'
    );
  }, []);

  useEffect(() => {
    const observerOptions = {
      root: containerRef.current,
      threshold: 0.5,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = slideRefs.current.findIndex((ref) => ref === entry.target);
          if (index !== -1) {
            setActiveSlide(index);
          }
        }
      });
    }, observerOptions);

    const currentSlideRefs = slideRefs.current;
    currentSlideRefs.forEach((slide) => {
      if (slide) observer.observe(slide);
    });

    return () => {
      currentSlideRefs.forEach((slide) => {
        if (slide) observer.unobserve(slide);
      });
    };
  }, []);

  const scrollToSlide = (index: number) => {
    const target = slideRefs.current[index];
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
      setActiveSlide(index);
    }
  };

  const registerSlideRef = (el: HTMLElement | null, index: number) => {
    slideRefs.current[index] = el;
  };

  return (
    <>
      {/* Back button */}
      <Link 
        href="/" 
        className={styles.backHomeBtn}
        id="back-home-button"
        title="Return to VirtMCU Homepage"
      >
        &larr; Back to Home
      </Link>

      {/* Slide Indicators Navigation */}
      <div 
        className={styles.navigationControls} 
        role="navigation" 
        aria-label="Slide Navigation"
        id="slides-navigation-menu"
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((index) => (
          <button
            key={index}
            className={`${styles.navIndicator} ${activeSlide === index ? styles.active : ''}`}
            onClick={() => scrollToSlide(index)}
            aria-label={`Jump to slide ${index + 1}`}
            aria-current={activeSlide === index ? 'true' : 'false'}
            id={`slide-nav-dot-${index}`}
            title={`Slide ${index + 1}`}
          />
        ))}
      </div>

      <div className={styles.presentation} ref={containerRef} id="presentation-container">
        
        {/* Slide 1: Title Slide */}
        <section 
          className={styles.slide} 
          ref={(el) => registerSlideRef(el, 0)}
          id="slide-section-0"
        >
          <div className={styles.slideContent} style={{ textAlign: 'left' }}>
            <h1>
              Engineering Deterministic<br />Cyber-Physical Worlds
            </h1>
            <p style={{ marginTop: '1rem' }}>
              Resolving the tension between high-speed emulation and cycle-accurate determinism via VirtMCU.
            </p>
            <div className={styles.timelineContainer} id="timeline-container-slide-1">
              <div className={styles.timelineLine}></div>
              <div className={styles.timelineTick} style={{ left: '13.5%' }}>
                <span className={styles.timelineLabel}>Q</span>
              </div>
              <div className={styles.timelineTick} style={{ left: '50%' }}>
                <span className={styles.timelineLabel}>Q+1</span>
              </div>
              <div className={styles.timelineTick} style={{ left: '86.2%' }}>
                <span className={styles.timelineLabel}>Q+2</span>
              </div>
            </div>
          </div>
        </section>

        {/* Slide 2: Bifurcation Diagram */}
        <section 
          className={styles.slide} 
          ref={(el) => registerSlideRef(el, 1)}
          id="slide-section-1"
        >
          <div className={styles.slideContent}>
            <h2 style={{ maxWidth: '100%' }}>
              Host OS Jitter Causes Chaotic Bifurcation
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', marginTop: '1rem' }} id="bifurcation-diagram-container">
              
              {/* Panel 1: Standard Emulators */}
              <div style={{ width: '100%' }}>
                <svg viewBox="0 0 900 230" style={{ width: '100%', height: 'auto', display: 'block' }} aria-hidden="true">
                  {/* Outer Border */}
                  <rect x="2" y="2" width="896" height="226" fill="#ffffff" stroke="#333333" strokeWidth="3" strokeLinejoin="miter"/>
                  
                  {/* Top-Left Title Badge */}
                  <rect x="15" y="15" width="160" height="28" fill="#ffffff" stroke="#333333" strokeWidth="2" strokeLinejoin="miter"/>
                  <text x="95" y="33" fontFamily="monospace" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#111111">Standard Emulators</text>
                  
                  {/* Left Initial Line */}
                  <line x1="30" y1="120" x2="210" y2="120" stroke="#333333" strokeWidth="3"/>
                  <text x="40" y="92" fontFamily="monospace" fontWeight="bold" fontSize="13" fill="#111111">Node A sends</text>
                  <text x="40" y="109" fontFamily="monospace" fontWeight="bold" fontSize="13" fill="#111111">msg at 100ns</text>
                  
                  {/* Tangled chaotic branches */}
                  {/* Branch 1 (Run 1) */}
                  <path d="M 210,120 L 240,95 L 280,110 L 320,80 L 360,95 L 400,65 L 450,65 L 480,45 L 580,45" fill="none" stroke="#6c757d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  
                  {/* Branch 2 (Run 2) */}
                  <path d="M 210,120 L 240,145 L 285,130 L 320,160 L 370,145 L 410,175 L 460,150 L 500,185 L 530,170 L 560,195 L 610,195" fill="none" stroke="#6c757d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  
                  {/* Chaos noise branches */}
                  <path d="M 240,95 L 280,75 L 340,95 L 380,80 L 440,110 L 500,95 L 550,110 L 600,85" fill="none" stroke="#adb5bd" strokeWidth="1.5" strokeDasharray="3,3" strokeLinecap="round"/>
                  <path d="M 280,110 L 330,125 L 370,110 L 420,135 L 480,120 L 530,140 L 590,115 L 630,130" fill="none" stroke="#adb5bd" strokeWidth="1.5" strokeDasharray="3,3" strokeLinecap="round"/>
                  <path d="M 285,130 L 325,115 L 365,135 L 415,115 L 465,135 L 525,120 L 575,145 L 640,110" fill="none" stroke="#adb5bd" strokeWidth="1.5" strokeDasharray="3,3" strokeLinecap="round"/>
                  <path d="M 320,160 L 360,175 L 410,160 L 450,185 L 510,160 L 555,180 L 605,160" fill="none" stroke="#adb5bd" strokeWidth="1.5" strokeDasharray="3,3" strokeLinecap="round"/>
                  <path d="M 370,145 L 400,125 L 450,145 L 490,130 L 540,150 L 580,135 L 620,150" fill="none" stroke="#adb5bd" strokeWidth="1.5" strokeDasharray="3,3" strokeLinecap="round"/>
                  
                  {/* Run 1 callout bubble */}
                  <polygon points="635,40 595,45 635,48" fill="#ffffff" stroke="#333333" strokeWidth="1.5"/>
                  <rect x="635" y="25" width="190" height="38" rx="2" fill="#ffffff" stroke="#333333" strokeWidth="1.5" strokeLinejoin="miter"/>
                  <text x="730" y="40" fontFamily="monospace" fontSize="10.5" fontWeight="bold" textAnchor="middle" fill="#111111">Run 1: Arrives First</text>
                  <text x="730" y="53" fontFamily="monospace" fontSize="10.5" fontWeight="bold" textAnchor="middle" fill="#111111">(Normal)</text>
                  
                  {/* Run 2 callout bubble */}
                  <polygon points="655,180 620,195 655,188" fill="#ffffff" stroke="#333333" strokeWidth="1.5"/>
                  <rect x="655" y="165" width="190" height="38" rx="2" fill="#ffffff" stroke="#333333" strokeWidth="1.5" strokeLinejoin="miter"/>
                  <text x="750" y="180" fontFamily="monospace" fontSize="10.5" fontWeight="bold" textAnchor="middle" fill="#111111">Run 2: Socket Jitter</text>
                  <text x="750" y="193" fontFamily="monospace" fontSize="10.5" fontWeight="bold" textAnchor="middle" fill="#111111">(Mutex Deadlock)</text>
                </svg>
              </div>
              
              {/* Panel 2: VirtMCU Coherence */}
              <div style={{ width: '100%' }}>
                <svg viewBox="0 0 900 230" style={{ width: '100%', height: 'auto', display: 'block' }} aria-hidden="true">
                  {/* Outer Border */}
                  <rect x="2" y="2" width="896" height="226" fill="#ffffff" stroke="#333333" strokeWidth="3" strokeLinejoin="miter"/>
                  
                  {/* Top-Left Title Badge */}
                  <rect x="15" y="15" width="160" height="28" fill="#ffffff" stroke="#333333" strokeWidth="2" strokeLinejoin="miter"/>
                  <text x="95" y="33" fontFamily="monospace" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#111111">VirtMCU Coherence</text>
                  
                  {/* Grid System Helper lines */}
                  <line x1="50" y1="70" x2="880" y2="70" stroke="#f1f3f5" strokeWidth="1.5"/>
                  <line x1="50" y1="90" x2="880" y2="90" stroke="#f1f3f5" strokeWidth="1.5"/>
                  <line x1="50" y1="110" x2="880" y2="110" stroke="#f1f3f5" strokeWidth="1.5"/>
                  <line x1="50" y1="130" x2="880" y2="130" stroke="#f1f3f5" strokeWidth="1.5"/>
                  <line x1="50" y1="150" x2="880" y2="150" stroke="#f1f3f5" strokeWidth="1.5"/>
                  <line x1="50" y1="170" x2="880" y2="170" stroke="#f1f3f5" strokeWidth="1.5"/>
                  <line x1="50" y1="190" x2="880" y2="190" stroke="#f1f3f5" strokeWidth="1.5"/>
                  
                  {/* Vertical coordinate axis */}
                  <line x1="50" y1="50" x2="50" y2="210" stroke="#adb5bd" strokeWidth="1.5"/>
                  <line x1="42" y1="50" x2="50" y2="50" stroke="#adb5bd" strokeWidth="1.5"/>
                  <line x1="42" y1="70" x2="50" y2="70" stroke="#adb5bd" strokeWidth="1.5"/>
                  <line x1="42" y1="90" x2="50" y2="90" stroke="#adb5bd" strokeWidth="1.5"/>
                  <line x1="42" y1="110" x2="50" y2="110" stroke="#adb5bd" strokeWidth="1.5"/>
                  <line x1="42" y1="130" x2="50" y2="130" stroke="#adb5bd" strokeWidth="1.5"/>
                  <line x1="42" y1="150" x2="50" y2="150" stroke="#adb5bd" strokeWidth="1.5"/>
                  <line x1="42" y1="170" x2="50" y2="170" stroke="#adb5bd" strokeWidth="1.5"/>
                  <line x1="42" y1="190" x2="50" y2="190" stroke="#adb5bd" strokeWidth="1.5"/>
                  <line x1="42" y1="210" x2="50" y2="210" stroke="#adb5bd" strokeWidth="1.5"/>
                  
                  {/* Horizontal coordinate axis */}
                  <line x1="50" y1="210" x2="880" y2="210" stroke="#adb5bd" strokeWidth="1.5"/>
                  <line x1="50" y1="210" x2="50" y2="216" stroke="#adb5bd" strokeWidth="1.5"/>
                  <line x1="80" y1="210" x2="80" y2="216" stroke="#adb5bd" strokeWidth="1.5"/>
                  <line x1="110" y1="210" x2="110" y2="216" stroke="#adb5bd" strokeWidth="1.5"/>
                  <line x1="140" y1="210" x2="140" y2="216" stroke="#adb5bd" strokeWidth="1.5"/>
                  <line x1="170" y1="210" x2="170" y2="216" stroke="#adb5bd" strokeWidth="1.5"/>
                  <line x1="200" y1="210" x2="200" y2="216" stroke="#adb5bd" strokeWidth="1.5"/>
                  <line x1="230" y1="210" x2="230" y2="216" stroke="#adb5bd" strokeWidth="1.5"/>
                  <line x1="260" y1="210" x2="260" y2="216" stroke="#adb5bd" strokeWidth="1.5"/>
                  <line x1="290" y1="210" x2="290" y2="216" stroke="#adb5bd" strokeWidth="1.5"/>
                  <line x1="320" y1="210" x2="320" y2="216" stroke="#adb5bd" strokeWidth="1.5"/>
                  <line x1="350" y1="210" x2="350" y2="216" stroke="#adb5bd" strokeWidth="1.5"/>
                  <line x1="380" y1="210" x2="380" y2="216" stroke="#adb5bd" strokeWidth="1.5"/>
                  <line x1="410" y1="210" x2="410" y2="216" stroke="#adb5bd" strokeWidth="1.5"/>
                  <line x1="440" y1="210" x2="440" y2="216" stroke="#adb5bd" strokeWidth="1.5"/>
                  <line x1="470" y1="210" x2="470" y2="216" stroke="#adb5bd" strokeWidth="1.5"/>
                  <line x1="500" y1="210" x2="500" y2="216" stroke="#adb5bd" strokeWidth="1.5"/>
                  <line x1="530" y1="210" x2="530" y2="216" stroke="#adb5bd" strokeWidth="1.5"/>
                  <line x1="560" y1="210" x2="560" y2="216" stroke="#adb5bd" strokeWidth="1.5"/>
                  <line x1="590" y1="210" x2="590" y2="216" stroke="#adb5bd" strokeWidth="1.5"/>
                  <line x1="620" y1="210" x2="620" y2="216" stroke="#adb5bd" strokeWidth="1.5"/>
                  <line x1="650" y1="210" x2="650" y2="216" stroke="#adb5bd" strokeWidth="1.5"/>
                  <line x1="680" y1="210" x2="680" y2="216" stroke="#adb5bd" strokeWidth="1.5"/>
                  <line x1="710" y1="210" x2="710" y2="216" stroke="#adb5bd" strokeWidth="1.5"/>
                  <line x1="740" y1="210" x2="740" y2="216" stroke="#adb5bd" strokeWidth="1.5"/>
                  <line x1="770" y1="210" x2="770" y2="216" stroke="#adb5bd" strokeWidth="1.5"/>
                  <line x1="800" y1="210" x2="800" y2="216" stroke="#adb5bd" strokeWidth="1.5"/>
                  <line x1="830" y1="210" x2="830" y2="216" stroke="#adb5bd" strokeWidth="1.5"/>
                  <line x1="860" y1="210" x2="860" y2="216" stroke="#adb5bd" strokeWidth="1.5"/>
                  
                  {/* Nodes text and boundaries */}
                  <text x="60" y="80" fontFamily="monospace" fontSize="13" fontWeight="bold" fill="#111111">Node A</text>
                  <text x="60" y="160" fontFamily="monospace" fontSize="13" fontWeight="bold" fill="#111111">Node B</text>
                  
                  {/* Coherent Node A and B timelines joining */}
                  <path d="M 50,90 L 440,90 L 450,130 L 440,170 L 50,170" fill="none" stroke="#6c757d" strokeWidth="3" strokeLinejoin="miter"/>
                  
                  {/* Bright Blue Barrier Line */}
                  <line x1="450" y1="35" x2="450" y2="225" stroke="#2563eb" strokeWidth="6"/>
                  
                  {/* Unified Output Blue Line */}
                  <line x1="450" y1="130" x2="870" y2="130" stroke="#2563eb" strokeWidth="6"/>
                  <text x="470" y="115" fontFamily="monospace" fontSize="13.5" fontWeight="bold" fill="#111111">State S1 (100% Reproducible)</text>
                </svg>
              </div>
              
            </div>
          </div>
        </section>

        {/* Slide 3: Architecture of Invariance */}
        <section 
          className={styles.slide} 
          ref={(el) => registerSlideRef(el, 2)}
          id="slide-section-2"
        >
          <div className={styles.slideContent}>
            <h2>
              The Architecture of Invariance
            </h2>
            <div className={styles.cardContainer} id="invariance-cards-grid">
              
              <div className={styles.card}>
                <h3>
                  Binary Fidelity
                </h3>
                <div className={styles.cardSvgContainer}>
                  <svg viewBox="0 0 240 100" style={{ width: '100%', height: '100%', maxWidth: '240px' }} aria-hidden="true">
                    {/* Document Icon */}
                    <path d="M15,10 L50,10 L65,25 L65,85 L15,85 Z" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinejoin="miter"/>
                    <path d="M50,10 L50,25 L65,25" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinejoin="miter"/>
                    
                    <text x="20" y="28" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#1e293b">01011</text>
                    <text x="20" y="39" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#1e293b">0110101</text>
                    <text x="20" y="50" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#1e293b">0111011</text>
                    <text x="20" y="61" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#1e293b">0110101</text>
                    <text x="20" y="72" fontFamily="monospace" fontSize="8" fontWeight="bold" fill="#1e293b">0110110</text>
                    
                    {/* Connection Arrow */}
                    <line x1="75" y1="48" x2="110" y2="48" stroke="#1e293b" strokeWidth="2"/>
                    <polygon points="110,44 118,48 110,52" fill="#1e293b"/>
                    
                    {/* CPU Chip */}
                    <rect x="135" y="18" width="60" height="60" rx="4" ry="4" fill="none" stroke="#1e293b" strokeWidth="2"/>
                    <circle cx="165" cy="48" r="18" fill="none" stroke="#1e293b" strokeWidth="1.5"/>
                    <text x="165" y="51" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#1e293b">CPU</text>
                    
                    {/* Top Pins */}
                    <line x1="145" y1="18" x2="145" y2="10" stroke="#1e293b" strokeWidth="2"/>
                    <line x1="155" y1="18" x2="155" y2="10" stroke="#1e293b" strokeWidth="2"/>
                    <line x1="165" y1="18" x2="165" y2="10" stroke="#1e293b" strokeWidth="2"/>
                    <line x1="175" y1="18" x2="175" y2="10" stroke="#1e293b" strokeWidth="2"/>
                    <line x1="185" y1="18" x2="185" y2="10" stroke="#1e293b" strokeWidth="2"/>
                    
                    {/* Bottom Pins */}
                    <line x1="145" y1="78" x2="145" y2="86" stroke="#1e293b" strokeWidth="2"/>
                    <line x1="155" y1="78" x2="155" y2="86" stroke="#1e293b" strokeWidth="2"/>
                    <line x1="165" y1="78" x2="165" y2="86" stroke="#1e293b" strokeWidth="2"/>
                    <line x1="175" y1="78" x2="175" y2="86" stroke="#1e293b" strokeWidth="2"/>
                    <line x1="185" y1="78" x2="185" y2="86" stroke="#1e293b" strokeWidth="2"/>
                    
                    {/* Left Pins */}
                    <line x1="135" y1="28" x2="127" y2="28" stroke="#1e293b" strokeWidth="2"/>
                    <line x1="135" y1="38" x2="127" y2="38" stroke="#1e293b" strokeWidth="2"/>
                    <line x1="135" y1="48" x2="127" y2="48" stroke="#1e293b" strokeWidth="2"/>
                    <line x1="135" y1="58" x2="127" y2="58" stroke="#1e293b" strokeWidth="2"/>
                    <line x1="135" y1="68" x2="127" y2="68" stroke="#1e293b" strokeWidth="2"/>
                    
                    {/* Right Pins */}
                    <line x1="195" y1="28" x2="203" y2="28" stroke="#1e293b" strokeWidth="2"/>
                    <line x1="195" y1="38" x2="203" y2="38" stroke="#1e293b" strokeWidth="2"/>
                    <line x1="195" y1="48" x2="203" y2="48" stroke="#1e293b" strokeWidth="2"/>
                    <line x1="195" y1="58" x2="203" y2="58" stroke="#1e293b" strokeWidth="2"/>
                    <line x1="195" y1="68" x2="203" y2="68" stroke="#1e293b" strokeWidth="2"/>
                  </svg>
                </div>
                <p>
                  The unmodified production firmware ELF runs natively. No simulation-only #ifdef macros. No mocks.
                </p>
              </div>

              <div className={styles.card}>
                <h3>
                  Global Determinism
                </h3>
                <div className={styles.cardSvgContainer}>
                  <svg viewBox="0 0 240 110" style={{ width: '100%', height: '100%', maxWidth: '240px' }} aria-hidden="true">
                    {/* Seed input arrow */}
                    <line x1="20" y1="25" x2="70" y2="25" stroke="#1e293b" strokeWidth="2"/>
                    <polygon points="70,21 78,25 70,29" fill="#1e293b"/>
                    <text x="45" y="16" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="10" fontWeight="500" textAnchor="middle" fill="#1e293b">seed</text>
                    
                    {/* Topology input arrow */}
                    <line x1="10" y1="65" x2="70" y2="65" stroke="#1e293b" strokeWidth="2"/>
                    <polygon points="70,61 78,65 70,69" fill="#1e293b"/>
                    <text x="35" y="56" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="10" fontWeight="500" textAnchor="middle" fill="#1e293b">topology</text>
                    
                    {/* Central Processing Box */}
                    <rect x="80" y="10" width="80" height="70" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinejoin="miter"/>
                    <line x1="120" y1="10" x2="120" y2="80" stroke="#1e293b" strokeWidth="2"/>
                    
                    {/* Function f */}
                    <text x="100" y="52" fontFamily="Georgia, serif" fontSize="28" fontStyle="italic" textAnchor="middle" fill="#1e293b">f</text>
                    
                    {/* Neural network graph */}
                    <line x1="130" y1="30" x2="152" y2="30" stroke="#1e293b" strokeWidth="1.5"/>
                    <line x1="130" y1="30" x2="152" y2="60" stroke="#1e293b" strokeWidth="1.5"/>
                    <line x1="130" y1="60" x2="152" y2="30" stroke="#1e293b" strokeWidth="1.5"/>
                    <line x1="130" y1="60" x2="152" y2="60" stroke="#1e293b" strokeWidth="1.5"/>
                    
                    <circle cx="130" cy="30" r="3" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5"/>
                    <circle cx="130" cy="60" r="3" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5"/>
                    <circle cx="152" cy="30" r="3" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5"/>
                    <circle cx="152" cy="60" r="3" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5"/>
                    
                    <path d="M152,30 C157,37 157,53 152,60" fill="none" stroke="#1e293b" strokeWidth="1.5"/>
                    
                    {/* Output Arrow */}
                    <line x1="170" y1="45" x2="220" y2="45" stroke="#1e293b" strokeWidth="2"/>
                    <polygon points="220,41 228,45 220,49" fill="#1e293b"/>
                    <text x="195" y="36" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="10" fontWeight="500" textAnchor="middle" fill="#1e293b">output</text>
                    
                    {/* Formula underneath */}
                    <text x="120" y="102" fontFamily="monospace" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#1e293b">f(seed, topology) = output</text>
                  </svg>
                </div>
                <p>
                  Given the same global seed and USDA topology, output is bit-identical across infinite runs. No reliance on rand() or host clocks.
                </p>
              </div>

              <div className={styles.card}>
                <h3>
                  Causal Ordering
                </h3>
                <div className={styles.cardSvgContainer}>
                  <svg viewBox="0 0 240 100" style={{ width: '100%', height: '100%', maxWidth: '240px' }} aria-hidden="true">
                    {/* Inputs arrows */}
                    <line x1="20" y1="24" x2="50" y2="24" stroke="#1e293b" strokeWidth="2"/>
                    <polygon points="50,20 58,24 50,28" fill="#1e293b"/>
                    
                    <line x1="20" y1="56" x2="50" y2="56" stroke="#1e293b" strokeWidth="2"/>
                    <polygon points="50,52 58,56 50,60" fill="#1e293b"/>
                    
                    <line x1="20" y1="88" x2="50" y2="88" stroke="#1e293b" strokeWidth="2"/>
                    <polygon points="50,84 58,88 50,92" fill="#1e293b"/>
                    
                    {/* Capsules P1, P2, P3 */}
                    <rect x="55" y="11" width="38" height="26" rx="4" ry="4" fill="none" stroke="#1e293b" strokeWidth="2"/>
                    <text x="74" y="27" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#1e293b">P1</text>
                    
                    <rect x="55" y="43" width="38" height="26" rx="4" ry="4" fill="none" stroke="#1e293b" strokeWidth="2"/>
                    <text x="74" y="59" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#1e293b">P2</text>
                    
                    <rect x="55" y="75" width="38" height="26" rx="4" ry="4" fill="none" stroke="#1e293b" strokeWidth="2"/>
                    <text x="74" y="91" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#1e293b">P3</text>
                    
                    {/* Output lines from capsules */}
                    <line x1="93" y1="24" x2="123" y2="24" stroke="#1e293b" strokeWidth="2"/>
                    <polygon points="123,20 131,24 123,28" fill="#1e293b"/>
                    
                    <line x1="93" y1="56" x2="123" y2="56" stroke="#1e293b" strokeWidth="2"/>
                    <polygon points="123,52 131,56 123,60" fill="#1e293b"/>
                    
                    <line x1="93" y1="88" x2="123" y2="88" stroke="#1e293b" strokeWidth="2"/>
                    <polygon points="123,84 131,88 123,92" fill="#1e293b"/>
                    
                    {/* Combined synchronization bracket */}
                    <rect x="135" y="6" width="35" height="106" rx="2" ry="2" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinejoin="miter"/>
                    
                    {/* Connecting output queues inside bracket */}
                    <line x1="142" y1="24" x2="162" y2="24" stroke="#1e293b" strokeWidth="1.5"/>
                    <line x1="142" y1="56" x2="162" y2="56" stroke="#1e293b" strokeWidth="1.5"/>
                    <line x1="142" y1="88" x2="162" y2="88" stroke="#1e293b" strokeWidth="1.5"/>
                    
                    <line x1="152" y1="24" x2="152" y2="88" stroke="#1e293b" strokeWidth="1.5"/>
                    
                    {/* Single Output Arrow coming out */}
                    <line x1="170" y1="56" x2="215" y2="56" stroke="#1e293b" strokeWidth="2"/>
                    <polygon points="215,52 223,56 215,60" fill="#1e293b"/>
                  </svg>
                </div>
                <p>
                  Messages are delivered strictly in the order they were sent in virtual time, immune to host network latency.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Slide 4: High-Speed Binary Fidelity via Dynamic Translation */}
        <section 
          className={styles.slide} 
          ref={(el) => registerSlideRef(el, 3)}
          id="slide-section-3"
        >
          <div className={styles.slideContent}>
            <h2>
              High-Speed Binary Fidelity via Dynamic Translation
            </h2>
            <p style={{ fontSize: '1.25rem', color: '#cbd5e1', marginBottom: '2rem' }}>
              Zero-timing-overhead injection. Direct execution at near-native speeds.
            </p>
            
            <div className={styles.pipeline} id="translation-pipeline-flow">
              <div className={styles.pipelineBox}>
                Guest Binary Opcode
              </div>
              <div className={styles.pipelineArrow}>➔</div>
              <div className={styles.pipelineBox}>
                TCG Frontend Translator
              </div>
              <div className={styles.pipelineArrow}>➔</div>
              <div className={styles.pipelineBox}>
                TCG IR Ops
              </div>
              <div className={styles.pipelineArrow}>➔</div>
              <div className={styles.pipelineBox}>
                TCG Backend Compiler
              </div>
              <div className={styles.pipelineArrow}>➔</div>
              <div className={styles.pipelineStack}>
                <div className={styles.pipelineBox} style={{ background: 'rgba(15, 23, 42, 0.4)', borderStyle: 'dashed' }}>
                  Translation Block (TB) Cache
                </div>
                <div className={styles.pipelineBox}>
                  Direct Host Machine Code Execution
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Slide 5: Routing the Physical Boundary via QOM and MMIO */}
        <section 
          className={styles.slide} 
          ref={(el) => registerSlideRef(el, 4)}
          id="slide-section-4"
        >
          <div className={styles.slideContent}>
            <h2>
              Routing the Physical Boundary via QOM and MMIO
            </h2>
            
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', marginTop: '1.5rem' }}>
              <svg viewBox="0 0 800 400" style={{ width: '100%', height: 'auto', maxWidth: '800px' }} aria-hidden="true">
                {/* Connecting blue paths/pipes */}
                {/* Guest -> softmmu */}
                <line x1="220" y1="145" x2="350" y2="145" stroke="#2563eb" strokeWidth="8"/>
                
                {/* softmmu -> BQL Warning */}
                <line x1="450" y1="145" x2="500" y2="145" stroke="#111111" strokeWidth="8"/>
                
                {/* softmmu -> QOM */}
                <line x1="400" y1="175" x2="400" y2="240" stroke="#2563eb" strokeWidth="8"/>
                
                {/* QOM -> Plugin paths */}
                <line x1="500" y1="312" x2="560" y2="312" stroke="#2563eb" strokeWidth="8"/>
                <line x1="560" y1="260" x2="560" y2="350" stroke="#2563eb" strokeWidth="8"/>
                <line x1="560" y1="260" x2="620" y2="260" stroke="#2563eb" strokeWidth="8"/>
                <line x1="560" y1="350" x2="620" y2="350" stroke="#2563eb" strokeWidth="8"/>
                
                {/* Guest Box */}
                <rect x="20" y="80" width="200" height="130" fill="#ffffff" stroke="#111111" strokeWidth="2" strokeLinejoin="miter"/>
                <text x="35" y="112" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="16" fontWeight="bold" fill="#111111">Guest</text>
                <text x="35" y="148" fontFamily="monospace" fontSize="12" fill="#111111">STR R1, [R0, #0x04]</text>
                <text x="35" y="168" fontFamily="monospace" fontSize="12" fill="#495057">// Write to PWM_DUTY</text>
                
                {/* QEMU softmmu Box */}
                <rect x="350" y="115" width="100" height="60" fill="#ffffff" stroke="#111111" strokeWidth="2" strokeLinejoin="miter"/>
                <text x="400" y="140" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="14" fontWeight="bold" textAnchor="middle" fill="#111111">QEMU</text>
                <text x="400" y="158" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="14" fontWeight="bold" textAnchor="middle" fill="#111111">softmmu</text>
                
                {/* BQL Warning Box */}
                <rect x="500" y="110" width="280" height="70" fill="#ffffff" stroke="#111111" strokeWidth="2" strokeLinejoin="miter"/>
                
                {/* Exclamation warning triangle */}
                <path d="M515,158 L527,132 L539,158 Z" fill="#000000" stroke="#000000" strokeWidth="1" strokeLinejoin="miter"/>
                <text x="527" y="154" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="13" fontWeight="900" textAnchor="middle" fill="#ffffff">!</text>
                
                <text x="555" y="132" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" fontWeight="bold" fill="#111111">Yields the Big QEMU Lock (BQL)</text>
                <text x="555" y="148" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" fontWeight="bold" fill="#111111">on external transaction to</text>
                <text x="555" y="164" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" fontWeight="bold" fill="#111111">guarantee main-loop safety.</text>
                
                {/* QEMU Object Model (QOM) Box */}
                <rect x="300" y="240" width="200" height="145" fill="#ffffff" stroke="#111111" strokeWidth="2" strokeLinejoin="miter"/>
                <text x="400" y="305" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="15" fontWeight="bold" textAnchor="middle" fill="#111111">QEMU Object Model</text>
                <text x="400" y="325" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="15" fontWeight="bold" textAnchor="middle" fill="#111111">(QOM)</text>
                
                {/* .so plugins (Rust) Box */}
                <rect x="620" y="230" width="160" height="60" fill="#ffffff" stroke="#111111" strokeWidth="2" strokeLinejoin="miter"/>
                <text x="700" y="256" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="13" fontWeight="bold" textAnchor="middle" fill="#111111">.so plugins</text>
                <text x="700" y="274" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="13" fontWeight="bold" textAnchor="middle" fill="#111111">(Rust)</text>
                
                {/* External engines (Unix Sockets) Box */}
                <rect x="620" y="320" width="160" height="60" fill="#ffffff" stroke="#111111" strokeWidth="2" strokeLinejoin="miter"/>
                <text x="700" y="346" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="13" fontWeight="bold" textAnchor="middle" fill="#111111">External engines</text>
                <text x="700" y="364" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="13" fontWeight="bold" textAnchor="middle" fill="#111111">(Unix Sockets)</text>
              </svg>
            </div>
          </div>
        </section>

        {/* Slide 6: The Causality Constraint in Distributed Systems */}
        <section 
          className={styles.slide} 
          ref={(el) => registerSlideRef(el, 5)}
          id="slide-section-5"
        >
          <div className={styles.slideContent}>
            <h2>
              The Causality Constraint in Distributed Systems
            </h2>
            
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', marginTop: '2rem' }}>
              <svg viewBox="0 0 800 380" style={{ width: '100%', height: 'auto', maxWidth: '800px' }} aria-hidden="true">
                {/* Node A Timeline Line */}
                <line x1="120" y1="80" x2="750" y2="80" stroke="#2563eb" strokeWidth="4"/>
                <polygon points="750,75 758,80 750,85" fill="#2563eb"/>
                <line x1="120" y1="68" x2="120" y2="92" stroke="#111111" strokeWidth="3"/>
                <text x="30" y="86" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="16" fontWeight="bold" fill="#111111">Node A</text>
                
                {/* Node A Tick 150ns */}
                <line x1="680" y1="70" x2="680" y2="90" stroke="#111111" strokeWidth="2"/>
                <text x="680" y="60" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="15" fontWeight="bold" textAnchor="middle" fill="#111111">150ns</text>
                
                {/* Node B Timeline Line */}
                <line x1="120" y1="200" x2="750" y2="200" stroke="#2563eb" strokeWidth="4"/>
                <polygon points="750,195 758,200 750,205" fill="#2563eb"/>
                <line x1="120" y1="188" x2="120" y2="212" stroke="#111111" strokeWidth="3"/>
                <text x="30" y="206" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="16" fontWeight="bold" fill="#111111">Node B</text>
                
                {/* Node B Red Cross at 100ns */}
                <line x1="463" y1="188" x2="487" y2="212" stroke="#dc3545" strokeWidth="4"/>
                <line x1="463" y1="212" x2="487" y2="188" stroke="#dc3545" strokeWidth="4"/>
                <text x="475" y="232" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="15" fontWeight="bold" textAnchor="middle" fill="#111111">100ns</text>
                
                {/* Diagonal Violation Dashed Connection */}
                <line x1="680" y1="80" x2="475" y2="200" stroke="#495057" strokeWidth="2" strokeDasharray="5,5"/>
                
                {/* Callout Box */}
                {/* Pointer pointer triangle */}
                <polygon points="550,188 505,200 550,208" fill="#ffffff" stroke="#111111" strokeWidth="2" strokeLinejoin="miter"/>
                <rect x="550" y="175" width="220" height="55" fill="#ffffff" stroke="#111111" strokeWidth="2" strokeLinejoin="miter"/>
                
                {/* Warning triangle in callout */}
                <path d="M562,210 L572,190 L582,210 Z" fill="#000000"/>
                <text x="572" y="207" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" fontWeight="900" textAnchor="middle" fill="#ffffff">!</text>
                
                <text x="590" y="196" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="12" fontWeight="bold" fill="#111111">Violation: Packet</text>
                <text x="590" y="212" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="12" fontWeight="500" fill="#111111">received from the future</text>
                
                {/* Local Causality Constraint Box */}
                <rect x="90" y="280" width="620" height="70" fill="#ffffff" stroke="#111111" strokeWidth="2" strokeLinejoin="miter"/>
                <text x="400" y="308" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="13" fontWeight="bold" textAnchor="middle" fill="#111111">
                  Local Causality Constraint (LCC): No event E at virtual time &tau;
                </text>
                <text x="400" y="330" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="13" fontWeight="bold" textAnchor="middle" fill="#111111">
                  can be affected by an event occurring at virtual time &tau;&prime; &gt; &tau;.
                </text>
              </svg>
            </div>
          </div>
        </section>

        {/* Slide 7: Enforcing Causality via the PDES Quantum Barrier */}
        <section 
          className={styles.slide} 
          ref={(el) => registerSlideRef(el, 6)}
          id="slide-section-6"
        >
          <div className={styles.slideContent} style={{ textAlign: 'center' }}>
            <h2>
              Enforcing Causality via the PDES Quantum Barrier
            </h2>
            
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', marginTop: '1.5rem' }}>
              <svg viewBox="0 0 800 340" style={{ width: '100%', height: 'auto', maxWidth: '800px' }} aria-hidden="true">
                {/* Node 0 (Fast) */}
                <text x="110" y="96" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="16" fontWeight="bold" textAnchor="end" fill="#111111">Node 0 (Fast)</text>
                <line x1="115" y1="91" x2="130" y2="91" stroke="#111111" strokeWidth="1.5"/>
                <rect x="130" y="80" width="100" height="22" fill="#343a40" stroke="#343a40" strokeWidth="1"/>
                <path d="M230,80 L385,80 L398,91 L385,102 L230,102 Z" fill="#f8f9fa" stroke="#adb5bd" strokeDasharray="3,3" strokeWidth="1.5"/>
                <line x1="230" y1="91" x2="385" y2="91" stroke="#adb5bd" strokeDasharray="3,3" strokeWidth="1.5"/>
                
                {/* Node 1 */}
                <text x="110" y="176" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="16" fontWeight="bold" textAnchor="end" fill="#111111">Node 1</text>
                <line x1="115" y1="171" x2="230" y2="171" stroke="#111111" strokeWidth="1.5"/>
                <rect x="230" y="160" width="100" height="22" fill="#343a40" stroke="#343a40" strokeWidth="1"/>
                <path d="M330,160 L385,160 L398,171 L385,182 L330,182 Z" fill="#f8f9fa" stroke="#adb5bd" strokeDasharray="3,3" strokeWidth="1.5"/>
                <line x1="330" y1="171" x2="385" y2="171" stroke="#adb5bd" strokeDasharray="3,3" strokeWidth="1.5"/>
                
                {/* Node 2 (Slow) */}
                <text x="110" y="256" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="16" fontWeight="bold" textAnchor="end" fill="#111111">Node 2 (Slow)</text>
                <line x1="115" y1="251" x2="330" y2="251" stroke="#111111" strokeWidth="1.5"/>
                <rect x="330" y="240" width="80" height="22" fill="#343a40" stroke="#343a40" strokeWidth="1"/>
                
                {/* Vertical Blue Barrier (1ms Quantum Boundary) */}
                <line x1="410" y1="50" x2="410" y2="310" stroke="#007bff" strokeWidth="12" strokeLinecap="square"/>
                <text x="410" y="38" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="13" fontWeight="bold" textAnchor="middle" fill="#495057">1ms Quantum Boundary</text>
                
                {/* DeterministicCoordinator crossing barrier */}
                <rect x="404" y="180" width="240" height="40" fill="#ffffff" stroke="#007bff" strokeWidth="2" strokeLinejoin="miter"/>
                <text x="524" y="205" fontFamily="monospace" fontSize="13" fontWeight="bold" textAnchor="middle" fill="#007bff">DeterministicCoordinator</text>
                
                {/* Arrow from Coordinator to next boundary */}
                <line x1="644" y1="200" x2="670" y2="200" stroke="#007bff" strokeWidth="6"/>
                <polygon points="666,194 676,200 666,206" fill="#007bff"/>
                
                {/* Next boundary (Advance to Q+1) */}
                <line x1="675" y1="50" x2="675" y2="310" stroke="#007bff" strokeWidth="2.5" strokeDasharray="5,5"/>
                <text x="675" y="38" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="13" fontWeight="bold" textAnchor="middle" fill="#007bff">Advance to Q+1</text>
              </svg>
            </div>
            
            <p style={{ fontSize: '1.4rem', color: '#212529', textAlign: 'center', marginTop: '2.5rem', lineHeight: '1.6' }}>
              Conservative Synchronization (Chandy-Misra-Bryant).<br />
              No speculative execution. No rollback overhead. Absolute causality.
            </p>
          </div>
        </section>

        {/* Slide 8: Structural Determinism: Canonical Sorting and the FIFO Seal */}
        <section 
          className={styles.slide} 
          ref={(el) => registerSlideRef(el, 7)}
          id="slide-section-7"
        >
          <div className={styles.slideContent}>
            <h2 style={{ maxWidth: '100%' }}>
              Structural Determinism: Canonical Sorting and the FIFO Seal
            </h2>
            
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', marginTop: '2rem' }}>
              <svg viewBox="0 0 800 320" style={{ width: '100%', height: 'auto', maxWidth: '800px' }} aria-hidden="true">
                {/* Vertical split divider line */}
                <line x1="400" y1="40" x2="400" y2="290" stroke="#e2e8f0" strokeWidth="2"/>
                
                {/* Left Column: The QuantumSeal */}
                <text x="200" y="38" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="16" fontWeight="bold" textAnchor="middle" fill="#111111">The QuantumSeal</text>
                
                {/* Buffer pipeline boundaries */}
                <line x1="10" y1="90" x2="300" y2="90" stroke="#111111" strokeWidth="2.5"/>
                <line x1="10" y1="154" x2="300" y2="154" stroke="#111111" strokeWidth="2.5"/>
                
                {/* Queue Data Frames */}
                {/* Data Frame 1 */}
                <rect x="28" y="98" width="72" height="46" fill="#ffffff" stroke="#111111" strokeWidth="2" strokeLinejoin="miter"/>
                <text x="64" y="118" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" textAnchor="middle" fill="#111111">Data</text>
                <text x="64" y="133" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" textAnchor="middle" fill="#111111">Frame 1</text>
                
                {/* Data Frame 2 */}
                <rect x="108" y="98" width="72" height="46" fill="#ffffff" stroke="#111111" strokeWidth="2" strokeLinejoin="miter"/>
                <text x="144" y="118" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" textAnchor="middle" fill="#111111">Data</text>
                <text x="144" y="133" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" textAnchor="middle" fill="#111111">Frame 2</text>
                
                {/* QuantumSeal Box */}
                <rect x="188" y="98" width="100" height="46" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" strokeLinejoin="miter"/>
                <text x="238" y="118" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#111111">QuantumSeal</text>
                <text x="238" y="133" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="10.5" textAnchor="middle" fill="#111111">(Q, count=2)</text>
                
                {/* Blue Arrow pointing right */}
                <line x1="288" y1="121" x2="315" y2="121" stroke="#2563eb" strokeWidth="4"/>
                <polygon points="309,116 317,121 309,126" fill="#2563eb"/>
                
                {/* QuantumDone Box */}
                <rect x="317" y="110" width="76" height="22" fill="#ffffff" stroke="#2563eb" strokeWidth="1.5" strokeLinejoin="miter"/>
                <text x="355" y="125" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="9.5" fontWeight="bold" textAnchor="middle" fill="#111111">QuantumDone</text>
                
                {/* EBD Callout Box */}
                <polygon points="238,144 225,200 250,200" fill="#ffffff" stroke="#111111" strokeWidth="2"/>
                <rect x="50" y="200" width="270" height="66" fill="#ffffff" stroke="#111111" strokeWidth="2" strokeLinejoin="miter"/>
                <text x="185" y="220" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#111111">Egress-Before-Done (EBD)</text>
                <text x="185" y="238" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" textAnchor="middle" fill="#111111">Invariant ensures no silent &tau;</text>
                <text x="185" y="254" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" textAnchor="middle" fill="#111111">drops or time-travel panics.</text>
                
                {/* Right Column: The Canonical Sort */}
                <text x="600" y="38" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="16" fontWeight="bold" textAnchor="middle" fill="#111111">The Canonical Sort</text>
                
                {/* Table Header Row */}
                <rect x="470" y="80" width="260" height="35" fill="#ffffff" stroke="#111111" strokeWidth="2" strokeLinejoin="miter"/>
                <text x="600" y="102" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="13" fontWeight="bold" textAnchor="middle" fill="#111111">Coordinator Sorting Keys</text>
                
                {/* Table Row 1 */}
                <rect x="470" y="115" width="260" height="42" fill="#ffffff" stroke="#111111" strokeWidth="2" strokeLinejoin="miter"/>
                <line x1="510" y1="115" x2="510" y2="157" stroke="#111111" strokeWidth="2"/>
                <text x="490" y="141" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="13" fontWeight="bold" textAnchor="middle" fill="#111111">1.</text>
                <text x="520" y="141" fontFamily="monospace" fontSize="12" fill="#111111">delivery_vtime_ns</text>
                
                {/* Table Row 2 */}
                <rect x="470" y="157" width="260" height="42" fill="#ffffff" stroke="#111111" strokeWidth="2" strokeLinejoin="miter"/>
                <line x1="510" y1="157" x2="510" y2="199" stroke="#111111" strokeWidth="2"/>
                <text x="490" y="183" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="13" fontWeight="bold" textAnchor="middle" fill="#111111">2.</text>
                <text x="520" y="183" fontFamily="monospace" fontSize="12" fill="#111111">source_node_id</text>
                
                {/* Table Row 3 */}
                <rect x="470" y="199" width="260" height="42" fill="#ffffff" stroke="#111111" strokeWidth="2" strokeLinejoin="miter"/>
                <line x1="510" y1="199" x2="510" y2="241" stroke="#111111" strokeWidth="2"/>
                <text x="490" y="225" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="13" fontWeight="bold" textAnchor="middle" fill="#111111">3.</text>
                <text x="520" y="225" fontFamily="monospace" fontSize="12" fill="#111111">sequence_number</text>
              </svg>
            </div>
          </div>
        </section>

        {/* Slide 9: The Deterministic Coordinator as a Central Router */}
        <section 
          className={styles.slide} 
          ref={(el) => registerSlideRef(el, 8)}
          id="slide-section-8"
        >
          <div className={styles.slideContent}>
            <h2 style={{ maxWidth: '100%' }}>
              The Deterministic Coordinator as a Central Router
            </h2>
            
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', marginTop: '1.5rem' }}>
              <svg viewBox="0 0 800 340" style={{ width: '100%', height: 'auto', maxWidth: '800px' }} aria-hidden="true">
                {/* Connection lines */}
                {/* Node A -> Coordinator */}
                <line x1="400" y1="102" x2="400" y2="150" stroke="#111111" strokeWidth="2.5"/>
                {/* Node B -> Coordinator */}
                <line x1="220" y1="185" x2="280" y2="185" stroke="#111111" strokeWidth="2.5"/>
                {/* Physics Node -> Coordinator */}
                <line x1="400" y1="220" x2="400" y2="278" stroke="#111111" strokeWidth="2.5"/>
                {/* Node C -> Coordinator */}
                <line x1="520" y1="185" x2="580" y2="185" stroke="#111111" strokeWidth="2.5"/>
                
                {/* Banned Direct Peer-to-Peer Link (dashed red connection) */}
                <line x1="470" y1="90" x2="635" y2="164" stroke="#dc3545" strokeWidth="3" strokeDasharray="6,6"/>
                
                {/* Stop Octagon Sign */}
                <polygon points="535,112 565,112 585,132 585,162 565,182 535,182 515,162 515,132" fill="#cc0000" stroke="#ffffff" strokeWidth="2"/>
                {/* std::process::abort() banner */}
                <rect x="470" y="135" width="160" height="24" fill="#cc0000" rx="3" ry="3"/>
                <text x="550" y="151" fontFamily="monospace" fontSize="10.5" fontWeight="bold" textAnchor="middle" fill="#ffffff">std::process::abort()</text>
                
                {/* Node A Box */}
                <rect x="330" y="60" width="140" height="42" fill="#ffffff" stroke="#111111" strokeWidth="2" strokeLinejoin="miter"/>
                <text x="400" y="86" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="14" fontWeight="bold" textAnchor="middle" fill="#111111">Node A</text>
                
                {/* Node B Box */}
                <rect x="90" y="164" width="130" height="42" fill="#ffffff" stroke="#111111" strokeWidth="2" strokeLinejoin="miter"/>
                <text x="155" y="190" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="14" fontWeight="bold" textAnchor="middle" fill="#111111">Node B</text>
                
                {/* Central DeterministicCoordinator Box */}
                <rect x="280" y="150" width="240" height="70" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" strokeLinejoin="miter"/>
                <text x="400" y="180" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="13" fontWeight="bold" textAnchor="middle" fill="#111111">DeterministicCoordinator</text>
                <text x="400" y="199" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="12.5" textAnchor="middle" fill="#495057">(Sans-I/O State Machine)</text>
                
                {/* Physics Node Box */}
                <rect x="330" y="278" width="140" height="42" fill="#ffffff" stroke="#111111" strokeWidth="2" strokeLinejoin="miter"/>
                <text x="400" y="304" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="14" fontWeight="bold" textAnchor="middle" fill="#111111">Physics Node</text>
                
                {/* Node C Box */}
                <rect x="580" y="164" width="130" height="42" fill="#ffffff" stroke="#111111" strokeWidth="2" strokeLinejoin="miter"/>
                <text x="645" y="190" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="14" fontWeight="bold" textAnchor="middle" fill="#111111">Node C</text>
              </svg>
            </div>
            
            <p style={{ fontSize: '1.25rem', color: '#212529', textAlign: 'center', marginTop: '2rem', lineHeight: '1.6' }}>
              Topology is strictly declared in the World USDA. Direct node-to-node peer communication is<br />
              physically banned. If a link isn't declared, packets drop, isolating domains.
            </p>
          </div>
        </section>

        {/* Slide 10: Contextualizing VirtMCU in the EDA Landscape */}
        <section 
          className={styles.slide} 
          ref={(el) => registerSlideRef(el, 9)}
          id="slide-section-9"
        >
          <div className={styles.slideContent}>
            <h2 style={{ maxWidth: '100%' }}>
              Contextualizing VirtMCU in the EDA Landscape
            </h2>
            
            <table className={styles.comparisonTable} id="eda-comparison-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Synopsys Virtualizer/VDK</th>
                  <th>Arm Fast Models</th>
                  <th>IEEE 1666 (SystemC)</th>
                  <th className={styles.virtMcuCol}>VirtMCU</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Execution Engine</td>
                  <td>SystemC TLM-2.0</td>
                  <td>Proprietary JIT</td>
                  <td>User-defined</td>
                  <td className={styles.virtMcuCol}>Native Open-Source JIT (TCG)</td>
                </tr>
                <tr>
                  <td>Topology Configuration</td>
                  <td>Requires ESL tools</td>
                  <td>Static/Fixed</td>
                  <td>Hardcoded C++</td>
                  <td className={styles.virtMcuCol}>Dynamic SSoT Device Tree (FDT)</td>
                </tr>
                <tr>
                  <td>Determinism (Time)</td>
                  <td>Discrete Event</td>
                  <td>Virtual time</td>
                  <td>Discrete Event</td>
                  <td className={styles.virtMcuCol}>Strict PDES (Quantum Barrier)</td>
                </tr>
                <tr>
                  <td>Co-Sim Capabilities</td>
                  <td>Excellent</td>
                  <td>Limited (Arm-only)</td>
                  <td>Native</td>
                  <td className={styles.virtMcuCol}>Built-in (SystemC & Physics SHM)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Slide 11: FMI 3.0 Alignment and SystemC Interoperability */}
        <section 
          className={styles.slide} 
          ref={(el) => registerSlideRef(el, 10)}
          id="slide-section-10"
        >
          <div className={styles.slideContent}>
            <h2 style={{ maxWidth: '100%' }}>
              FMI 3.0 Alignment and SystemC Interoperability
            </h2>
            
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', marginTop: '2rem' }}>
              <svg viewBox="0 0 800 320" style={{ width: '100%', height: 'auto', maxWidth: '800px' }} aria-hidden="true">
                {/* Vertical split divider line */}
                <line x1="400" y1="40" x2="400" y2="290" stroke="#e2e8f0" strokeWidth="2"/>
                
                {/* Left Column: SystemC */}
                <text x="200" y="38" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="16" fontWeight="bold" textAnchor="middle" fill="#111111">SystemC</text>
                
                {/* QEMU vCPU thread Box */}
                <rect x="25" y="80" width="130" height="52" fill="#ffffff" stroke="#111111" strokeWidth="2" strokeLinejoin="miter"/>
                <text x="90" y="104" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="12.5" fontWeight="bold" textAnchor="middle" fill="#111111">QEMU</text>
                <text x="90" y="120" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="12.5" textAnchor="middle" fill="#111111">vCPU thread</text>
                
                {/* Arrow down to mmio-socket-bridge */}
                <line x1="90" y1="132" x2="90" y2="190" stroke="#111111" strokeWidth="2"/>
                <polygon points="86,182 90,190 94,182" fill="#111111"/>
                
                {/* mmio-socket-bridge Box */}
                <rect x="25" y="190" width="130" height="52" fill="#ffffff" stroke="#111111" strokeWidth="2" strokeLinejoin="miter"/>
                <text x="90" y="214" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#111111">mmio-socket-</text>
                <text x="90" y="230" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#111111">bridge</text>
                
                {/* Arrow mmio-socket-bridge -> SystemC Adapter */}
                <line x1="155" y1="216" x2="210" y2="216" stroke="#111111" strokeWidth="3"/>
                <polygon points="204,211 212,216 204,221" fill="#111111"/>
                <text x="182" y="234" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#2563eb">UNIX Socket</text>
                
                {/* SystemC Adapter Box */}
                <rect x="210" y="190" width="100" height="52" fill="#ffffff" stroke="#111111" strokeWidth="2" strokeLinejoin="miter"/>
                <text x="260" y="214" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="12.5" fontWeight="bold" textAnchor="middle" fill="#111111">SystemC</text>
                <text x="260" y="230" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="12.5" fontWeight="bold" textAnchor="middle" fill="#111111">Adapter</text>
                
                {/* Blue Arrow SystemC Adapter -> TLM-2.0 */}
                <line x1="310" y1="216" x2="340" y2="216" stroke="#2563eb" strokeWidth="2"/>
                <polygon points="334,212 340,216 334,220" fill="#2563eb"/>
                
                {/* TLM-2.0 transaction payloads Box */}
                <rect x="340" y="190" width="105" height="52" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" strokeLinejoin="miter"/>
                <text x="392" y="209" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="10" fontWeight="bold" textAnchor="middle" fill="#2563eb">TLM-2.0</text>
                <text x="392" y="222" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="10" fontWeight="bold" textAnchor="middle" fill="#2563eb">transaction</text>
                <text x="392" y="235" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="10" fontWeight="bold" textAnchor="middle" fill="#2563eb">payloads</text>
                
                {/* Right Column: FMI 3.0 / Physics */}
                <text x="600" y="38" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="16" fontWeight="bold" textAnchor="middle" fill="#111111">FMI 3.0 / Physics</text>
                
                {/* SimulationMaster Box */}
                <rect x="475" y="80" width="170" height="52" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" strokeLinejoin="miter"/>
                <text x="560" y="111" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="13.5" fontWeight="bold" textAnchor="middle" fill="#2563eb">SimulationMaster</text>
                
                {/* Thick vertical connection arrow */}
                <line x1="560" y1="132" x2="560" y2="242" stroke="#333333" strokeWidth="4"/>
                <polygon points="555,234 560,242 565,234" fill="#333333"/>
                <text x="510" y="185" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#2563eb">SHM futex</text>
                <text x="510" y="200" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#2563eb">doorbell</text>
                
                {/* External physics plant Box */}
                <rect x="475" y="242" width="170" height="52" fill="#ffffff" stroke="#2563eb" strokeWidth="2.5" strokeLinejoin="miter"/>
                <text x="560" y="268" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#2563eb">External physics</text>
                <text x="560" y="284" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#2563eb">plant</text>
                
                {/* Message Pills */}
                {/* ClockAdvanceReq */}
                <rect x="590" y="148" width="130" height="22" fill="#f1f5f9" rx="3" ry="3"/>
                <text x="655" y="163" fontFamily="monospace" fontSize="10.5" fontWeight="bold" textAnchor="middle" fill="#2563eb">ClockAdvanceReq</text>
                
                {/* doStep */}
                <rect x="592" y="200" width="190" height="22" fill="#f1f5f9" rx="3" ry="3"/>
                <text x="687" y="215" fontFamily="monospace" fontSize="10.5" fontWeight="bold" textAnchor="middle" fill="#333333">doStep(currentTime, h)</text>
                
                {/* doStep callout */}
                <polygon points="742,192 730,200 755,200" fill="#ffffff" stroke="#111111" strokeWidth="1.5"/>
                <rect x="670" y="152" width="122" height="42" fill="#ffffff" stroke="#111111" strokeWidth="1.5" strokeLinejoin="miter"/>
                <text x="731" y="164" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#111111">Advancing physics in</text>
                <text x="731" y="174" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#111111">exact lockstep with</text>
                <text x="731" y="184" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#111111">the PDES barrier.</text>
              </svg>
            </div>
          </div>
        </section>

        {/* Slide 12: Case Study: Software-Defined Vehicle (SDV) Zonal Architecture */}
        <section 
          className={styles.slide} 
          ref={(el) => registerSlideRef(el, 11)}
          id="slide-section-11"
        >
          <div className={styles.slideContent}>
            <h2 style={{ maxWidth: '100%' }}>
              Case Study: Software-Defined Vehicle (SDV) Zonal Architecture
            </h2>
            
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', marginTop: '1.5rem' }}>
              <svg viewBox="0 0 1000 400" style={{ width: '100%', height: 'auto', maxWidth: '1000px' }} aria-hidden="true">
                {/* 1. Diagonal connection lines (Automotive Ethernet) */}
                {/* Top-Left Zonal to Central Compute */}
                <line x1="280" y1="95" x2="440" y2="200" stroke="#2563eb" strokeWidth="5"/>
                {/* Bottom-Left Zonal to Central Compute */}
                <line x1="280" y1="305" x2="440" y2="200" stroke="#2563eb" strokeWidth="5"/>
                {/* Top-Right Zonal to Central Compute */}
                <line x1="720" y1="95" x2="560" y2="200" stroke="#2563eb" strokeWidth="5"/>
                {/* Bottom-Right Zonal to Central Compute */}
                <line x1="720" y1="305" x2="560" y2="200" stroke="#2563eb" strokeWidth="5"/>

                {/* 2. Actuator connection lines (CAN-FD) */}
                {/* Top-Left: 5 Actuators */}
                <line x1="160" y1="45" x2="240" y2="95" stroke="#495057" strokeWidth="2"/>
                <line x1="160" y1="70" x2="240" y2="95" stroke="#495057" strokeWidth="2"/>
                <line x1="160" y1="95" x2="240" y2="95" stroke="#495057" strokeWidth="2"/>
                <line x1="160" y1="120" x2="240" y2="95" stroke="#495057" strokeWidth="2"/>
                <line x1="160" y1="145" x2="240" y2="95" stroke="#495057" strokeWidth="2"/>

                {/* Bottom-Left: 5 Actuators */}
                <line x1="160" y1="255" x2="240" y2="305" stroke="#495057" strokeWidth="2"/>
                <line x1="160" y1="280" x2="240" y2="305" stroke="#495057" strokeWidth="2"/>
                <line x1="160" y1="305" x2="240" y2="305" stroke="#495057" strokeWidth="2"/>
                <line x1="160" y1="330" x2="240" y2="305" stroke="#495057" strokeWidth="2"/>
                <line x1="160" y1="355" x2="240" y2="305" stroke="#495057" strokeWidth="2"/>

                {/* Top-Right: 5 Actuators */}
                <line x1="840" y1="45" x2="760" y2="95" stroke="#495057" strokeWidth="2"/>
                <line x1="840" y1="70" x2="760" y2="95" stroke="#495057" strokeWidth="2"/>
                <line x1="840" y1="95" x2="760" y2="95" stroke="#495057" strokeWidth="2"/>
                <line x1="840" y1="120" x2="760" y2="95" stroke="#495057" strokeWidth="2"/>
                <line x1="840" y1="145" x2="760" y2="95" stroke="#495057" strokeWidth="2"/>

                {/* Bottom-Right: 5 Actuators */}
                <line x1="840" y1="255" x2="760" y2="305" stroke="#495057" strokeWidth="2"/>
                <line x1="840" y1="280" x2="760" y2="305" stroke="#495057" strokeWidth="2"/>
                <line x1="840" y1="305" x2="760" y2="305" stroke="#495057" strokeWidth="2"/>
                <line x1="840" y1="330" x2="760" y2="305" stroke="#495057" strokeWidth="2"/>
                <line x1="840" y1="355" x2="760" y2="305" stroke="#495057" strokeWidth="2"/>

                {/* 3. Central Compute Box */}
                <rect x="440" y="140" width="120" height="120" fill="#212529" stroke="#111111" strokeWidth="2.5" strokeLinejoin="miter"/>
                <text x="500" y="195" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="16" fontWeight="bold" textAnchor="middle" fill="#ffffff">Central</text>
                <text x="500" y="215" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="16" fontWeight="bold" textAnchor="middle" fill="#ffffff">Compute</text>

                {/* 4. Zonal Controllers */}
                {/* Top-Left Zonal Controller */}
                <rect x="240" y="70" width="100" height="50" fill="#343a40" stroke="#111111" strokeWidth="2" strokeLinejoin="miter"/>
                <text x="290" y="94" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#ffffff">Zonal</text>
                <text x="290" y="108" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#ffffff">Controller</text>

                {/* Bottom-Left Zonal Controller */}
                <rect x="240" y="280" width="100" height="50" fill="#343a40" stroke="#111111" strokeWidth="2" strokeLinejoin="miter"/>
                <text x="290" y="304" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#ffffff">Zonal</text>
                <text x="290" y="318" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#ffffff">Controller</text>

                {/* Top-Right Zonal Controller */}
                <rect x="660" y="70" width="100" height="50" fill="#343a40" stroke="#111111" strokeWidth="2" strokeLinejoin="miter"/>
                <text x="710" y="94" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#ffffff">Zonal</text>
                <text x="710" y="108" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#ffffff">Controller</text>

                {/* Bottom-Right Zonal Controller */}
                <rect x="660" y="280" width="100" height="50" fill="#343a40" stroke="#111111" strokeWidth="2" strokeLinejoin="miter"/>
                <text x="710" y="304" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#ffffff">Zonal</text>
                <text x="710" y="318" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#ffffff">Controller</text>

                {/* 5. Actuators (small gray blocks) */}
                {/* Top-Left stack */}
                <rect x="120" y="36" width="40" height="18" fill="#343a40" rx="2" ry="2"/>
                <rect x="120" y="61" width="40" height="18" fill="#343a40" rx="2" ry="2"/>
                <rect x="120" y="86" width="40" height="18" fill="#343a40" rx="2" ry="2"/>
                <rect x="120" y="111" width="40" height="18" fill="#343a40" rx="2" ry="2"/>
                <rect x="120" y="136" width="40" height="18" fill="#343a40" rx="2" ry="2"/>

                {/* Bottom-Left stack */}
                <rect x="120" y="246" width="40" height="18" fill="#343a40" rx="2" ry="2"/>
                <rect x="120" y="271" width="40" height="18" fill="#343a40" rx="2" ry="2"/>
                <rect x="120" y="296" width="40" height="18" fill="#343a40" rx="2" ry="2"/>
                <rect x="120" y="321" width="40" height="18" fill="#343a40" rx="2" ry="2"/>
                <rect x="120" y="346" width="40" height="18" fill="#343a40" rx="2" ry="2"/>

                {/* Top-Right stack */}
                <rect x="840" y="36" width="40" height="18" fill="#343a40" rx="2" ry="2"/>
                <rect x="840" y="61" width="40" height="18" fill="#343a40" rx="2" ry="2"/>
                <rect x="840" y="86" width="40" height="18" fill="#343a40" rx="2" ry="2"/>
                <rect x="840" y="111" width="40" height="18" fill="#343a40" rx="2" ry="2"/>
                <rect x="840" y="136" width="40" height="18" fill="#343a40" rx="2" ry="2"/>

                {/* Bottom-Right stack */}
                <rect x="840" y="246" width="40" height="18" fill="#343a40" rx="2" ry="2"/>
                <rect x="840" y="271" width="40" height="18" fill="#343a40" rx="2" ry="2"/>
                <rect x="840" y="296" width="40" height="18" fill="#343a40" rx="2" ry="2"/>
                <rect x="840" y="321" width="40" height="18" fill="#343a40" rx="2" ry="2"/>
                <rect x="840" y="346" width="40" height="18" fill="#343a40" rx="2" ry="2"/>

                {/* 6. Text Labels */}
                {/* Actuator label left-top */}
                <text x="105" y="85" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="12" fontWeight="bold" textAnchor="end" fill="#212529">Actuators</text>
                <text x="105" y="100" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" textAnchor="end" fill="#495057">(brakes, steering,</text>
                <text x="105" y="113" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" textAnchor="end" fill="#495057">sensors)</text>

                {/* Actuator label left-bottom */}
                <text x="105" y="295" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="12" fontWeight="bold" textAnchor="end" fill="#212529">Actuators</text>
                <text x="105" y="310" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" textAnchor="end" fill="#495057">(brakes, steering,</text>
                <text x="105" y="323" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" textAnchor="end" fill="#495057">sensors)</text>

                {/* Actuator label right-top */}
                <text x="895" y="85" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="12" fontWeight="bold" textAnchor="start" fill="#212529">Actuators</text>
                <text x="895" y="100" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" textAnchor="start" fill="#495057">(brakes, steering,</text>
                <text x="895" y="113" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" textAnchor="start" fill="#495057">sensors)</text>

                {/* Actuator label right-bottom */}
                <text x="895" y="295" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="12" fontWeight="bold" textAnchor="start" fill="#212529">Actuators</text>
                <text x="895" y="310" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" textAnchor="start" fill="#495057">(brakes, steering,</text>
                <text x="895" y="323" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" textAnchor="start" fill="#495057">sensors)</text>

                {/* CAN-FD labels */}
                {/* Top-Left */}
                <text x="195" y="60" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="10.5" fontWeight="bold" textAnchor="middle" fill="#495057">CAN-FD</text>
                <text x="195" y="140" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="10.5" fontWeight="bold" textAnchor="middle" fill="#495057">CAN-FD</text>

                {/* Bottom-Left */}
                <text x="195" y="270" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="10.5" fontWeight="bold" textAnchor="middle" fill="#495057">CAN-FD</text>
                <text x="195" y="350" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="10.5" fontWeight="bold" textAnchor="middle" fill="#495057">CAN-FD</text>

                {/* Top-Right */}
                <text x="805" y="60" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="10.5" fontWeight="bold" textAnchor="middle" fill="#495057">CAN-FD</text>
                <text x="805" y="140" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="10.5" fontWeight="bold" textAnchor="middle" fill="#495057">CAN-FD</text>

                {/* Bottom-Right */}
                <text x="805" y="270" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="10.5" fontWeight="bold" textAnchor="middle" fill="#495057">CAN-FD</text>
                <text x="805" y="350" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="10.5" fontWeight="bold" textAnchor="middle" fill="#495057">CAN-FD</text>

                {/* High-speed Automotive Ethernet Labels */}
                {/* Top-Left */}
                <text x="350" y="142" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#2563eb">High-speed</text>
                <text x="350" y="155" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#2563eb">Automotive</text>
                <text x="350" y="168" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#2563eb">Ethernet</text>

                {/* Bottom-Left */}
                <text x="350" y="235" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#2563eb">High-speed</text>
                <text x="350" y="248" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#2563eb">Automotive</text>
                <text x="350" y="261" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#2563eb">Ethernet</text>

                {/* Top-Right */}
                <text x="650" y="142" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#2563eb">High-speed</text>
                <text x="650" y="155" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#2563eb">Automotive</text>
                <text x="650" y="168" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#2563eb">Ethernet</text>

                {/* Bottom-Right */}
                <text x="650" y="235" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#2563eb">High-speed</text>
                <text x="650" y="248" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#2563eb">Automotive</text>
                <text x="650" y="261" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11" fontWeight="bold" textAnchor="middle" fill="#2563eb">Ethernet</text>
              </svg>
            </div>
            
            <p style={{ fontSize: '1.25rem', color: '#212529', textAlign: 'center', marginTop: '2rem', lineHeight: '1.6' }}>
              Validating a &ldquo;data center on wheels&rdquo;. Modeling complex protocol translations<br />
              and precise network timing bounds across legacy and gigabit domains.
            </p>
          </div>
        </section>

        {/* Slide 13: Enforcing Structural Isolation and Security */}
        <section 
          className={styles.slide} 
          ref={(el) => registerSlideRef(el, 12)}
          id="slide-section-12"
        >
          <div className={styles.slideContent}>
            <h2 style={{ maxWidth: '100%' }}>
              Enforcing Structural Isolation and Security
            </h2>
            
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', marginTop: '1.5rem' }}>
              <svg viewBox="0 0 900 320" style={{ width: '100%', height: 'auto', maxWidth: '900px' }} aria-hidden="true">
                {/* Diagonal red arrow representing SOM/IP packet */}
                <line x1="230" y1="90" x2="650" y2="230" stroke="#ff0000" strokeWidth="5"/>
                <polygon points="638,220 650,230 635,236" fill="#ff0000"/>

                {/* Left Zonal Controller Box */}
                <rect x="100" y="40" width="130" height="110" rx="3" fill="#ffffff" stroke="#333333" strokeWidth="3" strokeLinejoin="miter"/>
                <text x="165" y="88" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="14" fontWeight="bold" textAnchor="middle" fill="#111111">Zonal</text>
                <text x="165" y="108" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="14" fontWeight="bold" textAnchor="middle" fill="#111111">Controller</text>

                {/* Speech bubble pointer and packet callout box */}
                <polygon points="265,130 270,120 280,130" fill="#ffffff" stroke="#333333" strokeWidth="1.5"/>
                <rect x="250" y="130" width="140" height="42" fill="#ffffff" stroke="#333333" strokeWidth="1.5" strokeLinejoin="miter"/>
                <text x="320" y="147" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="10.5" fontWeight="bold" textAnchor="middle" fill="#111111">SOME/IP service</text>
                <text x="320" y="161" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="10.5" fontWeight="bold" textAnchor="middle" fill="#111111">discovery packet</text>

                {/* Right Zonal Controller Box */}
                <rect x="650" y="40" width="130" height="110" rx="3" fill="#ffffff" stroke="#333333" strokeWidth="3" strokeLinejoin="miter"/>
                <text x="715" y="88" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="14" fontWeight="bold" textAnchor="middle" fill="#111111">Zonal</text>
                <text x="715" y="108" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="14" fontWeight="bold" textAnchor="middle" fill="#111111">Controller</text>

                {/* CAN-FD Actuator Box */}
                <rect x="660" y="210" width="120" height="55" rx="3" fill="#ffffff" stroke="#333333" strokeWidth="3" strokeLinejoin="miter"/>
                <text x="720" y="233" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#111111">CAN-FD</text>
                <text x="720" y="250" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="12" fontWeight="bold" textAnchor="middle" fill="#111111">Actuator</text>

                {/* DeterministicCoordinator blocking line */}
                <line x1="480" y1="230" x2="510" y2="183" stroke="#ff0000" strokeWidth="5"/>

                {/* DeterministicCoordinator Box */}
                <rect x="240" y="230" width="300" height="50" fill="#000000" stroke="#000000" strokeWidth="1" strokeLinejoin="miter"/>
                <text x="390" y="261" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="15" fontWeight="bold" textAnchor="middle" fill="#ffffff">DeterministicCoordinator</text>

                {/* Collision/Explosion Bursts */}
                <line x1="495" y1="183" x2="525" y2="183" stroke="#ff0000" strokeWidth="3"/>
                <line x1="510" y1="168" x2="510" y2="198" stroke="#ff0000" strokeWidth="3"/>
                <line x1="500" y1="173" x2="520" y2="193" stroke="#ff0000" strokeWidth="3"/>
                <line x1="500" y1="193" x2="520" y2="173" stroke="#ff0000" strokeWidth="3"/>

                <polygon points="505,178 510,165 515,178" fill="#ff0000"/>
                <polygon points="515,188 510,201 505,188" fill="#ff0000"/>
                <polygon points="500,188 487,193 497,180" fill="#ff0000"/>
                <polygon points="520,178 533,173 523,186" fill="#ff0000"/>

                {/* Topology Violation Label */}
                <rect x="530" y="171" width="280" height="24" rx="3" ry="3" fill="#000000" strokeLinejoin="miter"/>
                <text x="670" y="187" fontFamily="monospace" fontSize="10.5" fontWeight="bold" textAnchor="middle" fill="#ffffff">Topology Violation: Link Undeclared</text>
              </svg>
            </div>
            
            <div style={{ border: '2px solid #333333', padding: '1.25rem', marginTop: '2.5rem', backgroundColor: '#ffffff' }}>
              <p style={{ fontSize: '1.2rem', color: '#212529', margin: 0, textAlign: 'center', lineHeight: '1.6', fontWeight: 500 }}>
                By declaring the exact network graph in the World USDA, VirtMCU mathematically<br />
                guarantees isolation boundaries. It proves to regulatory bodies that unintended<br />
                cross-zone traffic is structurally impossible in the simulated architecture.
              </p>
            </div>
          </div>
        </section>

        {/* Slide 14: The Unified Cyber-Physical Organism */}
        <section 
          className={styles.slide} 
          ref={(el) => registerSlideRef(el, 13)}
          id="slide-section-13"
        >
          <div className={styles.slideContent}>
            <h2 style={{ maxWidth: '100%' }}>
              The Unified Cyber-Physical Organism
            </h2>
            
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', marginTop: '1.5rem' }}>
              <svg viewBox="0 0 900 400" style={{ width: '100%', height: 'auto', maxWidth: '900px' }} aria-hidden="true">
                {/* 1. Curved blue connection arrows (Clockwise Cycle) */}
                {/* Top-Right curved arrow (Box 1 -> Box 3) */}
                <path d="M 330,90 Q 450,30 560,82" stroke="#2563eb" strokeWidth="5" fill="none"/>
                <polygon points="548,78 570,90 560,68" fill="#2563eb"/>

                {/* Right-Bottom curved arrow (Box 3 -> Box 2) */}
                <path d="M 725,215 Q 740,290 625,322" stroke="#2563eb" strokeWidth="5" fill="none"/>
                <polygon points="630,312 605,325 632,332" fill="#2563eb"/>

                {/* Left-Bottom curved arrow (Box 2 -> Box 1) */}
                <path d="M 295,325 Q 160,290 174,220" stroke="#2563eb" strokeWidth="5" fill="none"/>
                <polygon points="166,220 175,200 183,214" fill="#2563eb"/>

                {/* 2. Box 1: 1. Execution (QEMU) */}
                <rect x="20" y="50" width="310" height="150" fill="#ffffff" stroke="#333333" strokeWidth="3" strokeLinejoin="miter"/>
                <text x="35" y="80" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="14.5" fontWeight="bold" fill="#111111">1. Execution (QEMU)</text>
                <text x="35" y="112" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="12.5" fill="#212529">The SDV Zonal Controller executes a</text>
                <text x="35" y="130" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="12.5" fill="#212529">raw ELF binary via TCG at native</text>
                <text x="35" y="148" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="12.5" fill="#212529">speeds. It issues a brake command.</text>

                {/* 3. Box 3: 3. Routing & Physics (Standards) */}
                <rect x="570" y="50" width="310" height="165" fill="#ffffff" stroke="#333333" strokeWidth="3" strokeLinejoin="miter"/>
                <text x="585" y="80" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="14.5" fontWeight="bold" fill="#111111">3. Routing &amp; Physics (Standards)</text>
                <text x="585" y="105" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11.5" fill="#212529">The Coordinator sorts the message</text>
                <text x="585" y="121" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11.5" fill="#212529">canonically, triggers the FMI 3.0</text>
                <text x="585" y="137" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11.5" fill="#212529">compliant physics plant via the SHM</text>
                <text x="585" y="153" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11.5" fill="#212529">futex doorbell, calculates the new</text>
                <text x="585" y="169" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11.5" fill="#212529">vehicle dynamics vehicle dynamics,</text>
                <text x="585" y="185" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11.5" fill="#212529">and safely delivers the sensor</text>
                <text x="585" y="201" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="11.5" fill="#212529">feedback for Q+1.</text>

                {/* 4. Box 2: 2. Synchronization (PDES) */}
                <rect x="295" y="260" width="310" height="130" fill="#ffffff" stroke="#333333" strokeWidth="3" strokeLinejoin="miter"/>
                <text x="310" y="290" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="14.5" fontWeight="bold" fill="#111111">2. Synchronization (PDES)</text>
                <text x="310" y="320" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="12.5" fill="#212529">The command is caught perfectly</text>
                <text x="310" y="338" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="12.5" fill="#212529">at the 1ms Quantum Barrier. The</text>
                <text x="310" y="356" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="12.5" fill="#212529">node blocks, yielding the BQL,</text>
                <text x="310" y="374" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="12.5" fill="#212529">and sends a QuantumSeal.</text>
              </svg>
            </div>
          </div>
        </section>

        {/* Slide 15: The Unbroken Invariant */}
        <section 
          className={styles.slide} 
          ref={(el) => registerSlideRef(el, 14)}
          id="slide-section-14"
        >
          <div className={styles.slideContent}>
            <h2 style={{ maxWidth: '100%' }}>
              The Unbroken Invariant
            </h2>
            
            {/* Big central equation box */}
            <div style={{
              border: '3px solid #333333',
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              backgroundColor: '#ffffff',
              margin: '2rem 0',
              fontFamily: 'monospace',
              fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)',
              fontWeight: 'bold',
              color: '#111111',
              boxShadow: 'none',
              lineHeight: '1.4'
            }}>
              Simulation(ELF + USDA + Seed)<br />
              = Deterministic Truth
            </div>

            {/* Three columns grid */}
            <div style={{
              display: 'flex',
              gap: '1.5rem',
              marginTop: '2rem',
              width: '100%'
            }}>
              {/* Column 1 */}
              <div style={{
                flex: 1,
                border: '3px solid #333333',
                padding: '2rem 1.25rem',
                backgroundColor: '#ffffff',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: '#111111',
                  marginBottom: '1rem',
                  marginTop: 0
                }}>
                  JIT Speed
                </h3>
                <p style={{
                  fontSize: '1.05rem',
                  color: '#495057',
                  textAlign: 'center',
                  margin: 0,
                  lineHeight: '1.5'
                }}>
                  No instruction-level interpretation overhead.
                </p>
              </div>

              {/* Column 2 */}
              <div style={{
                flex: 1,
                border: '3px solid #333333',
                padding: '2rem 1.25rem',
                backgroundColor: '#ffffff',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: '#111111',
                  marginBottom: '1rem',
                  marginTop: 0
                }}>
                  Cycle-Accurate Causality
                </h3>
                <p style={{
                  fontSize: '1.05rem',
                  color: '#495057',
                  textAlign: 'center',
                  margin: 0,
                  lineHeight: '1.5'
                }}>
                  Parallel Discrete Event Simulation enforces the temporal core.
                </p>
              </div>

              {/* Column 3 */}
              <div style={{
                flex: 1,
                border: '3px solid #333333',
                padding: '2rem 1.25rem',
                backgroundColor: '#ffffff',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: '#111111',
                  marginBottom: '1rem',
                  marginTop: 0
                }}>
                  Enterprise Integration
                </h3>
                <p style={{
                  fontSize: '1.05rem',
                  color: '#495057',
                  textAlign: 'center',
                  margin: 0,
                  lineHeight: '1.5'
                }}>
                  Seamless SystemC, FMI 3.0, and OpenUSD bridging.
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
