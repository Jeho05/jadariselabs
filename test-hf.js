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
            body: JSON.stringify({ inputs: "test input for model endpoints" })
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
    const modelId = 'briaai/RMBG-1.4';
    const endpoints = [
        `https://api-inference.huggingface.co/models/${modelId}`,
        `https://api-inference.huggingface.co/pipeline/image-segmentation/${modelId}`,
        `https://router.huggingface.co/models/${modelId}`,
        `https://router.huggingface.co/${modelId}`,
        `https://router.huggingface.co/hf-inference/models/${modelId}`,
        `https://router.huggingface.co/hf-inference/v1/models/${modelId}`,
        `https://api-inference.huggingface.co/v1/models/${modelId}`
    ];

    const results = [];
    for (const ep of endpoints) {
        const res = await testEndpoint(ep);
        results.push(res);
    }

    fs.writeFileSync('test-hf-results.json', JSON.stringify(results, null, 2), 'utf-8');
}

run();

