import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import fs from 'fs'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'save-context-middleware',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/api/save-context' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', () => {
              try {
                const { type, content } = JSON.parse(body);
                const filePath = path.resolve(__dirname, `context_${type}.txt`);
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`[AGENT_BRIDGE] Saved ${type} context to ${filePath}`);
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, path: filePath }));
              } catch (err) {
                res.statusCode = 500;
                res.end(JSON.stringify({ success: false, error: err.message }));
              }
            });
          } else if (req.url === '/api/agent-request' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk.toString(); });
            req.on('end', () => {
              const filePath = path.resolve(__dirname, `agent_request.json`);
              fs.writeFileSync(filePath, body, 'utf8');
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true }));
            });
          } else if (req.url === '/api/agent-response' && req.method === 'GET') {
            const filePath = path.resolve(__dirname, `agent_response.json`);
            if (fs.existsSync(filePath)) {
              const data = fs.readFileSync(filePath, 'utf8');
              res.statusCode = 200;
              res.end(data);
              fs.unlinkSync(filePath); // 读取后删除，表示已消费
            } else {
              res.statusCode = 404;
              res.end(JSON.stringify({ pending: true }));
            }
          } else {
            next();
          }
        });
      }
    }
  ],
})
