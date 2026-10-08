/**
 * Google Drive Integration Service
 * Uses client-side Bearer token authentication via Firebase Auth OAuth credential.
 */
import type { SkillRecord } from '../types/skill';

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
  modifiedTime?: string;
  size?: string;
}

export async function listDriveSkillFiles(accessToken: string): Promise<DriveFileItem[]> {
  const query = encodeURIComponent("name contains '.md' or name contains 'skill' or mimeType = 'application/json'");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,createdTime,modifiedTime,size)&pageSize=30`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Drive API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.files || [];
}

export async function uploadSkillToDrive(
  accessToken: string,
  skill: SkillRecord,
  format: 'markdown' | 'summary_json' | 'bundle' = 'markdown'
): Promise<DriveFileItem> {
  let filename = `${skill.name}.SKILL.md`;
  let fileContent = skill.skillMarkdown;
  let contentType = 'text/markdown';

  if (format === 'summary_json') {
    filename = `${skill.name}.summary.json`;
    fileContent = skill.summaryJson;
    contentType = 'application/json';
  } else if (format === 'bundle') {
    filename = `${skill.name}-skill-package.json`;
    fileContent = JSON.stringify(
      {
        skillRecord: skill,
        exportedAt: new Date().toISOString(),
        engine: 'Agent Engine 2026',
      },
      null,
      2
    );
    contentType = 'application/json';
  }

  const metadata = {
    name: filename,
    description: `Agent Engine Skill definition for ${skill.title}`,
    mimeType: contentType,
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${contentType}\r\n\r\n` +
    fileContent +
    closeDelimiter;

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to upload to Google Drive: ${err}`);
  }

  return response.json();
}

export async function fetchDriveFileContent(accessToken: string, fileId: string): Promise<string> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Failed to fetch file content from Google Drive: ${err}`);
  }

  return response.text();
}

export async function deleteDriveFile(accessToken: string, fileId: string): Promise<void> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    const err = await response.text();
    throw new Error(`Failed to delete file from Google Drive: ${err}`);
  }
}
