const http = require('http'); // This helps us create the server
const fs = require('fs'); // This lets us read the HTML file
const path = require('path'); // This helps with file path management

const server = http.createServer((req, res) => {
    // Define the path to your index.html file
    const filePath = path.join(__dirname, 'index.html'); 

    // Read the HTML file and send it as a response
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            res.statusCode = 500; // If there is an error, send a server error
            res.end('Error loading the HTML file');
            return;
        }

        // Send the HTML content to the browser
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.end(data);
    });
});

// Start the server on port 3000
server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
