/**
 * Safe code execution for coding challenges
 * Uses child_process with timeout
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const TIMEOUT_MS = 5000;
const TEMP_DIR = path.join(os.tmpdir(), 'hiredup_code');

function ensureTempDir() {
  if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Execute Python code with optional stdin
 */
function executePython(code, stdin = '') {
  return new Promise((resolve) => {
    ensureTempDir();
    const scriptPath = path.join(TEMP_DIR, `run_${Date.now()}_${Math.random().toString(36).slice(2)}.py`);

    fs.writeFileSync(scriptPath, code, 'utf8');

    const proc = spawn('python', [scriptPath], {
      timeout: TIMEOUT_MS,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: false,
      env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (d) => (stdout += d.toString()));
    proc.stderr.on('data', (d) => (stderr += d.toString()));

    proc.on('error', (err) => {
      try { fs.unlinkSync(scriptPath); } catch (e) {}
      resolve({ stdout: '', stderr: err.message, result: null, error: err.message });
    });

    proc.on('close', (code, signal) => {
      try { fs.unlinkSync(scriptPath); } catch (e) {}
      if (signal === 'SIGTERM') {
        resolve({ stdout, stderr: 'Execution timed out', result: null, error: 'Timeout' });
      } else {
        resolve({ stdout, stderr, result: stdout.trim(), error: null });
      }
    });

    if (stdin) proc.stdin.write(stdin);
    proc.stdin.end();
  });
}

/**
 * Execute code generically — dispatches to the right runtime
 */
function executeCode(code, stdin = '') {
  return executePython(code, stdin);
}

/**
 * Check if a command is available
 */
function commandExists(cmd) {
  return new Promise((resolve) => {
    exec(`${cmd} --version`, (err) => resolve(!err));
  });
}

module.exports = { executeCode, executePython, commandExists, TEMP_DIR, ensureTempDir };
