/**
 * ScholarVerge - Verified Academic Tutors, Subjects, Reviews & Order Mock Data
 */

const tutorsData = [
  {
    id: 'claire-bennett',
    name: 'Claire Bennett',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    title: 'Senior Academic Tutor & Legal Scholar',
    degree: 'M.A. in English Literature & Comparative Law',
    experience: '6+ Years Experience',
    rating: 4.99,
    totalReviews: 1420,
    successRate: '99.8%',
    subjects: ['English', 'Information Technology', 'History', 'Law'],
    tagline: 'Precision, critical analysis, and scholarly elegance across humanities, law, and tech.',
    bio: `I’m an enthusiastic academic tutor for over 6 years specializing in English, information technology, history, and law. With a strong academic background and a Master’s degree, I provide personalized guidance designed to match each student’s academic level, subject, and individual requirements. I support students throughout the entire academic writing process, from developing a clear outline and identifying credible sources to constructing well-supported arguments and refining the final draft.`,
    stats: {
      papersCompleted: 1420,
      activeStudents: 28,
      turnitinClearScore: '100%',
      avgResponseTime: '12 mins'
    },
    specialties: [
      'Legal Memorandums & Case Briefs (IRAC / CREAC)',
      'IT Architecture & Technical Whitepapers',
      'Historical Historiography & Primary Source Analysis',
      'Literature Critiques & Scholarly Argumentation',
      'OSCOLA, Bluebook, APA 7th & MLA 9th Citation'
    ],
    sampleTopics: [
      'Constitutional Rights in the Digital Age: AI Surveillance & Privacy',
      'Comparative Jurisprudence in International Human Rights',
      'Modernist Narrative Techniques in 20th Century Anglophone Fiction',
      'Cloud Architecture Migration & Zero-Trust Cybersecurity Frameworks'
    ],
    verifiedReviews: [
      {
        student: 'Marcus L.',
        university: 'Columbia University',
        subject: 'Law & Technology',
        rating: 5,
        date: '2 days ago',
        comment: 'Claire delivered an exceptional 15-page legal analysis on intellectual property in generative algorithms. Every citation was flawlessly formatted in Bluebook and her arguments were razor sharp. Got an A!'
      },
      {
        student: 'Eleanor P.',
        university: 'King\'s College London',
        subject: 'History',
        rating: 5,
        date: '1 week ago',
        comment: 'Claire helped me structure my entire final year dissertation outline and source primary archival evidence. She explained everything clearly via our direct messaging chat.'
      }
    ]
  },
  {
    id: 'oliver-harrison',
    name: 'Oliver Harrison',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    title: 'Lead Quantitative & Economic Modeling Specialist',
    degree: 'M.Sc. in Quantitative Economics & Corporate Finance',
    experience: '5+ Years Experience',
    rating: 4.97,
    totalReviews: 1280,
    successRate: '99.6%',
    subjects: ['Business', 'Economics', 'Finance', 'Mathematics', 'Statistics'],
    tagline: 'Rigorous quantitative methodologies, financial modeling, and data-backed economic insights.',
    bio: `I’m an analytical academic tutor for over 5 years specializing in business, economics, finance, mathematics, and statistics. My academic support includes business analysis, economics, finance, quantitative methods, statistics, mathematical problem-solving, research projects, and data interpretation. My academic expertise encompasses developing well-structured outlines for essays and reports, preparing comprehensive drafts, and providing thorough editing, proofreading, and paraphrasing support.`,
    stats: {
      papersCompleted: 1280,
      activeStudents: 34,
      turnitinClearScore: '100%',
      avgResponseTime: '8 mins'
    },
    specialties: [
      'Econometric Regression & Time-Series Forecasting (R, SPSS, Stata, Python)',
      'DCF & Multi-Criteria Corporate Valuation Models',
      'Strategic Business Plan & Porter\'s Five Forces / PESTLE Analysis',
      'Mathematical Proofs & Applied Calculus',
      'Quantitative Data Interpretation & Statistical Synthesis'
    ],
    sampleTopics: [
      'Macroeconomic Impact of Interest Rate Hikes on Emerging Markets',
      'Empirical Analysis of ESG Scores on Asset Valuation in FTSE 100',
      'Predictive Machine Learning in High-Frequency Algorithmic Trading',
      'Supply Chain Optimization Using Linear Programming'
    ],
    verifiedReviews: [
      {
        student: 'David K.',
        university: 'London School of Economics',
        subject: 'Finance & Econometrics',
        rating: 5,
        date: '3 days ago',
        comment: 'Oliver is a math and econometrics genius. He not only ran the SPSS regressions and interpreted the p-values for my Master\'s thesis, but explained the methodology so well that I aced my defense!'
      },
      {
        student: 'Jessica T.',
        university: 'NYU Stern',
        subject: 'Corporate Finance',
        rating: 5,
        date: '5 days ago',
        comment: 'The financial modeling and DCF calculations were clean, thoroughly commented, and accompanied by a crystal-clear executive summary report. Will hire again!'
      }
    ]
  },
  {
    id: 'sophia-mitchell',
    name: 'Sophia Mitchell',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
    title: 'Senior Clinical Nursing & Health Sciences Academic Specialist',
    degree: 'M.S.N. in Clinical Nursing & M.S. in Health Psychology',
    experience: '6+ Years Experience',
    rating: 4.99,
    totalReviews: 1650,
    successRate: '99.9%',
    subjects: ['Nursing', 'Healthcare', 'Psychology'],
    tagline: 'Evidence-based clinical rigor, holistic healthcare inquiry, and psychological research depth.',
    bio: `I’m a masters degree holder and a dedicated academic tutor with a strong focus on nursing, healthcare, and psychology. My areas of support include nursing theory, healthcare concepts, psychology, research methods, case-study analysis, evidence-based practice, and academic writing. 
I particularly enjoy working with students on research projects, literature reviews, case studies, discussion assignments, and examination preparation. My approach combines careful research, clear explanations, and attention to academic requirements.`,
    stats: {
      papersCompleted: 1650,
      activeStudents: 41,
      turnitinClearScore: '100%',
      avgResponseTime: 'Instant / <15m'
    },
    specialties: [
      'Evidence-Based Practice (EBP) & PICOT Question Synthesis',
      'Nursing Care Plans (NANDA-I, NIC & NOC Interventions)',
      'Systematic Literature Reviews & PRISMA Protocols',
      'Qualitative & Quantitative Psychological Research Methods',
      'APA 7th Clinical Formatting & Peer-Reviewed Journal Sourcing'
    ],
    sampleTopics: [
      'Impact of Nurse-Patient Ratios on Post-Operative Mortality: An EBP Review',
      'Cognitive Behavioral Therapy vs Pharmacotherapy in Adolescent Depression',
      'Implementing Telehealth in Rural Palliative Care: Barriers and Outcomes',
      'Ethical Considerations in Geriatric End-of-Life Decision Making'
    ],
    verifiedReviews: [
      {
        student: 'Brittany R.',
        university: 'Johns Hopkins School of Nursing',
        subject: 'Evidence-Based Practice',
        rating: 5,
        date: 'Yesterday',
        comment: 'Sophia is the absolute best! My PICOT synthesis paper scored 98%. Her clinical terminology, peer-reviewed nursing citations (all 2023-2025 PubMed sources), and care plan table were breathtaking.'
      },
      {
        student: 'Ashley M.',
        university: 'University of Edinburgh',
        subject: 'Clinical Psychology',
        rating: 5,
        date: '4 days ago',
        comment: 'Sophia helped me navigate complex neurobiological research on trauma. The paper was completely original, insightful, and beautifully organized.'
      }
    ]
  }
];

