import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { Layout } from "../components/Layout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import {
  Briefcase,
  Building,
  DollarSign,
  Clock,
  Plus,
  X,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CreateOpportunity() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [formData, setFormData] = useState({
    type: "gig",
    title: "",
    description: "",
    skills_required: [],
    compensation_type: "Negotiable",
    compensation_amount: "",
    timeline: "",
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (!skillInput.trim()) return;
    if (formData.skills_required.includes(skillInput.trim())) return;
    setFormData((prev) => ({
      ...prev,
      skills_required: [...prev.skills_required, skillInput.trim()],
    }));
    setSkillInput("");
  };

  const removeSkill = (skill) => {
    setFormData((prev) => ({
      ...prev,
      skills_required: prev.skills_required.filter((s) => s !== skill),
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Please enter a description");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/opportunities`, formData, {
        withCredentials: true,
      });
      toast.success("Opportunity posted successfully!");
      navigate(`/opportunity/${response.data.opportunity_id}`);
    } catch (error) {
      console.error("Error creating opportunity:", error);
      toast.error("Failed to create opportunity");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 md:px-6" data-testid="create-opportunity">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="text-slate-400 hover:text-white mb-6"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>

        <div className="glass rounded-3xl p-8 md:p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(250_100%_70%)] to-[hsl(180_100%_50%)] flex items-center justify-center">
              <Briefcase size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Post an Opportunity</h1>
              <p className="text-slate-400">Find your next collaborator</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type Selection */}
            <div className="space-y-2">
              <Label className="text-white">Type</Label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleChange("type", "gig")}
                  className={`flex-1 p-4 rounded-xl border transition-all ${
                    formData.type === "gig"
                      ? "border-[hsl(250_100%_70%)] bg-[hsl(250_100%_70%)]/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <Briefcase
                    size={24}
                    className={formData.type === "gig" ? "text-[hsl(250_100%_70%)]" : "text-slate-400"}
                  />
                  <p className={`mt-2 font-medium ${formData.type === "gig" ? "text-white" : "text-slate-400"}`}>
                    Gig
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Short-term project</p>
                </button>
                <button
                  type="button"
                  onClick={() => handleChange("type", "job")}
                  className={`flex-1 p-4 rounded-xl border transition-all ${
                    formData.type === "job"
                      ? "border-[hsl(180_100%_50%)] bg-[hsl(180_100%_50%)]/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <Building
                    size={24}
                    className={formData.type === "job" ? "text-[hsl(180_100%_50%)]" : "text-slate-400"}
                  />
                  <p className={`mt-2 font-medium ${formData.type === "job" ? "text-white" : "text-slate-400"}`}>
                    Job
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Long-term position</p>
                </button>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">
                Title
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="e.g., AI Engineer for MVP Development"
                className="bg-black/30 border-white/10 text-white placeholder:text-slate-500 h-12"
                data-testid="opportunity-title-input"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Describe the opportunity, responsibilities, and what you're looking for..."
                className="bg-black/30 border-white/10 text-white placeholder:text-slate-500 min-h-[150px]"
                data-testid="opportunity-description-input"
              />
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <Label className="text-white">Skills Required</Label>
              <div className="flex gap-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a skill..."
                  className="bg-black/30 border-white/10 text-white placeholder:text-slate-500"
                  data-testid="skill-input"
                />
                <Button
                  type="button"
                  onClick={addSkill}
                  variant="secondary"
                  className="bg-white/10 hover:bg-white/20"
                >
                  <Plus size={18} />
                </Button>
              </div>
              {formData.skills_required.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.skills_required.map((skill, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="bg-white/10 border-0 pr-1"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1 hover:text-red-400"
                      >
                        <X size={14} />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Compensation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Compensation Type</Label>
                <Select
                  value={formData.compensation_type}
                  onValueChange={(value) => handleChange("compensation_type", value)}
                >
                  <SelectTrigger className="bg-black/30 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[hsl(240_5%_10%)] border-white/10">
                    <SelectItem value="Negotiable">Negotiable</SelectItem>
                    <SelectItem value="Fixed">Fixed Rate</SelectItem>
                    <SelectItem value="Hourly">Hourly</SelectItem>
                    <SelectItem value="Equity">Equity</SelectItem>
                    <SelectItem value="Revenue Share">Revenue Share</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="compensation_amount" className="text-white">
                  Amount (optional)
                </Label>
                <div className="relative">
                  <DollarSign
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <Input
                    id="compensation_amount"
                    value={formData.compensation_amount}
                    onChange={(e) => handleChange("compensation_amount", e.target.value)}
                    placeholder="e.g., 500-1000"
                    className="bg-black/30 border-white/10 text-white placeholder:text-slate-500 pl-9"
                  />
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-2">
              <Label htmlFor="timeline" className="text-white">
                Timeline (optional)
              </Label>
              <div className="relative">
                <Clock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <Input
                  id="timeline"
                  value={formData.timeline}
                  onChange={(e) => handleChange("timeline", e.target.value)}
                  placeholder="e.g., 2-3 weeks, Starting immediately"
                  className="bg-black/30 border-white/10 text-white placeholder:text-slate-500 pl-9"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(-1)}
                className="text-slate-400"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-white text-black hover:bg-white/90 rounded-full px-8 font-semibold"
                data-testid="submit-opportunity-btn"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Posting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles size={16} />
                    Post Opportunity
                  </span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
