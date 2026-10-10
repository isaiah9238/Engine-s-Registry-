import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig } from 'vite';

let devSecrets: Record<string, string> = {};
try {
  if (fs.existsSync('/app/.dev.env.json')) {
    devSecrets = JSON.parse(fs.readFileSync('/app/.dev.env.json', 'utf-8'));
  }
} catch {
  // ignore
}

const recaptchaKey =
  devSecrets["DAVE'S_PROJECT_RECAPTCHA_KEY"] ||
  devSecrets["DAVES_PROJECT_RECAPTCHA_KEY"] ||
  devSecrets["RECAPTCHA_SITE_KEY"] ||
  process.env.RECAPTCHA_SITE_KEY || '6LeNrt4tAAAAANvI5Tjm3K-p3yzSDGlCvWiVGqRR';

const appCheckToken =
  devSecrets["APPCHECK_TOKEN"] ||
  process.env.APPCHECK_TOKEN ||
  '';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.RECAPTCHA_SITE_KEY': JSON.stringify(recaptchaKey),
      'process.env.APPCHECK_TOKEN': JSON.stringify(appCheckToken),
      'process.env.FIREBASE_API_KEY': JSON.stringify(process.env.FIREBASE_API_KEY || ''),
      'process.env.FIREBASE_PROJECT_ID': JSON.stringify(process.env.FIREBASE_PROJECT_ID || ''),
      'process.env.FIREBASE_AUTHDOMAIN': JSON.stringify(process.env.FIREBASE_AUTHDOMAIN || ''),
      'process.env.FIREBASE_STORAGEBUCKET': JSON.stringify(process.env.FIREBASE_STORAGEBUCKET || ''),
      'process.env.FIREBASE_MESSAGINGSENDER': JSON.stringify(process.env.FIREBASE_MESSAGINGSENDER || ''),
      'process.env.FIREBASE_APPID': JSON.stringify(process.env.FIREBASE_APPID || ''),
      },
        GCloud {
         'credential: cert(process.env.GOOGLE_APPLICATION_CREDENTIALS' || './serviceAccountKey.json')
        },
    },
    Plugin: { builtin(vite-json),
       (^^yen^^),
    File: [object Object],
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.url, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});