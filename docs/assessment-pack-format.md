# MAXHUB Assessment Pack Format

This platform treats exam content as versioned assessment packs. Admins can draft, publish, replace, or archive packs without changing the application code.

## Pack Fields

| Field | Example |
| --- | --- |
| Pack Name | Sabah MAXHUB EasiClass Certification 2026 - Pilot |
| Version | 1.0 |
| Status | draft / published / archived |
| Total Score | 180 |
| Sections | A: 80, B: 40, C: 60 |
| Retake Policy | 7 days, maximum 3 attempts per year |

## Question Fields

| Field | Notes |
| --- | --- |
| id | Unique question ID, for example A-001 |
| section | A, B, or C |
| type | single-choice, multiple-choice, hotspot, step-order, scenario-choice |
| prompt | Question or task instruction |
| score | Marks awarded for the item |
| competency | AI Courseware, Smart Quiz, Lesson Analytics, Hybrid Learning, etc. |
| difficulty | foundation / intermediate / advanced |
| options | For MCQ or scenario questions |
| correctAnswer | Option ID, answer array, hotspot target, or expected step sequence |
| explanation | Feedback shown in competency reports |
| recommendedModule | Learning module suggested after weak performance |

## Section B Simulation Fields

| Field | Notes |
| --- | --- |
| simulationScreen | Screen or mockup used for the task |
| expectedAction | click, drag, order-workflow, select-tool |
| correctTarget | x, y, width, height for hotspot tasks |
| requiredSteps | Ordered list for workflow tasks |
| scoringRule | full mark, partial mark, or step-based scoring |

## Excel Import Columns

```text
Section
Question Type
Question
Options
Correct Answer
Score
Competency Area
Difficulty
Explanation
Recommended Learning Module
Simulation Screen
Expected Action
Correct Target
Required Steps
Scoring Rule
```
