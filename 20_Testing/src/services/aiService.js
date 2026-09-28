const { GoogleGenAI } = require("@google/genai");

// Helper to check if a valid Gemini API key is configured
const hasValidApiKey = () => {
  const key = process.env.GEMINI_API_KEY;
  return Boolean(
    key &&
    key !== "DUMMY_KEY" &&
    key !== "your_gemini_api_key_here" &&
    key !== "replace_with_your_gemini_api_key"
  );
};

// Retrieve configured model names and retry settings dynamically from environment variables
const getAiConfig = () => ({
  primaryModel: process.env.GEMINI_MODEL || process.env.GEMINI_PRIMARY_MODEL || "gemini-3.6-flash",
  fallbackModel: process.env.GEMINI_FALLBACK_MODEL || "gemini-3.1-flash-lite",
  maxRetries: Math.max(1, parseInt(process.env.GEMINI_MAX_RETRIES || "3", 10)),
  baseRetryDelayMs: Math.max(100, parseInt(process.env.GEMINI_RETRY_DELAY_MS || "1000", 10)),
});

/**
 * Strips markdown code block wrappers (e.g. ```json ... ```) from the AI response.
 */
const cleanJsonResponse = (responseText) => {
  let cleanText = String(responseText || "").trim();
  if (cleanText.startsWith("```")) {
    cleanText = cleanText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/, "")
      .trim();
  }
  return cleanText;
};

/**
 * Determines if an error is temporary/retryable (503 high demand, 429 rate limit, network timeout).
 */
const isRetryableError = (error) => {
  if (!error) return false;
  const status = error.status || error.code || (error.error && error.error.code);
  if (status === 503 || status === 429 || status === 500 || status === 502 || status === 504) {
    return true;
  }
  const msg = (error.message || String(error)).toLowerCase();
  return (
    msg.includes("503") ||
    msg.includes("429") ||
    msg.includes("unavailable") ||
    msg.includes("high demand") ||
    msg.includes("resource_exhausted") ||
    msg.includes("rate limit") ||
    msg.includes("quota") ||
    msg.includes("busy") ||
    msg.includes("timeout") ||
    msg.includes("fetch failed") ||
    msg.includes("econnreset") ||
    msg.includes("etimedout") ||
    msg.includes("enotfound")
  );
};

/**
 * Extracts a human-readable clean error message from raw provider errors or stringified JSON.
 */
