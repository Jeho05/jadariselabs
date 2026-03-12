const { HfInference } = require('@huggingface/inference');

const API_KEY = process.env.HUGGINGFACE_API_KEY ;

const hf = new HfInference(API_KEY);

async function run() {
    try {
        console.log("Testing textToImage with FLUX...");
        await hf.textToImage({
            model: 'black-forest-labs/FLUX.1-schnell',
            inputs: 'A cute cat'
        });
        console.log("Success with FLUX!");
    } catch (err) {
        console.error("Error from FLUX:", err.message);
    }
}

run();

