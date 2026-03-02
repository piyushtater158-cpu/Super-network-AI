import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { FloatingParticles, GradientOrbs, MissionPulse } from "../components/3d/CrystalComponents";
import { 
  Sparkles, 
  Users, 
  Briefcase, 
  Target, 
  ArrowRight,
  Star,
  Zap,
  Globe,
  ChevronDown,
  Play,
  CheckCircle,
} from "lucide-react";

// Animated number counter
const AnimatedCounter = ({ value, suffix = "" }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return <span>{count}{suffix}</span>;
};

// Feature card with hover effect
const FeatureCard = ({ icon: Icon, title, description, color, delay }) => (
  <motion.div
    className="relative group"
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    viewport={{ once: true }}
  >
    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
      style={{ background: `linear-gradient(135deg, ${color}40, transparent)` }}
    />
    <div className="relative p-8 rounded-3xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-sm hover:border-white/20 transition-all duration-500 group-hover:translate-y-[-4px]">
      <motion.div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: `linear-gradient(135deg, ${color}30, ${color}10)` }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <Icon size={32} style={{ color }} />
      </motion.div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

// Testimonial card
const TestimonialCard = ({ quote, name, role, avatar, delay }) => (
  <motion.div
    className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.08]"
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
  >
    <p className="text-slate-300 mb-4 italic">"{quote}"</p>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-bold">
        {avatar || name.charAt(0)}
      </div>
      <div>
        <p className="text-white font-medium">{name}</p>
        <p className="text-xs text-slate-500">{role}</p>
      </div>
    </div>
  </motion.div>
);

