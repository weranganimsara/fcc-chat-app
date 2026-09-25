import http from 'http';
import fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';

const PORT = 3001;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<h1>Chat App Server</h1>');
});

const wss = new WebSocketServer({ server });

function broadcast(msgObj) {
  const payload = JSON.stringify(msgObj);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

wss.on('connection', (socket, req) => {
  const username = new URL(req.url, "http://localhost").searchParams.get("username");
  broadcast({ type: 'system', text: `${username} joined` });

  socket.on('message', (rawData) => {
    try {
      const { username: user, text } = JSON.parse(rawData);
      broadcast({ type: 'chat', username: user, text });
    } catch (e) {}
  });

  socket.on('close', () => {
    broadcast({ type: 'system', text: `${username} left` });
  });
});

server.listen(PORT, () => {
  console.log(`Chat server running at http://localhost:${PORT}`);
});
