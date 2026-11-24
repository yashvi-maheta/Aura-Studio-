# Aura Studio — Prompt History

**Project:** Aura Studio — Salon Queue Management System  
**Course:** MSc IT Vibe Coding Project  
**AI coding tool:** Kiro  
**Repository:** https://github.com/yashvi-maheta/Aura-Studio-  
**Live application:** https://aura-studio-lake.vercel.app

---

## Important note about this prompt record

This file is organised in the order of the development work that can be established from the available project notes and conversation history.

- The two prompts in **Section 1** are reproduced from the messages supplied by the developer. They are the first two Kiro prompts available in the records shared for this document; they are not claimed to be the first prompts ever used in another chat.
- Some later Kiro messages are not available as exact verbatim transcripts. Those entries are marked **[Reconstructed from development history]**. They describe the task or final instruction associated with work that is known to have happened; they must not be treated as exact quotations.
- Where an issue required several rounds of debugging, the relevant final task is summarised rather than inventing a verbatim prompt for every correction.
- This record should be updated if the original Kiro chat history contains additional prompts that are not represented here. The assignment guide asks for every prompt used, including unsuccessful ones.

---

# 1. Initial project documentation and design prompts

## Prompt 1 — Create project documentation before coding

**Source:** Prompt supplied by the developer.  
**Status:** Original wording provided.

```text
I am developing a full-stack Salon Queue Management System
called "Aura Studio" as my MSc IT Vibe Coding project.

Before writing any application code, create the project
documentation inside the docs folder.

Create the following four files:

1. docs/01-brief.md
2. docs/02-screens.md
3. docs/03-flows-rules.md
4. docs/04-design-system.md

PROJECT CONCEPT:

A salon queue management application where customers can
explore salon services, register for a walk-in queue, receive
a unique token and track their queue position in real time.

STAFF can manage waiting customers, start services and mark
them completed.

ADMIN can manage salon services, stylists and view daily
business statistics.

REQUIRED SCREENS:

1. Customer Home and Services (/)
2. Queue Registration (/join)
3. Customer Queue Tracking (/track/:id)
4. Staff Queue Dashboard (/staff)
5. Now Serving Display (/display)
6. Admin Dashboard (/admin)

TECHNICAL STACK:

- React + Vite + TypeScript
- Tailwind CSS
- Node.js + Express
- SQLite database
- Socket.IO for real-time updates

IMPORTANT:

01-brief.md:
Explain the problem, users, main features and features
that are outside the project scope.

02-screens.md:
Describe all six screens in detail.
Include layouts, buttons, actions, responsive behaviour,
loading states, empty states and error states.

03-flows-rules.md:
Define customer registration, queue generation, queue
management, service status transitions, waiting-time
calculation, cancellation and edge cases.
Include a testing checklist.

04-design-system.md:
Define the complete visual identity of Aura Studio.
Include colours, typography, spacing, buttons, cards,
shadows, border radius, icons, image style and animations.

Do not write application code yet.

Make the documents detailed, consistent and suitable
for implementation by an AI coding agent.

Show me the completed documents and explain the
important decisions before proceeding.
```

## Prompt 2 — Establish the visual design system

**Source:** Prompt supplied by the developer.  
**Status:** Original wording provided.

```text
Read AGENTS.md and all files inside docs/.

Now establish the visual design system for Aura Studio.

THEME: Modern Aesthetic + Comfortable Space.

The website should feel like entering a premium, peaceful,
welcoming salon.

DESIGN DIRECTION:

- Warm ivory and cream backgrounds.
- Muted sage green as the primary accent.
- Soft beige and taupe secondary colours.
- Deep charcoal typography.
- Elegant serif headings paired with clean sans-serif body text.
- Generous whitespace.
- Rounded cards with subtle shadows.
- Soft borders and sophisticated layouts.
- Beautiful, realistic salon and beauty-service photography.
- Minimalist Lucide icons.

Avoid:
- Bright neon colours.
- Excessive gradients.
- Overcrowded layouts.
- Generic dashboard templates.
- Excessive animations.
- Unnecessary decorative elements.

Make the website feel premium, warm, calm and comfortable.

Create reusable design tokens and shared components.

The design must work beautifully on:
- Mobile phones (390px width).
- Tablets.
- Desktop screens.

Do not build all application features yet.

First show me the design system and a preview of the
main page. Wait for my approval before proceeding.
```

---

# 2. Project setup and understanding

## Prompt 3 — Review project instructions and documentation

**Status:** [Reconstructed from development history]

```text
Read AGENTS.md and all files inside docs/.

Understand the Aura Studio Salon Queue Management System,
its six required screens, design system, queue rules and
technical stack.

Before making changes, summarise the project structure
and explain the implementation plan. Follow the existing
documentation and do not introduce unrelated features.
```

