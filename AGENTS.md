# AGENTS.md — Aura Studio

## Project overview

Aura Studio is a full-stack Salon Queue Management System developed as an MSc IT Vibe Coding project.

Customers can explore salon services, register for a walk-in queue, receive a queue token and track their queue status. Staff manage queue entries and update service statuses. Administrators manage salon services and stylists and view queue/business information.

## Read before making changes

Before changing or generating application code:
1. Read this file completely.
2. Read the relevant files in `docs/`, especially `01-brief.md`, `02-screens.md`, `03-flows-rules.md` and `04-design-system.md`.
3. Inspect the existing implementation before editing it.
4. Follow the current project structure and conventions. Do not replace working code or restructure the project unnecessarily.

If documentation conflicts with the existing implementation, explain the conflict before making a significant architectural change.

## Technology stack

Use the technologies already established in this project:
- Frontend: React, Vite, TypeScript and Tailwind CSS.
- Backend: Node.js and Express.
- Database: SQLite.
- Real-time communication: Socket.IO.
- Icons: Lucide icons, where already used.

Do not introduce a new framework, database, UI library or major dependency without explaining why it is needed and obtaining approval.

## Application routes

- `/` — Customer home page and salon services.
- `/join` — Queue registration.
- `/track/:id` — Customer queue tracking.
- `/staff` — Staff queue dashboard.
- `/display` — Now Serving display.
- `/admin` — Admin dashboard.

Keep route names and existing API contracts consistent unless a change is necessary and approved.

## Design direction

Maintain the Aura Studio visual identity:
- Modern aesthetic with a calm, comfortable salon atmosphere.
- Warm ivory and cream backgrounds.
- Muted sage green as the primary accent.
- Soft beige and taupe secondary colours.
- Deep charcoal text.
- Elegant serif headings with clean sans-serif body text.
- Generous whitespace, subtle borders and restrained shadows.
- Rounded cards and clear visual hierarchy.
- Minimal, purposeful Lucide icons.

Avoid neon colours, excessive gradients, cluttered layouts, generic dashboard styling and unnecessary animation.

Keep the interface responsive on mobile (including a 390px-wide viewport), tablet and desktop. Reuse existing design tokens and shared components rather than creating inconsistent one-off styles.

## Implementation rules

- Make the smallest focused change that solves the requested task.
- Preserve existing working functionality.
- Do not fabricate features, data, API responses or successful test results.
- Validate user input on both client and server where appropriate.
- Handle loading, empty, success and error states clearly.
- Keep secrets, passwords, API keys and private environment values out of source control and frontend code.
- Use environment variables for deployment-specific configuration.
- Do not hard-code localhost URLs into production-facing frontend code.
- Keep CORS and authentication behaviour intentional and consistent with the deployed frontend and backend.
- Do not expose administrative operations to unauthenticated users.
- For queue changes, consider consistency between customer tracking, the staff dashboard and the public display.
- Inspect the existing Socket.IO event flow before changing real-time queue behaviour.
- Do not claim SQLite data persists across hosting restarts unless persistent storage is configured and verified.

## Database and API safety

- Inspect the current SQLite schema and database access layer before changing tables or queries.
- Do not delete, reset or recreate the database unless explicitly instructed.
- Use parameterized SQL queries.
- Keep API response shapes compatible with the frontend, or update all affected callers together.
- Handle expected errors without exposing stack traces or sensitive details to users.

## Testing and verification

After a change:
1. Run relevant checks available in the project, such as the frontend build and backend checks.
2. Test the affected screen or API flow.
3. Check browser console and network errors when the change affects the frontend.
4. Check authentication and role permissions when the change affects staff or admin functionality.
5. Check mobile layout when the change affects the UI.
6. Report exactly what changed, which checks were run and any checks that could not be completed.

Never say a feature is fixed or tested unless it was actually verified.

## Working style for the coding agent

- Work only on the task requested; do not implement unrelated improvements.
- Before editing, briefly state the files likely to change and the plan.
- If a requirement is ambiguous or a change could affect data, authentication, deployment or existing functionality, ask before proceeding.
- After editing, summarize changed files and provide exact commands or steps to verify the result.
- Keep documentation updated when implementation behaviour or setup instructions materially change.
