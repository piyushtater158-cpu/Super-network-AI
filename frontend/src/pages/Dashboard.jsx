import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Layout } from "../components/Layout";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { FloatingParticles, GradientOrbs, DataRing } from "../components/3d/CrystalComponents";
import {
  Briefcase,
  Users,
  Clock,
  ChevronRight,
  Sparkles,
  Target,
  TrendingUp,
  Plus,
  MapPin,
  Zap,
  ArrowUpRight,
  Crown,
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Animated opportunity card
const OpportunityCard = ({ opp, index }) => {
  const navigate = useNavigate();
  
  const getTimeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={() => navigate(`/opportunity/${opp.opportunity_id}`)}
      className="cursor-pointer"
    >
      <div 
        className="relative p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.05] hover:border-white/[0.15] transition-all duration-300 group"
        data-testid={`opportunity-card-${opp.opportunity_id}`}
      >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: opp.type === "gig" 
              ? "radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.1), transparent 70%)"
              : "radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.1), transparent 70%)"
          }}
        />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <Badge
              className={`${
                opp.type === "gig"
                  ? "bg-violet-500/20 text-violet-400 border-violet-500/30"
                  : "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
              } border`}
            >
              {opp.type === "gig" ? "Gig" : "Job"}
            </Badge>
            <span className="text-xs text-slate-500">
              {getTimeAgo(opp.created_at)}
            </span>
          </div>

          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-violet-300 transition-colors line-clamp-1">
            {opp.title}
          </h3>
          
          <p className="text-sm text-slate-400 mb-4 line-clamp-2">
            {opp.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6 border border-white/20">
                <AvatarImage src={opp.creator_picture} />
                <AvatarFallback className="bg-white/10 text-xs">
                  {opp.creator_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-slate-400">{opp.creator_name}</span>
            </div>
            
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Users size={12} />
              {opp.applications_count} applied
            </div>
          </div>

          {opp.skills_required?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-4">
              {opp.skills_required.slice(0, 3).map((skill, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded text-xs bg-white/5 text-slate-400 border border-white/10"
                >
                  {skill}
                </span>
              ))}
              {opp.skills_required.length > 3 && (
                <span className="text-xs text-slate-500">
                  +{opp.skills_required.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Arrow indicator */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight size={20} className="text-violet-400" />
        </div>
      </div>
    </motion.div>
  );
};

// Leaderboard user row
const LeaderboardRow = ({ user, rank }) => (
  <Link
    to={`/profile/${user.user_id}`}
    className="flex items-center gap-3 p-3 -mx-3 rounded-xl hover:bg-white/5 transition-colors group"
  >
    <div className="relative">
      <Avatar className="w-10 h-10 border-2 border-white/10 group-hover:border-violet-500/50 transition-colors">
        <AvatarImage src={user.picture} />
        <AvatarFallback className="bg-gradient-to-br from-violet-500 to-cyan-500 text-white text-sm">
          {user.name?.charAt(0)}
        </AvatarFallback>
      </Avatar>
      {rank <= 3 && (
        <div
          className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
            rank === 1
              ? "bg-yellow-500 text-black"
              : rank === 2
              ? "bg-slate-400 text-black"
              : "bg-amber-700 text-white"
          }`}
        >
          {rank}
        </div>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-sm font-medium text-white truncate group-hover:text-violet-300 transition-colors">
        {user.name}
      </div>
      <div className="text-xs text-slate-500 truncate">
        {user.role_labels?.[0] || "Member"}
      </div>
    </div>
    <div className="text-right">
      <div className="text-sm font-bold text-violet-400">
        {user.peer_score?.toFixed(1)}
      </div>
      <div className="text-xs text-slate-500">score</div>
    </div>
  </Link>
);

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [oppsRes, leaderboardRes] = await Promise.all([
          axios.get(`${API}/opportunities?limit=6`, { withCredentials: true }),
          axios.get(`${API}/users/leaderboard?limit=5`, { withCredentials: true }),
        ]);
        setOpportunities(oppsRes.data);
        setTopUsers(leaderboardRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 md:px-6" data-testid="dashboard">
        {/* Welcome Section */}
        <motion.section 
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative rounded-3xl p-8 md:p-10 overflow-hidden border border-white/[0.08]"
            style={{
              background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)",
            }}
          >
            {/* Background effects */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h1 className="text-3xl md:text-4xl font-black text-white mb-2">
                    Welcome back, {user?.name?.split(" ")[0]}! 
                    <motion.span
                      className="inline-block ml-2"
                      animate={{ rotate: [0, 14, -8, 14, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                    >
                      👋
                    </motion.span>
                  </h1>
                  <p className="text-slate-400 text-lg">
                    Discover opportunities aligned with your Ikigai
                  </p>
                </motion.div>
              </div>
              
              <motion.div 
                className="flex items-center gap-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="text-center px-6 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="text-3xl font-black text-violet-400">
                    {user?.peer_score?.toFixed(1) || "0.0"}
                  </div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Peer Score</div>
                </div>
                <div className="text-center px-6 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="text-3xl font-black text-cyan-400">
                    {user?.recruiter_score?.toFixed(1) || "0.0"}
                  </div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Recruiter Score</div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Opportunities Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Briefcase size={20} className="text-violet-400" />
                Latest Opportunities
              </h2>
              <Button
                onClick={() => navigate("/create-opportunity")}
                className="bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/30 rounded-full px-4 py-2 text-sm"
                data-testid="post-opportunity-btn"
              >
                <Plus size={16} className="mr-1" />
                Post
              </Button>
            </div>

            {/* Opportunities Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-2xl p-6 bg-white/[0.02] border border-white/[0.08] animate-pulse">
                    <div className="h-4 bg-white/10 rounded w-16 mb-4" />
                    <div className="h-5 bg-white/10 rounded w-3/4 mb-3" />
                    <div className="h-3 bg-white/5 rounded w-full mb-2" />
                    <div className="h-3 bg-white/5 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : opportunities.length === 0 ? (
              <motion.div 
                className="rounded-2xl p-12 text-center bg-white/[0.02] border border-white/[0.08]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Briefcase size={48} className="mx-auto text-slate-600 mb-4" />
                </motion.div>
                <h3 className="text-lg font-semibold text-white mb-2">No opportunities yet</h3>
                <p className="text-slate-400 mb-6">Be the first to post a gig or job!</p>
                <Button
                  onClick={() => navigate("/create-opportunity")}
                  className="bg-white text-black hover:bg-white/90 rounded-full"
                  data-testid="first-opportunity-btn"
                >
                  Post an Opportunity
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {opportunities.map((opp, i) => (
                  <OpportunityCard key={opp.opportunity_id} opp={opp} index={i} />
                ))}
              </div>
            )}

            {opportunities.length > 0 && (
              <Button
                variant="ghost"
                className="w-full text-slate-400 hover:text-white hover:bg-white/5"
                onClick={() => navigate("/search")}
              >
                View All Opportunities
                <ChevronRight size={16} className="ml-1" />
              </Button>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div 
              className="rounded-2xl p-6 bg-white/[0.02] border border-white/[0.08]"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Zap size={18} className="text-yellow-400" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                {[
                  { icon: Users, label: "Search People", path: "/search", color: "violet" },
                  { icon: Briefcase, label: "Post a Gig", path: "/create-opportunity", color: "cyan" },
                  { icon: Sparkles, label: "View Profile", path: `/profile/${user?.user_id}`, color: "pink" },
                ].map((action, i) => (
                  <motion.div
                    key={action.path}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={() => navigate(action.path)}
                      className={`w-full justify-start bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 hover:border-${action.color}-500/30`}
                      data-testid={`quick-action-${i}`}
                    >
                      <action.icon size={16} className={`mr-2 text-${action.color}-400`} />
                      {action.label}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Leaderboard Preview */}
            <motion.div 
              className="rounded-2xl p-6 bg-white/[0.02] border border-white/[0.08]"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Crown size={18} className="text-yellow-400" />
                  Top Performers
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/leaderboard")}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  View All
                </Button>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="w-10 h-10 rounded-full bg-white/10" />
                      <div className="flex-1">
                        <div className="h-3 bg-white/10 rounded w-24 mb-1" />
                        <div className="h-2 bg-white/5 rounded w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : topUsers.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-4">No ranked users yet</p>
              ) : (
                <div className="space-y-1">
                  {topUsers.map((u, i) => (
                    <LeaderboardRow key={u.user_id} user={u} rank={i + 1} />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Your Status */}
            <motion.div 
              className="rounded-2xl p-6 bg-white/[0.02] border border-white/[0.08]"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-lg font-bold text-white mb-4">Your Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Intent</span>
                  <Badge variant="outline" className="border-violet-500/50 text-violet-400">
                    {user?.primary_intent || "Not set"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Availability</span>
                  <Badge
                    variant="outline"
                    className={`${
                      user?.availability === "Available now"
                        ? "border-green-500/50 text-green-400"
                        : "border-yellow-500/50 text-yellow-400"
                    }`}
                  >
                    {user?.availability || "Not set"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Completed Gigs</span>
                  <span className="text-sm font-bold text-white">
                    {user?.total_gigs || 0}
                  </span>
                </div>
              </div>
              <Button
                onClick={() => navigate("/settings")}
                variant="ghost"
                className="w-full mt-4 text-slate-400 hover:text-white text-sm"
              >
                Update Settings
                <ChevronRight size={14} className="ml-1" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
