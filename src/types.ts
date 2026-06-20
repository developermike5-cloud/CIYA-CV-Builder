export interface Experience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export type EducationType = 'Primary' | 'Secondary' | 'Higher' | 'NYSC';

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  type: EducationType;
}

export interface Skill {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export interface ProjectCustomField {
  id: string;
  label: string;
  value: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  link: string;
  customFields: ProjectCustomField[];
}

export interface CVData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    nationality: string;
    socialLinks: {
      id: string;
      platform: string;
      url: string;
    }[];
    title: string;
    summary: string;
    photo?: string;
  };
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  languages: {
    id: string;
    name: string;
    level: string; // Keep as string for compatibility, but we'll use a visual selector
  }[];
  theme: {
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
  };
  jobApplication?: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    hiringManager?: string;
  };
  generatedApplicationLetter?: string;
}

export type TemplateId = 'modern' | 'classic' | 'minimal' | 'creative';

export type Industry = 'technology' | 'healthcare' | 'finance' | 'education' | 'creative' | 'engineering' | 'sales' | 'hospitality' | 'legal' | 'marketing' | 'manufacturing' | 'retail' | 'transportation' | 'government' | 'non-profit' | 'real-estate';

export type LetterCategory = 'Professional' | 'Academic' | 'Business' | 'Travel' | 'Tenant' | 'Landlord' | 'Real Estate Agency';

export type LetterType = 
  | 'Job Application' 
  | 'Internship Application' 
  | 'Resignation' 
  | 'Salary Increase' 
  | 'Leave Request'
  | 'Admission Application' 
  | 'Scholarship Application' 
  | 'Recommendation'
  | 'Business Proposal' 
  | 'Formal Request' 
  | 'Complaint'
  | 'Inquiry'
  | 'Visa Application' 
  | 'Rent Payment Confirmation'
  | 'Notice to Vacate'
  | 'State of Amenities Complaint'
  | 'Maintenance Request'
  | 'Rent Reduction Request'
  | 'Quit/Eviction Notice'
  | 'Rent Increase Notice'
  | 'Rent Reminder'
  | 'Tenancy Agreement Letter'
  | 'Property Warning Letter'
  | 'Property Listing Proposal'
  | 'Client Follow-up'
  | 'Property Offer Letter'
  | 'Agency Agreement Letter';

export interface LetterData {
  sender: {
    name: string;
    email: string;
    phone: string;
    address: string;
    title: string;
  };
  recipient: {
    name: string;
    title: string;
    company: string;
    address: string;
  };
  content: {
    type: LetterType;
    category: LetterCategory;
    subject: string;
    details: string; // Specific details for generation
    tone: 'Professional' | 'Persuasive' | 'Empathetic' | 'Direct';
    situationalAnswers: Record<string, string>;
  };
  generatedContent?: string;
  generatedVersions?: {
    short: string;
    detailed: string;
    email: string;
  };
}
