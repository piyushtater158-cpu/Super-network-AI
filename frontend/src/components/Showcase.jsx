import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Award, Briefcase, Plus, X, Save, Edit2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import axios from "axios";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Showcase({ user, isOwnProfile, onUpdate }) {
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form states copied from user props or defaulted to empty
    const [professionalType, setProfessionalType] = useState(user.professional_type || "");
    const [achievements, setAchievements] = useState(user.achievements || []);
    const [certifications, setCertifications] = useState(user.certifications || []);

    const [newAchievement, setNewAchievement] = useState("");
    const [newCertification, setNewCertification] = useState("");

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                professional_type: professionalType,
                achievements,
                certifications,
            };

            const res = await axios.put(`${API}/users/profile`, payload, {
                withCredentials: true,
            });

            toast.success("Showcase updated successfully");
            setIsEditing(false);
            if (onUpdate) onUpdate(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to update showcase");
        } finally {
            setSaving(false);
        }
    };

    const handleAddAchievement = (e) => {
        e.preventDefault();
        if (newAchievement.trim()) {
            setAchievements([...achievements, newAchievement.trim()]);
            setNewAchievement("");
        }
    };

    const handleAddCertification = (e) => {
        e.preventDefault();
        if (newCertification.trim()) {
            setCertifications([...certifications, newCertification.trim()]);
            setNewCertification("");
        }
    };

    const removeAchievement = (idx) => {
        setAchievements(achievements.filter((_, i) => i !== idx));
    };

    const removeCertification = (idx) => {
        setCertifications(certifications.filter((_, i) => i !== idx));
    };

    // If viewing someone else's profile and they have absolutely zero showcase data, return null
    if (!isOwnProfile && !user.professional_type && (!user.achievements || !user.achievements.length) && (!user.certifications || !user.certifications.length)) {
        return null;
    }

    return (
        <div className="glass rounded-3xl p-8 mb-8 border border-white/5 relative overflow-hidden group">
            {/* Decorative gradients */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[hsl(250_100%_70%)]/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[hsl(180_100%_50%)]/5 rounded-full blur-[80px] pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-8 z-10 relative">
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                    <Trophy className="text-[hsl(45_100%_50%)]" size={28} />
                    Showcase
                </h2>

                {isOwnProfile && !isEditing && (
                    <Button
                        variant="ghost"
                        onClick={() => setIsEditing(true)}
                        className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full px-4"
                    >
                        <Edit2 size={16} className="mr-2" />
                        Edit
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 z-10 relative">

                {/* Left Column: Certifications & Title */}
                <div className="space-y-8">
                    {/* Professional Type */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Briefcase size={16} />
                            Professional Title
                        </h3>

                        {isEditing ? (
                            <Input
                                value={professionalType}
                                onChange={(e) => setProfessionalType(e.target.value)}
                                placeholder="e.g. Senior Frontend Engineer"
                                className="bg-black/40 border-white/10 text-white rounded-xl focus:border-[hsl(250_100%_70%)]"
                            />
                        ) : (
                            <div className="text-xl font-medium text-white bg-white/5 inline-block px-4 py-2 rounded-xl border border-white/10">
                                {user.professional_type || "No title set"}
                            </div>
                        )}
                    </div>

                    {/* Certifications */}
                    <div>
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Award size={16} />
                            Certifications
                        </h3>

                        <div className="flex flex-wrap gap-2">
                            <AnimatePresence>
                                {(isEditing ? certifications : user.certifications || []).map((cert, i) => (
                                    <motion.div
                                        key={`${cert}-${i}`}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="flex items-center gap-2 glass-light px-4 py-2 rounded-xl text-sm text-[hsl(180_100%_70%)] border border-[hsl(180_100%_50%)]/20 shadow-[0_0_15px_rgba(0,255,255,0.05)]"
                                    >
                                        <span>{cert}</span>
                                        {isEditing && (
                                            <button onClick={() => removeCertification(i)} className="text-[hsl(180_100%_70%)]/50 hover:text-red-400 transition">
                                                <X size={14} />
                                            </button>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {isEditing && (
                            <form onSubmit={handleAddCertification} className="flex gap-2 mt-4">
                                <Input
                                    value={newCertification}
                                    onChange={(e) => setNewCertification(e.target.value)}
                                    placeholder="Add a certification..."
                                    className="bg-black/40 border-white/10 text-sm text-white rounded-xl h-10 flex-1"
                                />
                                <Button type="submit" disabled={!newCertification.trim()} className="h-10 w-10 p-0 rounded-xl bg-white/10 hover:bg-white/20 text-white">
                                    <Plus size={18} />
                                </Button>
                            </form>
                        )}
                    </div>
                </div>

                {/* Right Column: Achievements */}
                <div className="space-y-8">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Trophy size={16} />
                            Achievements & Honors
                        </h3>

                        <div className="space-y-3">
                            <AnimatePresence>
                                {(isEditing ? achievements : user.achievements || []).map((achieve, i) => (
                                    <motion.div
                                        key={`${achieve}-${i}`}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="flex justify-between items-start glass-light p-4 rounded-xl border border-[hsl(250_100%_70%)]/20 border-l-4 border-l-[hsl(250_100%_70%)]"
                                    >
                                        <p className="text-slate-300 text-sm font-medium pr-4 leading-relaxed">{achieve}</p>
                                        {isEditing && (
                                            <button onClick={() => removeAchievement(i)} className="text-slate-500 hover:text-red-400 p-1 shrink-0 transition">
                                                <X size={16} />
                                            </button>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {isEditing && (
                            <form onSubmit={handleAddAchievement} className="flex gap-2 mt-4">
                                <Input
                                    value={newAchievement}
                                    onChange={(e) => setNewAchievement(e.target.value)}
                                    placeholder="Add a milestone or honor..."
                                    className="bg-black/40 border-white/10 text-sm text-white rounded-xl h-10 flex-1"
                                />
                                <Button type="submit" disabled={!newAchievement.trim()} className="h-10 w-10 p-0 rounded-xl bg-white/10 hover:bg-white/20 text-white">
                                    <Plus size={18} />
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Controls */}
            <AnimatePresence>
                {isEditing && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="mt-8 pt-6 border-t border-white/5 flex justify-end gap-3 z-10 relative"
                    >
                        <Button
                            variant="ghost"
                            onClick={() => {
                                // Reset to saved state
                                setProfessionalType(user.professional_type || "");
                                setAchievements(user.achievements || []);
                                setCertifications(user.certifications || []);
                                setIsEditing(false);
                            }}
                            className="text-slate-400 hover:text-white rounded-xl px-6"
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            className="bg-gradient-to-r from-[hsl(250_100%_70%)] to-[hsl(180_100%_50%)] hover:opacity-90 text-white rounded-xl px-8"
                            disabled={saving}
                        >
                            {saving ? (
                                <motion.div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                            ) : (
                                <>
                                    <Save size={18} className="mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
