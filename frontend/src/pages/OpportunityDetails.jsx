import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { Layout } from "../components/Layout";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Briefcase,
  Clock,
  DollarSign,
  Users,
  Sparkles,
  ArrowLeft,
  Send,
  CheckCircle,
  Heart,
  Star,
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function OpportunityDetails() {
  const { opportunityId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [coverMessage, setCoverMessage] = useState("");
  const [hasApplied, setHasApplied] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  const isCreator = opportunity?.creator_id === user?.user_id;

  useEffect(() => {
    const fetchOpportunity = async () => {
      try {
        const response = await axios.get(`${API}/opportunities/${opportunityId}`, {
          withCredentials: true,
        });
        setOpportunity(response.data);
      } catch (error) {
        console.error("Error fetching opportunity:", error);
        toast.error("Failed to load opportunity");
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunity();
  }, [opportunityId]);

  useEffect(() => {
    if (isCreator && opportunity) {
      const fetchCandidates = async () => {
        setLoadingCandidates(true);
        try {
          const response = await axios.get(
            `${API}/opportunities/${opportunityId}/candidates`,
            { withCredentials: true }
          );
          setCandidates(response.data);
        } catch (error) {
          console.error("Error fetching candidates:", error);
        } finally {
          setLoadingCandidates(false);
        }
      };

      fetchCandidates();
    }
  }, [isCreator, opportunity, opportunityId]);

  const handleApply = async () => {
    setApplying(true);
    try {
      await axios.post(
        `${API}/opportunities/${opportunityId}/apply`,
        { opportunity_id: opportunityId, cover_message: coverMessage },
        { withCredentials: true }
      );
      toast.success("Application submitted!");
      setShowApplyDialog(false);
      setHasApplied(true);
    } catch (error) {
      console.error("Error applying:", error);
      if (error.response?.data?.detail === "Already applied") {
        toast.error("You've already applied to this opportunity");
        setHasApplied(true);
      } else {
        toast.error("Failed to submit application");
      }
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <div className="glass rounded-3xl p-8 animate-pulse">
            <div className="h-8 bg-white/10 rounded w-3/4 mb-4" />
            <div className="h-4 bg-white/5 rounded w-full mb-2" />
            <div className="h-4 bg-white/5 rounded w-2/3" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!opportunity) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center py-20">
          <h2 className="text-2xl font-bold text-white mb-4">Opportunity not found</h2>
          <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 md:px-6" data-testid="opportunity-details">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="text-slate-400 hover:text-white mb-6"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="glass rounded-2xl p-8">
              <div className="flex items-start justify-between mb-6">
                <Badge
                  className={`${
                    opportunity.type === "gig"
                      ? "bg-[hsl(250_100%_70%)]/20 text-[hsl(250_100%_70%)]"
                      : "bg-[hsl(180_100%_50%)]/20 text-[hsl(180_100%_50%)]"
                  } border-0 text-sm`}
                >
                  {opportunity.type === "gig" ? "Gig" : "Job"}
                </Badge>
                <Badge
                  variant="outline"
                  className={`${
                    opportunity.status === "open"
                      ? "border-[hsl(150_100%_45%)]/50 text-[hsl(150_100%_45%)]"
                      : "border-slate-500 text-slate-500"
                  }`}
                >
                  {opportunity.status}
                </Badge>
              </div>

              <h1 className="text-3xl font-bold text-white mb-4">{opportunity.title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-6">
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {new Date(opportunity.created_at).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={14} />
                  {opportunity.applications_count} applications
                </span>
                {opportunity.timeline && (
                  <span className="flex items-center gap-1">
                    <Briefcase size={14} />
                    {opportunity.timeline}
                  </span>
                )}
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-slate-300 whitespace-pre-wrap">{opportunity.description}</p>
              </div>
            </div>

            {/* Skills */}
            {opportunity.skills_required?.length > 0 && (
              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Skills Required</h3>
                <div className="flex flex-wrap gap-2">
                  {opportunity.skills_required.map((skill, i) => (
                    <Badge key={i} variant="secondary" className="bg-white/10 border-0">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Candidates (for creator only) */}
            {isCreator && (
              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles size={18} className="text-[hsl(250_100%_70%)]" />
                  AI-Ranked Candidates
                </h3>

                {loadingCandidates ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="glass-light rounded-xl p-4 animate-pulse">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-white/10" />
                          <div className="flex-1">
                            <div className="h-4 bg-white/10 rounded w-32 mb-2" />
                            <div className="h-3 bg-white/5 rounded w-48" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : candidates.length === 0 ? (
                  <p className="text-slate-500">No applications yet</p>
                ) : (
                  <div className="space-y-3">
                    {candidates.map((candidate, i) => (
                      <Link
                        key={candidate.application_id}
                        to={`/profile/${candidate.applicant_id}`}
                        className="block glass-light rounded-xl p-4 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={candidate.applicant_picture} />
                              <AvatarFallback className="bg-white/10">
                                {candidate.applicant_name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {candidate.match_score && (
                              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-[hsl(250_100%_70%)] to-[hsl(180_100%_50%)] flex items-center justify-center text-xs font-bold text-white">
                                {i + 1}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-white">
                                {candidate.applicant_name}
                              </h4>
                              {candidate.match_score && (
                                <Badge className="bg-[hsl(250_100%_70%)]/20 text-[hsl(250_100%_70%)] border-0 text-xs">
                                  {Math.round(candidate.match_score * 100)}% match
                                </Badge>
                              )}
                            </div>
                            {candidate.match_reasoning && (
                              <p className="text-sm text-slate-400 mb-2">
                                {candidate.match_reasoning}
                              </p>
                            )}
                            {candidate.highlighted_overlap?.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {candidate.highlighted_overlap.slice(0, 3).map((item, j) => (
                                  <span
                                    key={j}
                                    className="px-2 py-0.5 rounded text-xs bg-white/5 text-slate-400"
                                  >
                                    {item}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Compensation */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <DollarSign size={18} className="text-[hsl(150_100%_45%)]" />
                Compensation
              </h3>
              <p className="text-2xl font-bold text-white">
                {opportunity.compensation_amount || opportunity.compensation_type}
              </p>
              <p className="text-sm text-slate-400">{opportunity.compensation_type}</p>
            </div>

            {/* Creator */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Posted by</h3>
              <Link
                to={`/profile/${opportunity.creator_id}`}
                className="flex items-center gap-3 hover:bg-white/5 -mx-2 px-2 py-2 rounded-lg transition-colors"
              >
                <Avatar className="w-12 h-12">
                  <AvatarImage src={opportunity.creator_picture} />
                  <AvatarFallback className="bg-white/10">
                    {opportunity.creator_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-white">{opportunity.creator_name}</p>
                  <p className="text-sm text-slate-400">View Profile</p>
                </div>
              </Link>

              {opportunity.creator_ikigai?.what_i_love?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Interests</p>
                  <div className="flex flex-wrap gap-1">
                    {opportunity.creator_ikigai.what_i_love.slice(0, 3).map((item, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded text-xs bg-[hsl(320_100%_60%)]/10 text-[hsl(320_100%_60%)]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Apply Button */}
            {!isCreator && (
              <div className="glass rounded-2xl p-6">
                {hasApplied ? (
                  <div className="text-center">
                    <CheckCircle size={48} className="mx-auto text-[hsl(150_100%_45%)] mb-3" />
                    <p className="text-white font-medium">Application Submitted</p>
                    <p className="text-sm text-slate-400">
                      The poster will review your profile
                    </p>
                  </div>
                ) : (
                  <Button
                    onClick={() => setShowApplyDialog(true)}
                    className="w-full bg-white text-black hover:bg-white/90 rounded-xl py-6 text-lg font-semibold"
                    data-testid="apply-btn"
                  >
                    <Send size={18} className="mr-2" />
                    Apply Now
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Apply Dialog */}
        <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
          <DialogContent className="bg-[hsl(240_5%_10%)] border-white/10 sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Apply to {opportunity?.title}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <label className="text-sm text-slate-400 mb-2 block">
                Cover Message (optional)
              </label>
              <Textarea
                value={coverMessage}
                onChange={(e) => setCoverMessage(e.target.value)}
                placeholder="Introduce yourself and explain why you're a great fit..."
                className="bg-black/30 border-white/10 text-white placeholder:text-slate-500 min-h-[120px]"
                data-testid="cover-message-input"
              />
            </div>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setShowApplyDialog(false)}
                className="text-slate-400"
              >
                Cancel
              </Button>
              <Button
                onClick={handleApply}
                disabled={applying}
                className="bg-white text-black hover:bg-white/90"
                data-testid="submit-application-btn"
              >
                {applying ? "Submitting..." : "Submit Application"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
