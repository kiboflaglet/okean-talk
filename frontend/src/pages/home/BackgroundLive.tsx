import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  maxOpacity: number;
  opacityDirection: number;
  opacitySpeed: number;
  driftX: number;
  driftY: number;
  born: boolean;
  bornAt: number;
  introOpacity: number;
}

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const COUNT = 200;
    const SPREAD_MS = 6000;

    starsRef.current = Array.from({ length: COUNT }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 0.045 + 0.008;

      return {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 1.8 + 0.25,
        opacity: 0,
        maxOpacity: Math.random() * 0.38 + 0.07,
        opacityDirection: Math.random() > 0.5 ? 1 : -1,
        opacitySpeed: Math.random() * 0.0018 + 0.0003,
        driftX: Math.cos(angle) * speed,
        driftY: Math.sin(angle) * speed,
        born: false,
        bornAt: Math.random() * SPREAD_MS,
        introOpacity: 0,
      };
    });

    startTimeRef.current = performance.now();

    const draw = (now: number) => {
      const elapsed = now - startTimeRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const star of starsRef.current) {
        if (!star.born) {
          if (elapsed < star.bornAt) continue;
          star.born = true;
        }

        const age = elapsed - star.bornAt;
        if (star.introOpacity < 1) {
          star.introOpacity = Math.min(1, age / 1400);
        }

        star.opacity += star.opacitySpeed * star.opacityDirection;
        if (star.opacity >= star.maxOpacity) {
          star.opacity = star.maxOpacity;
          star.opacityDirection = -1;
        }
        if (star.opacity <= star.maxOpacity * 0.15) {
          star.opacity = star.maxOpacity * 0.15;
          star.opacityDirection = 1;
        }

        star.x += star.driftX;
        star.y += star.driftY;

        if (star.x < -4) star.x = canvas.width + 4;
        if (star.x > canvas.width + 4) star.x = -4;
        if (star.y < -4) star.y = canvas.height + 4;
        if (star.y > canvas.height + 4) star.y = -4;

        const alpha = star.opacity * star.introOpacity;

        if (star.size > 1.3) {
          const r = star.size * 2.8;
          const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, r);
          glow.addColorStop(0, `rgba(200,218,255,${alpha * 0.25})`);
          glow.addColorStop(1, "rgba(200,218,255,0)");
          ctx.beginPath();
          ctx.arc(star.x, star.y, r, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(215,228,255,${alpha})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    />
  );
}