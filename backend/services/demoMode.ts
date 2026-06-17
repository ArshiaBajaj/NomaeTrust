export type DemoAnalysisResult = {
  transcript: string;
  claim: string;
  confidence: number;
  status: string;
  demoMode: true;
};

export const DEMO_ANALYSIS_RESULT: DemoAnalysisResult = {
  transcript:
    "The local food bank has permanently closed and residents should stop visiting the center.",
  claim: "The local food bank has permanently closed.",
  confidence: 0.87,
  status: "Needs Verification",
  demoMode: true,
};
