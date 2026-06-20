import React, { useState } from 'react';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Wrench, 
  Globe, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  ExternalLink,
  Palette,
  Upload,
  Image as ImageIcon,
  ArrowLeft,
  X,
  Trophy,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  FileText,
  Download,
  Languages,
  Linkedin,
  Github,
  Twitter,
  Instagram,
  Facebook,
  Link as LinkIcon,
  Star,
  PlusCircle,
  MinusCircle,
  ClipboardPaste
} from 'lucide-react';
import { CVData, Experience, Education, Skill, Industry, Project } from '../types';
import { cn } from '../lib/utils';
import { getTailoredSuggestions, calculateCVScore, parseCVText } from '../services/geminiService';
import { enhancementTemplates } from '../constants/enhancementTemplates';
import { generateTemplateApplicationLetter } from '../lib/applicationLetterGenerator';
import { calculateCompletionScore } from '../lib/scoring';
import { industrySkills, industryKeywords } from '../constants/industryData';
import { motion, AnimatePresence } from 'motion/react';
import { countries } from '../constants/countries';

const POPULAR_LANGUAGES = [
  "English",
  "Yoruba",
  "Igbo",
  "Hausa",
  "Nigerian Pidgin",
  "French",
  "Spanish",
  "Arabic",
  "German",
  "Chinese (Mandarin)",
  "Portuguese",
  "Swahili",
  "Russian",
  "Japanese",
  "Korean",
  "Italian",
  "Hindi",
  "Turkish",
  "Polish",
  "Dutch",
  "Swedish",
  "Norwegian",
  "Zulu",
  "Afrikaans",
  "Amharic",
  "Bengali",
  "Urdu",
  "Vietnamese"
];

interface SidebarProps {
  data: CVData;
  onChange: (newData: CVData) => void;
  industry: string;
  industryKey: Industry;
  onIndustryChange: (industry: Industry | null) => void;
  onModeChange: (mode: 'home' | 'cv' | 'letter') => void;
  onLogoClick?: () => void;
}

