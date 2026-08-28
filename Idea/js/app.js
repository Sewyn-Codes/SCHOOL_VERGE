/**
 * ScholarVerge.com - Main Application Logic & Interactivity Engine (Enhanced)
 * Featuring Mega-Menus, Collapsible Academic Sidebar Portal, Command Palette (Ctrl+K),
 * Dynamic Calculators, Live Order Tracking & Direct Tutor Messenger.
 */

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  renderTutors();
  renderServices();
  renderReviews('all');
  initPriceCalculator();
  initModals();
  initLanguageSwitcher();
  initOrderTracker();
  initLiveChatDrawer();
  initHeaderScroll();
  initCollapsibleSidebar();
  initCommandPalette();
  initSidebarMiniTools();
}

/* ==========================================================================
   Header Scroll & Navigation
   ========================================================================== */
function initHeaderScroll() {
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  const mobileToggle = document.querySelector('.mobile-toggle');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      openSidebar();
    });
  }
}

/* ==========================================================================
   Collapsible Academic Portal & Tools Sidebar Logic
   ========================================================================== */
function initCollapsibleSidebar() {
  const sidebar = document.getElementById('collapsible-sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const toggleBtn = document.getElementById('portal-toggle-btn');
  const closeBtn = document.getElementById('sidebar-close-btn');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', openSidebar);
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeSidebar);
  }

  if (overlay) {
    overlay.addEventListener('click', closeSidebar);
  }

  // Keyboard shortcut: Alt + S or Ctrl + B to toggle sidebar
  document.addEventListener('keydown', (e) => {
    if ((e.altKey && e.key.toLowerCase() === 's') || (e.ctrlKey && e.key.toLowerCase() === 'b')) {
      e.preventDefault();
      toggleSidebar();
    }
  });
}

function openSidebar() {
  const sidebar = document.getElementById('collapsible-sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar && overlay) {
    sidebar.classList.add('open');
    overlay.classList.add('active');
  }
}

