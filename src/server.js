import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Required for __dirname to work in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

// Serve static files from 'public' folder
const publicDirectory = path.join(__dirname, 'public');

const server = http.createServer((req, res) => {
    // Get file path
    let filePath = path.join(publicDirectory, req.url === '/' ? 'index.html' : req.url);

    // Extension and Content-Type
    const ext = path.extname(filePath);
    let contentType = 'text/html';

    switch (ext) {
        case '.css':
            contentType = 'text/css';
            break;
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
        case '.jpeg':
            contentType = 'image/jpeg';
            break;
    }

    // Read file
    fs.readFile(filePath, (err, content) => {
        if (err) {
            console.error('Error reading file:', filePath);
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('404 - Page Not Found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
