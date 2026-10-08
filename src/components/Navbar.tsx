import React from 'react';
import {
  BrainCircuit,
  Cloud,
  Mail,
  HardDrive,
  Compass,
  Plus,
  LogOut,
  Sparkles,
  Database,
  CheckCircle2,
  ShieldCheck,
  GitBranch,
} from 'lucide-react';
import type { User } from 'firebase/auth';

interface NavbarProps {
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  onOpenNewSkill: () => void;
  onOpenMatcher: () => void;
  onOpenDriveBrowser: () => void;
  onToggleVectorStudio?: () => void;
  isVectorStudioActive?: boolean;
  onToggleMindMap?: () => void;
  isMindMapActive?: boolean;
  skillCount: number;
  isSyncing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onSignIn,
  onSignOut,
  onOpenNewSkill,
  onOpenMatcher,
  onOpenDriveBrowser,
  onToggleVectorStudio,
  isVectorStudioActive = false,
  onToggleMindMap,
  isMindMapActive = false,
  skillCount,
  isSyncing = false,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & App Title */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-0.5 shadow-md shadow-indigo-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white">
                Agent Engine
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                SKILL.md Registry
              </span>
              <span
                className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                title="Protected by Firebase App Check & Dave's reCAPTCHA v3"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>App Check</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Ingestion Pipeline &amp; Meta-Skill Architecture
            </p>
          </div>
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Interactive Mind Map & Author Studio Button */}
          {onToggleMindMap && (
            <button
              onClick={onToggleMindMap}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all shadow-xs cursor-pointer ${
                isMindMapActive
                  ? 'bg-emerald-600 text-white shadow-emerald-500/25 shadow-md'
                  : 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/60'
              }`}
              title="Interactive Skill Architecture Mind Map & write-skill Authoring"
            >
              <GitBranch className="w-4 h-4 text-emerald-500" />
              <span className="hidden md:inline">Mind Map &amp; Architect</span>
              <span className="md:hidden">Mind Map</span>
            </button>
          )}

          {/* Vector Search & Memory Engine Button */}
          {onToggleVectorStudio && (
            <button
              onClick={onToggleVectorStudio}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all shadow-xs cursor-pointer ${
                isVectorStudioActive
                  ? 'bg-purple-600 text-white shadow-purple-500/25 shadow-md'
                  : 'text-purple-700 dark:text-purple-300 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800/60'
              }`}
              title="Vector(768) tool selection & agent memories"
            >
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="hidden md:inline">Vector &amp; Memories</span>
              <span className="md:hidden">Vector</span>
            </button>
          )}

          {/* Matcher Button */}
          <button
            onClick={onOpenMatcher}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/60 rounded-lg transition-all shadow-xs cursor-pointer"
            title="Determine which skill is best for a job"
          >
            <Compass className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden md:inline">Skill Decision Matcher</span>
            <span className="md:hidden">Matcher</span>
          </button>

          {/* Drive Browser Button */}
          <button
            onClick={onOpenDriveBrowser}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-lg transition-all cursor-pointer"
            title="Browse Google Drive skill packages"
          >
            <HardDrive className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden lg:inline">Drive Cloud</span>
          </button>

          {/* New Skill Button */}
          <button
            onClick={onOpenNewSkill}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg transition-all shadow-sm shadow-indigo-600/25 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Author Skill</span>
          </button>

          {/* Auth State Button */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div
                className="hidden xl:flex flex-col text-right leading-none"
                title={user.email || ''}
              >
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                  {user.displayName || 'Authorized Agent'}
                </span>
                <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                  {user.email}
                </span>
              </div>
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-8 h-8 rounded-full border border-indigo-500/40 shadow-xs"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-semibold">
                  {user.email ? user.email[0].toUpperCase() : 'U'}
                </div>
              )}
              <button
                onClick={onSignOut}
                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onSignIn}
              className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 shadow-xs transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>Sign in with Google</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
