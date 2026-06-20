import React from 'react';
import { Mail, Phone, MapPin, Globe, Linkedin, ExternalLink } from 'lucide-react';
import { CVData, TemplateId } from '../types';
import { cn } from '../lib/utils';

interface PreviewProps {
  data: CVData;
  template: TemplateId;
  showApplicationLetter?: boolean;
  zoom?: number;
}

export default function Preview({ data, template, showApplicationLetter, zoom = 1 }: PreviewProps) {
  const { personalInfo, experiences, education, skills, projects, languages, theme } = data;

  const renderApplicationLetter = () => (
    <div 
      className="min-h-[1120px] w-full p-20 flex flex-col font-serif transition-colors duration-300 bg-white text-slate-900"
      style={{ backgroundColor: '#ffffff' }}
    >
      <div className="max-w-2xl mx-auto w-full space-y-12">
        {/* Header */}
        <header className="border-b-2 pb-8" style={{ borderColor: theme.primaryColor }}>
          <h1 className="text-4xl font-bold mb-2">{personalInfo.fullName}</h1>
          <div className="text-sm text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
            <span>{personalInfo.email}</span>
            <span>{personalInfo.phone}</span>
            <span>{personalInfo.location}</span>
            {personalInfo.socialLinks.map(link => (
              <span key={link.id}>{link.url}</span>
            ))}
          </div>
        </header>

        {/* Content */}
        <div className="text-base leading-relaxed whitespace-pre-wrap font-serif text-slate-800">
          {data.generatedApplicationLetter || "Generate your letter in the sidebar to see the preview here."}
        </div>

        {/* Footer */}
        <footer className="pt-12">
          <p className="font-bold">Sincerely,</p>
          <p className="mt-8 font-bold text-xl">{personalInfo.fullName}</p>
        </footer>
      </div>
    </div>
  );

  const renderModern = () => (
    <div 
      className="min-h-[1120px] w-full p-12 flex flex-col gap-8 font-sans transition-colors duration-300"
      style={{ backgroundColor: theme.backgroundColor }}
    >
      {/* Header */}
      <header className="pb-8 border-b-4 flex justify-between items-start" style={{ borderColor: theme.accentColor }}>
        <div className="flex-1">
          <h1 className="text-6xl font-display font-bold tracking-tight" style={{ color: theme.backgroundColor === '#0f172a' ? '#f8fafc' : '#0f172a' }}>{personalInfo.fullName}</h1>
          <p className="text-2xl font-bold mt-2" style={{ color: theme.primaryColor }}>{personalInfo.title}</p>
          
          <div className="flex flex-wrap gap-y-3 gap-x-8 mt-6 text-base font-medium" style={{ color: theme.backgroundColor === '#0f172a' ? '#94a3b8' : '#475569' }}>
            {personalInfo.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5" style={{ color: theme.primaryColor }} />
                {personalInfo.email}
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5" style={{ color: theme.primaryColor }} />
                {personalInfo.phone}
              </div>
            )}
            {personalInfo.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" style={{ color: theme.primaryColor }} />
                {personalInfo.location}
              </div>
            )}
            {personalInfo.nationality && (
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5" style={{ color: theme.primaryColor }} />
                {personalInfo.nationality}
              </div>
            )}
            {personalInfo.socialLinks.map((link) => (
              <div key={link.id} className="flex items-center gap-2">
                {link.platform.toLowerCase().includes('linkedin') ? (
                  <Linkedin className="w-5 h-5" style={{ color: theme.primaryColor }} />
                ) : (
                  <Globe className="w-5 h-5" style={{ color: theme.primaryColor }} />
                )}
                <span className="font-bold mr-1">{link.platform}:</span>
                {link.url}
              </div>
            ))}
          </div>
        </div>
        {personalInfo.photo && (
          <div className="w-32 h-32 rounded-xl overflow-hidden border-2 shadow-sm ml-6 flex-shrink-0" style={{ borderColor: theme.accentColor }}>
            <img src={personalInfo.photo} alt="Passport" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        )}
      </header>

      <div className="grid grid-cols-12 gap-12 flex-1">
        {/* Left Column */}
        <div className="col-span-8 space-y-10">
          {/* Summary */}
          {personalInfo.summary && (
            <section>
              <h2 className="text-xl font-display font-bold uppercase tracking-widest border-b-2 pb-2 mb-4" style={{ color: theme.backgroundColor === '#0f172a' ? '#f8fafc' : '#0f172a', borderColor: theme.backgroundColor === '#0f172a' ? '#1e293b' : '#e2e8f0' }}>Professional Summary</h2>
              <p className="leading-relaxed text-lg font-medium" style={{ color: theme.backgroundColor === '#0f172a' ? '#cbd5e1' : '#334155' }}>{personalInfo.summary}</p>
            </section>
          )}

          {/* Experience */}
          {experiences.length > 0 && (
            <section>
              <h2 className="text-xl font-display font-bold uppercase tracking-widest border-b-2 pb-2 mb-6" style={{ color: theme.backgroundColor === '#0f172a' ? '#f8fafc' : '#0f172a', borderColor: theme.backgroundColor === '#0f172a' ? '#1e293b' : '#e2e8f0' }}>Work Experience</h2>
              <div className="space-y-8">
                {experiences.map((exp) => (
                  <div key={exp.id} className="relative pl-6 border-l-4" style={{ borderColor: theme.backgroundColor === '#0f172a' ? '#1e293b' : '#f1f5f9' }}>
                    <div className="absolute -left-[11px] top-1.5 w-5 h-5 rounded-full border-2" style={{ backgroundColor: theme.backgroundColor, borderColor: theme.primaryColor }} />
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-xl" style={{ color: theme.backgroundColor === '#0f172a' ? '#f8fafc' : '#0f172a' }}>{exp.position}</h3>
                      <span className="text-sm font-bold px-3 py-1 rounded" style={{ color: theme.primaryColor, backgroundColor: `${theme.primaryColor}15` }}>
                        {exp.startDate} — {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    <div className="font-bold text-lg mb-3" style={{ color: theme.backgroundColor === '#0f172a' ? '#94a3b8' : '#475569' }}>{exp.company} • {exp.location}</div>
                    <p className="text-base leading-relaxed whitespace-pre-line font-medium" style={{ color: theme.backgroundColor === '#0f172a' ? '#cbd5e1' : '#334155' }}>{exp.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <section>
              <h2 className="text-lg font-display font-bold uppercase tracking-widest border-b pb-2 mb-4" style={{ color: theme.backgroundColor === '#0f172a' ? '#f8fafc' : '#0f172a', borderColor: theme.backgroundColor === '#0f172a' ? '#1e293b' : '#e2e8f0' }}>Key Projects</h2>
              <div className="grid grid-cols-1 gap-6">
                {projects.map((project) => (
                  <div key={project.id} className="p-5 rounded-lg border border-transparent transition-all" style={{ backgroundColor: theme.backgroundColor === '#0f172a' ? '#1e293b' : '#f8fafc' }}>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-lg" style={{ color: theme.backgroundColor === '#0f172a' ? '#f8fafc' : '#0f172a' }}>{project.name}</h3>
                      {project.link && (
                        <a href={`https://${project.link}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-bold" style={{ color: theme.primaryColor }}>
                          <ExternalLink className="w-3 h-3" />
                          View Project
                        </a>
                      )}
                    </div>
                    <p className="text-sm mb-3 leading-relaxed" style={{ color: theme.backgroundColor === '#0f172a' ? '#94a3b8' : '#64748b' }}>{project.description}</p>
                    
                    {project.customFields && project.customFields.length > 0 && (
                      <div className="flex flex-wrap gap-4 pt-3 border-t" style={{ borderColor: theme.backgroundColor === '#0f172a' ? '#334155' : '#e2e8f0' }}>
                        {project.customFields.map(field => (
                          <div key={field.id} className="flex flex-col">
                            <span className="text-[10px] font-black uppercase opacity-50 tracking-tighter" style={{ color: theme.backgroundColor === '#0f172a' ? '#94a3b8' : '#64748b' }}>{field.label}</span>
                            <span className="text-xs font-bold" style={{ color: theme.backgroundColor === '#0f172a' ? '#cbd5e1' : '#475569' }}>{field.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column */}
        <div className="col-span-4 space-y-10">
          {/* Skills */}
          {skills.length > 0 && (
            <section>
              <h2 className="text-lg font-display font-bold uppercase tracking-widest border-b pb-2 mb-4" style={{ color: theme.backgroundColor === '#0f172a' ? '#f8fafc' : '#0f172a', borderColor: theme.backgroundColor === '#0f172a' ? '#1e293b' : '#e2e8f0' }}>Skills</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span key={skill.id} className="px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider" style={{ backgroundColor: theme.backgroundColor === '#0f172a' ? '#1e293b' : '#f1f5f9', color: theme.backgroundColor === '#0f172a' ? '#cbd5e1' : '#475569' }}>
                    {skill.name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {education.length > 0 && (
            <section>
              <h2 className="text-lg font-display font-bold uppercase tracking-widest border-b pb-2 mb-4" style={{ color: theme.backgroundColor === '#0f172a' ? '#f8fafc' : '#0f172a', borderColor: theme.backgroundColor === '#0f172a' ? '#1e293b' : '#e2e8f0' }}>Education</h2>
              <div className="space-y-8">
                {(['Higher', 'NYSC', 'Secondary', 'Primary'] as const).map(type => {
                  const items = education.filter(e => e.type === type);
                  if (items.length === 0) return null;
                  return (
                    <div key={type} className="space-y-4">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50" style={{ color: theme.backgroundColor === '#0f172a' ? '#94a3b8' : '#64748b' }}>{type}</h3>
                      <div className="space-y-4">
                        {items.map((edu) => (
                          <div key={edu.id}>
                            <h4 className="font-bold text-sm" style={{ color: theme.backgroundColor === '#0f172a' ? '#f8fafc' : '#0f172a' }}>{edu.degree || edu.school}</h4>
                            {edu.field && <p className="text-xs font-bold mt-0.5" style={{ color: theme.primaryColor }}>{edu.field}</p>}
                            <p className="text-xs mt-1" style={{ color: theme.backgroundColor === '#0f172a' ? '#94a3b8' : '#64748b' }}>{edu.school} • {edu.location}</p>
                            <p className="text-[10px] mt-1 font-bold" style={{ color: theme.backgroundColor === '#0f172a' ? '#64748b' : '#94a3b8' }}>{edu.startDate} — {edu.endDate}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Languages */}
          {languages.length > 0 && (
            <section>
              <h2 className="text-lg font-display font-bold uppercase tracking-widest border-b pb-2 mb-4" style={{ color: theme.backgroundColor === '#0f172a' ? '#f8fafc' : '#0f172a', borderColor: theme.backgroundColor === '#0f172a' ? '#1e293b' : '#e2e8f0' }}>Languages</h2>
              <div className="space-y-3">
                {languages.map((lang) => (
                  <div key={lang.id} className="flex justify-between items-center">
                    <span className="text-sm font-bold" style={{ color: theme.backgroundColor === '#0f172a' ? '#cbd5e1' : '#475569' }}>{lang.name}</span>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => {
                        const levels = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Native'];
                        const levelIndex = levels.indexOf(lang.level);
                        return (
                          <div 
                            key={i} 
                            className="w-2 h-2 rounded-full" 
                            style={{ 
                              backgroundColor: i <= levelIndex ? theme.primaryColor : (theme.backgroundColor === '#0f172a' ? '#1e293b' : '#e2e8f0') 
                            }} 
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );

  const renderMinimal = () => (
    <div 
      className="min-h-[1120px] w-full p-16 flex flex-col gap-12 font-sans max-w-[800px] mx-auto transition-colors duration-300 relative"
      style={{ backgroundColor: theme.backgroundColor }}
    >
      {personalInfo.photo && (
        <div className="absolute top-12 right-12 w-24 h-24 rounded-full overflow-hidden border shadow-sm" style={{ borderColor: theme.backgroundColor === '#0f172a' ? '#1e293b' : '#e2e8f0' }}>
          <img src={personalInfo.photo} alt="Passport" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
      )}
      <header className="text-center space-y-4">
        <h1 className="text-5xl font-bold tracking-[0.2em] uppercase" style={{ color: theme.backgroundColor === '#0f172a' ? '#f8fafc' : '#0f172a' }}>{personalInfo.fullName}</h1>
        <p className="text-lg font-bold tracking-[0.3em] uppercase" style={{ color: theme.primaryColor }}>{personalInfo.title}</p>
        <div className="flex justify-center flex-wrap gap-6 text-xs font-bold uppercase tracking-widest pt-4" style={{ color: theme.backgroundColor === '#0f172a' ? '#64748b' : '#94a3b8' }}>
          <span>{personalInfo.email}</span>
          <span>•</span>
          <span>{personalInfo.location}</span>
          {personalInfo.nationality && (
            <>
              <span>•</span>
              <span>{personalInfo.nationality}</span>
            </>
          )}
          <span>•</span>
          <span>{personalInfo.phone}</span>
          {personalInfo.socialLinks.map((link) => (
            <React.Fragment key={link.id}>
              <span>•</span>
              <span>{link.platform}: {link.url}</span>
            </React.Fragment>
          ))}
        </div>
      </header>

      <div className="space-y-12">
        {personalInfo.summary && (
          <section className="text-center max-w-2xl mx-auto">
            <p className="leading-relaxed italic text-base font-medium" style={{ color: theme.backgroundColor === '#0f172a' ? '#cbd5e1' : '#475569' }}>"{personalInfo.summary}"</p>
          </section>
        )}

        <section>
          <h2 className="text-sm font-bold uppercase tracking-[0.4em] text-center mb-8" style={{ color: theme.backgroundColor === '#0f172a' ? '#f8fafc' : '#0f172a' }}>Experience</h2>
          <div className="space-y-10">
            {experiences.map((exp) => (
              <div key={exp.id} className="grid grid-cols-4 gap-8">
                <div className="text-right text-xs font-bold uppercase tracking-widest pt-1" style={{ color: theme.backgroundColor === '#0f172a' ? '#64748b' : '#94a3b8' }}>
                  {exp.startDate} — {exp.current ? 'Present' : exp.endDate}
                </div>
                <div className="col-span-3 space-y-2">
                  <h3 className="text-base font-bold uppercase tracking-wider" style={{ color: theme.backgroundColor === '#0f172a' ? '#f8fafc' : '#0f172a' }}>{exp.position}</h3>
                  <p className="text-sm font-bold uppercase tracking-widest" style={{ color: theme.primaryColor }}>{exp.company}, {exp.location}</p>
                  <p className="text-sm leading-relaxed whitespace-pre-line font-medium" style={{ color: theme.backgroundColor === '#0f172a' ? '#cbd5e1' : '#475569' }}>{exp.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-center mb-8" style={{ color: theme.backgroundColor === '#0f172a' ? '#f8fafc' : '#0f172a' }}>Education</h2>
          <div className="space-y-10">
            {(['Higher', 'NYSC', 'Secondary', 'Primary'] as const).map(type => {
              const items = education.filter(e => e.type === type);
              if (items.length === 0) return null;
              return (
                <div key={type} className="space-y-6">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.5em] text-center opacity-40" style={{ color: theme.backgroundColor === '#0f172a' ? '#94a3b8' : '#64748b' }}>{type}</h3>
                  <div className="space-y-6">
                    {items.map((edu) => (
                      <div key={edu.id} className="text-center">
                        <h4 className="text-sm font-bold uppercase tracking-wider" style={{ color: theme.backgroundColor === '#0f172a' ? '#f8fafc' : '#0f172a' }}>{edu.degree || edu.school} {edu.field ? `in ${edu.field}` : ''}</h4>
                        <p className="text-xs uppercase tracking-widest mt-1" style={{ color: theme.primaryColor }}>{edu.school} • {edu.location} | {edu.startDate} — {edu.endDate}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-center mb-6" style={{ color: theme.backgroundColor === '#0f172a' ? '#f8fafc' : '#0f172a' }}>Expertise</h2>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            {skills.map((skill) => (
              <span key={skill.id} className="text-[10px] uppercase tracking-widest border-b pb-1" style={{ color: theme.backgroundColor === '#0f172a' ? '#cbd5e1' : '#475569', borderColor: theme.backgroundColor === '#0f172a' ? '#1e293b' : '#f1f5f9' }}>
                {skill.name}
              </span>
            ))}
          </div>
        </section>

        {languages.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-center mb-6" style={{ color: theme.backgroundColor === '#0f172a' ? '#f8fafc' : '#0f172a' }}>Languages</h2>
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-4">
              {languages.map((lang) => (
                <div key={lang.id} className="flex flex-col items-center gap-2">
                  <span className="text-sm font-bold uppercase tracking-widest" style={{ color: theme.backgroundColor === '#0f172a' ? '#cbd5e1' : '#475569' }}>{lang.name}</span>
                  <div className="flex gap-1.5">
                    {[...Array(5)].map((_, i) => {
                      const levels = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Native'];
                      const levelIndex = levels.indexOf(lang.level);
                      return (
                        <div 
                          key={i} 
                          className="w-1.5 h-1.5 rounded-full" 
                          style={{ 
                            backgroundColor: i <= levelIndex ? theme.primaryColor : (theme.backgroundColor === '#0f172a' ? '#1e293b' : '#e2e8f0') 
                          }} 
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );

  const renderClassic = () => (
    <div 
      className="min-h-[1120px] w-full flex font-sans transition-colors duration-300"
      style={{ backgroundColor: theme.backgroundColor }}
    >
      {/* Sidebar */}
      <div className="w-1/3 p-10 space-y-10" style={{ backgroundColor: `${theme.primaryColor}10` }}>
        {personalInfo.photo && (
          <div className="w-40 h-40 mx-auto rounded-full overflow-hidden border-4 shadow-lg mb-8" style={{ borderColor: theme.primaryColor }}>
            <img src={personalInfo.photo} alt="Passport" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        )}
        
        <section className="space-y-4">
          <h2 className="text-base font-bold uppercase tracking-widest border-b-2 pb-1" style={{ color: theme.primaryColor, borderColor: theme.primaryColor }}>Contact</h2>
          <div className="space-y-3 text-sm font-bold" style={{ color: theme.backgroundColor === '#0f172a' ? '#cbd5e1' : '#475569' }}>
            {personalInfo.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {personalInfo.email}</div>}
            {personalInfo.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {personalInfo.phone}</div>}
            {personalInfo.location && <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {personalInfo.location}</div>}
            {personalInfo.nationality && <div className="flex items-center gap-2"><Globe className="w-4 h-4" /> {personalInfo.nationality}</div>}
            {personalInfo.socialLinks.map((link) => (
              <div key={link.id} className="flex items-center gap-2">
                {link.platform.toLowerCase().includes('linkedin') ? (
                  <Linkedin className="w-4 h-4" />
                ) : (
                  <Globe className="w-4 h-4" />
                )}
                {link.platform}: {link.url}
              </div>
            ))}
          </div>
        </section>

        {skills.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest border-b pb-1" style={{ color: theme.primaryColor, borderColor: theme.primaryColor }}>Skills</h2>
            <div className="space-y-2">
              {skills.map((skill) => (
                <div key={skill.id} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold uppercase" style={{ color: theme.backgroundColor === '#0f172a' ? '#cbd5e1' : '#475569' }}>
                    <span>{skill.name}</span>
                  </div>
                  <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full" 
                      style={{ 
                        backgroundColor: theme.primaryColor,
                        width: skill.level === 'Expert' ? '100%' : skill.level === 'Advanced' ? '75%' : skill.level === 'Intermediate' ? '50%' : '25%'
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {languages.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest border-b pb-1" style={{ color: theme.primaryColor, borderColor: theme.primaryColor }}>Languages</h2>
            <div className="space-y-3">
              {languages.map((lang) => (
                <div key={lang.id} className="flex justify-between items-center">
                  <span className="text-xs font-bold" style={{ color: theme.backgroundColor === '#0f172a' ? '#cbd5e1' : '#475569' }}>{lang.name}</span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => {
                      const levels = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Native'];
                      const levelIndex = levels.indexOf(lang.level);
                      return (
                        <div 
                          key={i} 
                          className="w-1.5 h-1.5 rounded-full" 
                          style={{ 
                            backgroundColor: i <= levelIndex ? theme.primaryColor : (theme.backgroundColor === '#0f172a' ? '#1e293b' : '#e2e8f0') 
                          }} 
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-12 space-y-10">
        <header className="space-y-2">
          <h1 className="text-5xl font-bold tracking-tight" style={{ color: theme.backgroundColor === '#0f172a' ? '#f8fafc' : '#0f172a' }}>{personalInfo.fullName}</h1>
          <p className="text-2xl font-medium" style={{ color: theme.primaryColor }}>{personalInfo.title}</p>
        </header>

        {personalInfo.summary && (
          <section className="space-y-4">
            <h2 className="text-2xl font-bold border-l-4 pl-4" style={{ color: theme.backgroundColor === '#0f172a' ? '#f8fafc' : '#0f172a', borderColor: theme.primaryColor }}>Profile</h2>
            <p className="leading-relaxed text-base font-medium" style={{ color: theme.backgroundColor === '#0f172a' ? '#cbd5e1' : '#334155' }}>{personalInfo.summary}</p>
          </section>
        )}

        {experiences.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-2xl font-bold border-l-4 pl-4" style={{ color: theme.backgroundColor === '#0f172a' ? '#f8fafc' : '#0f172a', borderColor: theme.primaryColor }}>Experience</h2>
            <div className="space-y-8">
              {experiences.map((exp) => (
                <div key={exp.id} className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-xl font-bold" style={{ color: theme.backgroundColor === '#0f172a' ? '#f8fafc' : '#0f172a' }}>{exp.position}</h3>
                    <span className="text-base font-bold" style={{ color: theme.primaryColor }}>{exp.startDate} — {exp.current ? 'Present' : exp.endDate}</span>
                  </div>
                  <div className="text-base font-bold italic" style={{ color: theme.backgroundColor === '#0f172a' ? '#94a3b8' : '#64748b' }}>{exp.company} • {exp.location}</div>
                  <p className="text-base leading-relaxed whitespace-pre-line font-medium" style={{ color: theme.backgroundColor === '#0f172a' ? '#cbd5e1' : '#334155' }}>{exp.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {education.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-xl font-bold border-l-4 pl-4" style={{ color: theme.backgroundColor === '#0f172a' ? '#f8fafc' : '#0f172a', borderColor: theme.primaryColor }}>Education</h2>
            <div className="space-y-8">
              {(['Higher', 'NYSC', 'Secondary', 'Primary'] as const).map(type => {
                const items = education.filter(e => e.type === type);
                if (items.length === 0) return null;
                return (
                  <div key={type} className="space-y-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-50" style={{ color: theme.backgroundColor === '#0f172a' ? '#94a3b8' : '#64748b' }}>{type}</h3>
                    <div className="grid grid-cols-2 gap-6">
                      {items.map((edu) => (
                        <div key={edu.id} className="space-y-1">
                          <h4 className="font-bold text-sm" style={{ color: theme.backgroundColor === '#0f172a' ? '#f8fafc' : '#0f172a' }}>{edu.degree || edu.school}</h4>
                          {edu.field && <p className="text-xs font-bold" style={{ color: theme.primaryColor }}>{edu.field}</p>}
                          <p className="text-xs" style={{ color: theme.backgroundColor === '#0f172a' ? '#94a3b8' : '#64748b' }}>{edu.school} • {edu.location} | {edu.startDate} — {edu.endDate}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );

  const renderCreative = () => (
    <div 
      className="min-h-[1120px] w-full p-12 font-sans transition-colors duration-300"
      style={{ backgroundColor: theme.backgroundColor }}
    >
      <div className="grid grid-cols-12 gap-8">
        {/* Header Block */}
        <header className="col-span-12 flex items-center gap-10 mb-12">
          {personalInfo.photo && (
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-40 h-40 border-4 z-0" style={{ borderColor: theme.accentColor }} />
              <div className="w-40 h-40 bg-slate-200 relative z-10 overflow-hidden shadow-xl">
                <img src={personalInfo.photo} alt="Passport" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-7xl font-black uppercase leading-none tracking-tighter mb-2" style={{ color: theme.backgroundColor === '#0f172a' ? '#f8fafc' : '#0f172a' }}>
              {personalInfo.fullName.split(' ')[0]}<br/>
              <span style={{ color: theme.primaryColor }}>{personalInfo.fullName.split(' ').slice(1).join(' ')}</span>
            </h1>
            <p className="text-xl font-bold uppercase tracking-[0.3em]" style={{ color: theme.backgroundColor === '#0f172a' ? '#64748b' : '#94a3b8' }}>{personalInfo.title}</p>
          </div>
        </header>

        {/* Left Column */}
        <div className="col-span-4 space-y-12">
          <section className="p-6 rounded-3xl" style={{ backgroundColor: `${theme.primaryColor}15` }}>
            <h2 className="text-xs font-black uppercase tracking-widest mb-6" style={{ color: theme.primaryColor }}>Contact Info</h2>
            <div className="space-y-4 text-base" style={{ color: theme.backgroundColor === '#0f172a' ? '#cbd5e1' : '#334155' }}>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase opacity-50">Email</span>
                <span className="font-bold break-all">{personalInfo.email}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase opacity-50">Phone</span>
                <span className="font-bold">{personalInfo.phone}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase opacity-50">Location</span>
                <span className="font-bold">{personalInfo.location}</span>
              </div>
              {personalInfo.nationality && (
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase opacity-50">Nationality</span>
                  <span className="font-bold">{personalInfo.nationality}</span>
                </div>
              )}
              {personalInfo.socialLinks.map((link) => (
                <div key={link.id} className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase opacity-50">{link.platform}</span>
                  <span className="font-bold break-all">{link.url}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2" style={{ color: theme.backgroundColor === '#0f172a' ? '#f8fafc' : '#0f172a' }}>
              <span className="w-8 h-1" style={{ backgroundColor: theme.primaryColor }} />
              Expertise
            </h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span key={skill.id} className="px-4 py-2 text-[10px] font-black uppercase border-2 transition-all hover:scale-110 cursor-default" style={{ borderColor: theme.primaryColor, color: theme.backgroundColor === '#0f172a' ? '#f8fafc' : '#0f172a' }}>
                  {skill.name}
                </span>
              ))}
            </div>
          </section>

          {languages.length > 0 && (
            <section>
              <h2 className="text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2" style={{ color: theme.backgroundColor === '#0f172a' ? '#f8fafc' : '#0f172a' }}>
                <span className="w-8 h-1" style={{ backgroundColor: theme.primaryColor }} />
                Languages
              </h2>
              <div className="space-y-4">
                {languages.map((lang) => (
                  <div key={lang.id} className="flex flex-col gap-2">
                    <span className="text-sm font-bold" style={{ color: theme.backgroundColor === '#0f172a' ? '#cbd5e1' : '#334155' }}>{lang.name}</span>
                    <div className="flex gap-1.5">
                      {[...Array(5)].map((_, i) => {
                        const levels = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Native'];
                        const levelIndex = levels.indexOf(lang.level);
                        return (
                          <div 
                            key={i} 
                            className="w-2 h-2 rounded-full" 
                            style={{ 
                              backgroundColor: i <= levelIndex ? theme.primaryColor : (theme.backgroundColor === '#0f172a' ? '#1e293b' : '#e2e8f0') 
                            }} 
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column */}
        <div className="col-span-8 space-y-12">
          {personalInfo.summary && (
            <section>
              <p className="text-2xl font-medium leading-tight italic" style={{ color: theme.backgroundColor === '#0f172a' ? '#cbd5e1' : '#334155' }}>
                "{personalInfo.summary}"
              </p>
            </section>
          )}

          <section>
            <h2 className="text-xs font-black uppercase tracking-widest mb-8 flex items-center gap-4" style={{ color: theme.backgroundColor === '#0f172a' ? '#f8fafc' : '#0f172a' }}>
              <span className="text-4xl font-black opacity-10">01</span>
              Experience
              <div className="flex-1 h-px bg-slate-200" />
            </h2>
            <div className="space-y-10">
              {experiences.map((exp) => (
                <div key={exp.id} className="grid grid-cols-4 gap-6">
                  <div className="text-xs font-black uppercase opacity-50 pt-1">
                    {exp.startDate} — {exp.current ? 'Now' : exp.endDate}
                  </div>
                  <div className="col-span-3 space-y-3">
                    <div>
                      <h3 className="text-xl font-black uppercase" style={{ color: theme.backgroundColor === '#0f172a' ? '#f8fafc' : '#0f172a' }}>{exp.position}</h3>
                      <p className="text-sm font-bold" style={{ color: theme.primaryColor }}>{exp.company} / {exp.location}</p>
                    </div>
                    <p className="text-sm leading-relaxed opacity-80" style={{ color: theme.backgroundColor === '#0f172a' ? '#cbd5e1' : '#334155' }}>{exp.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xs font-black uppercase tracking-widest mb-8 flex items-center gap-4" style={{ color: theme.backgroundColor === '#0f172a' ? '#f8fafc' : '#0f172a' }}>
              <span className="text-4xl font-black opacity-10">02</span>
              Education
              <div className="flex-1 h-px bg-slate-200" />
            </h2>
            <div className="space-y-8">
              {(['Higher', 'NYSC', 'Secondary', 'Primary'] as const).map(type => {
                const items = education.filter(e => e.type === type);
                if (items.length === 0) return null;
                return (
                  <div key={type} className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest opacity-30" style={{ color: theme.backgroundColor === '#0f172a' ? '#94a3b8' : '#64748b' }}>{type}</h3>
                    <div className="grid grid-cols-2 gap-8">
                      {items.map((edu) => (
                        <div key={edu.id} className="space-y-2">
                          <h4 className="text-lg font-black uppercase" style={{ color: theme.backgroundColor === '#0f172a' ? '#f8fafc' : '#0f172a' }}>{edu.degree || edu.school}</h4>
                          {edu.field && <p className="text-sm font-bold" style={{ color: theme.primaryColor }}>{edu.field}</p>}
                          <p className="text-[10px] font-black uppercase opacity-50">{edu.school} • {edu.location} | {edu.startDate} — {edu.endDate}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );

  const getTemplate = () => {
    if (showApplicationLetter) return renderApplicationLetter();
    switch (template) {
      case 'modern': return renderModern();
      case 'minimal': return renderMinimal();
      case 'classic': return renderClassic();
      case 'creative': return renderCreative();
      default: return renderModern();
    }
  };

  return (
    <div className="w-full h-full flex overflow-auto pb-20 no-scrollbar items-start group">
      <div 
        className="relative transition-all duration-500 flex-shrink-0 mx-auto"
        style={{ 
          width: `${850 * zoom}px`,
          minHeight: `${1120 * zoom}px`,
        }}
      >
        <div 
          className="relative transition-all duration-500 flex-shrink-0"
          style={{ 
            width: '850px',
            minWidth: '850px',
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
          }}
        >
          <div id="cv-preview" className="w-[850px] min-h-[1120px] shadow-2xl bg-white origin-top overflow-hidden">
            {getTemplate()}
          </div>

          {/* Responsive scaling and rendering fixes */}
          <style dangerouslySetInnerHTML={{ __html: `
            #cv-preview * {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              text-rendering: optimizeLegibility;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            #cv-preview {
              -webkit-text-size-adjust: 100%;
              text-size-adjust: 100%;
            }
          `}} />
        </div>
      </div>
    </div>
  );
}
