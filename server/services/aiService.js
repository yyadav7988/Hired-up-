/**
 * AI Service - Gemini-powered code analysis and certificate verification
 * Falls back gracefully when GEMINI_API_KEY is not set
 */

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Analyze submitted code using Gemini AI
 */
async function analyzeCode(code, problemDescription, language) {
  if (!GEMINI_API_KEY) {
    return {
      score: 75,
      feedback: 'AI analysis unavailable (no API key configured)',
      suggestions: ['Configure GEMINI_API_KEY for AI-powered code review'],
      complexity: 'N/A'
    };
  }

  try {
    const prompt = `Analyze this ${language} code solution for the problem: "${problemDescription}".
Code:
\`\`\`
${code}
\`\`\`

Provide a JSON response with:
- score (0-100)
- feedback (string)
- suggestions (array of strings)
- complexity (time/space analysis)`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch (e) {
      // Could not parse JSON from AI response
    }

    return { score: 70, feedback: text.slice(0, 500), suggestions: [], complexity: 'N/A' };
  } catch (err) {
    console.error('AI Analysis error:', err.message);
    return {
      score: 70,
      feedback: 'AI analysis failed: ' + err.message,
      suggestions: [],
      complexity: 'N/A'
    };
  }
}

/**
 * Verify certificate using OCR (stub — returns mock when no ML service)
 */
async function verifyCertificateOCR(filePath) {
  // Try external ML service first
  const ML_URL = process.env.ML_SERVICE_URL;
  if (ML_URL) {
    try {
      const res = await fetch(ML_URL + '/verify/certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_path: filePath })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('ML service unavailable, using fallback:', e.message);
    }
  }

  // Fallback: return mock verification
  return {
    platform: 'unknown',
    candidateName: 'Candidate',
    courseName: 'Certificate',
    issueDate: new Date().toISOString(),
    credentialId: 'N/A',
    trustScore: 50,
    status: 'PENDING'
  };
}

module.exports = { analyzeCode, verifyCertificateOCR };
