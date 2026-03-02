import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { ConstellationScene } from "../components/3d/Scenes";
import { 
  Sparkles, 
  Users, 
  Briefcase, 
  Target, 
  ArrowRight,
  Star,
  Zap,
  Globe
} from "lucide-react";

export default function Landing() {
  const { login, user } = useAuth();

  // If already logged in, show minimal landing
  if (user) {
    window.location.href = "/dashboard";
    return null;
  }

  return (
    <div className="min-h-screen bg-[hsl(240_10%_2%)] relative overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <ConstellationScene />
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(240_10%_2%)/50] to-[hsl(240_10%_2%)] pointer-events-none z-10" />
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[hsl(250_100%_70%)] opacity-10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[hsl(180_100%_50%)] opacity-10 blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(250_100%_70%)] to-[hsl(180_100%_50%)] flex items-center justify-center">
              <Sparkles size={22} className="text-white" />
            </div>
            <span className="font-bold text-xl text-white">
              SuperNetwork<span className="text-[hsl(250_100%_70%)]">AI</span>
            </span>
          </div>
          <Button
            onClick={login}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full px-6 py-2 backdrop-blur-sm transition-all duration-300 hover:scale-105"
            data-testid="header-login-btn"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-20 px-6 pt-20 pb-32">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-up">
            <Zap size={14} className="text-[hsl(250_100%_70%)]" />
            <span className="text-sm text-slate-300">AI-Powered Networking for the Future</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-[1.1] animate-fade-up stagger-1">
            Find Your{" "}
            <span className="text-gradient-primary">Ikigai</span>
            <br />
            Build Your{" "}
            <span className="text-gradient-primary">Network</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 animate-fade-up stagger-2">
            AI-powered matching that connects you with cofounders, teams, gigs, and jobs 
            based on your passions, skills, and purpose.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up stagger-3">
            <Button
              onClick={login}
              className="bg-white text-black hover:bg-white/90 rounded-full px-8 py-6 text-lg font-bold flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
              data-testid="hero-get-started-btn"
            >
              Get Started
              <ArrowRight size={20} />
            </Button>
            <Button
              variant="outline"
              className="bg-white/5 border-white/20 text-white hover:bg-white/10 rounded-full px-8 py-6 text-lg font-medium"
              data-testid="hero-learn-more-btn"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-20 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why SuperNetworkAI?
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Transform your passions into opportunities with our intelligent matching system
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="glass rounded-2xl p-8 card-hover group">
              <div className="w-14 h-14 rounded-xl bg-[hsl(250_100%_70%)]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Target size={28} className="text-[hsl(250_100%_70%)]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Ikigai Discovery</h3>
              <p className="text-slate-400">
                Find the intersection of what you love, what you're good at, what the world needs, 
                and what you can be paid for.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass rounded-2xl p-8 card-hover group">
              <div className="w-14 h-14 rounded-xl bg-[hsl(180_100%_50%)]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users size={28} className="text-[hsl(180_100%_50%)]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Smart Matching</h3>
              <p className="text-slate-400">
                AI analyzes your Ikigai profile, skills, and intent to connect you with 
                the most compatible collaborators.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass rounded-2xl p-8 card-hover group">
              <div className="w-14 h-14 rounded-xl bg-[hsl(320_100%_60%)]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Briefcase size={28} className="text-[hsl(320_100%_60%)]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Gigs to Partnerships</h3>
              <p className="text-slate-400">
                Start with short gigs for vibe checks, build trust through ratings, 
                and evolve into long-term partnerships.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-20 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="glass rounded-3xl p-8 md:p-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl md:text-5xl font-black text-white mb-2">500+</div>
                <div className="text-slate-400">Active Users</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-black text-[hsl(250_100%_70%)] mb-2">30%</div>
                <div className="text-slate-400">Match Rate</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-black text-[hsl(180_100%_50%)] mb-2">70%</div>
                <div className="text-slate-400">Rating Completion</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-black text-[hsl(320_100%_60%)] mb-2">4.8</div>
                <div className="text-slate-400">Avg. Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* User Types */}
      <section className="relative z-20 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              For Every Networker
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass rounded-2xl p-8 border-l-4 border-[hsl(250_100%_70%)]">
              <div className="flex items-center gap-3 mb-4">
                <Star className="text-[hsl(250_100%_70%)]" />
                <h3 className="text-xl font-bold text-white">Gen Z Talent</h3>
              </div>
              <p className="text-slate-400 mb-4">
                Translate your passions and skills into real opportunities. 
                Find gigs, jobs, or cofounders that align with your purpose.
              </p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[hsl(250_100%_70%)]" />
                  Build your proof-of-work portfolio
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[hsl(250_100%_70%)]" />
                  Get rated and climb leaderboards
                </li>
              </ul>
            </div>

            <div className="glass rounded-2xl p-8 border-l-4 border-[hsl(180_100%_50%)]">
              <div className="flex items-center gap-3 mb-4">
                <Briefcase className="text-[hsl(180_100%_50%)]" />
                <h3 className="text-xl font-bold text-white">Founders & Recruiters</h3>
              </div>
              <p className="text-slate-400 mb-4">
                Discover high-potential talent with better signal than generic job boards. 
                See Ikigai alignment and multi-dimensional ratings.
              </p>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[hsl(180_100%_50%)]" />
                  AI-ranked candidates for your gigs
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[hsl(180_100%_50%)]" />
                  Natural language search for talent
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-20 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[hsl(250_100%_70%)]/10 to-[hsl(180_100%_50%)]/10" />
            <div className="relative z-10">
              <Globe className="w-16 h-16 text-[hsl(250_100%_70%)] mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Find Your Ikigai?
              </h2>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                Join the AI-native networking layer connecting passionate talent 
                with meaningful opportunities.
              </p>
              <Button
                onClick={login}
                className="bg-white text-black hover:bg-white/90 rounded-full px-10 py-6 text-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                data-testid="cta-get-started-btn"
              >
                Start Your Journey
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 px-6 py-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(250_100%_70%)] to-[hsl(180_100%_50%)] flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-semibold text-white">SuperNetworkAI</span>
          </div>
          <p className="text-sm text-slate-500">
            © 2026 SuperNetworkAI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