function closeSidebar() {
  const sidebar = document.getElementById('collapsible-sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar && overlay) {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById('collapsible-sidebar');
  if (sidebar && sidebar.classList.contains('open')) {
    closeSidebar();
  } else {
    openSidebar();
  }
}

/* ==========================================================================
   Sidebar Mini Academic Tools (Word Converter, GPA Target, Citation)
   ========================================================================== */
function initSidebarMiniTools() {
  // Word to Page Converter
  const wordInput = document.getElementById('sidebar-word-input');
  const spacingSelect = document.getElementById('sidebar-spacing-select');
  const wordResult = document.getElementById('sidebar-word-result');

  function calculatePages() {
    if (!wordInput || !wordResult) return;
    const words = parseInt(wordInput.value, 10) || 0;
    const wordsPerPage = spacingSelect && spacingSelect.value === 'single' ? 550 : 275;
    const pages = (words / wordsPerPage).toFixed(1);
    wordResult.textContent = `${words.toLocaleString()} words = ~${pages} ${pages === '1.0' ? 'Page' : 'Pages'} (${spacingSelect && spacingSelect.value === 'single' ? 'Single' : 'Double'} Spaced)`;
  }

  if (wordInput) wordInput.addEventListener('input', calculatePages);
  if (spacingSelect) spacingSelect.addEventListener('change', calculatePages);

  // GPA Target Calculator
  const currentGradeInput = document.getElementById('sidebar-gpa-current');
  const targetGradeInput = document.getElementById('sidebar-gpa-target');
  const weightInput = document.getElementById('sidebar-gpa-weight');
  const gpaResult = document.getElementById('sidebar-gpa-result');

  function calculateTargetScore() {
    if (!currentGradeInput || !targetGradeInput || !weightInput || !gpaResult) return;
    const current = parseFloat(currentGradeInput.value) || 0;
    const target = parseFloat(targetGradeInput.value) || 0;
    const weight = parseFloat(weightInput.value) || 0;

    if (weight > 0 && weight <= 100) {
      const remainingWeight = 100 - weight;
      const neededScore = (target - (current * (remainingWeight / 100))) / (weight / 100);
      if (neededScore <= 0) {
        gpaResult.textContent = `You already secured your target! Even a 0% maintains your grade.`;
      } else if (neededScore > 100) {
        gpaResult.textContent = `Target requires ${neededScore.toFixed(1)}% (Consider extra credit with your tutor!)`;
      } else {
        gpaResult.textContent = `You need ${neededScore.toFixed(1)}% on this assignment to get your target!`;
      }
    }
  }

  if (currentGradeInput) currentGradeInput.addEventListener('input', calculateTargetScore);
  if (targetGradeInput) targetGradeInput.addEventListener('input', calculateTargetScore);
  if (weightInput) weightInput.addEventListener('input', calculateTargetScore);
}

function copyCitationTemplate(format) {
  let template = '';
  if (format === 'apa') {
    template = `Author, A. A., & Author, B. B. (2025). Title of scholarly article. Journal of Academic Excellence, 14(2), 112–128. https://doi.org/10.xxxx/xxxx`;
  } else if (format === 'mla') {
    template = `Author, First. "Title of Scholarly Article." Journal of Academic Excellence, vol. 14, no. 2, 2025, pp. 112–128.`;
  } else if (format === 'harvard') {
    template = `Author, A.A. and Author, B.B., 2025. Title of scholarly article. Journal of Academic Excellence, 14(2), pp.112-128.`;
  } else if (format === 'oscola') {
    template = `Author, 'Title of Article' (2025) 14 Journal of Legal Studies 112.`;
  }

  navigator.clipboard.writeText(template).then(() => {
    showToast(`Copied ${format.toUpperCase()} template to clipboard!`);
  }).catch(() => {
    showToast(`Template: ${template}`);
  });
}

/* ==========================================================================
   Command Palette (Ctrl + K) Logic & Quick Navigation
   ========================================================================== */
const commandItems = [
  { title: 'Claire Bennett', sub: 'Tutor • Law, English, IT & History', action: () => { openOrderModalWithTutor('Claire Bennett'); } },
  { title: 'Oliver Harrison', sub: 'Tutor • Business, Economics, Finance & Math', action: () => { openOrderModalWithTutor('Oliver Harrison'); } },
  { title: 'Sophia Mitchell', sub: 'Tutor • Nursing, Healthcare & Psychology', action: () => { openOrderModalWithTutor('Sophia Mitchell'); } },
  { title: 'Book Free 10-Minute Consultation', sub: 'Schedule 1-on-1 tutor video session', action: () => { openConsultationModalWithTutor(''); } },
  { title: 'Price Calculator', sub: 'Estimate paper cost with deadline & level', action: () => { document.getElementById('hero-calculator').scrollIntoView({ behavior: 'smooth' }); } },
  { title: 'Track Order #SV-84920', sub: 'Sophia Mitchell • Nursing Care Plan', action: () => { loadOrderDetails('SV-84920'); document.getElementById('order-tracker').scrollIntoView({ behavior: 'smooth' }); } },
  { title: 'Track Order #SV-77219', sub: 'Oliver Harrison • Econometrics Model', action: () => { loadOrderDetails('SV-77219'); document.getElementById('order-tracker').scrollIntoView({ behavior: 'smooth' }); } },
  { title: 'Track Order #SV-99104', sub: 'Claire Bennett • Law & Tech Brief', action: () => { loadOrderDetails('SV-99104'); document.getElementById('order-tracker').scrollIntoView({ behavior: 'smooth' }); } },
  { title: 'Turnitin & 0% AI Guarantee', sub: 'Inspect Authenticity Certificate', action: () => { openTurnitinModal(); } },
  { title: 'Leave a Verified Review', sub: 'Share your tutoring feedback & rating', action: () => { openReviewModal(); } },
  { title: 'Switch to English (UK)', sub: 'Harvard/OSCOLA standards & GBP (£)', action: () => { setLanguage('en-GB'); } },
  { title: 'Switch to English (US)', sub: 'APA/MLA standards & USD ($)', action: () => { setLanguage('en-US'); } }
];

function initCommandPalette() {
  const paletteOverlay = document.getElementById('command-palette-overlay');
  const paletteInput = document.getElementById('command-palette-input');
  const searchTriggers = document.querySelectorAll('.nav-search-btn');

  searchTriggers.forEach(btn => {
    btn.addEventListener('click', openCommandPalette);
  });

  if (paletteOverlay) {
    paletteOverlay.addEventListener('click', (e) => {
      if (e.target === paletteOverlay) {
        closeCommandPalette();
      }
    });
  }

  // Global shortcut: Ctrl + K or Cmd + K
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openCommandPalette();
    } else if (e.key === 'Escape') {
      closeCommandPalette();
      closeSidebar();
    }
  });

  if (paletteInput) {
    paletteInput.addEventListener('input', () => {
      renderCommandResults(paletteInput.value.trim().toLowerCase());
    });
  }
}

function openCommandPalette() {
  const paletteOverlay = document.getElementById('command-palette-overlay');
  const paletteInput = document.getElementById('command-palette-input');
  if (paletteOverlay) {
    paletteOverlay.classList.add('active');
    renderCommandResults('');
    if (paletteInput) {
      paletteInput.value = '';
      setTimeout(() => paletteInput.focus(), 50);
    }
  }
}

function closeCommandPalette() {
  const paletteOverlay = document.getElementById('command-palette-overlay');
  if (paletteOverlay) {
    paletteOverlay.classList.remove('active');
  }
}

function renderCommandResults(query = '') {
  const container = document.getElementById('command-palette-results');
  if (!container) return;

  const filtered = query
    ? commandItems.filter(item => item.title.toLowerCase().includes(query) || item.sub.toLowerCase().includes(query))
    : commandItems;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="padding: 24px; text-align: center; color: #94a3b8; font-size: 0.9rem;">
        No matching academic actions found for "${query}".
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map((item, index) => `
    <div class="palette-item" onclick="executeCommand(${index}, '${item.title.replace(/'/g, "\\'")}')">
      <div class="palette-item-left">
        <div class="palette-item-icon"><i class="fa-solid fa-arrow-right"></i></div>
        <div>
          <div class="palette-item-title">${item.title}</div>
          <div class="palette-item-sub">${item.sub}</div>
        </div>
      </div>
      <i class="fa-solid fa-chevron-right" style="font-size: 0.75rem; color: #cbd5e1;"></i>
    </div>
  `).join('');
}

