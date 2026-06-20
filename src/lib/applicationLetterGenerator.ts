import { CVData } from '../types';

export function generateTemplateApplicationLetter(data: CVData): string {
  const { personalInfo, jobApplication, experiences, skills } = data;
  if (!jobApplication) return "";

  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const hiringManager = jobApplication.hiringManager || 'Hiring Manager';
  const companyName = jobApplication.companyName;
  const jobTitle = jobApplication.jobTitle;

  // Find most relevant experience (usually the first one)
  const latestExperience = experiences[0];
  const topSkills = skills.slice(0, 5).map(s => s.name).join(', ');

  return `${personalInfo.fullName}
${personalInfo.location} | ${personalInfo.email} | ${personalInfo.phone}
${personalInfo.socialLinks.map(link => `${link.platform}: ${link.url}`).join(' | ')}

${date}

${hiringManager}
${companyName}

Dear ${hiringManager},

I am writing to express my enthusiastic interest in the ${jobTitle} position at ${companyName}, as advertised. With my background in ${personalInfo.title} and a proven track record of delivering high-quality results, I am confident that my skills and experiences align perfectly with the requirements of this role.

${latestExperience ? `In my most recent role as a ${latestExperience.position} at ${latestExperience.company}, I ${latestExperience.description.split('\n')[0].replace('• ', '').toLowerCase() || 'contributed significantly to the team\'s success'}. This experience has allowed me to hone my expertise in areas critical to the ${jobTitle} position.` : ''}

Throughout my career, I have developed a strong foundation in ${topSkills}. I am particularly drawn to ${companyName} because of its reputation for excellence and innovation in the industry. I am eager to bring my unique perspective and technical proficiency to your team to help drive ${companyName}'s continued growth.

I have attached my CV for your review, which provides further detail on my professional achievements and qualifications. Thank you for your time and consideration. I look forward to the possibility of discussing how my background can contribute to the success of the ${companyName} team.

Sincerely,

${personalInfo.fullName}
`;
}
