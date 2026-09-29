# ScholarVerge.com - Academic Tutoring & Research Excellence

ScholarVerge.com is a premier, modern multi-tenant academic tutoring and research consultation platform built to connect students with verified human Master's and Ph.D. tutors.

---

## 🌟 Core Features & Architecture

### 1. **Multi-Tenant Student & Super Admin Architecture**
- **Student Registration & Explicit Login**: When a user registers an account, the system indicates that the account was created successfully, and requires the user to log in with their credentials to access the academic dashboard.
- **Admin Dashboard Notifications**: When a new user registers, the Super Admin command center immediately records and highlights an operational alert (`New Student Joined`), increments the student roster, and updates real-time analytics.
- **Dedicated Student Accounts**: Email + Password authentication (salted SHA-256), Google OAuth simulation, and scoped data tenancy.
- **Account Recovery**: 6-digit OTP verification code dispatched via simulated email notification drawer.
- **Super Admin Command Center**: Student roster management, order workflow dispatcher, live operational notifications, and database synchronization.

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

### 3. **Paper Submission & Pricing Flow**
- **Zero Dollar Amounts in Paper Flow**: All assignment pricing and scoping is inquiry-driven and coordinated through official admin communication, ensuring academic integrity and customized scoping.
- **Restored Assignment Types**: Essays, Research papers, powerpoint, Dissertations, Discussion post, and Others.

---

## 🐳 Containerization & Deployment

ScholarVerge is containerized using Docker and Docker Compose for production deployment.

### Quick Start with Docker Compose:
```bash
docker compose up --build
```
The application will be accessible at `http://localhost:8000`.

### Building and Running Docker Image:
```bash
docker build -t scholarverge:latest .
docker run -p 8000:8000 -v $(pwd)/database:/app/database scholarverge:latest
```

### Running Locally without Docker:
```bash
python server.py
```
Then open `http://localhost:8000` in your web browser.

---

## 📁 Repository Structure

```
├── .github/
│   └── workflows/
│       ├── ci.yml            # Automated CI syntax compilation & Docker build
│       └── keep-alive.yml    # Heartbeat monitoring workflow
├── assets/                   # Tutor images, student portraits, icons
├── database/                 # SQLite database and schema.sql
├── js/
│   ├── app.js                # Core frontend application logic & API client
│   └── tutors-data.js        # Tutor data & verified student reviews
├── styles/
│   └── main.css              # Responsive styling and design system
├── uploads/                  # Uploaded student briefs and rubric documents
├── .dockerignore             # Docker build ignores
├── .gitignore                # Git repository ignores
├── Dockerfile                # Multi-stage production container definition
├── docker-compose.yml        # Multi-container orchestration config
├── index.html                # Main single-page application & modals
├── Procfile                  # Cloud platform process declaration
├── README.md                 # Project documentation
├── requirements.txt          # Python dependencies
└── server.py                 # Multi-tenant Python server & REST API
```
