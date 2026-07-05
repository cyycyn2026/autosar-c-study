# AGENTS.md

This file defines how Codex should work in this repository.

## Project Goal

This is a long-term Chinese learning website for preparing an engineer for AUTOSAR BSW work.

The learning path should start from practical C fundamentals and gradually move toward:

- AUTOSAR BSW engineering habits
- Infineon AURIX TC3xx platform basics
- LSL, startup flow, linker scripts, memory layout
- MCAL and BSW module concepts
- Communication, memory, diagnostics, OS, scheduling, and project-style exercises

The target learner has some C foundation but is not from a formal CS background. Explanations should be detailed, patient, and practical.

## Content Rules

- Use section naming: `第 01 节`, `第 02 节`, etc.
- Do not use week naming such as `第几周`, `week`, or `周末`.
- Keep early content focused on C foundations: types, memory, pointers, arrays, strings, structures, functions, macros, build flow, and debugging.
- Connect C concepts to AUTOSAR examples whenever possible, such as `Std_ReturnType`, `uint8 *SduDataPtr`, configuration tables, DET checks, memory sections, and buffer handling.
- Each section should normally include:
  - learning goals
  - detailed concept explanation
  - code examples
  - practice tasks
  - a completion checkbox/checklist
  - a short quiz
  - detailed answer explanations after submission
- For beginner-sensitive topics, especially pointers, explain from first principles and avoid assuming CS vocabulary.

## Roadmap Direction

Keep the long-term roadmap aligned with this shape:

- 第 01-20 节: C engineering foundation
- 第 21-30 节: TC3xx platform basics
- 第 31-40 节: LSL, startup, and memory layout
- 第 41-55 节: AUTOSAR BSW basics
- 第 56-75 节: TC3xx common MCAL modules
- 第 76 节以后: storage, communication, diagnostics, OS/scheduling, and project labs

The roadmap can evolve, but changes should make the learner path clearer rather than just adding more topics.

## UI And UX Rules

- Keep the UI clean, practical, and study-focused.
- Preserve the existing visual direction unless the user explicitly asks for a redesign.
- The first screen should be the actual learning experience, not a marketing landing page.
- The site should work on mobile and desktop.
- Avoid text overlap, oversized decorative sections, and UI that looks busy.
- Keep repeated learning cards consistent.
- Do not add external dependencies unless they are necessary and reliable. If an external CDN can block the app, prefer local or dependency-free behavior.

## Learner Progress Rules

- Different learners should be able to enter their own name before studying.
- Progress should be stored per learner name where possible.
- Learner-facing pages must not show other learners' records.
- Admin-only views must require a secret or explicit admin entry point.
- Do not commit real secrets, private keys, tokens, or admin passwords to the repository.

## Coding Rules

- Keep this as a small static website unless the user explicitly asks for a backend.
- Prefer simple HTML, CSS, and JavaScript that can run on GitHub Pages.
- Keep changes scoped. Do not rewrite unrelated sections while fixing one issue.
- When editing `app.js`, be careful with quotes inside Chinese text. Syntax-check after edits.
- When adding code examples for C, keep them readable and focused on the lesson.
- Avoid destructive Git commands. Do not use `git reset --hard` or checkout files to discard changes unless the user explicitly asks.

## Verification Checklist

Before finishing a meaningful site change, run the relevant checks:

```sh
node --check app.js
git status --short --branch
```

If a local preview is useful, serve the directory with a simple static server and verify the main workflow:

```sh
python3 -m http.server 8000
```

Check at least:

- page loads without JavaScript syntax errors
- entering a learner name opens the study interface
- section navigation works
- completion/progress state can be saved
- quizzes can be submitted and show explanations
- mobile layout is usable

## GitHub Pages Publishing

The public site is expected to be served from GitHub Pages.

Keep `main` and the publishing branch aligned when the user asks to upload/publish:

1. Commit the finished change on `main`.
2. Apply the same commit to `gh-pages`, usually by cherry-picking.
3. Push both branches:

```sh
git push origin main gh-pages
```

After publishing, verify the live URL when network access is available:

```text
https://cyycyn2026.github.io/autosar-c-study/
```

If users still see an old version, bump the local script cache query in `index.html`, for example `app.js?v=YYYYMMDD-HHMM`, and provide a cache-busting URL.

## Incident Recovery

When the site breaks:

- First inspect the live `index.html` and `app.js` if network is available.
- Run JavaScript syntax checks.
- Look for bad commits before making new changes.
- Prefer non-destructive recovery, such as `git revert`, so history stays understandable.
- If another tool or assistant added broken content, isolate and revert the broken commits instead of rewriting the whole project.
- Summarize the symptom, root cause, fix, and verification in the final response.

## Communication Style

- Speak to the user in clear Chinese.
- Keep status updates short and practical.
- The user prefers direct action over long abstract explanations.
- When the user asks to continue building course content, implement and verify instead of only proposing a plan.
- If something cannot be done safely, explain the blocker plainly and give the next best path.
