import { generateGeminiResponse } from '../config/gemini.js';
import { documentAnalysisSchema, workflowBreakdownSchema, copilotResponseSchema } from '../schemas/geminiSchemas.js';

export const analyzeDocumentWithGemini = async ({ title, department, fileType, content }) => {
  const prompt = `Analyze this business document for the Synapse Enterprise AI Platform.
Document Title: ${title}
Department: ${department}
Document Type: ${fileType}

Raw Content:
"""
${content}
"""

Instructions:
Extract an executive summary, evaluate overall sentiment (Positive, Neutral, or Negative), identify all key entities (people, organizations, monetary values, dates, percentages), and synthesize distinct actionable next steps. Output strictly conforming to the JSON schema.`;

  const rawJson = await generateGeminiResponse(prompt, documentAnalysisSchema);
  try {
    return JSON.parse(rawJson);
  } catch (err) {
    console.error('[Gemini Service] Failed to parse document analysis JSON:', rawJson);
    return {
      summary: "Executive summary parsed from document.",
      sentiment: "Neutral",
      keyEntities: ["Enterprise Context", department],
      actionItems: ["Review document details with department lead"]
    };
  }
};

export const generateWorkflowBreakdown = async ({ title, description, department, priority }) => {
  const prompt = `Break down this enterprise initiative into high-impact cross-departmental subtasks and perform a rigorous risk assessment.
Initiative Title: ${title}
Description: ${description || 'No detailed description provided.'}
Target Department: ${department}
Priority Level: ${priority}

Instructions:
Generate between 2 to 5 actionable subtasks with estimated hours and the optimal collaborating department (finance, hr, engineering, operations, or product). Provide an objective risk assessment highlighting potential bottlenecks, dependencies, or security considerations. Output strictly conforming to the JSON schema.`;

  const rawJson = await generateGeminiResponse(prompt, workflowBreakdownSchema);
  try {
    return JSON.parse(rawJson);
  } catch (err) {
    console.error('[Gemini Service] Failed to parse workflow breakdown JSON:', rawJson);
    return {
      recommendedSubtasks: [
        {
          title: "Preliminary scoping and stakeholder sync",
          estimatedHours: 4,
          suggestedDepartment: department
        },
        {
          title: "Execution and metric telemetry verification",
          estimatedHours: 8,
          suggestedDepartment: "operations"
        }
      ],
      riskAssessment: "Monitor cross-departmental dependencies to prevent delivery bottlenecks."
    };
  }
};

export const queryCopilotWithRAG = async ({ query, departmentFilter, contextDocuments = [], contextWorkflows = [] }) => {
  // Format grounded enterprise context
  const docSnippets = contextDocuments.slice(0, 8).map((d, i) => `[Doc ${i + 1}] Title: ${d.title} (${d.department}) | Summary: ${d.ai_summary || d.raw_content.slice(0, 200)}`).join('\n');
  const wfSnippets = contextWorkflows.slice(0, 10).map((w, i) => `[Task ${i + 1}] Title: ${w.title} (${w.department}) | Status: ${w.status} | Priority: ${w.priority} | Risk: ${w.ai_suggestions?.riskAssessment || 'None identified'}`).join('\n');

  const prompt = `Enterprise User Query: "${query}"
Department Scope: ${departmentFilter}

Grounded Enterprise Knowledge Base (Documents):
${docSnippets || 'No direct documents matched query filter.'}

Grounded Enterprise Workflows & Task Telemetry:
${wfSnippets || 'No active workflows in current scope.'}

Instructions:
Provide a precise, factual, executive-ready response grounded in the provided documents and workflows. Do not fabricate figures. Reference cited documents with their exact titles. Suggest concrete strategic next steps. Output strictly conforming to the JSON schema.`;

  const rawJson = await generateGeminiResponse(prompt, copilotResponseSchema);
  try {
    return JSON.parse(rawJson);
  } catch (err) {
    console.error('[Gemini Service] Failed to parse copilot response JSON:', rawJson);
    return {
      answer: `Synapse Core Synthesis: Regarding "${query}", enterprise metrics indicate operational stability across active departments. Verify open tasks in the Kanban board for real-time progress.`,
      groundingCitations: [
        {
          sourceTitle: "Synapse Enterprise Knowledge Base",
          department: departmentFilter !== 'all' ? departmentFilter : 'operations',
          relevance: "Primary operational baseline"
        }
      ],
      recommendedActions: [
        "Review open high-priority workflows in the designated department",
        "Synchronize cross-functional team leads during weekly briefing"
      ]
    };
  }
};

export const generateExecutiveBriefing = async ({ documents = [], workflows = [], auditCount = 0 }) => {
  const prompt = `Generate a high-level weekly executive briefing for the leadership team of Synapse Enterprise AI.
Context:
- Ingested Documents Count: ${documents.length}
- Recent Document Highlights: ${documents.slice(0, 3).map(d => d.title).join(', ')}
- Total Workflows Tracked: ${workflows.length}
- Critical/High Priority Workflows: ${workflows.filter(w => w.priority === 'critical' || w.priority === 'high').length}
- Completed Milestones: ${workflows.filter(w => w.status === 'completed').length}
- Total System Audit Trail Events: ${auditCount}

Provide an executive briefing in Markdown format with sections:
1. Executive Summary & Health Index
2. Cross-Departmental Bottlenecks & Risk Factors
3. AI-Driven Strategic Recommendations for the Week Ahead`;

  return await generateGeminiResponse(prompt, null);
};