function executeCommand(index, title) {
  closeCommandPalette();
  const item = commandItems.find(i => i.title === title);
  if (item && typeof item.action === 'function') {
    item.action();
  }
}

/* ==========================================================================
   Language Switcher (US / UK)
   ========================================================================== */
function initLanguageSwitcher() {
  const langButtons = document.querySelectorAll('.lang-btn');
  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedLang = btn.dataset.lang;
      setLanguage(selectedLang);
      showToast(`Language switched to ${selectedLang === 'en-GB' ? 'English (UK)' : 'English (US)'}`);
    });
  });
}

/* ==========================================================================
   Render Tutors Showcase
   ========================================================================== */
function renderTutors() {
  const grid = document.getElementById('tutors-grid-container');
  if (!grid) return;

  grid.innerHTML = tutorsData.map(tutor => {
    return `
      <div class="tutor-card" data-tutor-id="${tutor.id}">
        <div class="tutor-header">
          <div class="tutor-avatar-wrap">
            <img src="${tutor.avatar}" alt="${tutor.name}" class="tutor-avatar" />
            <span class="tutor-online-status" title="Online & Available Now"></span>
          </div>
          <div class="tutor-meta">
            <h3 class="tutor-name">${tutor.name}</h3>
            <p class="tutor-degree">${tutor.degree}</p>
            <div class="tutor-rating">
              <i class="fa-solid fa-star"></i>
              <span>${tutor.rating}</span>
              <span>(${tutor.totalReviews}+ reviews)</span>
              <span class="badge badge-trust" style="margin-left: 4px; padding: 2px 6px; font-size: 0.7rem;">${tutor.successRate}</span>
            </div>
          </div>
        </div>
        
        <div class="tutor-body">
          <div class="tutor-subjects">
            ${tutor.subjects.map(s => `<span class="subject-pill">${s}</span>`).join('')}
          </div>
          <p class="tutor-bio">${tutor.bio}</p>
          
          <div class="tutor-stats-strip">
            <div class="stat-item-small">
              <span class="stat-val">${tutor.stats.papersCompleted}+</span>
              <span class="stat-lbl">Papers Completed</span>
            </div>
            <div class="stat-item-small">
              <span class="stat-val">${tutor.stats.turnitinClearScore}</span>
              <span class="stat-lbl">Originality Score</span>
            </div>
          </div>

          <div class="tutor-actions">
            <button class="btn btn-tutor-order" onclick="openOrderModalWithTutor('${tutor.name}')">
              <i class="fa-solid fa-pen-nib"></i> Write My Paper
            </button>
            <button class="btn btn-tutor-consult" onclick="openConsultationModalWithTutor('${tutor.id}')">
              <i class="fa-regular fa-calendar-check"></i> Free 10-Min
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/* ==========================================================================
   Render Services Catalog
   ========================================================================== */
function renderServices() {
  const grid = document.getElementById('services-grid-container');
  if (!grid) return;

  grid.innerHTML = serviceCategories.map(s => `
    <div class="service-card">
      <div class="service-icon-box">
        <i class="fa-solid ${s.icon}"></i>
      </div>
      <h3 class="service-title">${s.category}</h3>
      <p class="service-desc">${s.description}</p>
      <ul class="service-items-list">
        ${s.items.map(item => `
          <li><i class="fa-solid fa-check"></i> ${item}</li>
        `).join('')}
      </ul>
      <button class="btn btn-outline" style="width: 100%; margin-top: 20px; font-size: 0.85rem; padding: 8px;" onclick="openOrderModalWithSubject('${s.category}')">
        Request Support in this Area
      </button>
    </div>
  `).join('');
}

/* ==========================================================================
   Render Verified Student Reviews & Filters
   ========================================================================== */
function renderReviews(filter = 'all') {
  const grid = document.getElementById('reviews-grid-container');
  if (!grid) return;

  let filtered = allReviewsData;
  if (filter !== 'all') {
    filtered = allReviewsData.filter(r => {
      if (filter === 'nursing') return r.subject.toLowerCase().includes('nursing') || r.tutor.includes('Sophia');
      if (filter === 'business') return r.subject.toLowerCase().includes('econ') || r.subject.toLowerCase().includes('finance') || r.subject.toLowerCase().includes('business') || r.tutor.includes('Oliver');
      if (filter === 'law') return r.subject.toLowerCase().includes('law') || r.subject.toLowerCase().includes('english') || r.tutor.includes('Claire');
      return true;
    });
  }

  grid.innerHTML = filtered.map(r => `
    <div class="review-card">
      <div class="review-top">
        <div class="review-stars">
          ${Array(r.rating).fill('<i class="fa-solid fa-star"></i>').join('')}
        </div>
        <span class="review-badge">${r.badge}</span>
      </div>
      <h4 class="review-title">${r.title}</h4>
      <p class="review-text">"${r.text}"</p>
      <div class="review-author">
        <img src="${r.avatar}" alt="${r.studentName}" class="review-avatar" />
        <div class="author-info">
          <span class="author-name">${r.studentName}</span>
          <span class="author-sub">${r.university} • Tutor: <strong>${r.tutor}</strong></span>
        </div>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.filter-tab').forEach(tab => {
    if (tab.dataset.filter === filter) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
}

function filterReviews(filter) {
  renderReviews(filter);
}

/* ==========================================================================
   Dynamic Price & Calculator Logic
   ========================================================================== */
let calcState = {
  academicLevel: 'undergrad',
  deadline: '3days',
  pages: 3,
  serviceType: 'essay',
  hasPromo: false,
  promoDiscount: 0.20
};

const levelRates = {
  highschool: 12.50,
  undergrad: 15.00,
  masters: 19.50,
  doctoral: 24.00
};

const deadlineMultipliers = {
  '3hrs': 2.2,
  '6hrs': 1.8,
  '12hrs': 1.5,
  '24hrs': 1.3,
  '2days': 1.15,
  '3days': 1.05,
  '7days': 1.0,
  '14days': 0.90
};

function initPriceCalculator() {
  const levelSelect = document.getElementById('calc-academic-level');
  const deadlineSelect = document.getElementById('calc-deadline');
  const serviceSelect = document.getElementById('calc-service');
  const btnMinus = document.getElementById('calc-page-minus');
  const btnPlus = document.getElementById('calc-page-plus');
  const promoInput = document.getElementById('calc-promo-input');
  const promoBtn = document.getElementById('calc-promo-apply');

  if (levelSelect) {
    levelSelect.addEventListener('change', (e) => {
      calcState.academicLevel = e.target.value;
      updatePricingDisplay();
    });
  }

  if (deadlineSelect) {
    deadlineSelect.addEventListener('change', (e) => {
      calcState.deadline = e.target.value;
      updatePricingDisplay();
    });
  }

  if (serviceSelect) {
    serviceSelect.addEventListener('change', (e) => {
      calcState.serviceType = e.target.value;
      updatePricingDisplay();
    });
  }

  if (btnMinus) {
    btnMinus.addEventListener('click', () => {
      if (calcState.pages > 1) {
        calcState.pages--;
        updatePricingDisplay();
      }
    });
  }

  if (btnPlus) {
    btnPlus.addEventListener('click', () => {
      calcState.pages++;
      updatePricingDisplay();
    });
  }

  if (promoBtn && promoInput) {
    promoBtn.addEventListener('click', () => {
      const code = promoInput.value.trim().toUpperCase();
      if (code === 'SCHOLAR20' || code === 'FIRST20') {
        calcState.hasPromo = true;
        showToast('Promo Code Applied: 20% Off Your Entire Order!');
        updatePricingDisplay();
      } else if (code === '') {
        showToast('Please enter a promo code like SCHOLAR20');
      } else {
        showToast('Invalid promo code. Try SCHOLAR20 for 20% off.');
      }
    });
  }

  updatePricingDisplay();
}

function updatePricingDisplay() {
  const rate = levelRates[calcState.academicLevel] || 15.00;
  const multiplier = deadlineMultipliers[calcState.deadline] || 1.0;
  const isUK = currentLang === 'en-GB';
  const currencySymbol = isUK ? '£' : '$';
  const currencyMultiplier = isUK ? 0.79 : 1.0;

  const baseTotal = (rate * multiplier * calcState.pages) * currencyMultiplier;
  const discountedTotal = calcState.hasPromo ? baseTotal * (1 - calcState.promoDiscount) : baseTotal;
  const words = calcState.pages * 275;

  const totalEl = document.getElementById('calc-price-total');
  const oldEl = document.getElementById('calc-price-old');
  const pageValEl = document.getElementById('calc-page-count');
  const wordValEl = document.getElementById('calc-word-count');

  if (pageValEl) pageValEl.textContent = `${calcState.pages} ${calcState.pages === 1 ? 'Page' : 'Pages'}`;
  if (wordValEl) wordValEl.textContent = `~${words.toLocaleString()} words`;

  if (totalEl) {
    totalEl.textContent = `${currencySymbol}${discountedTotal.toFixed(2)}`;
  }

  if (oldEl) {
    if (calcState.hasPromo) {
      oldEl.style.display = 'inline';
      oldEl.textContent = `${currencySymbol}${baseTotal.toFixed(2)}`;
    } else {
      oldEl.style.display = 'none';
    }
  }
}

/* ==========================================================================
   Modals Management
   ========================================================================== */
function initModals() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });

  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      const overlay = btn.closest('.modal-overlay');
      if (overlay) overlay.classList.remove('active');
    });
  });
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