const formatCleanErrorMessage = (error) => {
  if (!error) return "AI service encountered an unexpected error.";
  let msg = error.message || String(error);

  // If the error message is raw stringified JSON like {"error":{"code":503,"message":"..."}}
  if (msg.trim().startsWith("{") && msg.trim().endsWith("}")) {
    try {
      const parsed = JSON.parse(msg.trim());
      if (parsed?.error?.message) {
        msg = parsed.error.message;
      }
    } catch {
      // Keep original string if not valid JSON
    }
  }

  const lower = msg.toLowerCase();
  if (lower.includes("503") || lower.includes("unavailable") || lower.includes("high demand")) {
    return "The AI service is currently experiencing high demand. Please try again in a few moments.";
  }
  if (lower.includes("429") || lower.includes("quota") || lower.includes("resource_exhausted")) {
    return "The AI service rate limit has been reached. Please wait a moment and try again.";
  }
  if (lower.includes("not found") || lower.includes("404") || lower.includes("no longer available")) {
    return "The configured AI model is unavailable. Please check your model configuration.";
  }
  if (lower.includes("api key") || lower.includes("authentication") || lower.includes("unauthorized")) {
    return "AI service authentication error. Please verify your API key.";
  }
  if (lower.includes("invalid ai response")) {
    return "AI generated an invalid response structure. Please try again.";
  }

  return msg.length > 200 ? "AI service is temporarily unavailable. Please try again." : msg;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Executes a Gemini request with automatic retries and exponential backoff.
 */
const executeModelWithRetry = async (aiClient, modelName, prompt, { maxRetries, baseRetryDelayMs, taskName = "generation" }) => {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[AI Service] ${taskName}: Attempt ${attempt}/${maxRetries} using model "${modelName}"`);
      const result = await aiClient.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });
      return result;
    } catch (err) {
      lastError = err;
      const cleanMsg = formatCleanErrorMessage(err);
      console.warn(`[AI Service] ${taskName}: Attempt ${attempt}/${maxRetries} on "${modelName}" failed: ${cleanMsg}`);
      
      if (attempt < maxRetries && isRetryableError(err)) {
        const backoffMs = baseRetryDelayMs * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 500);
        console.log(`[AI Service] Retrying in ${Math.round(backoffMs)}ms...`);
        await sleep(backoffMs);
      } else if (!isRetryableError(err)) {
        // Non-retryable error (e.g. 404 model removed), break early to allow fallback model
        break;
      }
    }
  }
  throw lastError;
};

/**
 * Executes a Gemini prompt through primary model and automatically falls back to secondary model if unavailable.
 */
const executeWithFallback = async ({ prompt, validator, taskName = "AI Task" }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const aiClient = new GoogleGenAI({ apiKey: apiKey || "DUMMY_KEY" });
  const { primaryModel, fallbackModel, maxRetries, baseRetryDelayMs } = getAiConfig();

  // Create list of unique model candidates to try
  const candidateModels = [primaryModel, fallbackModel].filter(
    (model, idx, self) => Boolean(model) && self.indexOf(model) === idx
  );

  let lastError;
  for (let i = 0; i < candidateModels.length; i++) {
    const currentModel = candidateModels[i];
    try {
      const rawResult = await executeModelWithRetry(aiClient, currentModel, prompt, {
        maxRetries,
        baseRetryDelayMs,
        taskName,
      });

      const responseText = rawResult?.text;
      if (!responseText || !responseText.trim()) {
        throw new Error("Invalid AI response: Empty response body received from provider.");
      }

      const cleanText = cleanJsonResponse(responseText);
      const parsedData = JSON.parse(cleanText);

      if (typeof validator === "function") {
        const validatedData = validator(parsedData);
        console.log(`[AI Service] ${taskName}: Successfully completed using model "${currentModel}"`);
        return validatedData;
      }

      console.log(`[AI Service] ${taskName}: Successfully completed using model "${currentModel}"`);
      return parsedData;
    } catch (err) {
      lastError = err;
      const cleanMsg = formatCleanErrorMessage(err);
      console.warn(`[AI Service] ${taskName}: Model "${currentModel}" failed: ${cleanMsg}`);
      
      if (i < candidateModels.length - 1) {
        const nextModel = candidateModels[i + 1];
        console.log(`[AI Service] Switching to fallback model "${nextModel}"...`);
      }
    }
  }

  // If all candidate models and retries failed, throw formatted clean error
  const finalCleanMessage = formatCleanErrorMessage(lastError);
  const aiError = new Error(finalCleanMessage);
  aiError.statusCode = isRetryableError(lastError) ? 503 : 500;
  aiError.isRetryable = isRetryableError(lastError);
  aiError.rawError = lastError;
  throw aiError;
};

const extractKnownSkills = (resumeText) => {
  const knownSkills = [
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "Express",
    "MongoDB",
    "SQL",
    "Python",
    "Java",
    "C++",
    "AWS",
    "Docker",
    "Kubernetes",
    "Git",
    "REST",
    "GraphQL",
    "Machine Learning",
    "Data Analysis",
  ];
  const lowerText = resumeText.toLowerCase();
  return knownSkills.filter((skill) => lowerText.includes(skill.toLowerCase()));
};

const buildFallbackResumeAnalysis = ({ resumeText, targetJobRole = "" }) => {
  const skills = extractKnownSkills(resumeText);
  const hasProjects = /\b(project|projects)\b/i.test(resumeText);
  const hasExperience = /\b(experience|intern|worked|developed|built|led)\b/i.test(resumeText);
  const hasMetrics = /\b\d+%|\b\d+\s*(users|customers|requests|seconds|ms|hours|days|people|team)\b/i.test(resumeText);
  const hasContact = /@|\blinkedin\b|\bgithub\b/i.test(resumeText);
  const hasEducation = /\b(education|degree|university|college|bachelor|master)\b/i.test(resumeText);

  const overallScore = 45 + (skills.length >= 4 ? 15 : skills.length * 3) + (hasProjects ? 10 : 0) + (hasExperience ? 10 : 0) + (hasMetrics ? 10 : 0);
  const atsCompatibilityScore = 50 + (hasContact ? 10 : 0) + (hasEducation ? 10 : 0) + (skills.length ? 10 : 0) + (hasMetrics ? 5 : 0);

  const strengths = [];
  if (skills.length) strengths.push(`Includes relevant skills visible in the resume: ${skills.slice(0, 6).join(", ")}.`);
  if (hasProjects) strengths.push("Includes a projects section or project-based work.");
  if (hasExperience) strengths.push("Mentions professional, internship, or applied work experience.");
  if (hasMetrics) strengths.push("Contains at least some quantified impact or scale.");

  const weaknesses = [];
  if (!hasMetrics) weaknesses.push("Impact is not consistently quantified with measurable outcomes.");
  if (!hasProjects) weaknesses.push("Project work is not clearly separated or easy to scan.");
  if (!hasExperience) weaknesses.push("Experience details may need stronger action-oriented bullet points.");
  if (!hasContact) weaknesses.push("Contact or profile links are not clearly detected in the extracted text.");

  return {
    overallScore,
    atsCompatibilityScore,
    strengths: strengths.length ? strengths : ["The resume contains readable text that can be analyzed."],
    weaknesses: weaknesses.length ? weaknesses : ["No major structural weaknesses were detected by the local fallback analysis."],
    missingRecommendedSkills: targetJobRole
      ? ["Compare the target role description with the resume and add only skills you can support with evidence."]
      : ["Add role-specific keywords from actual target job descriptions where they truthfully match your experience."],
    projectExperienceQuality: {
      score: 55 + (hasProjects ? 20 : 0) + (hasMetrics ? 15 : 0),
      summary: hasProjects
        ? "Project or experience content is present; make sure each entry states the problem, technology, and outcome."
        : "Project and experience quality is hard to judge because clear project entries were not detected.",
      suggestions: [
        "Use action verbs and name the technologies used in each project or role.",
        "Add measurable outcomes where the resume can truthfully support them.",
      ],
    },
    improvementSuggestions: [
      "Add metrics to bullets where real impact can be measured.",
      "Mirror important target-role keywords only when they accurately reflect your background.",
      "Keep section headings simple and ATS-readable.",
    ],
    actionPlan: [
      "Review each experience bullet for action, method, and result.",
      "Add missing role-relevant skills backed by project or work evidence.",
      "Re-upload the revised PDF or DOCX and run analysis again.",
    ],
    targetJobRole,
    jobMatchScore: targetJobRole ? Math.min(100, overallScore - 5 + Math.min(skills.length * 2, 10)) : null,
  };
};

/**
 * Validates interview questions schema.
 */
const validateInterviewQuestions = (questions) => {
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("Invalid AI response: Expected a non-empty array of questions.");
  }
  return questions.map((q, idx) => {
    if (!q || typeof q !== "object") {
      throw new Error(`Invalid AI response: Question at index ${idx} is not an object.`);
    }
    const text = String(q.text || "").trim();
    if (!text) {
      throw new Error(`Invalid AI response: Question at index ${idx} is missing question text.`);
    }
    return {
      id: Number(q.id) || idx + 1,
      text,
      type: q.type === "technical" ? "technical" : "behavioral",
    };
  });
};

/**
 * Validates coding questions schema.
 */
const validateCodingQuestions = (questions, programmingLanguage, difficulty) => {
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("Invalid AI response: Expected a non-empty array of coding questions.");
  }
  return questions.map((q, idx) => {
    if (!q || typeof q !== "object") {
      throw new Error(`Invalid AI response: Coding challenge at index ${idx} is not an object.`);
    }
    const title = String(q.title || "").trim();
    const description = String(q.description || "").trim();
    const codeTemplate = String(q.codeTemplate || "").trim();
    
    if (!title) {
      throw new Error(`Invalid AI response: Challenge ${idx + 1} is missing a title.`);
    }
    if (!description) {
      throw new Error(`Invalid AI response: Challenge ${idx + 1} is missing a description.`);
    }
    if (!codeTemplate) {
      throw new Error(`Invalid AI response: Challenge ${idx + 1} is missing starter code template.`);
    }

    let testCases = Array.isArray(q.testCases) ? q.testCases : [];
    if (testCases.length === 0) {
      testCases = [{ input: "test_input", output: "test_output" }];
    } else {
      testCases = testCases.map((tc) => ({
        input: String(tc.input ?? "sample_input"),
        output: String(tc.output ?? "sample_output"),
      }));
    }

    return {
      id: Number(q.id) || idx + 1,
      title,
      description,
      difficulty: q.difficulty || difficulty || "Medium",
      codeTemplate,
      testCases,
    };
  });
};

/**
 * Generates structured interview questions using Gemini AI.
 * @param {string} jobRole
 * @param {string} difficulty
 * @param {number} numberOfQuestions
 * @returns {Promise<Array>} List of generated question objects
 */
const generateInterviewQuestions = async (
  jobRole,
  difficulty,
  numberOfQuestions
) => {
  if (!hasValidApiKey()) {
    // Return mock fallback questions if API key is not configured (e.g. in test envs)
    const mockQuestions = [];
    for (let i = 1; i <= numberOfQuestions; i++) {
      mockQuestions.push({
        id: i,
        text: `Mock question ${i} for a ${difficulty}-level ${jobRole} interview.`,
        type: i % 2 === 0 ? "technical" : "behavioral",
      });
    }
    return mockQuestions;
  }

  const prompt = `Generate exactly ${numberOfQuestions} interview questions for a ${difficulty}-level ${jobRole} position. 
Return a valid JSON array of objects. Each object must have these exact keys: "id" (an integer, starting from 1), "text" (the question text), and "type" (either "technical" or "behavioral").`;

  return executeWithFallback({
    prompt,
    validator: validateInterviewQuestions,
    taskName: `Generate Interview Questions (${jobRole}, ${difficulty})`,
  });
};

/**
 * Generates structured coding interview questions using Gemini AI with retries, fallback, and validation.
 * @param {string} programmingLanguage Python | JavaScript | TypeScript | Java
 * @param {string} difficulty Easy | Medium | Hard
 * @param {number} numberOfQuestions
 * @returns {Promise<Array>} List of generated coding challenge objects
 */
const generateCodingQuestions = async (
  programmingLanguage,
  difficulty,
  numberOfQuestions
) => {
  if (!hasValidApiKey()) {
    // Return mock fallback coding questions if API key is not configured (e.g. in test envs)
    const mockQuestions = [];
    for (let i = 1; i <= numberOfQuestions; i++) {
      mockQuestions.push({
        id: i,
        title: `Coding Challenge ${i}`,
        description: `Write a program in ${programmingLanguage} to solve mock challenge ${i} at ${difficulty} difficulty.`,
        difficulty: difficulty,
        codeTemplate: `// starter template for ${programmingLanguage}\n`,
        testCases: [{ input: "test_input", output: "test_output" }],
      });
    }
    return mockQuestions;
  }

  const prompt = `Generate exactly ${numberOfQuestions} distinct coding challenges for a programming assessment in ${programmingLanguage} at ${difficulty} difficulty.
Return a valid JSON array of objects. Each challenge object must contain these exact keys:
- "id": integer starting from 1
- "title": concise, professional problem title
- "description": clear problem statement, requirements, constraints, and examples
- "difficulty": "${difficulty}"
- "codeTemplate": functional boilerplate starter code template with proper function signature and syntax for ${programmingLanguage}
- "testCases": array of at least 2 test case objects with "input" (string) and "output" (string) properties.

Make sure the code template uses valid, clean ${programmingLanguage} syntax (e.g., Python: def solution(...):, JavaScript: function solution(...), TypeScript: function solution(...): ..., Java: public class Solution { public static ... }).`;

  return executeWithFallback({
    prompt,
    validator: (data) => validateCodingQuestions(data, programmingLanguage, difficulty),
    taskName: `Generate Coding Questions (${programmingLanguage}, ${difficulty})`,
  });
};

