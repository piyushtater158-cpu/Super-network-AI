import { useRef, useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";

// ============== CRYSTAL IKIGAI COMPONENTS ==============

// Glowing particle that orbits
const OrbitingParticle = ({ index, total, radius, color, speed = 1 }) => {
  const angle = (index / total) * Math.PI * 2;
  
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full"
      style={{
        background: color,
        boxShadow: `0 0 10px ${color}, 0 0 20px ${color}`,
        left: "50%",
        top: "50%",
      }}
      animate={{
        x: [
          Math.cos(angle) * radius,
          Math.cos(angle + Math.PI * 0.5) * radius,
          Math.cos(angle + Math.PI) * radius,
          Math.cos(angle + Math.PI * 1.5) * radius,
          Math.cos(angle + Math.PI * 2) * radius,
        ],
        y: [
          Math.sin(angle) * radius,
          Math.sin(angle + Math.PI * 0.5) * radius,
          Math.sin(angle + Math.PI) * radius,
          Math.sin(angle + Math.PI * 1.5) * radius,
          Math.sin(angle + Math.PI * 2) * radius,
        ],
        scale: [1, 1.5, 1, 1.5, 1],
        opacity: [0.6, 1, 0.6, 1, 0.6],
      }}
      transition={{
        duration: 8 / speed,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
};

// 3D Crystal shape using CSS transforms
const Crystal3D = ({ size = 120, progress = 1, activeColor = "#8b5cf6" }) => {
  return (
    <motion.div
      className="relative"
      style={{ 
        width: size, 
        height: size,
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
      animate={{ 
        rotateY: 360,
        rotateX: [0, 10, 0, -10, 0],
      }}
      transition={{ 
        rotateY: { duration: 20, repeat: Infinity, ease: "linear" },
        rotateX: { duration: 8, repeat: Infinity, ease: "easeInOut" },
      }}
    >
      {/* Crystal faces */}
      {[0, 72, 144, 216, 288].map((rotation, i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          style={{
            transform: `rotateY(${rotation}deg) translateZ(${size * 0.3}px)`,
            background: `linear-gradient(180deg, 
              ${activeColor}${Math.round(40 + progress * 40).toString(16)} 0%, 
              transparent 100%)`,
            clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)",
            backfaceVisibility: "visible",
          }}
          animate={{
            opacity: [0.3 + progress * 0.4, 0.5 + progress * 0.5, 0.3 + progress * 0.4],
          }}
          transition={{
            duration: 2,
            delay: i * 0.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Inner glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${activeColor}60 0%, transparent 70%)`,
          filter: "blur(10px)",
        }}
        animate={{
          scale: [0.8, 1.2, 0.8],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  );
};

// Constellation network lines
const ConstellationLines = ({ points, activeIndex }) => {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.6" />
          <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0.6" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {points.map((point, i) => {
        const nextPoint = points[(i + 1) % points.length];
        const isActive = i <= activeIndex;
        
        return (
          <motion.line
            key={`line-${i}`}
            x1={point.x}
            y1={point.y}
            x2={nextPoint.x}
            y2={nextPoint.y}
            stroke="url(#lineGradient)"
            strokeWidth={isActive ? 2 : 1}
            filter="url(#glow)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: isActive ? 1 : 0.3, 
              opacity: isActive ? 1 : 0.2 
            }}
            transition={{ duration: 0.8, delay: i * 0.1 }}
          />
        );
      })}
      
      {/* Center connections */}
      {points.map((point, i) => {
        const isActive = i <= activeIndex;
        return (
          <motion.line
            key={`center-line-${i}`}
            x1="50%"
            y1="50%"
            x2={point.x}
            y2={point.y}
            stroke={isActive ? "#8b5cf6" : "#ffffff20"}
            strokeWidth={isActive ? 1.5 : 0.5}
            strokeDasharray={isActive ? "0" : "4 4"}
            filter={isActive ? "url(#glow)" : "none"}
            initial={{ opacity: 0 }}
            animate={{ opacity: isActive ? 0.8 : 0.2 }}
            transition={{ duration: 0.5 }}
          />
        );
      })}
    </svg>
  );
};

// Ikigai Node with pulsing effect
const IkigaiNode3D = ({ label, icon: Icon, color, position, isActive, isComplete, onClick, index }) => {
  return (
    <motion.button
      className="absolute flex flex-col items-center gap-2 z-10"
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -50%)",
      }}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Outer ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: isActive ? 100 : 80,
          height: isActive ? 100 : 80,
          border: `2px solid ${color}`,
          opacity: isActive ? 1 : 0.3,
        }}
        animate={isActive ? {
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.2, 0.5],
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      {/* Main node */}
      <motion.div
        className="relative rounded-full flex items-center justify-center"
        style={{
          width: isActive ? 80 : 60,
          height: isActive ? 80 : 60,
          background: isComplete 
            ? `linear-gradient(135deg, ${color}, ${color}88)`
            : isActive 
              ? `linear-gradient(135deg, ${color}40, ${color}20)`
              : "rgba(255,255,255,0.05)",
          border: `2px solid ${isComplete || isActive ? color : "rgba(255,255,255,0.1)"}`,
          boxShadow: isActive 
            ? `0 0 30px ${color}60, 0 0 60px ${color}30, inset 0 0 30px ${color}20`
            : isComplete 
              ? `0 0 20px ${color}40`
              : "none",
        }}
        animate={isActive ? {
          boxShadow: [
            `0 0 30px ${color}60, 0 0 60px ${color}30`,
            `0 0 50px ${color}80, 0 0 80px ${color}50`,
            `0 0 30px ${color}60, 0 0 60px ${color}30`,
          ],
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Icon 
          size={isActive ? 32 : 24} 
          style={{ color: isComplete || isActive ? "#fff" : "rgba(255,255,255,0.4)" }}
        />
        
        {/* Completion checkmark */}
        {isComplete && (
          <motion.div
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500 }}
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        )}
      </motion.div>
      
      {/* Label */}
      <motion.span
        className="text-sm font-bold uppercase tracking-wider whitespace-nowrap"
        style={{ 
          color: isComplete || isActive ? "#fff" : "rgba(255,255,255,0.4)",
          textShadow: isActive ? `0 0 10px ${color}` : "none",
        }}
        animate={isActive ? { opacity: [0.8, 1, 0.8] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {label}
      </motion.span>
    </motion.button>
  );
};

// Floating particles background
const FloatingParticles = ({ count = 50 }) => {
  const particles = useMemo(() => 
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 3,
      duration: 10 + Math.random() * 20,
      delay: Math.random() * 5,
      color: ["#8b5cf6", "#06b6d4", "#ec4899", "#22c55e"][Math.floor(Math.random() * 4)],
    })),
    [count]
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// Grid background with perspective
const PerspectiveGrid = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `
          linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
        `,
        backgroundSize: "50px 50px",
        transform: "perspective(500px) rotateX(60deg)",
        transformOrigin: "center top",
        maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 100%)",
      }}
    />
  </div>
);

// Animated gradient orbs
const GradientOrbs = () => (
  <>
    <motion.div
      className="absolute w-[600px] h-[600px] rounded-full pointer-events-none"
      style={{
        background: "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)",
        left: "10%",
        top: "20%",
        filter: "blur(60px)",
      }}
      animate={{
        x: [0, 50, 0],
        y: [0, -30, 0],
        scale: [1, 1.2, 1],
      }}
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
      style={{
        background: "radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%)",
        right: "10%",
        bottom: "20%",
        filter: "blur(60px)",
      }}
      animate={{
        x: [0, -40, 0],
        y: [0, 40, 0],
        scale: [1.1, 0.9, 1.1],
      }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
      style={{
        background: "radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)",
        left: "50%",
        top: "10%",
        transform: "translateX(-50%)",
        filter: "blur(50px)",
      }}
      animate={{
        y: [0, 30, 0],
        opacity: [0.5, 1, 0.5],
      }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
    />
  </>
);

// Data visualization ring for analytics
const DataRing = ({ value, maxValue, color, size = 120, strokeWidth = 8, label }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / maxValue) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{
            filter: `drop-shadow(0 0 6px ${color})`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-2xl font-black"
          style={{ color }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          {value}
        </motion.span>
        <span className="text-xs text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
    </div>
  );
};

// Animated bar chart
const AnimatedBarChart = ({ data, height = 200 }) => {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="flex items-end justify-between gap-2" style={{ height }}>
      {data.map((item, i) => (
        <div key={i} className="flex flex-col items-center gap-2 flex-1">
          <motion.div
            className="w-full rounded-t-lg relative overflow-hidden"
            style={{
              background: `linear-gradient(180deg, ${item.color} 0%, ${item.color}40 100%)`,
              boxShadow: `0 0 20px ${item.color}40`,
            }}
            initial={{ height: 0 }}
            animate={{ height: `${(item.value / maxValue) * 100}%` }}
            transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
              }}
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
            />
          </motion.div>
          <span className="text-xs text-slate-400">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

// Pulse animation for mission/collaboration
const PulseRing = ({ color, delay = 0 }) => (
  <motion.div
    className="absolute rounded-full border-2"
    style={{ borderColor: color }}
    initial={{ width: 20, height: 20, opacity: 1 }}
    animate={{
      width: [20, 100, 150],
      height: [20, 100, 150],
      opacity: [1, 0.5, 0],
    }}
    transition={{
      duration: 2,
      delay,
      repeat: Infinity,
      ease: "easeOut",
    }}
  />
);

// Mission Pulse visualization
const MissionPulse = ({ users = [] }) => (
  <div className="relative w-64 h-64 flex items-center justify-center">
    {/* Pulse rings */}
    {[0, 0.5, 1, 1.5].map((delay, i) => (
      <PulseRing key={i} color="#8b5cf6" delay={delay} />
    ))}
    
    {/* Center node */}
    <motion.div
      className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center z-10"
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
      style={{ boxShadow: "0 0 30px rgba(139, 92, 246, 0.6)" }}
    >
      <span className="text-2xl">🎯</span>
    </motion.div>
    
    {/* Orbiting user avatars */}
    {users.slice(0, 6).map((user, i) => {
      const angle = (i / Math.min(users.length, 6)) * Math.PI * 2;
      const radius = 90;
      
      return (
        <motion.div
          key={i}
          className="absolute w-10 h-10 rounded-full border-2 border-white/30 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${["#8b5cf6", "#06b6d4", "#ec4899", "#22c55e"][i % 4]}, transparent)`,
          }}
          animate={{
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          {user.picture ? (
            <img src={user.picture} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white font-bold">
              {user.name?.charAt(0)}
            </div>
          )}
        </motion.div>
      );
    })}
  </div>
);

// Export all components
export {
  Crystal3D,
  ConstellationLines,
  IkigaiNode3D,
  OrbitingParticle,
  FloatingParticles,
  PerspectiveGrid,
  GradientOrbs,
  DataRing,
  AnimatedBarChart,
  MissionPulse,
  PulseRing,
};

export default Crystal3D;
