import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleExplain } from './server/explainHandler.ts';
import { handleScanCode } from './server/scanHandler.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '2mb' }));

// API Endpoints
app.post('/api/explain', async (req, res) => {
  try {
    const result = await handleExplain(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || 'Server error generating explanation',
      isAiGenerated: false
    });
  }
});

app.post('/api/scan', async (req, res) => {
  try {
    const result = await handleScanCode(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || 'Server error analyzing code',
      hasBugs: false,
      findings: [],
      summaryMessage: 'Internal server error while analyzing code.',
      isAiGenerated: false
    });
  }
});

app.get('/api/status', (req, res) => {
  const hasKey = Boolean(
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' &&
    process.env.GEMINI_API_KEY.trim() !== ''
  );
  res.json({ status: 'online', hasGeminiKey: hasKey });
});

// Production static file serving
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

// Start server if run directly
if (process.argv[1] === __filename) {
  app.listen(port, '0.0.0.0', () => {
    console.log(`BugTrail AI server listening on http://0.0.0.0:${port}`);
  });
}

export default app;
