# Caterpi Skills Passport

Frontend for the Caterpi Talent Skills Passport assessment: an authenticated passport, assessment evidence, a public profile at `/p/[username]`, and a visibility toggle. All passport and assessment values come from the supplied Supabase project.

## Live demo

- **Repository:** [github.com/dev-gurkirat/caterpi-frontend-assessment](https://github.com/dev-gurkirat/caterpi-frontend-assessment)
- **Deployed app:** Run `npx vercel login`, then `npx vercel --prod` from this folder, and replace this line with the `*.vercel.app` URL it prints.

Set these Vercel project environment variables (public values only, same as `.env.local`):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Setup

1. Install [Node.js](https://nodejs.org/) 22 or later.
2. In this folder, run:

```bash
npm install
```

3. Copy `.env.example` to `.env.local` and add the **public** Supabase values only:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

4. In the Supabase SQL editor, run `supabase/schema.sql` (safe to re-run).
5. Start the app:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000), create an account with email and password, then sign in.

## Scripts

```bash
npm run dev    # local app
npm run lint   # lint
npm run test   # unit tests
npm run build  # production build
```

## Architecture

```text
src/app/login                         Sign in and sign up (email + password)
src/app/(private)/passport            Authenticated passport (Screen A + D)
src/app/(private)/passport/capabilities/[capabilityId]
src/app/(private)/passport/assessments/[assessmentId]   Evidence (Screen B)
src/app/(public)/p/[username]         Public passport (Screen C)
src/lib/data                          Supabase queries, mappers, Storage, visibility
src/lib/domain                        Types, score formatting, progress, labels
src/lib/supabase                      Browser/server clients (anon key only)
src/lib/auth                          Session helper using auth.getUser()
```

Private pages wait for `getUser()` before querying. Scores and statuses are mapped in one place (`src/lib/domain/scores.ts`, `src/lib/data/mappers.ts`) so a scoring-model change does not require edits across cards and charts.

The public route selects only public-safe talent fields, filters `is_public = true`, and maps the result through `toPublicPassport`. Email, internal IDs, and assessment metadata are not included in that payload. Unknown and private usernames share the same empty state.

## Assumptions

- This frontend uses the test Supabase project. Schema, RLS, seed RPCs, and the private `evidence` bucket live in `supabase/schema.sql`.
- A talent row is created on signup via `handle_new_user` / `seed_demo_passport`. Signup is email + password only; the app does not auto-login after signup.
- Capability URLs use slugs (for example `/passport/capabilities/seo`). Assessment URLs use record IDs.
- Evidence files are loaded with short-lived signed URLs. Missing, expired, and inaccessible files are shown as empty states rather than errors.

## Trade-offs

- Demo seed data is created by security-definer RPCs so a new account has a complete, partial, and restricted mix without a separate admin tool.
- Public capability scores still require a server-side talent `id` to join related tables. That `id` is not returned in the public payload.
- Visibility uses optimistic UI with rollback on failure, then `revalidatePath` for the passport and public URL.

## What I would improve with more production time

- Replace demo seed RPCs with a proper backend-owned seed for each environment.
- Add an integration test that hits the public query path against a test project.
- Tighten Storage lifecycle (expiry, replacement) beyond signed URLs and `expires_at`.

## Credentials

No Supabase `service_role` key, database password, or other privileged secret is used in this frontend or committed to the repository. Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are required.

## Routes

- `/` home
- `/login` sign in / sign up
- `/passport` My Skills Passport
- `/passport/capabilities/[capabilityId]` capability history
- `/passport/assessments/[assessmentId]` assessment evidence
- `/p/[username]` public passport
