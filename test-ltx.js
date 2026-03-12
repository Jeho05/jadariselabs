const { HfInference } = require('@huggingface/inference');

const API_KEY = process.env.HUGGINGFACE_API_KEY ;

const hf = new HfInference(API_KEY);

async function run() {
    try {
        console.log("Testing textToVideo with LTX-Video...");
        await hf.textToVideo({
            model: 'Lightricks/LTX-Video',
            inputs: 'A cute cat'
        });
        console.log("Success with LTX-Video!");
    } catch (err) {
        console.error("Error from LTX-Video:", err.message);
    }
}

run();

