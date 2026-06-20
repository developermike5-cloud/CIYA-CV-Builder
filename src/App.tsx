import React, { useState, useRef } from 'react';
import { Download, Layout, Eye, Settings, Sparkles, Github, Share2, Briefcase, Code, HeartPulse, Landmark, GraduationCap, Palette, Settings2, ShoppingCart, Coffee, FileText, User, Scale, Megaphone, Factory, ShoppingBag, Truck, Building2, Heart, Home, Info, HelpCircle, X as CloseIcon, ZoomIn, ZoomOut, MessageCircle, RefreshCw, ArrowLeft, ClipboardPaste } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Preview from './components/Preview';
import LetterBuilder from './components/LetterBuilder';
import { CVData, TemplateId, Industry } from './types';
import { initialCVData } from './constants';
import { enhancementTemplates } from './constants/enhancementTemplates';
import { industrySkills, industryCompanies, industryProjects, nigerianNames, nigerianUniversities } from './constants/industryData';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { db, auth } from './firebase';
import { doc, updateDoc, setDoc, getDoc, increment, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const industries: { id: Industry; label: string; icon: any; description: string; defaultTemplate: TemplateId }[] = [
  { id: 'technology', label: 'Technology', icon: Code, description: 'Software, Data, IT', defaultTemplate: 'modern' },
  { id: 'healthcare', label: 'Healthcare', icon: HeartPulse, description: 'Medical, Nursing', defaultTemplate: 'classic' },
  { id: 'finance', label: 'Finance', icon: Landmark, description: 'Banking, Accounting', defaultTemplate: 'classic' },
  { id: 'education', label: 'Education', icon: GraduationCap, description: 'Teaching, Research', defaultTemplate: 'minimal' },
  { id: 'creative', label: 'Creative', icon: Palette, description: 'Design, Arts, Media', defaultTemplate: 'creative' },
  { id: 'engineering', label: 'Engineering', icon: Settings2, description: 'Civil, Mech, Electrical', defaultTemplate: 'modern' },
  { id: 'sales', label: 'Sales', icon: ShoppingCart, description: 'Marketing, Business', defaultTemplate: 'modern' },
  { id: 'hospitality', label: 'Hospitality', icon: Coffee, description: 'Tourism, Service', defaultTemplate: 'minimal' },
  { id: 'legal', label: 'Legal', icon: Scale, description: 'Law, Compliance', defaultTemplate: 'classic' },
  { id: 'marketing', label: 'Marketing', icon: Megaphone, description: 'SEO, Content, Ads', defaultTemplate: 'creative' },
  { id: 'manufacturing', label: 'Manufacturing', icon: Factory, description: 'Production, Safety', defaultTemplate: 'modern' },
  { id: 'retail', label: 'Retail', icon: ShoppingBag, description: 'Merchandising, POS', defaultTemplate: 'minimal' },
  { id: 'transportation', label: 'Transportation', icon: Truck, description: 'Logistics, Fleet', defaultTemplate: 'modern' },
  { id: 'government', label: 'Government', icon: Building2, description: 'Policy, Admin', defaultTemplate: 'classic' },
  { id: 'non-profit', label: 'Non-Profit', icon: Heart, description: 'Fundraising, Impact', defaultTemplate: 'minimal' },
  { id: 'real-estate', label: 'Real Estate', icon: Home, description: 'Property, Leasing', defaultTemplate: 'modern' },
];

export default function App() {
  const STORAGE_KEY_CV = 'ciya-cv-data';
  const STORAGE_KEY_CONFIG = 'ciya-cv-config';

  const [cvData, setCvData] = useState<CVData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CV);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved CV data", e);
      }
    }
    return initialCVData;
  });

  const [template, setTemplate] = useState<TemplateId>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_CONFIG}-template`);
    return (saved as TemplateId) || 'modern';
  });

  const [industry, setIndustry] = useState<Industry | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_CONFIG}-industry`);
    return (saved as Industry) || null;
  });

  const [isExporting, setIsExporting] = useState(false);
  
  const [viewMode, setViewMode] = useState<'split' | 'preview'>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_CONFIG}-viewMode`);
    return (saved as any) || 'split';
  });

  const [appMode, setAppMode] = useState<'home' | 'cv' | 'letter'>('home');

  const [previewType, setPreviewType] = useState<'cv' | 'letter'>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_CONFIG}-previewType`);
    return (saved as any) || 'cv';
  });

  const [showHowToUse, setShowHowToUse] = useState(false);
  const [showAboutUs, setShowAboutUs] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [downloadStats, setDownloadStats] = useState<any | null>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [secretClicks, setSecretClicks] = useState(0);
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Persistence Effects
  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CV, JSON.stringify(cvData));
  }, [cvData]);

  React.useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_CONFIG}-template`, template);
  }, [template]);

  React.useEffect(() => {
    if (industry) {
      localStorage.setItem(`${STORAGE_KEY_CONFIG}-industry`, industry);
    }
  }, [industry]);

  React.useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_CONFIG}-viewMode`, viewMode);
  }, [viewMode]);

  React.useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_CONFIG}-appMode`, appMode);
  }, [appMode]);

  React.useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_CONFIG}-previewType`, previewType);
  }, [previewType]);

  // Monitor Auth State
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Monitor Download Stats (Real-time)
  React.useEffect(() => {
    const path = 'stats/downloads';
    const unsubscribe = onSnapshot(doc(db, path), (snapshot) => {
      if (snapshot.exists()) {
        setDownloadStats(snapshot.data());
      }
    }, (error) => {
      // Just log for admin
      if (user?.email === 'ogunnaikemichael2017@gmail.com') {
        console.error('Stats monitor error:', error);
      }
    });
    return () => unsubscribe();
  }, [user]);

  const trackDownload = async (type: 'cv' | 'letter', category: string) => {
    const path = 'stats/downloads';
    try {
      const docRef = doc(db, path);
      const updateData: any = {
        updatedAt: serverTimestamp(),
      };

      if (type === 'cv') {
        updateData.total_cv = increment(1);
        updateData[`industries.${category.replace(/\s+/g, '_').toLowerCase()}`] = increment(1);
      } else {
        updateData.total_letter = increment(1);
        updateData[`letterCategories.${category.replace(/\s+/g, '_').toLowerCase()}`] = increment(1);
      }

      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        const initialData = {
          total_cv: type === 'cv' ? 1 : 0,
          total_letter: type === 'letter' ? 1 : 0,
          industries: type === 'cv' ? { [category.replace(/\s+/g, '_').toLowerCase()]: 1 } : {},
          letterCategories: type === 'letter' ? { [category.replace(/\s+/g, '_').toLowerCase()]: 1 } : {},
          updatedAt: serverTimestamp()
        };
        await setDoc(docRef, initialData);
      } else {
        await updateDoc(docRef, updateData);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const login = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setIsAdminMode(false);
      setSecretClicks(0);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSecretClick = () => {
    setSecretClicks(prev => {
      const newCount = prev + 1;
      if (newCount >= 5) {
        setIsAdminMode(true);
        return 0;
      }
      return newCount;
    });
    
    // Auto-reset after 2 seconds of inactivity
    const timeoutId = (window as any)._secretTimeout;
    if (timeoutId) clearTimeout(timeoutId);
    (window as any)._secretTimeout = setTimeout(() => {
      setSecretClicks(0);
    }, 2000);
  };

  // Set initial zoom based on screen width
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setZoom(0.45);
      else if (window.innerWidth < 768) setZoom(0.6);
      else if (window.innerWidth < 1024) setZoom(0.8);
      else setZoom(1);
    };
    handleResize();
    // We don't necessarily want to force zoom on every resize if user has manually adjusted,
    // but for the initial load it's good.
  }, []);

  const exportPDF = async () => {
    const element = document.getElementById('cv-preview');
    if (!element) return;

    setIsExporting(true);
    try {
      const { default: html2pdf } = await import('html2pdf.js');
      
      const filename = previewType === 'cv' 
        ? `${cvData.personalInfo.fullName.replace(/\s+/g, '_')}_CV.pdf`
        : `${cvData.personalInfo.fullName.replace(/\s+/g, '_')}_Application_Letter.pdf`;

      const opt = {
        margin:       0,
        filename:     filename,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { 
          scale: 2, 
          useCORS: true, 
          letterRendering: true, 
          backgroundColor: '#ffffff',
          scrollY: 0,
          scrollX: 0,
          onclone: (clonedDoc: Document) => {
            // Fix for html2canvas oklab/oklch parser errors
            const styles = clonedDoc.getElementsByTagName('style');
            for (let i = 0; i < styles.length; i++) {
              if (styles[i].innerHTML.includes('oklab') || styles[i].innerHTML.includes('oklch')) {
                styles[i].innerHTML = styles[i].innerHTML.replace(/oklch\([^)]+\)/g, '#000000');
                styles[i].innerHTML = styles[i].innerHTML.replace(/oklab\([^)]+\)/g, '#000000');
              }
            }

            const overrideStyle = clonedDoc.createElement('style');
            overrideStyle.innerHTML = `
              * {
                font-variant-ligatures: none !important;
                text-rendering: optimizeLegibility !important;
              }
            `;
            clonedDoc.head.appendChild(overrideStyle);

            const el = clonedDoc.getElementById('cv-preview');
            if (el) {
              el.style.transform = 'none';
              el.style.width = '850px';
              el.style.position = 'relative';
              el.style.left = '0';
              el.style.top = '0';
              el.style.boxShadow = 'none';
              el.style.margin = '0';
              el.style.minHeight = '1120px';
            }
          }
        },
        jsPDF:        { unit: 'px', format: [850, 1120] as [number, number], orientation: 'portrait' as const }
      };

      const originalTransform = element.style.transform;
      element.style.transform = 'none';

      await html2pdf().set(opt).from(element).save();

      element.style.transform = originalTransform;

      // Track the download in Firebase
      if (previewType === 'cv') {
        await trackDownload('cv', industry || 'General');
      } else {
        await trackDownload('letter', 'CV_Integration');
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert("Error generating PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const resetData = () => {
    if (confirm("Are you sure you want to clear all and start a fresh CV?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const selectIndustry = (ind: Industry | null) => {
    if (!ind) {
      setIndustry(null);
      return;
    }
    setIndustry(ind);
    const industryConfig = industries.find(i => i.id === ind);
    if (industryConfig) {
      setTemplate(industryConfig.defaultTemplate);
      
      const defaultTitles: Record<string, string> = {
        technology: 'Software Engineer',
        healthcare: 'Medical Professional',
        finance: 'Financial Analyst',
        education: 'Educator',
        creative: 'Creative Designer',
        engineering: 'Professional Engineer',
        sales: 'Sales Representative',
        hospitality: 'Hospitality Manager',
        legal: 'Legal Counsel',
        marketing: 'Marketing Specialist',
        manufacturing: 'Operations Manager',
        retail: 'Retail Manager',
        transportation: 'Logistics Coordinator',
        government: 'Public Administrator',
        'non-profit': 'Program Coordinator',
        'real-estate': 'Real Estate Agent'
      };

      const title = defaultTitles[ind];
      const templates = enhancementTemplates[ind];
      const skills = industrySkills[ind] || [];
      const companies = industryCompanies[ind] || [];
      const projects = industryProjects[ind] || [];
      const randomName = nigerianNames[Math.floor(Math.random() * nigerianNames.length)];
      const nameParts = randomName.toLowerCase().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts[1];
      const handle = `${firstName}.${lastName}`;
      
      const industryLocations: Record<Industry, string> = {
        technology: 'Lagos, Nigeria',
        healthcare: 'Ibadan, Nigeria',
        finance: 'Victoria Island, Lagos',
        education: 'Nsukka, Nigeria',
        creative: 'Lekki, Lagos',
        engineering: 'Port Harcourt, Nigeria',
        sales: 'Abuja, Nigeria',
        hospitality: 'Enugu, Nigeria',
        legal: 'Abuja, Nigeria',
        marketing: 'Ikeja, Lagos',
        manufacturing: 'Kano, Nigeria',
        retail: 'Surulere, Lagos',
        transportation: 'Apapa, Lagos',
        government: 'Abuja, FCT',
        'non-profit': 'Jos, Nigeria',
        'real-estate': 'Epe, Lagos'
      };

      // Get the first template and replace placeholders
      const defaultSummary = templates.summaries[0]
        .replace(/\[TITLE\]/g, title)
        .replace(/\[INDUSTRY\]/g, industryConfig.label);

      setCvData(prev => ({
        ...prev,
        personalInfo: { 
          ...prev.personalInfo, 
          fullName: randomName,
          email: `${handle}@email.com`,
          location: industryLocations[ind] || 'Lagos, Nigeria',
          socialLinks: prev.personalInfo.socialLinks.map(link => ({
            ...link,
            url: link.platform.toLowerCase().includes('linkedin') 
              ? `linkedin.com/in/${handle}` 
              : `${link.platform.toLowerCase()}.com/${handle}`
          })),
          title: title,
          summary: defaultSummary
        },
        experiences: prev.experiences.map((exp, idx) => {
          const hubs = ['Lagos, Nigeria', 'Abuja, Nigeria', 'Port Harcourt, Nigeria', 'Ibadan, Nigeria', 'Kano, Nigeria', 'Enugu, Nigeria', 'Benin City, Nigeria'];
          const randomHub = hubs[Math.floor(Math.random() * hubs.length)];
          
          return {
            ...exp,
            company: companies[idx] || companies[0] || exp.company,
            position: title,
            // Current position (idx 0) gets industry location, others get random hubs
            location: idx === 0 ? (industryLocations[ind] || 'Lagos, Nigeria') : randomHub,
            // Use different templates for different experience slots if available
            description: (templates.experiences[idx] || templates.experiences[0])
              .replace(/\[TITLE\]/g, title)
              .replace(/\[INDUSTRY\]/g, industryConfig.label)
          };
        }),
        education: prev.education.map((edu) => {
          if (edu.type === 'Higher') {
            const uniIndex = Math.floor(Math.random() * nigerianUniversities.length);
            const uni = nigerianUniversities[uniIndex];
            // Extract city from university name if possible, otherwise default
            let city = 'Nigeria';
            if (uni.includes('Lagos')) city = 'Lagos, Nigeria';
            else if (uni.includes('Ibadan')) city = 'Ibadan, Nigeria';
            else if (uni.includes('Nsukka')) city = 'Enugu State, Nigeria';
            else if (uni.includes('Kano')) city = 'Kano, Nigeria';
            else if (uni.includes('Ife')) city = 'Osun State, Nigeria';
            else if (uni.includes('Zaria')) city = 'Kaduna State, Nigeria';
            else if (uni.includes('Akure')) city = 'Ondo State, Nigeria';
            else if (uni.includes('Benin')) city = 'Edo State, Nigeria';
            else if (uni.includes('Ilorin')) city = 'Kwara State, Nigeria';
            
            return {
              ...edu,
              school: uni,
              location: city
            };
          }
          if (edu.type === 'Secondary') {
            const secondarySchools = [
              { name: 'King\'s College Lagos', loc: 'Lagos, Nigeria' },
              { name: 'Queen\'s College Lagos', loc: 'Lagos, Nigeria' },
              { name: 'Loyola Jesuit College', loc: 'Abuja, Nigeria' },
              { name: 'British International School Lagos', loc: 'Lagos, Nigeria' },
              { name: 'Federal Government College', loc: 'Enugu, Nigeria' }
            ];
            const school = secondarySchools[Math.floor(Math.random() * secondarySchools.length)];
            return {
              ...edu,
              school: school.name,
              location: school.loc
            };
          }
          if (edu.type === 'NYSC') {
            const states = ['Lagos', 'Abuja', 'Oyo', 'Enugu', 'Rivers', 'Kano', 'Kaduna', 'Ogun'];
            const randomState = states[Math.floor(Math.random() * states.length)];
            return {
              ...edu,
              school: 'National Youth Service Corps (NYSC)',
              degree: 'Certificate of National Service',
              location: `${randomState}, Nigeria`
            };
          }
          return edu;
        }),
        skills: skills.slice(0, 6).map((skill, idx) => ({
          id: String(idx + 1),
          name: skill,
          level: idx < 2 ? 'Expert' : idx < 4 ? 'Advanced' : 'Intermediate'
        })),
        projects: projects.map((proj, idx) => ({
          id: String(idx + 1),
          name: proj.name,
          description: proj.description,
          link: ind === 'technology' ? (prev.projects[0]?.link || 'github.com/username/project') : '',
          customFields: ind === 'technology' 
            ? (prev.projects[0]?.customFields || [])
            : [
                { id: '1', label: 'Key Outcome', value: 'Successfully delivered project goals' },
                { id: '2', label: 'Role', value: title }
              ]
        }))
      }));
    }
  };

    if (appMode === 'letter') {
      return (
        <div className="h-screen flex flex-col bg-slate-50 relative">
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-20">
            <div className="flex items-center gap-4">
               <button 
                  onClick={() => setAppMode('home')}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-primary-600"
                  title="Back to Home"
               >
                  <ArrowLeft className="w-5 h-5" />
               </button>
               <h1 
                  onClick={handleSecretClick}
                  className="text-xl font-display font-bold text-primary-600 cursor-pointer select-none active:scale-95 transition-opacity hover:opacity-80"
               >
                  CIYA <span className="text-slate-900">Application Letter Builder</span>
               </h1>
            </div>
          </header>
          <div className="flex-1 overflow-hidden">
            <LetterBuilder 
              onBack={() => setAppMode('home')} 
              onDownload={(category) => trackDownload('letter', category)}
            />
          </div>
        </div>
      );
    }

    if (appMode === 'home' || (appMode === 'cv' && !industry)) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center relative overflow-y-auto">
        <div className="flex-1 w-full flex flex-col items-center justify-start pt-12 pb-24 px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl w-full text-center space-y-10"
          >
            <div className="space-y-6">
              <div className="flex justify-center mb-8">
                {appMode !== 'home' && (
                  <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex gap-1">
                    {[
                      { id: 'cv', label: 'CV Builder', icon: Briefcase },
                      { id: 'letter', label: 'Application Letter Builder', icon: FileText }
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => {
                          setAppMode(mode.id as any);
                          if (mode.id === 'cv') setIndustry(null);
                        }}
                        className={cn(
                          "px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all",
                          appMode === mode.id 
                            ? "bg-primary-600 text-white shadow-lg shadow-primary-200" 
                            : "text-slate-500 hover:bg-slate-50"
                        )}
                      >
                        <mode.icon className="w-4 h-4" />
                        {mode.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <h1 
                onClick={handleSecretClick}
                className="text-4xl md:text-5xl font-display font-bold text-slate-900 cursor-pointer select-none active:scale-[0.99] transition-transform hover:opacity-90 leading-tight"
              >
                CIYA Professional CV and Application Letter Builder
              </h1>

              {/* Hidden Admin Dashboard (Triggered by 5 clicks on Title) */}
              <AnimatePresence>
                {isAdminMode && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="pt-2 w-full flex flex-col items-center gap-4"
                  >
                    {user?.email === 'ogunnaikemichael2017@gmail.com' ? (
                      <div className="bg-primary-50 p-6 rounded-3xl border border-primary-100 max-w-lg w-full text-center space-y-6">
                        <div className="space-y-1">
                          <p className="text-primary-900 font-bold uppercase tracking-widest text-[9px]">Platform Download Stats</p>
                          <div className="flex justify-center gap-8">
                            <div>
                              <p className="text-2xl font-display font-black text-primary-600">{downloadStats?.total_cv || 0}</p>
                              <p className="text-[8px] font-bold text-primary-400 uppercase">CVs</p>
                            </div>
                            <div className="w-px h-8 bg-primary-200" />
                            <div>
                               <p className="text-2xl font-display font-black text-primary-600">{downloadStats?.total_letter || 0}</p>
                               <p className="text-[8px] font-bold text-primary-400 uppercase">Letters</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-left">
                          <div className="bg-white/50 p-3 rounded-xl space-y-2">
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest border-b border-primary-100 pb-1">Industries (CV)</p>
                             <div className="max-h-32 overflow-y-auto space-y-1 no-scrollbar">
                                {downloadStats?.industries && Object.entries(downloadStats.industries).sort((a: any, b: any) => b[1] - a[1]).map(([name, count]) => (
                                  <div key={name} className="flex justify-between items-center text-[10px]">
                                    <span className="capitalize text-slate-600">{name.replace(/_/g, ' ')}</span>
                                    <span className="font-bold text-primary-600">{count as any}</span>
                                  </div>
                                ))}
                                {(!downloadStats?.industries || Object.keys(downloadStats.industries).length === 0) && <p className="text-[9px] text-slate-300 italic">No data yet</p>}
                             </div>
                          </div>
                          <div className="bg-white/50 p-3 rounded-xl space-y-2">
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest border-b border-primary-100 pb-1">Categories (Letter)</p>
                             <div className="max-h-32 overflow-y-auto space-y-1 no-scrollbar">
                                {downloadStats?.letterCategories && Object.entries(downloadStats.letterCategories).sort((a: any, b: any) => b[1] - a[1]).map(([name, count]) => (
                                  <div key={name} className="flex justify-between items-center text-[10px]">
                                    <span className="capitalize text-slate-600">{name.replace(/_/g, ' ')}</span>
                                    <span className="font-bold text-primary-600">{count as any}</span>
                                  </div>
                                ))}
                                {(!downloadStats?.letterCategories || Object.keys(downloadStats.letterCategories).length === 0) && <p className="text-[9px] text-slate-300 italic">No data yet</p>}
                             </div>
                          </div>
                        </div>

                        <button onClick={logout} className="text-[10px] text-primary-400 font-bold hover:text-primary-600 transition-colors uppercase tracking-widest pt-2">Logout Admin</button>
                      </div>
                    ) : (
                      <button 
                        onClick={login}
                        className="text-slate-400 text-[10px] font-bold hover:text-slate-900 transition-colors uppercase tracking-widest flex items-center gap-2 px-4 py-2 border border-slate-100 rounded-full bg-white/50 mx-auto"
                      >
                        <Settings className="w-3 h-3" />
                        Initialize Admin Auth
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                {appMode === 'home' 
                  ? 'Stop struggling with generic formatting. Transform your professional story into a compelling narrative with our industry-tailored CV builder and AI-powered application letter builder.'
                  : (appMode === 'cv' 
                    ? 'Select your industry to get started with tailored templates and AI suggestions'
                    : 'Draft professional application letters for any occasion with our AI-powered assistant')}
              </p>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-col items-center gap-8">
              {appMode === 'home' && (
                <div className="flex flex-wrap justify-center gap-6 w-full max-w-3xl">
                  <button
                    onClick={() => {
                      setAppMode('cv');
                      setIndustry(null);
                    }}
                    className="flex-1 min-w-[280px] p-10 bg-white border-2 border-slate-100 rounded-[40px] flex flex-col items-center gap-4 transition-all hover:border-primary-500 hover:shadow-2xl hover:shadow-primary-100 hover:-translate-y-1 group"
                  >
                    <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                      <Briefcase className="w-10 h-10 text-primary-600 group-hover:text-white" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-slate-900">CV Builder</h3>
                      <p className="text-sm text-slate-400 font-medium">Industry-tailored resumes</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setAppMode('letter')}
                    className="flex-1 min-w-[280px] p-10 bg-white border-2 border-slate-100 rounded-[40px] flex flex-col items-center gap-4 transition-all hover:border-primary-500 hover:shadow-2xl hover:shadow-primary-100 hover:-translate-y-1 group"
                  >
                    <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center group-hover:bg-primary-600 transition-colors">
                      <FileText className="w-10 h-10 text-primary-600 group-hover:text-white" />
                    </div>
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-slate-900">Application Letter Builder</h3>
                      <p className="text-sm text-slate-400 font-medium">Draft professional letters</p>
                    </div>
                  </button>
                </div>
              )}

              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => setShowHowToUse(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:border-primary-500 hover:text-primary-600 hover:shadow-lg hover:shadow-primary-50 transition-all"
                >
                  <HelpCircle className="w-5 h-5" />
                  How to Use
                </button>
                <button 
                  onClick={() => setShowAboutUs(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:border-primary-500 hover:text-primary-600 hover:shadow-lg hover:shadow-primary-50 transition-all"
                >
                  <Info className="w-5 h-5" />
                  About Us
                </button>
              </div>
            </div>

            {appMode === 'cv' && !industry && (
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {industries.map((ind) => (
                    <button
                      key={ind.id}
                      onClick={() => selectIndustry(ind.id)}
                      className={cn(
                        "group p-6 bg-white border transition-all text-center space-y-3 rounded-2xl",
                        industry === ind.id 
                          ? "border-primary-500 shadow-xl shadow-primary-100 ring-2 ring-primary-500" 
                          : "border-slate-200 hover:border-primary-500 hover:shadow-xl hover:shadow-primary-100"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center mx-auto transition-colors",
                        industry === ind.id ? "bg-primary-50 text-primary-600" : "bg-slate-50 text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600"
                      )}>
                        <ind.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{ind.label}</h3>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{ind.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
                
                <div className="w-full flex justify-center mt-4">
                  <button
                    onClick={() => selectIndustry('technology')}
                    className="flex items-center gap-3 px-8 py-4 bg-primary-50 border border-primary-200 rounded-2xl text-primary-700 font-bold hover:bg-primary-100 transition-all shadow-sm group"
                  >
                    <ClipboardPaste className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Skip and Auto-Fill Existing CV
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Branding & Share Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="w-full flex flex-col items-center gap-6 py-12"
        >
          {/* Marketing & Share Section */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="max-w-md w-full text-center space-y-4 px-4"
          >
            <div className="flex flex-row gap-2 justify-center">
              <button 
                onClick={() => {
                  const message = `⚠️ Stop Getting Rejected! Did you know 75% of CVs are rejected by AI filters before they reach a human? ✅\n\nGeneric formatting and uninspired summaries are the silent killers of great careers. CIYA Professional CV Builder is here to change that! 🚀\n\nThis is a 2-in-1 Powerful Tool that provides:\n✅ Industry-Intelligent Layouts\n✅ AI-Powered Content Polishing\n✅ Professional Global Content\n✅ Professional Application Letters that Convert\n\nDon't just apply—be the choice. Build both your CV and Application Letter at: ${window.location.origin}`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                }}
                className="flex-1 px-4 py-3 bg-[#25D366] text-white rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-green-100 transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-md whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4 fill-white/20" />
                WhatsApp
              </button>
              <button 
                onClick={() => {
                  const message = `⚠️ Stop Getting Rejected! Did you know 75% of CVs are filtered by robots? ✅ CIYA CV Builder is the 2-in-1 solution for your CV and Application Letter! 🚀\n\nBuild your professional future at: ${window.location.origin}`;
                  if (navigator.share) {
                    navigator.share({
                      title: 'CIYA CV Builder',
                      text: message,
                      url: window.location.origin
                    });
                  } else {
                    navigator.clipboard.writeText(message + " " + window.location.origin);
                    alert("Invite message copied to clipboard!");
                  }
                }}
                className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-900 rounded-xl text-xs font-bold hover:border-primary-500 hover:text-primary-600 transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-sm whitespace-nowrap"
              >
                <Share2 className="w-4 h-4" />
                Share Link
              </button>
            </div>
          </motion.div>

          {/* Branding Footer Badge (Non-floating) */}
          <motion.div
            style={{ perspective: 1000 }}
            animate={{
              rotateY: [0, 10, 0, -10, 0],
              rotateX: [0, 5, 0, -5, 0],
              x: ['-20%', '20%', '-20%']
            }}
            transition={{
              rotateY: { duration: 8, repeat: Infinity, ease: "easeInOut" },
              rotateX: { duration: 8, repeat: Infinity, ease: "easeInOut" },
              x: { duration: 15, repeat: Infinity, ease: "easeInOut" }
            }}
            className="group relative"
          >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-primary-400 blur-2xl opacity-5 group-hover:opacity-10 transition-opacity rounded-full" />
            
            <div className="relative px-8 py-3 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50 shadow-2xl flex items-center gap-3 backdrop-blur-xl">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] leading-none mb-1">Authenticated Product</p>
                <p className="text-xs font-bold text-white tracking-wide">
                  Powered by <span className="text-primary-400">CIYA</span>
                  <span className="text-slate-400 font-medium ml-1.5 opacity-60 text-[9px] block sm:inline italic">Create It Yourself Academy</span>
                </p>
              </div>
              
              {/* Gloss Layer */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
            </div>
          </motion.div>
        </motion.div>

        {/* Modals */}
        <AnimatePresence>
          {showHowToUse && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative shadow-2xl"
              >
                <button 
                  onClick={() => setShowHowToUse(false)}
                  className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <CloseIcon className="w-6 h-6 text-slate-400" />
                </button>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center">
                      <HelpCircle className="w-8 h-8 text-primary-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900">Unlock Your Career Potential</h2>
                    <p className="text-slate-600 leading-relaxed text-lg">
                      Stop struggling with generic formatting and uninspired content. The CIYA CV Builder is engineered to transform your professional story into a compelling narrative that captures the attention of top recruiters. Our industry-tailored intelligence ensures your precision matches your ambition.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary-500" />
                      Key Features
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <h4 className="font-bold text-slate-900 mb-1">Industry Intelligence</h4>
                        <p className="text-sm text-slate-500">Tailored defaults for 16+ industries, from Tech to Healthcare.</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <h4 className="font-bold text-slate-900 mb-1">Template Enhancement</h4>
                        <p className="text-sm text-slate-500">100+ professional templates to refine your summary instantly.</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <h4 className="font-bold text-slate-900 mb-1">Visual Proficiency</h4>
                        <p className="text-sm text-slate-500">Interactive star ratings and dynamic icons for a modern look.</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <h4 className="font-bold text-slate-900 mb-1">Dual Export</h4>
                        <p className="text-sm text-slate-500">Generate a matching CV and Application Letter in seconds.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-900">Step-by-Step Guide</h3>
                    <ol className="space-y-4">
                      {[
                        "Select your industry to load tailored professional defaults.",
                        "Input your personal details and work history in the editor.",
                        "Use the 'AI Enhance' button to instantly polish your descriptions.",
                        "Customize your skills and projects with our visual selectors.",
                        "Preview and download your high-quality PDF CV and Application Letter."
                      ].map((step, i) => (
                        <li key={i} className="flex gap-4 items-start">
                          <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold flex-shrink-0">
                            {i + 1}
                          </span>
                          <p className="text-slate-600 pt-1">{step}</p>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <button 
                    onClick={() => setShowHowToUse(false)}
                    className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-100"
                  >
                    Got it, let's build!
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {showAboutUs && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 relative shadow-2xl"
              >
                <button 
                  onClick={() => setShowAboutUs(false)}
                  className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <CloseIcon className="w-6 h-6 text-slate-400" />
                </button>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-primary-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900">About CIYA</h2>
                    <p className="text-slate-600 leading-relaxed text-lg">
                      CIYA (Create It Yourself Academy) is more than just a platform—it's a movement. We are an academy platform dedicated to empowering individuals with the technical and personal skills to build their own future. 
                    </p>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                    <h3 className="text-xl font-bold text-slate-900">Mastering the Art of Creation</h3>
                    <p className="text-slate-600">
                      We believe that everyone should have the power to build tools that solve their own problems. CIYA hosts exclusive masterclasses where we teach you how to gain the skills needed to build high-impact tools for yourself and your business. From coding to strategic design, we turn consumers into creators.
                    </p>
                    <div className="flex items-center gap-4 pt-2">
                      <div className="flex -space-x-2">
                        {[1,2,3,4].map(i => (
                          <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                            <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" referrerPolicy="no-referrer" />
                          </div>
                        ))}
                      </div>
                      <p className="text-sm font-bold text-slate-500">Join 5,000+ creators at CIYA</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowAboutUs(false)}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                  >
                    Learn More at CIYA Academy
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Left Sidebar - Editor */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={cn(
          "h-full transition-all duration-500 ease-in-out z-20",
          viewMode === 'split' ? "w-full md:w-[450px] lg:w-[500px]" : "w-0 opacity-0 pointer-events-none"
        )}
      >
        <Sidebar 
          data={cvData} 
          onChange={setCvData} 
          industry={industries.find(i => i.id === industry)?.label || ''} 
          industryKey={industry || 'technology'}
          onIndustryChange={selectIndustry} 
          onModeChange={setAppMode}
          onLogoClick={handleSecretClick}
        />
      </motion.div>

      {/* Main Content - Preview & Controls */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Top Navbar */}
        <header className="h-auto min-h-16 py-3 bg-white border-b border-slate-200 flex flex-col md:flex-row items-center justify-between px-4 md:px-6 z-10 gap-4">
          <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 flex-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-1 flex-shrink-0 hidden sm:inline">Template:</span>
              <div className="flex items-center gap-1.5 pr-4">
                {(['modern', 'minimal', 'classic', 'creative'] as TemplateId[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTemplate(t)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all border flex-shrink-0",
                      template === t 
                        ? "bg-primary-50 border-primary-200 text-primary-600 shadow-sm" 
                        : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200 mx-1 md:mx-2 flex-shrink-0" />

            <div className="flex bg-slate-100 p-1 rounded-lg flex-shrink-0">
              <button
                onClick={() => setZoom(prev => Math.max(0.4, prev - 0.1))}
                className="p-1.5 rounded-md text-slate-500 hover:text-primary-600 hover:bg-white transition-all"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <div className="px-2 flex items-center text-[10px] font-bold text-slate-500 min-w-[45px] justify-center">
                {Math.round(zoom * 100)}%
              </div>
              <button
                onClick={() => setZoom(prev => Math.min(1.5, prev + 0.1))}
                className="p-1.5 rounded-md text-slate-500 hover:text-primary-600 hover:bg-white transition-all"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            <div className="hidden md:block h-6 w-px bg-slate-200 mx-1 md:mx-2 flex-shrink-0" />

            <div className="hidden md:flex bg-slate-100 p-1 rounded-lg flex-shrink-0">
              <button
                onClick={() => setPreviewType('cv')}
                className={cn(
                  "px-3 py-1.5 rounded-md text-[10px] font-bold flex items-center gap-1.5 transition-all",
                  previewType === 'cv' ? "bg-white text-primary-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                )}
              >
                <User className="w-3.5 h-3.5" />
                CV
              </button>
              <button
                onClick={() => setPreviewType('letter')}
                className={cn(
                  "px-3 py-1.5 rounded-md text-[10px] font-bold flex items-center gap-1.5 transition-all",
                  previewType === 'letter' ? "bg-white text-primary-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                )}
              >
                <FileText className="w-3.5 h-3.5" />
                Letter
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end hidden md:flex">
            <button 
              onClick={resetData}
              className="px-4 py-2 border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-100 transition-all rounded-lg text-xs font-bold flex items-center gap-2"
              title="Start New CV"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </button>
            <button 
              onClick={exportPDF}
              disabled={isExporting}
              className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary-200 transition-all active:scale-95 disabled:opacity-50"
            >
              <Download className={cn("w-4 h-4", isExporting && "animate-bounce")} />
              {isExporting ? 'Exporting...' : 'Download PDF'}
            </button>
          </div>
        </header>

        {/* Preview Area */}
        <main className="flex-1 overflow-y-auto bg-slate-100 p-4 md:p-12 flex items-start scroll-smooth">
          <div className="w-full flex h-full">
            <Preview data={cvData} template={template} showApplicationLetter={previewType === 'letter'} zoom={zoom} />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between z-50">
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('split')}
            className={cn(
              "px-4 py-2 rounded-md text-xs font-bold flex items-center gap-2 transition-all",
              viewMode === 'split' ? "bg-white text-primary-600 shadow-sm" : "text-slate-500"
            )}
          >
            <Layout className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={cn(
              "px-4 py-2 rounded-md text-xs font-bold flex items-center gap-2 transition-all",
              viewMode === 'preview' ? "bg-white text-primary-600 shadow-sm" : "text-slate-500"
            )}
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setPreviewType('cv')}
            className={cn(
              "px-3 py-1.5 rounded-md text-[10px] font-bold flex items-center gap-1.5 transition-all",
              previewType === 'cv' ? "bg-white text-primary-600 shadow-sm" : "text-slate-500"
            )}
          >
            <User className="w-3.5 h-3.5" />
            CV
          </button>
          <button
            onClick={() => setPreviewType('letter')}
            className={cn(
              "px-3 py-1.5 rounded-md text-[10px] font-bold flex items-center gap-1.5 transition-all",
              previewType === 'letter' ? "bg-white text-primary-600 shadow-sm" : "text-slate-500"
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            Application Letter
          </button>
        </div>

        <button 
          onClick={exportPDF}
          disabled={isExporting}
          className="bg-primary-600 text-white p-2.5 rounded-full shadow-lg shadow-primary-200 active:scale-95 disabled:opacity-50"
        >
          <Download className={cn("w-5 h-5", isExporting && "animate-bounce")} />
        </button>
      </div>
    </div>
  );
}
