import fs from 'fs';
import path from 'path';

interface SkillManifest {
  id?: string;
  name?: string;
  title?: string;
  version?: string;
  category?: string;
  description?: string;
  tags?: string[];
  entrypoint?: string;
  parametersSchema?: Record<string, any>;
}

async function ingestAll() {
  const skillsDir = path.resolve(process.cwd(), 'skills');
  const skillFolders = fs.readdirSync(skillsDir);

  for (const folder of skillFolders) {
    const folderPath = path.join(skillsDir, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;

    const manifestPath = path.join(folderPath, 'manifest.json');
    if (!fs.existsSync(manifestPath)) {
      console.log(`Skipping [${folder}] (no manifest.json found)`);
      continue;
    }

    let manifest: SkillManifest;
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch (parseErr: any) {
      console.error(`Invalid JSON in [${folder}/manifest.json]:`, parseErr.message);
      continue;
    }

    const skillId = manifest.id || folder;
    const skillName = manifest.name || folder;
    const skillTitle = manifest.title || skillName;
    const skillDescription = manifest.description || '';
    const skillCategory = manifest.category || 'general';
    const skillTags = Array.isArray(manifest.tags) ? manifest.tags : [];

    console.log(`Ingesting skill: ${skillId}...`);

    // 1. Generate 768-D embedding via local server API
    const semanticText = `${skillName} ${skillTitle} ${skillDescription} ${skillTags.join(' ')}`.trim();
    let embedding: number[] = [];

    try {
      const embedRes = await fetch('http://localhost:3000/api/embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: semanticText }),
      });
      if (embedRes.ok) {
        const embedJson = await embedRes.json();
        embedding = embedJson.embedding || [];
      } else {
        console.warn(` Embedding endpoint warning for ${skillId}: HTTP ${embedRes.status}`);
      }
    } catch (e: any) {
      console.warn(` Could not reach embed endpoint for ${skillId}:`, e.message);
    }

    // 2. Register skill payload via local server API
    const payload = {
      ...manifest,
      id: skillId,
      name: skillName,
      title: skillTitle,
      category: skillCategory,
      tags: skillTags,
      embedding,
      updatedAt: new Date().toISOString(),
    };

    try {
      const saveRes = await fetch('http://localhost:3000/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (saveRes.ok) {
        console.log(`  Successfully registered: ${skillId} (Embedded: ${embedding.length} dims)`);
      } else {
        const errText = await saveRes.text();
        console.error(`  Failed to register: ${skillId} -> ${errText}`);
      }
    } catch (err: any) {
      console.error(`  Network error posting ${skillId}:`, err.message);
    }
  }
}

ingestAll().catch(console.error);