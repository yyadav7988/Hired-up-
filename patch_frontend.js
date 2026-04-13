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

    // 1. replace `http://localhost:5000/api` or `http://127.0.0.1:5000/api`
    content = content.replace(/http:\/\/localhost:500[01]/g, '(window.API_BASE_URL || "")');
    content = content.replace(/http:\/\/127\.0\.0\.1:500[01]/g, '(window.API_BASE_URL || "")');
    content = content.replace(/http:\/\/127\.0\.0\.1:8000/g, '(window.API_BASE_URL || "")');
    content = content.replace(/http:\/\/localhost:8000/g, '(window.API_BASE_URL || "")');
    
    // 2. fix specific cases where `API.replace('127.0.0.1','localhost')` or similar are used
    content = content.replace(/fetch\(API\s*\+\s*'/g, 'fetch((window.API_BASE_URL || "") + \'');
    content = content.replace(/fetch\(API\.replace\('127\.0\.0\.1','localhost'\)\s*\+\s*'/g, 'fetch((window.API_BASE_URL || "") + \'');
    content = content.replace(/fetch\(baseUrl\.replace\('127\.0\.0\.1','localhost'\)\s*\+\s*path/g, 'fetch((window.API_BASE_URL || "") + path');
    content = content.replace(/fetch\(url\.replace\('127\.0\.0\.1','localhost'\)/g, 'fetch((window.API_BASE_URL || "") + url');
    
    // 3. live practice links
    content = content.replace(/href="http:\/\/localhost:5173[^"]*"/g, 'href="#"');
    content = content.replace(/onclick="window\.location\.href='http:\/\/localhost:5173[^']*'"/g, 'onclick="window.location.href=\'#\'"');
    content = content.replace(/http:\/\/localhost:5173\?token=\$\{token\}/g, '#');
    content = content.replace(/target\.includes\(':5173'\)/g, "target.includes('#')");
    content = content.replace(/'http:\/\/localhost:5173'/g, "'#'");
    
    // 4. optional chaining fixes for `.map` and `.slice` without safe checks (heuristics)
    // replace `variable.map` with `(variable || []).map` when variable is simple
    content = content.replace(/\b([\w\.]+)\.map\(/g, (match, prefix) => {
        if (prefix === 'Math' || prefix === 'Array' || prefix === 'candidates' || prefix === 'jobs' || prefix === 'problems' || prefix === 'data') {
            return `(${prefix} || []).map(`;
        }
        return `(${prefix} || []).map(`;
    });

    content = content.replace(/\b([\w\.]+)\.slice\(/g, (match, prefix) => {
        if (prefix === 'Math' || prefix === 'Array') return match;
        return `(${prefix} || []).slice(`;
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed', filePath);
    }
}

walk(FRONTEND_DIR, fixFile);
console.log('Done fixing frontend.');
