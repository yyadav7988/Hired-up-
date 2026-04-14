const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'frontend/api/assets');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    if (filePath.endsWith('.html')) {
        // Find existing <script> blocks (excluding src=) and make them <script type="module">
        // Wait, we also need to change <script src="./app.js"></script> to <script type="module" src="./app.js"></script>
        let newContent = content.replace(/<script\s+src=["']\.\/api_utils\.js["']><\/script>/g, ''); 
        newContent = newContent.replace(/<script\s+src=["']\.\/app\.js["']><\/script>/g, '<script type="module" src="./app.js"></script>');
        
        // Remove duplicate fetch wrappers like `async function apiFetch(...) { ... }`
        // We'll just replace usages of `apiFetch(` with `apiRequest(`.
        // But what about the definition of apiFetch? We should remove it.
        // It's safer to just let the script run `content.replace`
        
        newContent = newContent.replace(/async function apiFetch[\s\S]*?(?=\n\s*(?:\/\/|\/\*|function|const|let|var|document\.addEventListener))/g, '');

        // Now replace all inline script tags with type="module" and add the import if needed
        // Since we removed api_utils.js from the global imports, we MUST import it in the inline script!
        newContent = newContent.replace(/<script>(\s*(?:\/\*[\s\S]*?\*\/)?\s*(?:\/\/.*?\n)*)(\s*)/g, '<script type="module">\n$1import { apiRequest } from "./api_utils.js";\n');

        // Replace direct `await fetch((window.API_BASE_URL || "") + '/api...`, { ... }) with await apiRequest(...)
        // Since we don't have a reliable regex for all multiline bodies, we can do it like this:
        
        // Replace `apiFetch('/api/...` with `apiRequest('/api/...`
        newContent = newContent.replace(/apiFetch\(/g, 'apiRequest(');

        // For skillgap.html:
        newContent = newContent.replace(/const res = await fetch\(\(window\.API_BASE_URL \|\| ""\) \+ '(\/api\/jobs)', \{[\s\S]*?method: "GET"[\s\S]*?mode: "cors"[\s\S]*?\}\);/g, "const res = await apiRequest('$1');");
        newContent = newContent.replace(/const res = await fetch\(`\$\{API\}(\/api\/jobs\/skillgap\/[^\`]+)`, \{[\s\S]*?method: "GET"[\s\S]*?mode: "cors"[\s\S]*?\}\);/g, "const res = await apiRequest(`$1`);");

        // For recruiter.html
        newContent = newContent.replace(/const API = \(window\.API_BASE_URL \|\| ""\);\n/g, "");
        
        // For candidates.html:
        newContent = newContent.replace(/const res = await fetch\(\(window\.API_BASE_URL \|\| ""\) \+ '(\/api\/auth\/candidates)', \{[\s\S]*?method: "GET"[\s\S]*?mode: "cors"[\s\S]*?\}\);/g, "const res = await apiRequest('$1');");

        // For post-job.html:
        newContent = newContent.replace(/const res = await fetch\(\(window\.API_BASE_URL \|\| ""\) \+ '(\/api\/problems)', \{[\s\S]*?method: "GET"[\s\S]*?mode: "cors"[\s\S]*?\}\);/g, "const res = await apiRequest('$1');");
        newContent = newContent.replace(/response = await fetch\(\(window\.API_BASE_URL \|\| ""\) \+ '(\/api\/jobs)', \{[\s\S]*?method: "POST"[\s\S]*?body: JSON\.stringify\(([\s\S]*?)\)[\s\S]*?\}\);/g, "response = await apiRequest('$1', 'POST', $2);");

        // Remove old GEMINI_API or API or MAIN_API from files since BASE_URL is in api_utils
        newContent = newContent.replace(/const\s+(?:API|LC_API|MAIN_API|GEMINI_API)\s*=\s*\(window\.API_BASE_URL \|\| ""\);/g, '');

        if (newContent !== content) {
            fs.writeFileSync(filePath, newContent);
            console.log('Updated: ' + filePath);
        }
    }
}

fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.html')) {
        processFile(path.join(dir, file));
    }
});
