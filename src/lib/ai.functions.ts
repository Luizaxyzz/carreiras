import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { runAnalysis, runOptimization, runResumeBuilder, runCoverLetter, runInterviewPrep, runLinkedin } from "./matchcv.server";

export const analyzeApplication = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: unknown) => z.object({ resumeText: z.string().min(30), resumeId: z.string().uuid().optional(), jobDescription: z.string().min(20), jobUrl: z.string().optional() }).parse(data)).handler(async ({ data, context }) => runAnalysis(context, data));
export const optimizeResume = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: unknown) => z.object({ analysisId: z.string().uuid() }).parse(data)).handler(async ({ data, context }) => runOptimization(context, data.analysisId));
export const buildResume = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: unknown) => z.object({ profileText: z.string().min(30) }).parse(data)).handler(async ({ data, context }) => runResumeBuilder(context, data.profileText));
export const generateCoverLetter = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: unknown) => z.object({ analysisId: z.string().uuid() }).parse(data)).handler(async ({ data, context }) => runCoverLetter(context, data.analysisId));
export const generateInterviewQuestions = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: unknown) => z.object({ analysisId: z.string().uuid() }).parse(data)).handler(async ({ data, context }) => runInterviewPrep(context, data.analysisId));
export const generateLinkedinSuggestions = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((data: unknown) => z.object({ analysisId: z.string().uuid() }).parse(data)).handler(async ({ data, context }) => runLinkedin(context, data.analysisId));
