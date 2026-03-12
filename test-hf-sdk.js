const { HfInference } = require('@huggingface/inference');

const API_KEY = process.env.HUGGINGFACE_API_KEY ;

const originalFetch = global.fetch;
global.fetch = async (...args) => {
    console.log('Fetching:', args[0]);
    return await originalFetch(...args);
};

const hf = new HfInference(API_KEY);

async function run() {
    try {
        console.log("Testing imageSegmentation...");
        const res = await hf.imageSegmentation({
            model: 'briaai/RMBG-1.4',
            data: Buffer.from('test')
        });
        console.log("Success with RMBG-1.4!");
    } catch (err) {
        console.error("Error from RMBG-1.4:", err.message);
    }
}

run();