export default function Sidebar({ data, onChange, industry, industryKey, onIndustryChange, onModeChange, onLogoClick }: SidebarProps) {
  const [activeSection, setActiveSection] = useState<string>(data.personalInfo.fullName ? 'personal' : 'autofill');
  const [enhancing, setEnhancing] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [industryData, setIndustryData] = useState<{ skills: string[], keywords: string[] } | null>(null);
  const [loadingIndustry, setLoadingIndustry] = useState(false);
  const [tailoredKeywords, setTailoredKeywords] = useState<Record<string, string[]>>({});
  const [cvScore, setCvScore] = useState<{ score: number, tips: string[], analysis: string } | null>(null);
  const [isCalculatingScore, setIsCalculatingScore] = useState(false);
  const [completionScore, setCompletionScore] = useState(0);
  const [isGeneratingApplicationLetter, setIsGeneratingApplicationLetter] = useState(false);
  const [rawCVText, setRawCVText] = useState('');
  const [isParsingCV, setIsParsingCV] = useState(false);

  // Update completion score instantly
  React.useEffect(() => {
    setCompletionScore(calculateCompletionScore(data));
  }, [data]);

  const fetchIndustrySuggestions = () => {
    if (!industry || !industryKey) {
      setIndustryData(null);
      return;
    }
    
    const skills = industrySkills[industryKey] || [];
    const keywords = industryKeywords[industryKey] || [];
    
    setIndustryData({ skills, keywords });
  };

  const updateCVScore = async () => {
    if (!industry || !industryKey) {
      return;
    }
    
    // Only calculate AI score if there's enough content to analyze
    if (completionScore < 20) {
      setCvScore(null);
      return;
    }

    setIsCalculatingScore(true);
    try {
      const result = await calculateCVScore(data, industry);
      setCvScore(result);
    } catch (error) {
      console.error("Failed to calculate CV score:", error);
    } finally {
      setIsCalculatingScore(false);
    }
  };

  // Fetch industry suggestions only when industry changes
  React.useEffect(() => {
    fetchIndustrySuggestions();
  }, [industryKey]);

  // Debounce score calculation when data or industry changes
  React.useEffect(() => {
    const timer = setTimeout(() => {
      updateCVScore();
    }, 2000);
    return () => clearTimeout(timer);
  }, [data, industry]);

  const updatePersonalInfo = (field: keyof CVData['personalInfo'], value: any) => {
    onChange({
      ...data,
      personalInfo: { ...data.personalInfo, [field]: value }
    });
  };

  const addSocialLink = () => {
    const newLink = { id: Date.now().toString(), platform: '', url: '' };
    updatePersonalInfo('socialLinks', [...data.personalInfo.socialLinks, newLink]);
  };

  const removeSocialLink = (id: string) => {
    updatePersonalInfo('socialLinks', data.personalInfo.socialLinks.filter(l => l.id !== id));
  };

  const updateSocialLink = (id: string, field: 'platform' | 'url', value: string) => {
    const newLinks = data.personalInfo.socialLinks.map(l => l.id === id ? { ...l, [field]: value } : l);
    updatePersonalInfo('socialLinks', newLinks);
  };

  const getSocialIcon = (platform: string) => {
    const p = platform.toLowerCase();
    if (p.includes('linkedin')) return <Linkedin className="w-3.5 h-3.5" />;
    if (p.includes('github')) return <Github className="w-3.5 h-3.5" />;
    if (p.includes('twitter') || p.includes(' x ')) return <Twitter className="w-3.5 h-3.5" />;
    if (p.includes('instagram')) return <Instagram className="w-3.5 h-3.5" />;
    if (p.includes('facebook')) return <Facebook className="w-3.5 h-3.5" />;
    return <LinkIcon className="w-3.5 h-3.5" />;
  };

  const handleEnhance = async (field: string, text: string, type: 'summary' | 'experience') => {
    setEnhancing(field);
    
    // Simulate a short "AI thinking" delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      let title = '';
      if (type === 'summary') {
        title = data.personalInfo.title;
      } else if (field.startsWith('exp-')) {
        const id = field.split('-')[1];
        const exp = data.experiences.find(e => e.id === id);
        title = exp?.position || '';
      }

      // Use pre-made templates instead of Gemini API
      const industryKeyToUse = industryKey || 'technology';
      const templates = enhancementTemplates[industryKeyToUse];
      const pool = type === 'summary' ? templates.summaries : templates.experiences;
      
      // Pick a random template from the pool
      const randomIndex = Math.floor(Math.random() * pool.length);
      let enhanced = pool[randomIndex];

      // Refine the template with context
      enhanced = enhanced.replace(/\[TITLE\]/g, title || 'Professional');
      enhanced = enhanced.replace(/\[INDUSTRY\]/g, industry || 'the industry');

      if (enhanced) {
        if (type === 'summary') {
          updatePersonalInfo('summary', enhanced);
        } else if (field.startsWith('exp-')) {
          const id = field.split('-')[1];
          const newExp = data.experiences.map(e => e.id === id ? { ...e, description: enhanced } : e);
          onChange({ ...data, experiences: newExp });
        }
      }
    } catch (error: any) {
      console.error("Enhance failed:", error);
      alert("Something went wrong with the enhancement. Please try again.");
    } finally {
      setEnhancing(null);
    }
  };

  const getTailoredKeywords = async (field: string, text: string) => {
    if (!text || text.length < 10) return;
    const keywords = await getTailoredSuggestions(industry, field, text);
    if (keywords) {
      setTailoredKeywords(prev => ({ ...prev, [field]: keywords.split(',').map(k => k.trim()) }));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updatePersonalInfo('photo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
    onChange({ ...data, experiences: [...data.experiences, newExp] });
  };

  const removeExperience = (id: string) => {
    onChange({ ...data, experiences: data.experiences.filter(e => e.id !== id) });
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    const newExp = data.experiences.map(e => e.id === id ? { ...e, [field]: value } : e);
    onChange({ ...data, experiences: newExp });
  };

  const addEducation = (type: Education['type'] = 'Higher') => {
    const newEdu: Education = {
      id: Date.now().toString(),
      school: '',
      degree: '',
      field: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      type
    };
    onChange({ ...data, education: [...data.education, newEdu] });
  };

  const removeEducation = (id: string) => {
    onChange({ ...data, education: data.education.filter(e => e.id !== id) });
  };

  const updateEducation = (id: string, field: keyof Education, value: any) => {
    const newEdu = data.education.map(e => e.id === id ? { ...e, [field]: value } : e);
    onChange({ ...data, education: newEdu });
  };

  const addSkill = () => {
    const newSkill: Skill = { id: Date.now().toString(), name: '', level: 'Intermediate' };
    onChange({ ...data, skills: [...data.skills, newSkill] });
  };

  const removeSkill = (id: string) => {
    onChange({ ...data, skills: data.skills.filter(s => s.id !== id) });
  };

  const updateSkill = (id: string, field: keyof Skill, value: any) => {
    const newSkills = data.skills.map(s => s.id === id ? { ...s, [field]: value } : s);
    onChange({ ...data, skills: newSkills });
  };

  const addLanguage = () => {
    const newLang = { id: Date.now().toString(), name: '', level: 'Native' };
    onChange({ ...data, languages: [...data.languages, newLang] });
  };

  const removeLanguage = (id: string) => {
    onChange({ ...data, languages: data.languages.filter(l => l.id !== id) });
  };

  const updateLanguage = (id: string, field: 'name' | 'level', value: string) => {
    const newLangs = data.languages.map(l => l.id === id ? { ...l, [field]: value } : l);
    onChange({ ...data, languages: newLangs });
  };

  const addProject = () => {
    const newProject: Project = { 
      id: Date.now().toString(), 
      name: '', 
      description: '', 
      link: '',
      customFields: []
    };
    onChange({ ...data, projects: [...data.projects, newProject] });
  };

  const updateProject = (id: string, field: keyof Project, value: any) => {
    const newProjects = data.projects.map(p => p.id === id ? { ...p, [field]: value } : p);
    onChange({ ...data, projects: newProjects });
  };

  const addProjectCustomField = (projectId: string) => {
    const newField = { id: Date.now().toString(), label: '', value: '' };
    const newProjects = data.projects.map(p => 
      p.id === projectId ? { ...p, customFields: [...p.customFields, newField] } : p
    );
    onChange({ ...data, projects: newProjects });
  };

  const removeProjectCustomField = (projectId: string, fieldId: string) => {
    const newProjects = data.projects.map(p => 
      p.id === projectId ? { ...p, customFields: p.customFields.filter(f => f.id !== fieldId) } : p
    );
    onChange({ ...data, projects: newProjects });
  };

  const updateProjectCustomField = (projectId: string, fieldId: string, key: 'label' | 'value', value: string) => {
    const newProjects = data.projects.map(p => 
      p.id === projectId ? { 
        ...p, 
        customFields: p.customFields.map(f => f.id === fieldId ? { ...f, [key]: value } : f) 
      } : p
    );
    onChange({ ...data, projects: newProjects });
  };

  const handleGenerateApplicationLetter = async () => {
    if (!data.jobApplication?.companyName || !data.jobApplication?.jobTitle || !data.jobApplication?.jobDescription) {
      alert("Please fill in the Company Name, Job Title, and Job Description first.");
      return;
    }

    setIsGeneratingApplicationLetter(true);
    // Simulate a small delay for "parsing" feel
    setTimeout(() => {
      const result = generateTemplateApplicationLetter(data);
      if (result) {
        onChange({ ...data, generatedApplicationLetter: result });
      }
      setIsGeneratingApplicationLetter(false);
    }, 800);
  };

  const downloadApplicationLetter = () => {
    if (!data.generatedApplicationLetter) return;
    const element = document.createElement("a");
    const file = new Blob([data.generatedApplicationLetter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Letter_${data.jobApplication?.companyName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleParseCV = async () => {
    if (!rawCVText.trim()) return;
    setIsParsingCV(true);
    try {
      const parsedData = await parseCVText(rawCVText);
      const newData = { ...data };
      
      if (parsedData.personalInfo) {
        newData.personalInfo = {
          ...newData.personalInfo,
          ...parsedData.personalInfo,
          socialLinks: newData.personalInfo.socialLinks || []
        };
      }
      
      if (parsedData.experiences?.length) {
        newData.experiences = parsedData.experiences.map((exp: any, i: number) => ({
          id: Date.now().toString() + i,
          company: exp.company || '',
          position: exp.position || '',
          location: exp.location || '',
          startDate: exp.startDate || '',
          endDate: exp.endDate || '',
          current: exp.current || false,
          description: exp.description || ''
        }));
      }

      if (parsedData.education?.length) {
        newData.education = parsedData.education.map((edu: any, i: number) => ({
          id: Date.now().toString() + i,
          school: edu.school || '',
          degree: edu.degree || '',
          field: edu.field || '',
          location: edu.location || '',
          startDate: edu.startDate || '',
          endDate: edu.endDate || '',
          current: edu.current || false,
          description: edu.description || '',
          type: ['Primary', 'Secondary', 'Higher', 'NYSC'].includes(edu.type) ? edu.type : 'Higher'
        }));
      }

      if (parsedData.skills?.length) {
        newData.skills = parsedData.skills.map((skill: any, i: number) => ({
          id: Date.now().toString() + i,
          name: skill.name || '',
          level: ['Beginner', 'Intermediate', 'Advanced', 'Expert'].includes(skill.level) ? skill.level : 'Intermediate'
        }));
      }

      if (parsedData.projects?.length) {
        newData.projects = parsedData.projects.map((proj: any, i: number) => ({
          id: Date.now().toString() + i,
          name: proj.name || '',
          description: proj.description || '',
          link: proj.link || '',
          customFields: []
        }));
      }

      if (parsedData.languages?.length) {
        newData.languages = parsedData.languages.map((lang: any, i: number) => ({
          id: Date.now().toString() + i,
          name: lang.name || '',
          level: lang.level || ''
        }));
      }

      onChange(newData);
      setRawCVText('');
      setActiveSection('personal'); // Switch to personal info after parsing
    } catch (error) {
      console.error(error);
      alert('Failed to parse CV. Please try again or check your input.');
    } finally {
      setIsParsingCV(false);
    }
  };

  const sections = [
    { id: 'autofill', label: 'Auto-Fill', icon: ClipboardPaste },
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Wrench },
    { id: 'languages', label: 'Languages', icon: Languages },
    { id: 'projects', label: 'Projects', icon: Globe },
    { id: 'application-letter', label: 'Application Letter', icon: FileText },
    { id: 'analysis', label: 'CV Score', icon: Trophy },
    { id: 'design', label: 'Design', icon: Palette },
  ];

  const colorPresets = [
    { name: 'Sky Blue', primary: '#0ea5e9', accent: '#0369a1', bg: '#ffffff' },
    { name: 'Emerald', primary: '#10b981', accent: '#047857', bg: '#ffffff' },
    { name: 'Midnight', primary: '#38bdf8', accent: '#0ea5e9', bg: '#0f172a' },
    { name: 'Obsidian', primary: '#f8fafc', accent: '#38bdf8', bg: '#020617' },
    { name: 'Nordic', primary: '#88c0d0', accent: '#5e81ac', bg: '#2e3440' },
    { name: 'Charcoal', primary: '#fbbf24', accent: '#f59e0b', bg: '#1c1917' },
    { name: 'Cream', primary: '#92400e', accent: '#78350f', bg: '#fffbeb' },
    { name: 'Forest', primary: '#166534', accent: '#4ade80', bg: '#f0fdf4' },
    { name: 'Ocean', primary: '#1e40af', accent: '#06b6d4', bg: '#f0f9ff' },
    { name: 'Sunset', primary: '#c2410c', accent: '#fb7185', bg: '#fffafb' },
    { name: 'Lavender', primary: '#6d28d9', accent: '#f472b6', bg: '#fdf4ff' },
    { name: 'Deep Sea', primary: '#06b6d4', accent: '#0891b2', bg: '#083344' },
  ];

  const AITipPopup = ({ isVisible }: { isVisible: boolean }) => (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          className="absolute -top-16 right-0 bg-primary-600 text-white p-3 rounded-xl shadow-xl z-50 w-64 pointer-events-none"
        >
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p className="text-[10px] leading-tight font-medium">
              <span className="font-bold">AI Pro Tip:</span> Use the AI Enhance button to transform your text into professional, impact-driven statements.
            </p>
          </div>
          <div className="absolute -bottom-1 right-6 w-2 h-2 bg-primary-600 rotate-45" />
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="w-full h-full flex flex-col bg-white border-r border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col">
            <h1 
              onClick={() => {
                onLogoClick?.();
                onModeChange('home');
              }}
              className="text-2xl font-display font-bold text-primary-600 flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity active:scale-95"
            >
              <ArrowLeft className="w-6 h-6" />
              CIYA
            </h1>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Create It Yourself Academy</span>
          </div>
          {cvScore || completionScore > 0 ? (
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
                <Trophy className="w-3.5 h-3.5 text-primary-600" />
                <span className="text-xs font-bold text-primary-700">{cvScore ? cvScore.score : completionScore}%</span>
              </div>
              <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-tighter mt-0.5 animate-pulse">Live Tracking</span>
            </div>
          ) : null}
        </div>
        <p className="text-sm text-slate-500 mt-1">Craft your professional story</p>
        
        {(cvScore || completionScore > 0) && (
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <span>CV Strength</span>
              <span>{cvScore ? cvScore.score : completionScore}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${cvScore ? cvScore.score : completionScore}%` }}
                className={cn(
                  "h-full transition-all duration-1000",
                  (cvScore?.score || completionScore) > 80 ? "bg-emerald-500" : (cvScore?.score || completionScore) > 50 ? "bg-primary-500" : "bg-amber-500"
                )}
              />
            </div>
          </div>
        )}
        
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Industry:</span>
            <select 
              value={industryKey}
              onChange={(e) => onIndustryChange(e.target.value as Industry)}
              className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded outline-none border-none cursor-pointer"
            >
              <option value="technology">Technology</option>
              <option value="healthcare">Healthcare</option>
              <option value="finance">Finance</option>
              <option value="education">Education</option>
              <option value="creative">Creative</option>
              <option value="engineering">Engineering</option>
              <option value="sales">Sales</option>
              <option value="hospitality">Hospitality</option>
              <option value="legal">Legal</option>
              <option value="marketing">Marketing</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="retail">Retail</option>
              <option value="transportation">Transportation</option>
              <option value="government">Government</option>
              <option value="non-profit">Non-Profit</option>
              <option value="real-estate">Real Estate</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-24 md:pb-6">
        {/* Section Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                activeSection === s.id 
                  ? "bg-primary-500 text-white shadow-md shadow-primary-200" 
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              )}
            >
              <s.icon className="w-4 h-4" />
              {s.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeSection === 'autofill' && (
            <motion.div
              key="autofill"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="p-4 bg-primary-50 border border-primary-100 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <ClipboardPaste className="w-4 h-4 text-primary-600" />
                  <h4 className="text-xs font-bold text-primary-800 uppercase tracking-wider">Paste & Auto-Fill</h4>
                </div>
                <p className="text-xs text-primary-700 leading-relaxed mb-4">
                  Already have a complete CV somewhere else? Just paste all the raw text here and our AI will automatically parse and organize it into the right sections for you.
                </p>
                <textarea
                  value={rawCVText}
                  onChange={(e) => setRawCVText(e.target.value)}
                  placeholder="Paste your entire CV text here (Experiences, Education, Skills, etc.)..."
                  className="w-full h-64 p-4 text-sm bg-white border border-primary-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none shadow-inner"
                />
                <button
                  onClick={handleParseCV}
                  disabled={!rawCVText.trim() || isParsingCV}
                  className="w-full mt-4 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isParsingCV ? (
                    <>
                      <ClipboardPaste className="w-4 h-4 animate-pulse" />
                      Parsing Data...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Auto-Fill My CV
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {activeSection === 'personal' && (
            <motion.div
              key="personal"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div className="flex flex-col items-center mb-6">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Passport Photo</label>
                <div className="relative group">
                  <div className={cn(
                    "w-32 h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all bg-slate-50",
                    data.personalInfo.photo ? "border-primary-500" : "border-slate-300 hover:border-primary-400"
                  )}>
                    {data.personalInfo.photo ? (
                      <>
                        <img src={data.personalInfo.photo} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <button 
                          onClick={() => updatePersonalInfo('photo', '')}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center gap-2 p-4 text-center">
                        <Upload className="w-6 h-6 text-slate-400" />
                        <span className="text-[10px] font-medium text-slate-500">Upload Photo</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                  <input
                    type="text"
                    value={data.personalInfo.fullName}
                    onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Job Title</label>
                  <input
                    type="text"
                    value={data.personalInfo.title}
                    onChange={(e) => updatePersonalInfo('title', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="Software Engineer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email</label>
                  <input
                    type="email"
                    value={data.personalInfo.email}
                    onChange={(e) => updatePersonalInfo('email', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Phone</label>
                  <input
                    type="text"
                    value={data.personalInfo.phone}
                    onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="+1 234 567 890"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Location</label>
                  <input
                    type="text"
                    value={data.personalInfo.location}
                    onChange={(e) => updatePersonalInfo('location', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="New York, NY"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Nationality</label>
                  <div className="relative group">
                    <select
                      value={data.personalInfo.nationality}
                      onChange={(e) => updatePersonalInfo('nationality', e.target.value)}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer font-medium"
                    >
                      <option value="">Select Country</option>
                      {countries.map((c) => (
                        <option key={c.code} value={`${c.flag} ${c.name}`}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-primary-500 transition-colors">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="col-span-2 space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Social Links</label>
                    <button 
                      onClick={addSocialLink}
                      className="text-[10px] font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add Link
                    </button>
                  </div>
                  <div className="space-y-2">
                    {data.personalInfo.socialLinks.map((link) => (
                      <div key={link.id} className="flex gap-2 items-center group">
                        <div className="flex items-center gap-2 w-1/3 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus-within:ring-2 focus-within:ring-primary-500 transition-all">
                          <span className="text-slate-400 group-hover:text-primary-500 transition-colors">
                            {getSocialIcon(link.platform)}
                          </span>
                          <input
                            type="text"
                            value={link.platform}
                            onChange={(e) => updateSocialLink(link.id, 'platform', e.target.value)}
                            className="w-full bg-transparent outline-none text-xs font-medium"
                            placeholder="Platform"
                          />
                        </div>
                        <input
                          type="text"
                          value={link.url}
                          onChange={(e) => updateSocialLink(link.id, 'url', e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-xs"
                          placeholder="URL or Username"
                        />
                        <button 
                          onClick={() => removeSocialLink(link.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-span-2 relative">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Professional Summary</label>
                    <button 
                      onClick={() => handleEnhance('summary', data.personalInfo.summary, 'summary')}
                      disabled={enhancing === 'summary' || !data.personalInfo.summary}
                      className={cn(
                        "text-xs flex items-center gap-1 font-medium transition-colors",
                        enhancing === 'summary' ? "text-slate-400" : "text-primary-600 hover:text-primary-700"
                      )}
                    >
                      <Sparkles className={cn("w-3 h-3", enhancing === 'summary' && "animate-spin")} />
                      {enhancing === 'summary' ? "Enhancing..." : "AI Enhance"}
                    </button>
                  </div>
                  <AITipPopup isVisible={focusedField === 'summary'} />
                  <textarea
                    value={data.personalInfo.summary}
                    onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                    onFocus={() => {
                      setFocusedField('summary');
                      getTailoredKeywords('summary', data.personalInfo.summary);
                    }}
                    onBlur={() => setFocusedField(null)}
                    rows={4}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Briefly describe your professional background..."
                  />
                  {((tailoredKeywords['summary'] && tailoredKeywords['summary'].length > 0) || (industryData?.keywords && industryData.keywords.length > 0)) && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Try:</span>
                      {(tailoredKeywords['summary'] || industryData?.keywords || []).slice(0, 8).map(kw => (
                        <button 
                          key={kw}
                          onClick={() => updatePersonalInfo('summary', data.personalInfo.summary + (data.personalInfo.summary ? ' ' : '') + kw)}
                          className="text-[10px] bg-primary-50 text-primary-600 px-1.5 py-0.5 rounded hover:bg-primary-100 transition-colors"
                        >
                          +{kw}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === 'experience' && (
            <motion.div
              key="experience"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {data.experiences.map((exp, index) => (
                <div key={exp.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative group">
                  <button 
                    onClick={() => removeExperience(exp.id)}
                    className="absolute -top-2 -right-2 p-1 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                          className="w-full bg-transparent border-b border-slate-300 focus:border-primary-500 outline-none py-1 font-semibold"
                          placeholder="Company Name"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                          className="w-full bg-transparent border-b border-slate-300 focus:border-primary-500 outline-none py-1"
                          placeholder="Job Title"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Workplace Location</label>
                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                          className="w-full bg-transparent border-b border-slate-300 focus:border-primary-500 outline-none py-1 text-sm"
                          placeholder="City, Country or Remote"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">Start Date</label>
                        <input
                          type="month"
                          value={exp.startDate}
                          onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                          className="w-full bg-transparent border-b border-slate-300 focus:border-primary-500 outline-none py-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">End Date</label>
                        <input
                          type="month"
                          value={exp.endDate}
                          disabled={exp.current}
                          onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                          className="w-full bg-transparent border-b border-slate-300 focus:border-primary-500 outline-none py-1 text-sm disabled:opacity-50"
                        />
                      </div>
                      <div className="col-span-2 flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`current-${exp.id}`}
                          checked={exp.current}
                          onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                          className="rounded text-primary-500 focus:ring-primary-500"
                        />
                        <label htmlFor={`current-${exp.id}`} className="text-xs text-slate-600">I currently work here</label>
                      </div>
                      <div className="col-span-2 relative">
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase">Description</label>
                          <button 
                            onClick={() => handleEnhance(`exp-${exp.id}`, exp.description, 'experience')}
                            disabled={enhancing === `exp-${exp.id}` || !exp.description}
                            className={cn(
                              "text-[10px] flex items-center gap-1 font-bold transition-colors",
                              enhancing === `exp-${exp.id}` ? "text-slate-400" : "text-primary-600 hover:text-primary-700"
                            )}
                          >
                            <Sparkles className={cn("w-2.5 h-2.5", enhancing === `exp-${exp.id}` && "animate-spin")} />
                            {enhancing === `exp-${exp.id}` ? "Enhancing..." : "AI Enhance"}
                          </button>
                        </div>
                        <AITipPopup isVisible={focusedField === `exp-${exp.id}`} />
                        <textarea
                          value={exp.description}
                          onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                          onFocus={() => {
                            setFocusedField(`exp-${exp.id}`);
                            getTailoredKeywords(`exp-${exp.id}`, exp.description);
                          }}
                          onBlur={() => setFocusedField(null)}
                          rows={3}
                          className="w-full bg-transparent border border-slate-300 rounded p-2 text-sm focus:border-primary-500 outline-none resize-none"
                          placeholder="Describe your responsibilities and achievements..."
                        />
                        {((tailoredKeywords[`exp-${exp.id}`] && tailoredKeywords[`exp-${exp.id}`].length > 0) || (industryData?.keywords && industryData.keywords.length > 0)) && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Try:</span>
                            {(tailoredKeywords[`exp-${exp.id}`] || industryData?.keywords || []).slice(0, 8).map(kw => (
                              <button 
                                key={kw}
                                onClick={() => updateExperience(exp.id, 'description', exp.description + (exp.description ? ' ' : '') + kw)}
                                className="text-[10px] bg-primary-50 text-primary-600 px-1.5 py-0.5 rounded hover:bg-primary-100 transition-colors"
                              >
                                +{kw}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <button 
                onClick={addExperience}
                className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:text-primary-600 hover:border-primary-300 hover:bg-primary-50 transition-all flex items-center justify-center gap-2 font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Experience
              </button>
            </motion.div>
          )}

          {activeSection === 'education' && (
            <motion.div
              key="education"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              {(['Primary', 'Secondary', 'Higher', 'NYSC'] as const).map((eduType) => (
                <div key={eduType} className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{eduType} Education</h3>
                    <button 
                      onClick={() => addEducation(eduType)}
                      className="text-[10px] font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {data.education.filter(e => e.type === eduType).map((edu) => (
                      <div key={edu.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative group">
                        <button 
                          onClick={() => removeEducation(edu.id)}
                          className="absolute -top-2 -right-2 p-1 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={edu.school}
                            onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                            className="w-full bg-transparent border-b border-slate-300 focus:border-primary-500 outline-none py-1 font-semibold"
                            placeholder={eduType === 'NYSC' ? "Place of Primary Assignment (PPA)" : "University / School"}
                          />
                          {eduType !== 'Primary' && (
                            <>
                              <input
                                type="text"
                                value={edu.degree}
                                onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                                className="w-full bg-transparent border-b border-slate-300 focus:border-primary-500 outline-none py-1"
                                placeholder={eduType === 'NYSC' ? "Service Year / Batch" : "Degree (e.g. Bachelor of Science)"}
                              />
                              <input
                                type="text"
                                value={edu.field}
                                onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                                className="w-full bg-transparent border-b border-slate-300 focus:border-primary-500 outline-none py-1"
                                placeholder="Field of Study"
                              />
                            </>
                          )}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase">Start Date</label>
                              <input
                                type="month"
                                value={edu.startDate}
                                onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                                className="w-full bg-transparent border-b border-slate-300 focus:border-primary-500 outline-none py-1 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase">End Date</label>
                              <input
                                type="month"
                                value={edu.endDate}
                                onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                                className="w-full bg-transparent border-b border-slate-300 focus:border-primary-500 outline-none py-1 text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {data.education.filter(e => e.type === eduType).length === 0 && (
                      <p className="text-[10px] text-slate-400 italic text-center py-2">No {eduType.toLowerCase()} education added yet.</p>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeSection === 'skills' && (
            <motion.div
              key="skills"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {industryData?.skills && (
                <div className="p-4 bg-primary-50 rounded-xl border border-primary-100">
                  <h3 className="text-xs font-bold text-primary-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Sparkles className="w-3 h-3" />
                    Suggested for {industry}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {industryData.skills.map(skill => (
                      <button
                        key={skill}
                        onClick={() => {
                          if (!data.skills.find(s => s.name.toLowerCase() === skill.toLowerCase())) {
                            onChange({ ...data, skills: [...data.skills, { id: Date.now().toString(), name: skill, level: 'Intermediate' }] });
                          }
                        }}
                        className="text-[10px] bg-white text-primary-600 px-2 py-1 rounded-full border border-primary-200 hover:bg-primary-100 transition-all font-bold"
                      >
                        + {skill}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-2">
                {data.skills.map((skill) => (
                  <div key={skill.id} className="flex items-center gap-2 group">
                    <input
                      type="text"
                      value={skill.name}
                      onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                      placeholder="Skill name"
                    />
                    <select
                      value={skill.level}
                      onChange={(e) => updateSkill(skill.id, 'level', e.target.value)}
                      className="px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-xs font-medium"
                    >
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                      <option>Expert</option>
                    </select>
                    <button 
                      onClick={() => removeSkill(skill.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button 
                onClick={addSkill}
                className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:text-primary-600 hover:border-primary-300 hover:bg-primary-50 transition-all flex items-center justify-center gap-2 font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Skill
              </button>
            </motion.div>
          )}

          {activeSection === 'languages' && (
            <motion.div
              key="languages"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 gap-4">
                {data.languages.map((lang) => (
                  <div key={lang.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative group">
                    <button 
                      onClick={() => removeLanguage(lang.id)}
                      className="absolute -top-2 -right-2 p-1 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Language Name</label>
                      <div className="space-y-2">
                        <select
                          value={POPULAR_LANGUAGES.includes(lang.name) ? lang.name : (lang.name ? "Other" : "")}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "Other") {
                              updateLanguage(lang.id, 'name', '');
                            } else {
                              updateLanguage(lang.id, 'name', val);
                            }
                          }}
                          className="w-full bg-transparent border-b border-slate-300 focus:border-primary-500 outline-none py-1.5 text-sm font-semibold text-slate-700"
                        >
                          <option value="">Select language...</option>
                          {POPULAR_LANGUAGES.map((l) => (
                            <option key={l} value={l}>{l}</option>
                          ))}
                          <option value="Other">Other / Custom...</option>
                        </select>
                        {(lang.name === "" || !POPULAR_LANGUAGES.includes(lang.name)) && (
                          <input
                            type="text"
                            value={lang.name}
                            onChange={(e) => updateLanguage(lang.id, 'name', e.target.value)}
                            className="w-full bg-transparent border-b border-slate-300 focus:border-primary-500 outline-none py-1 text-sm font-semibold mt-1"
                            placeholder="Type custom language name..."
                          />
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">Proficiency Level</label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const levels = ['Basic', 'Intermediate', 'Professional', 'Fluent', 'Native'];
                          const currentLevelIndex = levels.indexOf(lang.level);
                          const starLevelIndex = star - 1;
                          
                          return (
                            <button
                              key={star}
                              onClick={() => updateLanguage(lang.id, 'level', levels[starLevelIndex])}
                              className="focus:outline-none transition-transform hover:scale-110"
                            >
                              <Star 
                                className={cn(
                                  "w-6 h-6 transition-colors",
                                  starLevelIndex <= currentLevelIndex 
                                    ? "fill-amber-400 text-amber-400" 
                                    : "text-slate-300 hover:text-amber-200"
                                )}
                              />
                            </button>
                          );
                        })}
                        <span className="ml-2 text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded">
                          {lang.level}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={addLanguage}
                className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:text-primary-600 hover:border-primary-300 hover:bg-primary-50 transition-all flex items-center justify-center gap-2 font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Language
              </button>
            </motion.div>
          )}

          {activeSection === 'projects' && (
            <motion.div
              key="projects"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {data.projects.map((project) => (
                <div key={project.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative group">
                  <button 
                    onClick={() => {
                      const newProjects = data.projects.filter(p => p.id !== project.id);
                      onChange({ ...data, projects: newProjects });
                    }}
                    className="absolute -top-2 -right-2 p-1 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={project.name}
                      onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                      className="w-full bg-transparent border-b border-slate-300 focus:border-primary-500 outline-none py-1 font-semibold"
                      placeholder="Project Name"
                    />
                    <input
                      type="text"
                      value={project.link}
                      onChange={(e) => updateProject(project.id, 'link', e.target.value)}
                      className="w-full bg-transparent border-b border-slate-300 focus:border-primary-500 outline-none py-1 text-sm"
                      placeholder="Project Link (e.g. github.com/...)"
                    />
                    <textarea
                      value={project.description}
                      onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                      rows={2}
                      className="w-full bg-transparent border border-slate-300 rounded p-2 text-sm focus:border-primary-500 outline-none resize-none"
                      placeholder="Brief project description..."
                    />

                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Custom Fields</label>
                        <button 
                          onClick={() => addProjectCustomField(project.id)}
                          className="text-[10px] font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                        >
                          <PlusCircle className="w-3 h-3" />
                          Add Field
                        </button>
                      </div>
                      <div className="space-y-2">
                        {project.customFields.map((field) => (
                          <div key={field.id} className="flex gap-2 items-center">
                            <input
                              type="text"
                              value={field.label}
                              onChange={(e) => updateProjectCustomField(project.id, field.id, 'label', e.target.value)}
                              className="w-1/3 px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold outline-none focus:ring-1 focus:ring-primary-500"
                              placeholder="Label (e.g. Role)"
                            />
                            <input
                              type="text"
                              value={field.value}
                              onChange={(e) => updateProjectCustomField(project.id, field.id, 'value', e.target.value)}
                              className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded text-[10px] outline-none focus:ring-1 focus:ring-primary-500"
                              placeholder="Value"
                            />
                            <button 
                              onClick={() => removeProjectCustomField(project.id, field.id)}
                              className="text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <MinusCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <button 
                onClick={addProject}
                className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:text-primary-600 hover:border-primary-300 hover:bg-primary-50 transition-all flex items-center justify-center gap-2 font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Project
              </button>
            </motion.div>
          )}

          {activeSection === 'application-letter' && (
            <motion.div
              key="application-letter"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="p-4 bg-primary-50 border border-primary-100 rounded-xl mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-primary-600" />
                  <h4 className="text-xs font-bold text-primary-800 uppercase tracking-wider">Application Letter</h4>
                </div>
                <p className="text-xs text-primary-700 leading-relaxed">
                  A well-crafted letter is <span className="font-bold">essential</span> for your success. It highlights your employability and helps you stand out for placements by connecting your skills directly to the role. 
                </p>
                <p className="text-[10px] text-primary-600 mt-2 italic">
                  * Note: While highly recommended, a letter is optional.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Target Company</label>
                  <input
                    type="text"
                    value={data.jobApplication?.companyName || ''}
                    onChange={(e) => onChange({ ...data, jobApplication: { ...data.jobApplication!, companyName: e.target.value } })}
                    placeholder="e.g. Google, Tesla..."
                    className="w-full text-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Job Title</label>
                  <input
                    type="text"
                    value={data.jobApplication?.jobTitle || ''}
                    onChange={(e) => onChange({ ...data, jobApplication: { ...data.jobApplication!, jobTitle: e.target.value } })}
                    placeholder="e.g. Senior Product Designer"
                    className="w-full text-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Hiring Manager (Optional)</label>
                  <input
                    type="text"
                    value={data.jobApplication?.hiringManager || ''}
                    onChange={(e) => onChange({ ...data, jobApplication: { ...data.jobApplication!, hiringManager: e.target.value } })}
                    placeholder="e.g. Jane Doe"
                    className="w-full text-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Job Description / Requirements</label>
                  <textarea
                    rows={6}
                    value={data.jobApplication?.jobDescription || ''}
                    onChange={(e) => onChange({ ...data, jobApplication: { ...data.jobApplication!, jobDescription: e.target.value } })}
                    placeholder="Paste the job requirements or description here..."
                    className="w-full text-sm px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all font-medium resize-none"
                  />
                </div>

                <button
                  onClick={handleGenerateApplicationLetter}
                  disabled={isGeneratingApplicationLetter}
                  className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-100 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGeneratingApplicationLetter ? (
                    <>
                      <FileText className="w-4 h-4 animate-pulse" />
                      Parsing Data...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      Generate Application Letter
                    </>
                  )}
                </button>
              </div>

              {data.generatedApplicationLetter && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 pt-6 border-t border-slate-100"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Generated Letter</h3>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={downloadApplicationLetter}
                        className="text-[10px] font-bold text-slate-500 flex items-center gap-1 hover:text-slate-700"
                      >
                        <Download className="w-3 h-3" />
                        .txt
                      </button>
                    </div>
                  </div>
                  <textarea 
                    value={data.generatedApplicationLetter}
                    onChange={(e) => onChange({ ...data, generatedApplicationLetter: e.target.value })}
                    className="w-full p-5 bg-slate-900 text-slate-300 rounded-2xl text-[10px] leading-relaxed font-mono whitespace-pre-wrap min-h-[300px] max-h-[500px] overflow-y-auto custom-scrollbar border border-slate-800 shadow-inner outline-none focus:ring-1 focus:ring-primary-500/50 transition-all resize-none"
                    placeholder="Your letter will appear here..."
                  />
                  <p className="text-[10px] text-slate-400 text-center italic">
                    Preview the full letter in the main preview section.
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {activeSection === 'analysis' && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="p-6 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl text-white shadow-xl shadow-primary-100 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Industry Match</h3>
                      <p className="text-primary-100 text-xs">Based on {industry} standards</p>
                    </div>
                  </div>
                  
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-5xl font-bold">{cvScore?.score || completionScore}</span>
                    <span className="text-xl font-medium text-primary-200 mb-1.5">%</span>
                  </div>
                  
                  <p className="text-sm text-primary-50 text-balance leading-relaxed">
                    {cvScore?.analysis || "Analyzing your CV content to provide industry-specific feedback..."}
                  </p>
                </div>
                
                {/* Decorative circles */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary-400/20 rounded-full blur-3xl" />
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Improvement Tips
                </h3>
                
                <div className="space-y-3">
                  {isCalculatingScore ? (
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
                    ))
                  ) : cvScore?.tips.map((tip, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-4 bg-white border border-slate-200 rounded-xl flex gap-3 group hover:border-primary-300 hover:shadow-md transition-all"
                    >
                      <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 transition-colors">
                        <CheckCircle2 className="w-4 h-4 text-primary-600" />
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">{tip}</p>
                    </motion.div>
                  )) || (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex gap-3">
                      <AlertCircle className="w-4 h-4 text-slate-400 mt-0.5" />
                      <p className="text-xs text-slate-500">Add more content to your CV to get personalized improvement tips.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">Pro Tip</h4>
                </div>
                <p className="text-xs text-amber-700 leading-relaxed">
                  CVs with a score above 85% are 3x more likely to get an interview in the {industry} industry. Use AI Enhance on your experience descriptions to boost your score!
                </p>
              </div>
            </motion.div>
          )}

          {activeSection === 'design' && (
            <motion.div
              key="design"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Color Combinations</label>
                <div className="grid grid-cols-2 gap-3">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => onChange({
                        ...data,
                        theme: {
                          primaryColor: preset.primary,
                          accentColor: preset.accent,
                          backgroundColor: preset.bg
                        }
                      })}
                      className={cn(
                        "flex flex-col p-2 rounded-xl border transition-all hover:shadow-md group",
                        data.theme.primaryColor === preset.primary && data.theme.backgroundColor === preset.bg
                          ? "border-primary-500 bg-primary-50 ring-1 ring-primary-500"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      )}
                    >
                      {/* Miniature CV Preview */}
                      <div 
                        className="w-full h-24 rounded-lg mb-3 overflow-hidden border border-slate-100 flex flex-col shadow-inner"
                        style={{ backgroundColor: preset.bg }}
                      >
                        <div className="h-6 w-full border-b flex items-center px-2 gap-1" style={{ borderColor: preset.accent }}>
                          <div className="h-2 w-1/2 rounded-full" style={{ backgroundColor: preset.primary }} />
                          <div className="h-2 w-2 rounded-full ml-auto" style={{ backgroundColor: preset.accent }} />
                        </div>
                        <div className="flex-1 p-2 flex gap-2">
                          <div className="flex-1 space-y-1.5">
                            <div className="h-1 w-full rounded-full bg-slate-200" />
                            <div className="h-1 w-5/6 rounded-full bg-slate-200" />
                            <div className="h-1 w-4/6 rounded-full bg-slate-200" />
                            <div className="pt-1 space-y-1">
                              <div className="h-1.5 w-1/3 rounded-full" style={{ backgroundColor: preset.primary }} />
                              <div className="h-1 w-full rounded-full bg-slate-100" />
                            </div>
                          </div>
                          <div className="w-1/3 space-y-1.5">
                            <div className="h-1 w-full rounded-full bg-slate-200" />
                            <div className="h-1 w-full rounded-full bg-slate-200" />
                            <div className="h-1 w-full rounded-full bg-slate-200" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full px-1">
                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tight">{preset.name}</span>
                        <div className="flex -space-x-1">
                          <div className="w-3 h-3 rounded-full border border-white z-20" style={{ backgroundColor: preset.primary }} />
                          <div className="w-3 h-3 rounded-full border border-white z-10" style={{ backgroundColor: preset.accent }} />
                          <div className="w-3 h-3 rounded-full border border-slate-200 z-0" style={{ backgroundColor: preset.bg }} />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Custom Colors</label>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Primary Color</span>
                    <input 
                      type="color" 
                      value={data.theme.primaryColor}
                      onChange={(e) => onChange({ ...data, theme: { ...data.theme, primaryColor: e.target.value } })}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Accent Color</span>
                    <input 
                      type="color" 
                      value={data.theme.accentColor}
                      onChange={(e) => onChange({ ...data, theme: { ...data.theme, accentColor: e.target.value } })}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Background Color</span>
                    <input 
                      type="color" 
                      value={data.theme.backgroundColor}
                      onChange={(e) => onChange({ ...data, theme: { ...data.theme, backgroundColor: e.target.value } })}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-6 border-t border-slate-100 bg-slate-50 space-y-4">
        <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-bold">
          Powered by Gemini AI
        </p>
      </div>
    </div>
  );
}
