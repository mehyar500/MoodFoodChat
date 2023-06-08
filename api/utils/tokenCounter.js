const { get_encoding } = require("tiktoken");

async function getTokenCount(text) {
    // get the encoding model for gpt-3.5-turbo
    const encoding = get_encoding("cl100k_base");
    
    // encode the text into tokens
    const tokens = encoding.encode(text);
    
    // free up the encoding resources
    encoding.free();
    
    // return the number of tokens
    return tokens.length;
}

exports.getTokenCount = getTokenCount;