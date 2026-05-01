'use client';

import { useEffect, useRef } from 'react';

export default function PremiumBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width: number, height: number;
    let mcus: Microcontroller[] = [];
    let packets: DataPacket[] = [];
    let connections: Connection[] = [];
    let animationFrameId: number;

    const NODE_COUNT = 30;
    const LIGHT_COLORS = ['#00f2fe', '#4facfe', '#70ff00', '#f093fb', '#ff9a9e'];

    class Microcontroller {
      x: number;
      y: number;
      sizeType: number;
      w: number;
      h: number;
      pinCount: number;
      pinLen: number;
      bodyColor: string;
      strokeColor: string;
      pinColor: string;

      constructor(x: number, y: number, sizeType: number) {
        this.x = x;
        this.y = y;
        this.sizeType = sizeType; // 0: Large, 1: Medium, 2: Small
        
        // Define dimensions based on sizeType
        if (sizeType === 0) {
            this.w = 36; this.h = 36; this.pinCount = 4; this.pinLen = 6;
        } else if (sizeType === 1) {
            this.w = 24; this.h = 24; this.pinCount = 3; this.pinLen = 4;
        } else {
            this.w = 14; this.h = 14; this.pinCount = 2; this.pinLen = 3;
        }

        this.bodyColor = '#f2f2f2'; // Light grey body
        this.strokeColor = '#d1d1d1'; // Slightly darker edge
        this.pinColor = '#cccccc'; // Grey pins
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.x, this.y);

        // 1. Draw Pins
        ctx.fillStyle = this.pinColor;
        const pinThickness = this.sizeType === 2 ? 1.5 : 2;
        const spacing = this.h / (this.pinCount + 1);

        for (let i = 1; i <= this.pinCount; i++) {
            const offset = -this.h/2 + (i * spacing) - pinThickness/2;
            // Left & Right
            ctx.fillRect(-this.w/2 - this.pinLen, offset, this.pinLen, pinThickness);
            ctx.fillRect(this.w/2, offset, this.pinLen, pinThickness);
            // Top & Bottom
            ctx.fillRect(offset, -this.h/2 - this.pinLen, pinThickness, this.pinLen);
            ctx.fillRect(offset, this.h/2, pinThickness, this.pinLen);
        }

        // 2. Draw Chip Body
        ctx.fillStyle = this.bodyColor;
        ctx.strokeStyle = this.strokeColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Modern rounded-rect chip
        ctx.roundRect(-this.w/2, -this.h/2, this.w, this.h, 2);
        ctx.fill();
        ctx.stroke();

        // 3. Identification dot (bottom right for light look)
        ctx.fillStyle = '#e0e0e0';
        ctx.beginPath();
        ctx.arc(this.w/2 - 4, this.h/2 - 4, this.w/10, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }

    class Connection {
      from: Microcontroller;
      to: Microcontroller;
      mid: { x: number; y: number };
      dist: number;

      constructor(from: Microcontroller, to: Microcontroller) {
        this.from = from;
        this.to = to;
        // Randomly route horizontal first or vertical first for Manhattan style
        if (Math.random() > 0.5) {
            this.mid = { x: this.to.x, y: this.from.y };
        } else {
            this.mid = { x: this.from.x, y: this.to.y };
        }
        this.dist = Math.abs(this.from.x - this.to.x) + Math.abs(this.from.y - this.to.y);
      }
    }

    class DataPacket {
      conn: Connection;
      progress: number;
      speed: number;
      color: string;
      size: number;

      constructor(connection: Connection) {
        this.conn = connection;
        this.progress = 0;
        this.speed = 0.003 + Math.random() * 0.007;
        this.color = LIGHT_COLORS[Math.floor(Math.random() * LIGHT_COLORS.length)];
        this.size = 1.5 + (1 - this.conn.from.sizeType * 0.3); // Scale packet size slightly with MCU size
      }

      update() {
        this.progress += this.speed;
      }

      draw() {
        if (!ctx) return;
        
        const d1 = Math.abs(this.conn.mid.x - this.conn.from.x) + Math.abs(this.conn.mid.y - this.conn.from.y);
        const totalDist = this.conn.dist;

        if (totalDist === 0) return;

        const threshold = d1 / totalDist;
        let x, y;

        if (this.progress < threshold) {
            const p = threshold === 0 ? 0 : this.progress / threshold;
            x = this.conn.from.x + (this.conn.mid.x - this.conn.from.x) * p;
            y = this.conn.from.y + (this.conn.mid.y - this.conn.from.y) * p;
        } else {
            const p = threshold === 1 ? 1 : (this.progress - threshold) / (1 - threshold);
            x = this.conn.mid.x + (this.conn.to.x - this.conn.mid.x) * p;
            y = this.conn.mid.y + (this.conn.to.y - this.conn.mid.y) * p;
        }

        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(x, y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    function init() {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      mcus = [];
      connections = [];
      packets = [];

      // Create 30 MCUs with distributed sizes
      for (let i = 0; i < NODE_COUNT; i++) {
          const x = 100 + Math.random() * (width - 200);
          const y = 100 + Math.random() * (height - 200);
          
          // Size Distribution: 6 Large, 10 Medium, 14 Small
          let sizeType;
          if (i < 6) sizeType = 0;
          else if (i < 16) sizeType = 1;
          else sizeType = 2;

          mcus.push(new Microcontroller(x, y, sizeType));
      }

      // Connect them based on proximity to create a "network"
      for (let i = 0; i < mcus.length; i++) {
          const neighbors = [...mcus]
              .map((m, index) => ({index, dist: Math.hypot(m.x - mcus[i].x, m.y - mcus[i].y)}))
              .filter(d => d.dist > 0)
              .sort((a, b) => a.dist - b.dist)
              .slice(0, 2); // Connect to 2 nearest

          neighbors.forEach(n => {
              connections.push(new Connection(mcus[i], mcus[n.index]));
          });
      }
    }

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, width, height);

      // Draw wiring harness (subtle background lines)
      ctx.strokeStyle = '#f5f5f5';
      ctx.lineWidth = 1;
      connections.forEach(c => {
          ctx.beginPath();
          ctx.moveTo(c.from.x, c.from.y);
          ctx.lineTo(c.mid.x, c.mid.y);
          ctx.lineTo(c.to.x, c.to.y);
          ctx.stroke();
      });

      // Spawn packets logic
      if (Math.random() > 0.94) {
          const conn = connections[Math.floor(Math.random() * connections.length)];
          if (conn) {
            packets.push(new DataPacket(conn));
          }
      }

      packets = packets.filter(p => p.progress < 1);
      packets.forEach(p => {
          p.update();
          p.draw();
      });

      mcus.forEach(m => m.draw());

      animationFrameId = requestAnimationFrame(animate);
    }

    init();
    animate();

    const handleResize = () => {
      init();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none',
        background: 'transparent',
      }}
    />
  );
}
