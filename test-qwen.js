const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf-8');
for (const line of env.split('\n')) {
  if (line.includes('=')) {
    const [key, ...rest] = line.split('=');
    const val = rest.join('=').replace(/'|"/g, '').trim();
    if(key.trim()) process.env[key.trim()] = val;
  }
}

async function testHF() {
    const hfApiKey = process.env.HUGGINGFACE_API_KEY?.trim();
    if(!hfApiKey) return console.error("No HF api key");

    const models = ['facebook/mms-tts-fra', 'espnet/kan-bayashi_ljspeech_vits'];
    
    const endpoints = [
        'https://router.huggingface.co/hf-inference/models/',
        'https://api-inference.huggingface.co/models/'
    ];

    for (const prefix of endpoints) {
        for (const model of models) {
            console.log(`Testing ${prefix}${model}...`);
            try {
                const response = await fetch(`${prefix}${model}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${hfApiKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ inputs: 'Bonjour, ceci est un test.' }),
                });
                console.log("Status:", response.status);
                if(!response.ok) {
                    console.error("Error:", await response.text());
                } else {
                    console.log("SUCCESS on", `${prefix}${model}`);
                    // Save buffer to test.wav
                    const arrayBuffer = await response.arrayBuffer();
                    require('fs').writeFileSync('test.wav', Buffer.from(arrayBuffer));
                    console.log("Saved to test.wav");
                    return;
                }
            } catch(e) {
                console.error(e);
            }
        }
    }
}
testHF();