/**
 * Validates resume analysis schema.
 */
const validateResumeAnalysis = (data, targetJobRole = "") => {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid AI response: Expected a JSON object for resume analysis.");
  }

  const overallScore = Number(data.overallScore);
  const atsCompatibilityScore = Number(data.atsCompatibilityScore);

  if (!Number.isFinite(overallScore) || !Number.isFinite(atsCompatibilityScore)) {
    throw new Error("Invalid AI response: Missing or non-numeric scores.");
  }

  const strengths = Array.isArray(data.strengths) ? data.strengths.map(String).filter(Boolean) : [];
  const weaknesses = Array.isArray(data.weaknesses) ? data.weaknesses.map(String).filter(Boolean) : [];
  const missingRecommendedSkills = Array.isArray(data.missingRecommendedSkills)
    ? data.missingRecommendedSkills.map(String).filter(Boolean)
    : [];
  const improvementSuggestions = Array.isArray(data.improvementSuggestions)
    ? data.improvementSuggestions.map(String).filter(Boolean)
    : [];
  const actionPlan = Array.isArray(data.actionPlan)
    ? data.actionPlan.map(String).filter(Boolean)
    : [];

  if (strengths.length === 0 && weaknesses.length === 0 && improvementSuggestions.length === 0) {
    throw new Error("Invalid AI response: Incomplete resume analysis sections.");
  }

  const projectExp =
    data.projectExperienceQuality && typeof data.projectExperienceQuality === "object"
      ? data.projectExperienceQuality
      : {};

  const projectScore = Number.isFinite(Number(projectExp.score))
    ? Math.max(0, Math.min(100, Math.round(Number(projectExp.score))))
    : 60;
  const projectSummary = String(
    projectExp.summary || "Project and experience details evaluated against target industry expectations."
  ).trim();
  const projectSuggestions = Array.isArray(projectExp.suggestions)
    ? projectExp.suggestions.map(String).filter(Boolean)
    : [];

  let jobMatchScore = null;
  if (targetJobRole) {
    jobMatchScore = Number.isFinite(Number(data.jobMatchScore))
      ? Math.max(0, Math.min(100, Math.round(Number(data.jobMatchScore))))
      : Math.max(0, Math.min(100, Math.round(overallScore)));
  }

  return {
    overallScore: Math.max(0, Math.min(100, Math.round(overallScore))),
    atsCompatibilityScore: Math.max(0, Math.min(100, Math.round(atsCompatibilityScore))),
    strengths: strengths.length
      ? strengths
      : ["Resume demonstrates readable structural sections and core technical content."],
    weaknesses: weaknesses.length
      ? weaknesses
      : ["Add more quantified metrics and measurable outcomes to project bullets."],
    missingRecommendedSkills,
    projectExperienceQuality: {
      score: projectScore,
      summary: projectSummary,
      suggestions: projectSuggestions,
    },
    improvementSuggestions: improvementSuggestions.length
      ? improvementSuggestions
      : ["Include links to portfolio projects and GitHub repository."],
    actionPlan: actionPlan.length
      ? actionPlan
      : ["Review experience bullet points to emphasize quantifiable impact."],
    targetJobRole: String(data.targetJobRole || targetJobRole || "").trim(),
    jobMatchScore,
  };
};

