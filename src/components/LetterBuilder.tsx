import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Send, 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Sparkles, 
  Download, 
  ChevronRight, 
  Briefcase, 
  GraduationCap, 
  Handshake, 
  Plane,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Plus,
  Layout,
  Eye,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowLeft,
  RefreshCw,
  Check,
  Home as HomeIcon,
  ShieldCheck,
  Key,
  DoorOpen,
  Hammer,
  TrendingDown,
  TrendingUp,
  Bell,
  Gavel,
  ClipboardList,
  Search,
  Users
} from 'lucide-react';
import { LetterData, LetterType, LetterCategory } from '../types';
import { SituationalSection } from './SituationalSection';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { generateLetterVersions, multiVersionTemplates } from '../lib/letterTemplates';

const categories: { id: LetterCategory, icon: any, label: string, description: string }[] = [
  { id: 'Professional', icon: Briefcase, label: 'Professional', description: 'Career & Workplace' },
  { id: 'Academic', icon: GraduationCap, label: 'Academic', description: 'Studies & Admissions' },
  { id: 'Business', icon: Handshake, label: 'Business', description: 'Formal & Proposals' },
  { id: 'Travel', icon: Plane, label: 'Travel', description: 'Visa & Immigration' },
  { id: 'Tenant', icon: User, label: 'Tenant', description: 'Rent & Maintenance' },
  { id: 'Landlord', icon: Key, label: 'Landlord', description: 'Notices & Reminders' },
  { id: 'Real Estate Agency', icon: Building2, label: 'Real Estate Agency', description: 'Listings & Agreements' },
];

const letterTypes: Record<LetterCategory, { type: LetterType, icon: any, label: string }[]> = {
  Professional: [
    { type: 'Job Application', icon: FileText, label: 'Job Application' },
    { type: 'Internship Application', icon: Clock, label: 'Internship Application' },
    { type: 'Resignation', icon: Send, label: 'Resignation' },
    { type: 'Salary Increase', icon: Briefcase, label: 'Salary Increase' },
    { type: 'Leave Request', icon: Clock, label: 'Leave Request' },
  ],
  Academic: [
    { type: 'Admission Application', icon: GraduationCap, label: 'Admission Application' },
    { type: 'Scholarship Application', icon: GraduationCap, label: 'Scholarship Application' },
    { type: 'Recommendation', icon: CheckCircle2, label: 'Recommendation' },
  ],
  Business: [
    { type: 'Business Proposal', icon: Send, label: 'Proposal' },
    { type: 'Formal Request', icon: Plus, label: 'Formal Request' },
    { type: 'Complaint', icon: AlertCircle, label: 'Complaint' },
    { type: 'Inquiry', icon: Mail, label: 'Inquiry' },
  ],
  Travel: [
    { type: 'Visa Application', icon: Plane, label: 'Visa Application' },
  ],
  Tenant: [
    { type: 'Rent Payment Confirmation', icon: CheckCircle2, label: 'Rent Confirmation' },
    { type: 'Notice to Vacate', icon: DoorOpen, label: 'Notice to Vacate' },
    { type: 'State of Amenities Complaint', icon: AlertCircle, label: 'Amenities Complaint' },
    { type: 'Maintenance Request', icon: Hammer, label: 'Maintenance Request' },
    { type: 'Rent Reduction Request', icon: TrendingDown, label: 'Rent Reduction' },
  ],
  Landlord: [
    { type: 'Quit/Eviction Notice', icon: Gavel, label: 'Eviction Notice' },
    { type: 'Rent Increase Notice', icon: TrendingUp, label: 'Rent Increase' },
    { type: 'Rent Reminder', icon: Bell, label: 'Rent Reminder' },
    { type: 'Tenancy Agreement Letter', icon: FileText, label: 'Tenancy Agreement' },
    { type: 'Property Warning Letter', icon: AlertCircle, label: 'Warning Letter' },
  ],
  'Real Estate Agency': [
    { type: 'Property Listing Proposal', icon: ClipboardList, label: 'Listing Proposal' },
    { type: 'Client Follow-up', icon: Search, label: 'Client Follow-up' },
    { type: 'Property Offer Letter', icon: Key, label: 'Property Offer' },
    { type: 'Agency Agreement Letter', icon: ShieldCheck, label: 'Agency Agreement' },
  ],
};

