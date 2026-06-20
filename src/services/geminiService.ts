import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini in the frontend as per skill guidelines
// The platform provides GEMINI_API_KEY in the environment
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("GEMINI_API_KEY is missing. AI features will use fallbacks.");
}
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

let isQuotaExceeded = false;
let quotaResetTime = 0;

function checkQuota() {
  if (isQuotaExceeded && Date.now() < quotaResetTime) {
    throw new Error("QUOTA_EXCEEDED");
  }
  if (isQuotaExceeded && Date.now() >= quotaResetTime) {
    isQuotaExceeded = false;
  }
}

function handleQuotaError(error: any) {
  const errorMessage = error?.message || String(error);
  if (errorMessage.includes("429") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
    isQuotaExceeded = true;
    quotaResetTime = Date.now() + 60000; // 1 minute cooldown
    throw new Error("QUOTA_EXCEEDED");
  }
  throw error;
}

export async function enhanceText(text: string, type: 'summary' | 'experience' | 'skill', industry?: string, title?: string) {
  if (!ai) {
    return text;
  }
  
  checkQuota();
  
  try {
    const industryContext = industry ? `Industry: ${industry}` : '';
    const titleContext = title ? `Target Role: ${title}` : '';

    const templates = {
      summary: [
        `Write a results-oriented professional summary. ${industryContext} ${titleContext} Base: ${text}. Focus on quantifiable achievements and strategic impact.`,
        `Create a high-level executive summary. ${industryContext} ${titleContext} Base: ${text}. Emphasize leadership, vision, and core competencies.`,
        `Draft a modern, punchy professional bio. ${industryContext} ${titleContext} Base: ${text}. Use industry-specific keywords and a confident tone.`
      ],
      experience: [
        `Transform these points into high-impact bullet points using the STAR method. ${industryContext} ${titleContext} Points: ${text}. Focus on metrics and specific outcomes.`,
        `Rewrite these job responsibilities as professional achievements. ${industryContext} ${titleContext} Points: ${text}. Use strong action verbs and industry terminology.`,
        `Optimize these experience descriptions for Applicant Tracking Systems (ATS). ${industryContext} ${titleContext} Points: ${text}. Incorporate relevant keywords naturally.`
      ],
      skill: [
        `Suggest a more professional way to list this skill. Skill: ${text}. Return only the optimized name.`,
        `Group this skill with related industry technologies. Skill: ${text}. Return a concise professional label.`
      ]
    };

    const selectedTemplates = templates[type];
    const prompt = selectedTemplates[Math.floor(Math.random() * selectedTemplates.length)];
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `${prompt}\n\nRequirements:\n- RETURN ONLY THE FINAL TEXT.\n- NO INTRODUCTIONS OR EXPLANATIONS.`
    });
    
    let enhancedText = response.text.trim();
    enhancedText = enhancedText.replace(/^(Here is|I have|Sure|Certainly).*?:/i, '').trim();
    return enhancedText;
  } catch (error: any) {
    console.error("Error enhancing text:", error);
    handleQuotaError(error);
    return text;
  }
}

