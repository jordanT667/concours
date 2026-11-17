# Entrance exam registration platform

An Angular web application for applying online to an engineering school entrance exam.
Candidates go through a guided, step-by-step application; administrators manage the exam sessions, schools, programmes and applications from a back office.

> This repository contains the **front end** only. It talks to a separate REST API under `/api/v1`.

## Features

**For candidates**
- Six-step application wizard (recommendation, identification, specialisation, academic background, contacts, summary), each step protected by a route guard so it cannot be skipped
- Autosave indicator while filling in the form
- Application tracking page and personal candidate space
- PDF generation of documents (`jsPDF`, `pdfmake`)

**For administrators**
- Dashboard with statistics (Chart.js)
- About thirty management sections: sessions, schools, programmes, exam centres, subjects, diplomas, regions, applications, candidates and more
- Announcements shown to candidates

**Cross-cutting**
- JWT authentication with automatic token refresh, XSRF protection, caching and error-handling HTTP interceptors
- Server-side rendering with Angular SSR and Express, `helmet` security headers
- Light and dark themes, skeleton loaders

## Tech stack

Angular 21 · TypeScript · Angular SSR / Express · Tailwind CSS · Chart.js · Vitest · GitHub Actions

## Getting started

Prerequisites: Node.js 20 or later.

```bash
npm ci
npm start            # development server on http://localhost:4200
```

The app expects the API under `/api/v1` (see `src/environments/` and `src/proxy.conf.json`).

```bash
npm test             # unit tests (Vitest)
npm run build        # production build in dist/
```

## Project structure

```
src/app/
├── auth/        authentication and HTTP interceptors
├── core/        guards, interceptors, models, services, resolvers
├── pages/       candidate pages: wizard, tracking, candidate space
├── admin/       back office sections
├── shared/      reusable components (charts, autosave indicator…)
└── layout/      sidebar, top bar
```

## Deployment

Every push to `main` builds the app and deploys it to a VPS served by Apache, through the workflow in `.github/workflows/deploy.yml`.
The workflow reads the server address and SSH key from the repository secrets `VPS_HOST`, `VPS_USERNAME` and `VPS_SSH_KEY`; none are stored in the code.
