import { CVData } from '../types';

export function calculateCompletionScore(data: CVData): number {
  let score = 0;

  // Personal Info (Max 30)
  if (data.personalInfo.fullName.trim()) score += 5;
  if (data.personalInfo.email.trim()) score += 5;
  if (data.personalInfo.phone.trim()) score += 5;
  if (data.personalInfo.location.trim()) score += 5;
  if (data.personalInfo.title.trim()) score += 5;
  
  const summaryLength = data.personalInfo.summary.trim().length;
  if (summaryLength > 100) score += 5;
  else if (summaryLength > 20) score += 3;

  // Experience (Max 30)
  if (data.experiences.length > 0) {
    score += 10;
    const hasDescriptions = data.experiences.every(exp => exp.description.trim().length > 30);
    if (hasDescriptions) score += 20;
    else if (data.experiences.some(exp => exp.description.trim().length > 10)) score += 10;
  }

  // Education (Max 20)
  if (data.education.length > 0) {
    score += 10;
    const hasDetails = data.education.every(edu => edu.school.trim() && edu.degree.trim());
    if (hasDetails) score += 10;
  }

  // Skills (Max 10)
  if (data.skills.length >= 3) score += 10;
  else if (data.skills.length > 0) score += 5;

  // Projects/Languages (Max 10)
  if (data.projects.length > 0 || data.languages.length > 0) score += 10;

  return score;
}
