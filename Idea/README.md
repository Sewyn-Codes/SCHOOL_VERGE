# ScholarVerge.com - Academic Tutoring & Research Excellence

ScholarVerge.com is a premier, modern multi-tenant academic tutoring and research consultation platform built to connect students with verified human Master's and Ph.D. tutors.

---

## 🌟 Core Features & Architecture

### 1. **Multi-Tenant Student & Super Admin Architecture**
- **Student Registration & Explicit Login**: When a user registers an account, the system validates the profile, persists it to the PostgreSQL/SQLite database, confirms account creation, and directs the student to sign in.
- **Admin Dashboard Notifications**: When a new user registers or submits an assignment, the Super Admin command center immediately records and highlights an operational alert (`New Student Joined`, `Order Created`), increments the student roster, and updates real-time analytics.
- **Dedicated Student Accounts**: Email + Password authentication (salted SHA-256), Google OAuth simulation, and scoped data tenancy.
- **Super Admin Command Center**: Student roster management, order workflow dispatcher, live operational notifications, invitation link generator, and database synchronization.
- **Master Admin Credentials Demo**: Quick-fill helper for instant demonstration access (`scholarverge@gmail.com` / `Lovato20`).

### 2. **Verified Academic Specialist Tutors**
1. **Dr. Sophia Mitchell** *(Female - Displayed 1st & in Social Sharing)*:
   - Doctor of Nursing Practice (DNP) & M.S. in Health Psychology.
   - Specialties: Clinical Healthcare, Evidence-Based Practice (EBP), PICOT synthesis, and Nursing Care Plans.
2. **Dr. Oliver Harrison** *(Male - In the Middle)*:
   - Ph.D. in Econometrics & Applied Statistics.
   - Specialties: Econometric modeling, quantitative regression (R, SPSS, Python), financial valuation (DCF), and statistical synthesis.
3. **Prof. Claire Bennett** *(Female - 3rd)*:
   - Master’s Degree in English Literature & IT Law.
   - Specialties: Legal briefs (IRAC / CREAC), IT whitepapers, comparative law, and literature critiques.

### 3. **Order Wizard & Payment Inquiry Logic**
- **5-Step Interactive Wizard**:
  1. *Student Details & Assignment Scope*: Captures name, email, WhatsApp contact number, topic, pages, and target deadline.
  2. *Materials & Instructions*: Drag-and-drop file upload for rubrics, readings, and briefs, with auto-generated brief fallback for typed instructions.
  3. *Specialist Tutor Matching*: Choice between Sophia Mitchell, Oliver Harrison, Claire Bennett, or auto-match.
  4. *Review & Scoping*: Full summary preview with free Turnitin originality certification.
  5. *Order Confirmation & Tracking*: Instant tracking reference badge (`#SV-xxxxx`), 1-click email client dispatch to billing desk, direct WhatsApp inquiry link, and live tracking jump.
- **Universal Back & Cancel Buttons**: Every step and modal features intuitive, high-visibility Back and Cancel buttons, plus global Escape key dismissal.

### 4. **Live Real-Time Assignment Tracker**
- Search and monitor assignments by order reference ID (e.g. `SV-84920`).
- Real-time progress bar, milestone stages, Turnitin AI detection score, and simulated tutor communication drawer.

---

## 🐳 Containerization & Deployment

ScholarVerge is containerized using Docker and Docker Compose for production deployment.

### Quick Start with Docker Compose:
```bash
docker compose up --build
```
The application will be accessible at `http://localhost:8000`.

### Building and Running Docker Image Manually:
```bash
docker build -t scholarverge:latest .
docker run -p 8000:8000 -v $(pwd)/database:/app/database -v $(pwd)/uploads:/app/uploads scholarverge:latest
```

### Running Locally without Docker:
```bash
python server.py
```
Then open `http://localhost:8000` in your web browser.

---

## 🧪 Testing & Validation

The codebase includes an automated test suite verifying health, authentication, orders, tracking, and tutor integrity:

```bash
# Run backend integration tests
python -m unittest tests/test_server.py

# Validate client-side JavaScript syntax
node -c js/app.js
node -c js/i18n.js
node -c js/tutors-data.js
```

---

## 📁 Repository Structure

```
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md       # Standardized bug reporting template
│   │   └── feature_request.md  # Structured feature proposals
│   ├── workflows/
│   │   ├── ci.yml              # Automated linting, unittest suite & Docker build
│   │   └── keep-alive.yml      # Heartbeat monitoring workflow
│   ├── PULL_REQUEST_TEMPLATE.md# Production PR checklist and guidelines
│   └── dependabot.yml          # Automated dependency updates for pip & docker
├── assets/                     # Tutor portraits, student avatars, system icons
├── database/                   # SQLite database (scholarverge.db) and schema.sql
├── js/
│   ├── app.js                  # Core frontend SPA application engine & modals
│   ├── i18n.js                 # Multi-language translation engine
│   └── tutors-data.js          # Verified specialist tutor profiles & reviews
├── styles/
│   └── main.css                # Responsive UI design system & modal styling
├── tests/
│   └── test_server.py          # Comprehensive Python integration test suite
├── uploads/                    # Uploaded student briefs and rubric documents
├── .dockerignore               # Docker build exclusions
├── .gitignore                  # Git repository exclusions
├── Dockerfile                  # Production container definition with healthcheck
├── docker-compose.yml          # Container orchestration with volume mounts
├── index.html                  # Single-page application & accessible modals
├── Procfile                    # Cloud platform deployment declaration
├── README.md                   # Complete architectural & operational guide
├── requirements.txt            # Python dependencies
└── server.py                   # Multi-tenant Python server & REST API
```
