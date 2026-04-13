const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, 'frontend');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

const fixFile = (filePath) => {
    if (!filePath.endsWith('.js') && !filePath.endsWith('.html')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Fix variable assignments
    content = content.replace(/'\(window\.API_BASE_URL \|\| ""\)'/g, '(window.API_BASE_URL || "")');
    content = content.replace(/"\(window\.API_BASE_URL \|\| ""\)"/g, '(window.API_BASE_URL || "")');

    // Fix fetch string prefixes like fetch('(window.API_BASE_URL || "")/api/...')
    content = content.replace(/fetch\('\(window\.API_BASE_URL \|\| ""\)(\/[^']*)'/g, 'fetch((window.API_BASE_URL || "") + \'$1\'');
    
    // Fix template literal occurrences like fetch(`(window.API_BASE_URL || "")/api/...`)
    content = content.replace(/fetch\(`\(window\.API_BASE_URL \|\| ""\)(\/[^`]+)`/g, 'fetch((window.API_BASE_URL || "") + `$1`');

    // Extra case: fetch((window.API_BASE_URL || "") + '...') + anything
    // Check if fetch(`http://localhost:5000...`) was originally there and became fetch(`(window.API...
    content = content.replace(/`\(window\.API_BASE_URL \|\| ""\)/g, '`${window.API_BASE_URL || ""}');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed quotes in', filePath);
    }
}

walk(FRONTEND_DIR, fixFile);
console.log('Done fixing quotes frontend.');
