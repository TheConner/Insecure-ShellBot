module.exports.WriteNormalMessage = (message) => {
    function chunkSubstr(str, size) {
        const numChunks = Math.ceil(str.length / size)
        const chunks = new Array(numChunks)
      
        for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
          chunks[i] = str.substr(o, size)
        }
      
        return chunks
    }

    if (message.length > 1900) {
        return chunkSubstr(message, 1900).map(a => a = `\`\`\`${a}\`\`\``)
    } else {
        return `\`\`\`${message}\`\`\` `
    }
}