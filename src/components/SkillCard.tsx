import React from 'react';
import {
  FileCode,
  Layers,
  Sparkles,
  ExternalLink,
  HardDrive,
  Mail,
  Edit3,
  Trash2,
  CheckCircle2,
  FileText,
  Sliders,
  BookmarkCheck,
} from 'lucide-react';
import type { SkillRecord } from '../types/skill';

interface SkillCardProps {
  skill: SkillRecord;
  onSelect: (skill: SkillRecord) => void;
  onEdit: (skill: SkillRecord) => void;
  onExportDrive: (skill: SkillRecord) => void;
  onShareGmail: (skill: SkillRecord) => void;
  onDelete?: (skillId: string) => void;
}

export const SkillCard: React.FC<SkillCardProps> = ({
  skill,
  onSelect,
  onEdit,
  onExportDrive,
  onShareGmail,
  onDelete,
}) => {
  let paramCount = 0;
  let codeCount = 0;
  let refCount = 0;
  let exCount = 0;

  try {
    if (skill.parameters) paramCount = JSON.parse(skill.parameters).length;
    if (skill.codeFiles) codeCount = Object.keys(JSON.parse(skill.codeFiles)).length;
    if (skill.references) refCount = JSON.parse(skill.references).length;
    if (skill.examples) exCount = JSON.parse(skill.examples).length;
  } catch (e) {
    // ignore
  }

  const categoryColors: Record<string, string> = {
    'security-audit': 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    'orchestration': 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    'workflow-automation': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    'math-geometry': 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    'system-tool': 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    'meta-engineering': 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  };

  const badgeClass =
    categoryColors[skill.category] ||
    'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';

  const clearanceClass =
    skill.securityClearance === 'admin-only'
      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400 border-rose-300'
      : skill.securityClearance === 'internal'
      ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400 border-amber-300'
      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';

  return (
    <div className="group relative flex flex-col justify-between bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-2xl p-5 shadow-xs hover:shadow-lg transition-all duration-200">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${badgeClass}`}>
              {skill.category}
            </span>
            {skill.securityClearance && (
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase ${clearanceClass}`}>
                {skill.securityClearance}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
              v{skill.version}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                skill.status === 'verified' || skill.status === 'published'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              {skill.status}
            </span>
          </div>
        </div>

        {/* Runtime & Executable pill */}
        <div className="flex items-center gap-2 mb-2">
          {skill.isExecutable ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Executable Tool ({skill.runtime?.toUpperCase() || 'IN_PROCESS'})
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Knowledge Protocol
            </span>
          )}
          {skill.sourceReferences && skill.sourceReferences.length > 0 && (
            <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-mono">
              • Notebook Linked
            </span>
          )}
        </div>

        {/* Skill Title & Slug */}
        <h3
          onClick={() => onSelect(skill)}
          className="text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 cursor-pointer"
        >
          {skill.title}
        </h3>
        <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 mt-0.5 mb-2.5">
          {skill.name}.SKILL.md
        </p>

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mb-4">
          {skill.description}
        </p>

        {/* Metric Tags */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-3 border-y border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5" title="Declared Schema Parameters">
            <Sliders className="w-3.5 h-3.5 text-indigo-500" />
            <span>{paramCount} params</span>
          </div>
          <div className="flex items-center gap-1.5" title="Associated Code Files">
            <FileCode className="w-3.5 h-3.5 text-sky-500" />
            <span>{codeCount} code</span>
          </div>
          <div className="flex items-center gap-1.5" title="In-Context Examples">
            <BookmarkCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>{exCount} examples</span>
          </div>
          <div className="flex items-center gap-1.5" title="Theoretical References">
            <FileText className="w-3.5 h-3.5 text-amber-500" />
            <span>{refCount} refs</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-2 flex items-center justify-between gap-2">
        <button
          onClick={() => onSelect(skill)}
          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Inspect Skill</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onExportDrive(skill)}
            className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
            title="Export to Google Drive"
          >
            <HardDrive className="w-4 h-4" />
          </button>
          <button
            onClick={() => onShareGmail(skill)}
            className="p-1.5 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded-lg transition-colors cursor-pointer"
            title="Share via Gmail"
          >
            <Mail className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(skill)}
            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors cursor-pointer"
            title="Edit Skill Specification"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete(skill.id)}
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
              title="Delete Skill"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
