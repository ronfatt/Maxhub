export type QuestionType =
  | "single-choice"
  | "multiple-choice"
  | "true-false"
  | "matching"
  | "hotspot"
  | "drag-drop"
  | "step-order"
  | "tool-selection"
  | "scenario-choice"
  | "rubric-response";

export type AssessmentStatus = "draft" | "published" | "archived";

export type CompetencyArea =
  | "technical-operations"
  | "whiteboard-smart-ink"
  | "ai-courseware"
  | "ai-activity"
  | "smart-quiz"
  | "hybrid-learning"
  | "lesson-analytics"
  | "classroom-engagement"
  | "ai-pedagogy"
  | "data-intervention";

export type AssessmentQuestion = {
  id: string;
  section: "A" | "B" | "C";
  type: QuestionType;
  prompt: string;
  score: number;
  competency: CompetencyArea;
  difficulty: "foundation" | "intermediate" | "advanced";
  options?: Array<{
    id: string;
    label: string;
    isCorrect?: boolean;
  }>;
  simulation?: {
    screen: string;
    expectedAction: string;
    correctTarget?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    requiredSteps?: string[];
  };
  explanation?: string;
  recommendedModule?: string;
};

export type AchievementRule = {
  minPercentage: number;
  label: string;
  certificateEligible: boolean;
};

export type AssessmentPack = {
  id: string;
  name: string;
  version: string;
  status: AssessmentStatus;
  totalScore: number;
  sections: Array<{
    id: "A" | "B" | "C";
    title: string;
    totalScore: number;
  }>;
  achievementRules: AchievementRule[];
  retakePolicy: {
    minimumDaysBeforeRetake: number;
    maximumAttemptsPerYear: number;
  };
  questions: AssessmentQuestion[];
};

export const sampleAssessmentPack: AssessmentPack = {
  id: "sabah-maxhub-easiclass-2026-pilot",
  name: "Sabah MAXHUB EasiClass Certification 2026 - Pilot",
  version: "1.0",
  status: "published",
  totalScore: 180,
  sections: [
    { id: "A", title: "Knowledge Assessment", totalScore: 80 },
    { id: "B", title: "Digital Simulation", totalScore: 40 },
    { id: "C", title: "Mission-Based Assessment", totalScore: 60 },
  ],
  achievementRules: [
    {
      minPercentage: 85,
      label: "MAXHUB Certified Educator - Advanced",
      certificateEligible: true,
    },
    {
      minPercentage: 70,
      label: "MAXHUB Certified Educator",
      certificateEligible: true,
    },
    {
      minPercentage: 50,
      label: "Digital Classroom Practitioner",
      certificateEligible: true,
    },
    {
      minPercentage: 0,
      label: "Retake Required",
      certificateEligible: false,
    },
  ],
  retakePolicy: {
    minimumDaysBeforeRetake: 7,
    maximumAttemptsPerYear: 3,
  },
  questions: [
    {
      id: "A-001",
      section: "A",
      type: "single-choice",
      prompt: "Which EasiClass feature helps teachers create lesson materials with AI support?",
      score: 1,
      competency: "ai-courseware",
      difficulty: "foundation",
      options: [
        { id: "A", label: "AI Courseware", isCorrect: true },
        { id: "B", label: "Lesson Archive" },
        { id: "C", label: "Device Lock" },
        { id: "D", label: "Screen Saver" },
      ],
      recommendedModule: "AI Courseware Basics",
    },
    {
      id: "B-001",
      section: "B",
      type: "step-order",
      prompt: "Arrange the correct workflow to create a Smart Quiz from an AI-generated lesson.",
      score: 4,
      competency: "smart-quiz",
      difficulty: "intermediate",
      simulation: {
        screen: "easiclass-simulator",
        expectedAction: "order-workflow",
        requiredSteps: [
          "Open AI Courseware",
          "Select lesson topic",
          "Generate Smart Quiz",
          "Assign activity to class",
        ],
      },
      recommendedModule: "Smart Quiz Classroom Workflow",
    },
    {
      id: "C-001",
      section: "C",
      type: "scenario-choice",
      prompt:
        "A teacher sees that most students answered one Smart Quiz item incorrectly. What is the best next action?",
      score: 3,
      competency: "lesson-analytics",
      difficulty: "intermediate",
      options: [
        { id: "A", label: "Ignore the result and continue the lesson" },
        { id: "B", label: "Use Lesson Analytics to identify the misconception and reteach", isCorrect: true },
        { id: "C", label: "Give the same quiz again immediately" },
        { id: "D", label: "Remove the question from future lessons" },
      ],
      recommendedModule: "Data-Driven Intervention",
    },
  ],
};

export function resolveAchievement(
  score: number,
  totalScore: number,
  rules: AchievementRule[],
) {
  const percentage = Math.round((score / totalScore) * 100);
  const sortedRules = [...rules].sort((a, b) => b.minPercentage - a.minPercentage);
  const achievement = sortedRules.find((rule) => percentage >= rule.minPercentage) ?? sortedRules.at(-1);

  return {
    score,
    totalScore,
    percentage,
    achievementLabel: achievement?.label ?? "Unclassified",
    certificateEligible: achievement?.certificateEligible ?? false,
  };
}
