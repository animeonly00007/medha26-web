'use client';

import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Float, PerspectiveCamera } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { TextureLoader } from 'three';
import CursorField from '@/components/cursor-field';
import { ExhibitionVisual, SoundwaveVisual, CodeRain } from '@/components/event-visuals';

const LOGO_SRC = '/assets/images/WhatsApp_Image_2026-08-25_at_4.10.57_PM.jpeg';

const events = [
  {
    index: '01',
    name: 'EXHIBITIONS',
    eyebrow: 'SHOWCASE · BUILD · INSPIRE',
    meta: 'OCT 16–18, 2026  /  CUSAT CAMPUS',
    description: 'Student builds, robotics, and ideas made tangible — from circuit-bent prototypes to full-scale kinetic installations.',
    align: 'left',
    accent: 'stripes',
    visual: 'exhibition',
  },
  {
    index: '02',
    name: 'TALK SESSIONS',
    eyebrow: 'THINK · INSPIRE · INNOVATE',
    meta: 'OCT 17, 2026  /  MAIN AUDITORIUM',
    description: 'Keynote lectures and fireside chats from the people building what comes next — unfiltered, up close, and on stage.',
    align: 'right',
    accent: 'pixels',
    visual: 'soundwave',
  },
  {
    index: '03',
    name: 'HACKATHON',
    eyebrow: 'CODE · BUILD · SHIP',
    meta: '24 HOURS  /  INNOVATION HALL',
    description: 'A 24-hour overnight build competition. Big swings, sharp thinking, and things that work by sunrise.',
    align: 'left',
    accent: 'dots',
    visual: 'code',
  },
] as const;

const disciplines = [
  'ENGINEERING', 'LAW', 'FISHERIES', 'PHYSICS', 'CHEMISTRY', 'COMPUTER SCIENCE',
  'MANAGEMENT', 'ENVIRONMENTAL SCIENCE', 'BIOTECHNOLOGY', 'MARINE SCIENCE',
  'MATHEMATICS', 'HUMANITIES', 'ELECTRONICS', 'INFORMATION TECHNOLOGY',
] as const;

const quickLinks = [
  { label: 'EXHIBITIONS', ref: '#event-01' },
  { label: 'TALK SESSIONS', ref: '#event-02' },
  { label: 'HACKATHON', ref: '#event-03' },
  { label: 'DISCIPLINES', ref: '#disciplines' },
  { label: 'CONTACT', ref: '#contact' },
] as const;

const contacts = [
  { label: 'EMAIL', value: 'medha26@cusat.ac.in' },
  { label: 'PHONE', value: '+91 484 257 7555' },
  { label: 'CAMPUS', value: 'CUSAT, Kochi, Kerala 682022' },
] as const;

const socials = [
  { label: 'INSTAGRAM', handle: '@medha.cusat' },
  { label: 'LINKEDIN', handle: 'MEDHA CUSAT' },
  { label: 'TWITTER / X', handle: '@medha_cusat' },
] as const;

function PixelTrail() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const pixels = useMemo(() => Array.from({ length: 28 }, (_, index) => ({
    x: 2.2 + index * 0.095 + (Math.random() - 0.5) * 0.35,
    y: 0.45 + index * 0.055 + (Math.random() - 0.5) * 0.65,
    z: (Math.random() - 0.5) * 0.3,
    size: 0.035 + Math.random() * 0.08,
    phase: Math.random() * Math.PI * 2,
  })), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    pixels.forEach((pixel, index) => {
      const drift = Math.sin(clock.getElapsedTime() * 1.4 + pixel.phase) * 0.05;
      dummy.position.set(pixel.x + drift, pixel.y + drift * 0.6, pixel.z);
      dummy.scale.setScalar(pixel.size * (0.82 + Math.sin(clock.getElapsedTime() * 2 + pixel.phase) * 0.18));
      dummy.rotation.z = clock.getElapsedTime() * 0.2 + pixel.phase;
      dummy.updateMatrix();
      ref.current?.setMatrixAt(index, dummy.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return <instancedMesh ref={ref} args={[undefined, undefined, pixels.length]}><boxGeometry args={[1, 1, 1]} /><meshBasicMaterial color="#EB2222" /></instancedMesh>;
}

function LogoBird() {
  const group = useRef<THREE.Group>(null);
  const texture = useLoader(TextureLoader, LOGO_SRC);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      mouse.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', onPointerMove);
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, []);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const elapsed = clock.getElapsedTime();
    const assembly = THREE.MathUtils.smoothstep(elapsed, 0.25, 1.35);
    const targetScale = 1.2 * assembly;
    group.current.scale.setScalar(Math.max(targetScale, 0.01));
    group.current.position.x = THREE.MathUtils.damp(group.current.position.x, mouse.current.x * 0.11, 3, 0.016);
    group.current.position.y = Math.sin(elapsed * 1.1) * 0.08 + (1 - assembly) * 0.45;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, mouse.current.x * 0.16, 3.2, 0.016);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -mouse.current.y * 0.1, 3.2, 0.016);
    group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, -0.08 - (1 - assembly) * 0.45, 3.2, 0.016);
  });

  return (
    <group ref={group} scale={0.01}>
      <mesh position={[0, 0, 0]}>
        <planeGeometry args={[4.7, 4.7]} />
        <shaderMaterial
          transparent
          uniforms={{ map: { value: texture } }}
          vertexShader="varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }"
          fragmentShader="uniform sampler2D map; varying vec2 vUv; void main() { vec4 color = texture2D(map, vUv); float brightness = max(max(color.r, color.g), color.b); float alpha = smoothstep(0.015, 0.09, brightness); gl_FragColor = vec4(color.rgb, alpha); }"
        />
      </mesh>
      <PixelTrail />
    </group>
  );
}

