import { CVData } from './types';

export const initialCVData: CVData = {
  personalInfo: {
    fullName: 'Alex Rivera',
    email: 'alex.rivera@example.com',
    phone: '+1 (555) 000-0000',
    location: 'San Francisco, CA',
    nationality: 'American',
    socialLinks: [
      { id: '1', platform: 'LinkedIn', url: 'linkedin.com/in/alexrivera' },
      { id: '2', platform: 'Portfolio', url: 'alexrivera.dev' }
    ],
    title: 'Senior Software Engineer',
    summary: 'Innovative Software Engineer with 8+ years of experience in building scalable web applications. Expert in React, Node.js, and Cloud Architecture. Proven track record of leading cross-functional teams to deliver high-quality products.',
  },
  experiences: [
    {
      id: '1',
      company: 'TechFlow Systems',
      position: 'Senior Software Engineer',
      location: 'Remote',
      startDate: '2021-03',
      endDate: '',
      current: true,
      description: '• Led the migration of a legacy monolithic application to a microservices architecture, improving system scalability by 40%.\n• Mentored 5 junior developers and implemented rigorous code review standards.\n• Optimized frontend performance, reducing initial load time by 1.5 seconds.',
    },
    {
      id: '2',
      company: 'Innovate AI',
      position: 'Full Stack Developer',
      location: 'San Francisco, CA',
      startDate: '2018-06',
      endDate: '2021-02',
      current: false,
      description: '• Developed and maintained multiple React-based dashboards for data visualization.\n• Integrated third-party APIs for seamless data synchronization across platforms.\n• Collaborated with UX designers to implement accessible and responsive UI components.',
    }
  ],
  education: [
    {
      id: '1',
      school: 'University of California, Berkeley',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      location: 'Berkeley, CA',
      startDate: '2014-09',
      endDate: '2018-05',
      current: false,
      description: 'Graduated with Honors. Specialized in Distributed Systems.',
      type: 'Higher',
    }
  ],
  skills: [
    { id: '1', name: 'React / Next.js', level: 'Expert' },
    { id: '2', name: 'TypeScript', level: 'Expert' },
    { id: '3', name: 'Node.js', level: 'Advanced' },
    { id: '4', name: 'AWS / Cloud', level: 'Advanced' },
    { id: '5', name: 'PostgreSQL', level: 'Advanced' },
    { id: '6', name: 'Tailwind CSS', level: 'Expert' },
  ],
  projects: [
    {
      id: '1',
      name: 'OpenSource UI Library',
      description: 'A comprehensive set of accessible React components with over 5k stars on GitHub.',
      link: 'github.com/alex/ui-lib',
      customFields: [
        { id: '1', label: 'Technologies Used', value: 'React, TypeScript, Tailwind' },
        { id: '2', label: 'Role in Project', value: 'Lead Maintainer' }
      ]
    }
  ],
  languages: [
    { id: '1', name: 'English', level: 'Native' },
    { id: '2', name: 'Spanish', level: 'Fluent' },
  ],
  theme: {
    primaryColor: '#0ea5e9', // primary-500
    accentColor: '#0369a1',  // primary-700
    backgroundColor: '#ffffff',
  },
  jobApplication: {
    companyName: '',
    jobTitle: '',
    jobDescription: '',
    hiringManager: ''
  },
  generatedApplicationLetter: ''
};