const situationalQuestions: Record<LetterType, { id: string, question: string, placeholder: string }[]> = {
  'Job Application': [
    { id: 'achievement', question: 'What is your most notable achievement in your recent role?', placeholder: 'e.g. Led a team that increased revenue by 20%' },
    { id: 'motivation', question: 'Why do you want to work for this specific company?', placeholder: 'e.g. I admire your commitment to sustainable innovation' }
  ],
  'Resignation': [
    { id: 'reason', question: 'What is your primary reason for leaving? (Optional)', placeholder: 'e.g. Pursuing a new career opportunity' },
    { id: 'lastDay', question: 'When is your final day of work?', placeholder: 'e.g. May 15, 2026' }
  ],
  'Recommendation': [
    { id: 'relationship', question: 'In what capacity did you work with the person?', placeholder: 'e.g. Managed them for 3 years at CIYA' },
    { id: 'strength', question: 'What is their single strongest professional trait?', placeholder: 'e.g. Exceptional problem-solving skills under pressure' }
  ],
  'Scholarship Application': [
    { id: 'scholarshipName', question: 'What is the exact name of the scholarship?', placeholder: 'e.g. Commonwealth Scholarship' },
    { id: 'fieldOfStudy', question: 'What field of study are you applying for?', placeholder: 'e.g. MSc in Environmental Science' },
    { id: 'impact', question: 'How will this scholarship help you reach your goals?', placeholder: 'e.g. Allow me to focus on research without financial burden' }
  ],
  'Visa Application': [
    { id: 'destination', question: 'Which country are you applying to visit?', placeholder: 'e.g. United Kingdom' },
    { id: 'purpose', question: 'What is the specific purpose of your visit?', placeholder: 'e.g. Attending a medical conference in London' },
    { id: 'duration', question: 'How long do you intend to stay?', placeholder: 'e.g. 14 days' }
  ],
  'Salary Increase': [
    { id: 'recentSuccess', question: 'Mention a recent project where you exceeded expectations.', placeholder: 'e.g. Successfully managed the Q1 marketing rollout solo' },
    { id: 'yearsAtRole', question: 'How long have you been in your current position?', placeholder: 'e.g. 2 years' }
  ],
  'Internship Application': [
    { id: 'university', question: 'Which university are you currently attending?', placeholder: 'e.g. University of Lagos' },
    { id: 'skillsToLearn', question: 'What skill do you hope to gain from this internship?', placeholder: 'e.g. Hands-on experience in cloud infrastructure' }
  ],
  'Admission Application': [
    { id: 'programName', question: 'What is the exact name of the program you are applying for?', placeholder: 'e.g. Bachelor of Laws (LLB)' },
    { id: 'background', question: 'Briefly mention your relevant academic background.', placeholder: 'e.g. Completed A-Levels with distinctions in Law and History' }
  ],
  'Leave Request': [
    { id: 'leaveDates', question: 'What are the start and end dates of your requested leave?', placeholder: 'e.g. June 1st to June 10th' },
    { id: 'coverage', question: 'Who will handle your tasks while you are away?', placeholder: 'e.g. Segun from the operations team' }
  ],
  'Business Proposal': [
    { id: 'problemSolved', question: 'What specific problem does your proposal solve?', placeholder: 'e.g. Reducing operational costs by automating logistics' },
    { id: 'offer', question: 'What is your primary unique selling point (USP)?', placeholder: 'e.g. 24/7 localized support that competitors lack' }
  ],
  'Formal Request': [
    { id: 'requestSubject', question: 'Specify exactly what you are requesting.', placeholder: 'e.g. Access to the historical archives for research' },
    { id: 'deadline', question: 'Do you have a deadline for this request?', placeholder: 'e.g. Needed by the end of next week' }
  ],
  'Complaint': [
    { id: 'incidentDate', question: 'When did the incident occur?', placeholder: 'e.g. April 12th, 2026' },
    { id: 'desiredResolution', question: 'What is your expected resolution?', placeholder: 'e.g. A full refund or replacement of the faulty unit' }
  ],
  'Inquiry': [
    { id: 'inquiryTopic', question: 'What is the specific topic of your inquiry?', placeholder: 'e.g. Availability of the premium warehouse space' },
    { id: 'reasonForInquiry', question: 'Briefly explain the reason for your interest.', placeholder: 'e.g. We are expanding our logistics operations in Lagos' }
  ],
  'Rent Payment Confirmation': [
    { id: 'amount', question: 'What was the amount paid?', placeholder: 'e.g. ₦1,200,000' },
    { id: 'period', question: 'What period does this payment cover?', placeholder: 'e.g. Jan 2026 to Dec 2026' },
    { id: 'paymentMethod', question: 'How was the payment made?', placeholder: 'e.g. Bank Transfer' }
  ],
  'Notice to Vacate': [
    { id: 'moveOutDate', question: 'What is your intended move-out date?', placeholder: 'e.g. June 30, 2026' },
    { id: 'forwardingAddress', question: 'What is your forwarding address? (Optional)', placeholder: 'e.g. 12 New Estate Road, Lekki' }
  ],
  'State of Amenities Complaint': [
    { id: 'defectiveAmenity', question: 'Which amenity is in a bad state?', placeholder: 'e.g. The central water pump' },
    { id: 'issueDuration', question: 'How long has this been an issue?', placeholder: 'e.g. For the past two weeks' }
  ],
  'Maintenance Request': [
    { id: 'maintenanceDetails', question: 'Specify exactly what needs repair.', placeholder: 'e.g. Leaking roof in the master bedroom' },
    { id: 'urgency', question: 'Is this an emergency?', placeholder: 'e.g. High - risking property damage' }
  ],
  'Rent Reduction Request': [
    { id: 'requestedAmount', question: 'What is your proposed new rent?', placeholder: 'e.g. ₦1,000,000' },
    { id: 'justification', question: 'Why are you requesting a reduction?', placeholder: 'e.g. Economic downturn and loyal tenancy for 5 years' }
  ],
  'Quit/Eviction Notice': [
    { id: 'vacateDeadline', question: 'When must the tenant vacate by?', placeholder: 'e.g. July 31, 2026' },
    { id: 'evictionReason', question: 'What is the specific reason for eviction?', placeholder: 'e.g. Serious breach of tenancy agreement' }
  ],
  'Rent Increase Notice': [
    { id: 'newRentAmount', question: 'What will be the new rent amount?', placeholder: 'e.g. ₦1,500,000' },
    { id: 'effectiveDate', question: 'When does the increase take effect?', placeholder: 'e.g. Next renewal cycle' }
  ],
  'Rent Reminder': [
    { id: 'overdueAmount', question: 'What is the total overdue amount?', placeholder: 'e.g. ₦500,000' },
    { id: 'daysOverdue', question: 'How many days is it overdue?', placeholder: 'e.g. 10 days' }
  ],
  'Tenancy Agreement Letter': [
    { id: 'leaseTerm', question: 'What is the duration of the lease?', placeholder: 'e.g. 12 months' },
    { id: 'securityDeposit', question: 'What is the security deposit amount?', placeholder: 'e.g. ₦200,000' }
  ],
  'Property Warning Letter': [
    { id: 'violationDetails', question: 'Specify the violation.', placeholder: 'e.g. Persistent loud noise after 10 PM' },
    { id: 'actionRequired', question: 'What must the tenant do to rectify this?', placeholder: 'e.g. Cease all loud activities immediately' }
  ],
  'Property Listing Proposal': [
    { id: 'propertyType', question: 'What kind of property are you listing?', placeholder: 'e.g. 4-Bedroom Semi-Detached' },
    { id: 'listingPrice', question: 'What is the suggested listing price?', placeholder: 'e.g. ₦85,000,000' }
  ],
  'Client Follow-up': [
    { id: 'lastContact', question: 'When was your last contact with the client?', placeholder: 'e.g. After the viewing on Saturday' },
    { id: 'interestLevel', question: 'What was their primary interest?', placeholder: 'e.g. The spacious backyard and modern kitchen' }
  ],
  'Property Offer Letter': [
    { id: 'offeredPrice', question: 'What is the purchase/rent price being offered?', placeholder: 'e.g. ₦80,000,000' },
    { id: 'closingDate', question: 'What is the proposed closing date?', placeholder: 'e.g. within 30 days' }
  ],
  'Agency Agreement Letter': [
    { id: 'commissionRate', question: 'What is the agreed commission rate?', placeholder: 'e.g. 5% of final sale price' },
    { id: 'exclusivity', question: 'Is this an exclusive mandate?', placeholder: 'e.g. Exclusive for 6 months' }
  ]
};

