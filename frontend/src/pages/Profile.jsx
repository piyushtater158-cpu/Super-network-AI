import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { Layout } from "../components/Layout";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
  Heart,
  Star,
  DollarSign,
  Globe,
  Linkedin,
  Github,
  Link as LinkIcon,
  MapPin,
  MessageSquare,
  Award,
  Users,
  TrendingUp,
  Sparkles,
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const IkigaiSection = ({ title, icon: Icon, color, items }) => (
  <div className="glass-light rounded-xl p-5">
    <div className="flex items-center gap-2 mb-3">
      <Icon size={18} style={{ color }} />
      <h4 className="font-semibold text-white text-sm">{title}</h4>
    </div>
    {items?.length > 0 ? (
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span
            key={i}
            className="px-3 py-1 rounded-full text-xs bg-white/5 text-slate-300 border border-white/10"
          >
            {item}
          </span>
        ))}
      </div>
    ) : (
      <p className="text-sm text-slate-500">Not specified</p>
    )}
  </div>
);

const RatingDimension = ({ label, value, maxValue = 10 }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-white">{value?.toFixed(1) || "—"}</span>
    </div>
    <Progress 
      value={(value / maxValue) * 100} 
      className="h-1.5 bg-white/10"
    />
  </div>
);

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = currentUser?.user_id === userId;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${API}/users/profile/${userId}`, {
          withCredentials: true,
        });
        setProfile(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const startConversation = async () => {
    try {
      await axios.post(
        `${API}/messages`,
        {
          receiver_id: userId,
          content: `Hi ${profile.user.name}! I'd like to connect with you.`,
        },
        { withCredentials: true }
      );
      toast.success("Message sent!");
      navigate("/messages");
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast.error("Failed to send message");
    }
  };

  // Calculate average ratings
  const calculateAverages = (ratings, type) => {
    const filtered = ratings?.filter((r) => r.rater_type === type) || [];
    if (filtered.length === 0) return null;

    return {
      collaboration: filtered.reduce((a, r) => a + r.collaboration, 0) / filtered.length,
      reliability: filtered.reduce((a, r) => a + r.reliability, 0) / filtered.length,
      skill_quality: filtered.reduce((a, r) => a + r.skill_quality, 0) / filtered.length,
      culture_fit: filtered.reduce((a, r) => a + r.culture_fit, 0) / filtered.length,
      professionalism: filtered.reduce((a, r) => a + r.professionalism, 0) / filtered.length,
    };
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="glass rounded-3xl p-8 animate-pulse">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 rounded-full bg-white/10" />
              <div className="flex-1">
                <div className="h-6 bg-white/10 rounded w-48 mb-2" />
                <div className="h-4 bg-white/5 rounded w-32" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center py-20">
          <h2 className="text-2xl font-bold text-white mb-4">Profile not found</h2>
          <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
        </div>
      </Layout>
    );
  }

  const { user: profileUser, ikigai, ratings } = profile;
  const peerAvg = calculateAverages(ratings, "peer");
  const recruiterAvg = calculateAverages(ratings, "recruiter");

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 md:px-6" data-testid="profile-page">
        {/* Header Card */}
        <div className="glass rounded-3xl p-8 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[hsl(250_100%_70%)] opacity-10 blur-[100px]" />
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
              <Avatar className="w-24 h-24 border-4 border-white/20">
                <AvatarImage src={profileUser.picture} />
                <AvatarFallback className="text-3xl bg-gradient-to-br from-[hsl(250_100%_70%)] to-[hsl(180_100%_50%)]">
                  {profileUser.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">{profileUser.name}</h1>
                  {profileUser.total_gigs < 3 && (
                    <Badge className="bg-[hsl(45_100%_50%)]/20 text-[hsl(45_100%_50%)] border-0">
                      <Sparkles size={12} className="mr-1" />
                      New Talent
                    </Badge>
                  )}
                </div>
                
                {profileUser.role_labels?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {profileUser.role_labels.map((role, i) => (
                      <Badge key={i} variant="secondary" className="bg-white/10 border-0">
                        {role}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                  {profileUser.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />
                      {profileUser.location}
                    </span>
                  )}
                  <Badge
                    variant="outline"
                    className={`${
                      profileUser.availability === "Available now"
                        ? "border-[hsl(150_100%_45%)]/50 text-[hsl(150_100%_45%)]"
                        : "border-[hsl(45_100%_50%)]/50 text-[hsl(45_100%_50%)]"
                    }`}
                  >
                    {profileUser.availability}
                  </Badge>
                  <Badge variant="outline" className="border-white/20 text-slate-300">
                    {profileUser.primary_intent}
                  </Badge>
                </div>
              </div>

              {!isOwnProfile && (
                <Button
                  onClick={startConversation}
                  className="bg-white text-black hover:bg-white/90 rounded-full px-6"
                  data-testid="message-btn"
                >
                  <MessageSquare size={16} className="mr-2" />
                  Message
                </Button>
              )}
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-3">
              {profileUser.linkedin_url && (
                <a
                  href={profileUser.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 text-sm transition-colors"
                >
                  <Linkedin size={16} />
                  LinkedIn
                </a>
              )}
              {profileUser.github_url && (
                <a
                  href={profileUser.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 text-sm transition-colors"
                >
                  <Github size={16} />
                  GitHub
                </a>
              )}
              {profileUser.portfolio_url && (
                <a
                  href={profileUser.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 text-sm transition-colors"
                >
                  <LinkIcon size={16} />
                  Portfolio
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Scores & Ratings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Peer Score */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users size={18} className="text-[hsl(250_100%_70%)]" />
                Peer Score
              </h3>
              <div className="text-3xl font-black text-[hsl(250_100%_70%)]">
                {profileUser.peer_score?.toFixed(1) || "—"}
              </div>
            </div>
            {peerAvg ? (
              <div className="space-y-4">
                <RatingDimension label="Collaboration" value={peerAvg.collaboration} />
                <RatingDimension label="Skill Quality" value={peerAvg.skill_quality} />
                <RatingDimension label="Culture Fit" value={peerAvg.culture_fit} />
                <RatingDimension label="Reliability" value={peerAvg.reliability} />
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No peer ratings yet</p>
            )}
          </div>

          {/* Recruiter Score */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Award size={18} className="text-[hsl(180_100%_50%)]" />
                Recruiter Score
              </h3>
              <div className="text-3xl font-black text-[hsl(180_100%_50%)]">
                {profileUser.recruiter_score?.toFixed(1) || "—"}
              </div>
            </div>
            {recruiterAvg ? (
              <div className="space-y-4">
                <RatingDimension label="Reliability" value={recruiterAvg.reliability} />
                <RatingDimension label="Professionalism" value={recruiterAvg.professionalism} />
                <RatingDimension label="Skill Quality" value={recruiterAvg.skill_quality} />
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No recruiter ratings yet</p>
            )}
          </div>
        </div>

        {/* Ikigai */}
        {ikigai && (
          <div className="glass rounded-2xl p-6 mb-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-[hsl(320_100%_60%)]" />
              Ikigai Profile
            </h3>

            {ikigai.ikigai_statement && (
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-[hsl(250_100%_70%)]/10 to-[hsl(180_100%_50%)]/10 border border-white/10">
                <p className="text-slate-300 italic">"{ikigai.ikigai_statement}"</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <IkigaiSection
                title="What I Love"
                icon={Heart}
                color="hsl(320, 100%, 60%)"
                items={ikigai.what_i_love}
              />
              <IkigaiSection
                title="What I'm Good At"
                icon={Star}
                color="hsl(250, 100%, 70%)"
                items={ikigai.what_im_good_at}
              />
              <IkigaiSection
                title="What I Can Be Paid For"
                icon={DollarSign}
                color="hsl(180, 100%, 50%)"
                items={ikigai.what_i_can_be_paid_for}
              />
              <IkigaiSection
                title="What the World Needs"
                icon={Globe}
                color="hsl(150, 100%, 45%)"
                items={ikigai.what_the_world_needs}
              />
            </div>
          </div>
        )}

        {/* Recent Ratings */}
        {ratings?.length > 0 && (
          <div className="glass rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Recent Feedback</h3>
            <div className="space-y-4">
              {ratings.slice(0, 5).map((rating, i) => (
                <div key={rating.rating_id || i} className="glass-light rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      variant="outline"
                      className={`${
                        rating.rater_type === "peer"
                          ? "border-[hsl(250_100%_70%)]/50 text-[hsl(250_100%_70%)]"
                          : "border-[hsl(180_100%_50%)]/50 text-[hsl(180_100%_50%)]"
                      }`}
                    >
                      {rating.rater_type}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {rating.would_work_again ? "Would work again ✓" : ""}
                    </span>
                  </div>
                  {rating.comments && (
                    <p className="text-sm text-slate-300">{rating.comments}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
