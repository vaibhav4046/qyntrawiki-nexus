"use client";

import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  connections: number[];
  pulsePhase: number;
  label?: string;
  type: "root" | "page" | "source" | "entity" | "claim";
}

interface Particle {
  x: number;
  y: number;
  fromNode: number;
  toNode: number;
  progress: number;
  speed: number;
  color: string;
  size: number;
}

export default function KnowledgeTree({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx!.scale(dpr, dpr);
    }

    resize();
    window.addEventListener("resize", resize);

    // Create tree structure
    const centerX = canvas.getBoundingClientRect().width / 2;
    const centerY = canvas.getBoundingClientRect().height / 2;

    const nodes: Node[] = [
      // Root
      { x: centerX, y: centerY + 100, vx: 0, vy: 0, radius: 6, color: "#f59e0b", connections: [1, 2, 3, 4], pulsePhase: 0, label: "Wiki", type: "root" },
      // Pages (upper branches)
      { x: centerX - 120, y: centerY + 20, vx: 0, vy: 0, radius: 4, color: "#fbbf24", connections: [5, 6], pulsePhase: 1.2, label: "HydraDB", type: "page" },
      { x: centerX - 40, y: centerY - 60, vx: 0, vy: 0, radius: 4, color: "#fbbf24", connections: [7], pulsePhase: 2.1, label: "Context", type: "page" },
      { x: centerX + 50, y: centerY - 40, vx: 0, vy: 0, radius: 4, color: "#fbbf24", connections: [8, 9], pulsePhase: 0.8, label: "LLM Wiki", type: "page" },
      { x: centerX + 130, y: centerY + 30, vx: 0, vy: 0, radius: 4, color: "#fbbf24", connections: [10], pulsePhase: 1.5, label: "Vector", type: "page" },
      // Sources (left branch)
      { x: centerX - 180, y: centerY - 40, vx: 0, vy: 0, radius: 3, color: "#60a5fa", connections: [], pulsePhase: 0.3, label: "Source 1", type: "source" },
      { x: centerX - 160, y: centerY + 60, vx: 0, vy: 0, radius: 3, color: "#60a5fa", connections: [], pulsePhase: 1.8, label: "Source 2", type: "source" },
      // Entities (middle branch)
      { x: centerX - 20, y: centerY - 130, vx: 0, vy: 0, radius: 3.5, color: "#fb923c", connections: [11], pulsePhase: 2.5, label: "Entity", type: "entity" },
      { x: centerX + 100, y: centerY - 100, vx: 0, vy: 0, radius: 3, color: "#60a5fa", connections: [], pulsePhase: 0.6, label: "Source 3", type: "source" },
      { x: centerX + 80, y: centerY - 10, vx: 0, vy: 0, radius: 3.5, color: "#fb923c", connections: [], pulsePhase: 1.1, label: "Entity 2", type: "entity" },
      // Claims (right branch)
      { x: centerX + 190, y: centerY - 20, vx: 0, vy: 0, radius: 3, color: "#f87171", connections: [], pulsePhase: 1.9, label: "Claim", type: "claim" },
      { x: centerX + 40, y: centerY - 180, vx: 0, vy: 0, radius: 3, color: "#f87171", connections: [], pulsePhase: 0.9, label: "Claim 2", type: "claim" },
    ];

    const particles: Particle[] = [];
    let frame = 0;

    function spawnParticle() {
      // Pick a random connection
      const fromIdx = Math.floor(Math.random() * nodes.length);
      const node = nodes[fromIdx];
      if (node.connections.length === 0) return;
      
      const toIdx = node.connections[Math.floor(Math.random() * node.connections.length)];
      const colors = ["#f59e0b", "#fbbf24", "#fb923c", "#ea580c", "#dc2626", "#60a5fa"];
      
      particles.push({
        x: node.x,
        y: node.y,
        fromNode: fromIdx,
        toNode: toIdx,
        progress: 0,
        speed: 0.005 + Math.random() * 0.008,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 1 + Math.random() * 2,
      });
    }

    function draw() {
      if (!ctx || !canvas) return;
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      frame++;
      if (frame % 8 === 0) spawnParticle();

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        for (const connIdx of node.connections) {
          const target = nodes[connIdx];
          if (!target) continue;

          const gradient = ctx.createLinearGradient(node.x, node.y, target.x, target.y);
          gradient.addColorStop(0, "rgba(245, 158, 11, 0.1)");
          gradient.addColorStop(0.5, "rgba(234, 88, 12, 0.15)");
          gradient.addColorStop(1, "rgba(245, 158, 11, 0.1)");

          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          // Bezier curve for organic branch look
          const midX = (node.x + target.x) / 2 + (Math.sin(frame * 0.01 + i) * 10);
          const midY = (node.y + target.y) / 2;
          ctx.quadraticCurveTo(midX, midY, target.x, target.y);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Glow effect on connections
          ctx.shadowColor = "rgba(245, 158, 11, 0.3)";
          ctx.shadowBlur = 8;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }

      // Draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const pulse = Math.sin(frame * 0.03 + node.pulsePhase) * 0.3 + 1;
        const r = node.radius * pulse;

        // Outer glow
        ctx.beginPath();
        ctx.arc(node.x, node.y, r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = node.color + "15";
        ctx.fill();

        // Middle glow
        ctx.beginPath();
        ctx.arc(node.x, node.y, r * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = node.color + "30";
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();

        // Label for root and pages
        if (node.type === "root" || node.type === "page") {
          ctx.font = "10px ui-monospace, monospace";
          ctx.fillStyle = "#a89f91";
          ctx.textAlign = "center";
          ctx.fillText(node.label || "", node.x, node.y - r - 6);
        }
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        const from = nodes[p.fromNode];
        const to = nodes[p.toNode];
        if (!from || !to) {
          particles.splice(i, 1);
          continue;
        }

        p.progress += p.speed;
        if (p.progress >= 1) {
          particles.splice(i, 1);
          continue;
        }

        // Bezier interpolation matching the connection curve
        const t = p.progress;
        const midX = (from.x + to.x) / 2 + (Math.sin(frame * 0.01 + p.fromNode) * 10);
        const midY = (from.y + to.y) / 2;
        
        p.x = (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * midX + t * t * to.x;
        p.y = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * midY + t * t * to.y;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Particle glow
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Trail
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        const prevT = Math.max(0, t - 0.05);
        const prevX = (1 - prevT) * (1 - prevT) * from.x + 2 * (1 - prevT) * prevT * midX + prevT * prevT * to.x;
        const prevY = (1 - prevT) * (1 - prevT) * from.y + 2 * (1 - prevT) * prevT * midY + prevT * prevT * to.y;
        ctx.lineTo(prevX, prevY);
        ctx.strokeStyle = p.color + "60";
        ctx.lineWidth = p.size * 0.5;
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      style={{ display: "block" }}
    />
  );
}
