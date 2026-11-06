# Rogo Academy (Pilot): Venture & Growth Equity Track

A static website for Rogo Academy. There is no build step, no framework and no dependencies: plain HTML, CSS and JavaScript that Vercel serves as-is.

## What's inside

```
index.html                         Academy home: thesis, two parts, tracks, principles
vc/index.html                      Venture & Growth Equity track overview + case fact base
vc/ai-assisted-work.html           Part 1: AI-assisted work (standard, slop drill, 6 workflows, QC prompts, checklist)
vc/fundamentals/sourcing.html            Module 1
vc/fundamentals/startup-financials.html  Module 2
vc/fundamentals/unit-economics.html      Module 3
vc/fundamentals/vc-math.html             Module 4
vc/fundamentals/valuation.html           Module 5
vc/fundamentals/cap-tables-terms.html    Module 6
vc/fundamentals/diligence-memo.html      Module 7
vc/fundamentals/fund-economics.html      Module 8
vc/graded-cases.html               All 9 Felix tutor prompts in one place
core/three-statement-lab.html      Shared core lab (all tracks)
assets/styles.css                  Design system (Rogo palette)
assets/app.js                      Progress, quizzes, copy buttons, tabs, drills
assets/labs.js                     Calculator math (pure functions on window.RALabs)
assets/rogo-wordmark-*.png         Approved Rogo wordmark
vercel.json, robots.txt            Clean URLs; noindex headers
```

## Deploy (about 5 minutes)

1. **Create a GitHub repo.** On github.com, click New repository, name it `rogo-academy`, keep it **Private**, and click Create.
2. **Upload the files.** On the new repo page, click "uploading an existing file", drag in **everything inside this folder** (not the folder itself), and click Commit changes.
   - From the command line instead: `git init && git add . && git commit -m "Rogo Academy pilot" && git branch -M main && git remote add origin https://github.com/<you>/rogo-academy.git && git push -u origin main`
3. **Import it to Vercel.** On vercel.com, go to Add New → Project → Import your `rogo-academy` repo. Framework preset: **Other**. Leave the build command and output directory empty. Click Deploy.
4. You get a URL like `rogo-academy-xxxx.vercel.app`. Every push to `main` redeploys automatically.

## Access control: read this before sharing

A Vercel production URL is **public** to anyone who has the link. The site sends noindex headers so search engines skip it, but that is not access control. Before you send it to a client:
- Turn on **Settings → Deployment Protection** in Vercel. Vercel Authentication protects preview URLs on all plans; password protection for production is a paid add-on. Or
- Share it only as a preview deployment with protection on, or
- Confirm with Rogo security and legal which hosting is approved for client-facing material. A personal Vercel account may not be.

The site contains no client names, no usage data and no answer keys. Graded-case answers are produced live by Felix and never stored on the site.

## Edit content

- Every page is plain HTML. Edit text directly in GitHub (pencil icon) and commit; Vercel redeploys within about 30 seconds.
- **Quiz:** each question is a `<div class="q" data-correct="N">` block. `N` is the zero-based index of the correct `<button class="opt">`.
- **Labs:** inputs use `data-k`, outputs use `data-o`. The math lives in `assets/labs.js`.
- **Progress** is stored in the learner's browser (`localStorage` key `rogoAcademy.v1`). Nothing is sent anywhere.

## Add a new ICP track (for example Investment Banking)

1. Copy the `vc/` folder to `ib/`.
2. Replace the case company, module content, workflows and tutor prompts. Keep the module shape: Objectives → Teach → Worked example → Lab → Practice check → AI watch-outs → Graded case.
3. Update the `MODULES` list in `assets/app.js` if you want progress tracked separately per track.
4. Turn the track card on the home page from "In development" into a link.

## Content rules (keep these when editing)

- Frame the gap as a training-model problem, never as AI or Rogo eroding skills.
- No client or bank names on any page. All cases are fictional.
- Never publish answer keys or solution maps. Grading happens in Felix.
- Learner-private: no manager view of individuals unless explicitly approved.
- American English. Benchmarks are labeled as heuristics, not facts.
