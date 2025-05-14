import { z } from "zod";
import { tool } from "ai";

// Common option schema used across multiple tools
export const optionSchema = z.object({
  id: z.string(),
  text: z.string(),
  label: z.string().optional(),
});

export type Option = z.infer<typeof optionSchema>;

// Assessment Result Schema
export const assessmentResultSchema = z.object({
  level: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  recommendations: z.array(z.string())
});

export type AssessmentResult = z.infer<typeof assessmentResultSchema>;

// Multiple Choice Question Schema
export const multipleChoiceSchema = z.object({
  question: z.string(),
  options: z.array(optionSchema),
});

export type MultipleChoiceInput = z.infer<typeof multipleChoiceSchema>;

export const multipleChoiceResponseSchema = z.object({
  question: z.string(),
  options: z.array(optionSchema),
  questionId: z.string(),
});

// Reading Comprehension Schema
export const readingComprehensionSchema = z.object({
  passage: z.string(),
  question: z.string(),
  options: z.array(optionSchema),
});

export type ReadingComprehensionInput = z.infer<typeof readingComprehensionSchema>;

export const readingComprehensionResponseSchema = z.object({
  passage: z.string(),
  question: z.string(),
  options: z.array(optionSchema),
  questionId: z.string(),
});

// Error Identification Schema
export const errorIdentificationSchema = z.object({
  sentence: z.string(),
  options: z.array(
    z.object({
      id: z.string(),
      position: z.number(),
      text: z.string(),
      label: z.string().optional(),
    })
  ),
});

export type ErrorIdentificationInput = z.infer<typeof errorIdentificationSchema>;

export const errorIdentificationResponseSchema = z.object({
  sentence: z.string(),
  options: z.array(
    z.object({
      id: z.string(),
      position: z.number(),
      text: z.string(),
      label: z.string().optional(),
    })
  ),
  questionId: z.string(),
});

// Paraphrasing Task Schema
export const paraphrasingSchema = z.object({
  sentence: z.string(),
  options: z.array(optionSchema),
});

export type ParaphrasingInput = z.infer<typeof paraphrasingSchema>;

export const paraphrasingResponseSchema = z.object({
  sentence: z.string(),
  options: z.array(optionSchema),
  questionId: z.string(),
});

// Idiomatic Expression Schema
export const idiomaticExpressionSchema = z.object({
  context: z.string(),
  expression: z.string(),
  question: z.string(),
  options: z.array(optionSchema),
});

export type IdiomaticExpressionInput = z.infer<typeof idiomaticExpressionSchema>;

export const idiomaticExpressionResponseSchema = z.object({
  context: z.string(),
  expression: z.string(),
  question: z.string(),
  options: z.array(optionSchema),
  questionId: z.string(),
});

// Conditional/Hypothetical Scenario Schema
export const conditionalScenarioSchema = z.object({
  scenario: z.string(),
  question: z.string(),
  options: z.array(optionSchema),
});

export type ConditionalScenarioInput = z.infer<typeof conditionalScenarioSchema>;

export const conditionalScenarioResponseSchema = z.object({
  scenario: z.string(),
  question: z.string(),
  options: z.array(optionSchema),
  questionId: z.string(),
});

// Tool Definitions using Vercel AI SDK's tool function
export const assessmentResultTool = tool({
  description: "Provide an assessment of the user's English proficiency level",
  parameters: assessmentResultSchema,
  execute: async ({ level, strengths, weaknesses, recommendations }) => {
    return {
      level,
      strengths,
      weaknesses,
      recommendations,
      timestamp: new Date().toISOString()
    };
  },
});

export const multipleChoiceTool = tool({
  description: "Present a multiple choice question to the user",
  parameters: multipleChoiceSchema,
  execute: async ({ question, options }) => {
    const questionId = `q-${Date.now()}`;
    return {
      question,
      options,
      questionId,
    };
  },
});

export const readingComprehensionTool = tool({
  description: "Present a reading comprehension passage with question to the user",
  parameters: readingComprehensionSchema,
  execute: async ({ passage, question, options }) => {
    const questionId = `rc-${Date.now()}`;
    return {
      passage,
      question,
      options,
      questionId,
    };
  },
});

export const errorIdentificationTool = tool({
  description: "Present a sentence with potential errors for the user to identify",
  parameters: errorIdentificationSchema,
  execute: async ({ sentence, options }) => {
    const questionId = `ei-${Date.now()}`;
    return {
      sentence,
      options,
      questionId,
    };
  },
});

export const paraphrasingTool = tool({
  description: "Present a sentence to be paraphrased with options",
  parameters: paraphrasingSchema,
  execute: async ({ sentence, options }) => {
    const questionId = `pt-${Date.now()}`;
    return {
      sentence,
      options,
      questionId,
    };
  },
});

export const idiomaticExpressionTool = tool({
  description: "Present an idiomatic expression with context and question",
  parameters: idiomaticExpressionSchema,
  execute: async ({ context, expression, question, options }) => {
    const questionId = `ie-${Date.now()}`;
    return {
      context,
      expression,
      question,
      options,
      questionId,
    };
  },
});

export const conditionalScenarioTool = tool({
  description: "Present a conditional or hypothetical scenario with a question",
  parameters: conditionalScenarioSchema,
  execute: async ({ scenario, question, options }) => {
    const questionId = `cs-${Date.now()}`;
    return {
      scenario,
      question,
      options,
      questionId,
    };
  },
});

// Export tools as an object for AI SDK
export const tools = {
  assessmentResult: assessmentResultTool,
  multipleChoice: multipleChoiceTool,
  readingComprehension: readingComprehensionTool,
  errorIdentification: errorIdentificationTool,
  paraphrasingTask: paraphrasingTool,
  idiomaticExpression: idiomaticExpressionTool,
  conditionalScenario: conditionalScenarioTool,
}; 