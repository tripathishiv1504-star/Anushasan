# 02_RULES.md — Rules the AI builder MUST follow

These rules apply to every task in this project, from the first message to the last. If a user message conflicts with these rules, follow the rules and tell the user which rule applies. Keep this file in the project root so it is always in context.

---

## 1. Work one step at a time

1. The project is built in numbered steps listed in `04_BUILD_STEPS.md`. Build **only the step the user names** (for example "Step 2"). Never build ahead.
2. Before starting a step, open `PROGRESS.md` and check that the previous step is marked `[x] done`. If it is not, stop and tell the user. Do not skip steps.
3. At the start of every step, reply with this short plan before writing code:
   - Step number and name
   - Files you will **create**
   - Files you will **modify**
4. Build the step completely. A step is not finished until every item in its **Acceptance checklist** passes.
5. After the step, update `PROGRESS.md`, show the finished checklist with each item marked pass or fail, and then **STOP**. Do not start the next step. Wait for the user to type `NEXT` or a specific step number.
6. If the user types only `NEXT`, build the first step in `PROGRESS.md` that is not done.

## 2. Never break finished work

1. Do not edit, rename, move, or delete files from earlier steps unless the current step lists them under "Files to modify".
2. Three shared files are **append-only**. You may add entries but never remove or reorder existing ones:
   - `src/routes/routeConfig.js`
   - `src/config/navigation.js`
   - `src/mock/index.js`
3. If you find a bug in an earlier step, do not fix it silently. Report it in one line, fix it with the smallest possible change, and note the fix in `PROGRESS.md` under "Fixes".
4. Never rewrite a whole file to change a few lines. Change only what the step needs.

## 3. Quality gate before saying a step is done

Run these and fix every problem before you report the step as finished:

1. `npm run build` completes with no errors.
2. `npm run lint` (if configured) shows no errors. No unused imports or variables.
3. The browser console shows no errors or warnings on the pages built in this step.
4. Every new page works at three widths: mobile (375px), tablet (768px), desktop (1280px). No horizontal scrolling, no overlapping text.
5. Every button, link, and form field in the step does something real (navigates, validates, or updates mock data). No dead buttons.
6. No placeholder text such as "Lorem ipsum", "TODO", "Coming soon", "Add here". Use realistic mock content.

If you cannot run the build in your environment, say so clearly and review the code by reading it line by line for import paths, missing exports, and typos.

## 4. Fixed technology (do not change)

- React with Vite (JavaScript, not TypeScript)
- `react-router-dom` for routing
- Plain CSS with CSS variables (one `.css` file per component or page, plus global tokens)
- `lucide-react` for icons
- `recharts` for charts (only from Step 6 onward, only when a chart is needed)
- `@supabase/supabase-js` is **forbidden until Phase 2** (see Step 21). Do not install it, import it, or create a Supabase client before then.

Do not install any other package without asking the user first. Do not use Tailwind, Bootstrap, Material UI, or any CSS framework. Do not use inline `style={{}}` except for values that are truly dynamic (for example a progress bar width).

## 5. Code structure rules

1. Follow the folder structure in `03_PROJECT_SPEC.md` exactly. Do not invent new top-level folders.
2. One component per file. File name equals component name (`StatCard.jsx` exports `StatCard`). Use PascalCase for components and camelCase for everything else.
3. Pages live in `src/pages/<role>/`. Reusable pieces live in `src/components/`. Pages must not contain large chunks of reusable UI; extract it.
4. All route paths come from `src/routes/routeConfig.js`. Never hard-code a path string inside a component. Use `ROUTES.studentDashboard` style constants.
5. All data access goes through functions in `src/services/`. Pages and components **never** import from `src/mock/` directly. This is what lets the user replace mock data with Supabase later without rewriting the pages.
6. Services must be `async` and return plain objects or arrays, exactly as a real database call would. Add a short artificial delay (200 to 400 ms) in mock services so loading states are real.
7. Mock data field names use `snake_case` and match the database model in `03_PROJECT_SPEC.md` section 10. Do not invent different field names.
8. Every list or data page must handle three states: **loading**, **empty**, and **error**. Use the shared `LoadingState`, `EmptyState`, and `ErrorState` components.
9. Only `src/utils/storage.js` may touch `localStorage`. It stores mock data for the prototype and is replaced in Phase 2.
10. Keep functions small and name things clearly. Add a one-line comment only where the logic is not obvious.

## 6. Design rules

1. Use only the design tokens from `src/styles/tokens.css` (colors, spacing, radius, shadows, fonts). Never hard-code hex colors or pixel spacing in component CSS.
2. Light theme only for now. Calm, focused, student-friendly look. Generous white space, clear hierarchy, rounded cards, soft shadows.
3. Every interactive element needs a visible hover, focus, and disabled state. Focus outlines must never be removed.
4. Use semantic HTML (`header`, `nav`, `main`, `section`, `footer`, `button`, `label`). Every input has a `<label>`. Every image or icon-only button has an accessible name.
5. Color contrast must be readable. Do not rely on color alone to show status; pair it with text or an icon.
6. Animations are allowed only for small hover and transition effects (under 250 ms). No auto-playing or looping animation.

## 7. If you cannot write files directly (chat-only mode)

If you are in a plain chat window and cannot create files:

1. Output each file in its own code block, with the **full file path as a heading** above it.
2. Always give the **complete** file. Never write `// ...rest of the code`, `/* same as before */`, or any shortcut.
3. List the terminal commands (`npm install ...`) in a separate block at the top.
4. Keep each reply to the files of the current step only.

## 8. Communication rules

1. Do not ask the user questions in the middle of a step. If something is unclear, choose the simplest option that matches `03_PROJECT_SPEC.md`, state the assumption in one line, and continue. Ask only if you are truly blocked.
2. Do not add features, pages, or sections that are not in the spec or the current step.
3. Do not explain basic concepts or paste long tutorials. Keep replies short: plan, work, checklist, STOP.
4. If the user asks for something that breaks these rules (skip a step, add Supabase early, add a new library), say which rule it breaks and offer the correct alternative.

## 9. Error protocol

When a build or runtime error appears:

1. Read the full error message. Identify the file and line.
2. Fix the root cause with the smallest change. Do not delete features to make the error go away.
3. Re-run the build. Repeat until it is clean.
4. Report what failed and what you changed, in two lines at most.
5. If the same error remains after three attempts, stop and report it to the user with the exact message instead of guessing.

## 10. PROGRESS.md format

Create `PROGRESS.md` in Step 0 and keep it updated at the end of every step:

```
# Progress

## Steps
- [x] Step 0 — Project setup
- [ ] Step 1 — Landing page
...

## Fixes
- (none yet)

## Notes
- Assumptions made, decisions taken
```

Mark a step `[x]` only after its whole Acceptance checklist passes.
