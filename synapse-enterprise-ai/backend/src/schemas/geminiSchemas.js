// Schemas for Gemini 2.5 Flash Structured JSON Generation

export const documentAnalysisSchema = {
  type: "OBJECT",
  properties: {
    summary: {
      type: "STRING",
      description: "Concise executive summary of the document."
    },
    sentiment: {
      type: "STRING",
      description: "Overall sentiment: Positive, Neutral, or Negative."
    },
    keyEntities: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "List of key people, organizations, financial amounts, or deadlines."
    },
    actionItems: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "Extracted actionable next steps."
    }
  },
  required: ["summary", "sentiment", "keyEntities", "actionItems"]
};

export const workflowBreakdownSchema = {
  type: "OBJECT",
  properties: {
    recommendedSubtasks: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          estimatedHours: { type: "NUMBER" },
          suggestedDepartment: { type: "STRING" }
        },
        required: ["title", "estimatedHours", "suggestedDepartment"]
      }
    },
    riskAssessment: {
      type: "STRING",
      description: "Identified project risks and bottlenecks."
    }
  },
  required: ["recommendedSubtasks", "riskAssessment"]
};

export const copilotResponseSchema = {
  type: "OBJECT",
  properties: {
    answer: {
      type: "STRING",
      description: "Direct executive answer formatted in crisp enterprise markdown."
    },
    groundingCitations: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          sourceTitle: { type: "STRING" },
          department: { type: "STRING" },
          relevance: { type: "STRING" }
        },
        required: ["sourceTitle", "department", "relevance"]
      },
      description: "Sources, metrics, or documents grounded in the response."
    },
    recommendedActions: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "Concrete next steps for leadership or team members."
    }
  },
  required: ["answer", "groundingCitations", "recommendedActions"]
};

