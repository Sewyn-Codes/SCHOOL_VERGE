/**
 * ScholarVerge - Internationalization & Localization Engine
 * Supports seamless switching between English (US) and English (UK)
 */

const translations = {
  'en-US': {
    tagline: 'Your Path to Academic Excellence',
    heroSubtitle: 'We are a team of experienced academic tutors committed to helping students achieve their academic goals through personalized, reliable, and high-quality academic support.',
    heroBreakthrough: 'Your Next Academic Breakthrough Starts Here.',
    deadlineUrgency: 'Deadline Getting Close? We\'ve Got You.',
    writeMyPaper: 'Write My Paper',
    writePaperHuman: 'Write My Paper with Human Experts',
    meetTutors: 'Meet Our Tutors',
    ourServices: 'Our Services',
    howItWorks: 'How It Works',
    howItWorksTitle: 'A Step-by-Step Guide on How It Works',
    humanWritingGuarantee: 'Human Writing Service at Its Best',
    leaveReview: 'Leave Us a Review',
    contactSupport: 'Contact Support',
    chatWhatsApp: 'Chat on WhatsApp',
    whatsappSupport: 'WhatsApp: +1 (667) 775-7597',
    emailSupport: 'scholarverge@gmail.com',
    orderDepositBadge: 'Pay Only When Your Requirements Are Met',
    step1Title: 'Provide the assignment details',
    step1Desc: 'Upload your instructions, grading rubric, required sources, and citation format (APA 7, MLA 9, Chicago, etc.).',
    step2Title: 'Select your preferred tutor',
    step2Desc: 'Choose Claire Bennett, Oliver Harrison, Sophia Mitchell, or match with an expert tailored to your field.',
    step3Title: 'Make a deposit',
    step3Desc: 'Reserve your order safely with our 100% secure escrow hold. Your money is held protected until you approve.',
    step4Title: 'Receive your completed assignment',
    step4Desc: 'Collaborate 1-on-1 with your tutor, request early progress drafts, and receive your final draft before deadline.',
    step5Title: 'Download your work together with the reports',
    step5Desc: 'Get your completed paper alongside a verified Turnitin Plagiarism & AI-free Authenticity Report.',
    step6Title: 'Pay only when your requirements are met',
    step6Desc: 'Inspect the document, request free unlimited adjustments within 14 days, and release funds when 100% satisfied.',
    currencySymbol: '$',
    perPage: 'per page'
  },
  'en-GB': {
    tagline: 'Your Path to Academic Excellence',
    heroSubtitle: 'We are a team of experienced academic tutors committed to helping students achieve their academic goals through personalised, reliable, and high-quality academic support.',
    heroBreakthrough: 'Your Next Academic Breakthrough Starts Here.',
    deadlineUrgency: 'Deadline Getting Close? We\'ve Got You.',
    writeMyPaper: 'Write My Paper',
    writePaperHuman: 'Write My Paper with Human Experts',
    meetTutors: 'Meet Our Tutors',
    ourServices: 'Our Services',
    howItWorks: 'How It Works',
    howItWorksTitle: 'A Step-by-Step Guide on How It Works',
    humanWritingGuarantee: 'Human Writing Service at Its Best',
    leaveReview: 'Leave Us a Review',
    contactSupport: 'Contact Support',
    chatWhatsApp: 'Chat on WhatsApp',
    whatsappSupport: 'WhatsApp: +1 (667) 775-7597',
    emailSupport: 'scholarverge@gmail.com',
    orderDepositBadge: 'Pay Only When Your Requirements Are Met',
    step1Title: 'Provide the assignment details',
    step1Desc: 'Upload your brief, assessment criteria, required literature, and citation style (Harvard, OSCOLA, Chicago, etc.).',
    step2Title: 'Select your preferred tutor',
    step2Desc: 'Choose Claire Bennett, Oliver Harrison, Sophia Mitchell, or match with an expert tailored to your discipline.',
    step3Title: 'Make a deposit',
    step3Desc: 'Reserve your order safely with our 100% secure escrow hold. Your funds remain protected until you authorise release.',
    step4Title: 'Receive your completed assignment',
    step4Desc: 'Collaborate 1-on-1 with your tutor, review interim drafts, and receive your completed work well ahead of deadline.',
    step5Title: 'Download your work together with the reports',
    step5Desc: 'Download your completed work alongside an authenticated Turnitin Similarity & AI-free Originality Report.',
    step6Title: 'Pay only when your requirements are met',
    step6Desc: 'Review your submission, request free unlimited revisions within 14 days, and release payment when completely satisfied.',
    currencySymbol: '£',
    perPage: 'per page'
  }
};

let currentLang = 'en-US';

function setLanguage(lang) {
  if (!translations[lang]) return;
  currentLang = lang;
  document.documentElement.lang = lang === 'en-GB' ? 'en-GB' : 'en-US';
  
  // Update all elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  // Update language selector UI
  document.querySelectorAll('.lang-btn').forEach(btn => {
    if (btn.dataset.lang === lang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update dynamic calculations & tutor profiles
  if (typeof updatePricingDisplay === 'function') {
    updatePricingDisplay();
  }
}