const analyzeResumeContent = async ({ resumeText, targetJobRole = "" }) => {
  if (!hasValidApiKey()) {
    return buildFallbackResumeAnalysis({ resumeText, targetJobRole });
  }

  const prompt = `Analyze the resume text below for resume quality, ATS compatibility, and suitability for the target position: "${targetJobRole || "Software Engineering"}".

Rules:
- Base every observation strictly on the provided resume text.
- Do not invent facts or unlisted experience.
- If a target job role is provided (${targetJobRole ? `"${targetJobRole}"` : "None"}), evaluate how well the resume matches that specific role, calculate a realistic "jobMatchScore" (0-100), and list "missingRecommendedSkills" that are industry standards for that role but missing from the resume.
- Return only valid JSON with the exact schema listed below.

JSON schema:
{
  "overallScore": number (0-100),
  "atsCompatibilityScore": number (0-100),
  "jobMatchScore": ${targetJobRole ? "number (0-100)" : "null"},
  "strengths": string[],
  "weaknesses": string[],
  "missingRecommendedSkills": string[],
  "projectExperienceQuality": {
    "score": number (0-100),
    "summary": string,
    "suggestions": string[]
  },
  "improvementSuggestions": string[],
  "actionPlan": string[],
  "targetJobRole": "${targetJobRole}"
}

Target job role: ${targetJobRole || "Not specified"}

Resume text:
${resumeText}`;

  return executeWithFallback({
    prompt,
    validator: (data) => validateResumeAnalysis(data, targetJobRole),
    taskName: `Analyze Resume (${targetJobRole || "General"})`,
  });
};

module.exports = {
  generateInterviewQuestions,
  generateCodingQuestions,
  analyzeResumeContent,
  formatCleanErrorMessage,
  isRetryableError,
  hasValidApiKey,
  getAiConfig,
};
