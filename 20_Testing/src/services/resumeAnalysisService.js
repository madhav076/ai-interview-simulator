const { analyzeResumeContent } = require("./aiService");

const clampScore = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(100, Math.round(number)));
};

const toStringArray = (value) => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .slice(0, 12);
};

const normaliseProjectExperience = (value) => {
  const source = value && typeof value === "object" ? value : {};
  return {
    score: clampScore(source.score),
    summary: String(source.summary || "").trim(),
    suggestions: toStringArray(source.suggestions),
  };
};

const normaliseAnalysis = (analysis, targetJobRole = "") => {
  const source = analysis && typeof analysis === "object" ? analysis : {};

  const normalised = {
    overallScore: clampScore(source.overallScore),
    atsCompatibilityScore: clampScore(source.atsCompatibilityScore),
    strengths: toStringArray(source.strengths),
    weaknesses: toStringArray(source.weaknesses),
    missingRecommendedSkills: toStringArray(source.missingRecommendedSkills),
    projectExperienceQuality: normaliseProjectExperience(source.projectExperienceQuality),
    improvementSuggestions: toStringArray(source.improvementSuggestions),
    actionPlan: toStringArray(source.actionPlan),
    targetJobRole: String(source.targetJobRole || targetJobRole || "").trim(),
    jobMatchScore: targetJobRole ? clampScore(source.jobMatchScore) : null,
  };

  if (
    normalised.strengths.length === 0 &&
    normalised.weaknesses.length === 0 &&
    normalised.improvementSuggestions.length === 0
  ) {
    const error = new Error("AI returned an incomplete resume analysis.");
    error.statusCode = 502;
    throw error;
  }

  return normalised;
};

const createResumeAnalysis = async ({ resumeText, targetJobRole = "" }) => {
  try {
    const rawAnalysis = await analyzeResumeContent({ resumeText, targetJobRole });
    return normaliseAnalysis(rawAnalysis, targetJobRole);
  } catch (error) {
    if (error instanceof SyntaxError) {
      const malformedError = new Error("AI returned a malformed resume analysis response.");
      malformedError.statusCode = 502;
      throw malformedError;
    }
    throw error;
  }
};

module.exports = {
  createResumeAnalysis,
  normaliseAnalysis,
};
