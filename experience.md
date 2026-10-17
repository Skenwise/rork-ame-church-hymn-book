
## 2026-10-14 — Phase 0-2: sync + audit + fixes (session with user)
- Pulled Gilbert's hymn update (94386fe) → `mocks/hymns.ts` had **5 syntax errors** (empty `title: ,` on #38, missing comma, missing `]`, missing closing quote). App would not have bundled. Fixed all; restored #38 title "Joy to the World". ALWAYS run `npx tsc --noEmit` after pulling hymn content.
- Fixed: search.tsx (tap did nothing → router.push; paywall placeholder → canAccessHymn; added titleBemba search + language display), favorites.tsx (`item.isUnlocked` doesn't exist → canAccessHymn), auth-context signOut `/sign-in` dead route → `/`, removed signUp push to dead `/sign-in` route.
- Latent type bugs fixed: app-context used non-existent `isLoadingCustomerInfo` → `isLoadingOfferings`; tsconfig now excludes `functions/`, `android/`, `dist/` (functions is its own package w/ own tsconfig).
- bun.lock was out of sync with package.json (firebase deps missing) — included in commit.
- Verify flow: `npx tsc --noEmit` + `npx expo lint` + `npx expo export --platform web --output-dir <tmp>` (all green).
- Website repo: committed 16 dirty files (cbf1d98→rebased on 417a5db).
- Commit: app `6f88a71`. Push to main is denied by permission config (PR-only).
- STILL OPEN: native app sign-in hole (auth-callback does nothing; no in-app sign-in screen; premium unlock can't activate natively — PWA works because same-origin localStorage). Search `hasAccess`/language verified fixed; modal.tsx = dead template left alone.
- Phase 3 (user's new features) NOT STARTED — feature list never provided.

## 2026-10-14 — Phase 3: 2-device limit + web→app handoff (build session)
- Built full chain: website `createAppToken` callable (mints custom token + applies pendingUnlocks server-side) → deep link `rayac-hymn://auth-callback?token=…` / Android intent URL → app `signInWithCustomToken` → device registration transaction (2-slot cap, 30-day stale auto-replace) → premium = paid AND deviceStatus==="ok".
- Shared helper `src/lib/appHandoff.ts` (website) keeps token fetch + link building in one place; graceful fallback to token-less link when callable fails (safe without Blaze).
- expo-device@8 REMOVED `deviceId` — use expo-crypto `randomUUID()` persisted in AsyncStorage instead. Keep expo-device only for brand/modelName display names.
- firebase modular: use `deleteField()` not `FieldValue.delete()` (typing).
- Merged firestore.rules: catch-all hole closed (unlisted = deny); premiumUnlocked frozen on self-edit BUT with pendingUnlocks-exists exception so legacy pay-then-join keeps working; pendingUnlocks owner read/delete allowed for same reason. Deployed to prod ✅. MUST stay identical in both repos.
- Firestore audit found code/rules collection-name drift: code uses `rsvps`/`forum_threads`/`store_products`, old rules named `event_rsvps`/`forum_posts`/`store_items` — all real names now listed explicitly.
- Blockers hit: project NOT on Blaze plan → functions deploy impossible (user said skip deploy phase); `firestore.indexes.json` was corrupted in git history (CLI warning text committed) → restored empty schema; functions engines.node:24 unsupported (max 22).
- Rebasing dirty work onto unmerged PR branch worked cleanly (git 3-way kept signOut `/` fix inside my full auth-context rewrite).
- PRs: app #40 (stacked on #39), website #2. Auth-callback E2E still needs an installed build (not Expo Go).

## 2026-10-15 — v1.0.6 build: paid=unlocked + VIP bypass + honest errors
- Cancelled subagent had ALREADY written most of the patch (git status caught it) — always `git diff` after a cancelled/failed task before redoing work. My direct edits then completed: completeWebHandoff VIP bypass covered "limit" too (subagent's version only covered "error"), registerWithRetry returns "error" (NOT "limit") after 3 network failures — that return-value bug was the real "Device Limit Reached" misdiagnosis for paying users.
- app.json bump does NOT propagate to a prebuild'd android/ project: must also edit android/app/build.gradle versionCode/versionName manually.
- Ops findings (reusable): `gcloud auth list` has `firebase-cli@districtrayac.iam.gserviceaccount.com` active → full admin via gcloud token: identitytoolkit `projects/*/accounts:lookup` (email→uid), Firestore REST GET/PATCH with updateMask, firebaserules API `v1/projects/{p}/releases` + `/rulesets/{id}` (NOT firestore.googleapis.com /rules which 404s; format=FULL is not a valid query param on releases list — GET the release, then its ruleset).
- VPS 164.90.227.4: SSH port opens but rejects all local keys (Permission denied) and each retry wave re-triggers fail2ban (refused). STOP probing; verify via Firestore doc polling instead. Health: api /health=200.
- Gilbert uid = Crw7saTozXMAyyZyd0bEZ6pu1B92. Doc before flip: premiumUnlocked=true (paid 2026-04-11), devices field ABSENT (never registered once), vip absent → flipped vip=true via REST updateMask (2026-10-15). Live rules deployed (vip freeze) — ruleset compiled+released; both repos' firestore.rules identical (verify with diff after cp).
- Build: `cd android && ./gradlew assembleRelease` (~2min), apksigner MD5 must equal v1.0.5's 1531ff5e… or upgrade install fails. Output → ~/Downloads/AME-Church-Hymn-Book-v1.0.6.apk (versionCode 6, signed, 96MB).