const serviceCategories = [
  {
    category: 'Essay & Academic Writing',
    icon: 'fa-book-open',
    description: 'Custom scholarly essays, literature reviews, argumentative papers, and synthesis reports written from scratch.',
    items: ['Argumentative & Persuasive Essays', 'Narrative & Descriptive Writing', 'Comparative Literature Essays', 'Admissions & Personal Statements']
  },
  {
    category: 'Research Papers & Dissertations',
    icon: 'fa-graduation-cap',
    description: 'In-depth research projects, capstone thesis chapters, PRISMA reviews, and methodology development.',
    items: ['Master’s & Ph.D. Dissertations', 'Research Proposals & Outlines', 'Literature Reviews (PRISMA)', 'Discussion & Findings Chapters']
  },
  {
    category: 'Nursing, Healthcare & Medicine',
    icon: 'fa-heart-pulse',
    description: 'Clinical case studies, EBP synthesis, PICOT question framing, and comprehensive NANDA care plans.',
    items: ['Evidence-Based Practice (EBP)', 'PICOT Papers & Clinical Reviews', 'NANDA Nursing Care Plans', 'Psychology Case Studies']
  },
  {
    category: 'Business, Finance & Economics',
    icon: 'fa-chart-line',
    description: 'Empirical market research, strategic corporate analysis, financial DCF modeling, and economic forecasts.',
    items: ['SWOT, PESTLE & Porter’s 5 Forces', 'Financial Modeling & Valuation', 'Econometric Data Analysis (SPSS/R)', 'Business Feasibility Reports']
  },
  {
    category: 'Law, Humanities & Social Sciences',
    icon: 'fa-scale-balanced',
    description: 'Legal briefs (IRAC), historiographical analysis, policy evaluations, and philosophical inquiry.',
    items: ['Legal Case Briefs & Memorandums', 'Historiographical Analysis', 'Sociological & Political Theory', 'Ethics & Philosophy Papers']
  },
  {
    category: 'Editing, Proofreading & Paraphrasing',
    icon: 'fa-spell-check',
    description: 'Comprehensive line-by-line editorial refinement, Turnitin similarity mitigation, and citation auditing.',
    items: ['Plagiarism Scan & Paraphrasing', 'APA 7, MLA 9, Chicago, Harvard Formatting', 'Grammar, Style & Tone Polishing', 'Human Originality Optimization']
  }
];

