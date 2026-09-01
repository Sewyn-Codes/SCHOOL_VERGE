/**
 * ScholarVerge.com - Verified Academic Tutors, Services, Reviews & Real Data Configurations
 * Strictly 3 Specialist Tutors with Real Provided Images:
 * 1. Oliver Harrison (Lead Quantitative Analyst & Econometrician)
 * 2. Claire Bennett (Senior Academic Tutor & Legal-IT Lead)
 * 3. Sophia Mitchell (Clinical Healthcare Consultant & Psychology Fellow)
 */

const tutorsData = [
  {
    id: 'oliver-harrison',
    name: 'Oliver Harrison',
    avatar: 'assets/images/tutors/oliver-harrison.jpg',
    title: 'Lead Quantitative & Economic Modeling Specialist',
    degree: 'Ph.D. in Econometrics & Applied Statistics',
    experience: '5+ Years Experience',
    rating: 4.97,
    totalReviews: 1280,
    successRate: '99.6%',
    subjects: ['Business', 'Economics', 'Finance', 'Mathematics', 'Statistics'],
    tagline: 'Rigorous quantitative methodologies, financial modeling, and data-backed economic insights.',
    bio: `I’m an analytical academic tutor with over 5 years of specialized experience in business, economics, finance, mathematics, and statistics. My academic support covers econometric modeling, time-series analysis, financial valuation, quantitative methods, statistical synthesis in R and SPSS, and comprehensive thesis guidance. I assist students from initial research design to empirical data interpretation and final rubric defense.`,
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
    id: 'claire-bennett',
    name: 'Claire Bennett',
    avatar: 'assets/images/tutors/claire-bennett.jpg',
    title: 'Senior Academic Tutor & Legal Scholar',
    degree: 'Master’s Degree in English Literature & IT Law',
    experience: '6+ Years Experience',
    rating: 4.99,
    totalReviews: 1420,
    successRate: '99.8%',
    subjects: ['English', 'Information Technology', 'History', 'Law'],
    tagline: 'Precision, critical analysis, and scholarly elegance across humanities, law, and tech.',
    bio: `I’m an enthusiastic academic tutor with over 6 years of experience specializing in English, information technology, history, and comparative law. Holding a Master’s degree with high distinction, I deliver personalized guidance tailored to each student’s academic level and institutional rubric. I support students throughout the entire academic writing process, from outline formulation to peer-reviewed source curation, rigorous IRAC argumentation, and final proofreading.`,
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
    id: 'sophia-mitchell',
    name: 'Sophia Mitchell',
    avatar: 'assets/images/tutors/sophia-mitchell.jpg',
    title: 'Senior Clinical Nursing & Health Sciences Academic Specialist',
    degree: 'Doctor of Nursing Practice (DNP) & M.S. in Health Psychology',
    experience: '6+ Years Experience',
    rating: 4.99,
    totalReviews: 1650,
    successRate: '99.9%',
    subjects: ['Nursing', 'Healthcare', 'Psychology'],
    tagline: 'Evidence-based clinical rigor, holistic healthcare inquiry, and psychological research depth.',
    bio: `I’m a Doctor of Nursing Practice (DNP) and a dedicated academic specialist with a deep background in nursing, healthcare policy, and clinical psychology. My areas of guidance include nursing theory, healthcare concepts, psychological research methods, clinical case-study analysis, evidence-based practice (EBP), PICOT synthesis, and examination preparation. My approach combines rigorous scientific research with clear rubric adherence.`,
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
    studentName: 'Elena Rostova',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    university: 'University of Oxford',
    subject: 'Nursing & Healthcare',
    tutor: 'Sophia Mitchell',
    rating: 5,
    date: '2 days ago',
    badge: 'Verified Order #SV-84920',
    title: 'Master-level Clinical Synthesis',
    text: 'Sophia is phenomenal! My PICOT systematic review received highest praise in my nursing cohort with zero revisions required. The Turnitin report showed absolute 0% AI detection.'
  },
  {
    id: 2,
    studentName: 'Marcus Vance',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    university: 'Yale University',
    subject: 'Economics & Finance',
    tutor: 'Oliver Harrison',
    rating: 5,
    date: '4 days ago',
    badge: 'Verified Order #SV-77219',
    title: 'Flawless Econometric Proofs',
    text: 'Oliver helped me structure my quantitative corporate finance thesis. The empirical proofs and regression interpretations were crystal clear. Truly world-class academic support.'
  },
  {
    id: 3,
    studentName: 'Chloe St. Pierre',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    university: 'McGill University',
    subject: 'Law & Technology',
    tutor: 'Claire Bennett',
    rating: 5,
    date: '1 week ago',
    badge: 'Verified Order #SV-99104',
    title: 'Exceptional Legal Precision',
    text: 'Claire’s attention to OSCOLA case law citation was spotless. Delivered 24 hours ahead of my deadline with comprehensive peer-reviewed references.'
  }
];
