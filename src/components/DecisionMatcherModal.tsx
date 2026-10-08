import React, { useState } from 'react';
import {
  X,
  Compass,
  Search,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Zap,
  Sliders,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import type { SkillRecord, SkillMatchResult } from '../types/skill';
import { evaluateBestSkillForJob } from '../services/skillRepository';

interface DecisionMatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  skills: SkillRecord[];
  onSelectSkill: (skill: SkillRecord) => void;
}

const PRESET_SCENARIOS = [
  {
    title: 'Edge Neuromorphic & Landauer Limits',
    query: 'We need to design a low-power edge neural network and calculate Landauer dissipation limits for bit erasures at 300K.',
  },
  {
    title: 'Autonomous Meta-Skill Authoring',
    query: 'The agent needs to create a new SKILL.md file for web scraping and generate an ingestion pipeline summary JSON.',
  },
  {
    title: 'Google Drive Sync & Gmail Sharing',
    query: 'Backup our verified skill definitions to Google Drive and send an email notification to engineering.',
  },
  {
    title: 'Multi-Task Intent Routing',
    query: 'Analyze the incoming complex user prompt and decide which skill in the registry should handle it.',
  },
];

export const DecisionMatcherModal: React.FC<DecisionMatcherModalProps> = ({
  isOpen,
  onClose,
  skills,
  onSelectSkill,
}) => {
  const [queryText, setQueryText] = useState('');
  const [results, setResults] = useState<SkillMatchResult[]>([]);
  const [hasEvaluated, setHasEvaluated] = useState(false);

  if (!isOpen) return null;

  const handleEvaluate = (inputQuery?: string) => {
    const q = inputQuery !== undefined ? inputQuery : queryText;
    if (!q.trim()) return;
    const evaluated = evaluateBestSkillForJob(q, skills);
    setResults(evaluated);
    setHasEvaluated(true);
  };

  const handleSelectPreset = (scenarioQuery: string) => {
    setQueryText(scenarioQuery);
    handleEvaluate(scenarioQuery);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Skill Decision Engine: &ldquo;Which Skill is Best for the Job?&rdquo;</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Determines the most optimal registered capability using semantic scoring, parameter compatibility, and ingestion summary rules.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/50 space-y-6">
          {/* Query Box */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Describe the Incoming Job or Agent Goal:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <textarea
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handleEvaluate();
                    }
                  }}
                  rows={2}
                  placeholder="e.g. The user wants to optimize low-power inference on edge neuromorphic hardware and measure Landauer bit erasure limits..."
                  className="w-full px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
              <button
                type="button"
                onClick={() => handleEvaluate()}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-all cursor-pointer self-stretch"
              >
                <Sparkles className="w-4 h-4" />
                <span>Arbitrate</span>
              </button>
            </div>

            {/* Presets */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                Quick Evaluation Scenarios:
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESET_SCENARIOS.map((scenario, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectPreset(scenario.query)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-400 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer text-left"
                  >
                    ⚡ {scenario.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Display */}
          {hasEvaluated && (
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Ranking &amp; Fit Assessment ({results.length} Candidates Evaluated)
                </h3>
              </div>

              {results.length > 0 ? (
                <div className="space-y-3">
                  {results.map((res, index) => {
                    const matchedSkill = skills.find((s) => s.id === res.skillId);
                    const isTopPick = index === 0 && res.score > 35;

                    return (
                      <div
                        key={res.skillId}
                        className={`p-4 rounded-xl border transition-all ${
                          isTopPick
                            ? 'bg-white dark:bg-slate-900 border-indigo-400 dark:border-indigo-500 shadow-md ring-1 ring-indigo-500/20'
                            : 'bg-white/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {isTopPick && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white flex items-center gap-1 shadow-xs">
                                  <Sparkles className="w-3 h-3" />
                                  OPTIMAL SKILL CHOICE
                                </span>
                              )}
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                  res.confidence === 'High'
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                    : res.confidence === 'Medium'
                                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                }`}
                              >
                                {res.confidence} Confidence ({res.score}%)
                              </span>
                              <span className="text-xs font-mono text-slate-400">
                                {res.skillName}
                              </span>
                            </div>

                            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                              {res.skillTitle}
                            </h4>

                            <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1 font-medium">
                              {res.fitAssessment}
                            </p>

                            {/* Reasoning Breakdown */}
                            <div className="mt-3 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs space-y-1">
                              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                                Ingestion Decision Log:
                              </span>
                              {res.reasons.map((r, rIdx) => (
                                <div key={rIdx} className="flex items-start gap-1.5 text-slate-600 dark:text-slate-300">
                                  <span className="text-indigo-500">•</span>
                                  <span>{r}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {matchedSkill && (
                            <button
                              onClick={() => {
                                onSelectSkill(matchedSkill);
                                onClose();
                              }}
                              className="px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/80 dark:hover:bg-indigo-900/80 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                            >
                              <span>View Skill</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-500">
                  No registered skills matched your query.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