const allReviewsData = [
  {
    id: 1,
    studentName: 'Marcus L.',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
    university: 'Columbia University',
    subject: 'Law & Tech',
    tutor: 'Claire Bennett',
    rating: 5,
    date: '2 days ago',
    badge: 'Verified Order #SV-99104',
    title: 'Masterpiece Legal Brief - Scored an A',
    text: 'Claire Bennett exceeded all my expectations. My professor praised the nuanced constitutional argumentation and flawless Bluebook citation style. Plus, the Turnitin report showed 0% similarity and 0% AI!'
  },
  {
    id: 2,
    studentName: 'Brittany R.',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    university: 'Johns Hopkins Nursing',
    subject: 'Nursing & Healthcare',
    tutor: 'Sophia Mitchell',
    rating: 5,
    date: 'Yesterday',
    badge: 'Verified Order #SV-84920',
    title: 'Top Score in Evidence-Based Practice',
    text: 'Sophia is a true healthcare scholar. The PICOT formulation and synthesis of 25 recent peer-reviewed randomized controlled trials was stunning. She also answered my questions in chat within 5 minutes.'
  },
  {
    id: 3,
    studentName: 'David K.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    university: 'London School of Economics',
    subject: 'Economics & Finance',
    tutor: 'Oliver Harrison',
    rating: 5,
    date: '3 days ago',
    badge: 'Verified Order #SV-77219',
    title: 'SPSS Regressions and Econometrics Done Flawlessly',
    text: 'I was drowning in econometric modeling and Stata code. Oliver stepped in, generated the regression tables, provided an intuitive interpretation of the p-values, and saved my semester grade.'
  },
  {
    id: 4,
    studentName: 'Hannah G.',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80',
    university: 'University of Toronto',
    subject: 'English & IT',
    tutor: 'Claire Bennett',
    rating: 5,
    date: '5 days ago',
    badge: 'Verified Order #SV-66120',
    title: 'Urgent 12-Hour Turnaround Saved Me',
    text: 'My deadline was closing in fast and I panicked. Claire picked up the assignment, produced a 7-page comparative analysis with credible scholarly citations, and delivered it 3 hours ahead of time!'
  },
  {
    id: 5,
    studentName: 'Liam S.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    university: 'University of Sydney',
    subject: 'Business Strategy',
    tutor: 'Oliver Harrison',
    rating: 5,
    date: '1 week ago',
    badge: 'Verified Order #SV-55198',
    title: 'Incredible Depth and Flawless Formatting',
    text: 'The financial valuation and corporate analysis on renewable energy investments was boardroom quality. Oliver is communicative, patient, and extremely skilled.'
  },
  {
    id: 6,
    studentName: 'Chloe D.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    university: 'King\'s College London',
    subject: 'Psychology',
    tutor: 'Sophia Mitchell',
    rating: 5,
    date: '1 week ago',
    badge: 'Verified Order #SV-44012',
    title: 'Empathetic and Insightful Academic Guidance',
    text: 'Sophia quickly outlined the experimental design for my cognitive psychology review via direct chat. Sourcing was thorough and the finished draft was pristine.'
  }
];

