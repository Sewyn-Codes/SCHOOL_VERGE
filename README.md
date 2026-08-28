# SCHOOL_VERGE
Premier academic support and tutoring web platform featuring interactive pricing, expert tutor consultations, multi-step order wizard, and US/UK localization.
# ScholarVerge (School Verge)

> **Your Path to Academic Excellence**  
> A premier academic support and tutoring platform crafted to help students achieve their academic milestones with confidence through personalized, reliable, and high-quality assistance.

---

## 🚀 Key Features

* **Expert Tutor Profiles:** Verified tutor credentials (e.g., Claire Bennett, Oliver Harrison, Sophia Mitchell) with subject specializations, bios, and direct consultation scheduling.
* **Interactive 6-Step Workflow:** End-to-end assignment workflow from prompt submission and tutor matching to secure escrow deposits, Turnitin/AI-free verifications, and revisions.
* **Dynamic Price Calculator:** Real-time pricing engine calculating costs based on academic level, deadline urgency (3h to 14+ days), page counts, and add-ons[cite: 1].
* **Multi-Step Order Wizard:** Interactive order flow featuring file uploads, rubric parameter inputs, tutor assignments, and escrow checkout[cite: 1].
* **Consultation Scheduler:** 10-minute session booking tool with calendar slot selection and automated Google Meet/Zoom calendar invites (`.ics`)[cite: 1].
* **Bilingual Localization (US/UK):** Instant toggle supporting English (US) and English (UK) vocabulary, spelling adjustments, currency formats, and citation conventions[cite: 1].
* **Interactive Utilities:** Live order tracker (#SV-84920, #SV-77219, #SV-99104) with direct tutor chat simulation, Turnitin originality inspector, review submission modal, and 24/7 floating support widget[cite: 1].

---

## 🛠️ Architecture & Tech Stack

* **Frontend:** Semantic HTML5, Vanilla JavaScript (ES6+), Modern Responsive CSS[cite: 1]
* **Design System:** Deep Oxford Navy palette, emerald accents, glassmorphism, fluid typography, and accessible ARIA attributes[cite: 1]
* **SEO & Metadata:** OpenGraph metadata, structured microdata (Schema.org Academic Service / Tutors)[cite: 1]
* **Client-side Storage & State:** Native dynamic stores for US/UK dictionary switching, dynamic pricing rules, and mock tracker data[cite: 1]

---

## 📁 Repository Structure

```text
├── index.html            # Main SPA interface & semantic structure[cite: 1]
├── styles/
│   └── main.css          # Design system, glassmorphic UI, layout & animations[cite: 1]
├── js/
│   ├── app.js            # UI controllers, modal handlers, calculator & order flows[cite: 1]
│   ├── tutors-data.js    # Data store for tutor profiles, reviews & order tracker[cite: 1]
│   └── i18n.js           # English (US) & English (UK) localization dictionary[cite: 1]
├── assets/               # SVG icons, tutor avatars, badge graphics & preview reports[cite: 1]
└── README.md             # Project documentation[cite: 1]
