import React, { useState, useEffect } from 'react';
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
  BarChart3,
  Menu,
  X,
  ChevronRight,
  Layers,
  UserCheck,
  Bot,
} from 'lucide-react';
import type { User } from 'firebase/auth';

interface NavbarProps {
  user: User | null;
  onSignIn: () => void;
  onInstantAgentSignIn?: () => void;
  onSignOut: () => void;
  onOpenNewSkill: () => void;
  onOpenMatcher: () => void;
  onOpenDriveBrowser: () => void;
  onToggleVectorStudio?: () => void;
  isVectorStudioActive?: boolean;
  onToggleMindMap?: () => void;
  isMindMapActive?: boolean;
  onToggleAnalytics?: () => void;
  isAnalyticsActive?: boolean;
  onToggleChat?: () => void;
  isChatOpen?: boolean;
  skillCount: number;
  isSyncing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onSignIn,
  onInstantAgentSignIn,
  onSignOut,
  onOpenNewSkill,
  onOpenMatcher,
  onOpenDriveBrowser,
  onToggleVectorStudio,
  isVectorStudioActive = false,
  onToggleMindMap,
  isMindMapActive = false,
  onToggleAnalytics,
  isAnalyticsActive = false,
  onToggleChat,
  isChatOpen = false,
  skillCount,
  isSyncing = false,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Helper to trigger navigation and auto-close drawer
  const handleAction = (action?: () => void) => {
    if (action) {
      action();
      setIsMobileMenuOpen(false);
    }
  };