## Prompt 4 — Set up the application structure

**Status:** [Reconstructed from development history]

```text
Set up the Aura Studio application using the documented
technology stack.

Use React, Vite, TypeScript and Tailwind CSS for the
frontend, Node.js and Express for the backend, SQLite
for persistent application data, and Socket.IO for
real-time updates.

Create a clear client/server project structure and
configure the application so that the frontend and
backend can be developed and run locally.

Keep the existing documentation. Do not replace the
approved design direction.
```

### Setup obstacle recorded

During the initial setup, the Kiro terminal could not find `node` or `npm` in its environment. PowerShell also rejected the `&&` command separator in the attempted command. The setup approach was then adjusted. This is included as a development obstacle; it is not presented as a successful application feature or a code fix.

---

# 3. Customer-facing functionality

## Prompt 5 — Build the customer home page and salon services

**Status:** [Reconstructed from development history]

```text
Implement the Customer Home and Services screen at `/`
according to docs/02-screens.md and the approved Aura Studio
design system.

Create a welcoming salon homepage with service categories,
service cards, service names, descriptions, prices and
estimated durations.

Use the warm ivory, cream, beige and muted sage-green
visual identity. Use suitable salon imagery, responsive
layouts and consistent reusable components.

The services displayed on the page should ultimately come
from the backend rather than being permanently hard-coded
in the frontend.

Make the navigation and Join Queue actions functional.
Do not change unrelated screens.
```

## Prompt 6 — Build queue registration

**Status:** [Reconstructed from development history]

```text
Implement the Queue Registration screen at `/join`.

Allow a customer to enter the required customer details,
select an available salon service and submit the registration.

Connect the form to the backend queue-registration API.
Validate required fields and show clear validation and
error messages.

After successful registration, create a queue entry,
generate its token and take the customer to the tracking
page for that queue entry.

Use the existing Aura Studio design system and make the
form responsive. Do not use mock registration data as the
final implementation.
```

## Prompt 7 — Build customer queue tracking

**Status:** [Reconstructed from development history]

```text
Implement the Customer Queue Tracking screen at
`/track/:id`.

Display the customer's token, selected service, current
queue status, number of customers ahead and estimated
waiting time.

Retrieve the queue entry from the backend using its ID.
Keep the displayed information updated when the queue
changes, using the existing real-time Socket.IO connection.

Provide clear loading, error and status states. Show a
cancellation action only when cancellation is allowed by
the queue rules.

Keep the existing visual design and responsive behaviour.
```

---

# 4. Staff dashboard and live queue workflow

## Prompt 8 — Implement the staff queue dashboard

**Status:** [Reconstructed from development history]

```text
Implement the Staff Queue Dashboard at `/staff`.

Connect it to the backend so staff can view the live queue,
including waiting customers and customers currently being
served.

Provide the required staff actions to call the next
customer, start a service, complete a service and handle
eligible cancellations or no-shows where supported by the
existing queue rules.

Use the correct backend endpoints and update the interface
after each successful action. Display clear loading,
success and error states.

Use the Aura Studio design system. Do not remove existing
working functionality or add unrelated features.
```

## Prompt 9 — Implement queue status transitions

**Status:** [Reconstructed from development history]

```text
Implement and verify the salon queue status workflow.

Use the statuses and allowed transitions defined in
docs/03-flows-rules.md. Ensure that staff actions update
the backend status and that invalid transitions are
rejected by the backend.

When a customer is called or a service begins, update the
customer tracking screen and the Now Serving display.
When a service is completed, remove the customer from the
active queue and update the relevant dashboard information.

Keep the frontend and backend behaviour consistent.
```

## Prompt 10 — Build the Now Serving display

**Status:** [Reconstructed from development history]

```text
Implement the Now Serving Display at `/display`.

Show the currently called or served queue token clearly,
along with the relevant next-customer information supported
by the application.

Connect the display to the backend and Socket.IO so that
queue changes appear automatically without requiring a
manual page refresh.

Design this screen for clear visibility on a larger display
while keeping it responsive. Follow the Aura Studio visual
identity and do not use static mock data as the final source.
```

---

# 5. Admin dashboard

## Prompt 11 — Implement admin dashboard functionality

**Status:** [Reconstructed from development history]

```text
Implement the Admin Dashboard at `/admin`.

Provide protected admin access and connect the dashboard
to the backend.

The dashboard must include:

1. Daily business statistics.
2. Salon service management, including viewing and
   managing services.
3. Stylist management.
4. Queue records.

Use the existing backend APIs and database. Ensure that
admin-only operations are protected on the backend, not
only hidden in the frontend.

Display useful loading, empty and error states. Keep the
existing Aura Studio styling and do not break the customer
or staff workflows.
```

