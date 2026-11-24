# 06 — Project Reflection

## Aura Studio — Vibe Coding Project Reflection

---

## Developing Aura Studio with AI-Assisted Coding

Building Aura Studio was my first experience using an AI coding assistant (Kiro) as the primary development tool throughout a full-stack project. Rather than writing every line of code manually, I directed the assistant using detailed prompts, reviewed its output, and iteratively refined the implementation. This approach — often called vibe coding — changed how I thought about software development. I found that the quality of the result depended heavily on how clearly I could express requirements, identify problems in generated code, and verify that the system actually behaved as described.

## An Issue I Identified During Development

One concrete gap I found by comparing the backend and frontend was the customer token cancellation feature. The backend implements a `DELETE /api/queue/token/:id` endpoint that cancels a customer's queue token and returns the updated queue snapshot. The endpoint is correctly protected by allowed-transition rules — it only works when the token is in the `waiting` status — and it broadcasts a live queue update to all connected clients via Socket.IO.

However, when I reviewed the customer tracking page (`/track/:id`), I found that no cancellation button exists in the interface. A customer who wants to leave the queue has no way to do so from their tracking screen, even though the backend is fully capable of handling the request.

I identified this by reading through the backend route file (`server/src/routes/queue.js`), noting the `DELETE` route, and then inspecting the corresponding frontend page (`client/src/pages/TrackPage.tsx`) to check whether it called that endpoint. It did not. The gap was real and straightforward to confirm from the source code.

Rather than adding a button at the last minute without proper testing, or claiming the feature was complete when it was not, I documented it as a known limitation in `docs/02-screens.md` and `docs/03-flows-rules.md`. Honest documentation of an incomplete feature is more valuable than a hidden one.

## What I Learned

Working through this project taught me several things I had not encountered as clearly in coursework before. I gained practical experience with SQLite — particularly understanding that a file-based database requires deliberate configuration for persistence when hosted on a platform like Render, and that this is easy to overlook. I learned how Express session cookies and bcrypt hashing work together for simple but real authentication, and how rate limiting and account lockouts protect against brute-force attacks on PIN login.

On the frontend side, I understood how Socket.IO enables different pages — the customer tracking screen, the staff dashboard, and the public display — to stay in sync without polling. I also learned that deploying a React SPA requires rewrite rules so that navigating directly to a route like `/track/abc` does not return a 404 from the hosting platform.

Debugging issues such as CORS failures between Vercel and Render, and session cookies not being sent in credentialed requests, gave me a much clearer picture of what production deployment actually involves compared to running everything on localhost.

## Conclusion

The most important lesson from this project is that AI-generated code requires careful review. The assistant produced working implementations quickly, but the responsibility for checking that the backend and frontend were actually consistent, that edge cases were handled, and that documented features were genuinely implemented rested entirely with me. Vibe coding accelerates development; it does not replace understanding.

---
