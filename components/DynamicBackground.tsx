'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  xOffset: number;
}

export default function DynamicBackground() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Generate particles only on the client to avoid hydration mismatch
    const newParticles = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
      xOffset: Math.random() * 50 - 25,
    }));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setParticles(newParticles);

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX / innerWidth - 0.5) * 100;
      const y = (clientY / innerHeight - 0.5) * 100;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[#f5f5f5] dark:bg-[#050505]">
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      {/* Animated Aurora Orbs */}
      <div className="absolute inset-0 opacity-60 dark:opacity-40 mix-blend-multiply dark:mix-blend-screen filter blur-[80px] md:blur-[120px]">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ x: useTransform(smoothMouseX, v => v * 2), y: useTransform(smoothMouseY, v => v * 2) }}
          className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          style={{ x: useTransform(smoothMouseX, v => v * -1.5), y: useTransform(smoothMouseY, v => v * -1.5) }}
          className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, 180, 0],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          style={{ x: useTransform(smoothMouseX, v => v * 0.5), y: useTransform(smoothMouseY, v => v * -2) }}
          className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-r from-orange-500 to-pink-500" 
        />
      </div>
      
      {/* Particles */}
      <div className="absolute inset-0 z-10 opacity-80 dark:opacity-60">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-gray-900/50 dark:bg-white/40"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
            }}
            animate={{
              y: [0, -150, 0],
              x: [0, p.xOffset, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#f5f5f5] via-transparent to-[#f5f5f5] dark:from-[#050505] dark:via-transparent dark:to-[#050505] opacity-80"></div>
    </div>
  );
}