---

# 6. Queue rules, backend integration and quality

## Prompt 12 — Audit salon queue business rules

**Status:** [Reconstructed from the project planning prompt]

```text
Read docs/03-flows-rules.md carefully.

Audit and implement all salon queue business rules.

Verify:

1. Queue tokens are unique and sequential each day.
2. Daily token numbering resets correctly.
3. Customers cannot register without required details.
4. Invalid phone numbers are rejected.
5. Customers cannot register for unavailable services.
6. Duplicate registrations are prevented.
7. Queue positions update correctly.
8. Waiting time is calculated using service durations
   and customers ahead in the queue.
9. Customers can cancel only while WAITING.
10. Staff cannot perform invalid status transitions.
11. Completed customers leave the active queue.
12. Data remains available after refreshing the browser.
13. Multiple browser windows synchronize automatically.
14. Backend validation is enforced.
15. All important data persists in SQLite.

Add proper loading states, error messages and empty states.

Do not add unnecessary features.

Test each rule and report PASS/FAIL.
```

## Prompt 13 — Connect frontend functionality to the backend

**Status:** [Reconstructed from development history]

```text
Review the frontend and backend integration across Aura
Studio.

Replace any remaining final-use mock data with real API
data where the backend functionality already exists.

Verify the API calls for services, stylists, queue
registration, queue tracking, staff actions, admin
authentication and admin dashboard data.

Handle API failures gracefully and show useful messages
instead of leaving screens blank.

Keep the current UI and avoid changing features that
already work.
```

## Prompt 14 — Review visual consistency and responsiveness

**Status:** [Reconstructed from the project planning prompt]

```text
Perform a complete visual consistency review of Aura Studio.

Check all six screens.

Ensure:
- Consistent typography.
- Consistent colours.
- Consistent button styles.
- Consistent card designs.
- Consistent spacing.
- Proper responsive layouts.
- Attractive service images.
- Smooth but subtle animations.
- Accessible text contrast.
- No overlapping elements.
- No horizontal scrolling on mobile.

The website should feel like a premium, comfortable,
modern salon rather than a generic management dashboard.

Do not remove any working functionality.

Show me the improvements made.
```

## Prompt 15 — Perform end-to-end testing

**Status:** [Reconstructed from the project planning prompt]

```text
Act as a senior QA engineer.

Audit the entire Aura Studio Salon Queue Management
System by actually running the application.

Test the complete customer-to-staff workflow:

1. Customer opens the salon website.
2. Customer selects a service.
3. Customer registers for the queue.
4. A unique token is generated.
5. Customer sees their tracking page.
6. Staff sees the new customer.
7. Staff calls the customer.
8. Customer tracking updates automatically.
9. Staff starts the service.
10. Staff completes the service.
11. Customer disappears from the active queue.
12. Now Serving display updates.
13. Admin changes a service's availability.
14. Customer screen reflects the change.

Test edge cases:

- Empty registration form.
- Invalid phone number.
- Duplicate registration.
- Unavailable service.
- Multiple customers joining.
- Sequential token generation.
- Daily token reset.
- Cancellation.
- Invalid status transitions.
- Browser refresh.
- Backend restart.
- Multiple browser windows.
- Socket.IO disconnection and reconnection.
- Mobile responsiveness.

Also verify:
- SQLite persistence.
- Frontend and backend validation.
- All buttons work.
- No broken routes.
- No console errors.
- Production build succeeds.

Fix reproducible bugs.

Finally provide:
1. Complete feature list.
2. PASS/FAIL test results.
3. Known limitations.
4. Commands to run the project.
5. All six screen URLs.
6. Remaining bugs.

Never claim something works unless you actually
tested it.
```

---

# 7. Issues found and final fix instructions

> The following entries document the important issues that were encountered during development. The wording is reconstructed from the recorded debugging work, not claimed to be a verbatim copy of the original Kiro messages.

## Issue 1 — Services were not loading or behaving correctly

**Observed issue:** The service information and service-related functionality needed additional debugging. Several iterations were made during development.

**Final fix instruction — reconstructed:**

```text
Audit the complete salon services flow from the backend
to the customer homepage and admin dashboard.

Verify that the backend services endpoint returns the
correct service records and that the frontend fetches and
displays those records correctly.

Check service creation, editing, availability changes
and the customer-facing service list. Ensure that changes
made by the admin are reflected on the customer side.

Fix the underlying API, database or frontend integration
issue rather than hiding the problem with hard-coded data.

Preserve the existing design and all other working features.
Test the complete services workflow after the fix.
```

## Issue 2 — Admin dashboard statistics returned an authentication error

**Observed issue:** The deployed admin statistics request returned HTTP 401. The admin dashboard did not load its statistics correctly.

