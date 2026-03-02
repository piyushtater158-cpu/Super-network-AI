import { useRef, useEffect, useState } from "react";
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

// Ikigai Crystal Section
const IkigaiNode = ({ color, label, active, position, delay }) => (
  <motion.div
    className="absolute flex flex-col items-center"
    style={{
      left: position.x,
      top: position.y,
      transform: "translate(-50%, -50%)",
    }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: active ? 1 : 0.4,
      scale: active ? 1 : 0.7,
    }}
    transition={{ duration: 0.5, delay }}
  >
    <motion.div
      className="rounded-full"
      style={{
        width: active ? 60 : 40,
        height: active ? 60 : 40,
        background: `radial-gradient(circle at 30% 30%, ${color}, ${color}88)`,
        boxShadow: active ? `0 0 30px ${color}, 0 0 60px ${color}44` : `0 0 10px ${color}44`,
      }}
      animate={
        active
          ? {
              scale: [1, 1.1, 1],
              boxShadow: [
                `0 0 30px ${color}, 0 0 60px ${color}44`,
                `0 0 40px ${color}, 0 0 80px ${color}66`,
                `0 0 30px ${color}, 0 0 60px ${color}44`,
              ],
            }
          : {}
      }
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
    <span
      className={`mt-2 text-xs font-medium transition-colors duration-300 ${
        active ? "text-white" : "text-slate-500"
      }`}
    >
      {label}
    </span>
  </motion.div>
);

// Central Crystal
const CentralCrystal = ({ progress }) => (
  <motion.div
    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: 1, scale: 0.5 + progress * 0.5 }}
    transition={{ duration: 0.5 }}
  >
    <motion.div
      className="w-20 h-20 relative"
      animate={{ rotateY: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    >
      {/* Crystal shape using CSS */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, 
            hsl(250, 100%, 70%, ${0.3 + progress * 0.4}) 0%, 
            hsl(180, 100%, 50%, ${0.3 + progress * 0.4}) 50%, 
            hsl(320, 100%, 60%, ${0.3 + progress * 0.4}) 100%)`,
          clipPath:
            "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          boxShadow: `0 0 ${20 + progress * 40}px hsl(250, 100%, 70%, 0.5)`,
        }}
      />
      <motion.div
        className="absolute inset-2"
        style={{
          background: `linear-gradient(45deg, 
            hsl(180, 100%, 50%, ${0.2 + progress * 0.3}) 0%, 
            hsl(250, 100%, 70%, ${0.2 + progress * 0.3}) 100%)`,
          clipPath:
            "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
        }}
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  </motion.div>
);

// Connection lines
const ConnectionLine = ({ from, to, active }) => {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const length = Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));

  return (
    <motion.div
      className="absolute"
      style={{
        left: from.x,
        top: from.y,
        width: length,
        height: 2,
        transformOrigin: "left center",
        transform: `rotate(${angle}rad)`,
        background: active
          ? "linear-gradient(90deg, hsl(250, 100%, 70%, 0.6), hsl(180, 100%, 50%, 0.6))"
          : "linear-gradient(90deg, hsl(250, 100%, 70%, 0.2), hsl(180, 100%, 50%, 0.2))",
      }}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1, opacity: active ? 1 : 0.3 }}
      transition={{ duration: 0.5 }}
    />
  );
};

// Ikigai Scene for Onboarding
export const IkigaiScene = ({ progress = 0, activeSection = 0 }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const nodes = [
    { color: "hsl(320, 100%, 60%)", label: "LOVE", position: { x: "50%", y: "15%" } },
    { color: "hsl(250, 100%, 70%)", label: "GOOD AT", position: { x: "85%", y: "50%" } },
    { color: "hsl(180, 100%, 50%)", label: "PAID FOR", position: { x: "50%", y: "85%" } },
    { color: "hsl(150, 100%, 45%)", label: "NEEDED", position: { x: "15%", y: "50%" } },
  ];

  const center = { x: "50%", y: "50%" };

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Background particles */}
      {Array.from({ length: 50 }, (_, i) => (
        <Star key={`ikigai-star-${i}`} index={i} />
      ))}

      {/* Central crystal */}
      <CentralCrystal progress={progress} />

      {/* Ikigai nodes */}
      {nodes.map((node, i) => (
        <IkigaiNode
          key={node.label}
          {...node}
          active={i === activeSection || i < activeSection}
          delay={i * 0.1}
        />
      ))}

      {/* Ambient glow */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full"
        style={{
          background: `radial-gradient(circle, 
            hsl(${250 + activeSection * 30}, 100%, 70%, 0.15) 0%, 
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

// Simple Stars Background
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
