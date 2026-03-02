import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { IkigaiScene } from "../components/3d/Scenes";
import { 
  Heart, 
  Star, 
  DollarSign, 
  Globe, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Check,
  Plus,
  X
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STEPS = [
  {
    key: "what_i_love",
    title: "What I LOVE",
    subtitle: "What brings you energy?",
    icon: Heart,
    color: "hsl(320, 100%, 60%)",
    prompts: [
      "What brings you energy?",
      "When were you most happy?",
      "What makes you proud?",
      "What do you admire in others?"
    ]
  },
  {
    key: "what_im_good_at",
    title: "What I'm GOOD AT",
    subtitle: "Your skills and strengths",
    icon: Star,
    color: "hsl(250, 100%, 70%)",
    prompts: [
      "What do friends/family say about you?",
      "What feedback do you get from colleagues?",
      "What skills come naturally to you?",
      "What problems do people ask you to solve?"
    ]
  },
  {
    key: "what_i_can_be_paid_for",
    title: "What I can be PAID FOR",
    subtitle: "Your marketable skills",
    icon: DollarSign,
    color: "hsl(180, 100%, 50%)",
    prompts: [
      "What do you currently get paid for?",
      "Are your skills transferable to other fields?",
      "Any valuable skills you're not using?",
      "Who could pay for what you can do?"
    ]
  },
  {
    key: "what_the_world_needs",
    title: "What the WORLD NEEDS",
    subtitle: "Your impact potential",
    icon: Globe,
    color: "hsl(150, 100%, 45%)",
    prompts: [
      "What would many people benefit from?",
      "In your ideal world, what's different?",
      "Any trends you'd like to accelerate?",
      "What problems do you want to solve?"
    ]
  }
];

export default function IkigaiOnboarding() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [formData, setFormData] = useState({
    what_i_love: [],
    what_im_good_at: [],
    what_i_can_be_paid_for: [],
    what_the_world_needs: []
  });

  const step = STEPS[currentStep];
  const Icon = step.icon;
  const currentItems = formData[step.key];

  const addItem = () => {
    if (!inputValue.trim()) return;
    setFormData(prev => ({
      ...prev,
      [step.key]: [...prev[step.key], inputValue.trim()]
    }));
    setInputValue("");
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      [step.key]: prev[step.key].filter((_, i) => i !== index)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      setInputValue("");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setInputValue("");
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/ikigai`, formData, {
        withCredentials: true
      });
      
      // Update user state
      updateUser({ ...user, onboarding_completed: true, ikigai: response.data });
      
      toast.success("Ikigai profile created! Welcome to SuperNetworkAI!");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Error saving Ikigai:", error);
      toast.error("Failed to save your Ikigai profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const progress = (currentStep + 1) / STEPS.length;
  const canProceed = currentItems.length > 0;

  return (
    <div className="min-h-screen bg-[hsl(240_10%_2%)] relative overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0 opacity-60">
        <IkigaiScene progress={progress} activeSection={currentStep} />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[hsl(250_100%_70%)] to-[hsl(180_100%_50%)] flex items-center justify-center">
                <Sparkles size={20} className="text-white" />
              </div>
              <span className="font-bold text-lg text-white">
                SuperNetwork<span className="text-[hsl(250_100%_70%)]">AI</span>
              </span>
            </div>
            
            {/* Progress */}
            <div className="flex items-center gap-2">
              {STEPS.map((s, i) => {
                const StepIcon = s.icon;
                const isComplete = i < currentStep;
                const isCurrent = i === currentStep;
                return (
                  <div
                    key={s.key}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isComplete
                        ? "bg-[hsl(150_100%_45%)]"
                        : isCurrent
                        ? "bg-white/10 border-2"
                        : "bg-white/5"
                    }`}
                    style={{ borderColor: isCurrent ? s.color : "transparent" }}
                  >
                    {isComplete ? (
                      <Check size={18} className="text-white" />
                    ) : (
                      <StepIcon size={18} style={{ color: isCurrent ? s.color : "rgba(255,255,255,0.3)" }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-2xl">
            <div className="glass rounded-3xl p-8 md:p-12 animate-scale-in">
              {/* Step Header */}
              <div className="text-center mb-8">
                <div
                  className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                  style={{ backgroundColor: `${step.color}20` }}
                >
                  <Icon size={40} style={{ color: step.color }} />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {step.title}
                </h1>
                <p className="text-slate-400">{step.subtitle}</p>
              </div>

              {/* Prompts */}
              <div className="mb-6 space-y-2">
                <p className="text-sm text-slate-500 uppercase tracking-wider">Consider these questions:</p>
                <div className="flex flex-wrap gap-2">
                  {step.prompts.map((prompt, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-full text-xs bg-white/5 text-slate-400 border border-white/10"
                    >
                      {prompt}
                    </span>
                  ))}
                </div>
              </div>

              {/* Input */}
              <div className="flex gap-3 mb-6">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add your response..."
                  className="flex-1 bg-black/30 border-white/10 text-white placeholder:text-slate-500 h-12 rounded-xl focus:border-white/30"
                  data-testid="ikigai-input"
                />
                <Button
                  onClick={addItem}
                  disabled={!inputValue.trim()}
                  className="h-12 px-4 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30"
                  data-testid="ikigai-add-btn"
                >
                  <Plus size={20} />
                </Button>
              </div>

              {/* Items List */}
              <div className="min-h-[120px] mb-8">
                {currentItems.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    Add at least one item to continue
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {currentItems.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 group animate-scale-in"
                        style={{ animationDelay: `${i * 0.05}s` }}
                      >
                        <span className="text-white text-sm">{item}</span>
                        <button
                          onClick={() => removeItem(i)}
                          className="text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  variant="ghost"
                  className="text-slate-400 hover:text-white disabled:opacity-30"
                  data-testid="ikigai-back-btn"
                >
                  <ArrowLeft size={18} className="mr-2" />
                  Back
                </Button>

                {currentStep < STEPS.length - 1 ? (
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed}
                    className="bg-white text-black hover:bg-white/90 rounded-full px-6 py-2 font-semibold disabled:opacity-30"
                    data-testid="ikigai-next-btn"
                  >
                    Continue
                    <ArrowRight size={18} className="ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleComplete}
                    disabled={!canProceed || loading}
                    className="bg-gradient-to-r from-[hsl(250_100%_70%)] to-[hsl(180_100%_50%)] text-white hover:opacity-90 rounded-full px-8 py-2 font-semibold disabled:opacity-30"
                    data-testid="ikigai-complete-btn"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Complete
                        <Sparkles size={18} />
                      </span>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
