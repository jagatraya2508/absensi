const http = require('http');

function testEndpoint(path) {
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: path,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log(`\nTesting ${path}:`);
            console.log(`Status Code: ${res.statusCode}`);
            console.log(`Content-Type: ${res.headers['content-type']}`);
            console.log(`Body Sample: ${data.substring(0, 100)}...`);
        });
    });

    req.on('error', (error) => {
        console.error(`Error testing ${path}:`, error.message);
    });

    req.end();
}

console.log('Testing Backend API...');
testEndpoint('/api/health'); // Should return 200 JSON
testEndpoint('/api/schedule/off-days'); // Should return 401 (Unauthorized) JSON, or 404 if missing. NOT HTML.
