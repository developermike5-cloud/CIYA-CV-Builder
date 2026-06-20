import React from 'react';
import { motion } from 'motion/react';
import { Plus, FileText } from 'lucide-react';
import { cn } from '../lib/utils';

interface Question {
  id: string;
  question: string;
  placeholder: string;
}

interface SituationalSectionProps {
  activeType: string;
  situationalQuestions: Record<string, Question[]>;
  situationalAnswers: Record<string, string>;
  onAnswerChange: (id: string, value: string) => void;
}

export const SituationalSection: React.FC<SituationalSectionProps> = ({
  activeType,
  situationalQuestions,
  situationalAnswers,
  onAnswerChange,
}) => {
  if (!activeType || !situationalQuestions[activeType]) return null;

  return (
    <motion.section 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-primary-600 p-8 md:p-12 rounded-[48px] shadow-2xl shadow-primary-200 space-y-8"
    >
       <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
             <Plus className="w-5 h-5 text-primary-200" />
             Strategic Details
           </h4>
           <p className="text-[10px] text-primary-200 mt-1 font-bold uppercase tracking-wider">Help us tailor your {activeType} perfectly</p>
          </div>
       </div>

       <div className="grid grid-cols-1 gap-6">
         {situationalQuestions[activeType].map((q) => (
           <div key={q.id} className="space-y-3 bg-white/10 px-6 py-5 rounded-[28px] border border-white/10 focus-within:bg-white/20 focus-within:ring-2 focus-within:ring-white transition-all">
              <label className="text-[10px] font-black text-primary-100 block uppercase tracking-[0.2em]">{q.question}</label>
              <input
                 type="text"
                 placeholder={q.placeholder}
                 className="w-full bg-transparent text-sm focus:outline-none font-bold text-white placeholder:text-white/40"
                 value={situationalAnswers[q.id] || ''}
                 onChange={(e) => onAnswerChange(q.id, e.target.value)}
              />
           </div>
         ))}
       </div>
    </motion.section>
  );
};
