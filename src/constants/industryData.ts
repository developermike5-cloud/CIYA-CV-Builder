import { Industry } from '../types';

export const industrySkills: Record<Industry, string[]> = {
  technology: ['React', 'TypeScript', 'Node.js', 'AWS', 'Docker', 'Kubernetes', 'Python', 'System Design', 'Agile', 'Git'],
  healthcare: ['Patient Care', 'Electronic Health Records (EHR)', 'Medical Terminology', 'HIPAA Compliance', 'Clinical Research', 'First Aid/CPR', 'Diagnostics', 'Phlebotomy'],
  finance: ['Financial Analysis', 'Accounting', 'Risk Management', 'Taxation', 'Auditing', 'Excel (VBA)', 'Investment Banking', 'Portfolio Management', 'Financial Reporting'],
  education: ['Curriculum Development', 'Classroom Management', 'Lesson Planning', 'Educational Technology', 'Special Education', 'Student Assessment', 'Public Speaking', 'Mentoring'],
  creative: ['Adobe Creative Suite', 'UI/UX Design', 'Graphic Design', 'Video Editing', 'Motion Graphics', 'Branding', 'Photography', 'Typography', 'Copywriting'],
  engineering: ['AutoCAD', 'SolidWorks', 'Project Management', 'Structural Analysis', 'MATLAB', 'Lean Manufacturing', 'Quality Control', 'Technical Drawing', 'Thermodynamics'],
  sales: ['CRM (Salesforce)', 'Negotiation', 'Lead Generation', 'Market Research', 'Account Management', 'Public Relations', 'Strategic Planning', 'Customer Success'],
  hospitality: ['Customer Service', 'Event Planning', 'Food & Beverage Management', 'Hotel Operations', 'Front Office', 'Inventory Management', 'Multilingual', 'Conflict Resolution'],
  legal: ['Legal Research', 'Contract Drafting', 'Litigation Support', 'Corporate Law', 'Intellectual Property', 'Compliance', 'Case Management', 'Mediation'],
  marketing: ['SEO/SEM', 'Content Marketing', 'Social Media Strategy', 'Google Analytics', 'Email Marketing', 'Brand Management', 'Market Analysis', 'PPC Advertising'],
  manufacturing: ['Supply Chain Management', 'Inventory Control', 'Six Sigma', 'Production Planning', 'Safety Management', 'Logistics', 'Procurement', 'Operations Management'],
  retail: ['Merchandising', 'Point of Sale (POS)', 'Loss Prevention', 'Store Operations', 'Customer Relations', 'Visual Merchandising', 'Stock Management', 'Sales Forecasting'],
  transportation: ['Fleet Management', 'Route Optimization', 'Safety Regulations', 'Logistics Planning', 'Supply Chain Coordination', 'Warehouse Management', 'Dispatching'],
  government: ['Public Policy', 'Administrative Law', 'Grant Writing', 'Community Outreach', 'Public Administration', 'Intergovernmental Relations', 'Budgeting', 'Strategic Communications'],
  'non-profit': ['Fundraising', 'Volunteer Management', 'Donor Relations', 'Program Evaluation', 'Advocacy', 'Community Development', 'Event Coordination', 'Strategic Partnerships'],
  'real-estate': ['Property Management', 'Real Estate Appraisal', 'Leasing', 'Market Valuation', 'Contract Negotiation', 'Investment Analysis', 'Zoning Laws', 'Client Relations']
};