const mockOrders = {
  'SV-84920': {
    orderId: 'SV-84920',
    topic: 'Implementation of Telehealth in Rural Geriatric Care: PICOT Synthesis',
    tutor: 'Sophia Mitchell',
    tutorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    subject: 'Nursing & Healthcare',
    level: 'Master’s Level',
    pages: '8 Pages (2,200 Words)',
    format: 'APA 7th Edition',
    deadline: 'Aug 29, 2026 (Delivered Early)',
    status: 'Completed & Ready for Download',
    progress: 100,
    steps: [
      { name: 'Assignment Details Submitted', done: true, time: 'Aug 26, 10:14 AM' },
      { name: 'Tutor Sophia Mitchell Assigned', done: true, time: 'Aug 26, 10:25 AM' },
      { name: 'Payment Coordinated via WhatsApp Admin', done: true, time: 'Aug 26, 10:26 AM' },
      { name: 'Literature Review & Outline Approved', done: true, time: 'Aug 27, 02:40 PM' },
      { name: 'Drafting & APA 7th Citations Complete', done: true, time: 'Aug 28, 08:15 AM' },
      { name: 'Turnitin Similarity (0.4%) & AI (0%) Cleared', done: true, time: 'Aug 28, 09:30 AM' },
      { name: 'Ready for Review & Payment Release', done: true, time: 'Aug 28, 10:00 AM' }
    ],
    chatHistory: [
      { sender: 'Sophia Mitchell', time: 'Aug 26, 10:30 AM', text: 'Hello! I have reviewed your PICOT criteria on rural geriatric telehealth. I have already retrieved 18 peer-reviewed clinical studies from PubMed (2022–2025). Do you have a preferred hospital protocol to reference?' },
      { sender: 'You', time: 'Aug 26, 10:45 AM', text: 'Hi Sophia! The standard VA Telehealth Guidelines work best. Thank you for the quick start!' },
      { sender: 'Sophia Mitchell', time: 'Aug 28, 09:35 AM', text: 'Good morning! Your complete paper, reference matrix, and the official Turnitin originality report are ready for your review. Let me know if you need any adjustments!' }
    ],
    files: [
      { name: 'Telehealth_Geriatric_Care_Final_Draft.docx', size: '1.4 MB', type: 'Word Document' },
      { name: 'Turnitin_Official_Originality_Report.pdf', size: '480 KB', type: 'Similarity 0.4% | AI 0%' },
      { name: 'PubMed_Annotated_Bibliography_25_Sources.pdf', size: '620 KB', type: 'Reference Matrix' }
    ]
  },
  'SV-77219': {
    orderId: 'SV-77219',
    topic: 'Econometric Regression Analysis on FTSE 100 ESG Metrics',
    tutor: 'Oliver Harrison',
    tutorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    subject: 'Finance & Econometrics',
    level: 'Undergraduate Senior',
    pages: '10 Pages + R Markdown Code',
    format: 'Harvard Style',
    deadline: 'Aug 30, 2026',
    status: 'Final Quality & Similarity Check',
    progress: 85,
    steps: [
      { name: 'Assignment Details Submitted', done: true, time: 'Aug 27, 01:10 PM' },
      { name: 'Tutor Oliver Harrison Assigned', done: true, time: 'Aug 27, 01:20 PM' },
      { name: 'Payment Coordinated via WhatsApp Admin', done: true, time: 'Aug 27, 01:21 PM' },
      { name: 'Data Cleaning & Model Selection (R Script)', done: true, time: 'Aug 27, 06:00 PM' },
      { name: 'Drafting Empirical Findings & P-Value Synthesis', done: true, time: 'Aug 28, 07:45 AM' },
      { name: 'Turnitin Similarity & Code Commenting', done: false, time: 'In Progress (ETA 2 hrs)' },
      { name: 'Final Release', done: false, time: 'Pending' }
    ],
    chatHistory: [
      { sender: 'Oliver Harrison', time: 'Aug 27, 01:30 PM', text: 'Hi! I’ve imported your CSV dataset into R and ran collinearity diagnostics. We have clean heteroskedasticity-robust standard errors.' },
      { sender: 'You', time: 'Aug 27, 02:00 PM', text: 'Awesome Oliver, please make sure the p-value interpretation table is clear for my professor.' },
      { sender: 'Oliver Harrison', time: 'Aug 28, 07:50 AM', text: 'Done! I created dedicated publication-ready ggplot2 charts and an executive summary table.' }
    ],
    files: [
      { name: 'FTSE100_ESG_Econometrics_Interim_Draft.docx', size: '2.1 MB', type: 'Draft Report' },
      { name: 'ESG_Regression_Scripts.R', size: '42 KB', type: 'R Code' }
    ]
  },
  'SV-99104': {
    orderId: 'SV-99104',
    topic: 'Comparative Constitutional Analysis of Algorithmic Privacy Rights',
    tutor: 'Claire Bennett',
    tutorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    subject: 'Law & Technology',
    level: 'Doctoral / LL.M.',
    pages: '12 Pages (3,300 Words)',
    format: 'Bluebook / OSCOLA',
    deadline: 'Aug 28, 2026',
    status: 'Completed & Ready for Download',
    progress: 100,
    steps: [
      { name: 'Assignment Details Submitted', done: true, time: 'Aug 25, 09:00 AM' },
      { name: 'Tutor Claire Bennett Assigned', done: true, time: 'Aug 25, 09:15 AM' },
      { name: 'Payment Coordinated via WhatsApp Admin', done: true, time: 'Aug 25, 09:16 AM' },
      { name: 'Jurisprudential Research & Outline', done: true, time: 'Aug 26, 11:30 AM' },
      { name: 'Full Draft Written (IRAC Methodology)', done: true, time: 'Aug 27, 04:00 PM' },
      { name: 'Turnitin & AI-Free Verification (0% AI)', done: true, time: 'Aug 28, 06:20 AM' },
      { name: 'Ready for Review & Payment Release', done: true, time: 'Aug 28, 07:00 AM' }
    ],
    chatHistory: [
      { sender: 'Claire Bennett', time: 'Aug 25, 09:30 AM', text: 'Hello! I am diving into the CJEU vs SCOTUS precedents on automated data profiling. Looking forward to drafting this landmark brief.' },
      { sender: 'You', time: 'Aug 25, 10:15 AM', text: 'Thank you Claire! Please emphasize GDPR Article 22 compliance.' },
      { sender: 'Claire Bennett', time: 'Aug 28, 06:30 AM', text: 'All finished! The arguments on automated decision-making and human oversight are fully backed by landmark European Court case law.' }
    ],
    files: [
      { name: 'Algorithmic_Privacy_Constitutional_Analysis.docx', size: '1.8 MB', type: 'Word Document' },
      { name: 'Originality_Certificate_Turnitin.pdf', size: '510 KB', type: 'Similarity 0.0% | AI 0%' }
    ]
  }
};
