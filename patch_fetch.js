const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'frontend/api/assets');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Fix imports in JS files
    if (filePath.endsWith('.js') && filePath !== path.join(dir, 'api_utils.js')) {
        if (!content.includes('import { apiRequest }')) {
            content = `import { apiRequest } from "./api_utils.js";\n` + content;
        }
    }

    if (filePath.endsWith('.html')) {
        // Change src imports to modules
        content = content.replace(/<script\s+src=['"]\.\/app\.js['"]><\/script>/g, '<script type="module" src="./app.js"></script>');
        content = content.replace(/<script\s+src=['"]\.\/api_utils\.js['"]><\/script>/g, '<script type="module" src="./api_utils.js"></script>');

        // Make all inline scripts modules if they use apiRequest
        // But only if they have fetch or apiFetch logic! Actually let's just make sure they can import it.
        // Wait, what if we just assign window.apiRequest in api_utils.js and the html files use that? That's what they were
        // doing when it wasn't a module! But if it IS an ES module, we have to import it. Or, wait, we can just let
        // app.js import it. If api_utils.js is a module, ANY HTML file that loads it via <script type="module" src="...">
        // will evaluate it as a module. Variables in modules are NOT global by default!
        // The user says "IMPORT HELPER WHERE NEEDED: At top of JS files: import { apiRequest } from './api_utils.js';"
        // It specifically says "At top of JS files". So inline scripts should be left alone? No, "FIND AND REPLACE ALL API CALLS across frontend/api/assets/"
    }

    // Replace fetch calls
    // Pattern: await fetch((window.API_BASE_URL || "") + '/api/something', { ... })
    // We can replace any `await fetch(url, ...)` or `await fetch('...', ...)` 
    // This is hard to do cleanly via regex without breaking things (like github public api calls).
    
    fs.writeFileSync(filePath, content);
}

fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.js') || file.endsWith('.html')) {
        processFile(path.join(dir, file));
    }
});
