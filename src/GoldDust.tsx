import { useEffect, useRef, useState } from "react";
import "./GoldDust.css";

interface Particle {
  id: number;
  x: number;
  y: number;
}

let idCounter = 0;

function GoldDust() {
  const layerRef = useRef<HTMLDivElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const lastSpawn = useRef(0);

  useEffect(() => {
    const layer = layerRef.current;
    const host = layer?.parentElement;
    if (!host) return;

    const spawn = (clientX: number, clientY: number) => {
      const now = performance.now();
      if (now - lastSpawn.current < 55) return;
      lastSpawn.current = now;

      const rect = host.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const id = idCounter++;

      setParticles((prev) => [...prev.slice(-16), { id, x, y }]);
      window.setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== id));
      }, 700);
    };

    const onPointerMove = (e: PointerEvent) => {
      spawn(e.clientX, e.clientY);
    };

    host.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => host.removeEventListener("pointermove", onPointerMove);
  }, []);

  return (
    <div className="gold-dust-layer" ref={layerRef} aria-hidden="true">
      {particles.map((p, i) => (
        <span
          key={p.id}
          className="gold-dust-particle"
          style={{
            left: p.x,
            top: p.y,
            // slight per-particle size variety for a less mechanical feel
            transform: `translate(-50%, -50%) scale(${0.7 + (i % 3) * 0.15})`,
          }}
        />
      ))}
    </div>
  );
}

export default GoldDust;