export default function LetterBuilder({ onBack, onDownload }: { onBack?: () => void, onDownload?: (category: string) => void }) {
  const STORAGE_KEY = 'ciya-letter-drafter-data';

  // Initialize state from local storage or defaults
  const [activeCategory, setActiveCategory] = useState<LetterCategory>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}-category`);
    const category = (saved as LetterCategory) || 'Professional';
    // Validate that the category actually exists in our mapping
    if (!letterTypes[category]) return 'Professional';
    return category;
  });

  const [activeType, setActiveType] = useState<LetterType | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}-type`);
    return (saved as LetterType) || null;
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<'builder' | 'preview'>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}-viewMode`);
    return (saved as any) || 'builder';
  });

  const [activeVersion, setActiveVersion] = useState<'short' | 'detailed' | 'email'>('detailed');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeStep, setActiveStep] = useState<'selection' | 'builder'>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}-step`);
    return (saved as any) || 'selection';
  });

  const [generationCount, setGenerationCount] = useState(0);
  const [selectedVariation, setSelectedVariation] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const toneMap: Record<string, number> = {
    'Professional': 0,
    'Persuasive': 1,
    'Empathetic': 2,
    'Direct': 3,
    'Confident': 4,
    'Friendly': 5
  };

  const [letterData, setLetterData] = useState<LetterData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved letter data", e);
      }
    }
    return {
      sender: { name: '', email: '', phone: '', address: '', title: '' },
      recipient: { name: '', title: '', company: '', address: '' },
      content: {
        type: 'Job Application',
        category: 'Professional',
        subject: '',
        details: '',
        tone: 'Professional',
        situationalAnswers: {}
      },
    };
  });

  // Save to local storage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(letterData));
  }, [letterData]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}-category`, activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    if (activeType) {
      localStorage.setItem(`${STORAGE_KEY}-type`, activeType);
    }
  }, [activeType]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}-viewMode`, viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}-step`, activeStep);
  }, [activeStep]);

  const resetData = () => {
    if (confirm("Are you sure you want to clear all data and start a new letter?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleInputChange = (section: 'sender' | 'recipient' | 'content', field: string, value: string) => {
    setLetterData(prev => ({
      ...prev,
      [section]: { ...prev[section as keyof LetterData] as any, [field]: value }
    }));
  };

  const handleSituationalAnswerChange = (questionId: string, value: string) => {
    setLetterData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        situationalAnswers: { ...prev.content.situationalAnswers, [questionId]: value }
      }
    }));
  };

  const handleCategorySelect = (categoryId: LetterCategory) => {
    setActiveCategory(categoryId);
    const defaultType = letterTypes[categoryId][0].type;
    setActiveType(defaultType);
    setLetterData(prev => ({
      ...prev,
      content: { ...prev.content, category: categoryId, type: defaultType, situationalAnswers: {} }
    }));
    setActiveStep('builder');
  };

  const handleTypeSelect = (type: LetterType) => {
    setActiveType(type);
    setLetterData(prev => ({
      ...prev,
      content: { ...prev.content, type, situationalAnswers: {} }
    }));
  };

  const handleGenerateNow = () => {
    if (!letterData.sender.name) {
      alert("Please fill in your name in the Sender Info section.");
      return;
    }
    if (!letterData.recipient.name || !letterData.recipient.company) {
      alert("Please fill in the Recipient details.");
      return;
    }

    setIsGenerating(true);
    
    // Pick a new variation randomly, ensuring it's different if possible
    const sets = multiVersionTemplates[letterData.content.type] || multiVersionTemplates['Job Application'];
    let newVariation;
    if (sets.length > 1) {
      do {
        newVariation = Math.floor(Math.random() * sets.length);
      } while (newVariation === selectedVariation);
    } else {
      newVariation = 0;
    }
    
    setSelectedVariation(newVariation);

    // Simulate generation delay
    setTimeout(() => {
      const versions = generateLetterVersions(letterData, (toneMap[letterData.content.tone] || 0) + newVariation);
      
      setLetterData(prev => ({
        ...prev,
        generatedContent: versions[activeVersion],
        generatedVersions: versions
      }));
      
      setGenerationCount(prev => prev + 1);
      setIsGenerating(false);
      
      // Auto-scroll on mobile
      if (window.innerWidth < 768) {
        setTimeout(() => {
          document.getElementById('generated-content')?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    }, 1200);
  };

  const downloadLetter = () => {
    const wasInBuilder = viewMode === 'builder';
    if (wasInBuilder) {
      setViewMode('preview');
    }

    setIsExporting(true);
    
    // Wait for state update and render
    setTimeout(async () => {
      const element = document.getElementById('letter-preview-card');
      if (!element) {
        setIsExporting(false);
        if (wasInBuilder) setViewMode('builder');
        return;
      }

      try {
        const { default: html2pdf } = await import('html2pdf.js');
        const filename = `${(activeType || 'Letter').replace(/\s+/g, '_')}_Draft.pdf`;

        const opt = {
          margin:       0,
          filename:     filename,
          image:        { type: 'jpeg' as const, quality: 0.98 },
          html2canvas:  { 
            scale: 2, 
            useCORS: true, 
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

              const el = clonedDoc.getElementById('letter-preview-card');
              if (el) {
                el.style.transform = 'none';
                el.style.width = '800px';
                el.style.position = 'relative';
                el.style.left = '0';
                el.style.top = '0';
                el.style.boxShadow = 'none';
                el.style.margin = '0';
                el.style.padding = '40px';
              }
            }
          },
          jsPDF:        { unit: 'px', format: [800, 1120] as [number, number], orientation: 'portrait' as const }
        };

        const originalTransform = element.style.transform;
        element.style.transform = 'none';

        await html2pdf().set(opt).from(element).save();
        
        element.style.transform = originalTransform;

        // Track the download
        onDownload?.(activeCategory);
      } catch (error) {
        console.error('Export failed:', error);
        alert("Export failed. Please try again.");
      } finally {
        setIsExporting(false);
        if (wasInBuilder) setViewMode('builder');
      }
    }, 500);
  };

  const copyToClipboard = () => {
    const content = letterData.generatedVersions?.[activeVersion] || letterData.generatedContent;
    if (!content) return;
    navigator.clipboard.writeText(content);
    alert("Letter content copied to clipboard!");
  };

  if (activeStep === 'selection') {
    return (
      <div className="flex-1 bg-white overflow-y-auto h-full">
        <div className="max-w-4xl mx-auto px-6 py-12 md:py-24 relative">
          <button
            onClick={() => onBack?.()}
            className="absolute left-6 top-6 p-2 text-slate-400 hover:text-primary-600 transition-colors flex items-center gap-2 text-sm font-bold md:hidden"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="text-center mb-16 space-y-4">
            <div className="flex justify-center mb-6">
               <div className="w-20 h-20 bg-primary-50 rounded-[32px] flex items-center justify-center">
                  <FileText className="w-10 h-10 text-primary-600" />
               </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-black text-slate-900 tracking-tight">
               What type of <span className="text-primary-600">letter</span> do you want to build?
            </h1>
            <p className="text-slate-500 font-medium max-w-xl mx-auto uppercase tracking-widest text-[10px]">
               Step 1: Select a category to explore professional templates
            </p>
          </div>
          
          <div className="flex justify-center mb-8">
            {letterData.sender.name && (
              <button 
                onClick={resetData}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-red-400 transition-all bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100"
              >
                <RefreshCw className="w-3 h-3" />
                Clear Saved Progress
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className="group p-6 bg-white border border-slate-200 rounded-2xl transition-all text-center space-y-3 hover:border-primary-500 hover:shadow-xl hover:shadow-primary-100 active:scale-95"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto bg-slate-50 text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                   <cat.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{cat.label}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    {cat.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-slate-50 overflow-hidden relative">
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* ribbon header */}
        <div className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-12 shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-4">
             <button 
                onClick={() => setActiveStep('selection')}
                className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-600 transition-all"
                title="Go back to selection"
             >
                <ArrowLeft className="w-5 h-5" />
             </button>
             <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">{activeType} Drafter</h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black font-mono">Step 2: Drafting & Customization</p>
             </div>
             <button 
                onClick={resetData}
                className="ml-4 p-2 text-slate-300 hover:text-red-400 transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                title="Clear all data"
             >
                <RefreshCw className="w-3 h-3" />
                Clear
             </button>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
             <AnimatePresence mode="wait">
               {letterData.generatedContent && viewMode === 'preview' && (
                 <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-1.5 md:gap-2"
                 >
                    <button 
                      onClick={copyToClipboard}
                      className="p-2 md:p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-600 transition-all font-bold text-[9px] md:text-[10px] uppercase tracking-wider flex items-center gap-2"
                    >
                      <Copy className="w-3.5 h-3.5 md:w-4 h-4" />
                      <span className="hidden sm:inline">Copy</span>
                    </button>
                    <button 
                      onClick={downloadLetter}
                      disabled={isExporting}
                      className="p-2 md:p-3 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl transition-all font-bold text-[9px] md:text-[10px] uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-primary-200 disabled:opacity-50"
                    >
                      <Download className={cn("w-3.5 h-3.5 md:w-4 h-4", isExporting && "animate-bounce")} />
                      {isExporting ? 'Exporting...' : 'Download PDF'}
                    </button>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden relative">
          <AnimatePresence mode="wait">
            {viewMode === 'builder' ? (
              <motion.div
                key="builder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 overflow-y-auto p-6 md:p-12"
              >
                 <div className="max-w-4xl mx-auto space-y-12 pb-40">
                   {/* Stacked Vertical Flow: Type Selection -> Sender -> Recipient -> Tone -> Action */}
                   <div className="grid grid-cols-1 gap-12">
                     
                     {/* 0. Letter Type Selection (Inside builder) */}
                     <section className="bg-white p-8 md:p-12 rounded-[48px] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-8">
                        <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                           <div>
                             <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                              <FileText className="w-5 h-5 text-primary-500" />
                              Select Letter Type
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-wider">Specific intent for your {activeCategory} letter</p>
                           </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {letterTypes[activeCategory]?.map((lt) => (
                            <button
                               key={lt.type}
                               onClick={() => handleTypeSelect(lt.type)}
                               className={cn(
                                 "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                                 activeType === lt.type 
                                   ? "bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-200"
                                   : "bg-slate-50 border-slate-100 text-slate-500 hover:border-primary-200 hover:text-primary-600"
                               )}
                            >
                               {lt.label}
                            </button>
                          ))}
                        </div>
                     </section>
                     
                     <SituationalSection 
                       activeType={activeType || 'Job Application'}
                       situationalQuestions={situationalQuestions}
                       situationalAnswers={letterData.content.situationalAnswers}
                       onAnswerChange={handleSituationalAnswerChange}
                     />

                     {/* 1. Sender Section */}
                     <section className="bg-white p-8 md:p-12 rounded-[48px] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-8">
                        <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                           <div>
                             <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                              <User className="w-5 h-5 text-primary-500" />
                              Sender Information
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-wider">Your personal details for the letterhead</p>
                           </div>
                        </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-1.5 bg-slate-50/50 px-5 py-4 rounded-[24px] border border-slate-100 focus-within:ring-2 focus-within:ring-primary-500 transition-all">
                              <label className="text-[10px] font-black text-slate-400 pb-1 block uppercase tracking-[0.2em]">Full Name</label>
                              <input
                                 type="text"
                                 placeholder="e.g. Michael Ogunnaike"
                                 className="w-full bg-transparent text-sm focus:outline-none font-bold text-slate-900"
                                 value={letterData.sender.name}
                                 onChange={(e) => handleInputChange('sender', 'name', e.target.value)}
                              />
                           </div>
                           <div className="space-y-1.5 bg-slate-50/50 px-5 py-4 rounded-[24px] border border-slate-100 focus-within:ring-2 focus-within:ring-primary-500 transition-all">
                              <label className="text-[10px] font-black text-slate-400 pb-1 block uppercase tracking-[0.2em]">Your Title / Role</label>
                              <input
                                 type="text"
                                 placeholder="e.g. Senior Software Engineer"
                                 className="w-full bg-transparent text-sm focus:outline-none font-bold text-slate-900"
                                 value={letterData.sender.title}
                                 onChange={(e) => handleInputChange('sender', 'title', e.target.value)}
                              />
                           </div>
                           <div className="space-y-1.5 bg-slate-50/50 px-5 py-4 rounded-[24px] border border-slate-100 focus-within:ring-2 focus-within:ring-primary-500 transition-all">
                              <label className="text-[10px] font-black text-slate-400 pb-1 block uppercase tracking-[0.2em]">Email Address</label>
                              <input
                                 type="email"
                                 placeholder="e.g. mike@ciya.com"
                                 className="w-full bg-transparent text-sm focus:outline-none font-bold text-slate-900"
                                 value={letterData.sender.email}
                                 onChange={(e) => handleInputChange('sender', 'email', e.target.value)}
                              />
                           </div>
                           <div className="space-y-1.5 bg-slate-50/50 px-5 py-4 rounded-[24px] border border-slate-100 focus-within:ring-2 focus-within:ring-primary-500 transition-all">
                              <label className="text-[10px] font-black text-slate-400 pb-1 block uppercase tracking-[0.2em]">Phone Number</label>
                              <input
                                 type="text"
                                 placeholder="e.g. +234 800 000 0000"
                                 className="w-full bg-transparent text-sm focus:outline-none font-bold text-slate-900"
                                 value={letterData.sender.phone}
                                 onChange={(e) => handleInputChange('sender', 'phone', e.target.value)}
                              />
                           </div>
                           <div className="space-y-1.5 bg-slate-50/50 px-5 py-4 rounded-[24px] border border-slate-100 focus-within:ring-2 focus-within:ring-primary-500 transition-all">
                              <label className="text-[10px] font-black text-slate-400 pb-1 block uppercase tracking-[0.2em]">Your Address</label>
                              <input
                                 type="text"
                                 placeholder="City, State, Country"
                                 className="w-full bg-transparent text-sm focus:outline-none font-bold text-slate-900"
                                 value={letterData.sender.address}
                                 onChange={(e) => handleInputChange('sender', 'address', e.target.value)}
                              />
                           </div>
                        </div>
                     </section>

                     {/* 2. Recipient Section */}
                     <section className="bg-white p-8 md:p-12 rounded-[48px] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-8">
                        <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                           <div>
                             <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                              <Building2 className="w-5 h-5 text-primary-500" />
                              Recipient Details
                            </h4>
                            <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-wider">Who are you writing to?</p>
                           </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-1.5 focus-within:z-10 group bg-slate-50 px-5 py-4 rounded-[24px] border border-slate-100 focus-within:ring-2 focus-within:ring-primary-500 transition-all">
                            <label className="text-[10px] font-black text-slate-400 pb-1 block uppercase tracking-[0.2em]">Full Name</label>
                            <input
                              type="text"
                              placeholder="e.g. Samuel Adewale"
                              className="w-full bg-transparent text-sm focus:outline-none font-bold text-slate-900"
                              value={letterData.recipient.name}
                              onChange={(e) => handleInputChange('recipient', 'name', e.target.value)}
                            />
                          </div>
                          <div className="space-y-1.5 focus-within:z-10 group bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 focus-within:ring-2 focus-within:ring-primary-500 transition-all">
                            <label className="text-[10px] font-black text-slate-400 pb-1 block uppercase tracking-[0.2em]">Position</label>
                            <input
                              type="text"
                              placeholder="e.g. HR Director"
                              className="w-full bg-transparent text-sm focus:outline-none font-bold text-slate-900"
                              value={letterData.recipient.title}
                              onChange={(e) => handleInputChange('recipient', 'title', e.target.value)}
                            />
                          </div>
                          <div className="md:col-span-2 space-y-1.5 focus-within:z-10 group bg-slate-50 px-5 py-4 rounded-[24px] border border-slate-100 focus-within:ring-2 focus-within:ring-primary-500 transition-all">
                            <label className="text-[10px] font-black text-slate-400 pb-1 block uppercase tracking-[0.2em]">Organization</label>
                            <input
                              type="text"
                              placeholder="e.g. Zenith Bank PLC"
                              className="w-full bg-transparent text-sm focus:outline-none font-bold text-slate-900"
                              value={letterData.recipient.company}
                              onChange={(e) => handleInputChange('recipient', 'company', e.target.value)}
                            />
                          </div>
                        </div>
                     </section>

                     {/* 3. Tone & Drafting Action */}
                     <section className="bg-white p-8 md:p-12 rounded-[56px] border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] space-y-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8">
                           <FileText className="w-24 h-24 text-slate-100 -rotate-12" />
                        </div>
                        
                        <div className="relative">
                          <div className="flex items-center justify-between border-b border-slate-50 pb-6 mb-8">
                             <div>
                               <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary-500" />
                                Drafter Style
                              </h4>
                              <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-wider">Select the professional tone for your letter</p>
                             </div>
                          </div>

                          <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-[28px] w-fit mb-12">
                            {(['Professional', 'Persuasive', 'Empathetic', 'Direct', 'Confident', 'Friendly'] as any[]).map(t => (
                              <button
                                 key={t}
                                 onClick={() => {
                                   handleInputChange('content', 'tone', t);
                                   // Auto-regenerate when tone changes
                                   const versions = generateLetterVersions({
                                     ...letterData,
                                     content: { ...letterData.content, tone: t }
                                   }, (toneMap[t] || 0) + selectedVariation);
                                   setLetterData(prev => ({ 
                                     ...prev, 
                                     content: { ...prev.content, tone: t },
                                     generatedContent: versions[activeVersion],
                                     generatedVersions: versions
                                   }));
                                 }}
                                 className={cn(
                                   "px-8 py-3.5 rounded-[22px] text-[10px] font-black uppercase tracking-[0.3em] transition-all",
                                   letterData.content.tone === t 
                                     ? "bg-primary-600 text-white shadow-xl shadow-primary-200 scale-105"
                                     : "text-slate-400 hover:text-slate-600"
                                 )}
                              >
                                 {t}
                              </button>
                            ))}
                          </div>

                          <div className="flex flex-col items-center">
                             <button
                                onClick={handleGenerateNow}
                                disabled={isGenerating}
                                className="group w-full max-w-lg py-7 bg-slate-900 text-white rounded-[32px] font-black text-sm flex items-center justify-center gap-4 shadow-2xl hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50"
                             >
                                {isGenerating ? (
                                  <RefreshCw className="w-6 h-6 animate-spin text-primary-400" />
                                ) : (
                                  <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                                    <FileText className="w-4 h-4 text-primary-400" />
                                  </div>
                                )}
                                <span className="uppercase tracking-[0.3em]">{isGenerating ? 'Drafting Excellence...' : (generationCount > 0 ? 'REGENERATE NOW' : 'GENERATE NOW')}</span>
                             </button>
                          </div>
                        </div>
                     </section>

                     {/* 4. Generated Result Result Display */}
                     <AnimatePresence>
                       {letterData.generatedContent && (
                          <motion.section
                             id="generated-content"
                             initial={{ opacity: 0, y: 60 }}
                             animate={{ opacity: 1, y: 0 }}
                             className="bg-white p-8 md:p-16 rounded-[64px] border border-slate-100 shadow-2xl relative scroll-mt-24"
                          >
                             <div className="flex items-center justify-between mb-12">
                                <h4 className="text-[10px] font-black text-slate-900 bg-slate-100 px-6 py-2.5 rounded-full uppercase tracking-[0.3em]">The Result</h4>
                                <div className="hidden md:flex gap-3">
                                   <button onClick={copyToClipboard} className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors text-slate-600">
                                      <Copy className="w-5 h-5" />
                                   </button>
                                </div>
                             </div>
                             
                             <div className="flex flex-wrap gap-2 mb-8 bg-slate-100 p-1 rounded-2xl w-fit">
                               {(['short', 'detailed', 'email'] as const).map(v => (
                                 <button
                                   key={v}
                                   onClick={() => {
                                     setActiveVersion(v);
                                     setLetterData(prev => ({ ...prev, generatedContent: prev.generatedVersions?.[v] || prev.generatedContent }));
                                   }}
                                   className={cn(
                                     "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                     activeVersion === v ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                                   )}
                                 >
                                   {v} Version
                                 </button>
                               ))}
                             </div>

                             <div className="bg-[#f8fafc] p-8 md:p-16 rounded-[40px] border border-slate-100 border-dashed relative">
                                <pre className="font-sans text-base text-slate-700 whitespace-pre-wrap leading-[1.8] min-h-[400px]">
                                  {letterData.generatedContent}
                                </pre>

                                <div className="absolute top-0 right-10 -translate-y-1/2 px-6 py-2.5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-200 flex items-center gap-2">
                                   <Check className="w-4 h-4" /> Finalized Draft
                                </div>
                             </div>

                             <div className="mt-10 flex flex-col md:hidden gap-4">
                               <button onClick={copyToClipboard} className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                                  <Copy className="w-4 h-4" /> Copy To Clipboard
                               </button>
                             </div>
                          </motion.section>
                       )}
                     </AnimatePresence>
                   </div>
                 </div>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                id="letter-preview-card"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 bg-white overflow-y-auto p-12"
              >
                 <div className="max-w-2xl mx-auto space-y-10 pb-40">
                    <div className="border-b-4 border-slate-900 pb-10 flex justify-between items-start">
                       <div className="space-y-2">
                          <h2 className="text-4xl font-display font-black text-slate-900 leading-none capitalize italic tracking-tighter">
                             {letterData.sender.name || 'Your Name'}
                          </h2>
                          <div className="space-y-0.5 text-xs text-slate-500 font-medium tracking-tight">
                            <p className="flex items-center gap-2"><MapPin className="w-3 h-3 text-[#0ea5e9]" /> {letterData.sender.address || 'Sender Address'}</p>
                            <p className="flex items-center gap-2"><Mail className="w-3 h-3 text-[#0ea5e9]" /> {letterData.sender.email || 'email@example.com'}</p>
                            <p className="flex items-center gap-2"><Phone className="w-3 h-3 text-[#0ea5e9]" /> {letterData.sender.phone || 'Phone Number'}</p>
                          </div>
                       </div>
                       <div className="bg-slate-900 text-white p-5 rounded-3xl flex flex-col items-end shadow-2xl">
                          <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center mb-4">
                             <FileText className="w-5 h-5 text-[#38bdf8]" />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-[0.4em]">{activeType}</p>
                       </div>
                    </div>

                    <div className="space-y-10">
                       <div className="text-xs font-bold text-slate-400 border border-slate-200 px-4 py-2 rounded-full w-fit bg-slate-50 shadow-inner tracking-widest">
                          {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                       </div>

                       <div className="space-y-1.5 pl-6 border-l-4 border-[#0ea5e9] bg-[#f0f9ff] py-4 rounded-r-2xl pr-8">
                          <h3 className="text-xl font-display font-black text-slate-900">{letterData.recipient.name || 'Recipient Name'}</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none mb-2">{letterData.recipient.title || 'Official Position'}</p>
                          <p className="text-sm font-black text-slate-800">{letterData.recipient.company || 'Enterprise Entity'}</p>
                          <p className="text-xs text-slate-400 font-medium italic mt-1 leading-relaxed">{letterData.recipient.address || '123 Office Plaza, Business District'}</p>
                       </div>

                       {/* Formal Subject */}
                       <div className="bg-[#f8fafc] p-6 rounded-[28px] border-2 border-[#0f172a] shadow-[8px_8px_0px_#0f172a]">
                          <p className="text-[9px] font-black text-[#0284c7] uppercase tracking-[0.4em] mb-1.5">Official Subject Matter</p>
                          <p className="text-slate-900 font-display font-black text-lg leading-tight uppercase">
                             {letterData.content.subject || `RE: FORMAL COMMUNICATION REGARDING ${activeType.toUpperCase()}`}
                          </p>
                       </div>

                       {/* Body Content */}
                       <div className="text-base text-slate-700 space-y-6 whitespace-pre-wrap leading-[1.8] font-sans min-h-[300px] border-y border-slate-100 py-10">
                          {letterData.generatedContent ? (
                            letterData.generatedContent.split(/\n+(?:Sincerely|Yours faithfully|Best regards|Yours sincerely|Kind regards|Yours truly|Sincerely yours|Yours Strategically|Yours faithfully),?\s*[A-Z]*/i)[0].trim()
                          ) : (
                            <div className="h-64 flex flex-col items-center justify-center py-20 bg-[#f8fafc] rounded-3xl border border-dashed border-slate-200 opacity-20 select-none pointer-events-none">
                              <FileText className="w-16 h-16 mb-4" />
                              <p className="font-bold text-2xl uppercase tracking-[0.5em] italic">Preview Matrix</p>
                            </div>
                          )}
                       </div>

                       {/* Sign-off */}
                       {letterData.generatedContent && (
                          <div className="pt-24 pb-16 flex flex-col items-end">
                             <div className="w-1/2">
                                <p className="text-slate-900 font-bold text-sm tracking-widest uppercase mb-4">
                                  {(() => {
                                     const signOffs = ['Yours faithfully', 'Yours sincerely', 'Best regards', 'Kind regards', 'Yours truly', 'Sincerely yours', 'With professional regards', 'Respectfully yours'];
                                     const index = ((letterData.sender.name?.length || 0) + generationCount) % signOffs.length;
                                     return signOffs[index];
                                  })()},
                                </p>
                                
                                <div className="space-y-12 mt-6">
                                  <p className="text-slate-900 font-black text-lg uppercase tracking-tight">
                                    {letterData.sender.name || 'SENDER NAME'}
                                  </p>
                                  
                                  <div className="space-y-1">
                                    <div className="h-[2px] w-full bg-slate-900" />
                                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                       <span>Official Signature</span>
                                    </div>
                                  </div>
                                </div>
                             </div>
                          </div>
                       )}
                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Persistent Mode Switcher & Tools - HUD Style */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center p-1.5 bg-slate-900/95 backdrop-blur-2xl rounded-[32px] shadow-2xl z-40 border border-white/10 ring-8 ring-slate-900/10 gap-1">
             <button
                onClick={() => setViewMode('builder')}
                className={cn(
                  "px-8 py-4 rounded-[26px] text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all",
                  viewMode === 'builder' 
                    ? "bg-white text-slate-900 shadow-xl" 
                    : "text-slate-400 hover:text-white"
                )}
             >
                <Layout className="w-4 h-4" />
                Drafter View
             </button>
             <button
                onClick={() => setViewMode('preview')}
                className={cn(
                  "px-8 py-4 rounded-[26px] text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all",
                  viewMode === 'preview' 
                    ? "bg-primary-600 text-white shadow-xl shadow-primary-500/20" 
                    : "text-slate-400 hover:text-white"
                )}
             >
                <Eye className="w-4 h-4" />
                Final Preview
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
