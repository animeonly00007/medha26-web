'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

type ShapeDef = {
  pos: [number, number, number];
  rot: [number, number, number];
  scale: number;
  geo: 'torusKnot' | 'octahedron' | 'icosahedron' | 'dodecahedron' | 'tetrahedron';
  color: string;
  speed: number;
};

const shapes: ShapeDef[] = [
  { pos: [-1.8, 0.4, 0], rot: [0.5, 0, 0.3], scale: 0.7, geo: 'torusKnot', color: '#EB2222', speed: 0.15 },
  { pos: [1.6, -0.5, -0.5], rot: [0.3, 0.5, 0], scale: 0.85, geo: 'octahedron', color: '#7A0F0A', speed: 0.12 },
  { pos: [0.2, 1.3, 0.6], rot: [0, 0.5, 0.2], scale: 0.55, geo: 'icosahedron', color: '#D91C1C', speed: 0.18 },
  { pos: [0.9, -1.1, 0.4], rot: [0.2, 0.8, 0], scale: 0.5, geo: 'dodecahedron', color: '#B41412', speed: 0.14 },
  { pos: [-0.8, -0.6, -1], rot: [0.4, 0.3, 0.5], scale: 0.4, geo: 'tetrahedron', color: '#EB2222', speed: 0.2 },
];

function FloatShape({ def, index }: { def: ShapeDef; index: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.getElapsedTime();
    mesh.current.rotation.x = def.rot[0] + t * def.speed;
    mesh.current.rotation.y = def.rot[1] + t * def.speed * 0.7;
    mesh.current.position.y = def.pos[1] + Math.sin(t * 0.6 + index) * 0.18;
  });

  return (
    <mesh ref={mesh} position={def.pos} rotation={def.rot} scale={def.scale}>
      {def.geo === 'torusKnot' && <torusKnotGeometry args={[0.6, 0.18, 80, 12]} />}
      {def.geo === 'octahedron' && <octahedronGeometry args={[0.8, 0]} />}
      {def.geo === 'icosahedron' && <icosahedronGeometry args={[0.6, 0]} />}
      {def.geo === 'dodecahedron' && <dodecahedronGeometry args={[0.55, 0]} />}
      {def.geo === 'tetrahedron' && <tetrahedronGeometry args={[0.7, 0]} />}
      <meshBasicMaterial color={def.color} wireframe />
    </mesh>
  );
}

function WireGroup() {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    const t = clock.getElapsedTime();
    group.current.rotation.y = t * 0.08;
    group.current.rotation.x = Math.sin(t * 0.2) * 0.12;
  });
  return (
    <group ref={group}>
      {shapes.map((def, i) => <FloatShape key={i} def={def} index={i} />)}
    </group>
  );
}

export function ExhibitionVisual() {
  return (
    <Canvas className="event-canvas" dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }}>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45} />
      <WireGroup />
    </Canvas>
  );
}

export function SoundwaveVisual() {
  return (
    <div className="soundwave-visual" aria-hidden="true">
      <div className="soundwave-rings">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="soundwave-ring" style={{ animationDelay: `${i * 0.45}s` }} />
        ))}
        <div className="soundwave-core" />
      </div>
      <div className="soundwave-bars">
        {Array.from({ length: 48 }, (_, i) => (
          <span key={i} style={{
            animationDelay: `${(i % 12) * 0.06}s`,
            animationDuration: `${0.7 + (i % 5) * 0.15}s`,
          }} />
        ))}
      </div>
    </div>
  );
}

export function CodeRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let visible = false;
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(canvas);

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const chars = '01ABCDEF{}[]<>/$#@!*+=:;01';
    const fontSize = 14;
    let columns = Math.floor(canvas.width / fontSize);
    let drops: number[] = Array(columns).fill(0).map(() => Math.random() * canvas.height / fontSize);

    let raf = 0;
    const draw = () => {
      if (visible) {
        const newCols = Math.floor(canvas.width / fontSize);
        if (newCols !== columns) {
          columns = newCols;
          drops = Array(columns).fill(0).map(() => Math.random() * canvas.height / fontSize);
        }
        ctx.fillStyle = 'rgba(12, 9, 8, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = `${fontSize}px monospace`;

        for (let i = 0; i < drops.length; i++) {
          const char = chars[Math.floor(Math.random() * chars.length)];
          const x = i * fontSize;
          const y = drops[i] * fontSize;

          if (Math.random() > 0.975) {
            ctx.fillStyle = '#EFE6D8';
          } else {
            ctx.fillStyle = `rgba(235, 34, 34, ${0.25 + Math.random() * 0.45})`;
          }
          ctx.fillText(char, x, y);

          if (y > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="code-rain" aria-hidden="true" />;
}
