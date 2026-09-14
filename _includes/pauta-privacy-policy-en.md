Pauta is a daily planner for you and your family, dressed as a printed newspaper. This page
explains, in plain language, what the app stores, where it lives, who can see it, and how to get
it back or delete it.

---

### Who is responsible

**MagicLab Solutions**, a trading name of **Hoffmann Tech LTDA**, is the controller of the data
described here.

Questions, requests or complaints: [redacao@pauta.app](mailto:redacao@pauta.app). We answer in
English, Portuguese or Spanish.

---

### Your account

You can sign in to Pauta in three ways:

* **Sign in with Apple** — you may choose to hide your email address, and Apple gives us a relay
  address instead. That works fine; we never need your real one.
* **Email and password** — handled by Firebase Authentication. We never see your password.
* **An anonymous child account** — a child joins a household by typing a six-letter code that the
  owner of the house approved. There is no email, no password and no public sign-up for children.

For an account we keep your **name**, your **email** (when there is one), your **language** and
your **time zone**. That is the whole profile.

---

### What the household stores

Everything you write in Pauta belongs to your household and is visible to the people in it:

* **Members** — names and avatars, including children. No date of birth, no location, no phone
  number.
* **Tasks, groceries, wishes, ideas** and the sketches you draw (saved as PNG images).
* **Projects and milestones**, organised by area — Home, Work, Personal, Family.
* **Scheduled prompts and the proposals** they produce.
* **Notification preferences** and the push tokens of your devices, so a notification can reach
  the right phone.

Nobody outside your household sees any of it, and it is never used to build a profile of you.

---

### Where the data lives

Pauta runs on **Firebase**, from Google:

* **Firestore**, in the `nam5` region (United States), stores the household data.
* **Cloud Functions**, in `us-central1`, run the scheduled prompts, the AI calls and account
  deletion.
* A **local cache on your device** keeps the app working offline; it syncs when you come back.

If you are in Brazil or Europe, your data is transferred to and processed in the United States.
We rely on Google's standard contractual clauses for that transfer.

---

### How the AI works

When you capture something by voice or text, the app sends to our Cloud Functions:

* the text you typed, or the transcription of what you said, and
* a short summary of the household context — the names of your areas, projects and open tasks —
  so the AI can file the note in the right place.

The Functions pass that to the **Anthropic API (Claude)**, which returns the interpretation.
Under Anthropic's API terms, **this content is not used to train models**. Usage is metered per
plan.

Voice is transcribed by your own device, using Apple's dictation; the audio itself never reaches
our servers.

The AI proposes — it never decides. Every proposal waits for you to accept or ignore it.

---

### Payments

Subscriptions are sold through the **App Store**. Apple processes the payment and tells us only
whether the subscription is active. **We never see your card, your billing address or your
Apple Account.**

---

### Diagnostics

Version 1.0 includes **Firebase Crashlytics** (crash reports) and **Firebase Analytics**
(aggregate usage events, such as "a capture happened" or "the paywall was shown"). These events
carry **no personal data** — no task titles, no names, no notes.

---

### What we do not do

* No advertising, and no advertising identifiers.
* No tracking across other companies' apps or websites. Pauta does not ask for App Tracking
  Transparency permission, because it has nothing to track.
* No selling or renting of your data, to anyone, ever.
* No use of your household content to train any model, ours or anyone else's.

---

### Your rights

Under the Brazilian **LGPD** and the European **GDPR**, you can:

* **See and export your data** — Newsroom › Account › Export data hands you a file with
  everything your household holds.
* **Correct** anything wrong, directly in the app.
* **Delete your account** — Newsroom › Account › *Close the newsroom*. You have **30 days** to
  change your mind; after that a Cloud Function deletes the account and its data permanently.
* **Object, restrict or complain** — write to [redacao@pauta.app](mailto:redacao@pauta.app), or to
  Brazil's ANPD or your local data protection authority.

We keep your data for as long as the account exists, and no longer.

---

### Children

Children only enter a household when an adult invites them with a six-letter code. There is no
public registration for minors, no chat, no third-party content and no advertising anywhere in
the app. A child sees their household and nothing else. The adult who owns the house can remove a
child's access at any moment.

---

### Changes to this policy

If something here changes in a way that matters, we update the effective date at the top of this
page and tell you inside the app before the change takes effect.

---

### Contact

**MagicLab Solutions** (Hoffmann Tech LTDA) — [redacao@pauta.app](mailto:redacao@pauta.app)
