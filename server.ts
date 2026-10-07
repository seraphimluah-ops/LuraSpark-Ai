import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { apiRouter } from './src/server/apiRouter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '25mb' }));
app.use('/api', apiRouter);

// Serve static frontend in production or dev if dist exists
const distPath = path.resolve(__dirname, 'dist');
const indexPath = path.join(distPath, 'index.html');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ error: 'API endpoint not found' });
    return;
  }

  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // If dist doesn't exist yet, serve a basic fallback that redirects to root or renders placeholder
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>LuraSpark AI - Initializing</title>
          <style>
            body { background: #131314; color: #E3E3E3; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
            .card { text-align: center; padding: 2rem; background: #1e1f20; border-radius: 1rem; border: 1px solid rgba(255,255,255,0.1); }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>LuraSpark AI is starting up...</h2>
            <p>Please refresh the page in 5 seconds.</p>
          </div>
        </body>
      </html>
    `);
  }
});

// Always listen on PORT unless running as Vercel serverless function
if (!process.env.VERCEL) {
  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`LuraSpark AI server running on port ${PORT}`);
  });
}

export default app;
