/**
 * Gmail Integration Service
 * Uses client-side Bearer token authentication via Firebase Auth OAuth credential.
 */
import type { SkillRecord } from '../types/skill';

export async function sendSkillViaGmail(
  accessToken: string,
  toEmail: string,
  skill: SkillRecord,
  notes?: string
): Promise<{ id: string; threadId: string }> {
  const subject = `[Agent Engine Skill] ${skill.title} (${skill.name} v${skill.version})`;

  const emailLines = [
    `To: ${toEmail}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    '',
    `<div style="font-family: ui-sans-serif, system-ui, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">`,
    `  <div style="background: #1e1b4b; padding: 16px; border-radius: 6px; margin-bottom: 20px;">`,
    `    <h1 style="color: #ffffff; font-size: 20px; margin: 0;">Agent Engine &mdash; Skill Registration Digest</h1>`,
    `    <p style="color: #cbd5e1; font-size: 13px; margin: 4px 0 0 0;">Ingestion Pipeline Package v${skill.version}</p>`,
    `  </div>`,
    `  <h2 style="color: #0f172a; margin-top: 0;">${skill.title}</h2>`,
    `  <p style="color: #475569; font-size: 15px; line-height: 1.6;">${skill.description}</p>`,
    notes ? `  <div style="background: #f8fafc; border-left: 4px solid #6366f1; padding: 12px; margin: 16px 0; font-size: 14px; color: #334155;"><strong>Author Notes:</strong> ${notes}</div>` : '',
    `  <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">`,
    `    <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px; font-weight: 600; color: #64748b;">Identifier:</td><td style="padding: 8px; font-family: monospace; color: #1e293b;">${skill.name}</td></tr>`,
    `    <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px; font-weight: 600; color: #64748b;">Category:</td><td style="padding: 8px; color: #1e293b;">${skill.category}</td></tr>`,
    `    <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px; font-weight: 600; color: #64748b;">Status:</td><td style="padding: 8px; color: #16a34a; font-weight: 600;">${skill.status.toUpperCase()}</td></tr>`,
    `    <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px; font-weight: 600; color: #64748b;">Updated:</td><td style="padding: 8px; color: #1e293b;">${new Date(skill.updatedAt).toLocaleString()}</td></tr>`,
    `  </table>`,
    `  <h3 style="color: #1e293b; font-size: 16px;">Quick Ingestion Summary JSON</h3>`,
    `  <pre style="background: #0f172a; color: #38bdf8; padding: 14px; border-radius: 6px; font-size: 12px; overflow-x: auto; white-space: pre-wrap;">${escapeHtml(skill.summaryJson)}</pre>`,
    `  <h3 style="color: #1e293b; font-size: 16px; margin-top: 24px;">SKILL.md Source Snippet</h3>`,
    `  <pre style="background: #f1f5f9; color: #334155; padding: 14px; border-radius: 6px; font-size: 12px; overflow-x: auto; max-height: 250px;">${escapeHtml(skill.skillMarkdown.slice(0, 1500))}...</pre>`,
    `  <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; text-align: center;">Dispatched via Agent Engine with Google Workspace OAuth.</p>`,
    `</div>`
  ].join('\r\n');

  // Base64URL encode the RFC 2822 email
  const base64Encoded = btoa(unescape(encodeURIComponent(emailLines)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: base64Encoded }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to send email via Gmail: ${err}`);
  }

  return response.json();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
