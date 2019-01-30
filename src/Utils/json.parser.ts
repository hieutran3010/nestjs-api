const fileToJSON = (dir) => {
    const fs = require('fs');
    const readFile = fs.readFileSync(dir, { encoding: 'utf8' });
    const content = Buffer.isBuffer(readFile) ? readFile.toString('utf8') : readFile;
    const obj = JSON.parse(content);
    return obj;
};

export {fileToJSON};