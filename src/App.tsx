/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import {
  Search,
  Filter,
  Sparkles,
  Plus,
  Compass,
  HardDrive,
  Database,
  ShieldCheck,
  Cpu,
  BookOpen,
  Layers,
  Zap,
  Terminal,
  RefreshCw,
  FolderGit2,
  GitBranch,
} from 'lucide-react';
import type { SkillRecord, SkillStatus } from './types/skill';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
} from './services/firebase';
import {
  fetchAllSkills,
  subscribeToSkills,
  saveSkill,
  deleteSkill,
} from './services/skillRepository';
import { Navbar } from './components/Navbar';
import { SkillCard } from './components/SkillCard';
import { SkillDetailModal } from './components/SkillDetailModal';
import { SkillEditorModal } from './components/SkillEditorModal';
import { DecisionMatcherModal } from './components/DecisionMatcherModal';
import { WorkspaceExportModal } from './components/WorkspaceExportModal';
import { DriveBrowserModal } from './components/DriveBrowserModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { VectorSearchStudio } from './components/VectorSearchStudio';
import { MindMapStudio } from './components/MindMapStudio';
import { GeminiChatBot } from './components/GeminiChatBot';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [skills, setSkills] = useState<SkillRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Gemini Chat Bot Floating Copilot
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Main View Navigation: Registry vs Mind Map vs Vector Engine
  const [activeMainView, setActiveMainView] = useState<'registry' | 'mindmap' | 'vector'>('registry');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedRuntime, setSelectedRuntime] = useState<string>('All');
  const [selectedClearance, setSelectedClearance] = useState<string>('All');

  // Active Modals
  const [selectedSkill, setSelectedSkill] = useState<SkillRecord | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillRecord | null>(null);
  const [isMatcherOpen, setIsMatcherOpen] = useState(false);
  const [isDriveBrowserOpen, setIsDriveBrowserOpen] = useState(false);
  const [isVectorStudioActive, setIsVectorStudioActive] = useState(false);

  // Workspace Export Modal
  const [exportModalSkill, setExportModalSkill] = useState<SkillRecord | null>(null);
  const [exportModalMode, setExportModalMode] = useState<'drive' | 'gmail'>('drive');

  // Deletion Modal
  const [skillToDeleteId, setSkillToDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Routing State for dedicated /privacy and /terms endpoints
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname;
      if (p === '/privacy' || p === '/terms') return p;
      if (window.location.hash === '#/privacy') return '/privacy';
      if (window.location.hash === '#/terms') return '/terms';
    }
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname;
      if (p === '/privacy' || p === '/terms') {
        setCurrentPath(p);
      } else if (window.location.hash === '#/privacy') {
        setCurrentPath('/privacy');
      } else if (window.location.hash === '#/terms') {
        setCurrentPath('/terms');
      } else {
        setCurrentPath('/');
      }
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  const navigateTo = (path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Initialize Auth
  useEffect(() => {
    const unsubscribeAuth = initAuth(
      async (authedUser, token) => {
        setUser(authedUser);
        const resolvedToken = token || (await getAccessToken());
        setAccessToken(resolvedToken);
      },
      () => {
        setUser(null);
        setAccessToken(null);
      }
    );

    return () => {
      if (unsubscribeAuth) unsubscribeAuth();
    };
  }, []);

  // Sync skills when user / auth state changes
  useEffect(() => {
    let unsubscribeFirestore: (() => void) | null = null;

    if (user) {
      setIsLoading(true);
      fetchAllSkills().then((initial) => {
        setSkills(initial);
        setIsLoading(false);
      });

      unsubscribeFirestore = subscribeToSkills(
        (updatedSkills) => {
          setSkills(updatedSkills);
          setIsLoading(false);
        },
        (err) => {
          console.warn('Realtime subscription fallback:', err);
          setIsLoading(false);
        }
      );
    } else {
      // Unauthenticated: load seed skills immediately without Firestore network blocking
      fetchAllSkills().then((initial) => {
        setSkills(initial);
        setIsLoading(false);
      });
    }

    return () => {
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, [user]);

  const handleSignIn = async () => {
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
  };

  const handleSaveSkill = async (newSkill: SkillRecord) => {
    await saveSkill(newSkill);
    setSkills((prev) => {
      const idx = prev.findIndex((s) => s.id === newSkill.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = newSkill;
        return next;
      }
      return [newSkill, ...prev];
    });
  };

  const executeConfirmedDeleteSkill = async () => {
    if (!skillToDeleteId) return;
    setIsDeleting(true);
    try {
      await deleteSkill(skillToDeleteId);
      setSkills((prev) => prev.filter((s) => s.id !== skillToDeleteId));
      if (selectedSkill?.id === skillToDeleteId) setSelectedSkill(null);
      setSkillToDeleteId(null);
    } catch (err: any) {
      console.error('Failed to delete skill:', err);
      alert(`Delete failed: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenExport = (skill: SkillRecord, mode: 'drive' | 'gmail') => {
    setExportModalSkill(skill);
    setExportModalMode(mode);
  };

  // Filter skills
  const filteredSkills = skills.filter((skill) => {
    const matchesSearch =
      skill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || skill.category === selectedCategory;

    const matchesStatus =
      selectedStatus === 'All' || skill.status === selectedStatus;

    const matchesRuntime =
      selectedRuntime === 'All' || (skill.runtime || 'in_process') === selectedRuntime;

    const matchesClearance =
      selectedClearance === 'All' || (skill.securityClearance || 'public') === selectedClearance;

    return matchesSearch && matchesCategory && matchesStatus && matchesRuntime && matchesClearance;
  });

  const handleApplyAiSkillMarkdown = (markdown: string) => {
    // Generate draft skill from Gemini-generated markdown
    const draftSkill: SkillRecord = {
      id: `ai-skill-${Date.now().toString(36)}`,
      name: 'ai_draft_skill',
      title: 'AI Drafted Skill',
      description: 'Drafted by Gemini Skill Architect Copilot',
      category: 'orchestration',
      version: '1.0.0',
      authorId: user?.uid || 'system-agent',
      authorEmail: user?.email || 'isaiah9238@gmail.com',
      status: 'draft',
      isPublic: true,
      securityClearance: 'public',
      isExecutable: true,
      runtime: 'in_process',
      skillMarkdown: markdown,
      summaryJson: '{}',
      parameters: '[]',
      examples: '[]',
      references: '[]',
      dependencies: '[]',
      codeFiles: '{}',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditingSkill(draftSkill);
    setIsEditorOpen(true);
  };

  const categories = Array.from(new Set(['All', ...skills.map((s) => s.category)]));

  if (currentPath === '/privacy') {
    return <PrivacyPolicy onBack={() => navigateTo('/')} />;
  }

  if (currentPath === '/terms') {
    return <TermsOfService onBack={() => navigateTo('/')} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500/20">
      {/* Top Navbar */}
      <Navbar
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        onOpenNewSkill={() => {
          setEditingSkill(null);
          setIsEditorOpen(true);
        }}
        onOpenMatcher={() => setIsMatcherOpen(true)}
        onOpenDriveBrowser={() => setIsDriveBrowserOpen(true)}
        onToggleMindMap={() =>
          setActiveMainView((prev) => (prev === 'mindmap' ? 'registry' : 'mindmap'))
        }
        isMindMapActive={activeMainView === 'mindmap'}
        onToggleVectorStudio={() =>
          setActiveMainView((prev) => (prev === 'vector' ? 'registry' : 'vector'))
        }
        isVectorStudioActive={activeMainView === 'vector'}
        onToggleChat={() => setIsChatOpen((prev) => !prev)}
        isChatOpen={isChatOpen}
        skillCount={skills.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Workspace Mode Switcher: Registry Grid vs Mind Map Architect vs Vector Engine */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveMainView('registry')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeMainView === 'registry'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Skill Registry Catalog ({skills.length})</span>
            </button>

            <button
              onClick={() => setActiveMainView('mindmap')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeMainView === 'mindmap'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/80'
              }`}
            >
              <GitBranch className="w-4 h-4 text-emerald-500" />
              <span>Interactive Mind Map &amp; Architect</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-200 font-mono">
                write-skill
              </span>
            </button>

            <button
              onClick={() => setActiveMainView('vector')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeMainView === 'vector'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800/80'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>Vector Database &amp; Storage Engine</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 font-mono">
                Vector(768)
              </span>
            </button>
          </div>
        </div>

        {activeMainView === 'mindmap' && (
          <MindMapStudio
            onSaveSkillToFirestore={async (newSkill) => {
              await saveSkill(newSkill);
              setSkills((prev) => [newSkill, ...prev.filter((s) => s.id !== newSkill.id)]);
            }}
            onNavigateToRegistry={() => setActiveMainView('registry')}
          />
        )}

        {activeMainView === 'vector' && (
          <VectorSearchStudio
            skills={skills}
            currentUserId={user?.uid}
            currentUserEmail={user?.email || undefined}
            onSelectSkill={(s) => setSelectedSkill(s)}
          />
        )}

        {activeMainView === 'registry' && (
          <>
            {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 sm:p-10 shadow-2xl text-white">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-10 w-72 h-72 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-mono font-medium">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>SKILL.md Registration System &amp; Ingestion Pipeline</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Agent Engine Skill Registry
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
              A high-precision database and authoring studio for autonomous agent capabilities.
              Every registered skill packages executable code, invocation schemas, in-context examples,
              and a pre-parsed summary JSON for instantaneous ingestion pipeline routing.
            </p>

            {/* Feature Pills */}
            <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-slate-300">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                <span>Firestore ABAC Persistence</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
                <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                <span>Google Drive Cloud Sync</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
                <Zap className="w-3.5 h-3.5 text-sky-400" />
                <span>Gmail Distribution Digests</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>Semantic Skill Matcher</span>
              </div>
            </div>
          </div>
        </section>

        {/* Search, Filter & Quick Stats Toolbar */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search registered skills by title, identifier, tags, or description..."
                className="w-full pl-10 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-800 dark:text-slate-100 shadow-xs"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-600 dark:text-slate-300 shadow-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent border-none focus:outline-hidden font-medium cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c} value={c} className="dark:bg-slate-900">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-600 dark:text-slate-300 shadow-xs">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-transparent border-none focus:outline-hidden font-medium cursor-pointer"
                >
                  <option value="All" className="dark:bg-slate-900">All Statuses</option>
                  <option value="verified" className="dark:bg-slate-900">Verified</option>
                  <option value="published" className="dark:bg-slate-900">Published</option>
                  <option value="draft" className="dark:bg-slate-900">Draft</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-600 dark:text-slate-300 shadow-xs">
                <select
                  value={selectedRuntime}
                  onChange={(e) => setSelectedRuntime(e.target.value)}
                  className="bg-transparent border-none focus:outline-hidden font-medium cursor-pointer"
                >
                  <option value="All" className="dark:bg-slate-900">All Runtimes</option>
                  <option value="in_process" className="dark:bg-slate-900">In-Process</option>
                  <option value="mcp" className="dark:bg-slate-900">MCP Protocol</option>
                  <option value="cloud_function" className="dark:bg-slate-900">Cloud Function</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-600 dark:text-slate-300 shadow-xs">
                <select
                  value={selectedClearance}
                  onChange={(e) => setSelectedClearance(e.target.value)}
                  className="bg-transparent border-none focus:outline-hidden font-medium cursor-pointer"
                >
                  <option value="All" className="dark:bg-slate-900">All Clearances</option>
                  <option value="public" className="dark:bg-slate-900">Public</option>
                  <option value="internal" className="dark:bg-slate-900">Internal</option>
                  <option value="admin-only" className="dark:bg-slate-900">Admin-Only</option>
                </select>
              </div>

              {/* Action: Open Authoring */}
              <button
                onClick={() => {
                  setEditingSkill(null);
                  setIsEditorOpen(true);
                }}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Author Skill</span>
              </button>
            </div>
          </div>

          {/* Active Results Count & Chips */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <span>
              Showing <strong className="text-slate-800 dark:text-slate-200">{filteredSkills.length}</strong> of{' '}
              {skills.length} skills in database
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMatcherOpen(true)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Determine Best Skill for Job</span>
              </button>
            </div>
          </div>
        </section>

        {/* Skills Grid */}
        {isLoading ? (
          <div className="p-16 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
            <span>Loading Agent Engine skill registry...</span>
          </div>
        ) : filteredSkills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSkills.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                onSelect={(s) => setSelectedSkill(s)}
                onEdit={(s) => {
                  setEditingSkill(s);
                  setIsEditorOpen(true);
                }}
                onExportDrive={(s) => handleOpenExport(s, 'drive')}
                onShareGmail={(s) => handleOpenExport(s, 'gmail')}
                onDelete={(id) => setSkillToDeleteId(id)}
              />
            ))}
          </div>
        ) : (
          <div className="p-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
              No matching skills found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search keywords or category filters, or author a new skill using the
              &ldquo;Author Skill&rdquo; button above.
            </p>
          </div>
        )}
          </>
        )}
      </main>

      {/* Platform Legal & Verification Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs py-8 px-4 sm:px-6 lg:px-8 mt-12 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Agent Engine &amp; Skill Registry
            </span>
            <span className="hidden sm:inline">&bull;</span>
            <span className="text-[11px] font-mono">
              App ID: <code className="text-indigo-600 dark:text-indigo-400 font-semibold">isaiahsanddavesapp.ai.studio</code>
            </span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => navigateTo('/privacy')}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => navigateTo('/terms')}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium cursor-pointer"
            >
              Terms of Service
            </button>
            <a
              href="mailto:isaiah9238@gmail.com"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
            >
              Contact Support
            </a>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>reCAPTCHA v3 &amp; App Check Verified</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {/* 1. Skill Detail Inspector */}
      <SkillDetailModal
        skill={selectedSkill}
        onClose={() => setSelectedSkill(null)}
        onEdit={(s) => {
          setSelectedSkill(null);
          setEditingSkill(s);
          setIsEditorOpen(true);
        }}
        onExportDrive={(s) => handleOpenExport(s, 'drive')}
        onShareGmail={(s) => handleOpenExport(s, 'gmail')}
      />

      {/* 2. Skill Editor Modal */}
      <SkillEditorModal
        isOpen={isEditorOpen}
        initialSkill={editingSkill}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingSkill(null);
        }}
        onSave={handleSaveSkill}
        currentUserId={user?.uid || 'system-agent'}
        currentUserEmail={user?.email || 'isaiah9238@gmail.com'}
      />

      {/* 3. Decision Matcher Modal ("Which skill is best for the job?") */}
      <DecisionMatcherModal
        isOpen={isMatcherOpen}
        onClose={() => setIsMatcherOpen(false)}
        skills={skills}
        onSelectSkill={(s) => {
          setSelectedSkill(s);
        }}
      />

      {/* 4. Google Workspace Export Modal (Drive & Gmail) */}
      <WorkspaceExportModal
        isOpen={Boolean(exportModalSkill)}
        onClose={() => setExportModalSkill(null)}
        skill={exportModalSkill}
        accessToken={accessToken}
        onRequireAuth={handleSignIn}
        defaultMode={exportModalMode}
        currentUserEmail={user?.email || 'isaiah9238@gmail.com'}
      />

      {/* 5. Google Drive Browser Modal */}
      <DriveBrowserModal
        isOpen={isDriveBrowserOpen}
        onClose={() => setIsDriveBrowserOpen(false)}
        accessToken={accessToken}
        onRequireAuth={handleSignIn}
        onImportSkill={handleSaveSkill}
        currentUserEmail={user?.email || 'isaiah9238@gmail.com'}
      />

      {/* 6. Database Deletion Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(skillToDeleteId)}
        title="Remove Skill from Registry"
        message="Are you sure you want to permanently delete this skill specification from the database? This action will remove the SKILL.md and summary JSON from the ingestion pipeline."
        isDestructive={true}
        confirmLabel="Delete Skill"
        cancelLabel="Cancel"
        onConfirm={executeConfirmedDeleteSkill}
        onCancel={() => setSkillToDeleteId(null)}
        isLoading={isDeleting}
      />

      {/* 7. Gemini Skill Architect Chat Bot Copilot */}
      <GeminiChatBot
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen((prev) => !prev)}
        onApplySkillMarkdown={handleApplyAiSkillMarkdown}
        activeSkill={selectedSkill}
      />
    </div>
  );
}
