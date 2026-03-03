import React, { useState, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";
import { UploadCloud, File, X, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function CVUploader({ onParsedData }) {
    const [isDragActive, setIsDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelected(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileSelected(e.target.files[0]);
        }
    };

    const handleFileSelected = (file) => {
        const validTypes = ["application/pdf", "text/plain", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
        if (!validTypes.includes(file.type)) {
            toast.error("Please upload a PDF or DOCX file.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File details too large. Max 5MB.");
            return;
        }
        setSelectedFile(file);
    };

    const handleUploadClick = async () => {
        if (!selectedFile) return;
        setIsUploading(true);

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const res = await axios.post(`${API}/users/upload-cv`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true
            });
            toast.success("AI parsed your resume successfully!");
            onParsedData(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to parse resume. Please enter manually.");
        } finally {
            setIsUploading(false);
            setSelectedFile(null); // Reset after successful parse so it collapses
        }
    };

    return (
        <div className="w-full mb-8">
            <div
                className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 ${isDragActive
                        ? "border-violet-500 bg-violet-500/10"
                        : "border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10"
                    }`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !selectedFile && fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                    onChange={handleFileChange}
                />

                <AnimatePresence mode="wait">
                    {!selectedFile ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center text-center space-y-3 cursor-pointer"
                        >
                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                                <UploadCloud className="w-6 h-6 text-slate-300" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-white">Upload your CV / Resume</p>
                                <p className="text-xs text-slate-400 mt-1">PDF or DOCX (max 5MB)</p>
                            </div>
                            <p className="text-xs text-violet-400 font-medium flex items-center gap-1 mt-2">
                                <Sparkles size={14} /> AI will pre-fill your profile
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="selected"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center">
                                    <File className="w-6 h-6 text-violet-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white truncate max-w-[200px]">{selectedFile.name}</p>
                                    <p className="text-xs text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                                    disabled={isUploading}
                                >
                                    <X size={18} />
                                </button>
                                <Button
                                    onClick={(e) => { e.stopPropagation(); handleUploadClick(); }}
                                    disabled={isUploading}
                                    className="bg-violet-600 hover:bg-violet-500 text-white rounded-lg px-4"
                                >
                                    {isUploading ? (
                                        <motion.div
                                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        />
                                    ) : <Sparkles size={16} className="mr-2" />}
                                    {isUploading ? "Analyzing..." : "Auto-fill"}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
