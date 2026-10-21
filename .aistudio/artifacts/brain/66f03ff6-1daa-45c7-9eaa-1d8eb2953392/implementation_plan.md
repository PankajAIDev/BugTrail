# BugTrail AI — Interactive Debugging Learning Platform

BugTrail AI is a responsive educational web application designed to teach beginner programmers how to debug real-world C and Python code through interactive multi-choice bug identification, 3-tier progressive hints, verified solutions, code diff breakdowns, and a persistent gamified mastery tracker.

***

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed in Phase 1 and are reflected in this implementation blueprint:

- **Confirmed Aesthetic Direction**: VS Code modern dark workspace with deep obsidian/charcoal canvas (`#0b0f19` / `#111827`), subtle borders (`#1f293d`), and focused indigo (`#6366f1`) & cyan (`#06b6d4`) accents. No generic AI purple gradients or candy pill badges.
- **Confirmed AI Feature Presentation**: Interactive "Ask AI Tutor" side/drawer panel that loads contextual insights alongside the verified solution, explaining root causes in beginner-accessible terms without altering official scoring or answers.
- **Deterministic Reliability Guarantee**: All 12 curated challenges (6 C, 6 Python) and evaluation logic run client-side with full offline functionality. If `GEMINI_API_KEY` is missing or rate-limited, the system falls back gracefully to the authoritative verified explanation.

***

## 1. Overview & Core Concept

- **What It Does**: BugTrail AI puts learners in the shoes of a software engineer hunting down realistic bugs across C and Python. For each challenge, users inspect buggy code with syntax-highlighted line numbers, review task criteria, diagnose the issue through four carefully crafted plausible choices, unlock progressive hints when stuck, submit their diagnosis to earn XP, and inspect the verified diff and explanation.
- **Target Audience / Persona**: College computer science students, bootcamp learners, and programming beginners learning pointers, loops, memory bounds, formatting, scopes, and data structures in C and Python.
- **Tagline**: *Find the bug. Follow the clues. Understand the fix.*
- **Key Value**: Replaces passive code reading with active root-cause debugging practice in a frictionless, zero-setup environment that never breaks during a live demonstration.

***

## 2. User Experience & Visual Design

### Key User Flows

1. **Dashboard (Home)**:
   - Displays learner level badge, total earned XP, completed challenges counter, overall accuracy percentage, and a verified calendar-based daily activity streak.
   - Includes a high-priority "Continue Learning" action targeting the next uncompleted challenge.
   - Shows language mastery progress bars (C vs. Python) and recent debugging attempt activity.
   - Direct CTA buttons: "Start Next Challenge" and "Explore Challenge Library".

2. **Challenge Library (`/challenges`)**:
   - Filter bar: Language tabs (All, C, Python), Difficulty tabs (All, Beginner, Intermediate, Advanced), and Bug Category dropdown (Memory/Pointers, Syntax & Scope, Control Flow, Types & Formats, Data Structures, Exceptions).
   - Real-time search by challenge title, concept, or description keywords.
   - Clean card grid showing title, language, difficulty, category, XP reward, and visual completion status (completed checkmark vs. pending).

3. **Debugging Workspace (`/workspace/:id`)**:
   - **Split Two-Zone Sandbox Layout**:
     - *Left Zone (Code & Instructions)*: Challenge description, expected behavior, and an IDE-styled code viewport with line numbers, syntax styling, and bug area markers.
     - *Right Zone (Diagnosis & Feedback Deck)*:
       - 4 plausible multiple-choice options with stable answer IDs.
       - Interactive "Submit Answer" button with immediate feedback.
       - Correct answer triggers XP animation, updates stats, reveals the authoritative explanation, and unlocks the "Next Challenge" button.
       - Incorrect answer highlights error state, allows retry, and preserves attempt count without farming XP.
       - "Need a Clue?" progressive hint drawer revealing Hint 1 (gentle nudge) $\to$ Hint 2 (location pointer) $\to$ Hint 3 (direct hint).
       - "Reveal Solution & Diff" action showing corrected code side-by-side or diff style.
       - "Ask AI Tutor" panel for deeper conversational breakdown powered by server-side Gemini 3.8 Flash.

4. **Learning Progress & Mastery (`/progress`)**:
   - Comprehensive breakdown of completed challenges by language and difficulty.
   - Category strengths radar/bar breakdown (e.g. Memory Management, Off-by-One, Type Safety).
   - Attempt history and accuracy analytics derived strictly from stored user actions.
   - "Reset All Progress" danger button with a confirmation modal.

5. **About / How It Works (`/about`)**:
   - Project background, pedagogical design, and clarity on curated verification vs. AI tutoring.
   - Safe sandbox disclaimer (no arbitrary code execution on client/server).

### Visual Identity & Theme Tokens

- **Dominant Neutral Canvas (60%)**: `#0b0f19` (main background), `#111827` (panels & card background).
- **Structural Surfaces & Hairline Dividers (30%)**: `#1e293b` (hairline borders), `#162032` (active item surfaces), `#334155` (code gutter dividers).
- **Accent Budget (10%)**: `#6366f1` (electric indigo for primary CTAs and active states), `#06b6d4` (cyan for active code highlights and C language tag), `#38bdf8` (Python language tag), `#10b981` (emerald for correct diagnosis), `#f43f5e` (rose for incorrect diagnosis), `#f59e0b` (amber for hint alerts).
- **Typography**: `Plus Jakarta Sans` for clean UI headings and body prose; `JetBrains Mono` / monospace for code editors, line numbers, and tabular numerals (`tabular-nums`).
- **Anti-Slop Restraint**: Zero candy pill capsules on metadata (clean inline text with `·` separators), no decorative pulsing dots, no fake telemetry, single-elevation card depth.