export const industryKeywords: Record<Industry, string[]> = {
  technology: ['Scalability', 'Microservices', 'Full-stack', 'Cloud-native', 'DevOps', 'CI/CD', 'Architecture', 'Optimization'],
  healthcare: ['Compassionate', 'Evidence-based', 'Multi-disciplinary', 'Quality-of-care', 'Patient-centered', 'Regulatory', 'Clinical'],
  finance: ['Compliance', 'Profitability', 'Forecasting', 'Quantitative', 'Strategic', 'Fiduciary', 'Analytical', 'Fiscal'],
  education: ['Pedagogy', 'Inclusive', 'Differentiated', 'Engagement', 'Collaborative', 'Formative', 'Holistic', 'Literacy'],
  creative: ['Conceptual', 'Aesthetic', 'Innovative', 'Visual-identity', 'User-centric', 'Storytelling', 'Portfolio', 'Digital-media'],
  engineering: ['Technical-specifications', 'Efficiency', 'Sustainability', 'Precision', 'Compliance', 'Prototyping', 'R&D', 'Safety'],
  sales: ['Revenue-growth', 'Conversion', 'Pipeline', 'B2B/B2C', 'Market-penetration', 'Retention', 'Competitive-analysis'],
  hospitality: ['Guest-experience', 'Service-excellence', 'Operational-efficiency', 'Cultural-competency', 'Luxury', 'Concierge'],
  legal: ['Jurisprudence', 'Due-diligence', 'Regulatory-compliance', 'Advocacy', 'Arbitration', 'Statutory', 'Ethical'],
  marketing: ['Brand-awareness', 'ROI', 'Engagement-metrics', 'Segmentation', 'Omnichannel', 'Campaign-optimization', 'Growth-hacking'],
  manufacturing: ['Operational-excellence', 'Quality-assurance', 'Continuous-improvement', 'JIT', 'Workflow-optimization', 'Kaizen'],
  retail: ['Customer-loyalty', 'Sales-targets', 'Inventory-turnover', 'Consumer-behavior', 'Upselling', 'Point-of-purchase'],
  transportation: ['Last-mile', 'Logistics-efficiency', 'Safety-standards', 'Supply-chain-visibility', 'Freight-management', 'Compliance'],
  government: ['Public-service', 'Policy-implementation', 'Civic-engagement', 'Transparency', 'Accountability', 'Legislative'],
  'non-profit': ['Mission-driven', 'Social-impact', 'Stakeholder-engagement', 'Sustainability', 'Philanthropy', 'Community-impact'],
  'real-estate': ['Market-trends', 'Portfolio-diversification', 'Asset-management', 'Closing-ratio', 'Property-valuation', 'Leasing-strategy']
};

export const industryCompanies: Record<Industry, string[]> = {
  technology: ['TechFlow Systems', 'Innovate AI', 'CloudScale Solutions'],
  healthcare: ['City General Hospital', 'Wellness Medical Center', 'HealthFirst Clinic'],
  finance: ['Global Asset Management', 'Prime Financial Services', 'Secure Bank Corp'],
  education: ['Metropolitan University', 'Greenwood High School', 'EduTech Institute'],
  creative: ['Vibrant Media Group', 'Design Studio X', 'Creative Pulse Agency'],
  engineering: ['Precision Engineering Ltd', 'BuildRight Construction', 'Global Infrastructure Group'],
  sales: ['MarketReach Corp', 'SalesForce Partners', 'Growth Dynamics'],
  hospitality: ['Grand Plaza Hotel', 'Ocean View Resort', 'Elite Catering Services'],
  legal: ['Justice & Partners', 'Legal Shield Associates', 'Corporate Law Group'],
  marketing: ['BrandBoost Agency', 'Digital Edge Marketing', 'Social Wave Media'],
  manufacturing: ['Industrial Pro Systems', 'Quality Goods Factory', 'Global Supply Corp'],
  retail: ['Fashion Hub Stores', 'Daily Needs Supermarket', 'Urban Style Retail'],
  transportation: ['Swift Logistics', 'Global Freight Services', 'City Transit Authority'],
  government: ['Department of Public Works', 'City Administration Office', 'National Health Agency'],
  'non-profit': ['Global Impact Foundation', 'Community Care Org', 'Green Earth Initiative'],
  'real-estate': ['Elite Property Group', 'Urban Living Realty', 'Prime Estate Partners']
};