function Bird() {
  return <Float speed={1.5} rotationIntensity={0.06} floatIntensity={0.12}><LogoBird /></Float>;
}

function BirdCanvas() {
  return <Canvas className="bird-canvas" dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }}><PerspectiveCamera makeDefault position={[0, 0, 7.4]} fov={38} /><Bird /></Canvas>;
}

function Accent({ type }: { type: 'stripes' | 'pixels' | 'dots' }) {
  if (type === 'stripes') return <div className="accent-stripes" aria-hidden="true">{Array.from({ length: 5 }, (_, i) => <i key={i} />)}</div>;
  if (type === 'pixels') return <div className="accent-pixels" aria-hidden="true">{Array.from({ length: 12 }, (_, i) => <i key={i} />)}</div>;
  return <div className="accent-dots" aria-hidden="true">{Array.from({ length: 16 }, (_, i) => <i key={i} />)}</div>;
}

function EventVisual({ type }: { type: 'exhibition' | 'soundwave' | 'code' }) {
  if (type === 'exhibition') return <ExhibitionVisual />;
  if (type === 'soundwave') return <SoundwaveVisual />;
  return <CodeRain />;
}

export default function Home() {
  const page = useRef<HTMLDivElement>(null);
  const heroBird = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap.to(heroBird.current, {
        y: '36vh', scale: 0.62, rotate: 11, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=115%', scrub: 1.2 },
      });

      gsap.fromTo('.hero-copy > *',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.15, delay: 0.4 },
      );

      gsap.fromTo('.topbar > *',
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', stagger: 0.1, delay: 0.2 },
      );

      gsap.fromTo('.events-intro > *',
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.2,
          scrollTrigger: { trigger: '.events-intro', start: 'top 80%' } },
      );

      gsap.utils.toArray<HTMLElement>('.event-section').forEach((section) => {
        gsap.fromTo(section.querySelector('.event-visual-wrap'),
          { scale: 1.3, opacity: 0.3 },
          { scale: 1, opacity: 1, ease: 'none',
            scrollTrigger: { trigger: section, start: 'top bottom', end: 'top 20%', scrub: 1 } },
        );

        gsap.fromTo(section.querySelector('.event-frame'),
          { opacity: 0, scale: 0.92 },
          { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out',
            scrollTrigger: { trigger: section, start: 'top 60%' } },
        );

        gsap.fromTo(section.querySelector('.event-content'),
          { opacity: 0, y: 80 },
          { opacity: 1, y: 0, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: section, start: 'top 55%' } },
        );

        gsap.fromTo(section.querySelector('.event-number'),
          { opacity: 0, x: 30 },
          { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out',
            scrollTrigger: { trigger: section, start: 'top 50%' } },
        );

        gsap.fromTo(section.querySelector('.accent-stripes, .accent-pixels, .accent-dots'),
          { opacity: 0, scale: 0.5 },
          { opacity: 1, scale: 1, duration: 1, ease: 'back.out(1.7)',
            scrollTrigger: { trigger: section, start: 'top 45%' } },
        );

        gsap.fromTo(section.querySelector('.event-content h2'),
          { clipPath: 'inset(0 100% 0 0)' },
          { clipPath: 'inset(0 0% 0 0)', duration: 1.2, ease: 'power4.out',
            scrollTrigger: { trigger: section, start: 'top 50%' } },
        );
      });

      gsap.to('.marquee-track', {
        xPercent: -50, ease: 'none',
        scrollTrigger: { trigger: '.disciplines-section', start: 'top bottom', end: 'bottom top', scrub: 1 },
      });

      gsap.fromTo('.disciplines-section h2',
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: '.disciplines-section', start: 'top 75%' } },
      );

      gsap.fromTo('.discipline-tag',
        { opacity: 0, scale: 0.8, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(1.4)', stagger: 0.04,
          scrollTrigger: { trigger: '.discipline-grid', start: 'top 80%' } },
      );

      gsap.fromTo('.footer-col',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', stagger: 0.1,
          scrollTrigger: { trigger: '.site-footer', start: 'top 85%' } },
      );

      gsap.fromTo('.footer-bottom',
        { opacity: 0 },
        { opacity: 1, duration: 1, ease: 'power2.out',
          scrollTrigger: { trigger: '.footer-bottom', start: 'top 95%' } },
      );
    }, page);
    return () => context.revert();
  }, []);

  return (
    <main ref={page} className="site-shell">
      <CursorField />

      <section className="hero" aria-labelledby="hero-title">
        <div className="topbar">
          <div className="brand-mark"><Image src={LOGO_SRC} alt="Medha origami bird mark" width={42} height={42} /><span>MEDHA <b>'26</b></span></div>
          <span className="topbar-note">NATIONAL TECHNO-MANAGEMENT FEST</span>
          <span className="topbar-date">16—18 / 10 / 2026</span>
        </div>
        <div className="hero-grid" aria-hidden="true"><span /><span /><span /><span /></div>
        <div className="bird-wrap" ref={heroBird}><BirdCanvas /></div>
        <div className="hero-copy">
          <p className="eyebrow">COCHIN UNIVERSITY OF SCIENCE AND TECHNOLOGY · KERALA</p>
          <h1 id="hero-title">MEDHA <em>'26</em></h1>
          <p className="hero-description">Three days of engineering, ideas, and the courage to build what comes next.</p>
        </div>
        <div className="scroll-cue"><span>SCROLL TO EXPLORE</span><i /></div>
        <div className="hero-coordinates">09° 58′ N<br />76° 16′ E</div>
      </section>

      <section className="events-intro">
        <p className="eyebrow">THE THREE SIGNALS</p>
        <p>One campus. Three ways to move the future forward.</p>
      </section>

      {events.map((event) => (
        <section className={`event-section event-${event.index}`} id={`event-${event.index}`} key={event.index}>
          <div className="event-visual-wrap" aria-hidden="true">
            <EventVisual type={event.visual} />
          </div>
          <div className="event-shade" />
          <div className="event-frame">
            <span className="event-number">{event.index} / 03</span>
            <span className="eyebrow">{event.eyebrow}</span>
            <Accent type={event.accent} />
          </div>
          <div className={`event-content event-content-${event.align}`}>
            <div className="event-meta">{event.meta}</div>
            <h2>{event.name}</h2>
            <p>{event.description}</p>
          </div>
        </section>
      ))}

      <section className="disciplines-section" id="disciplines">
        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {[...disciplines, ...disciplines].map((d, i) => (
              <span key={i} className="marquee-item">{d}</span>
            ))}
          </div>
        </div>
        <div className="disciplines-inner">
          <p className="eyebrow">ALL DEPARTMENTS · ONE FEST</p>
          <h2>Every discipline.<br />One stage.</h2>
          <p className="disciplines-blurb">MEDHA isn&apos;t just for engineers. From Law to Fisheries, Physics to Humanities, every department at CUSAT brings its own fire. This is where the whole university meets.</p>
          <div className="discipline-grid">
            {disciplines.map((d) => (
              <span key={d} className="discipline-tag">{d}</span>
            ))}
          </div>
        </div>
      </section>

      <footer className="site-footer" id="contact">
        <div className="footer-grid">
          <div className="footer-col footer-brand">
            <div className="brand-mark"><Image src={LOGO_SRC} alt="Medha origami bird mark" width={36} height={36} /><span>MEDHA <b>'26</b></span></div>
            <p className="footer-tagline">National Techno-Management Fest<br />Cochin University of Science and Technology</p>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              {quickLinks.map((link) => (
                <li key={link.label}><a href={link.ref}>{link.label}</a></li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Reach Us</h4>
            <ul className="footer-links">
              {contacts.map((c) => (
                <li key={c.label}><span className="footer-label">{c.label}</span><br />{c.value}</li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Follow</h4>
            <ul className="footer-links">
              {socials.map((s) => (
                <li key={s.label}><span className="footer-label">{s.label}</span><br />{s.handle}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>MEDHA &apos;26 · OCT 16—18, 2026 · CUSAT, KOCHI</span>
          <span>END / BEGIN AGAIN</span>
        </div>
      </footer>
    </main>
  );
}
