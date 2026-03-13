const https = require('https');

const prompt = encodeURIComponent('A beautiful sunset over the ocean');
// Note: query parameters currently cause 500 errors on Pollinations.
const url = `https://image.pollinations.ai/prompt/${prompt}`;

console.log('Testing URL:', url);

https.get(url, (res) => {
    console.log('Status Code:', res.statusCode);
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        if (res.statusCode !== 200) {
            console.log('Response body:', data);
        } else {
            console.log('Success! Received', data.length, 'bytes');
        }
    });

}).on('error', (err) => {
    console.error('Error:', err.message);
});
