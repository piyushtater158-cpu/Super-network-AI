import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Layout } from "../components/Layout";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Trophy,
  Users,
  Award,
  Crown,
  Medal,
  TrendingUp,
  Heart,
  Star,
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const RankBadge = ({ rank }) => {
  if (rank === 1) {
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
        <Crown size={20} className="text-white" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 flex items-center justify-center">
        <Medal size={20} className="text-white" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center">
        <Medal size={20} className="text-white" />
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
      <span className="text-lg font-bold text-slate-400">{rank}</span>
    </div>
  );
};

export default function Leaderboard() {
  const { user } = useAuth();
  const [view, setView] = useState("peer");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [view]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/users/leaderboard?view=${view}&limit=50`, {
        withCredentials: true,
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const scoreField = view === "peer" ? "peer_score" : "recruiter_score";

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 md:px-6" data-testid="leaderboard">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(45_100%_50%)]/10 border border-[hsl(45_100%_50%)]/30 mb-4">
            <Trophy size={16} className="text-[hsl(45_100%_50%)]" />
            <span className="text-sm text-[hsl(45_100%_50%)]">Leaderboard</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Top Performers</h1>
          <p className="text-slate-400">
            Ranked by collaboration success and ratings
          </p>
        </div>

        {/* View Toggle */}
        <Tabs value={view} onValueChange={setView} className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-white/5 p-1 rounded-xl">
            <TabsTrigger
              value="peer"
              className="data-[state=active]:bg-[hsl(250_100%_70%)] data-[state=active]:text-white rounded-lg"
            >
              <Users size={16} className="mr-2" />
              Peer View
            </TabsTrigger>
            <TabsTrigger
              value="recruiter"
              className="data-[state=active]:bg-[hsl(180_100%_50%)] data-[state=active]:text-white rounded-lg"
            >
              <Award size={16} className="mr-2" />
              Recruiter View
            </TabsTrigger>
          </TabsList>

          {/* Info Cards */}
          <div className="mt-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <TabsContent value="peer" className="mt-0">
              <div className="glass-light rounded-xl p-4">
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <Users size={16} className="text-[hsl(250_100%_70%)]" />
                  Peer Score Factors
                </h4>
                <ul className="space-y-1 text-sm text-slate-400">
                  <li className="flex items-center gap-2">
                    <Heart size={12} className="text-[hsl(320_100%_60%)]" />
                    Collaboration & Culture Fit
                  </li>
                  <li className="flex items-center gap-2">
                    <Star size={12} className="text-[hsl(250_100%_70%)]" />
                    Skill Quality
                  </li>
                  <li className="flex items-center gap-2">
                    <TrendingUp size={12} className="text-[hsl(150_100%_45%)]" />
                    Reliability
                  </li>
                </ul>
              </div>
            </TabsContent>
            <TabsContent value="recruiter" className="mt-0">
              <div className="glass-light rounded-xl p-4">
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <Award size={16} className="text-[hsl(180_100%_50%)]" />
                  Recruiter Score Factors
                </h4>
                <ul className="space-y-1 text-sm text-slate-400">
                  <li className="flex items-center gap-2">
                    <TrendingUp size={12} className="text-[hsl(150_100%_45%)]" />
                    Reliability & Professionalism
                  </li>
                  <li className="flex items-center gap-2">
                    <Star size={12} className="text-[hsl(250_100%_70%)]" />
                    Skill Quality
                  </li>
                </ul>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Leaderboard Table */}
        <div className="glass rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-white/10" />
                  <div className="w-12 h-12 rounded-full bg-white/10" />
                  <div className="flex-1">
                    <div className="h-4 bg-white/10 rounded w-32 mb-2" />
                    <div className="h-3 bg-white/5 rounded w-24" />
                  </div>
                  <div className="h-8 bg-white/10 rounded w-16" />
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <Trophy size={48} className="mx-auto text-slate-600 mb-4" />
              <p className="text-slate-400">No ranked users yet</p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {users.map((u, i) => {
                const rank = i + 1;
                const score = u[scoreField] || 0;
                const isCurrentUser = u.user_id === user?.user_id;

                return (
                  <Link
                    key={u.user_id}
                    to={`/profile/${u.user_id}`}
                    className={`flex items-center gap-4 p-4 hover:bg-white/5 transition-colors ${
                      isCurrentUser ? "bg-[hsl(250_100%_70%)]/5" : ""
                    }`}
                    data-testid={`leaderboard-user-${u.user_id}`}
                  >
                    <RankBadge rank={rank} />
                    
                    <Avatar className="w-12 h-12 border-2 border-white/20">
                      <AvatarImage src={u.picture} />
                      <AvatarFallback className="bg-gradient-to-br from-[hsl(250_100%_70%)] to-[hsl(180_100%_50%)]">
                        {u.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white truncate">
                          {u.name}
                        </h3>
                        {isCurrentUser && (
                          <Badge className="bg-[hsl(250_100%_70%)]/20 text-[hsl(250_100%_70%)] border-0 text-xs">
                            You
                          </Badge>
                        )}
                        {u.total_gigs < 3 && (
                          <Badge className="bg-[hsl(45_100%_50%)]/20 text-[hsl(45_100%_50%)] border-0 text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-400">
                        {u.role_labels?.[0] && (
                          <span>{u.role_labels[0]}</span>
                        )}
                        <span>{u.total_gigs || 0} gigs</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-2xl font-black ${
                          view === "peer"
                            ? "text-[hsl(250_100%_70%)]"
                            : "text-[hsl(180_100%_50%)]"
                        }`}
                      >
                        {score.toFixed(1)}
                      </div>
                      <div className="text-xs text-slate-500 uppercase tracking-wider">
                        {view} score
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
