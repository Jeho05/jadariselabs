const fs = require('fs');

const API_KEY = process.env.HUGGINGFACE_API_KEY ;

async function testEndpoint(url) {
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ inputs: "hello world" })
        });
        let errorText = null;
        if (res.status !== 200) {
            errorText = await res.text();
        }
        return { url, status: res.status, error: errorText };
    } catch (err) {
        return { url, status: 'error', error: err.message };
    }
}

async function run() {
    const modelId = 'gpt2';
    const endpoints = [
        `https://router.huggingface.co/models/${modelId}`,
        `https://router.huggingface.co/hf-inference/models/${modelId}`,
        `https://router.huggingface.co/hf-inference/v1/models/${modelId}`
    ];

    const results = [];
    for (const ep of endpoints) {
        const res = await testEndpoint(ep);
        results.push(res);
    }

    fs.writeFileSync('test-hf-gpt2-results.json', JSON.stringify(results, null, 2), 'utf-8');
}

run();

