/**
 * SKILL.md Parser, Validator, and Ingestion Summary Synthesizer
 */
import { load, dump } from 'js-yaml';
import type {
  SkillRecord,
  SkillParameter,
  SkillReference,
  SkillExample,
  SkillCodeFile,
  IngestionSummaryJson,
} from '../types/skill';

export interface ParseSkillResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  skill: Partial<SkillRecord>;
  summaryJson: IngestionSummaryJson;
}

export function parseSkillMarkdown(markdown: string, fallbackAuthorId = 'system'): ParseSkillResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  let frontmatterObj: Record<string, any> = {};
  let bodyMarkdown = markdown;

  // 1. Extract YAML Frontmatter
  const frontmatterMatch = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (frontmatterMatch) {
    try {
      const parsed = load(frontmatterMatch[1]);
      if (parsed && typeof parsed === 'object') {
        frontmatterObj = parsed as Record<string, any>;
      } else {
        errors.push('Frontmatter is not a valid YAML object.');
      }
      bodyMarkdown = frontmatterMatch[2];
    } catch (e: any) {
      errors.push(`YAML Frontmatter parsing error: ${e.message}`);
    }
  } else {
    errors.push('Missing required YAML frontmatter block (enclosed between --- and ---).');
  }

  // 2. Extract Title from H1 or frontmatter
  let title = frontmatterObj.title || '';
  if (!title) {
    const titleMatch = bodyMarkdown.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      title = titleMatch[1].trim();
    } else {
      title = frontmatterObj.name ? frontmatterObj.name.replace(/[-_]/g, ' ') : 'Untitled Skill';
      warnings.push('No H1 heading found in markdown; synthesized title from skill name.');
    }
  }

  const name = frontmatterObj.name
    ? String(frontmatterObj.name).toLowerCase().replace(/[^a-z0-9-_]/g, '-')
    : title.toLowerCase().replace(/[^a-z0-9-_]/g, '-');

  if (!frontmatterObj.name) {
    errors.push("Missing 'name' attribute in frontmatter (machine identifier slug).");
  }

  const description =
    frontmatterObj.description ||
    extractSection(bodyMarkdown, ['Description', 'Overview', 'Mission']) ||
    '';

  if (!description) {
    errors.push("Skill description is missing in frontmatter and body.");
  }

  const category = frontmatterObj.category || 'General';
  const version = frontmatterObj.version || '1.0.0';

  // 3. Extract Parameters
  const parameters: SkillParameter[] = [];
  const parametersSection = extractSection(bodyMarkdown, ['Parameters', 'Arguments', 'Inputs', 'Schema']);
  if (parametersSection) {
    // Look for markdown tables or bulleted lists
    const tableRegex = /\|\s*`?([a-zA-Z0-9_-]+)`?\s*\|\s*`?([a-zA-Z0-9_\[\]]+)`?\s*\|\s*(true|false|yes|no|required|optional)\s*\|\s*([^|\n]+)\|/gi;
    let match;
    while ((match = tableRegex.exec(parametersSection)) !== null) {
      if (match[1].toLowerCase() === 'name' || match[1].toLowerCase() === 'parameter') continue;
      const isReq = ['true', 'yes', 'required'].includes(match[3].toLowerCase());
      parameters.push({
        name: match[1].trim(),
        type: match[2].trim(),
        required: isReq,
        description: match[4].trim(),
      });
    }

    if (parameters.length === 0) {
      // Fallback: bullet points like - `paramName` (type, required): description
      const bulletRegex = /[-*]\s+`?([a-zA-Z0-9_-]+)`?\s*(?:\(([^)]+)\))?:\s*(.+)/g;
      let bMatch;
      while ((bMatch = bulletRegex.exec(parametersSection)) !== null) {
        const rawMeta = bMatch[2] || 'string';
        const isReq = /required/i.test(rawMeta);
        const typeStr = rawMeta.replace(/required|optional/gi, '').replace(/[,; ]+/g, '').trim() || 'string';
        parameters.push({
          name: bMatch[1].trim(),
          type: typeStr,
          required: isReq,
          description: bMatch[3].trim(),
        });
      }
    }
  }

  // 4. Extract References
  const references: SkillReference[] = [];
  const refSection = extractSection(bodyMarkdown, ['References', 'Citations', 'Foundations', 'Research']);
  if (refSection) {
    const linkRegex = /[-*]\s+\[([^\]]+)\]\(([^)]+)\)(?:\s*[-–—:]\s*(.+))?/g;
    let rMatch;
    while ((rMatch = linkRegex.exec(refSection)) !== null) {
      references.push({
        title: rMatch[1].trim(),
        url: rMatch[2].trim(),
        type: 'doc',
        description: (rMatch[3] || '').trim(),
      });
    }
    if (references.length === 0) {
      // Simple text items
      const plainRegex = /[-*]\s+(.+)/g;
      let pMatch;
      while ((pMatch = plainRegex.exec(refSection)) !== null) {
        references.push({
          title: pMatch[1].trim(),
          type: 'historical',
          description: pMatch[1].trim(),
        });
      }
    }
  }

  // 5. Extract Code blocks
  const codeFiles: Record<string, SkillCodeFile> = {};
  const codeBlockRegex = /```([a-zA-Z0-9_-]+)?(?:\s+(?:file|name|path)=["']?([^"'\s]+)["']?)?\r?\n([\s\S]*?)```/g;
  let codeMatch;
  let codeIdx = 1;
  while ((codeMatch = codeBlockRegex.exec(bodyMarkdown)) !== null) {
    const lang = codeMatch[1] || 'text';
    const filename = codeMatch[2] || `script_${codeIdx}.${getExtForLang(lang)}`;
    codeFiles[filename] = {
      filename,
      language: lang,
      description: `Associated code asset ${filename}`,
      content: codeMatch[3].trim(),
    };
    codeIdx++;
  }

  // 6. Extract Examples
  const examples: SkillExample[] = [];
  const exampleSection = extractSection(bodyMarkdown, ['Examples', 'Usage Examples', 'Scenarios', 'Walkthroughs']);
  if (exampleSection) {
    const exampleSubsections = exampleSection.split(/(?=###\s+)/);
    for (const exSub of exampleSubsections) {
      const exTitleMatch = exSub.match(/###\s+(.+)/);
      if (exTitleMatch) {
        const titleText = exTitleMatch[1].trim();
        const promptMatch = exSub.match(/(?:Prompt|User Request|Input):\s*["']?([\s\S]*?)["']?(?=\n\n|\n[A-Z]|$)/i);
        const outcomeMatch = exSub.match(/(?:Outcome|Result|Output|Action):\s*["']?([\s\S]*?)["']?(?=\n\n|\n[A-Z]|$)/i);
        examples.push({
          title: titleText,
          scenario: exSub.slice(0, 300).trim(),
          prompt: promptMatch ? promptMatch[1].trim() : titleText,
          invocations: '',
          expectedOutcome: outcomeMatch ? outcomeMatch[1].trim() : 'Executes instructions according to spec.',
        });
      }
    }
  }

  // 7. Extract Dependencies
  const dependencies: string[] = [];
  if (Array.isArray(frontmatterObj.dependencies)) {
    dependencies.push(...frontmatterObj.dependencies.map(String));
  } else if (typeof frontmatterObj.dependencies === 'string') {
    dependencies.push(frontmatterObj.dependencies);
  }

  // 8. Build Ingestion Summary JSON
  const summaryJson: IngestionSummaryJson = {
    schemaVersion: '2026.1',
    skillId: name,
    name,
    title,
    description: description.slice(0, 1500),
    category,
    version,
    triggerPreconditions: extractBullets(extractSection(bodyMarkdown, ['Preconditions', 'Triggers', 'When to use', 'Requirements'])),
    routingKeywords: extractKeywords(title + ' ' + description + ' ' + (frontmatterObj.tags || []).join(' ')),
    parametersSchema: {
      type: 'object',
      properties: parameters.reduce((acc, p) => {
        acc[p.name] = {
          type: p.type,
          description: p.description,
          ...(p.enum ? { enum: p.enum } : {}),
        };
        return acc;
      }, {} as Record<string, any>),
      required: parameters.filter((p) => p.required).map((p) => p.name),
    },
    dependencies: {
      npm: dependencies.filter((d) => !d.startsWith('python:') && !d.startsWith('oauth:')),
      python: dependencies.filter((d) => d.startsWith('python:')).map((d) => d.replace('python:', '')),
      oauthScopes: dependencies.filter((d) => d.startsWith('https://www.googleapis.com')).length > 0
        ? dependencies.filter((d) => d.startsWith('https://www.googleapis.com'))
        : ['https://www.googleapis.com/auth/drive.file'],
    },
    evaluationRubric: {
      priority: frontmatterObj.priority || 1,
      thermodynamicFootprint: frontmatterObj.thermodynamicFootprint || 'low',
      requiresHumanReview: Boolean(frontmatterObj.requiresHumanReview),
      verificationLevel: 'strict',
    },
    bestSuitedFor: extractBullets(extractSection(bodyMarkdown, ['Best Suited For', 'Ideal For', 'Use cases', 'When to Use'])),
    unsuitedFor: extractBullets(extractSection(bodyMarkdown, ['Unsuited For', 'Do Not Use', 'When NOT to use', 'Limitations'])),
  };

  const skill: Partial<SkillRecord> = {
    id: name,
    name,
    title,
    description,
    category,
    version,
    authorId: fallbackAuthorId,
    authorEmail: 'agent-engine@system.internal',
    skillMarkdown: markdown,
    summaryJson: JSON.stringify(summaryJson, null, 2),
    parameters: JSON.stringify(parameters, null, 2),
    examples: JSON.stringify(examples, null, 2),
    references: JSON.stringify(references, null, 2),
    dependencies: JSON.stringify(dependencies, null, 2),
    codeFiles: JSON.stringify(codeFiles, null, 2),
    status: errors.length === 0 ? 'verified' : 'draft',
    isPublic: true,
  };

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    skill,
    summaryJson,
  };
}

function extractSection(content: string, headers: string[]): string {
  for (const h of headers) {
    const escaped = h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`##+\\s+${escaped}[^\\n]*\\n([\\s\\S]*?)(?=\\n##+|$)`, 'i');
    const match = content.match(regex);
    if (match && match[1].trim()) {
      return match[1].trim();
    }
  }
  return '';
}

function extractBullets(text: string): string[] {
  if (!text) return [];
  const bullets: string[] = [];
  const regex = /[-*]\s+([^\n]+)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    bullets.push(match[1].replace(/^\*\*|\*\*$/g, '').trim());
  }
  return bullets.slice(0, 8);
}

function extractKeywords(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !['with', 'that', 'this', 'from', 'when', 'into', 'have', 'your'].includes(w));
  return Array.from(new Set(words)).slice(0, 15);
}

function getExtForLang(lang: string): string {
  switch (lang.toLowerCase()) {
    case 'typescript':
    case 'ts':
      return 'ts';
    case 'javascript':
    case 'js':
      return 'js';
    case 'python':
    case 'py':
      return 'py';
    case 'json':
      return 'json';
    case 'yaml':
    case 'yml':
      return 'yaml';
    case 'markdown':
    case 'md':
      return 'md';
    case 'bash':
    case 'sh':
      return 'sh';
    default:
      return 'txt';
  }
}

/**
 * Generate standardized SKILL.md from structured SkillRecord
 */
export function generateSkillMarkdown(skill: Partial<SkillRecord>): string {
  let parameters: SkillParameter[] = [];
  let references: SkillReference[] = [];
  let examples: SkillExample[] = [];
  let codeFiles: Record<string, SkillCodeFile> = {};
  let dependencies: string[] = [];

  try {
    if (skill.parameters) parameters = JSON.parse(skill.parameters);
    if (skill.references) references = JSON.parse(skill.references);
    if (skill.examples) examples = JSON.parse(skill.examples);
    if (skill.codeFiles) codeFiles = JSON.parse(skill.codeFiles);
    if (skill.dependencies) dependencies = JSON.parse(skill.dependencies);
  } catch (e) {
    console.error('Error parsing JSON fields for markdown generation', e);
  }

  const frontmatter = {
    name: skill.name || 'unnamed-skill',
    version: skill.version || '1.0.0',
    category: skill.category || 'General',
    description: skill.description || '',
    dependencies: dependencies,
  };

  let md = `---\n${dump(frontmatter)}---\n\n`;
  md += `# ${skill.title || skill.name || 'Skill Specification'}\n\n`;

  md += `## Description & Mission\n${skill.description || 'No description provided.'}\n\n`;

  md += `## Parameters & Invocation Schemas\n`;
  if (parameters.length > 0) {
    md += `| Parameter | Type | Required | Description |\n`;
    md += `|---|---|---|---|\n`;
    for (const p of parameters) {
      md += `| \`${p.name}\` | \`${p.type}\` | ${p.required ? 'true' : 'false'} | ${p.description} |\n`;
    }
  } else {
    md += `_No specific parameters declared for this skill._\n`;
  }
  md += `\n`;

  md += `## Operational Rules & Preconditions\n`;
  md += `- Use this skill when requested functionality aligns with ${skill.title || skill.name}.\n`;
  md += `- Validate all input parameters against declared schema before invocation.\n`;
  md += `- Halt execution and notify caller if permission gates or prerequisites are missing.\n\n`;

  if (examples.length > 0) {
    md += `## In-Context Examples & Multi-Turn Walkthroughs\n\n`;
    for (const ex of examples) {
      md += `### ${ex.title}\n`;
      md += `**Prompt**: ${ex.prompt}\n\n`;
      if (ex.scenario) md += `**Scenario Context**: ${ex.scenario}\n\n`;
      if (ex.expectedOutcome) md += `**Expected Outcome**: ${ex.expectedOutcome}\n\n`;
    }
  }

  if (Object.keys(codeFiles).length > 0) {
    md += `## Scaffolded Code & Reference Implementations\n\n`;
    for (const file of Object.values(codeFiles)) {
      md += `### \`${file.filename}\`\n`;
      if (file.description) md += `_${file.description}_\n\n`;
      md += `\`\`\`${file.language || 'text'}\n${file.content}\n\`\`\`\n\n`;
    }
  }

  if (references.length > 0) {
    md += `## References & Technical Foundations\n\n`;
    for (const ref of references) {
      if (ref.url) {
        md += `- [${ref.title}](${ref.url}) - ${ref.description}\n`;
      } else {
        md += `- **${ref.title}**: ${ref.description}\n`;
      }
    }
    md += `\n`;
  }

  return md;
}
