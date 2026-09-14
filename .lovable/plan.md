Scope: `/home`, `/activity`, related stores. No backend changes.

## 1. Light Mode polish
- Add a subtle shadow token (`--shadow-card: 0 1px 2px rgba(15,23,42,.04), 0 1px 3px rgba(15,23,42,.06)`) applied to card containers on Home + Activity.
- Slight off-white surface for card backgrounds in light mode (e.g. `bg-white` inside a page bg of `#FAFAFA`), keep border `#E6E6E6`, remove the "all-flat white" feel.
- Dark mode unchanged.

## 2. Onboarding Tasks (Setup) — rewrite the 5 items

Order + copy:
1. **Check your CRM** — "See the leads we found during onboarding." → Open CRM → `/kanban`. Auto-complete on first visit to `/kanban`.
2. **Upload your LinkedIn connections** — "Import your network so we can find people who match your ICP." → Upload CSV. Opens a guided dialog:
   - Step 1: link to `https://www.linkedin.com/mypreferences/d/download-my-data`, explain "Download larger data" + 24h email.
   - Step 2: drop zone for `Connections.csv` (client-side mock, marks task done on upload).
3. **Connect your LinkedIn** — "Connect your account to engage with leads and track replies." → Connect → `/inbox`.
4. **Complete your settings** — "Add competitors to track and review content preferences." → Review settings → `/settings` (route stub if missing; otherwise navigate via `openDestination`).
5. **Create your first post** — "Check ideas and start the first LinkedIn post." → Check ideas → `/post-ideas`.

Auto-completion:
- Task 1 (CRM) completes on first `/kanban` visit — set a `crmVisited` flag in onboarding store, mark task completed when Home loads.
- Others: user can check them manually or via CTA (current pattern).

## 3. Daily Tasks — conditional, up to 7

Replace the fixed `DAILY_TASKS` array with a function `getDailyTasks()` that assembles items only when relevant. For the prototype, drive visibility from simple mock signals (all present by default so the page shows the intended state, but each has a `visible()` predicate we can tweak):

- Comment on today's ICP posts → `/outreach` (7)
- Check content ideas → `/post-ideas` (weekly)
- Review content draft → `/post-ideas?tab=drafts` (when drafts w/ User Review exist)
- Approve a scheduled post → `/post-ideas?tab=drafts` (when scheduled today/tomorrow unapproved)
- Check your hottest leads → `/kanban`
- Write outreach messages → `/kanban`

Header: "Today's tasks" + counter "N actions ready". Empty state: "You're all caught up — We'll add new tasks when something needs your attention."

## 4. Activity feed refactor

`src/lib/activity-data.ts`:
- New event types: `post_like`, `post_comment`, `you_commented`, `you_reacted`, `message_received`, `connection_accepted`, `leads_added`, `lead_hot`, `lead_reach_out`, `lead_follow_up`, `ideas_generated`, `draft_ready`, `post_published`.
- Each item gets: `avatarUrl?`, `personName?`, `postUrl?`, `postTitle?`. Copy in past tense per spec.
- Rewrite `ACTIVITY_LOG` with ~20 items using the new copy, avatars via `https://i.pravatar.cc/64?u=<seed>`, plausible LinkedIn post URLs.

Home aside + `/activity` page:
- Render small round avatar (20px) beside the name.
- Post title becomes an `<a target="_blank">` link when `postUrl` present.
- Remove icons per spec (activity page already icon-less; keep it that way).
- Activity page filter uses the new type labels.

## 5. Task store changes

`src/lib/onboarding-store.ts`:
- Extend `TaskType` with `settings`, `connect_linkedin`, `import_connections`, `view_crm`, `first_post` (rename existing IDs).
- `makeInitialTasks()` returns the new 5 setup tasks.
- Add `crmVisited?: boolean` to `OnboardingData`; a helper `markCrmVisited()` toggles it and completes the task.
- Trigger `markCrmVisited()` from `/kanban` on mount.

## Technical notes
- All new UI uses shadcn primitives (`Dialog` for CSV upload, `Badge` for counts).
- Keep localStorage schema backward-compatible via `defaultState` merge (already in place).
- No new deps.

## Out of scope
- Real `/settings` page (link only; stub route can render a placeholder).
- Real CSV parsing (mock upload only).
- Backend-driven daily task computation (predicates are local mocks).
