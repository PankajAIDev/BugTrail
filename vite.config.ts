import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { handleExplain } from './server/explainHandler.ts';
import { handleScanCode } from './server/scanHandler.ts';

function apiServerPlugin(): Plugin {
  return {
    name: 'api-server-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const urlPath = req.url ? req.url.split('?')[0] : '';

        // Handle /api/explain
        if (urlPath === '/api/explain' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const payload = JSON.parse(body || '{}');
              const result = await handleExplain(payload);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: false,
                  error: err?.message || 'Server error',
                  isAiGenerated: false,
                })
              );
            }
          });
          return;
        }

        // Handle /api/scan
        if (urlPath === '/api/scan' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const payload = JSON.parse(body || '{}');
              const result = await handleScanCode(payload);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: false,
                  error: err?.message || 'Server error during scan',
                  hasBugs: false,
                  findings: [],
                  summaryMessage: 'Internal server error while analyzing code.',
                  isAiGenerated: false,
                })
              );
            }
          });
          return;
        }

        // Handle /api/status
        if (urlPath === '/api/status' && req.method === 'GET') {
          const hasKey = Boolean(
            process.env.GEMINI_API_KEY &&
              process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' &&
              process.env.GEMINI_API_KEY.trim() !== ''
          );
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: 'online', hasGeminiKey: hasKey }));
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