**Final fix instruction — reconstructed:**

```text
Fix the admin authentication and dashboard statistics
flow in the production application.

Check the admin login session, session cookie settings,
backend authentication middleware and the admin statistics
API route.

Ensure that the statistics endpoint is protected by the
correct admin authentication middleware and that a
successfully authenticated admin can access it.

Add or verify an admin session-check endpoint so the
frontend can determine whether the admin is logged in
before loading protected dashboard data.

Preserve the security of admin-only routes. Do not make
the statistics endpoint public as a workaround.

Test admin login, session verification and statistics
loading in the deployed application.
```

## Issue 3 — Production frontend and backend communication / CORS

**Observed issue:** The deployed frontend and backend required production CORS and environment configuration corrections.

**Final fix instruction — reconstructed:**

```text
Audit and correct production communication between the
Vercel frontend and Render backend.

Verify the configured frontend origin, backend API URL,
CORS origin and credentials settings, Express middleware
order and session-cookie configuration.

Allow requests only from the configured production
frontend origin. Ensure that credentialed requests work
where required by authentication.

Do not replace the production API URL with localhost.
Do not weaken authentication or expose protected routes.

Verify the health endpoint and the required API requests
from the deployed frontend after the changes.
```

## Issue 4 — Direct navigation to frontend routes returned 404

**Observed issue:** The deployed React application needed a Vercel rewrite so that refreshing or opening application routes directly would load the React application.

**Final fix instruction — reconstructed:**

```text
Fix direct navigation and page refresh behaviour for the
deployed React Router application on Vercel.

Configure the appropriate Vercel rewrite so that valid
frontend routes are served through the application's
index.html entry point.

Do not interfere with backend API requests. Verify direct
navigation and refresh on the routes `/`, `/join`,
`/track/:id`, `/staff`, `/display` and `/admin`.

Keep the existing route components and application logic.
```

## Issue 5 — Staff dashboards could show inconsistent queue status

**Observed issue:** When one staff view called a customer and the customer's status changed to In Service, another staff dashboard could continue showing that customer as Waiting.

**Final status:** Known limitation in the recorded testing history. A complete fix was not confirmed, so this entry is not presented as a resolved bug.

**Investigation instruction — reconstructed:**

```text
Investigate queue synchronisation between multiple staff
dashboard sessions.

When one staff member calls or starts a customer's service,
all other connected staff dashboards should receive the
same updated queue state through the backend and Socket.IO.

Check event emission, event subscription, state refresh
and stale frontend state handling.

Do not change the queue status rules or unrelated screens.
Reproduce the issue with two separate browser sessions,
then report the cause and the smallest safe fix.
```

---

# 8. Production deployment

## Prompt 16 — Prepare and deploy the application

**Status:** [Reconstructed from the project planning prompt]

```text
Prepare Aura Studio for production deployment.

My deployment plan:

- Frontend: Vercel.
- Backend: Render.
- Database: SQLite.

Tasks:

1. Check the frontend production build.
2. Check backend production configuration.
3. Configure environment variables.
4. Configure the frontend API URL.
5. Configure the Socket.IO production connection.
6. Configure CORS correctly.
7. Check SQLite storage behaviour on the hosting platform.
8. Ensure all API URLs work outside localhost.
9. Verify direct navigation to all six routes.
10. Verify the deployed application on mobile.

Give me exact step-by-step deployment instructions.

Do not use localhost URLs in production.

Do not claim deployment is successful until the
live website has actually been tested.
```

## Prompt 17 — Verify the deployed application

**Status:** [Reconstructed from development history]

```text
Verify the deployed Aura Studio application using the
actual production URLs.

Check the customer homepage, service loading, queue
registration, customer tracking, staff login, staff queue
actions, Now Serving display and admin dashboard.

Check the production API and frontend integration.
Confirm that protected admin and staff functionality
requires authentication.

Report any failed checks and distinguish verified
functionality from known limitations. Do not claim a
feature works unless it has been tested on the live site.
```

---

# 9. Final implementation notes

The following points describe the recorded state of the project and are not additional prompts:

- The application uses React, Vite and TypeScript on the frontend.
- The backend uses Node.js and Express.
- SQLite is used for application data.
- Socket.IO is used for real-time queue updates.
- The frontend is deployed on Vercel.
- The backend is deployed on Render.
- The Complete Service action was tested and confirmed to work.
- The admin dashboard was tested for statistics, services, stylists and queue records.
- A staff-to-staff queue synchronisation inconsistency was observed and remains a known limitation in the available development record.
- The Render free service does not have a configured persistent disk in the recorded deployment setup. SQLite data persistence across service restarts or redeployments should therefore be treated as a deployment limitation, not assumed to be guaranteed.

---

**End of prompt history**
