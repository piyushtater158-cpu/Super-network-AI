import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { Layout } from "../components/Layout";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import {
  Settings as SettingsIcon,
  User,
  Target,
  Clock,
  MapPin,
  Linkedin,
  Github,
  Link as LinkIcon,
  Plus,
  X,
  Save,
  Globe2,
  Lock,
  Settings2
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Settings() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [roleInput, setRoleInput] = useState("");
  const [formData, setFormData] = useState({
    location: user?.location || "",
    linkedin_url: user?.linkedin_url || "",
    github_url: user?.github_url || "",
    portfolio_url: user?.portfolio_url || "",
    primary_intent: user?.primary_intent || "Freelance/Gigs",
    secondary_intents: user?.secondary_intents || [],
    availability: user?.availability || "Available now",
    available_from: user?.available_from || "",
    role_labels: user?.role_labels || [],
    is_public: user?.is_public !== false,
    matching_preferences: user?.matching_preferences || {
      skills: [], interests: [], working_style: "Flexible",
      team_preference: "Flexible", hours_per_week: 40, domains: []
    },
  });

  const handlePreferenceChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      matching_preferences: { ...prev.matching_preferences, [field]: value }
    }));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addRole = () => {
    if (!roleInput.trim()) return;
    if (formData.role_labels.includes(roleInput.trim())) return;
    setFormData((prev) => ({
      ...prev,
      role_labels: [...prev.role_labels, roleInput.trim()],
    }));
    setRoleInput("");
  };

  const removeRole = (role) => {
    setFormData((prev) => ({
      ...prev,
      role_labels: prev.role_labels.filter((r) => r !== role),
    }));
  };

  const toggleSecondaryIntent = (intent) => {
    setFormData((prev) => {
      const intents = prev.secondary_intents.includes(intent)
        ? prev.secondary_intents.filter((i) => i !== intent)
        : [...prev.secondary_intents, intent];
      return { ...prev, secondary_intents: intents };
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await axios.put(`${API}/users/profile`, formData, {
        withCredentials: true,
      });
      updateUser({ ...user, ...response.data });
      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 md:px-6" data-testid="settings">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <SettingsIcon size={28} className="text-[hsl(250_100%_70%)]" />
            Settings
          </h1>
          <p className="text-slate-400">Manage your profile and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <User size={18} className="text-[hsl(250_100%_70%)]" />
              Basic Information
            </h3>

            <div className="space-y-4">
              {/* Role Labels */}
              <div className="space-y-2">
                <Label className="text-white">Role Labels</Label>
                <div className="flex gap-2">
                  <Input
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRole())}
                    placeholder="e.g., AI Engineer, Designer, Founder"
                    className="bg-black/30 border-white/10 text-white placeholder:text-slate-500"
                    data-testid="role-input"
                  />
                  <Button
                    type="button"
                    onClick={addRole}
                    variant="secondary"
                    className="bg-white/10 hover:bg-white/20"
                  >
                    <Plus size={18} />
                  </Button>
                </div>
                {formData.role_labels.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.role_labels.map((role, i) => (
                      <Badge key={i} variant="secondary" className="bg-white/10 border-0 pr-1">
                        {role}
                        <button
                          type="button"
                          onClick={() => removeRole(role)}
                          className="ml-1 hover:text-red-400"
                        >
                          <X size={14} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-white">
                  Location
                </Label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    placeholder="e.g., San Francisco, CA"
                    className="bg-black/30 border-white/10 text-white placeholder:text-slate-500 pl-9"
                    data-testid="location-input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <LinkIcon size={18} className="text-[hsl(180_100%_50%)]" />
              Social Links
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="linkedin" className="text-white">
                  LinkedIn
                </Label>
                <div className="relative">
                  <Linkedin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <Input
                    id="linkedin"
                    value={formData.linkedin_url}
                    onChange={(e) => handleChange("linkedin_url", e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className="bg-black/30 border-white/10 text-white placeholder:text-slate-500 pl-9"
                    data-testid="linkedin-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="github" className="text-white">
                  GitHub
                </Label>
                <div className="relative">
                  <Github size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <Input
                    id="github"
                    value={formData.github_url}
                    onChange={(e) => handleChange("github_url", e.target.value)}
                    placeholder="https://github.com/username"
                    className="bg-black/30 border-white/10 text-white placeholder:text-slate-500 pl-9"
                    data-testid="github-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolio" className="text-white">
                  Portfolio / Website
                </Label>
                <div className="relative">
                  <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <Input
                    id="portfolio"
                    value={formData.portfolio_url}
                    onChange={(e) => handleChange("portfolio_url", e.target.value)}
                    placeholder="https://yoursite.com"
                    className="bg-black/30 border-white/10 text-white placeholder:text-slate-500 pl-9"
                    data-testid="portfolio-input"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Intent & Availability */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Target size={18} className="text-[hsl(320_100%_60%)]" />
              Intent & Availability
            </h3>

            <div className="space-y-6">
              {/* Primary Intent */}
              <div className="space-y-2">
                <Label className="text-white">Primary Intent</Label>
                <Select
                  value={formData.primary_intent}
                  onValueChange={(value) => handleChange("primary_intent", value)}
                >
                  <SelectTrigger className="bg-black/30 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[hsl(240_5%_10%)] border-white/10">
                    <SelectItem value="Freelance/Gigs">Freelance/Gigs</SelectItem>
                    <SelectItem value="Job">Job</SelectItem>
                    <SelectItem value="Cofounder">Cofounder</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Secondary Intents */}
              <div className="space-y-2">
                <Label className="text-white">Also Open To</Label>
                <div className="space-y-3">
                  {["Also open to freelance", "Also open to jobs", "Also open to cofounder"].map(
                    (intent) => (
                      <div key={intent} className="flex items-center space-x-3">
                        <Checkbox
                          id={intent}
                          checked={formData.secondary_intents.includes(intent)}
                          onCheckedChange={() => toggleSecondaryIntent(intent)}
                          className="border-white/20 data-[state=checked]:bg-[hsl(250_100%_70%)] data-[state=checked]:border-[hsl(250_100%_70%)]"
                        />
                        <label
                          htmlFor={intent}
                          className="text-sm text-slate-300 cursor-pointer"
                        >
                          {intent}
                        </label>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-2">
                <Label className="text-white">Availability</Label>
                <Select
                  value={formData.availability}
                  onValueChange={(value) => handleChange("availability", value)}
                >
                  <SelectTrigger className="bg-black/30 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[hsl(240_5%_10%)] border-white/10">
                    <SelectItem value="Available now">Available now</SelectItem>
                    <SelectItem value="On a gig — limited capacity">
                      On a gig — limited capacity
                    </SelectItem>
                    <SelectItem value="Available from date">Available from date</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.availability === "Available from date" && (
                <div className="space-y-2">
                  <Label htmlFor="available_from" className="text-white">
                    Available From
                  </Label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <Input
                      id="available_from"
                      type="date"
                      value={formData.available_from}
                      onChange={(e) => handleChange("available_from", e.target.value)}
                      className="bg-black/30 border-white/10 text-white pl-9"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Visibility Controls */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Globe2 size={18} className="text-[hsl(200_100%_50%)]" />
              Privacy & Visibility
            </h3>
            <div className="flex items-start space-x-3 bg-white/5 p-4 rounded-xl border border-white/10 text-white/90">
              <Checkbox
                id="is_public"
                checked={formData.is_public}
                onCheckedChange={(c) => handleChange("is_public", c)}
              />
              <div>
                <Label htmlFor="is_public" className="font-medium cursor-pointer">Public Profile</Label>
                <p className="text-sm text-slate-400 mt-1">
                  Allow your profile to appear in AI matching results and the leaderboard. Turn this off to stay hidden while searching for opportunities.
                </p>
              </div>
            </div>
          </div>

          {/* Matching Preferences */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Settings2 size={18} className="text-[hsl(45_100%_50%)]" />
              Matching Preferences
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Working Style</Label>
                <Select
                  value={formData.matching_preferences.working_style}
                  onValueChange={(val) => handlePreferenceChange("working_style", val)}
                >
                  <SelectTrigger className="bg-black/30 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10">
                    <SelectItem value="Flexible">Flexible / Hybrid</SelectItem>
                    <SelectItem value="Remote Only">Remote Only</SelectItem>
                    <SelectItem value="In Person Only">In Person Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Team Setting</Label>
                <Select
                  value={formData.matching_preferences.team_preference}
                  onValueChange={(val) => handlePreferenceChange("team_preference", val)}
                >
                  <SelectTrigger className="bg-black/30 border-white/10 text-white"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10">
                    <SelectItem value="Flexible">Open to Any</SelectItem>
                    <SelectItem value="Solo">Solo Contributor</SelectItem>
                    <SelectItem value="Small Team">Small Team (2-5)</SelectItem>
                    <SelectItem value="Large Team">Large Team / Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Capacity (Hours/Week)</Label>
                <Input
                  type="number"
                  min="5" max="80"
                  value={formData.matching_preferences.hours_per_week}
                  onChange={(e) => handlePreferenceChange("hours_per_week", parseInt(e.target.value) || 40)}
                  className="bg-black/30 border-white/10 text-white placeholder:text-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-4 pt-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-slate-400"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-white text-black hover:bg-white/90 rounded-full px-8 font-semibold"
              data-testid="save-settings-btn"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save size={16} />
                  Save Changes
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
