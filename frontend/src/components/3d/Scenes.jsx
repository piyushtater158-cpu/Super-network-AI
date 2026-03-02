import { useRef, useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Particle component for constellation effect
const Particle = ({ index, total }) => {
  const angle = (index / total) * Math.PI * 2;
  const radius = 150 + Math.random() * 100;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  const size = 2 + Math.random() * 4;
  const delay = Math.random() * 2;
  const duration = 3 + Math.random() * 2;

  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: "50%",
        top: "50%",
        background: `hsl(${250 + Math.random() * 60}, 100%, ${60 + Math.random() * 20}%)`,
        boxShadow: `0 0 ${size * 2}px hsl(${250 + Math.random() * 60}, 100%, 70%)`,
      }}
      initial={{ x: 0, y: 0, opacity: 0 }}
      animate={{
        x: [0, x * 0.5, x, x * 0.8, 0],
        y: [0, y * 0.5, y, y * 0.8, 0],
        opacity: [0, 1, 0.8, 1, 0],
        scale: [0.5, 1, 1.2, 1, 0.5],
      }}
      transition={{
        duration: duration * 2,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};

// Floating orb component
const FloatingOrb = ({ color, size, x, y, delay }) => (
  <motion.div
    className="absolute rounded-full"
    style={{
      width: size,
      height: size,
      background: `radial-gradient(circle at 30% 30%, ${color}, transparent)`,
      boxShadow: `0 0 ${size}px ${color}`,
      filter: "blur(2px)",
    }}
    initial={{ x, y, opacity: 0 }}
    animate={{
      x: [x, x + 30, x - 20, x],
      y: [y, y - 40, y + 20, y],
      opacity: [0.3, 0.7, 0.5, 0.3],
      scale: [1, 1.1, 0.9, 1],
    }}
    transition={{
      duration: 8,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

// Star background with twinkling effect
const Star = ({ index }) => {
  const x = Math.random() * 100;
  const y = Math.random() * 100;
  const size = 1 + Math.random() * 2;
  const delay = Math.random() * 3;

  return (
    <motion.div
      className="absolute rounded-full bg-white"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        top: `${y}%`,
      }}
      animate={{
        opacity: [0.2, 0.8, 0.2],
        scale: [0.8, 1.2, 0.8],
      }}
      transition={{
        duration: 2 + Math.random() * 2,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};

// Main Constellation Scene for Hero
export const ConstellationScene = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Stars background */}
      {Array.from({ length: 100 }, (_, i) => (
        <Star key={`star-${i}`} index={i} />
      ))}

      {/* Central glow */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          className="w-[400px] h-[400px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, hsl(250, 100%, 70%, 0.2) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Constellation particles */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {Array.from({ length: 30 }, (_, i) => (
          <Particle key={`particle-${i}`} index={i} total={30} />
        ))}
      </div>

      {/* Floating orbs */}
      <FloatingOrb color="hsl(250, 100%, 70%)" size={80} x={-200} y={-100} delay={0} />
      <FloatingOrb color="hsl(180, 100%, 50%)" size={60} x={200} y={50} delay={1} />
      <FloatingOrb color="hsl(320, 100%, 60%)" size={40} x={100} y={-150} delay={2} />
      <FloatingOrb color="hsl(45, 100%, 50%)" size={30} x={-150} y={100} delay={3} />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[hsl(240_10%_2%)] via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(240_10%_2%)] via-transparent to-transparent opacity-50" />
    </div>
  );
};

// Ikigai Scene for Onboarding - uses CSS animations
export const IkigaiScene = ({ progress = 0, activeSection = 0 }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const colors = ["#ec4899", "#8b5cf6", "#06b6d4", "#22c55e"];

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Background particles */}
      {Array.from({ length: 50 }, (_, i) => (
        <Star key={`ikigai-star-${i}`} index={i} />
      ))}

      {/* Central crystal glow */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full"
        style={{
          background: `radial-gradient(circle, ${colors[activeSection]}40 0%, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Ambient glow based on active section */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full"
        style={{
          background: `radial-gradient(circle, 
            ${colors[activeSection]}20 0%, 
            transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

// Simple Stars Background for layouts
export const StarsBackground = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {Array.from({ length: 80 }, (_, i) => (
        <Star key={`bg-star-${i}`} index={i} />
      ))}
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(240_10%_2%)/20] to-[hsl(240_10%_2%)/40]" />
    </div>
  );
};

export default ConstellationScene;
