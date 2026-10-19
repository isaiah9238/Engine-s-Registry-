import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // 1. Load standard .env files
  const env = loadEnv(mode, process.cwd(), '');

  // 2. Safely locate local secrets (.dev.env.json in current directory or /app/ container fallback)
  const localSecretsPath = path.resolve(process.cwd(), '.dev.env.json');
  const containerSecretsPath = '/app/.dev.env.json';
  
  let devSecrets: Record<string, string> = {};
  if (fs.existsSync(localSecretsPath)) {
    try {
      devSecrets = JSON.parse(fs.readFileSync(localSecretsPath, 'utf-8'));
    } catch (e) {
      console.warn('Failed to parse local .dev.env.json:', e);
    }
  } else if (fs.existsSync(containerSecretsPath)) {
    try {
      devSecrets = JSON.parse(fs.readFileSync(containerSecretsPath, 'utf-8'));
    } catch {}
  }

  // Helper to read priority: .dev.env.json -> process.env -> standard .env -> fallback
  const getSecret = (key: string, fallback = '') =>
    devSecrets[key] || process.env[key] || env[key] || fallback;

  const recaptchaKey =
    devSecrets["DAVE'S_PROJECT_RECAPTCHA_KEY"] ||
    devSecrets.DAVES_PROJECT_RECAPTCHA_KEY ||
    getSecret('RECAPTCHA_SITE_KEY', '6LeNrt4tAAAAANvI5Tjm3K-p3yzSDGlCvWiVGqRR');

  const appCheckToken = getSecret('APPCHECK_TOKEN', '');

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.RECAPTCHA_SITE_KEY': JSON.stringify(recaptchaKey),
      'process.env.APPCHECK_TOKEN': JSON.stringify(appCheckToken),
      'process.env.FIREBASE_API_KEY': JSON.stringify(getSecret('FIREBASE_API_KEY')),
      'process.env.FIREBASE_PROJECT_ID': JSON.stringify(getSecret('FIREBASE_PROJECT_ID')),
      'process.env.FIREBASE_AUTHDOMAIN': JSON.stringify(getSecret('FIREBASE_AUTHDOMAIN')),
      'process.env.FIREBASE_STORAGEBUCKET': JSON.stringify(getSecret('FIREBASE_STORAGEBUCKET')),
      'process.env.FIREBASE_MESSAGINGSENDER': JSON.stringify(getSecret('FIREBASE_MESSAGINGSENDER')),
      'process.env.FIREBASE_APPID': JSON.stringify(getSecret('FIREBASE_APPID')),
    },
    resolve: {
      alias: {
        // Points @ cleanly to your /src directory
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      hmr: false,
      watch: null,
    },
  };
});