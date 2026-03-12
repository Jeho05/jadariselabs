const { HfInference } = require('@huggingface/inference');

const API_KEY = process.env.HUGGINGFACE_API_KEY ;

const hf = new HfInference(API_KEY);

async function run() {
    try {
        console.log("Testing textToVideo...");
        await hf.textToVideo({
            model: 'ali-vilab/text-to-video-ms-1.7b',
            inputs: 'Hello world'
        });
        console.log("Success with ali-vilab!");
    } catch (err) {
        console.error("Error from ali-vilab:", err.message);
    }
}

run();