  const hasAnyActiveStudio = isMindMapActive || isVectorStudioActive || isAnalyticsActive || isChatOpen;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md shadow-xs">
        {/* ROW 1: Primary Header Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & App Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-xl bg-linear-to-tr from-indigo-600 via-indigo-500 to-sky-400 p-0.5 shadow-md shadow-indigo-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <BrainCircuit className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-sm sm:text-base lg:text-lg tracking-tight text-slate-900 dark:text-white truncate">
                  Agent Engine
                </span>
                <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  SKILL.md
                </span>
                <span
                  className="hidden xl:inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                  title="Protected by Firebase App Check & Dave's reCAPTCHA v3"
                >
                  <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span>App Check</span>
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 hidden sm:block truncate">
                Ingestion Pipeline &amp; Meta-Skill Architecture
              </p>
            </div>
          </div>

          {/* DESKTOP Action Controls (hidden on < md screens) */}
          <div className="hidden md:flex items-center gap-1.5 lg:gap-2.5">
            {/* Interactive Mind Map & Author Studio Button */}
            {onToggleMindMap && (
              <button
                onClick={onToggleMindMap}
                className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 text-xs lg:text-sm font-medium rounded-lg transition-all shadow-xs cursor-pointer ${
                  isMindMapActive
                    ? 'bg-emerald-600 text-white shadow-emerald-500/25 shadow-md'
                    : 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/60'
                }`}
                title="Interactive Skill Architecture Mind Map & write-skill Authoring"
              >
                <GitBranch className="w-4 h-4 text-emerald-500" />
                <span className="hidden lg:inline">Mind Map &amp; Architect</span>
                <span className="lg:hidden">Mind Map</span>
              </button>
            )}

            {/* Vector Search & Memory Engine Button */}
            {onToggleVectorStudio && (
              <button
                onClick={onToggleVectorStudio}
                className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 text-xs lg:text-sm font-medium rounded-lg transition-all shadow-xs cursor-pointer ${
                  isVectorStudioActive
                    ? 'bg-purple-600 text-white shadow-purple-500/25 shadow-md'
                    : 'text-purple-700 dark:text-purple-300 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800/60'
                }`}
                title="Vector(768) tool selection & agent memories"
              >
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span className="hidden lg:inline">Vector &amp; Memories</span>
                <span className="lg:hidden">Vector</span>
              </button>
            )}

            {/* Analytics Dashboard Button */}
            {onToggleAnalytics && (
              <button
                onClick={onToggleAnalytics}
                className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 text-xs lg:text-sm font-medium rounded-lg transition-all shadow-xs cursor-pointer ${
                  isAnalyticsActive
                    ? 'bg-sky-600 text-white shadow-sky-500/25 shadow-md'
                    : 'text-sky-700 dark:text-sky-300 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 dark:hover:bg-sky-900/60 border border-sky-200 dark:border-sky-800/60'
                }`}
                title="Usage metrics, popular categories, and growth trends"
              >
                <BarChart3 className="w-4 h-4 text-sky-500" />
                <span>Analytics</span>
              </button>
            )}

            {/* Matcher Button */}
            <button
              onClick={onOpenMatcher}
              className="flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 text-xs lg:text-sm font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/60 rounded-lg transition-all shadow-xs cursor-pointer"
              title="Determine which skill is best for a job"
            >
              <Compass className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden xl:inline">Skill Matcher</span>
              <span className="xl:hidden">Matcher</span>
            </button>

            {/* Drive Browser Button */}
            <button
              onClick={onOpenDriveBrowser}
              className="flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 text-xs lg:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-lg transition-all cursor-pointer"
              title="Browse Google Drive skill packages"
            >
              <HardDrive className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden lg:inline">Drive Cloud</span>
            </button>

            {/* Gemini Chat Copilot Button */}
            {onToggleChat && (
              <button
                onClick={onToggleChat}
                className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 text-xs lg:text-sm font-medium rounded-lg transition-all shadow-xs cursor-pointer ${
                  isChatOpen
                    ? 'bg-linear-to-r from-indigo-600 to-emerald-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/60'
                }`}
                title="Chat with Gemini 3.8 Flash Skill Architect"
              >
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                <span className="hidden xl:inline">Gemini Copilot</span>
                <span className="xl:hidden">Copilot</span>
              </button>
            )}

            {/* New Skill Button */}
            <button
              onClick={onOpenNewSkill}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs lg:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg transition-all shadow-sm shadow-indigo-600/25 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Author Skill</span>
            </button>

            {/* Auth State Button */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div
                  className="hidden 2xl:flex flex-col text-right leading-none"
                  title={user.email || ''}
                >
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-32">
                    {user.displayName || 'Authorized Agent'}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate max-w-32">
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
              <div className="flex items-center gap-1.5 lg:gap-2">
                {onInstantAgentSignIn && (
                  <button
                    onClick={onInstantAgentSignIn}
                    className="flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700/80 rounded-lg text-xs lg:text-sm font-semibold text-emerald-700 dark:text-emerald-300 shadow-xs transition-all cursor-pointer"
                    title="1-Click Instant Agent Pass (isaiah9238@gmail.com) - Bypasses popups"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Agent Pass</span>
                  </button>
                )}
                <button
                  onClick={onSignIn}
                  className="flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs lg:text-sm font-medium text-slate-700 dark:text-slate-200 shadow-xs transition-all cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span className="hidden lg:inline">Sign in with Google</span>
                  <span className="lg:hidden">Google</span>
                </button>
              </div>
            )}
          </div>

          {/* MOBILE Header Quick Controls (visible on < md screens) */}
          <div className="flex md:hidden items-center gap-1.5 sm:gap-2">
            {/* Quick Copilot button */}
            {onToggleChat && (
              <button
                onClick={onToggleChat}
                className={`p-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isChatOpen
                    ? 'bg-linear-to-r from-indigo-600 to-emerald-600 text-white shadow-xs'
                    : 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800'
                }`}
                title="Gemini Copilot"
                aria-label="Toggle Gemini Copilot"
              >
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              </button>
            )}

            {/* Quick Author Skill CTA */}
            <button
              onClick={onOpenNewSkill}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-sm shadow-indigo-600/25 cursor-pointer"
              title="Author new skill"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Skill</span>
            </button>

            {/* User Avatar or Sign In icon on Mobile */}
            {user ? (
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="relative cursor-pointer"
                title={user.email || 'User Account'}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-7 h-7 rounded-full border border-indigo-500/50 shadow-xs"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-semibold">
                    {user.email ? user.email[0].toUpperCase() : 'U'}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-slate-900" />
              </button>
            ) : null}

            {/* Mobile Menu / Drawer Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className={`p-2 rounded-lg border transition-all cursor-pointer relative ${
                isMobileMenuOpen
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <>
                  <Menu className="w-4 h-4" />
                  {hasAnyActiveStudio && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-950 animate-pulse" />
                  )}
                </>
              )}
            </button>
          </div>
        </div>

        {/* ROW 2: Mobile Quick View Segmented Bar (Always accessible, zero-clip grid) */}
        <div className="block md:hidden border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/90 dark:bg-slate-900/90 px-3 py-1.5">
          <div className="grid grid-cols-4 gap-1.5 max-w-md mx-auto">
            {/* Mind Map */}
            {onToggleMindMap && (
              <button
                onClick={onToggleMindMap}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-1 px-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                  isMindMapActive
                    ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                    : 'text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/40'
                }`}
                title="Mind Map & Architect"
              >
                <GitBranch className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Mind Map</span>
              </button>
            )}

            {/* Vector */}
            {onToggleVectorStudio && (
              <button
                onClick={onToggleVectorStudio}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-1 px-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                  isVectorStudioActive
                    ? 'bg-purple-600 text-white shadow-xs font-semibold'
                    : 'text-purple-700 dark:text-purple-300 hover:bg-purple-100/60 dark:hover:bg-purple-950/40'
                }`}
                title="Vector & Memories"
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Vector</span>
              </button>
            )}

            {/* Stats / Analytics */}
            {onToggleAnalytics && (
              <button
                onClick={onToggleAnalytics}
                className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-1 px-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                  isAnalyticsActive
                    ? 'bg-sky-600 text-white shadow-xs font-semibold'
                    : 'text-sky-700 dark:text-sky-300 hover:bg-sky-100/60 dark:hover:bg-sky-950/40'
                }`}
                title="Analytics"
              >
                <BarChart3 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Stats</span>
              </button>
            )}

            {/* Matcher */}
            <button
              onClick={onOpenMatcher}
              className="flex flex-col sm:flex-row items-center justify-center gap-1 py-1 px-1 rounded-md text-[11px] font-medium text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100/60 dark:hover:bg-indigo-950/40 transition-all cursor-pointer"
              title="Skill Decision Matcher"
            >
              <Compass className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Matcher</span>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE SLIDE-OUT SIDEBAR / DRAWER MENU */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          {/* Backdrop Blur */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-out Panel */}
          <div className="relative w-full max-w-xs sm:max-w-sm bg-white dark:bg-slate-950 h-full shadow-2xl flex flex-col z-10 border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-250 ease-out overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/60">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-indigo-600 p-0.5 flex items-center justify-center text-white">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    Agent Studio Menu
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {skillCount} Skills Cataloged
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body - Organized into Structured Rows */}
            <div className="p-4 space-y-5 flex-1">
              {/* ROW 1: Studio Engines & Visualizers */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 block mb-2">
                  Studio Engines &amp; Workspaces
                </span>
                <div className="space-y-1.5">
                  {/* Mind Map */}
                  {onToggleMindMap && (
                    <button
                      onClick={() => handleAction(onToggleMindMap)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isMindMapActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700/80 text-emerald-900 dark:text-emerald-100 font-medium'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            isMindMapActive
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          <GitBranch className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold">Mind Map &amp; Architect</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            Visual DAG graph &amp; write-skill
                          </div>
                        </div>
                      </div>
                      {isMindMapActive ? (
                        <span className="text-[10px] font-semibold bg-emerald-600 text-white px-1.5 py-0.5 rounded-full">
                          Active
                        </span>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  )}

                  {/* Vector Engine */}
                  {onToggleVectorStudio && (
                    <button
                      onClick={() => handleAction(onToggleVectorStudio)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isVectorStudioActive
                          ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-700/80 text-purple-900 dark:text-purple-100 font-medium'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            isVectorStudioActive
                              ? 'bg-purple-600 text-white'
                              : 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400'
                          }`}
                        >
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold">Vector &amp; Memories</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            768-dim embeddings &amp; similarity
                          </div>
                        </div>
                      </div>
                      {isVectorStudioActive ? (
                        <span className="text-[10px] font-semibold bg-purple-600 text-white px-1.5 py-0.5 rounded-full">
                          Active
                        </span>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  )}

                  {/* Analytics */}
                  {onToggleAnalytics && (
                    <button
                      onClick={() => handleAction(onToggleAnalytics)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isAnalyticsActive
                          ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-300 dark:border-sky-700/80 text-sky-900 dark:text-sky-100 font-medium'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            isAnalyticsActive
                              ? 'bg-sky-600 text-white'
                              : 'bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400'
                          }`}
                        >
                          <BarChart3 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold">Analytics Dashboard</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            Metrics, breakdown &amp; trends
                          </div>
                        </div>
                      </div>
                      {isAnalyticsActive ? (
                        <span className="text-[10px] font-semibold bg-sky-600 text-white px-1.5 py-0.5 rounded-full">
                          Active
                        </span>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  )}

                  {/* Decision Matcher */}
                  <button
                    onClick={() => handleAction(onOpenMatcher)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                        <Compass className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          Skill Decision Matcher
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          Intelligent tool recommendation
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>

              {/* ROW 2: Cloud Tools & AI Assistant */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 block mb-2">
                  Cloud Tools &amp; Intelligence
                </span>
                <div className="space-y-1.5">
                  {/* Gemini Copilot */}
                  {onToggleChat && (
                    <button
                      onClick={() => handleAction(onToggleChat)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isChatOpen
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700/80 text-indigo-900 dark:text-indigo-100 font-medium'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-linear-to-tr from-amber-500 to-indigo-600 text-white">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold">Gemini Flash Copilot</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            Chat assistant &amp; skill generator
                          </div>
                        </div>
                      </div>
                      {isChatOpen ? (
                        <span className="text-[10px] font-semibold bg-indigo-600 text-white px-1.5 py-0.5 rounded-full">
                          Open
                        </span>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  )}

                  {/* Google Drive */}
                  <button
                    onClick={() => handleAction(onOpenDriveBrowser)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                        <HardDrive className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          Google Drive Cloud
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          Sync &amp; import package zips
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  {/* App Check Badge Card */}
                  <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <div>
                        <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          Firebase App Check
                        </div>
                        <div className="text-[10px] text-slate-500">reCAPTCHA v3 Active</div>
                      </div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                </div>
              </div>

              {/* ROW 3: Actions & Quick Creation */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 block mb-2">
                  Create &amp; Manage
                </span>
                <button
                  onClick={() => handleAction(onOpenNewSkill)}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-semibold text-xs shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Author New SKILL.md Package</span>
                </button>
              </div>
            </div>

            {/* Drawer Footer: User Profile & Authentication */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 mt-auto">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'User'}
                        className="w-10 h-10 rounded-full border border-indigo-500/50 shadow-xs"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                        {user.email ? user.email[0].toUpperCase() : 'U'}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {user.displayName || 'Authorized Agent'}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {onInstantAgentSignIn && (
                    <button
                      onClick={() => {
                        onInstantAgentSignIn();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>1-Click Agent Pass (isaiah9238)</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onSignIn();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2.5 py-2 px-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs transition-all cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                    <span>Sign in with Google</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
