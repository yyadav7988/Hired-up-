const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const Problem = require('../models/Problem');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

const TEMP_DIR = path.join(os.tmpdir(), 'hiredup_exec');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

const safeUnlink = (f) => { try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch (e) {} };

const LANG_MAP = {
    'javascript': 63,
    'python': 71,
    'python3': 71,
    'cpp': 54,
    'c++': 54
};

function normalizeLanguageId(language_id, language) {
    if (language_id) return parseInt(language_id, 10);
    if (language) return LANG_MAP[String(language).toLowerCase()] || 63;
    return 63;
}

// --- JavaScript (Node.js subprocess) ---
function runNodeCode(code, stdinData, timeoutMs = 5000) {
    return new Promise(resolve => {
        const id = `js_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const jsFile = path.join(TEMP_DIR, `${id}.js`);
        const inFile = path.join(TEMP_DIR, `${id}.in`);
        fs.writeFileSync(jsFile, code, 'utf8');
        const cmd = stdinData
            ? (fs.writeFileSync(inFile, stdinData, 'utf8'), `node "${jsFile}" < "${inFile}"`)
            : `node "${jsFile}"`;
        exec(cmd, { timeout: timeoutMs }, (err, stdout, stderr) => {
            safeUnlink(jsFile); safeUnlink(inFile);
            const timedOut = err && err.killed;
            resolve({ stdout: stdout || '', stderr: timedOut ? 'Time Limit Exceeded' : (stderr || (err ? err.message : '')), error: err ? err.message : null });
        });
    });
}

// --- Python ---
function runPythonCode(code, stdinData, timeoutMs = 5000) {
    return new Promise(resolve => {
        const id = `py_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const pyFile = path.join(TEMP_DIR, `${id}.py`);
        const inFile = path.join(TEMP_DIR, `${id}.in`);
        fs.writeFileSync(pyFile, code, 'utf8');
        const cmd = stdinData
            ? (fs.writeFileSync(inFile, stdinData, 'utf8'), `python "${pyFile}" < "${inFile}"`)
            : `python "${pyFile}"`;
        exec(cmd, { timeout: timeoutMs }, (err, stdout, stderr) => {
            safeUnlink(pyFile); safeUnlink(inFile);
            const timedOut = err && err.killed;
            resolve({ stdout: stdout || '', stderr: timedOut ? 'Time Limit Exceeded' : (stderr || (err ? err.message : '')), error: err ? err.message : null });
        });
    });
}

// --- C++ ---
function runCppCode(code, stdinData, timeoutMs = 8000) {
    return new Promise(resolve => {
        const id = `cpp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const cppFile = path.join(TEMP_DIR, `${id}.cpp`);
        const exeFile = path.join(TEMP_DIR, process.platform === 'win32' ? `${id}.exe` : id);
        const inFile = path.join(TEMP_DIR, `${id}.in`);
        fs.writeFileSync(cppFile, code, 'utf8');
        exec(`g++ "${cppFile}" -o "${exeFile}"`, { timeout: 15000 }, (compErr, _, compStderr) => {
            if (compErr) {
                safeUnlink(cppFile);
                return resolve({ stdout: '', stderr: compStderr || compErr.message, error: 'Compilation Error' });
            }
            const cmd = stdinData
                ? (fs.writeFileSync(inFile, stdinData, 'utf8'), `"${exeFile}" < "${inFile}"`)
                : `"${exeFile}"`;
            exec(cmd, { timeout: timeoutMs }, (runErr, stdout, stderr) => {
                safeUnlink(cppFile); safeUnlink(exeFile); safeUnlink(inFile);
                const timedOut = runErr && runErr.killed;
                resolve({ stdout: stdout || '', stderr: timedOut ? 'Time Limit Exceeded' : (stderr || (runErr ? runErr.message : '')), error: runErr ? runErr.message : null });
            });
        });
    });
}

// --- Dispatcher ---
async function runCode(langId, code, stdinData) {
    if (langId === 63) return runNodeCode(code, stdinData);
    if (langId === 71) return runPythonCode(code, stdinData);
    if (langId === 54) return runCppCode(code, stdinData);
    return { stdout: `Language ID ${langId} not supported locally. Supported: 63=JS, 71=Python, 54=C++`, stderr: '', error: null };
}

// --- Core handler (shared between /run and /) ---
async function handleExecute(req, res) {
    try {
        const { language_id, source_code, code, stdin, problemId, language } = req.body;
        const finalCode = source_code || code || '';
        if (!finalCode.trim()) {
            return res.status(400).json({ error: 'source_code (or code) is required' });
        }
        const langId = normalizeLanguageId(language_id, language);

        // Problem-based test-case execution
        if (problemId) {
            try {
                const problem = await Problem.findById(problemId);
                if (problem && (problem.testCases || []).length > 0) {
                    const results = [];
                    for (let i = 0; i < problem.testCases.length; i++) {
                        const tc = problem.testCases[i];
                        const r = await runCode(langId, finalCode, tc.input || '');
                        const actual = (r.stdout || '').trim();
                        const expected = (tc.output || '').trim();
                        const hasError = !!(r.stderr && !r.stdout);
                        results.push({
                            testCaseId: i + 1,
                            input: tc.input,
                            expectedOutput: expected,
                            actualOutput: hasError ? `Error: ${r.stderr}` : actual,
                            status: hasError ? 'Runtime Error' : (actual === expected ? 'Accepted' : 'Wrong Answer')
                        });
                    }
                    const allPassed = results.every(r => r.status === 'Accepted');
                    return res.json({
                        status: { description: allPassed ? 'Accepted' : 'Wrong Answer' },
                        testCaseResults: results,
                        stdout: 'Test cases evaluated.'
                    });
                }
            } catch (probErr) {
                console.warn('Problem test-case lookup failed:', probErr.message);
            }
        }

        // Freeform execution
        const result = await runCode(langId, finalCode, stdin || '');
        res.json({
            stdout: result.stdout || '',
            stderr: result.stderr || null,
            status: { id: result.error ? 11 : 3, description: result.error ? 'Runtime Error' : 'Accepted' },
            time: '—',
            memory: 'Local'
        });
    } catch (err) {
        console.error('Execute handler error:', err);
        res.status(500).json({ error: 'Execution failed: ' + err.message });
    }
}

router.post('/run', optionalAuth, handleExecute);
router.post('/', optionalAuth, handleExecute);

module.exports = router;
