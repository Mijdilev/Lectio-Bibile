import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Enable CORS for external tools (e.g. PWABuilder, manifest checkers)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Explicitly serve public assets with CORS headers
app.use(express.static(path.resolve(__dirname, 'public'), {
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

// Server-side initialization of Gemini client
const getApiKey = () =>
  process.env.GEMINI_API_KEY ||
  process.env.API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.GOOGLE_GENAI_API_KEY ||
  '';

const ai = new GoogleGenAI({
  apiKey: getApiKey(),
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_INSTRUCTION = `You are Lectio Guide, a contemplative, scholarly biblical guide and reading curriculum architect inside the Lectio Bible Reader app.
You maintain a gentle, reflective, and deeply informed voice. You help users understand scriptures, thematic connections, historical context, and create personalized reading plans.

When a user asks for a reading plan (such as "I want a 30 day plan for Jeremiah's book linked to revelation" or any thematic plan):
1. In your conversational text, explain the theological and literary reasons for connecting these books/passages and how to approach the study.
2. Provide a structured plan block in exact JSON format enclosed inside a markdown \`\`\`json ... \`\`\` block so Lectio can provide an interactive 1-tap "Save to My Plans" button in the chat.
The JSON must follow this exact structure:
{
  "type": "reading_plan",
  "title": "Jeremiah & Revelation: 30-Day Prophetic Journey",
  "description": "A 30-day contemplative reading plan weaving Jeremiah's prophecies of destruction and renewal with Revelation's ultimate restoration.",
  "durationDays": 30,
  "days": [
    {
      "day": 1,
      "title": "The Call of the Prophet & The Throne of Glory",
      "focus": "God's sovereignty over calling His servants amidst turmoil.",
      "readings": [
        { "book": "jeremiah", "chapter": 1, "display": "Jeremiah 1" },
        { "book": "revelation", "chapter": 1, "display": "Revelation 1" }
      ]
    }
  ]
}
Make sure every day has valid book slugs: genesis, exodus, leviticus, numbers, deuteronomy, joshua, judges, ruth, 1samuel, 2samuel, 1kings, 2kings, 1chronicles, 2chronicles, ezra, nehemiah, esther, job, psalms, proverbs, ecclesiastes, songofsolomon, isaiah, jeremiah, lamentations, ezekiel, daniel, hosea, joel, amos, obadiah, jonah, micah, nahum, habakkuk, zephaniah, haggai, zechariah, malachi, matthew, mark, luke, john, acts, romans, 1corinthians, 2corinthians, galatians, ephesians, philippians, colossians, 1thessalonians, 2thessalonians, 1timothy, 2timothy, titus, philemon, hebrews, james, 1peter, 2peter, 1john, 2john, 3john, jude, revelation.

If the user asks general Bible questions, provide profound, illuminating insights without plan JSON.`;

// Multi-turn chat endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Messages array is required.' });
      return;
    }

    const key = getApiKey();
    if (!key) {
      res.status(500).json({
        error: 'GEMINI_API_KEY is not configured in the server environment.',
      });
      return;
    }

    const client = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const contents = messages.map(m => ({
      role: m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.text }],
    }));

    let response;
    try {
      response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });
    } catch (err: any) {
      if (err?.status === 503 || err?.message?.includes('503') || err?.message?.includes('high demand')) {
        console.warn('gemini-3.8-flash 503 spike, falling back to gemini-3.1-flash-lite');
        response = await client.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
          },
        });
      } else {
        throw err;
      }
    }

    res.json({ text: response.text ?? '' });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate response from Gemini.',
    });
  }
});

// Dedicated structured plan generation endpoint
app.post('/api/plans/generate', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required.' });
      return;
    }

    const key = getApiKey();
    if (!key) {
      res.status(500).json({
        error: 'GEMINI_API_KEY is not configured in the server environment.',
      });
      return;
    }

    const client = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Create a structured Bible reading plan based on the following request: "${prompt}".
Include all days with specific chapter readings and canonical book slugs.`,
      config: {
        systemInstruction:
          'You are an expert biblical reading curriculum designer. Return valid JSON strictly matching the requested schema with canonical lower-case book slugs.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            durationDays: { type: Type.INTEGER },
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  focus: { type: Type.STRING },
                  readings: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        book: { type: Type.STRING },
                        chapter: { type: Type.INTEGER },
                        display: { type: Type.STRING },
                      },
                      required: ['book', 'chapter', 'display'],
                    },
                  },
                },
                required: ['day', 'title', 'focus', 'readings'],
              },
            },
          },
          required: ['title', 'description', 'durationDays', 'days'],
        },
      },
    });

    const parsed = JSON.parse(response.text ?? '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Plan generation error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate structured plan.',
    });
  }
});

// Start Express server and mount Vite
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