export async function getTailoredSuggestions(industry: string, section: string, currentText: string) {
  if (!ai || !currentText) return "";
  
  checkQuota();
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Industry: ${industry}\nSection: ${section}\nContent: ${currentText}\nSuggest 3-5 specific keywords or phrases that would make this content more professional. Return only a comma-separated list.`
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Error getting tailored suggestions:", error);
    try {
      handleQuotaError(error);
    } catch (e) {
      // Ignore quota error for suggestions to avoid breaking UI
    }
    return "";
  }
}

let lastScoreCall = 0;
const scoreCache: Record<string, any> = {};

export async function calculateCVScore(data: any, industry: string) {
  if (!ai) {
    return null;
  }

  checkQuota();

  const { theme, ...scoreRelevantData } = data;
  const cacheKey = `${industry}_${JSON.stringify(scoreRelevantData)}`;
  
  if (scoreCache[cacheKey]) {
    return scoreCache[cacheKey];
  }

  try {
    lastScoreCall = Date.now();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an expert CV reviewer for the ${industry} industry. 
      Analyze the following CV data and provide:
      1. A quality score (0-100) based on content impact, professional language, and industry relevance.
      2. 3-5 specific, actionable improvement tips.
      3. A brief 1-2 sentence analysis of the CV's strengths and weaknesses.
      
      CV Data: ${JSON.stringify(scoreRelevantData)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            tips: { type: Type.ARRAY, items: { type: Type.STRING } },
            analysis: { type: Type.STRING }
          },
          required: ["score", "tips", "analysis"]
        }
      }
    });
    
    const result = JSON.parse(response.text);
    scoreCache[cacheKey] = result;
    return result;
  } catch (error: any) {
    console.error("Error calculating CV score:", error);
    handleQuotaError(error);
    return null;
  }
}

export async function generateProfessionalLetter(letterData: any) {
  if (!ai) {
    return "AI generation is currently unavailable. Please try again later.";
  }

  checkQuota();

  try {
    const { sender, recipient, content } = letterData;
    const prompt = `Write a high-quality ${content.type} letter.
    Category: ${content.category}
    Tone: ${content.tone}
    
    SENDER DETAILS:
    Name: ${sender.name}
    Address: ${sender.address}
    Email: ${sender.email}
    Phone: ${sender.phone}
    
    RECIPIENT DETAILS:
    Name: ${recipient.name}
    Title: ${recipient.title}
    Company: ${recipient.company}
    Address: ${recipient.address}
    
    CORE MESSAGE/DETAILS:
    ${content.details}
    
    SUBJECT LINE:
    ${content.subject || `Professional Correspondence: ${content.type}`}
    
    REQUIREMENTS:
    - Return ONLY the letter body including address, date, salutation, body, and closing.
    - DO NOT include placeholders like [Your Name] if the information is provided.
    - Ensure the branding and tone match the "${content.tone}" style.
    - Use professional structure and grammar.
    - If it's a "Scholarship" or "Visa Application", make it persuasive and highlight the necessity.
    - If it's a "Resignation", make it professional and grateful.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });

    return response.text.trim();
  } catch (error: any) {
    console.error("Error generating letter:", error);
    handleQuotaError(error);
    return "Failed to generate letter. Please check your connection and try again.";
  }
}

export async function parseCVText(rawText: string) {
  if (!ai) {
    throw new Error("AI parsing is currently unavailable. Please check your API key.");
  }

  checkQuota();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an expert ATS (Applicant Tracking System) parser. Extract the CV information from the provided raw text and output a highly structured JSON object matching the requested schema. Ensure dates, names, bullet points, and skills are extracted intelligently. If any data is missing from the text, return empty strings or empty arrays instead of making up information.
      
      Extract into the following structure:
      - personalInfo: fullName, email, phone, location, nationality, summary, title
      - experiences: array of objects with company, position, location, startDate, endDate, current (boolean), description
      - education: array of objects with school, degree, field, location, startDate, endDate, current (boolean), description, type ("Primary", "Secondary", "Higher", or "NYSC")
      - skills: array of objects with name, level ("Beginner", "Intermediate", "Advanced", or "Expert")
      - projects: array of objects with name, description, link
      - languages: array of objects with name, level (string like "Native", "Fluent", "Basic")
      
      Raw CV Text:
      ${rawText}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            personalInfo: {
              type: Type.OBJECT,
              properties: {
                fullName: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                location: { type: Type.STRING },
                nationality: { type: Type.STRING },
                summary: { type: Type.STRING },
                title: { type: Type.STRING }
              }
            },
            experiences: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  company: { type: Type.STRING },
                  position: { type: Type.STRING },
                  location: { type: Type.STRING },
                  startDate: { type: Type.STRING },
                  endDate: { type: Type.STRING },
                  current: { type: Type.BOOLEAN },
                  description: { type: Type.STRING }
                }
              }
            },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  school: { type: Type.STRING },
                  degree: { type: Type.STRING },
                  field: { type: Type.STRING },
                  location: { type: Type.STRING },
                  startDate: { type: Type.STRING },
                  endDate: { type: Type.STRING },
                  current: { type: Type.BOOLEAN },
                  description: { type: Type.STRING },
                  type: { type: Type.STRING }
                }
              }
            },
            skills: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  level: { type: Type.STRING }
                }
              }
            },
            projects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  link: { type: Type.STRING }
                }
              }
            },
            languages: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  level: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const result = JSON.parse(response.text);
    return result;
  } catch (error: any) {
    console.error("Error parsing CV text:", error);
    handleQuotaError(error);
    throw new Error("Failed to parse CV text. Please try again or check your input.");
  }
}
