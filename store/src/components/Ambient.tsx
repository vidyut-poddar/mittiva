"use client";

import { useEffect, useRef } from "react";

/**
 * Ambient forest atmosphere — god-rays + drifting mist (CSS) and a floating-leaf
 * particle canvas (JS), ported from the Jeevi Herbals mock. Respects
 * prefers-reduced-motion (canvas is hidden via CSS in that case).
 */
const LEAF_COLORS = [
  "rgba(132, 146, 131, 0.4)", // sage
  "rgba(139, 112, 98, 0.35)", // terracotta clay
  "rgba(222, 205, 191, 0.3)", // warm sand
  "rgba(212, 163, 67, 0.25)", // theme gold
];

export default function Ambient() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    type Leaf = {
      x: number; y: number; size: number; speedY: number; speedX: number;
      color: string; angle: number; spin: number; sway: number; swaySpeed: number;
    };
    const reset = (l: Leaf, firstLoad = false): Leaf => {
      l.x = Math.random() * canvas.width;
      l.y = firstLoad ? Math.random() * canvas.height : -30;
      l.size = Math.random() * 8 + 8;
      l.speedY = Math.random() * 0.8 + 0.6;
      l.speedX = Math.random() * 0.4 - 0.2;
      l.color = LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)];
      l.angle = Math.random() * 360;
      l.spin = Math.random() * 0.6 - 0.3;
      l.sway = Math.random() * 10;
      l.swaySpeed = Math.random() * 0.02 + 0.015;
      return l;
    };

    const leaves: Leaf[] = Array.from({ length: 18 }, () =>
      reset({} as Leaf, true)
    );

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const l of leaves) {
        l.sway += l.swaySpeed;
        l.x += l.speedX + Math.sin(l.sway) * 0.4;
        l.y += l.speedY;
        l.angle += l.spin;
        if (l.y > canvas.height + 30 || l.x < -30 || l.x > canvas.width + 30) reset(l);

        ctx.save();
        ctx.translate(l.x, l.y);
        ctx.rotate((l.angle * Math.PI) / 180);
        ctx.fillStyle = l.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, l.size, l.size / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-l.size, 0);
        ctx.lineTo(l.size, 0);
        ctx.stroke();
        ctx.restore();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      <div className="god-rays" aria-hidden="true" />
      <div className="forest-mist" aria-hidden="true" />
      <canvas id="leafCanvas" ref={canvasRef} aria-hidden="true" />
    </>
  );
}

/** Attaches scroll-reveal to elements with .scroll-fade-in. Mount once. */
export function ScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".scroll-fade-in");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("visible"));
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            obs.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
  return null;
}
