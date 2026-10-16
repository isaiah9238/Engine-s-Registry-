// src/data/codeInspectorTemplate.ts

export const CODE_INSPECTOR_HTML = `<!-- The Code Inspector Pro -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Code Inspector Pro - Standalone</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <!-- Pinned Lucide Icons -->
  <script src="https://unpkg.com/lucide@0.460.0/dist/umd/lucide.min.js"></script>
  <style>
    body {
      font-family: 'Inter', sans-serif;
    }
    .code-font {
      font-family: 'Fira Code', monospace;
    }
    .transition-all {
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #1e1e2e;
    }
    ::-webkit-scrollbar-thumb {
      background: #45475a;
      border-radius: 3px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #585b70;
    }
  </style>
</head>
<body class="bg-[#181825] text-[#cdd6f4] h-screen flex flex-col overflow-hidden">

  <!-- Header -->
  <header class="bg-[#11111b] border-b border-[#313244] px-6 py-3 flex items-center justify-between shrink-0">
    <div class="flex items-center gap-3">
      <div class="bg-linear-to-tr from-[#cba6f7] to-[#89b4fa] p-2 rounded-lg text-[#11111b]">
        <i data-lucide="shield-check" class="w-5 h-5"></i>
      </div>
      <div>
        <h1 class="text-sm font-bold tracking-wider text-white uppercase flex items-center gap-2">
          The Code Inspector Pro <span class="text-[9px] bg-[#f9e2af] text-[#11111b] px-1 rounded">V3.5 Compiler-Edition</span>
        </h1>
        <p class="text-[10px] text-[#a6adc8]">Advanced Complexity, Dead-Code, & In-Memory Compiler Bundler</p>
      </div>
    </div>
    <div class="flex items-center gap-4">
      <!-- Background Agent status toggle -->
      <div class="flex items-center gap-2 bg-[#1e1e2e] px-3 py-1 rounded border border-[#313244]">
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" id="bgMonitorToggle" class="sr-only peer" checked>
          <div class="w-7 h-4 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#a6e3a1]"></div>
        </label>
        <span class="text-[10px] text-[#a6adc8] font-medium uppercase tracking-wider">Background Daemon</span>
      </div>

      <div id="saveIndicator" class="hidden text-xs text-[#a6e3a1] items-center gap-1">
        <i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Auto-Saved
      </div>
      <div id="statusBadge" class="flex items-center gap-2 bg-[#1e1e2e] px-3 py-1.5 rounded-md border border-[#313244] text-xs">
        <span id="statusPulse" class="w-2 h-2 rounded-full bg-[#a6e3a1]"></span>
        <span id="statusText" class="text-[#a6adc8] font-medium">System Idle</span>
      </div>
    </div>
  </header>

  <!-- Workspace Grid -->
  <div class="flex flex-1 overflow-hidden">
    
    <!-- Left Sidebar: Explorer -->
    <aside class="w-64 bg-[#11111b] border-r border-[#313244] flex flex-col shrink-0">
      <div class="p-4 border-b border-[#313244] flex items-center justify-between">
        <span class="text-xs font-bold uppercase tracking-wider text-[#a6adc8] flex items-center gap-2">
          <i data-lucide="folder-tree" class="w-4 h-4 text-[#89b4fa]"></i> Workspace
        </span>
        <button id="addFileBtn" class="text-[#a6adc8] hover:text-white transition-colors" title="Create virtual sandbox file">
          <i data-lucide="file-plus" class="w-4 h-4"></i>
        </button>
      </div>

      <!-- File List -->
      <div id="fileList" class="flex-1 overflow-y-auto p-2 space-y-1"></div>

      <!-- Workspace Rules Guard -->
      <div class="p-4 bg-[#181825] border-t border-[#313244] text-[11px] text-[#a6adc8] space-y-2">
        <div class="flex items-center gap-1.5 font-semibold text-white">
          <i data-lucide="info" class="w-3.5 h-3.5 text-[#f9e2af]"></i>
          <span>Background Fetch</span>
        </div>
        <p class="leading-relaxed">When active, the background daemon audits your active buffer automatically every 4 seconds of typing downtime.</p>
      </div>
    </aside>

    <!-- Center Pane: Editor -->
    <main class="flex-1 flex flex-col bg-[#1e1e2e] relative">
      <!-- Controls Header -->
      <div class="bg-[#11111b] border-b border-[#313244] px-4 py-2 flex items-center justify-between text-xs">
        <div class="flex items-center gap-2">
          <i data-lucide="file-code" class="w-4 h-4 text-[#cba6f7]"></i>
          <span id="currentFileName" class="font-medium text-white">...</span>
          <span class="text-[#585b70]">|</span>
          <span id="fileLanguage" class="text-[#a6adc8] bg-[#313244] px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">html</span>
        </div>
        <div class="flex items-center gap-2">
          <button id="formatBtn" class="bg-[#313244] hover:bg-[#45475a] text-white px-3 py-1 rounded flex items-center gap-1.5 transition-colors">
            <i data-lucide="sparkles" class="w-3.5 h-3.5 text-[#f9e2af]"></i> Pretty-Print
          </button>
          <button id="analyzeBtn" class="bg-[#89b4fa] hover:bg-[#b4befe] text-[#11111b] font-semibold px-3 py-1 rounded flex items-center gap-1.5 transition-colors">
            <i data-lucide="cpu" class="w-3.5 h-3.5"></i> Run Inspector
          </button>
        </div>
      </div>

      <!-- Textarea with Line Gutter -->
      <div class="flex-1 flex overflow-hidden relative">
        <div id="lineNumbers" class="w-12 bg-[#11111b] text-[#585b70] text-right pr-3 pt-4 select-none code-font text-xs leading-6 overflow-hidden">
          1
        </div>
        <textarea id="editor" class="flex-1 bg-transparent text-[#cdd6f4] p-4 focus:outline-none resize-none code-font text-xs leading-6 overflow-y-auto whitespace-pre block" spellcheck="false" placeholder="// Write or paste code here..."></textarea>
      </div>
    </main>

    <!-- Right Sidebar -->
    <section class="w-96 bg-[#11111b] border-l border-[#313244] flex flex-col shrink-0">
      <!-- Tab Header Buttons -->
      <div class="flex border-b border-[#313244] text-[11px] overflow-x-auto shrink-0">
        <button id="tabAiBtn" class="flex-1 py-3 px-1 text-center border-b-2 border-transparent text-[#a6adc8] hover:text-white font-semibold whitespace-nowrap">
          <i data-lucide="sparkles" class="w-3.5 h-3.5 inline mr-1 text-[#f9e2af]"></i> AI Copilot
        </button>
        <button id="tabDashboardBtn" class="flex-1 py-3 px-1 text-center border-b-2 border-[#cba6f7] font-semibold text-white whitespace-nowrap">
          <i data-lucide="layout-dashboard" class="w-3.5 h-3.5 inline mr-1"></i> Dashboard
        </button>
        <button id="tabIssuesBtn" class="flex-1 py-3 px-1 text-center border-b-2 border-transparent text-[#a6adc8] hover:text-white font-semibold whitespace-nowrap">
          <i data-lucide="shield-alert" class="w-3.5 h-3.5 inline mr-1"></i> Diagnostics
        </button>
        <button id="tabAstBtn" class="flex-1 py-3 px-1 text-center border-b-2 border-transparent text-[#a6adc8] hover:text-white font-semibold whitespace-nowrap">
          <i data-lucide="code" class="w-3.5 h-3.5 inline mr-1"></i> AST
        </button>
        <button id="tabCompilerBtn" class="flex-1 py-3 px-1 text-center border-b-2 border-transparent text-[#a6adc8] hover:text-white font-semibold whitespace-nowrap bg-[#1e1e2e]">
          <i data-lucide="play-circle" class="w-3.5 h-3.5 inline mr-1 text-[#a6e3a1]"></i> Live Compiler
        </button>
      </div>

      <!-- Tab Content Area -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4">

        <!-- Tab 0: AI Copilot -->
        <div id="tabAi" class="space-y-4 hidden flex-1 flex-col">
          <div class="bg-[#181825] border border-[#313244] rounded-lg p-3 space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <i data-lucide="key" class="w-4 h-4 text-[#f9e2af]"></i> API Connection
              </h3>
              <button id="removeKeyBtn" class="text-[10px] text-[#f38ba8] hover:underline hidden">Remove Key</button>
            </div>
            <div class="flex gap-2">
              <input type="password" id="apiKeyInput" placeholder="Enter Gemini API Key..." class="flex-1 bg-[#11111b] border border-[#313244] rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#89b4fa]">
              <button id="saveKeyBtn" class="bg-[#89b4fa] text-[#11111b] font-bold text-xs px-3 py-1 rounded hover:bg-[#b4befe] transition-colors">Save</button>
            </div>
          </div>

          <div class="bg-[#181825] border border-[#313244] rounded-lg p-3 space-y-3 flex-1 flex flex-col">
            <h3 class="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <i data-lucide="bot" class="w-4 h-4 text-[#cba6f7]"></i> Gemini Prompt Assistant
            </h3>
            <textarea id="aiPromptInput" rows="3" class="w-full bg-[#11111b] border border-[#313244] rounded p-2 text-xs text-white focus:outline-none focus:border-[#cba6f7] resize-none" placeholder="Ask Gemini to write, refactor, or fix code in the active file..."></textarea>
    
            <div class="flex gap-2">
              <button id="aiAskBtn" class="flex-1 bg-[#cba6f7] text-[#11111b] font-bold text-xs py-1.5 rounded hover:bg-[#b4befe] transition-colors flex items-center justify-center gap-1">
                <i data-lucide="send" class="w-3.5 h-3.5"></i> Run Prompt
              </button>
              <button id="aiAutoFixBtn" class="bg-[#313244] hover:bg-[#45475a] text-[#a6e3a1] font-bold text-xs px-3 py-1.5 rounded transition-colors flex items-center gap-1" title="Auto-fix issues found in Diagnostics tab">
                <i data-lucide="wrench" class="w-3.5 h-3.5"></i> Auto-Fix
              </button>
            </div>

            <div id="aiStatus" class="text-[10px] text-[#a6adc8] italic hidden">Processing request with Gemini...</div>
          </div>
        </div>

        <!-- Tab 1: Dashboard Analytics -->
        <div id="tabDashboard" class="space-y-4">
          <div class="bg-[#181825] border border-[#313244] rounded-lg p-3 space-y-3">
            <h3 class="text-xs font-bold text-white uppercase tracking-wider">Health Metrics</h3>
            <div class="space-y-1">
              <div class="flex justify-between text-[11px]">
                <span class="text-[#a6adc8]">Maintainability Index</span>
                <span id="maintainabilityScore" class="font-bold text-[#a6e3a1]">100/100</span>
              </div>
              <div class="w-full bg-[#313244] h-2 rounded-full overflow-hidden">
                <div id="maintainabilityBar" class="bg-[#a6e3a1] h-full transition-all duration-500" style="width: 100%"></div>
              </div>
            </div>
            <div class="space-y-1">
              <div class="flex justify-between text-[11px]">
                <span class="text-[#a6adc8]">Security Health</span>
                <span id="securityScore" class="font-bold text-[#a6e3a1]">Excellent</span>
              </div>
              <div class="w-full bg-[#313244] h-2 rounded-full overflow-hidden">
                <div id="securityBar" class="bg-[#a6e3a1] h-full transition-all duration-500" style="width: 100%"></div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div class="bg-[#181825] p-3 rounded-lg border border-[#313244]">
              <div class="text-[10px] uppercase text-[#a6adc8]">Cyclomatic Complexity</div>
              <div id="complexityMetric" class="text-lg font-bold text-white mt-1">1</div>
            </div>
            <div class="bg-[#181825] p-3 rounded-lg border border-[#313244]">
              <div class="text-[10px] uppercase text-[#a6adc8]">Unused Variables</div>
              <div id="deadCodeMetric" class="text-lg font-bold text-white mt-1">0</div>
            </div>
          </div>

          <div class="bg-[#181825] border border-[#313244] rounded-lg p-3 space-y-2">
            <h4 class="text-xs font-bold text-white uppercase tracking-wider">Physical Workspace Payload</h4>
            <div class="grid grid-cols-2 gap-2 text-[11px]">
              <div class="text-[#a6adc8]">Lines Count: <span id="metricLines" class="text-white font-mono">0</span></div>
              <div class="text-[#a6adc8]">Byte Size: <span id="metricSize" class="text-white font-mono">0 B</span></div>
              <div class="text-[#a6adc8]">Total Chars: <span id="metricChars" class="text-white font-mono">0</span></div>
              <div class="text-[#a6adc8]">Est. Tokens: <span id="metricTokens" class="text-white font-mono">0</span></div>
            </div>
          </div>
        </div>

        <!-- Tab 2: Security & Linter Issues -->
        <div id="tabIssues" class="space-y-4 hidden">
          <div class="bg-[#181825] border border-[#313244] rounded-lg p-3">
            <h3 class="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <i data-lucide="shield-alert" class="w-4 h-4 text-[#f38ba8]"></i> Static Analysis Audit
            </h3>
            <div id="diagnosticLogs" class="space-y-2"></div>
          </div>
        </div>

        <!-- Tab 3: AST -->
        <div id="tabAst" class="space-y-4 hidden">
          <div class="bg-[#181825] border border-[#313244] rounded-lg p-3">
            <h3 class="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
              <i data-lucide="layers" class="w-4 h-4 text-[#a6e3a1]"></i> AST Tree Map
            </h3>
            <div id="astTree" class="space-y-2 text-xs code-font"></div>
          </div>
        </div>

        <!-- Tab 4: Live Compiler Output Preview -->
        <div id="tabCompiler" class="space-y-4 hidden h-full flex-col">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <i data-lucide="play" class="w-4 h-4 text-[#a6e3a1]"></i> Executable Compiler Sandbox
            </h3>
            <button id="triggerBuildBtn" class="bg-[#a6e3a1] text-[#11111b] text-[11px] font-bold px-2 py-1 rounded flex items-center gap-1 hover:bg-[#89b4fa] transition-colors">
              <i data-lucide="refresh-cw" class="w-3 h-3"></i> Re-compile Project
            </button>
          </div>
          <div class="bg-[#11111b] border border-[#313244] rounded p-2 text-[10px] font-mono text-[#a6adc8] space-y-1 select-text">
            <div><span class="text-blue-400 font-bold">[BUILD COMPILER]</span> Analyzing file hierarchy...</div>
            <div id="compilerLogs" class="text-white">Ready to bundle project components.</div>
          </div>
          <div class="flex-1 bg-white rounded-lg border-2 border-[#45475a] overflow-hidden min-h-75 flex flex-col relative">
            <div class="bg-[#313244] text-[10px] px-3 py-1 flex items-center justify-between text-white font-semibold">
              <span>Dynamic Window Output View</span>
              <span class="w-2.5 h-2.5 rounded-full bg-green-500"></span>
            </div>
            <iframe id="compiledSandboxFrame" class="w-full flex-1 bg-white border-none" sandbox="allow-scripts"></iframe>
          </div>
        </div>

      </div>

      <!-- Footer Control Panel -->
      <div class="p-4 bg-[#11111b] border-t border-[#313244] space-y-2 shrink-0">
        <button id="minifyBtn" class="w-full bg-[#313244] hover:bg-[#45475a] text-white py-2 rounded text-xs font-semibold flex items-center justify-center gap-2 transition-all">
          <i data-lucide="minimize-2" class="w-4 h-4"></i> Safe-Minify Active Buffer
        </button>
      </div>
    </section>
  </div>

  <!-- Integrated Controller Script logic -->
  <script>
    const defaultFiles = [
      {
        id: "app-js",
        name: "app.js",
        language: "javascript",
        content: \`// Workspace JavaScript Entry Point

function runHeavyMath(payload) {
  let result = 0;
  if (payload) {
    for (let i = 1; i <= 10; i++) {
      result += (i * i);
    }
  }
  return result;
}

function renderHtml(userInput) {
  const outputContainer = document.getElementById("output");
  if (outputContainer) {
    outputContainer.textContent = userInput;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const calcBtn = document.getElementById("calcBtn");
  if (calcBtn) {
    calcBtn.addEventListener("click", () => {
      const mathValue = runHeavyMath(true);
      renderHtml("Computation Result Success: " + mathValue);
    });
  }
});\`
      },
      {
        id: "index-html",
        name: "index.html",
        language: "html",
        content: \`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Security Check Sandbox</title>
</head>
<body>
  <div id="output">Rendering incoming data...</div>
  <button id="calcBtn">Activate</button>
</body>
</html>\`
      },
      {
        id: "styles-css",
        name: "styles.css",
        language: "css",
        content: \`/* Architecture Baseline Styling */
:root {
  --primary: #cba6f7;
  --secondary: #89b4fa;
}

body {
  background-color: #11111b;
  color: #cdd6f4;
  margin: 0;
  padding: 24px;
  font-family: sans-serif;
}

button {
  background: var(--primary);
  color: #11111b;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}\`
      }
    ];

    const AppState = {
      virtualFiles: [],
      currentFileIndex: 0,
      daemonTimer: null,
      typingDebounceTimeout: null,
      saveDebounceTimeout: null,
      apiKey: localStorage.getItem('gemini_api_key') || '',
      currentBlobUrl: null,

      selectors: {
        fileListEl: document.getElementById('fileList'),
        currentFileNameEl: document.getElementById('currentFileName'),
        fileLanguageEl: document.getElementById('fileLanguage'),
        editorEl: document.getElementById('editor'),
        lineNumbersEl: document.getElementById('lineNumbers'),
        saveIndicator: document.getElementById('saveIndicator'),
        bgMonitorToggle: document.getElementById('bgMonitorToggle'),
        statusPulse: document.getElementById('statusPulse'),
        statusText: document.getElementById('statusText'),
        tabAiBtn: document.getElementById('tabAiBtn'),
        tabDashboardBtn: document.getElementById('tabDashboardBtn'),
        tabIssuesBtn: document.getElementById('tabIssuesBtn'),
        tabAstBtn: document.getElementById('tabAstBtn'),
        tabCompilerBtn: document.getElementById('tabCompilerBtn'),
        tabAi: document.getElementById('tabAi'),
        tabDashboard: document.getElementById('tabDashboard'),
        tabIssues: document.getElementById('tabIssues'),
        tabAst: document.getElementById('tabAst'),
        tabCompiler: document.getElementById('tabCompiler'),
        triggerBuildBtn: document.getElementById('triggerBuildBtn'),
        compilerLogs: document.getElementById('compilerLogs'),
        compiledSandboxFrame: document.getElementById('compiledSandboxFrame'),
        maintainabilityScore: document.getElementById('maintainabilityScore'),
        maintainabilityBar: document.getElementById('maintainabilityBar'),
        securityScore: document.getElementById('securityScore'),
        securityBar: document.getElementById('securityBar'),
        complexityMetric: document.getElementById('complexityMetric'),
        deadCodeMetric: document.getElementById('deadCodeMetric'),
        metricLines: document.getElementById('metricLines'),
        metricChars: document.getElementById('metricChars'),
        metricTokens: document.getElementById('metricTokens'),
        metricSize: document.getElementById('metricSize'),
        diagnosticLogs: document.getElementById('diagnosticLogs'),
        astTree: document.getElementById('astTree'),
        formatBtn: document.getElementById('formatBtn'),
        analyzeBtn: document.getElementById('analyzeBtn'),
        minifyBtn: document.getElementById('minifyBtn'),
        addFileBtn: document.getElementById('addFileBtn')
      }
    };

    function updateApiKeyUI() {
      const keyInput = document.getElementById('apiKeyInput');
      const removeBtn = document.getElementById('removeKeyBtn');
      if (!keyInput || !removeBtn) return;

      if (AppState.apiKey) {
        keyInput.value = '••••••••••••••••••••';
        removeBtn.classList.remove('hidden');
      } else {
        keyInput.value = '';
        removeBtn.classList.add('hidden');
      }
    }

    async function callGeminiApi(promptText) {
      if (!AppState.apiKey) {
        alert('Please enter a Gemini API key first.');
        return null;
      }

      const activeFile = AppState.virtualFiles[AppState.currentFileIndex];
      const statusEl = document.getElementById('aiStatus');
      if (statusEl) statusEl.classList.remove('hidden');

      const payload = {
        contents: [{
          parts: [{
            text: "You are an expert developer assistant inside Code Inspector Pro.\\n" +
              "Current File Name: " + activeFile.name + "\\n" +
              "Language: " + activeFile.language + "\\n\\n" +
              "Current File Content:\\n" +
              "```" + activeFile.language + "\\n" +
              activeFile.content + "\\n" +
              "```\\n\\n" +
              "Task: " + promptText + "\\n\\n" +
              "Return ONLY the updated code without markdown code blocks or explanations so it can be directly injected into the editor."
          }]
        }]
      };

      try {
        const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + AppState.apiKey, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (statusEl) statusEl.classList.add('hidden');

        if (data.candidates && data.candidates[0].content.parts[0].text) {
          let cleanedCode = data.candidates[0].content.parts[0].text.trim();
          cleanedCode = cleanedCode.replace(/^```[a-z]*\\n/i, '').replace(/\\n```$/, '');
          return cleanedCode;
        } else {
          throw new Error(data.error?.message || 'Invalid API response');
        }
      } catch (err) {
        if (statusEl) statusEl.classList.add('hidden');
        alert('Gemini API Error: ' + err.message);
        return null;
      }
    }

    function init() {
      loadVirtualWorkspace();
      renderFileList();
      loadFile(AppState.currentFileIndex);
      setupListeners();
      updateApiKeyUI();
      lucide.createIcons();
      startBackgroundDaemon();
    }

    function loadVirtualWorkspace() {
      try {
        const rawData = localStorage.getItem('code_inspector_files_v3');
        if (rawData) {
          const parsed = JSON.parse(rawData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            AppState.virtualFiles = parsed;
            return;
          }
        }
      } catch (error) {
        console.error("Local storage error parsing workspace payload.", error);
      }
      AppState.virtualFiles = JSON.parse(JSON.stringify(defaultFiles));
    }

    function loadFile(index) {
      if (AppState.virtualFiles.length === 0) {
        AppState.virtualFiles = JSON.parse(JSON.stringify(defaultFiles));
      }
      if (index < 0 || index >= AppState.virtualFiles.length) {
        index = 0;
      }
      
      AppState.currentFileIndex = index;
      const file = AppState.virtualFiles[index];
      
      AppState.selectors.editorEl.value = file.content;
      AppState.selectors.currentFileNameEl.textContent = file.name;
      AppState.selectors.fileLanguageEl.textContent = file.language;

      document.querySelectorAll('.file-item-btn').forEach((btn, idx) => {
        if (idx === index) {
          btn.classList.add('bg-[#313244]', 'text-white');
          btn.classList.remove('text-[#a6adc8]');
        } else {
          btn.classList.remove('bg-[#313244]', 'text-white');
          btn.classList.add('text-[#a6adc8]');
        }
      });

      updateLineNumbers();
      runAnalysisSuite();
    }

    function renderFileList() {
      AppState.selectors.fileListEl.innerHTML = '';
      AppState.virtualFiles.forEach((file, idx) => {
        const itemContainer = document.createElement('div');
        itemContainer.className = "group flex items-center justify-between w-full px-2 py-1.5 rounded-md transition-all hover:bg-[#1e1e2e]/60";
        
        let icon = 'file-text';
        if (file.language === 'html') icon = 'file-code';
        if (file.language === 'javascript') icon = 'file-json';
        if (file.language === 'css') icon = 'file-type-2';

        const isActive = idx === AppState.currentFileIndex;

        itemContainer.innerHTML = \`
          <button class="file-item-btn flex-1 flex items-center gap-2 text-left text-xs truncate py-1 px-1 rounded transition-all \${isActive ? 'text-white font-medium bg-[#313244]' : 'text-[#a6adc8] hover:text-white'}" data-index="\${idx}">
            <i data-lucide="\${icon}" class="w-4 h-4 shrink-0 text-[#89b4fa]"></i>
            <span class="truncate">\${file.name}</span>
          </button>
          
          <div class="hidden group-hover:flex items-center gap-1.5 shrink-0 ml-2 px-1">
            <button class="rename-file-btn text-[#a6adc8] hover:text-[#f9e2af] transition-colors p-0.5" title="Rename File" data-index="\${idx}">
              <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
            </button>
            <button class="delete-file-btn text-[#a6adc8] hover:text-[#f38ba8] transition-colors p-0.5" title="Delete File" data-index="\${idx}">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        \`;

        itemContainer.querySelector('.file-item-btn').addEventListener('click', () => loadFile(idx));
        
        itemContainer.querySelector('.rename-file-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          renameFile(idx);
        });

        itemContainer.querySelector('.delete-file-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          deleteFile(idx);
        });

        AppState.selectors.fileListEl.appendChild(itemContainer);
      });
      lucide.createIcons({ node: AppState.selectors.fileListEl });
    }

    function renameFile(idx) {
      const file = AppState.virtualFiles[idx];
      const newName = prompt("Rename " + file.name + " to:", file.name);
      if (!newName || newName.trim() === "" || newName === file.name) return;

      const isDuplicate = AppState.virtualFiles.some((f, i) => i !== idx && f.name.toLowerCase() === newName.toLowerCase());
      if (isDuplicate) {
        alert("Error: A file with that name already exists.");
        return;
      }

      const ext = newName.split('.').pop().toLowerCase();
      let language = 'javascript';
      if (ext === 'html' || ext === 'htm') language = 'html';
      if (ext === 'css') language = 'css';

      file.name = newName;
      file.language = language;

      debounceSaveToLocalStorage();
      renderFileList();
      loadFile(AppState.currentFileIndex);
    }

    function deleteFile(idx) {
      if (AppState.virtualFiles.length <= 1) {
        alert("Workspace Constraint: You must keep at least one sandbox file.");
        return;
      }

      const file = AppState.virtualFiles[idx];
      if (!confirm("Are you sure you want to delete \\"" + file.name + "\\"?")) return;

      AppState.virtualFiles.splice(idx, 1);
      
      if (AppState.currentFileIndex >= AppState.virtualFiles.length) {
        AppState.currentFileIndex = AppState.virtualFiles.length - 1;
      } else if (idx === AppState.currentFileIndex) {
        AppState.currentFileIndex = Math.max(0, AppState.currentFileIndex - 1);
      }

      debounceSaveToLocalStorage();
      renderFileList();
      loadFile(AppState.currentFileIndex);
    }

    function debounceSaveToLocalStorage() {
      clearTimeout(AppState.saveDebounceTimeout);
      AppState.saveDebounceTimeout = setTimeout(() => {
        try {
          localStorage.setItem('code_inspector_files_v3', JSON.stringify(AppState.virtualFiles));
          AppState.selectors.saveIndicator.classList.remove('hidden');
          AppState.selectors.saveIndicator.classList.add('flex');
          setTimeout(() => {
            AppState.selectors.saveIndicator.classList.remove('flex');
            AppState.selectors.saveIndicator.classList.add('hidden');
          }, 1000);
        } catch (e) {
          console.error("Could not serialize virtual workspace state.", e);
        }
      }, 750);
    }

    function compileWorkspace() {
      AppState.selectors.compilerLogs.textContent = "Booting compiler daemon...";
      
      const htmlFile = AppState.virtualFiles.find(f => f.name.endsWith('.html'));
      const cssFile = AppState.virtualFiles.find(f => f.name.endsWith('.css'));
      const jsFile = AppState.virtualFiles.find(f => f.name.endsWith('.js'));

      if (!htmlFile) {
        AppState.selectors.compilerLogs.innerHTML = '<span class="text-red-400">ERROR: Compilation failed. No HTML file found in workspace root.</span>';
        return;
      }

      AppState.selectors.compilerLogs.innerHTML = '<div>Bundling file tree system...</div>';

      setTimeout(() => {
        try {
          let rawHtml = htmlFile.content;
          const cssContent = cssFile ? cssFile.content : '';
          const jsContent = jsFile ? jsFile.content : '';

          const compiledStyles = "<style>\\n" + cssContent + "\\n</style>";
          if (/<\/head>/i.test(rawHtml)) {
            rawHtml = rawHtml.replace(/(<\/head>)/i, compiledStyles + "\\n$1");
          } else {
            rawHtml = compiledStyles + rawHtml;
          }

          const compiledScript = "<script>\\n" + jsContent + "\\n<" + "/script>";
          if (/<\/body>/i.test(rawHtml)) {
            rawHtml = rawHtml.replace(/(<\/body>)/i, compiledScript + "\\n$1");
          } else {
            rawHtml = rawHtml + compiledScript;
          }

          // Revoke prior blob to prevent memory leaks
          if (AppState.currentBlobUrl) {
            URL.revokeObjectURL(AppState.currentBlobUrl);
          }

          const blob = new Blob([rawHtml], { type: 'text/html' });
          AppState.currentBlobUrl = URL.createObjectURL(blob);
          
          AppState.selectors.compiledSandboxFrame.setAttribute('sandbox', 'allow-scripts');
          AppState.selectors.compiledSandboxFrame.src = AppState.currentBlobUrl;

          AppState.selectors.compilerLogs.innerHTML = 
            '<div class="text-green-400">⚡ Build Compiled Successfully!</div>' +
            '<div class="text-[#89b4fa]">> Bundled HTML (' + htmlFile.content.length + ' Bytes)</div>' +
            '<div class="text-[#89b4fa]">> Injected CSS Style Node (&lt;style&gt; - ' + cssContent.length + ' Bytes)</div>' +
            '<div class="text-[#89b4fa]">> Bundled Sandbox Javascript Engine (&lt;script&gt; - ' + jsContent.length + ' Bytes)</div>';
        } catch (err) {
          AppState.selectors.compilerLogs.innerHTML = '<span class="text-red-400">COMPILER EXCEPTION: ' + err.message + '</span>';
        }
      }, 400);
    }

    function setupListeners() {
      // AI Listeners
      document.getElementById('saveKeyBtn')?.addEventListener('click', () => {
        const val = document.getElementById('apiKeyInput').value.trim();
        if (val && !val.startsWith('•••')) {
          AppState.apiKey = val;
          localStorage.setItem('gemini_api_key', val);
          alert('API Key saved!');
          updateApiKeyUI();
        }
      });

      document.getElementById('removeKeyBtn')?.addEventListener('click', () => {
        AppState.apiKey = '';
        localStorage.removeItem('gemini_api_key');
        updateApiKeyUI();
        alert('API Key removed permanently.');
      });

      document.getElementById('aiAskBtn')?.addEventListener('click', async () => {
        const prompt = document.getElementById('aiPromptInput').value.trim();
        if (!prompt) return;

        const result = await callGeminiApi(prompt);
        if (result) {
          AppState.selectors.editorEl.value = result;
          AppState.virtualFiles[AppState.currentFileIndex].content = result;
          updateLineNumbers();
          runAnalysisSuite();
          debounceSaveToLocalStorage();
        }
      });

      document.getElementById('aiAutoFixBtn')?.addEventListener('click', async () => {
        const autoFixPrompt = "Review this code and automatically resolve any security risks, unused variables, or formatting issues found in static analysis.";
        const result = await callGeminiApi(autoFixPrompt);
        if (result) {
          AppState.selectors.editorEl.value = result;
          AppState.virtualFiles[AppState.currentFileIndex].content = result;
          updateLineNumbers();
          runAnalysisSuite();
          debounceSaveToLocalStorage();
        }
      });

      // Editor Listeners
      AppState.selectors.editorEl.addEventListener('input', () => {
        AppState.virtualFiles[AppState.currentFileIndex].content = AppState.selectors.editorEl.value;
        updateLineNumbers();
        triggerBackgroundDaemonPulse();
        debounceSaveToLocalStorage();
      });

      AppState.selectors.editorEl.addEventListener('scroll', () => {
        AppState.selectors.lineNumbersEl.scrollTop = AppState.selectors.editorEl.scrollTop;
      });

      AppState.selectors.editorEl.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
          e.preventDefault();
          const start = AppState.selectors.editorEl.selectionStart;
          const end = AppState.selectors.editorEl.selectionEnd;
          const value = AppState.selectors.editorEl.value;

          AppState.selectors.editorEl.value = value.substring(0, start) + "  " + value.substring(end);
          AppState.selectors.editorEl.selectionStart = AppState.selectors.editorEl.selectionEnd = start + 2;

          AppState.virtualFiles[AppState.currentFileIndex].content = AppState.selectors.editorEl.value;
          updateLineNumbers();
          triggerBackgroundDaemonPulse();
          debounceSaveToLocalStorage();
        }
      });

      window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault();
          runAnalysisSuite();
          compileWorkspace();
        }
      });

      // Sidebar Tab Switcher Listeners
      AppState.selectors.tabAiBtn?.addEventListener('click', () => switchTab('ai'));
      AppState.selectors.tabDashboardBtn.addEventListener('click', () => switchTab('dashboard'));
      AppState.selectors.tabIssuesBtn.addEventListener('click', () => switchTab('issues'));
      AppState.selectors.tabAstBtn.addEventListener('click', () => switchTab('ast'));
      AppState.selectors.tabCompilerBtn.addEventListener('click', () => {
        switchTab('compiler');
        compileWorkspace();
      });

      // Toolbar Controls
      AppState.selectors.analyzeBtn.addEventListener('click', runAnalysisSuite);
      AppState.selectors.formatBtn.addEventListener('click', formatCurrentBuffer);
      AppState.selectors.minifyBtn.addEventListener('click', minifyCurrentBuffer);
      AppState.selectors.triggerBuildBtn.addEventListener('click', compileWorkspace);

      // Add Virtual File Listener
      AppState.selectors.addFileBtn.addEventListener('click', () => {
        const filename = prompt("Enter new filename:", "utils.js");
        if (filename) {
          const cleanName = filename.trim();
          if (cleanName === "") return;

          const isDuplicate = AppState.virtualFiles.some(f => f.name.toLowerCase() === cleanName.toLowerCase());
          if (isDuplicate) {
            alert("A file with that name already exists in the workspace.");
            return;
          }

          const ext = cleanName.split('.').pop().toLowerCase();
          let language = 'javascript';
          let template = '';

          if (ext === 'html' || ext === 'htm') {
            language = 'html';
            template = '<!DOCTYPE html>\\n<html lang="en">\\n<head>\\n  <meta charset="UTF-8">\\n  <title>New Document Sandbox</title>\\n</head>\\n<body>\\n  <div id="app">\\n    <h1>Welcome to ' + cleanName + '</h1>\\n  </div>\\n</body>\\n</html>';
          } else if (ext === 'css') {
            language = 'css';
            template = '/* ' + cleanName + ' Architecture Baseline */\\nbody {\\n  margin: 0;\\n  padding: 0;\\n  box-sizing: border-box;\\n}\\n\\n#app {\\n  max-width: 1200px;\\n  margin: 0 auto;\\n}';
          } else {
            language = 'javascript';
            template = '// Workspace script: ' + cleanName + '\\nfunction initialize() {\\n  const isHealthy = true;\\n  console.log("Initialize system diagnostics...");\\n  return isHealthy;\\n}\\ninitialize();';
          }

          AppState.virtualFiles.push({
            id: "file-" + Date.now(),
            name: cleanName,
            language: language,
            content: template
          });

          debounceSaveToLocalStorage();
          renderFileList();
          loadFile(AppState.virtualFiles.length - 1);
        }
      });
    }

    function switchTab(target) {
      const tabs = [
        { name: 'ai', btn: AppState.selectors.tabAiBtn, container: AppState.selectors.tabAi },
        { name: 'dashboard', btn: AppState.selectors.tabDashboardBtn, container: AppState.selectors.tabDashboard },
        { name: 'issues', btn: AppState.selectors.tabIssuesBtn, container: AppState.selectors.tabIssues },
        { name: 'ast', btn: AppState.selectors.tabAstBtn, container: AppState.selectors.tabAst },
        { name: 'compiler', btn: AppState.selectors.tabCompilerBtn, container: AppState.selectors.tabCompiler }
      ];

      tabs.forEach(tab => {
        if (!tab.btn || !tab.container) return;
        if (tab.name === target) {
          tab.btn.classList.add('border-[#cba6f7]', 'text-white');
          tab.btn.classList.remove('border-transparent', 'text-[#a6adc8]');
          tab.container.classList.remove('hidden');
        } else {
          tab.btn.classList.remove('border-[#cba6f7]', 'text-white');
          tab.btn.classList.add('border-transparent', 'text-[#a6adc8]');
          tab.container.classList.add('hidden');
        }
      });
    }

    function updateLineNumbers() {
      const count = AppState.selectors.editorEl.value.split('\\n').length;
      let lineStr = '';
      for (let i = 1; i <= count; i++) {
        lineStr += i + '<br>';
      }
      AppState.selectors.lineNumbersEl.innerHTML = lineStr;
    }

    function startBackgroundDaemon() {
      if (AppState.daemonTimer) clearInterval(AppState.daemonTimer);
      
      AppState.daemonTimer = setInterval(() => {
        if (AppState.selectors.bgMonitorToggle.checked) {
          setDaemonStatus("scanning", "Daemon: Auto-Checking");
          setTimeout(() => {
            runAnalysisSuite(false);
            setDaemonStatus("idle", "Daemon: Watching");
          }, 300);
        } else {
          setDaemonStatus("disabled", "Daemon: Suspended");
        }
      }, 4000);
    }

    function triggerBackgroundDaemonPulse() {
      if (!AppState.selectors.bgMonitorToggle.checked) return;
      setDaemonStatus("typing", "Daemon: Catching changes...");
      
      clearTimeout(AppState.typingDebounceTimeout);
      AppState.typingDebounceTimeout = setTimeout(() => {
        runAnalysisSuite(false);
        setDaemonStatus("idle", "Daemon: Watching");
      }, 1200);
    }

    function setDaemonStatus(mode, text) {
      AppState.selectors.statusText.textContent = text;
      AppState.selectors.statusPulse.className = "w-2 h-2 rounded-full";
      
      if (mode === 'scanning') {
        AppState.selectors.statusPulse.classList.add('bg-[#f9e2af]', 'animate-ping');
      } else if (mode === 'typing') {
        AppState.selectors.statusPulse.classList.add('bg-[#89b4fa]');
      } else if (mode === 'disabled') {
        AppState.selectors.statusPulse.classList.add('bg-[#585b70]');
      } else {
        AppState.selectors.statusPulse.classList.add('bg-[#a6e3a1]');
      }
    }

    function runAnalysisSuite(flashUI = true) {
      if (AppState.virtualFiles.length === 0) return;
      const code = AppState.selectors.editorEl.value;
      const lang = AppState.virtualFiles[AppState.currentFileIndex].language;

      const lineCount = code.split('\\n').length;
      const charCount = code.length;
      const estTokens = Math.ceil(charCount / 4.2);
      const sizeBytes = new Blob([code]).size;

      AppState.selectors.metricLines.textContent = lineCount;
      AppState.selectors.metricChars.textContent = charCount;
      AppState.selectors.metricTokens.textContent = estTokens;
      AppState.selectors.metricSize.textContent = sizeBytes < 1024 ? sizeBytes + " B" : (sizeBytes / 1024).toFixed(1) + " KB";

      const issues = [];
      const astNodes = [];
      let complexity = 1;
      let deadVariables = [];

      if (lang === 'javascript') {
        const branches = code.match(/(if\\s*\\(|for\\s*\\(|while\\s*\\(|catch\\s*\\(|(?:&&|\\|\\|)|\\bcase\\s+)/g);
        complexity = branches ? branches.length + 1 : 1;

        const variableDeclarations = [...code.matchAll(/(?:const|let|var)\\s+([a-zA-Z0-9_$]+)\\s*=/g)];
        variableDeclarations.forEach(match => {
          const varName = match[1];
          const escapedVarName = varName.replace(/[-\\/\\\\^$*+?.()|[\\]{}]/g, '\\\\$&');
          const varRegex = new RegExp('\\\\b' + escapedVarName + '\\\\b', 'g');
          const occurrences = (code.match(varRegex) || []).length;
          if (occurrences === 1) {
            deadVariables.push({ name: varName, line: getLineFromIdx(code, match.index) });
          }
        });

        const secretRegex = /(?:api_key|token|secret|password|passwd|auth)\\s*=\\s*['"]([a-zA-Z0-9_\\-]{8,})['"]/gi;
        let secMatch;
        while ((secMatch = secretRegex.exec(code)) !== null) {
          issues.push({
            severity: 'error',
            text: 'Security Vulnerability: Hardcoded secrets detection. High probability trace found near key: "' + secMatch[1].substring(0,4) + '***"',
            category: 'security'
          });
        }

        if (code.includes('.innerHTML')) {
          issues.push({
            severity: 'warning',
            text: "Dangerous DOM manipulation Path: '.innerHTML' write path identified. Prefer using 'textContent' or Safe DOMPurify rules to avoid Client DOM XSS injections.",
            category: 'security'
          });
        }

        if (code.match(/\\beval\\s*\\(/)) {
          issues.push({
            severity: 'error',
            text: "Severe Security Threat: Evaluation instruction 'eval()' located. This offers direct script takeover pathways.",
            category: 'security'
          });
        }

        const classRegex = /class\\s+(\\w+)/g;
        let cls;
        while ((cls = classRegex.exec(code)) !== null) {
          astNodes.push({ type: 'ClassNode', name: cls[1], line: getLineFromIdx(code, cls.index) });
        }

        const funcRegex = /function\\s+(\\w+)|(\\w+)\\s*=\\s*\\([^)]*\\)\\s*=>/g;
        let fn;
        while ((fn = funcRegex.exec(code)) !== null) {
          const name = fn[1] || fn[2];
          if (name) astNodes.push({ type: 'FunctionNode', name: name, line: getLineFromIdx(code, fn.index) });
        }

        variableDeclarations.forEach(match => {
          astNodes.push({ type: 'VariableScope', name: match[1], line: getLineFromIdx(code, match.index) });
        });

      } else if (lang === 'html') {
        const inlineOnRegex = /\\bon[a-z]+\\s*=\\s*['"]/gi;
        if (inlineOnRegex.test(code)) {
          issues.push({
            severity: 'warning',
            text: "Insecure Handler Strategy: Inline 'onEvent' detected. Migrate event tracking rules to script listeners.",
            category: 'security'
          });
        }

        const tagRegex = /<([a-zA-Z0-9\\-]+)(?:\\s+[^>]*)*>/g;
        let tags;
        while ((tags = tagRegex.exec(code)) !== null) {
          if (!['html', 'head', 'body', 'meta', 'link'].includes(tags[1])) {
            astNodes.push({ type: 'HtmlElement', name: '<' + tags[1] + '>', line: getLineFromIdx(code, tags.index) });
          }
        }
      } else if (lang === 'css') {
        const cssRegex = /([.#\\w\\-\\s,:+>*]+)\\s*\\{/g;
        let sel;
        while ((sel = cssRegex.exec(code)) !== null) {
          const name = sel[1].trim();
          if (name && !name.startsWith('@')) {
            astNodes.push({ type: 'StyleRule', name: name, line: getLineFromIdx(code, sel.index) });
          }
        }
      }

      deadVariables.forEach(v => {
        issues.push({
          severity: 'warning',
          text: 'Static Linter Warning: "' + v.name + '" is declared but never referenced. Re-evaluate to maintain optimized payload metrics.',
          category: 'static'
        });
      });

      let maintainability = Math.max(20, Math.round(100 - (complexity * 4.5) - (deadVariables.length * 5) - (issues.length * 10)));
      if (lineCount > 150) maintainability -= 10;
      maintainability = Math.max(10, Math.min(100, maintainability));

      AppState.selectors.maintainabilityScore.textContent = maintainability + "/100";
      AppState.selectors.maintainabilityBar.style.width = maintainability + "%";
      if (maintainability > 75) {
        AppState.selectors.maintainabilityScore.className = "font-bold text-[#a6e3a1]";
        AppState.selectors.maintainabilityBar.className = "bg-[#a6e3a1] h-full transition-all duration-500";
      } else if (maintainability > 45) {
        AppState.selectors.maintainabilityScore.className = "font-bold text-[#f9e2af]";
        AppState.selectors.maintainabilityBar.className = "bg-[#f9e2af] h-full transition-all duration-500";
      } else {
        AppState.selectors.maintainabilityScore.className = "font-bold text-[#f38ba8]";
        AppState.selectors.maintainabilityBar.className = "bg-[#f38ba8] h-full transition-all duration-500";
      }

      const securityIssuesCount = issues.filter(i => i.category === 'security').length;
      let securityHealth = 100 - (securityIssuesCount * 35);
      securityHealth = Math.max(10, Math.min(100, securityHealth));
      
      AppState.selectors.securityBar.style.width = securityHealth + "%";
      if (securityHealth > 80) {
        AppState.selectors.securityScore.textContent = "Excellent Status";
        AppState.selectors.securityScore.className = "font-bold text-[#a6e3a1]";
        AppState.selectors.securityBar.className = "bg-[#a6e3a1] h-full transition-all duration-500";
      } else if (securityHealth > 45) {
        AppState.selectors.securityScore.textContent = "Vulnerable";
        AppState.selectors.securityScore.className = "font-bold text-[#f9e2af]";
        AppState.selectors.securityBar.className = "bg-[#f9e2af] h-full transition-all duration-500";
      } else {
        AppState.selectors.securityScore.textContent = "Critical Risk";
        AppState.selectors.securityScore.className = "font-bold text-[#f38ba8]";
        AppState.selectors.securityBar.className = "bg-[#f38ba8] h-full transition-all duration-500";
      }

      AppState.selectors.complexityMetric.textContent = complexity;
      AppState.selectors.deadCodeMetric.textContent = deadVariables.length;

      renderDiagnostics(issues);
      renderAst(astNodes);

      if (flashUI && AppState.selectors.analyzeBtn) {
        AppState.selectors.analyzeBtn.classList.add('ring-2', 'ring-[#89b4fa]/50');
        setTimeout(() => AppState.selectors.analyzeBtn.classList.remove('ring-2'), 400);
      }
    }

    function getLineFromIdx(code, index) {
      return code.substring(0, index).split('\\n').length;
    }

    function renderDiagnostics(issues) {
      AppState.selectors.diagnosticLogs.innerHTML = '';
      if (issues.length === 0) {
        AppState.selectors.diagnosticLogs.innerHTML = 
          '<div class="text-[#a6e3a1] flex gap-2 bg-[#a6e3a1]/10 p-3 rounded border border-[#a6e3a1]/30 text-xs">' +
            '<i data-lucide="check-circle" class="w-4 h-4 shrink-0"></i>' +
            '<span>Workspace clean! Passed security audits and static requirements.</span>' +
          '</div>';
      } else {
        issues.forEach(issue => {
          const isErr = issue.severity === 'error';
          const wrapper = document.createElement('div');
          wrapper.className = "flex gap-2.5 p-2.5 rounded border text-xs leading-relaxed " + (isErr ? "bg-[#f38ba8]/10 border-[#f38ba8]/30 text-[#f38ba8]" : "bg-[#f9e2af]/10 border-[#f9e2af]/30 text-[#f9e2af]");
          const iconType = isErr ? 'shield-alert' : 'alert-triangle';
          
          wrapper.innerHTML = 
            '<i data-lucide="' + iconType + '" class="w-4 h-4 shrink-0 mt-0.5"></i>' +
            '<div class="space-y-1">' +
              '<span class="font-bold block uppercase text-[9px] tracking-wide">' + (issue.category || 'Warning') + '</span>' +
              '<span>' + issue.text + '</span>' +
            '</div>';
          AppState.selectors.diagnosticLogs.appendChild(wrapper);
        });
      }
      lucide.createIcons({ node: AppState.selectors.diagnosticLogs });
    }

    function renderAst(nodes) {
      AppState.selectors.astTree.innerHTML = '';
      if (nodes.length === 0) {
        AppState.selectors.astTree.innerHTML = '<div class="text-[#585b70] italic p-1">No structures found in active scope.</div>';
        return;
      }

      nodes.forEach(node => {
        const element = document.createElement('div');
        element.className = "flex items-center justify-between bg-[#1e1e2e] p-2 rounded border border-[#313244] hover:border-[#cba6f7] transition-all cursor-pointer group";
        
        let icon = 'hash';
        let color = 'text-[#cba6f7]';
        if (node.type === 'ClassNode') { icon = 'package'; color = 'text-[#f9e2af]'; }
        if (node.type === 'FunctionNode') { icon = 'terminal'; color = 'text-[#89b4fa]'; }
        if (node.type === 'VariableScope') { icon = 'variable'; color = 'text-[#b4befe]'; }
        if (node.type === 'HtmlElement') { icon = 'globe'; color = 'text-[#a6e3a1]'; }
        if (node.type === 'StyleRule') { icon = 'brush'; color = 'text-[#f38ba8]'; }

        element.innerHTML = 
          '<div class="flex items-center gap-2 min-w-0">' +
            '<i data-lucide="' + icon + '" class="w-3.5 h-3.5 ' + color + ' shrink-0"></i>' +
            '<div class="truncate">' +
              '<span class="text-[9px] text-[#585b70] block uppercase leading-none font-semibold">' + node.type + '</span>' +
              '<span class="text-white text-xs block mt-0.5 font-mono truncate">' + node.name + '</span>' +
            '</div>' +
          '</div>' +
          '<span class="text-[9px] bg-[#313244] text-[#a6adc8] px-1.5 py-0.5 rounded font-bold tracking-wider group-hover:bg-[#cba6f7] group-hover:text-[#11111b] transition-colors">Ln &nbsp;' + node.line + '</span>';

        element.addEventListener('click', () => jumpToSourceLine(node.line));
        AppState.selectors.astTree.appendChild(element);
      });
      lucide.createIcons({ node: AppState.selectors.astTree });
    }

    function jumpToSourceLine(lineNum) {
      const lines = AppState.selectors.editorEl.value.split('\\n');
      let cursorOffset = 0;
      for (let i = 0; i < lineNum - 1; i++) {
        cursorOffset += lines[i].length + 1;
      }
      AppState.selectors.editorEl.focus();
      AppState.selectors.editorEl.setSelectionRange(cursorOffset, cursorOffset + lines[lineNum - 1].length);
    }

    function formatCurrentBuffer() {
      const code = AppState.selectors.editorEl.value;
      const lang = AppState.virtualFiles[AppState.currentFileIndex].language;
      let formatted = code;

      if (lang === 'javascript') {
        formatted = code
          .replace(/;\\s*$/gm, ';')
          .replace(/{\\s*$/gm, ' {\\n')
          .split('\\n')
          .map(line => line.trim())
          .filter((line, idx, arr) => !(line === '' && arr[idx - 1] === ''))
          .join('\\n');
          
        let depth = 0;
        formatted = formatted.split('\\n').map(line => {
          if (line.includes('}')) depth = Math.max(0, depth - 1);
          const lineOut = '  '.repeat(depth) + line;
          if (line.includes('{')) depth++;
          return lineOut;
        }).join('\\n');
      } else {
        formatted = code.split('\\n').map(line => line.trim()).join('\\n');
      }

      AppState.selectors.editorEl.value = formatted;
      AppState.virtualFiles[AppState.currentFileIndex].content = formatted;
      updateLineNumbers();
      runAnalysisSuite();
      debounceSaveToLocalStorage();
    }

    function minifyCurrentBuffer() {
      const code = AppState.selectors.editorEl.value;
      let minified = code
        .replace(/\\/\\*[\\s\\S]*?\\*\\//g, '')
        .replace(/(?:^|[^:])\\/\\/.*/gm, '')
        .replace(/[ \\t]+/g, ' ')
        .replace(/\\s*([{}()\\[\\];,=+\\-*/%&|<>:])\\s*/g, '$1')
        .trim();

      AppState.selectors.editorEl.value = minified;
      AppState.virtualFiles[AppState.currentFileIndex].content = minified;
      updateLineNumbers();
      runAnalysisSuite();
      debounceSaveToLocalStorage();
    }

    window.addEventListener('DOMContentLoaded', init);
  </script>
</body>
</html>\`;

export const CODE_INSPECTOR_SECTION_MD = \`
---

## The Code Inspector Pro V3.5

An advanced static code inspector, dead-code linter, AST parser, and executable compiler sandbox embedded directly inside your notebook:

\\\`\\\`\\\`html
\${CODE_INSPECTOR_HTML}
\\\`\\\`\\\`
\`;