const { HfInference } = require('@huggingface/inference');

const API_KEY = process.env.HUGGINGFACE_API_KEY ;

const hf = new HfInference(API_KEY);

async function run() {
    try {
        console.log("Testing textToVideo with Hunyuan...");
        await hf.textToVideo({
            model: 'tencent/HunyuanVideo',
            inputs: 'A cute cat'
        });
        console.log("Success with Hunyuan!");
    } catch (err) {
        console.error("Error from Hunyuan:", err.message);
    }
}

run();