export default function Landing() {
  const { login, user } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (user) {
    window.location.href = "/dashboard";
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-x-hidden">
      {/* Animated background */}
      <FloatingParticles count={80} />
      <GradientOrbs />

      {/* Grid pattern */}
      <div 
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Header */}
      <motion.header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-black/80 backdrop-blur-xl border-b border-white/10" : ""
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Sparkles size={24} className="text-white" />
            </div>
            <span className="font-black text-xl text-white">
              SuperNetwork<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">AI</span>
            </span>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={login}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full px-6 py-2.5 backdrop-blur-sm font-medium"
              data-testid="header-login-btn"
            >
              Sign In
            </Button>
          </motion.div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Badge */}
          <motion.div 
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-violet-500/10 border border-violet-500/30 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Zap size={16} className="text-violet-400" />
            <span className="text-sm font-medium text-violet-300">AI-Powered Networking for the Future</span>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-[1.05] tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Find Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400">
              Ikigai
            </span>
            <br />
            Build Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400">
              Network
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            AI-powered matching that connects you with cofounders, teams, gigs, and jobs 
            based on your <span className="text-white font-medium">passions</span>, <span className="text-white font-medium">skills</span>, and <span className="text-white font-medium">purpose</span>.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={login}
                className="bg-white text-black hover:bg-white/90 rounded-full px-10 py-7 text-lg font-bold shadow-2xl shadow-white/20 flex items-center gap-3"
                data-testid="hero-get-started-btn"
              >
                Get Started Free
                <ArrowRight size={22} />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                className="bg-white/5 border-white/20 text-white hover:bg-white/10 rounded-full px-10 py-7 text-lg font-medium flex items-center gap-3"
                data-testid="hero-watch-demo-btn"
              >
                <Play size={20} fill="currentColor" />
                Watch Demo
              </Button>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <ChevronDown size={32} className="text-white/30" />
          </motion.div>
        </div>

        {/* Hero visual elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Large gradient orb */}
          <motion.div
            className="absolute w-[800px] h-[800px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Why SuperNetworkAI?
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Transform your passions into opportunities with our intelligent matching system
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Target}
              title="Ikigai Discovery"
              description="Find the intersection of what you love, what you're good at, what the world needs, and what you can be paid for."
              color="#8b5cf6"
              delay={0}
            />
            <FeatureCard
              icon={Users}
              title="Smart Matching"
              description="AI analyzes your Ikigai profile, skills, and intent to connect you with the most compatible collaborators."
              color="#06b6d4"
              delay={0.1}
            />
            <FeatureCard
              icon={Briefcase}
              title="Gigs to Partnerships"
              description="Start with short gigs for vibe checks, build trust through ratings, and evolve into long-term partnerships."
              color="#ec4899"
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="rounded-[2rem] p-12 md:p-16 relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
              <div>
                <div className="text-5xl md:text-6xl font-black text-white mb-2">
                  <AnimatedCounter value={500} suffix="+" />
                </div>
                <div className="text-slate-400 font-medium">Active Users</div>
              </div>
              <div>
                <div className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400 mb-2">
                  <AnimatedCounter value={30} suffix="%" />
                </div>
                <div className="text-slate-400 font-medium">Match Rate</div>
              </div>
              <div>
                <div className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400 mb-2">
                  <AnimatedCounter value={70} suffix="%" />
                </div>
                <div className="text-slate-400 font-medium">Rating Completion</div>
              </div>
              <div>
                <div className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400 mb-2">
                  4.8
                </div>
                <div className="text-slate-400 font-medium">Avg. Rating</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              How It Works
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Three simple steps to find your perfect collaborators
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Define Your Ikigai", desc: "Answer questions about your passions, skills, market value, and purpose", icon: "🎯" },
              { step: "02", title: "Get AI Matches", desc: "Our AI finds people and opportunities aligned with your unique profile", icon: "✨" },
              { step: "03", title: "Connect & Grow", desc: "Start with gigs, build ratings, and evolve into meaningful partnerships", icon: "🚀" },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="relative p-8 rounded-3xl bg-white/[0.02] border border-white/[0.05]"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-6xl mb-4">{item.icon}</div>
                <div className="text-violet-400 text-sm font-bold mb-2">STEP {item.step}</div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-slate-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              className="p-10 rounded-3xl relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%)",
                border: "1px solid rgba(139, 92, 246, 0.3)",
              }}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Star className="w-12 h-12 text-violet-400 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Gen Z Talent</h3>
              <p className="text-slate-400 mb-6">
                Translate your passions and skills into real opportunities. 
                Find gigs, jobs, or cofounders that align with your purpose.
              </p>
              <ul className="space-y-3">
                {["Build your proof-of-work portfolio", "Get rated and climb leaderboards", "Find your tribe and collaborators"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300">
                    <CheckCircle size={18} className="text-violet-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              className="p-10 rounded-3xl relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(6, 182, 212, 0.05) 100%)",
                border: "1px solid rgba(6, 182, 212, 0.3)",
              }}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Briefcase className="w-12 h-12 text-cyan-400 mb-6" />
              <h3 className="text-2xl font-bold text-white mb-4">Founders & Recruiters</h3>
              <p className="text-slate-400 mb-6">
                Discover high-potential talent with better signal than generic job boards. 
                See Ikigai alignment and multi-dimensional ratings.
              </p>
              <ul className="space-y-3">
                {["AI-ranked candidates for your gigs", "Natural language search for talent", "Multi-dimensional rating insights"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300">
                    <CheckCircle size={18} className="text-cyan-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="rounded-[2rem] p-12 md:p-16 text-center relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(6, 182, 212, 0.2) 50%, rgba(236, 72, 153, 0.2) 100%)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-violet-500/30"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Globe size={40} className="text-white" />
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Ready to Find Your Ikigai?
            </h2>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              Join the AI-native networking layer connecting passionate talent 
              with meaningful opportunities.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={login}
                className="bg-white text-black hover:bg-white/90 rounded-full px-12 py-7 text-xl font-bold shadow-2xl shadow-white/20"
                data-testid="cta-get-started-btn"
              >
                Start Your Journey
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative px-6 py-12 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <Sparkles size={20} className="text-white" />
            </div>
            <span className="font-bold text-white">SuperNetworkAI</span>
          </div>
          <p className="text-sm text-slate-500">
            © 2026 SuperNetworkAI. Find your purpose. Build your network.
          </p>
        </div>
      </footer>
    </div>
  );
}
