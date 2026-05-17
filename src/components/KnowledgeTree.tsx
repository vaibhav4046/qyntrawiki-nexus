"use client";

import { useEffect, useRef, useMemo } from "react";
import { prepareWithSegments, measureNaturalWidth, type PreparedTextWithSegments } from "@chenglou/pretext";

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

interface LabelMetrics {
  width: number;
  prepared: PreparedTextWithSegments;
}

const FONT = "10px ui-monospace, monospace";

export default function KnowledgeTree({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const metricsRef = useRef<Map<string, LabelMetrics>>(new Map());

  // Pac-Man color palette
  const colors = useMemo(() => ({
    yellow: "#ffeb3b",
    yellowBright: "#ffff00",
    orange: "#ffca28",
    red: "#ff0000",
    pink: "#ffb8ff",
    cyan: "#00ffff",
    white: "#a0a0a0",
    blue: "#2121de",
  }), []);

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

    const centerX = canvas.getBoundingClientRect().width / 2;
    const centerY = canvas.getBoundingClientRect().height / 2;

    const nodes: Node[] = [
      // Root (Wiki hub)
      { x: centerX, y: centerY + 100, vx: 0, vy: 0, radius: 8, color: colors.yellow, connections: [1, 2, 3, 4], pulsePhase: 0, label: "Wiki", type: "root" },
      // Pages (upper branches)
      { x: centerX - 120, y: centerY + 20, vx: 0, vy: 0, radius: 5, color: colors.yellowBright, connections: [5, 6], pulsePhase: 1.2, label: "HydraDB", type: "page" },
      { x: centerX - 40, y: centerY - 60, vx: 0, vy: 0, radius: 5, color: colors.yellowBright, connections: [7], pulsePhase: 2.1, label: "Context", type: "page" },
      { x: centerX + 50, y: centerY - 40, vx: 0, vy: 0, radius: 5, color: colors.yellowBright, connections: [8, 9], pulsePhase: 0.8, label: "LLM Wiki", type: "page" },
      { x: centerX + 130, y: centerY + 30, vx: 0, vy: 0, radius: 5, color: colors.yellowBright, connections: [10], pulsePhase: 1.5, label: "Vector", type: "page" },
      // Sources (left branch - cyan)
      { x: centerX - 180, y: centerY - 40, vx: 0, vy: 0, radius: 3.5, color: colors.cyan, connections: [], pulsePhase: 0.3, label: "Source 1", type: "source" },
      { x: centerX - 160, y: centerY + 60, vx: 0, vy: 0, radius: 3.5, color: colors.cyan, connections: [], pulsePhase: 1.8, label: "Source 2", type: "source" },
      // Entities (middle branch - pink/orange)
      { x: centerX - 20, y: centerY - 130, vx: 0, vy: 0, radius: 4, color: colors.pink, connections: [11], pulsePhase: 2.5, label: "Entity", type: "entity" },
      { x: centerX + 100, y: centerY - 100, vx: 0, vy: 0, radius: 3.5, color: colors.cyan, connections: [], pulsePhase: 0.6, label: "Source 3", type: "source" },
      { x: centerX + 80, y: centerY - 10, vx: 0, vy: 0, radius: 4, color: colors.orange, connections: [], pulsePhase: 1.1, label: "Entity 2", type: "entity" },
      // Claims (right branch - red)
      { x: centerX + 190, y: centerY - 20, vx: 0, vy: 0, radius: 3.5, color: colors.red, connections: [], pulsePhase: 1.9, label: "Claim", type: "claim" },
      { x: centerX + 40, y: centerY - 180, vx: 0, vy: 0, radius: 3.5, color: colors.red, connections: [], pulsePhase: 0.9, label: "Claim 2", type: "claim" },
    ];

    // Pretext integration: measure all labels for precise positioning
    const metrics = metricsRef.current;
    metrics.clear();
    for (const node of nodes) {
      if (node.label) {
        const prepared = prepareWithSegments(node.label, FONT);
        const width = measureNaturalWidth(prepared);
        metrics.set(node.label, { width, prepared });
      }
    }

    const particles: Particle[] = [];
    let frame = 0;

    function spawnParticle() {
      const fromIdx = Math.floor(Math.random() * nodes.length);
      const node = nodes[fromIdx];
      if (node.connections.length === 0) return;

      const toIdx = node.connections[Math.floor(Math.random() * node.connections.length)];
      const particleColors = [colors.yellow, colors.yellowBright, colors.orange, colors.red, colors.pink, colors.cyan];

      particles.push({
        x: node.x,
        y: node.y,
        fromNode: fromIdx,
        toNode: toIdx,
        progress: 0,
        speed: 0.005 + Math.random() * 0.008,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        size: 1 + Math.random() * 2,
      });
    }

    function draw() {
      if (!ctx || !canvas) return;
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Draw maze-like grid background (Pac-Man aesthetic)
      ctx.strokeStyle = "rgba(33, 33, 222, 0.08)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let gx = 0; gx < rect.width; gx += gridSize) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, rect.height);
        ctx.stroke();
      }
      for (let gy = 0; gy < rect.height; gy += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(rect.width, gy);
        ctx.stroke();
      }

      frame++;
      if (frame % 8 === 0) spawnParticle();

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        for (const connIdx of node.connections) {
          const target = nodes[connIdx];
          if (!target) continue;

          const gradient = ctx.createLinearGradient(node.x, node.y, target.x, target.y);
          gradient.addColorStop(0, "rgba(255, 235, 59, 0.1)");
          gradient.addColorStop(0.5, "rgba(255, 235, 59, 0.15)");
          gradient.addColorStop(1, "rgba(255, 235, 59, 0.1)");

          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          const midX = (node.x + target.x) / 2 + (Math.sin(frame * 0.01 + i) * 10);
          const midY = (node.y + target.y) / 2;
          ctx.quadraticCurveTo(midX, midY, target.x, target.y);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Glow effect on connections
          ctx.shadowColor = "rgba(255, 235, 59, 0.3)";
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

        // Label for root and pages using pretext-measured widths
        if (node.label && (node.type === "root" || node.type === "page")) {
          const metric = metrics.get(node.label);
          const labelWidth = metric ? metric.width : ctx.measureText(node.label).width;

          ctx.font = FONT;
          ctx.fillStyle = colors.white;
          ctx.textAlign = "center";

          // Use pretext width to offset label above node
          const labelY = node.y - r - 8;
          ctx.fillText(node.label, node.x, labelY);

          // Draw small dot (like Pac-Man pellet) under label
          ctx.beginPath();
          ctx.arc(node.x, labelY + 14, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = colors.yellow;
          ctx.fill();
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
  }, [colors]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full ${className}`}
      style={{ display: "block" }}
    />
  );
}