***

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Deterministic Built-In Dataset (12 Challenges)**
  - *Chosen Approach*: 12 verified challenges (6 in C, 6 in Python) hardcoded in `src/data/challenges.ts` with stable answer IDs, progressive hints, faulty code, corrected code, and root-cause explanations.
  - *Why*: Ensures the college demo runs 100% reliably regardless of internet connectivity, API quotas, or environment keys.
  - *Alternatives Considered*: Dynamic generation on each click. Rejected because dynamic challenges can produce ambiguous syntax or incorrect answers during a critical presentation.

- **Decision 2: LocalStorage Persistence with Migration Safeguards**
  - *Chosen Approach*: Single schema-versioned state store in `localStorage` tracking XP, completed challenge IDs, attempts history, and last active date.
  - *Why*: Instant setup, zero backend database overhead, fully working offline, and persists across page reloads.

- **Decision 3: Server-Side Gemini API Proxy (`/api/explain`)**
  - *Chosen Approach*: Lightweight server proxy in `vite.config.ts` (dev middleware) and `server.ts` using `@google/genai` and `gemini-3.8-flash`. Frontend never touches `GEMINI_API_KEY`.
  - *Why*: Strictly complies with security requirements while giving learners on-demand, beginner-friendly AI tutoring.

- **Decision 4: Stable Choice Verification**
  - *Chosen Approach*: Verification uses stable choice IDs (`opt-a`, `opt-b`, `opt-c`, `opt-d`) checked against `challenge.correctOptionId`.
  - *Why*: Prevents answer text mismatch or text trimming bugs.

***

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                               Browser UI                               │
│                                                                        │
│  ┌──────────────┐   ┌───────────────────┐   ┌───────────────────────┐  │
│  │  Dashboard   │   │ Challenge Library │   │  Debugging Workspace  │  │
│  └──────┬───────┘   └─────────┬─────────┘   └───────────┬───────────┘  │
│         │                     │                         │              │
│         ▼                     ▼                         ▼              │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    App State / Custom Hook                       │  │
│  │         (useUserProgress: XP, completions, streak, resets)        │  │
│  └──────────────────┬───────────────────────────────────────────────┘  │
│                     │                                   │              │
│                     ▼                                   ▼              │
│           ┌──────────────────┐               ┌────────────────────┐    │
│           │   localStorage   │               │ /api/explain POST  │    │
│           │ (offline cache)  │               └──────────┬─────────┘    │
└───────────┴──────────────────┴──────────────────────────┼──────────────┘
                                                          │
                                                          ▼
                                            ┌───────────────────────────┐
                                            │      Node.js Server       │
                                            │ (Express/Vite Middleware) │
                                            │  uses @google/genai SDK   │
                                            │  model: gemini-3.8-flash  │
                                            └───────────────────────────┘
```

### Challenge Topics Distribution (12 Curated Challenges)

- **C Challenges (6)**:
  1. *C-01 (Beginner)*: `scanf` missing address-of operator (`&`) causing segmentation fault.
  2. *C-02 (Beginner)*: Off-by-one loop condition leading to array buffer overflow (`<= size`).
  3. *C-03 (Intermediate)*: Assignment operator (`=`) mistakenly used inside conditional `if (count = 0)`.
  4. *C-04 (Intermediate)*: Missing format specifier mismatch in `printf` (`%d` used for float/double).
  5. *C-05 (Advanced)*: Returning a pointer to a local stack variable from a function.
  6. *C-06 (Advanced)*: Operator precedence bug mixing pointer dereference and postfix increment `*ptr++` vs `(*ptr)++`.

- **Python Challenges (6)**:
  7. *PY-01 (Beginner)*: Indentation mismatch inside a loop accumulator.
  8. *PY-02 (Beginner)*: Off-by-one `range(len(items))` boundary indexing issue.
  9. *PY-03 (Intermediate)*: Mutable default argument (`def add_item(item, items=[])`) leaking state across calls.
  10. *PY-04 (Intermediate)*: Modifying a list while iterating over it with a `for` loop.
  11. *PY-05 (Advanced)*: Identity comparison `is` vs value equality `==` on dynamic integers/strings.
  12. *PY-06 (Advanced)*: Exception handling bare `except:` masking `KeyboardInterrupt` and swallowing variable errors.

### State & Persistence Schema

```ts
interface UserProgress {
  totalXp: number;
  completedChallengeIds: string[];
  attempts: Record<string, { totalAttempts: number; isCorrect: boolean; timestamp: number }>;
  hintsRevealed: Record<string, number>; // challengeId -> hint count revealed
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
}
```

### Verification & Testing Plan

1. **Dashboard Check**: Verify XP, streak, accuracy, and recent activity calculate cleanly with zero runtime exceptions.
2. **Library Filtering**: Verify language tabs, difficulty tabs, and keyword search filters properly across all 12 items.
3. **Workspace Diagnosis**:
   - Verify correct option yields XP exactly once.
   - Verify incorrect option triggers error feedback without awarding XP or duplicate scoring.
   - Verify progressive hints unlock 1 by 1 up to 3.
   - Verify solution diff view shows clear line comparisons.
4. **AI Tutor Resilience**:
   - Verify `/api/explain` answers prompt with Gemini.
   - Verify graceful fallback to local explanation if no key or network error occurs.
5. **Persistence & Reset**:
   - Refresh page to verify state survives in `localStorage`.
   - Trigger "Reset Progress" with confirmation dialog to ensure full cleanup.
6. **Responsive Layout**: Test 1440px desktop workspace and compact mobile viewport with zero horizontal overflow.
