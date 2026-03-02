import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { Layout } from "../components/Layout";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
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
  Building,
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

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
    <Layout>
      <div className="max-w-7xl mx-auto px-4 md:px-6" data-testid="dashboard">
        {/* Welcome Section */}
        <section className="mb-10">
          <div className="glass rounded-3xl p-8 md:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[hsl(250_100%_70%)] opacity-10 blur-[100px]" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  Welcome back, {user?.name?.split(" ")[0]}!
                </h1>
                <p className="text-slate-400">
                  Discover opportunities that align with your Ikigai
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-center px-6 py-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-2xl font-bold text-[hsl(250_100%_70%)]">
                    {user?.peer_score?.toFixed(1) || "0.0"}
                  </div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider">Peer Score</div>
                </div>
                <div className="text-center px-6 py-3 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-2xl font-bold text-[hsl(180_100%_50%)]">
                    {user?.recruiter_score?.toFixed(1) || "0.0"}
                  </div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider">Recruiter Score</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Opportunities Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Briefcase size={20} className="text-[hsl(250_100%_70%)]" />
                Latest Opportunities
              </h2>
              <Button
                onClick={() => navigate("/create-opportunity")}
                className="bg-white/10 hover:bg-white/20 text-white rounded-full px-4 py-2 text-sm"
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
                  <div key={i} className="glass rounded-2xl p-6 animate-pulse">
                    <div className="h-4 bg-white/10 rounded w-3/4 mb-4" />
                    <div className="h-3 bg-white/5 rounded w-full mb-2" />
                    <div className="h-3 bg-white/5 rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : opportunities.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center">
                <Briefcase size={48} className="mx-auto text-slate-600 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No opportunities yet</h3>
                <p className="text-slate-400 mb-6">Be the first to post a gig or job!</p>
                <Button
                  onClick={() => navigate("/create-opportunity")}
                  className="bg-white text-black hover:bg-white/90 rounded-full"
                  data-testid="first-opportunity-btn"
                >
                  Post an Opportunity
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {opportunities.map((opp) => (
                  <Link
                    key={opp.opportunity_id}
                    to={`/opportunity/${opp.opportunity_id}`}
                    className="glass rounded-2xl p-6 card-hover group"
                    data-testid={`opportunity-card-${opp.opportunity_id}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <Badge
                        variant="secondary"
                        className={`${
                          opp.type === "gig"
                            ? "bg-[hsl(250_100%_70%)]/20 text-[hsl(250_100%_70%)]"
                            : "bg-[hsl(180_100%_50%)]/20 text-[hsl(180_100%_50%)]"
                        } border-0`}
                      >
                        {opp.type === "gig" ? "Gig" : "Job"}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        {getTimeAgo(opp.created_at)}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-[hsl(250_100%_70%)] transition-colors">
                      {opp.title}
                    </h3>
                    
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                      {opp.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
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
                            className="px-2 py-0.5 rounded text-xs bg-white/5 text-slate-400"
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
                  </Link>
                ))}
              </div>
            )}

            {opportunities.length > 0 && (
              <Button
                variant="ghost"
                className="w-full text-slate-400 hover:text-white"
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
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Target size={18} className="text-[hsl(320_100%_60%)]" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button
                  onClick={() => navigate("/search")}
                  className="w-full justify-start bg-white/5 hover:bg-white/10 text-white rounded-xl"
                  data-testid="search-people-btn"
                >
                  <Users size={16} className="mr-2 text-[hsl(250_100%_70%)]" />
                  Search People
                </Button>
                <Button
                  onClick={() => navigate("/create-opportunity")}
                  className="w-full justify-start bg-white/5 hover:bg-white/10 text-white rounded-xl"
                  data-testid="create-gig-btn"
                >
                  <Briefcase size={16} className="mr-2 text-[hsl(180_100%_50%)]" />
                  Post a Gig
                </Button>
                <Button
                  onClick={() => navigate(`/profile/${user?.user_id}`)}
                  className="w-full justify-start bg-white/5 hover:bg-white/10 text-white rounded-xl"
                  data-testid="view-profile-btn"
                >
                  <Sparkles size={16} className="mr-2 text-[hsl(320_100%_60%)]" />
                  View Profile
                </Button>
              </div>
            </div>

            {/* Leaderboard Preview */}
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <TrendingUp size={18} className="text-[hsl(45_100%_50%)]" />
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
                      <div className="w-8 h-8 rounded-full bg-white/10" />
                      <div className="flex-1">
                        <div className="h-3 bg-white/10 rounded w-24 mb-1" />
                        <div className="h-2 bg-white/5 rounded w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {topUsers.map((u, i) => (
                    <Link
                      key={u.user_id}
                      to={`/profile/${u.user_id}`}
                      className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={u.picture} />
                          <AvatarFallback className="bg-white/10">
                            {u.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                            i === 0
                              ? "bg-[hsl(45_100%_50%)] text-black"
                              : i === 1
                              ? "bg-slate-400 text-black"
                              : i === 2
                              ? "bg-amber-700 text-white"
                              : "bg-white/10 text-white"
                          }`}
                        >
                          {i + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">
                          {u.name}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {u.role_labels?.[0] || "Member"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-[hsl(250_100%_70%)]">
                          {u.peer_score?.toFixed(1)}
                        </div>
                        <div className="text-xs text-slate-500">score</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Your Status */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Your Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Intent</span>
                  <Badge variant="outline" className="border-[hsl(250_100%_70%)]/50 text-[hsl(250_100%_70%)]">
                    {user?.primary_intent || "Not set"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Availability</span>
                  <Badge
                    variant="outline"
                    className={`${
                      user?.availability === "Available now"
                        ? "border-[hsl(150_100%_45%)]/50 text-[hsl(150_100%_45%)]"
                        : "border-[hsl(45_100%_50%)]/50 text-[hsl(45_100%_50%)]"
                    }`}
                  >
                    {user?.availability || "Not set"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Completed Gigs</span>
                  <span className="text-sm font-semibold text-white">
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
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