export const industryProjects: Record<Industry, { name: string, description: string }[]> = {
  technology: [
    { name: 'OpenSource UI Library', description: 'A comprehensive set of accessible React components with over 5k stars on GitHub.' },
    { name: 'AI Chatbot Integration', description: 'Developed a custom AI chatbot for customer support using NLP and machine learning.' }
  ],
  healthcare: [
    { name: 'Community Wellness Initiative', description: 'Led a city-wide program for preventative health, reaching over 5,000 residents with essential screenings.' },
    { name: 'Clinical Quality Improvement', description: 'Optimized patient discharge processes which reduced hospital readmission rates by 15%.' }
  ],
  finance: [
    { name: 'Strategic Wealth Management Plan', description: 'Developed a $10M investment strategy for a high-net-worth client, achieving a 12% annual return.' },
    { name: 'Corporate Financial Restructuring', description: 'Led the financial turnaround of a struggling regional business, restoring profitability within 18 months.' }
  ],
  education: [
    { name: 'Inclusive Curriculum Design', description: 'Developed a K-12 curriculum focused on neurodiversity and inclusive learning environments.' },
    { name: 'Student Mentorship Program', description: 'Established a peer-to-peer coaching network that improved student retention by 20%.' }
  ],
  creative: [
    { name: 'Global Brand Identity', description: 'Developed a comprehensive brand identity and visual language for a sustainable fashion startup.' },
    { name: 'Interactive Exhibition Design', description: 'Designed an immersive physical exhibition for a major national museum of history.' }
  ],
  engineering: [
    { name: 'Sustainable Bridge Design', description: 'Led the structural design of a pedestrian bridge using 100% recycled materials and solar lighting.' },
    { name: 'Industrial Facility Expansion', description: 'Managed the $25M expansion of a manufacturing plant, increasing capacity by 40%.' }
  ],
  sales: [
    { name: 'Market Expansion Strategy', description: 'Developed and executed a successful strategy for expanding retail operations into the European market.' },
    { name: 'Client Retention Program', description: 'Created a new account management framework that reduced client churn by 25%.' }
  ],
  hospitality: [
    { name: 'Luxury Resort Launch', description: 'Managed the successful pre-opening and launch of a new 5-star luxury resort and spa.' },
    { name: 'Guest Experience Program', description: 'Developed a new service excellence program that increased guest satisfaction scores to 98%.' }
  ],
  legal: [
    { name: 'Corporate Compliance Audit', description: 'Led a comprehensive compliance audit for a Fortune 500 company, ensuring 100% regulatory alignment.' },
    { name: 'Intellectual Property Strategy', description: 'Developed a global IP protection strategy for a major pharmaceutical firm\'s new product line.' }
  ],
  marketing: [
    { name: 'Viral Social Media Campaign', description: 'Led a social media campaign that reached over 10M users and drove significant brand awareness.' },
    { name: 'Consumer Behavior Study', description: 'Conducted a deep-dive study into consumer buying habits to inform a new product launch.' }
  ],
  manufacturing: [
    { name: 'Lean Production Implementation', description: 'Successfully implemented lean production principles in a major factory, reducing waste by 30%.' },
    { name: 'Global Supply Chain Optimization', description: 'Optimized the global supply chain to reduce lead times and improve material flow.' }
  ],
  retail: [
    { name: 'Flagship Store Launch', description: 'Managed the opening of a new 20,000 sq ft flagship store in a premier urban location.' },
    { name: 'Customer Loyalty Program', description: 'Developed a new loyalty program that increased customer lifetime value by 20%.' }
  ],
  transportation: [
    { name: 'Logistics Network Optimization', description: 'Optimized a regional logistics network to reduce delivery times and fuel consumption.' },
    { name: 'Electric Fleet Transition', description: 'Led the strategic transition of the company\'s delivery fleet to 100% electric vehicles.' }
  ],
  government: [
    { name: 'Public Infrastructure Project', description: 'Managed a $50M project to revitalize urban public spaces and improve community access.' },
    { name: 'Public Health Campaign', description: 'Developed a national public health campaign to promote wellness and preventative care.' }
  ],
  'non-profit': [
    { name: 'Global Fundraising Gala', description: 'Organized a successful fundraising gala that raised over $1M for clean water initiatives.' },
    { name: 'Community Impact Study', description: 'Led a study to measure the social impact of the organization\'s programs on local youth.' }
  ],
  'real-estate': [
    { name: 'Sustainable Housing Project', description: 'Led the development of a new sustainable housing project focused on affordable living.' },
    { name: 'Urban Redevelopment Plan', description: 'Developed a comprehensive plan for redeveloping a major urban area into a mixed-use hub.' }
  ]
};

export const nigerianNames = [
  'Oluwaseun Adebayo',
  'Chinedu Okeke',
  'Amina Abubakar',
  'Femi Balogun',
  'Ngozi Eze',
  'Ibrahim Danjuma',
  'Tunde Williams',
  'Chioma Adeleke',
  'Babajide Sanwo',
  'Zainab Yusuf',
  'Kelechi Iheanacho',
  'Funmilayo Ransome',
  'Yakubu Gowon',
  'Adenike Adeyemi',
  'Chukwuma Soludo',
  'Bilikisu Abdullahi',
  'Segun Arinze',
  'Uche Jombo',
  'Musa Aliyu',
  'Onyekachi Okafor',
  'Bolaji Amusan',
  'Fatima Mohammed',
  'Emeka Anyanwu',
  'Folashade Omolara',
  'Jubril Aminu'
];

export const nigerianUniversities = [
  'University of Lagos (UNILAG)',
  'University of Ibadan (UI)',
  'Obafemi Awolowo University (OAU)',
  'Ahmadu Bello University (ABU)',
  'University of Nigeria, Nsukka (UNN)',
  'Covenant University',
  'Babcock University',
  'Lagos State University (LASU)',
  'University of Port Harcourt (UNIPORT)',
  'Bayero University Kano (BUK)',
  'University of Benin (UNIBEN)',
  'Nnamdi Azikiwe University (UNIZIK)',
  'Federal University of Technology, Akure (FUTA)',
  'Federal University of Technology, Minna (FUTMINNA)',
  'Ilorin University (UNILORIN)'
];
