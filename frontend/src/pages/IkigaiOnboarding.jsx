import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Crystal3D,
  IkigaiNode3D,
  FloatingParticles,
  GradientOrbs,
  ConstellationLines,
} from "../components/3d/CrystalComponents";
import CVUploader from "../components/CVUploader";
import {
  Heart,
  Star,
  DollarSign,
  Globe,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Plus,
  X,
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STEPS = [
  {
    key: "what_i_love",
    title: "What I LOVE",
    subtitle: "Activities that bring you energy and joy",
    icon: Heart,
    color: "#ec4899",
    prompts: [
      "What makes you lose track of time?",
      "What topics could you talk about for hours?",
      "When do you feel most alive?",
      "What activities energize rather than drain you?"
    ],
    examples: ["Creating art", "Solving puzzles", "Teaching others", "Building products"]
  },
  {
    key: "what_im_good_at",
    title: "What I'm GOOD AT",
    subtitle: "Your natural talents and developed skills",
    icon: Star,
    color: "#8b5cf6",
    prompts: [
      "What do people often ask for your help with?",
      "What skills have you developed over time?",
      "What comes easily to you that others find difficult?",
      "What positive feedback do you consistently receive?"
    ],
    examples: ["Public speaking", "Data analysis", "Design thinking", "Problem solving"]
  },
  {
    key: "what_i_can_be_paid_for",
    title: "What I can be PAID FOR",
    subtitle: "Skills the market values and rewards",
    icon: DollarSign,
    color: "#06b6d4",
    prompts: [
      "What services could you offer professionally?",
      "What skills are in demand in your field?",
      "What have you been paid for before?",
      "What would people hire you to do?"
    ],
    examples: ["Software development", "Marketing strategy", "Financial consulting", "Content creation"]
  },
  {
    key: "what_the_world_needs",
    title: "What the WORLD NEEDS",
    subtitle: "Problems you want to help solve",
    icon: Globe,
    color: "#22c55e",
    prompts: [
      "What issues do you care deeply about?",
      "What changes would you like to see in the world?",
      "What problems affect people around you?",
      "Where can you make the biggest impact?"
    ],
    examples: ["Climate solutions", "Education access", "Mental health awareness", "Tech accessibility"]
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

  // Node positions for constellation
  const nodePositions = useMemo(() => [
    { x: "50%", y: "8%" },   // Top - LOVE
    { x: "92%", y: "50%" },  // Right - GOOD AT
    { x: "50%", y: "92%" },  // Bottom - PAID FOR
    { x: "8%", y: "50%" },   // Left - WORLD NEEDS
  ], []);

  // Convert percentage positions to pixels for SVG
  const constellationPoints = useMemo(() => [
    { x: "50%", y: "8%" },
    { x: "92%", y: "50%" },
    { x: "50%", y: "92%" },
    { x: "8%", y: "50%" },
  ], []);

  const addItem = () => {
    if (!inputValue.trim()) return;
    if (currentItems.includes(inputValue.trim())) {
      toast.error("Already added!");
      return;
    }
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

  const handleCVParsed = async (data) => {
    setFormData(prev => ({
      what_i_love: [...new Set([...prev.what_i_love, ...(data.ikigai_suggestions?.what_i_love || [])])],
      what_im_good_at: [...new Set([...prev.what_im_good_at, ...(data.ikigai_suggestions?.what_im_good_at || []), ...(data.skills || [])])],
      what_i_can_be_paid_for: [...new Set([...prev.what_i_can_be_paid_for, ...(data.ikigai_suggestions?.what_i_can_be_paid_for || []), ...(data.roles || [])])],
      what_the_world_needs: [...new Set([...prev.what_the_world_needs, ...(data.ikigai_suggestions?.what_the_world_needs || [])])]
    }));

    try {
      if ((data.roles && data.roles.length) || (data.skills && data.skills.length)) {
        await axios.put(`${API}/users/profile`, {
          role_labels: data.roles || [],
          matching_preferences: { skills: data.skills || [], interests: [], working_style: "Flexible", team_preference: "Flexible", hours_per_week: 40, domains: [] }
        }, { withCredentials: true });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addExample = (example) => {
    if (currentItems.includes(example)) return;
    setFormData(prev => ({
      ...prev,
      [step.key]: [...prev[step.key], example]
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

  const handleNodeClick = (index) => {
    if (index <= currentStep || formData[STEPS[index - 1]?.key]?.length > 0) {
      setCurrentStep(index);
      setInputValue("");
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/ikigai`, formData, {
        withCredentials: true
      });

      updateUser({ ...user, onboarding_completed: true, ikigai: response.data });

      toast.success("Your Ikigai profile is ready! Welcome to SuperNetworkAI!");
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
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Animated background */}
      <FloatingParticles count={60} />
      <GradientOrbs />

      {/* Grid lines */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Header */}
      <header className="relative z-20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Sparkles size={22} className="text-white" />
            </motion.div>
            <span className="font-bold text-xl text-white">
              SuperNetwork<span className="text-violet-400">AI</span>
            </span>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">Step {currentStep + 1} of {STEPS.length}</span>
            <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-violet-500 to-cyan-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main content - Split view */}
      <div className="relative z-10 flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
        {/* Left side - 3D Visualization */}
        <div className="lg:w-1/2 relative flex items-center justify-center p-8">
          <div className="relative w-full max-w-lg aspect-square">
            {/* Central Crystal */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <Crystal3D size={140} progress={progress} activeColor={step.color} />
            </div>

            {/* Ikigai Nodes */}
            {STEPS.map((s, i) => {
              const isActive = i === currentStep;
              const isComplete = formData[s.key].length > 0;

              return (
                <IkigaiNode3D
                  key={s.key}
                  label={s.title.split(" ").pop()}
                  icon={s.icon}
                  color={s.color}
                  position={nodePositions[i]}
                  isActive={isActive}
                  isComplete={isComplete && i !== currentStep}
                  onClick={() => handleNodeClick(i)}
                  index={i}
                />
              );
            })}

            {/* Orbiting particles */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              {Array.from({ length: 12 }, (_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 rounded-full"
                  style={{
                    background: step.color,
                    boxShadow: `0 0 8px ${step.color}`,
                  }}
                  animate={{
                    x: Math.cos((i / 12) * Math.PI * 2 + Date.now() / 2000) * 100,
                    y: Math.sin((i / 12) * Math.PI * 2 + Date.now() / 2000) * 100,
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right side - Input form */}
        <div className="lg:w-1/2 flex items-center justify-center p-8">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-lg"
          >
            {/* Step header */}
            <div className="mb-8">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
                style={{
                  background: `${step.color}20`,
                  border: `1px solid ${step.color}40`,
                }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <Icon size={18} style={{ color: step.color }} />
                <span className="text-sm font-medium" style={{ color: step.color }}>
                  {step.title}
                </span>
              </motion.div>

              <h2 className="text-4xl font-black text-white mb-3">
                {step.title}
              </h2>
              <p className="text-lg text-slate-400">{step.subtitle}</p>
            </div>

            {/* Prompts */}
            <div className="mb-6 space-y-2">
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">
                Consider these questions
              </p>
              <div className="grid grid-cols-2 gap-2">
                {step.prompts.map((prompt, i) => (
                  <motion.div
                    key={i}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-400"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {prompt}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CV Uploader (Step 1 only) */}
            {currentStep === 0 && (
              <CVUploader onParsedData={handleCVParsed} />
            )}

            {/* Input */}
            <div className="flex gap-3 mb-4">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your response..."
                className="flex-1 h-14 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl text-lg focus:border-violet-500/50 focus:ring-violet-500/20"
                data-testid="ikigai-input"
              />
              <Button
                onClick={addItem}
                disabled={!inputValue.trim()}
                className="h-14 w-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 disabled:opacity-30 disabled:cursor-not-allowed"
                data-testid="ikigai-add-btn"
              >
                <Plus size={24} />
              </Button>
            </div>

            {/* Quick add examples */}
            <div className="mb-6">
              <p className="text-xs text-slate-500 mb-2">Quick add:</p>
              <div className="flex flex-wrap gap-2">
                {step.examples.filter(ex => !currentItems.includes(ex)).map((example, i) => (
                  <motion.button
                    key={example}
                    onClick={() => addExample(example)}
                    className="px-3 py-1.5 rounded-full text-sm bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    + {example}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Added items */}
            <div className="min-h-[120px] mb-8 p-4 rounded-2xl bg-white/5 border border-white/10">
              {currentItems.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500">
                  <p>Add at least one item to continue</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence mode="popLayout">
                    {currentItems.map((item, i) => (
                      <motion.div
                        key={item}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full border"
                        style={{
                          background: `${step.color}15`,
                          borderColor: `${step.color}40`,
                        }}
                      >
                        <span className="text-white text-sm">{item}</span>
                        <button
                          onClick={() => removeItem(i)}
                          className="text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
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
                  className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white rounded-full px-8 py-3 font-semibold disabled:opacity-30"
                  data-testid="ikigai-next-btn"
                >
                  Continue
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={!canProceed || loading}
                  className="bg-gradient-to-r from-violet-500 via-purple-500 to-cyan-500 hover:opacity-90 text-white rounded-full px-8 py-3 font-semibold disabled:opacity-30 relative overflow-hidden"
                  data-testid="ikigai-complete-btn"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <motion.div
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Creating Profile...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles size={18} />
                      Discover My Ikigai
                    </span>
                  )}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