/* ==========================================================================
   Free 10-Minute Consultation Scheduler
   ========================================================================== */
function openConsultationModalWithTutor(tutorId = '') {
  closeSidebar();
  const tutorSelect = document.getElementById('consult-tutor-select');
  if (tutorSelect && tutorId) {
    tutorSelect.value = tutorId;
  }
  openModal('consultation-modal');
}

function submitConsultationBooking(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('consult-name').value.trim();
  const email = document.getElementById('consult-email').value.trim();
  const tutor = document.getElementById('consult-tutor-select').options[document.getElementById('consult-tutor-select').selectedIndex].text;
  const date = document.getElementById('consult-date').value;
  const time = document.getElementById('consult-time').value;
  const topic = document.getElementById('consult-topic').value.trim();

  if (!name || !email || !date || !time) {
    showToast('Please fill in all required fields to reserve your slot.');
    return;
  }

  closeModal('consultation-modal');

  const meetId = `meet.google.com/sch-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
  const confirmBody = document.getElementById('consult-confirm-details');
  if (confirmBody) {
    confirmBody.innerHTML = `
      <div style="text-align: center; padding: 10px 0;">
        <div style="width: 60px; height: 60px; border-radius: 50%; background: #ecfdf5; color: #059669; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; margin: 0 auto 16px;">
          <i class="fa-solid fa-check"></i>
        </div>
        <h3 style="font-size: 1.35rem; margin-bottom: 8px;">Consultation Confirmed!</h3>
        <p style="color: #64748b; font-size: 0.9rem; margin-bottom: 20px;">We’ve sent a calendar invite and confirmation to <strong>${email}</strong>.</p>
        
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; text-align: left; margin-bottom: 20px;">
          <p style="margin-bottom: 6px;"><strong>Assigned Tutor:</strong> ${tutor}</p>
          <p style="margin-bottom: 6px;"><strong>Scheduled Time:</strong> ${date} at ${time} (10 Minutes)</p>
          <p style="margin-bottom: 6px;"><strong>Discussion Topic:</strong> ${topic || 'Academic Project Overview'}</p>
          <p style="margin-bottom: 0;"><strong>Direct Video Room:</strong> <a href="#" style="color: #2563eb; font-weight: 600;" onclick="event.preventDefault(); showToast('Joining video session room...');">${meetId}</a></p>
        </div>

        <button class="btn btn-primary" style="width: 100%;" onclick="downloadICS('${tutor}', '${date}', '${time}')">
          <i class="fa-solid fa-calendar-plus"></i> Add to Google / Apple Calendar (.ics)
        </button>
      </div>
    `;
  }
  openModal('consult-confirm-modal');
}

function downloadICS(tutor, date, time) {
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ScholarVerge//Academic Consultation//EN
BEGIN:VEVENT
SUMMARY:10-Min Academic Consultation with ${tutor}
DESCRIPTION:Free personalized academic guidance session on ScholarVerge.com.
LOCATION:https://meet.google.com/sch-verge-room
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `ScholarVerge_Consultation_${tutor.replace(/\s+/g, '_')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Calendar invite (.ics) downloaded!');
}

/* ==========================================================================
   Order Paper / "Write My Paper" Wizard Logic
   ========================================================================== */
let orderWizardStep = 1;

function openOrderModalWithTutor(tutorName) {
  closeSidebar();
  const tutorSelect = document.getElementById('order-tutor-select');
  if (tutorSelect && tutorName) {
    for (let i = 0; i < tutorSelect.options.length; i++) {
      if (tutorSelect.options[i].text.includes(tutorName)) {
        tutorSelect.selectedIndex = i;
        break;
      }
    }
  }
  orderWizardStep = 1;
  updateOrderWizardUI();
  openModal('order-paper-modal');
}

function openOrderModalWithSubject(subjectName) {
  closeSidebar();
  const topicInput = document.getElementById('order-topic');
  if (topicInput) {
    topicInput.value = `${subjectName} Assignment`;
  }
  orderWizardStep = 1;
  updateOrderWizardUI();
  openModal('order-paper-modal');
}

function nextOrderStep() {
  if (orderWizardStep === 1) {
    const topic = document.getElementById('order-topic').value.trim();
    if (!topic) {
      showToast('Please specify your assignment topic or subject.');
      return;
    }
  }
  if (orderWizardStep < 4) {
    orderWizardStep++;
    updateOrderWizardUI();
  }
}

function prevOrderStep() {
  if (orderWizardStep > 1) {
    orderWizardStep--;
    updateOrderWizardUI();
  }
}

function updateOrderWizardUI() {
  for (let i = 1; i <= 4; i++) {
    const stepPane = document.getElementById(`order-step-pane-${i}`);
    const stepNode = document.getElementById(`order-node-${i}`);
    if (stepPane) {
      stepPane.style.display = i === orderWizardStep ? 'block' : 'none';
    }
    if (stepNode) {
      if (i === orderWizardStep) {
        stepNode.className = 'wizard-step-node active';
      } else if (i < orderWizardStep) {
        stepNode.className = 'wizard-step-node done';
      } else {
        stepNode.className = 'wizard-step-node';
      }
    }
  }

  if (orderWizardStep === 4) {
    const topic = document.getElementById('order-topic').value || 'Academic Research Essay';
    const pages = document.getElementById('order-pages').value || '3';
    const level = document.getElementById('order-level').value || 'Undergraduate';
    const tutor = document.getElementById('order-tutor-select').options[document.getElementById('order-tutor-select').selectedIndex].text;
    const isUK = currentLang === 'en-GB';
    const curr = isUK ? '£' : '$';
    
    const summaryEl = document.getElementById('order-summary-box');
    if (summaryEl) {
      summaryEl.innerHTML = `
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; font-size: 0.9rem;">
          <p style="margin-bottom: 6px;"><strong>Topic:</strong> ${topic}</p>
          <p style="margin-bottom: 6px;"><strong>Academic Level:</strong> ${level}</p>
          <p style="margin-bottom: 6px;"><strong>Length:</strong> ${pages} Pages (~${pages * 275} words)</p>
          <p style="margin-bottom: 6px;"><strong>Preferred Tutor:</strong> ${tutor}</p>
          <p style="margin-bottom: 6px;"><strong>Plagiarism & AI Report:</strong> <span style="color: #059669; font-weight: 700;">Included Free</span></p>
          <p style="margin-bottom: 0;"><strong>Escrow Deposit Hold:</strong> <span style="color: #2563eb; font-weight: 800; font-size: 1.1rem;">${curr}${(pages * 15 * (isUK ? 0.79 : 1.0)).toFixed(2)}</span></p>
        </div>
      `;
    }
  }
}

function submitEscrowOrder(e) {
  if (e) e.preventDefault();
  const randomId = `SV-${Math.floor(10000 + Math.random() * 90000)}`;
  const topic = document.getElementById('order-topic').value || 'Academic Research Paper';
  const tutorName = document.getElementById('order-tutor-select').options[document.getElementById('order-tutor-select').selectedIndex].text;
  
  mockOrders[randomId] = {
    orderId: randomId,
    topic: topic,
    tutor: tutorName.split('(')[0].trim(),
    tutorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    subject: 'General Academic Support',
    level: document.getElementById('order-level').value,
    pages: `${document.getElementById('order-pages').value} Pages`,
    format: document.getElementById('order-citation').value,
    deadline: 'In 3 Days',
    status: 'In Progress - Tutor Drafting',
    progress: 45,
    steps: [
      { name: 'Assignment Details Submitted', done: true, time: 'Just now' },
      { name: `Tutor ${tutorName.split('(')[0].trim()} Assigned`, done: true, time: 'Just now' },
      { name: 'Escrow Deposit Held Securely', done: true, time: 'Just now' },
      { name: 'Primary Sources & Outline Synthesis', done: true, time: 'In Progress' },
      { name: 'Drafting & Citation Formatting', done: false, time: 'Upcoming' },
      { name: 'Turnitin & AI-Free Verification', done: false, time: 'Upcoming' },
      { name: 'Ready for Review & Payment Release', done: false, time: 'Upcoming' }
    ],
    chatHistory: [
      { sender: tutorName.split('(')[0].trim(), time: 'Just now', text: `Hello! I have received your assignment prompt: "${topic}". I am gathering the required peer-reviewed academic literature now.` }
    ],
    files: [
      { name: 'Assignment_Requirements_Brief.pdf', size: '320 KB', type: 'Uploaded Prompt' }
    ]
  };

  closeModal('order-paper-modal');
  showToast(`Order #${randomId} Created! Escrow deposit held safely.`);
  
  const trackerInput = document.getElementById('tracker-input');
  if (trackerInput) {
    trackerInput.value = randomId;
    loadOrderDetails(randomId);
    document.getElementById('order-tracker').scrollIntoView({ behavior: 'smooth' });
  }
}

/* ==========================================================================
   Order Tracker & Live Chat Simulation
   ========================================================================== */
function initOrderTracker() {
  const searchBtn = document.getElementById('tracker-search-btn');
  const trackerInput = document.getElementById('tracker-input');

  if (searchBtn && trackerInput) {
    searchBtn.addEventListener('click', () => {
      const orderId = trackerInput.value.trim().toUpperCase().replace('#', '');
      loadOrderDetails(orderId);
    });
  }

  loadOrderDetails('SV-84920');
}

function loadOrderDetails(orderId) {
  const order = mockOrders[orderId];
  const container = document.getElementById('tracker-result-container');
  if (!container) return;

  if (!order) {
    container.innerHTML = `
      <div style="grid-column: span 2; text-align: center; padding: 40px 0;">
        <i class="fa-solid fa-magnifying-glass" style="font-size: 2.5rem; color: #cbd5e1; margin-bottom: 16px;"></i>
        <h4 style="font-size: 1.25rem;">Order #${orderId} Not Found</h4>
        <p style="color: #64748b; font-size: 0.9rem;">Please check the Order ID format (e.g. SV-84920, SV-77219, SV-99104) or create a new order.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <!-- Left Column: Timeline & Deliverables -->
    <div>
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
        <div>
          <span class="badge badge-verified" style="margin-bottom: 6px;">Order #${order.orderId}</span>
          <h3 style="font-size: 1.35rem; color: var(--primary);">${order.topic}</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted);">${order.subject} • ${order.level} • ${order.pages} • ${order.format}</p>
        </div>
        <span class="badge badge-trust" style="font-size: 0.85rem; padding: 8px 16px;">
          <i class="fa-solid fa-clock-rotate-left"></i> ${order.status}
        </span>
      </div>

      <!-- Timeline -->
      <h4 style="font-size: 1rem; margin-bottom: 16px; color: var(--primary);">
        <i class="fa-solid fa-list-check" style="color: var(--accent-blue);"></i> Real-Time Progress Workflow
      </h4>
      <div class="timeline">
        ${order.steps.map(s => `
          <div class="timeline-item ${s.done ? 'done' : ''}">
            <div class="timeline-dot">
              ${s.done ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-solid fa-circle" style="font-size: 0.4rem;"></i>'}
            </div>
            <div class="timeline-title">${s.name}</div>
            <div class="timeline-time">${s.time}</div>
          </div>
        `).join('')}
      </div>

      <!-- Deliverables Box -->
      <h4 style="font-size: 1rem; margin: 24px 0 12px; color: var(--primary);">
        <i class="fa-solid fa-file-arrow-down" style="color: var(--accent-teal-dark);"></i> Completed Documents & Reports
      </h4>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${order.files.map(f => `
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <i class="fa-solid ${f.name.endsWith('.pdf') ? 'fa-file-pdf' : f.name.endsWith('.docx') ? 'fa-file-word' : 'fa-file-code'}" style="font-size: 1.5rem; color: #2563eb;"></i>
              <div>
                <strong style="font-size: 0.875rem; color: #0f172a; display: block;">${f.name}</strong>
                <span style="font-size: 0.75rem; color: #64748b;">${f.type} • ${f.size}</span>
              </div>
            </div>
            <button class="btn btn-outline" style="padding: 6px 14px; font-size: 0.8rem;" onclick="simulateFileDownload('${f.name}')">
              <i class="fa-solid fa-download"></i> Download
            </button>
          </div>
        `).join('')}
      </div>

      <!-- Escrow Release Protection -->
      <div style="margin-top: 24px; background: rgba(6, 214, 160, 0.1); border: 1px solid rgba(6, 214, 160, 0.3); border-radius: 14px; padding: 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div>
          <strong style="color: #047857; font-size: 0.95rem; display: block;">Step 6: Escrow Release Protection</strong>
          <span style="font-size: 0.8rem; color: #334155;">Only release your escrow funds once you are 100% satisfied with the deliverables.</span>
        </div>
        <button class="btn btn-accent" style="font-size: 0.85rem;" onclick="releaseEscrowFunds('${order.orderId}')">
          <i class="fa-solid fa-shield-check"></i> Approve & Release Funds
        </button>
      </div>
    </div>

    <!-- Right Column: Direct Tutor Chat Simulator -->
    <div>
      <div class="chat-simulator-box">
        <div class="chat-sim-header">
          <img src="${order.tutorAvatar}" alt="${order.tutor}" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover;" />
          <div>
            <strong style="font-size: 0.9rem; color: var(--primary); display: block;">${order.tutor}</strong>
            <span style="font-size: 0.75rem; color: var(--accent-teal-dark); font-weight: 600;"><i class="fa-solid fa-circle" style="font-size: 0.5rem;"></i> Active Now</span>
          </div>
        </div>

        <div class="chat-sim-body" id="tracker-chat-body-${order.orderId}">
          ${order.chatHistory.map(m => `
            <div class="chat-msg ${m.sender === 'You' ? 'you' : 'tutor'}">
              <div style="font-size: 0.7rem; opacity: 0.75; margin-bottom: 2px;">${m.sender} • ${m.time}</div>
              ${m.text}
            </div>
          `).join('')}
        </div>

        <div class="chat-sim-footer">
          <input type="text" id="tracker-chat-input-${order.orderId}" class="chat-sim-input" placeholder="Message ${order.tutor}..." onkeypress="handleTrackerChatKey(event, '${order.orderId}')" />
          <button class="btn btn-primary" style="padding: 8px 14px;" onclick="sendTrackerMessage('${order.orderId}')">
            <i class="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  `;
}

function handleTrackerChatKey(e, orderId) {
  if (e.key === 'Enter') {
    sendTrackerMessage(orderId);
  }
}

function sendTrackerMessage(orderId) {
  const input = document.getElementById(`tracker-chat-input-${orderId}`);
  if (!input || !input.value.trim()) return;

  const text = input.value.trim();
  input.value = '';

  const order = mockOrders[orderId];
  if (!order) return;

  order.chatHistory.push({
    sender: 'You',
    time: 'Just now',
    text: text
  });

  const chatBody = document.getElementById(`tracker-chat-body-${orderId}`);
  if (chatBody) {
    chatBody.innerHTML = order.chatHistory.map(m => `
      <div class="chat-msg ${m.sender === 'You' ? 'you' : 'tutor'}">
        <div style="font-size: 0.7rem; opacity: 0.75; margin-bottom: 2px;">${m.sender} • ${m.time}</div>
        ${m.text}
      </div>
    `).join('');
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  setTimeout(() => {
    let reply = `Thank you for your note! I have incorporated this into the drafting outline. Your paper is being polished strictly according to your rubric.`;
    if (text.toLowerCase().includes('plagiarism') || text.toLowerCase().includes('turnitin')) {
      reply = `All my sources are retrieved directly from peer-reviewed databases and formatted from scratch. The Turnitin similarity report is guaranteed under 2% and 100% human-crafted.`;
    } else if (text.toLowerCase().includes('time') || text.toLowerCase().includes('when')) {
      reply = `I am on track to deliver your complete draft well ahead of your deadline so you have ample time to review.`;
    }

    order.chatHistory.push({
      sender: order.tutor,
      time: 'Just now',
      text: reply
    });

    if (chatBody) {
      chatBody.innerHTML = order.chatHistory.map(m => `
        <div class="chat-msg ${m.sender === 'You' ? 'you' : 'tutor'}">
          <div style="font-size: 0.7rem; opacity: 0.75; margin-bottom: 2px;">${m.sender} • ${m.time}</div>
          ${m.text}
        </div>
      `).join('');
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  }, 1200);
}

function simulateFileDownload(fileName) {
  showToast(`Downloading: ${fileName}`);
}

function releaseEscrowFunds(orderId) {
  showToast(`Escrow funds released for #${orderId}. Thank you for choosing ScholarVerge!`);
  openReviewModal();
}

/* ==========================================================================
   Leave Us a Review Modal & Dynamic Submissions
   ========================================================================== */
let selectedReviewStars = 5;

function openReviewModal() {
  closeSidebar();
  selectedReviewStars = 5;
  updateReviewStarsUI();
  openModal('review-modal');
}

function setReviewStars(stars) {
  selectedReviewStars = stars;
  updateReviewStarsUI();
}

function updateReviewStarsUI() {
  const starContainer = document.getElementById('review-star-picker');
  if (!starContainer) return;
  starContainer.innerHTML = [1, 2, 3, 4, 5].map(i => `
    <i class="fa-solid fa-star" style="font-size: 1.5rem; color: ${i <= selectedReviewStars ? '#f59e0b' : '#cbd5e1'}; cursor: pointer;" onclick="setReviewStars(${i})"></i>
  `).join('');
}

function submitStudentReview(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('rev-name').value.trim();
  const uni = document.getElementById('rev-uni').value.trim();
  const tutor = document.getElementById('rev-tutor').value;
  const title = document.getElementById('rev-title').value.trim();
  const text = document.getElementById('rev-text').value.trim();

  if (!name || !title || !text) {
    showToast('Please complete your review title and feedback.');
    return;
  }

  const newReview = {
    id: Date.now(),
    studentName: name,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    university: uni || 'Verified University',
    subject: 'Academic Excellence',
    tutor: tutor,
    rating: selectedReviewStars,
    date: 'Just now',
    badge: 'Verified Student Review',
    title: title,
    text: text
  };

  allReviewsData.unshift(newReview);
  renderReviews('all');
  closeModal('review-modal');
  showToast('Thank you! Your verified review has been published.');
}

/* ==========================================================================
   Turnitin Sample Report Modal Inspector
   ========================================================================== */
function openTurnitinModal() {
  closeSidebar();
  openModal('turnitin-modal');
}

/* ==========================================================================
   24/7 Live Support Chat Drawer
   ========================================================================== */
function initLiveChatDrawer() {
  const toggleBtn = document.getElementById('floating-support-btn');
  const drawer = document.getElementById('live-chat-drawer');
  const closeBtn = document.getElementById('chat-drawer-close');

  if (toggleBtn && drawer) {
    toggleBtn.addEventListener('click', () => {
      drawer.classList.toggle('active');
    });
  }

  if (closeBtn && drawer) {
    closeBtn.addEventListener('click', () => {
      drawer.classList.remove('active');
    });
  }
}

function sendSupportChat() {
  const input = document.getElementById('chat-drawer-input');
  const body = document.getElementById('chat-drawer-messages');
  if (!input || !input.value.trim() || !body) return;

  const msg = input.value.trim();
  input.value = '';

  body.innerHTML += `
    <div class="chat-msg you" style="margin-bottom: 8px;">
      <div style="font-size: 0.7rem; opacity: 0.8;">You</div>
      ${msg}
    </div>
  `;
  body.scrollTop = body.scrollHeight;

  setTimeout(() => {
    let reply = `Thank you for reaching out to ScholarVerge 24/7 Support! An academic advisor is online. How can we assist with your paper or tutor consultation?`;
    if (msg.toLowerCase().includes('cost') || msg.toLowerCase().includes('price')) {
      reply = `Our pricing starts at only $12.50/page and is protected by our 100% satisfaction escrow guarantee! You can also use code SCHOLAR20 for 20% off.`;
    } else if (msg.toLowerCase().includes('tutor') || msg.toLowerCase().includes('claire') || msg.toLowerCase().includes('oliver') || msg.toLowerCase().includes('sophia')) {
      reply = `All our tutors hold Master's/Ph.D. degrees and write 100% human-crafted papers with zero AI. You can also book a Free 10-Minute Consultation anytime!`;
    }

    body.innerHTML += `
      <div class="chat-msg tutor" style="margin-bottom: 8px;">
        <div style="font-size: 0.7rem; opacity: 0.8;">Alex (Academic Advisor)</div>
        ${reply}
      </div>
    `;
    body.scrollTop = body.scrollHeight;
  }, 1000);
}

function handleQuickSupportQuestion(question) {
  const input = document.getElementById('chat-drawer-input');
  if (input) {
    input.value = question;
    sendSupportChat();
  }
}

/* ==========================================================================
   Toast Notification System
   ========================================================================== */
function showToast(message) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <i class="fa-solid fa-circle-check" style="color: var(--accent-teal-dark); font-size: 1.2rem;"></i>
    <span style="font-size: 0.875rem; font-weight: 600; color: #0f172a;">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
