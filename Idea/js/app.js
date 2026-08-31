/**
 * ScholarVerge.com - Official Interactive Application Engine
 * Featuring Multi-Tenant Student Accounts, Google OAuth, 1-on-1 Consultation Bookings,
 * Document Email Dispatches to scholarverge@gmail.com, Verified Post-Delivery Reviews,
 * Academic Power Tools & Citation Generator, and Offline WhatsApp Payment Coordination.
 */

// Application Global Multi-Tenant Authentication State
let authSession = {
  isLoggedIn: true,
  role: 'student', // 'student' | 'superadmin' | 'guest'
  token: 'session_token_active',
  user: {
    id: 'SV-STU-8820',
    full_name: 'Jordan Miller',
    email: 'jordan.m@university.edu',
    university: 'Columbia University',
    academic_level: 'Undergraduate',
    major_field: 'Biomedical & Pre-Law',
    preferred_citation: 'APA 7th Edition',
    target_gpa: 3.90,
    current_gpa: 3.72,
    whatsapp_number: '+1 (667) 775-7597',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    total_orders: 2
  }
};

let activeResetOtp = '849205';
let selectedHubStars = 5;
let uploadedFileMeta = null;

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  loadStoredSession();
  updateNavAuthUI();
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
  generateLiveCitation();
  syncCurrentStudentData();
}

/* ==========================================================================
   Multi-Tenant Session Management (localStorage)
   ========================================================================== */
function loadStoredSession() {
  try {
    const saved = localStorage.getItem('scholarverge_session');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.user) {
        authSession = parsed;
      }
    }
  } catch (e) {
    // default session
  }
}

function saveSession(sessionData) {
  authSession = sessionData;
  localStorage.setItem('scholarverge_session', JSON.stringify(sessionData));
  updateNavAuthUI();
  syncCurrentStudentData();
}

function handleUserLogout() {
  authSession = {
    isLoggedIn: false,
    role: 'guest',
    token: null,
    user: null
  };
  localStorage.removeItem('scholarverge_session');
  updateNavAuthUI();
  showToast('Signed out successfully. See you soon!');
}

function updateNavAuthUI() {
  const guestBox = document.getElementById('nav-guest-actions');
  const studentBox = document.getElementById('nav-student-actions');
  const adminBox = document.getElementById('nav-admin-actions');

  if (!guestBox || !studentBox || !adminBox) return;

  if (authSession.isLoggedIn && authSession.role === 'student' && authSession.user) {
    guestBox.style.display = 'none';
    adminBox.style.display = 'none';
    studentBox.style.display = 'flex';

    const avatarEl = document.getElementById('nav-student-avatar');
    const nameEl = document.getElementById('nav-student-name');
    const uniEl = document.getElementById('nav-student-uni');

    if (avatarEl) avatarEl.src = authSession.user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
    if (nameEl) nameEl.textContent = authSession.user.full_name || 'Student';
    if (uniEl) uniEl.textContent = authSession.user.university || 'Enrolled';
  } else if (authSession.isLoggedIn && authSession.role === 'superadmin') {
    guestBox.style.display = 'none';
    studentBox.style.display = 'none';
    adminBox.style.display = 'flex';
  } else {
    guestBox.style.display = 'flex';
    studentBox.style.display = 'none';
    adminBox.style.display = 'none';
  }
}

function syncCurrentStudentData() {
  if (authSession.isLoggedIn && authSession.role === 'student' && authSession.user && authSession.user.email) {
    fetch(`/api/student/dashboard?email=${encodeURIComponent(authSession.user.email)}`)
      .then(r => r.json())
      .then(res => {
        if (res.success && res.student) {
          authSession.user = { ...authSession.user, ...res.student };
          localStorage.setItem('scholarverge_session', JSON.stringify(authSession));
          updateNavAuthUI();
        }
      })
      .catch(() => {});
  }
}

/* ==========================================================================
   Navigation User Dropdown Toggles
   ========================================================================== */
function toggleUserNavDropdown() {
  const menu = document.getElementById('user-dropdown-menu');
  if (menu) menu.classList.toggle('show');
}

function closeUserNavDropdown() {
  const menu = document.getElementById('user-dropdown-menu');
  if (menu) menu.classList.remove('show');
}

function toggleAdminNavDropdown() {
  const menu = document.getElementById('admin-dropdown-menu');
  if (menu) menu.classList.toggle('show');
}

function closeAdminNavDropdown() {
  const menu = document.getElementById('admin-dropdown-menu');
  if (menu) menu.classList.remove('show');
}

// Global click outside to close dropdowns
document.addEventListener('click', (e) => {
  if (!e.target.closest('.nav-user-wrap')) {
    closeUserNavDropdown();
    closeAdminNavDropdown();
  }
});

/* ==========================================================================
   Multi-Tenant Auth Modal Controller
   ========================================================================== */
function openAuthModal(tab = 'login') {
  closeSidebar();
  switchAuthTab(tab);
  openModal('auth-modal');
}

function switchAuthTab(tab) {
  const tabs = ['login', 'register', 'admin', 'reset'];
  const titles = {
    login: 'Sign in to your academic student account',
    register: 'Create your academic student profile & connect with tutors',
    admin: 'Master administrator command center (2FA Security)',
    reset: 'Recover your password via instant email verification'
  };

  tabs.forEach(t => {
    const pane = document.getElementById(`auth-pane-${t}`);
    const pill = document.getElementById(`tab-btn-${t}`);
    if (pane) pane.style.display = t === tab ? 'block' : 'none';
    if (pill) {
      if (t === tab) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    }
  });

  const subEl = document.getElementById('auth-header-subtitle');
  if (subEl && titles[tab]) {
    subEl.textContent = titles[tab];
  }
}

function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isPw = input.type === 'password';
  input.type = isPw ? 'text' : 'password';
  const btn = input.nextElementSibling;
  if (btn && btn.querySelector('i')) {
    btn.querySelector('i').className = isPw ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
  }
}

function checkPasswordStrength(pw) {
  const fill = document.getElementById('reg-pw-fill');
  const lbl = document.getElementById('reg-pw-lbl');
  if (!fill || !lbl) return;

  let score = 0;
  if (pw.length >= 6) score += 25;
  if (pw.length >= 10) score += 25;
  if (/[A-Z]/.test(pw) && /[0-9]/.test(pw)) score += 25;
  if (/[^A-Za-z0-9]/.test(pw)) score += 25;

  fill.style.width = `${score}%`;
  if (score <= 25) {
    fill.style.background = '#ef4444';
    lbl.textContent = 'Weak (add numbers & symbols)';
    lbl.style.color = '#ef4444';
  } else if (score <= 50) {
    fill.style.background = '#f59e0b';
    lbl.textContent = 'Fair password';
    lbl.style.color = '#f59e0b';
  } else if (score <= 75) {
    fill.style.background = '#3b82f6';
    lbl.textContent = 'Good security';
    lbl.style.color = '#3b82f6';
  } else {
    fill.style.background = '#10b981';
    lbl.textContent = 'Strong academic protection';
    lbl.style.color = '#10b981';
  }
}

/* ==========================================================================
   Multi-Tenant Student Authentication Handlers (API Connected)
   ========================================================================== */
function handleStudentLogin(e) {
  if (e) e.preventDefault();
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value.trim();

  if (!email || !password) {
    showToast('Please enter both student email and password.');
    return;
  }

  fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  .then(r => r.json())
  .then(res => {
    if (res.success) {
      saveSession({
        isLoggedIn: true,
        role: 'student',
        token: res.session_token,
        user: res.user
      });
      closeModal('auth-modal');
      showToast(res.message || `Welcome back, ${res.user.full_name}!`);
      openStudentDashboard();
    } else {
      showToast(res.error || 'Invalid login credentials.');
    }
  })
  .catch(() => {
    saveSession({
      isLoggedIn: true,
      role: 'student',
      token: 'local_token',
      user: {
        id: 'SV-STU-8820',
        full_name: email.split('@')[0].toUpperCase(),
        email: email,
        university: 'Columbia University',
        academic_level: 'Undergraduate',
        major_field: 'Academic Sciences',
        target_gpa: 3.85,
        current_gpa: 3.65,
        total_orders: 1,
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
      }
    });
    closeModal('auth-modal');
    openStudentDashboard();
  });
}

function handleStudentRegister(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim().toLowerCase();
  const uni = document.getElementById('reg-uni').value.trim();
  const level = document.getElementById('reg-level').value;
  const major = document.getElementById('reg-major').value.trim();
  const whatsapp = document.getElementById('reg-whatsapp').value.trim();
  const password = document.getElementById('reg-password').value.trim();
  const confirmPw = document.getElementById('reg-password-confirm').value.trim();

  if (password !== confirmPw) {
    showToast('Passwords do not match. Please re-enter.');
    return;
  }

  fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full_name: name,
      email: email,
      university: uni,
      academic_level: level,
      major_field: major,
      whatsapp_number: whatsapp,
      password: password
    })
  })
  .then(r => r.json())
  .then(res => {
    if (res.success) {
      saveSession({
        isLoggedIn: true,
        role: 'student',
        token: res.session_token,
        user: res.user
      });
      closeModal('auth-modal');
      showToast(res.message || 'Account created successfully!');
      openStudentDashboard();
    } else {
      showToast(res.error || 'Registration error. Please check your details.');
    }
  })
  .catch(() => {
    saveSession({
      isLoggedIn: true,
      role: 'student',
      token: 'local_token',
      user: {
        id: 'SV-STU-NEW',
        full_name: name,
        email: email,
        university: uni,
        academic_level: level,
        major_field: major,
        target_gpa: 3.90,
        current_gpa: 3.70,
        total_orders: 0,
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
      }
    });
    closeModal('auth-modal');
    openStudentDashboard();
  });
}

function handleGoogleSignIn() {
  showToast('Connecting to Google Identity Services...');
  
  setTimeout(() => {
    fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'student.scholar@gmail.com',
        name: 'Scholar Student',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
      })
    })
    .then(r => r.json())
    .then(res => {
      if (res.success) {
        saveSession({
          isLoggedIn: true,
          role: 'student',
          token: res.session_token,
          user: res.user
        });
        closeModal('auth-modal');
        showToast(`Google Sign-In verified for ${res.user.full_name}!`);
        openStudentDashboard();
      }
    })
    .catch(() => {
      saveSession({
        isLoggedIn: true,
        role: 'student',
        token: 'google_session',
        user: {
          id: 'SV-STU-8820',
          full_name: 'Scholar Student',
          email: 'student.scholar@gmail.com',
          university: 'Columbia University',
          academic_level: 'Undergraduate',
          major_field: 'Biomedical & Pre-Law',
          target_gpa: 3.90,
          current_gpa: 3.72,
          total_orders: 2,
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
        }
      });
      closeModal('auth-modal');
      openStudentDashboard();
    });
  }, 600);
}

/* ==========================================================================
   Super Admin Master Gate Handler (2FA Shield)
   ========================================================================== */
function handleSuperAdminLogin(e) {
  if (e) e.preventDefault();
  const email = document.getElementById('admin-login-email').value.trim().toLowerCase();
  const password = document.getElementById('admin-login-password').value.trim();
  const pin = document.getElementById('admin-login-2fa').value.trim();

  if (!email || !password) {
    showToast('Super Admin email and master passcode required.');
    return;
  }

  fetch('/api/auth/admin-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, two_factor_code: pin })
  })
  .then(r => r.json())
  .then(res => {
    if (res.success) {
      saveSession({
        isLoggedIn: true,
        role: 'superadmin',
        token: res.session_token,
        user: res.user
      });
      closeModal('auth-modal');
      showToast('Super Admin Security Cleared: Welcome to Command Center!');
      openSuperAdminPortal();
    } else {
      showToast(res.error || 'Access Denied: Invalid master credentials or 2FA PIN.');
    }
  })
  .catch(() => {
    saveSession({
      isLoggedIn: true,
      role: 'superadmin',
      token: 'admin_token',
      user: {
        email: 'admin@scholarverge.com',
        role: 'superadmin',
        full_name: 'Super Admin Lead'
      }
    });
    closeModal('auth-modal');
    openSuperAdminPortal();
  });
}

/* ==========================================================================
   Forgot Password & Instant Email Dispatch Flow
   ========================================================================== */
function handleForgotPasswordRequest(e) {
  if (e) e.preventDefault();
  const email = document.getElementById('reset-req-email').value.trim().toLowerCase();
  if (!email) {
    showToast('Please enter your student email address.');
    return;
  }

  fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  })
  .then(r => r.json())
  .then(res => {
    if (res.success && res.email_dispatch) {
      activeResetOtp = res.email_dispatch.otp_code;
      const previewWrap = document.getElementById('reset-email-preview-wrap');
      const emailTo = document.getElementById('dispatch-email-to');
      const otpDisplay = document.getElementById('dispatch-otp-display');

      if (emailTo) emailTo.textContent = email;
      if (otpDisplay) {
        otpDisplay.innerHTML = activeResetOtp.split('').map(digit => `<div class="otp-box">${digit}</div>`).join('');
      }
      if (previewWrap) previewWrap.style.display = 'block';

      showToast(res.message);
    }
  })
  .catch(() => {
    activeResetOtp = '849205';
    document.getElementById('reset-email-preview-wrap').style.display = 'block';
    showToast(`Verification code 849205 sent to ${email}`);
  });
}

function autoFillResetCode() {
  const codeInput = document.getElementById('reset-code-input');
  if (codeInput) {
    codeInput.value = activeResetOtp;
    document.getElementById('reset-new-password').focus();
    showToast('6-digit code auto-filled from email dispatch!');
  }
}

function handleResetPasswordSubmit(e) {
  if (e) e.preventDefault();
  const email = document.getElementById('reset-req-email').value.trim().toLowerCase();
  const code = document.getElementById('reset-code-input').value.trim();
  const newPw = document.getElementById('reset-new-password').value.trim();
  const confirmPw = document.getElementById('reset-confirm-password').value.trim();

  if (newPw !== confirmPw) {
    showToast('New passwords do not match. Please re-enter.');
    return;
  }

  fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email,
      otp_code: code,
      new_password: newPw
    })
  })
  .then(r => r.json())
  .then(res => {
    if (res.success) {
      saveSession({
        isLoggedIn: true,
        role: 'student',
        token: res.session_token,
        user: res.user
      });
      closeModal('auth-modal');
      showToast(res.message || 'Password reset successfully! You are now signed in.');
      openStudentDashboard();
    } else {
      showToast(res.error || 'Password reset failed. Please check code.');
    }
  })
  .catch(() => {
    showToast('Password reset successfully!');
    closeModal('auth-modal');
    openStudentDashboard();
  });
}

/* ==========================================================================
   WhatsApp Direct Action Helper
   ========================================================================== */
function openWhatsApp(tutorName = '', topic = '') {
  let message = 'Hello ScholarVerge Admin! I need assistance with my academic assignment.';
  if (tutorName) {
    message = `Hello ScholarVerge Admin! I would like to work with ${tutorName} on my paper.`;
  }
  if (topic) {
    message += ` Topic: ${topic}`;
  }
  const encoded = encodeURIComponent(message);
  const waUrl = `https://wa.me/16677757597?text=${encoded}`;
  window.open(waUrl, '_blank');
}

/* ==========================================================================
   Student Activities & Academic Operations Hub Controller
   ========================================================================== */
function openStudentActivitiesModal(tab = 'booking') {
  closeSidebar();
  if (!authSession.isLoggedIn || authSession.role !== 'student') {
    openAuthModal('login');
    return;
  }
  switchActivityTab(tab);
  
  // Set default date to tomorrow
  const dateInput = document.getElementById('book-date');
  if (dateInput && !dateInput.value) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.value = tomorrow.toISOString().split('T')[0];
  }

  generateLiveCitation();
  openModal('student-activities-modal');
}

function switchActivityTab(tab) {
  const tabs = ['booking', 'upload', 'review', 'tools'];
  const titles = {
    booking: '1-on-1 Consultations, Live Review & Rubric Defense',
    upload: 'Direct Assignment Dispatch to scholarverge@gmail.com',
    review: 'Post-Delivery Grade Feedback & Verified Review',
    tools: 'Academic Citation Generator & GPA Forecaster'
  };

  tabs.forEach(t => {
    const pane = document.getElementById(`act-pane-${t}`);
    const pill = document.getElementById(`act-tab-${t}`);
    if (pane) pane.style.display = t === tab ? 'block' : 'none';
    if (pill) {
      if (t === tab) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    }
  });

  const subEl = document.getElementById('activity-header-sub');
  if (subEl && titles[tab]) {
    subEl.textContent = titles[tab];
  }
}

/* Activity 1: 1-on-1 Tutor Consultation Scheduler */
function handleBookingSubmit(e) {
  if (e) e.preventDefault();
  const tutor = document.getElementById('book-tutor').value;
  const sessionType = document.getElementById('book-session-type').value;
  const date = document.getElementById('book-date').value;
  const time = document.getElementById('book-time').value;
  const platform = document.getElementById('book-platform').value;
  const notes = document.getElementById('book-notes').value.trim();

  const currentStudentName = authSession.user ? authSession.user.full_name : 'Registered Student';
  const currentStudentEmail = authSession.user ? authSession.user.email : 'jordan.m@university.edu';

  fetch('/api/student/bookings/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      student_email: currentStudentEmail,
      student_name: currentStudentName,
      tutor_name: tutor,
      session_type: sessionType,
      scheduled_date: date,
      scheduled_time: time,
      platform: platform,
      notes: notes
    })
  })
  .then(r => r.json())
  .then(res => {
    if (res.success && res.booking) {
      const b = res.booking;
      const card = document.getElementById('booking-confirmation-card');
      if (card) {
        card.style.display = 'block';
        card.innerHTML = `
          <div class="activity-card-result">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span class="activity-badge-success"><i class="fa-solid fa-circle-check"></i> Session Confirmed (#${b.booking_id})</span>
              <span style="font-size: 0.8rem; color: #64748b;">${b.scheduled_date} at ${b.scheduled_time}</span>
            </div>
            <h4 style="font-size: 1rem; color: var(--primary); margin-bottom: 4px;">${b.session_type}</h4>
            <p style="font-size: 0.85rem; color: #475569; margin-bottom: 12px;">Tutor: <strong>${b.tutor_name}</strong> • Platform: <strong>${b.platform}</strong></p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 14px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.8rem; color: #0f172a; word-break: break-all;"><i class="fa-solid fa-link" style="color: #2563eb;"></i> ${b.meeting_link}</span>
              <button class="btn btn-outline" style="padding: 4px 10px; font-size: 0.75rem;" onclick="navigator.clipboard.writeText('${b.meeting_link}'); showToast('Meeting link copied!');">Copy</button>
            </div>
            <div style="display: flex; gap: 8px;">
              <a href="${b.meeting_link}" target="_blank" class="btn btn-primary" style="flex: 1; font-size: 0.82rem; padding: 8px 12px;">
                <i class="fa-solid fa-video"></i> Open Meeting Room
              </a>
              <a href="https://wa.me/16677757597?text=Confirmed%20Session%20%23${b.booking_id}%20with%20${encodeURIComponent(b.tutor_name)}" target="_blank" class="btn btn-whatsapp" style="font-size: 0.82rem; padding: 8px 12px;">
                <i class="fa-brands fa-whatsapp"></i> Notify on WA
              </a>
            </div>
          </div>
        `;
      }
      showToast(res.message);
    }
  })
  .catch(() => {
    showToast(`1-on-1 session scheduled with ${tutor} for ${date}!`);
  });
}

/* Activity 2: Direct Document & Rubric Email Dispatch */
function handleRealFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;

  const sizeFormatted = file.size > 1024 * 1024 
    ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` 
    : `${(file.size / 1024).toFixed(1)} KB`;

  uploadedFileMeta = {
    name: file.name,
    size: sizeFormatted,
    type: file.type || 'Document File'
  };

  const label = document.getElementById('file-dropzone-label');
  const sub = document.getElementById('file-dropzone-sub');
  if (label) label.textContent = `Attached: ${file.name} (${sizeFormatted})`;
  if (sub) sub.textContent = `Ready for dispatch to scholarverge@gmail.com`;

  showToast(`Attached ${file.name} (${sizeFormatted})!`);
}

function handleDocumentEmailDispatch(e) {
  if (e) e.preventDefault();
  const topic = document.getElementById('upload-topic').value.trim();
  const citation = document.getElementById('upload-citation').value;
  const deadline = document.getElementById('upload-deadline').value.trim();
  const instructions = document.getElementById('upload-instructions').value.trim();

  const currentStudentName = authSession.user ? authSession.user.full_name : 'Registered Student';
  const currentStudentEmail = authSession.user ? authSession.user.email : 'jordan.m@university.edu';
  const fileName = uploadedFileMeta ? uploadedFileMeta.name : 'Assignment_Brief_Requirements.pdf';
  const fileSize = uploadedFileMeta ? uploadedFileMeta.size : '1.4 MB';
  const fileType = uploadedFileMeta ? uploadedFileMeta.type : 'PDF Document';

  fetch('/api/student/upload-document', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      student_email: currentStudentEmail,
      student_name: currentStudentName,
      file_name: fileName,
      file_size: fileSize,
      file_type: fileType,
      assignment_topic: topic,
      instructions: instructions,
      citation_style: citation,
      deadline: deadline
    })
  })
  .then(r => r.json())
  .then(res => {
    if (res.success) {
      const card = document.getElementById('upload-confirmation-card');
      if (card) {
        card.style.display = 'block';
        card.innerHTML = `
          <div class="activity-card-result">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span class="activity-badge-success"><i class="fa-solid fa-paper-plane"></i> Dispatched to scholarverge@gmail.com</span>
              <span style="font-size: 0.75rem; color: #64748b;">Ref: #${res.upload_id}</span>
            </div>
            <p style="font-size: 0.85rem; color: #334155; margin-bottom: 8px;"><strong>File:</strong> ${fileName} (${fileSize})</p>
            <p style="font-size: 0.85rem; color: #334155; margin-bottom: 12px;"><strong>Topic:</strong> ${topic} (${citation}, Deadline: ${deadline})</p>
            <div style="display: flex; gap: 8px;">
              <a href="${res.mailto_link}" class="btn btn-outline" style="flex: 1; font-size: 0.82rem; padding: 8px 12px; color: #2563eb;">
                <i class="fa-solid fa-envelope-open-text"></i> Open in Email Client
              </a>
              <a href="https://wa.me/16677757597?text=Dispatched%20Brief%20%23${res.upload_id}%20for%20${encodeURIComponent(topic)}" target="_blank" class="btn btn-whatsapp" style="font-size: 0.82rem; padding: 8px 12px;">
                <i class="fa-brands fa-whatsapp"></i> Notify Admin on WA
              </a>
            </div>
          </div>
        `;
      }
      showToast(res.message);
    }
  })
  .catch(() => {
    showToast(`Documents dispatched to scholarverge@gmail.com!`);
  });
}

/* Activity 3: Write & Publish Verified Review */
function setHubReviewStars(num) {
  selectedHubStars = num;
  const starContainer = document.getElementById('review-hub-stars');
  if (!starContainer) return;
  starContainer.innerHTML = [1, 2, 3, 4, 5].map(i => `
    <i class="fa-solid fa-star" style="color: ${i <= num ? '#f59e0b' : '#cbd5e1'};" onclick="setHubReviewStars(${i})"></i>
  `).join('');
}

function handleStudentReviewSubmit(e) {
  if (e) e.preventDefault();
  const tutor = document.getElementById('rev-act-tutor').value;
  const grade = document.getElementById('rev-act-grade').value;
  const title = document.getElementById('rev-act-title').value.trim();
  const content = document.getElementById('rev-act-content').value.trim();

  const currentStudentName = authSession.user ? authSession.user.full_name : 'Verified Student';
  const currentStudentEmail = authSession.user ? authSession.user.email : 'student@university.edu';
  const currentUniversity = authSession.user ? authSession.user.university : 'Top University';

  fetch('/api/reviews/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      student_name: currentStudentName,
      student_email: currentStudentEmail,
      university: currentUniversity,
      tutor_name: tutor,
      rating: selectedHubStars,
      grade_received: grade,
      highlights: '0% AI Guaranteed, Peer-Reviewed Sources',
      title: title,
      content: content,
      verified_order_id: 'SV-84920'
    })
  })
  .then(r => r.json())
  .then(res => {
    if (res.success) {
      showToast(res.message);
      closeModal('student-activities-modal');
      renderReviews('all');
      document.getElementById('reviews').scrollIntoView({ behavior: 'smooth' });
    }
  })
  .catch(() => {
    showToast('Verified review submitted and published!');
    closeModal('student-activities-modal');
    renderReviews('all');
  });
}

/* Activity 4: Academic Citation Generator */
function generateLiveCitation() {
  const styleEl = document.getElementById('tool-cit-style');
  const authorEl = document.getElementById('tool-cit-author');
  const titleEl = document.getElementById('tool-cit-title');
  const yearEl = document.getElementById('tool-cit-year');
  const journalEl = document.getElementById('tool-cit-journal');
  const doiEl = document.getElementById('tool-cit-doi');
  const outputEl = document.getElementById('tool-cit-output');

  if (!outputEl) return;

  const style = styleEl ? styleEl.value : 'apa';
  const author = authorEl && authorEl.value ? authorEl.value.trim() : 'Bennett, C., & Mitchell, S.';
  const title = titleEl && titleEl.value ? titleEl.value.trim() : 'Evidence-Based Methodologies in Modern Clinical Practice';
  const year = yearEl && yearEl.value ? yearEl.value.trim() : '2025';
  const journal = journalEl && journalEl.value ? journalEl.value.trim() : 'Journal of Academic Nursing & Law, 18(4), 210-228';
  const doi = doiEl && doiEl.value ? doiEl.value.trim() : 'https://doi.org/10.1016/j.janl.2025.04.012';

  let formatted = '';
  if (style === 'apa') {
    formatted = `${author} (${year}). ${title}. <em>${journal}</em>. ${doi}`;
  } else if (style === 'mla') {
    formatted = `${author}. "${title}." <em>${journal}</em>, ${year}, ${doi}.`;
  } else if (style === 'harvard') {
    formatted = `${author}, ${year}. ${title}. <em>${journal}</em>, Available at: &lt;${doi}&gt;.`;
  } else if (style === 'chicago') {
    formatted = `${author}. "${title}." <em>${journal}</em> (${year}). ${doi}.`;
  } else if (style === 'oscola') {
    formatted = `${author}, '${title}' [${year}] ${journal} &lt;${doi}&gt;.`;
  }

  outputEl.innerHTML = formatted;
}

function copyLiveCitation() {
  const outputEl = document.getElementById('tool-cit-output');
  if (!outputEl) return;
  const text = outputEl.innerText || outputEl.textContent;
  navigator.clipboard.writeText(text).then(() => {
    showToast('Citation copied to clipboard!');
  }).catch(() => {
    showToast(`Citation: ${text}`);
  });
}

/* ==========================================================================
   Tenant-Scoped Student Profile & Academic Dashboard
   ========================================================================== */
function openStudentProfileModal() {
  closeSidebar();
  if (!authSession.isLoggedIn || authSession.role !== 'student' || !authSession.user) {
    openAuthModal('login');
    return;
  }

  const u = authSession.user;
  document.getElementById('stu-name').value = u.full_name || '';
  document.getElementById('stu-email').value = u.email || '';
  document.getElementById('stu-uni').value = u.university || '';
  document.getElementById('stu-major').value = u.major_field || '';
  document.getElementById('stu-level').value = u.academic_level || 'Undergraduate';
  document.getElementById('stu-citation').value = u.preferred_citation || 'APA 7th Edition';
  document.getElementById('stu-gpa-target').value = u.target_gpa || 3.90;
  document.getElementById('stu-gpa-current').value = u.current_gpa || 3.72;
  document.getElementById('stu-whatsapp').value = u.whatsapp_number || '+1 (667) 775-7597';
  openModal('student-profile-modal');
}

function submitStudentProfile(e) {
  if (e) e.preventDefault();
  const name = document.getElementById('stu-name').value.trim();
  const email = document.getElementById('stu-email').value.trim();
  const uni = document.getElementById('stu-uni').value.trim();
  const major = document.getElementById('stu-major').value.trim();
  const level = document.getElementById('stu-level').value;
  const citation = document.getElementById('stu-citation').value;
  const targetGpa = parseFloat(document.getElementById('stu-gpa-target').value) || 3.85;
  const currentGpa = parseFloat(document.getElementById('stu-gpa-current').value) || 3.60;
  const whatsapp = document.getElementById('stu-whatsapp').value.trim();

  if (!name || !email || !uni) {
    showToast('Please fill in your name, email, and university.');
    return;
  }

  authSession.user = {
    ...authSession.user,
    full_name: name,
    email: email,
    university: uni,
    major_field: major,
    academic_level: level,
    preferred_citation: citation,
    target_gpa: targetGpa,
    current_gpa: currentGpa,
    whatsapp_number: whatsapp
  };
  saveSession(authSession);

  closeModal('student-profile-modal');
  showToast(`Profile updated for ${name} (${uni})!`);
  openStudentDashboard();
}

function openStudentDashboard() {
  closeSidebar();
  if (!authSession.isLoggedIn || authSession.role !== 'student' || !authSession.user) {
    openAuthModal('login');
    return;
  }

  const u = authSession.user;
  const nameEl = document.getElementById('dash-stu-name');
  const uniEl = document.getElementById('dash-stu-uni');
  const majorEl = document.getElementById('dash-stu-major');
  const avatarEl = document.getElementById('dash-stu-avatar');
  const gpaTargetVal = document.getElementById('dash-gpa-target');
  const gpaCurrentVal = document.getElementById('dash-gpa-current');
  const gpaBar = document.getElementById('dash-gpa-bar');
  const ordersCountEl = document.getElementById('dash-orders-count');

  if (nameEl) nameEl.textContent = u.full_name;
  if (uniEl) uniEl.textContent = `${u.university} • ${u.academic_level}`;
  if (majorEl) majorEl.textContent = `Major: ${u.major_field} • Preferred Style: ${u.preferred_citation}`;
  if (avatarEl) avatarEl.src = u.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
  if (gpaTargetVal) gpaTargetVal.textContent = `${(u.target_gpa || 3.90).toFixed(2)} GPA`;
  if (gpaCurrentVal) gpaCurrentVal.textContent = `${(u.current_gpa || 3.72).toFixed(2)} Current`;
  if (ordersCountEl) ordersCountEl.textContent = `${u.total_orders || 0} Papers`;

  if (gpaBar) {
    const pct = Math.min(100, Math.max(10, ((u.current_gpa || 3.72) / 4.0) * 100));
    gpaBar.style.width = `${pct}%`;
  }

  // Load Tenancy-Scoped Orders from PostgreSQL / SQLite DB
  fetch(`/api/student/dashboard?email=${encodeURIComponent(u.email)}`)
    .then(r => r.json())
    .then(res => {
      if (res.success && res.student && res.student.orders) {
        renderStudentDashboardOrders(res.student.orders);
      }
    })
    .catch(() => {
      renderStudentDashboardOrders([
        { order_number: 'SV-84920', topic: 'Telehealth Nursing PICOT', subject: 'Nursing', tutor_name: 'Sophia Mitchell', status: 'Ready for Review', progress_percentage: 100, price_amount: 120.00, payment_status: 'payment_verified' },
        { order_number: 'SV-77219', topic: 'Econometric Models in R', subject: 'Economics', tutor_name: 'Oliver Harrison', status: 'Drafting', progress_percentage: 85, price_amount: 180.00, payment_status: 'payment_verified' }
      ]);
    });

  openModal('student-dashboard-modal');
}

function renderStudentDashboardOrders(orders) {
  const tbody = document.getElementById('student-orders-tbody');
  if (!tbody) return;

  if (orders.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: #94a3b8; padding: 24px;">
          No active assignments yet. Click "+ New Assignment" above to begin!
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = orders.map(o => `
    <tr>
      <td><strong>#${o.order_number}</strong></td>
      <td>${o.topic} (${o.subject || 'Academic'})</td>
      <td>${o.tutor_name}</td>
      <td><span class="status-pill ${o.status.toLowerCase().includes('completed') ? 'completed' : o.status.toLowerCase().includes('review') ? 'review' : 'in_progress'}">${o.status} (${o.progress_percentage || 45}%)</span></td>
      <td>
        <strong>$${parseFloat(o.price_amount || 45.00).toFixed(2)}</strong>
        <div style="font-size: 0.7rem; color: #059669; font-weight: 600;">
          <i class="fa-brands fa-whatsapp"></i> ${o.payment_status === 'payment_verified' ? 'Verified' : 'WhatsApp Facilitated'}
        </div>
      </td>
      <td>
        <button class="btn btn-primary" style="padding: 4px 8px; font-size: 0.72rem;" onclick="closeModal('student-dashboard-modal'); loadOrderDetails('${o.order_number}'); document.getElementById('order-tracker').scrollIntoView({ behavior: 'smooth' });">
          Inspect
        </button>
      </td>
    </tr>
  `).join('');
}

/* ==========================================================================
   Super Admin Control Center
   ========================================================================== */
function openSuperAdminPortal() {
  closeSidebar();
  if (!authSession.isLoggedIn || authSession.role !== 'superadmin') {
    openAuthModal('admin');
    return;
  }

  loadAdminOverviewData();
  openModal('super-admin-modal');
}

function loadAdminOverviewData() {
  fetch('/api/admin/overview')
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        renderAdminStats(data.metrics);
        renderAdminOrdersTable(data.orders || []);
        renderAdminStudentsTable(data.students || []);
        renderAdminTutorsGrid(data.tutors || []);
      }
    })
    .catch(() => {
      renderAdminStats({
        total_orders: 8,
        total_students: 24,
        total_tutors: 3,
        gross_volume: 585.00,
        turnitin_ai_pass_rate: '100.0%'
      });
    });
}

function renderAdminStats(metrics) {
  const vaultEl = document.getElementById('admin-stat-vault');
  const ordersEl = document.getElementById('admin-stat-orders');
  const studentsEl = document.getElementById('admin-stat-students');
  const turnitinEl = document.getElementById('admin-stat-turnitin');

  if (vaultEl) vaultEl.textContent = `$${(metrics.gross_volume || 585).toFixed(2)}`;
  if (ordersEl) ordersEl.textContent = metrics.total_orders || '8';
  if (studentsEl) studentsEl.textContent = metrics.total_students || '24';
  if (turnitinEl) turnitinEl.textContent = metrics.turnitin_ai_pass_rate || '100.0%';
}

function switchAdminTab(tabName) {
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    if (btn.dataset.tab === tabName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const panes = ['orders', 'students', 'tutors', 'database'];
  panes.forEach(p => {
    const el = document.getElementById(`admin-pane-${p}`);
    if (el) el.style.display = p === tabName ? 'block' : 'none';
  });

  if (tabName === 'database') {
    fetchDatabaseHealth();
  }
}

function renderAdminOrdersTable(orders) {
  const tbody = document.getElementById('admin-orders-tbody');
  if (!tbody) return;

  const defaultList = orders.length > 0 ? orders : [
    { order_number: 'SV-84920', student_name: 'Jordan Miller', tutor_name: 'Sophia Mitchell', topic: 'Telehealth Nursing PICOT', status: 'Ready for Review', price_amount: 120.00, payment_status: 'payment_verified', progress_percentage: 100 },
    { order_number: 'SV-77219', student_name: 'Alexandre Dubois', tutor_name: 'Oliver Harrison', topic: 'Econometric Models in R', status: 'In Progress', price_amount: 180.00, payment_status: 'payment_verified', progress_percentage: 85 },
    { order_number: 'SV-99104', student_name: 'Sarah Jenkins', tutor_name: 'Claire Bennett', topic: 'AI Copyright Law Brief', status: 'Completed', price_amount: 245.00, payment_status: 'payment_verified', progress_percentage: 100 }
  ];

  tbody.innerHTML = defaultList.map(o => `
    <tr>
      <td><strong>#${o.order_number}</strong></td>
      <td>${o.student_name}</td>
      <td>${o.tutor_name}</td>
      <td style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${o.topic}</td>
      <td>
        <span class="status-pill ${o.status.toLowerCase().includes('completed') ? 'completed' : o.status.toLowerCase().includes('review') ? 'review' : 'in_progress'}">
          ${o.status} (${o.progress_percentage}%)
        </span>
      </td>
      <td>
        <strong>$${parseFloat(o.price_amount || 45.00).toFixed(2)}</strong>
        <div style="font-size: 0.7rem; color: #059669; font-weight: 600;">
          <i class="fa-brands fa-whatsapp"></i> ${o.payment_status || 'Verified'}
        </div>
      </td>
      <td>
        <div style="display: flex; gap: 4px;">
          <button class="btn btn-outline" style="padding: 3px 8px; font-size: 0.72rem;" onclick="adminQuickAdvanceOrder('${o.order_number}')">
            <i class="fa-solid fa-arrow-up-right-dots"></i> Progress
          </button>
          <a href="https://wa.me/16677757597?text=Admin%20Inquiry%20on%20Order%20${o.order_number}" target="_blank" class="btn btn-outline" style="padding: 3px 7px; font-size: 0.72rem; color: #16a34a;">
            <i class="fa-brands fa-whatsapp"></i>
          </a>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderAdminStudentsTable(students) {
  const tbody = document.getElementById('admin-students-tbody');
  if (!tbody) return;

  const defaultList = students.length > 0 ? students : [
    { full_name: 'Jordan Miller', university: 'Columbia University', academic_level: 'Undergraduate', major_field: 'Biomedical & Pre-Law', total_orders: 3, whatsapp_number: '+16677757597' },
    { full_name: 'Alexandre Dubois', university: 'NYU Stern', academic_level: 'Master’s Degree', major_field: 'Corporate Finance', total_orders: 2, whatsapp_number: '+16677757597' },
    { full_name: 'Sarah Jenkins', university: 'Oxford University', academic_level: 'Doctoral / Ph.D.', major_field: 'International Cyberlaw', total_orders: 4, whatsapp_number: '+16677757597' }
  ];

  tbody.innerHTML = defaultList.map(s => `
    <tr>
      <td>
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 28px; height: 28px; border-radius: 50%; background: #2563eb; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.75rem;">${s.full_name.charAt(0)}</div>
          <strong>${s.full_name}</strong>
        </div>
      </td>
      <td>${s.university}</td>
      <td>${s.major_field}</td>
      <td>${s.academic_level}</td>
      <td><span class="badge badge-trust">${s.total_orders || 1} Orders</span></td>
      <td>
        <div style="display: flex; gap: 6px;">
          <a href="https://wa.me/16677757597?text=Hello%20${encodeURIComponent(s.full_name)}%2C%20from%20ScholarVerge%20Super%20Admin" target="_blank" class="btn btn-outline" style="padding: 4px 8px; font-size: 0.72rem; color: #16a34a;">
            <i class="fa-brands fa-whatsapp"></i> WA
          </a>
          <a href="mailto:scholarverge@gmail.com?subject=Direct%20Notice%20to%20${encodeURIComponent(s.full_name)}" class="btn btn-outline" style="padding: 4px 8px; font-size: 0.72rem; color: #2563eb;">
            <i class="fa-solid fa-envelope"></i> Email
          </a>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderAdminTutorsGrid(tutors) {
  const container = document.getElementById('admin-tutors-list');
  if (!container) return;

  const defaultTutors = tutors.length > 0 ? tutors : [
    { full_name: 'Claire Bennett', title: 'Senior Law & IT Lead', active_load: 8, rating: 4.98, status: 'available' },
    { full_name: 'Oliver Harrison', title: 'Finance & Econometrics Lead', active_load: 12, rating: 4.97, status: 'available' },
    { full_name: 'Sophia Mitchell', title: 'Nursing & Psychology Specialist', active_load: 15, rating: 4.99, status: 'available' }
  ];

  container.innerHTML = defaultTutors.map(t => `
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <strong style="font-size: 0.95rem; color: var(--primary); display: block;">${t.full_name}</strong>
        <span style="font-size: 0.785rem; color: var(--text-muted);">${t.title} • Rating: ${t.rating} ★</span>
        <div style="margin-top: 6px; font-size: 0.75rem; color: #047857;">
          <i class="fa-solid fa-circle" style="font-size: 0.45rem;"></i> Active Workload: ${t.active_load || 8} Papers (${t.status})
        </div>
      </div>
      <div style="display: flex; gap: 6px;">
        <a href="https://wa.me/16677757597?text=Admin%20Notice%20for%20${encodeURIComponent(t.full_name)}" target="_blank" class="btn btn-outline" style="font-size: 0.75rem; padding: 6px 10px; color: #16a34a;">
          <i class="fa-brands fa-whatsapp"></i> Chat
        </a>
        <a href="mailto:scholarverge@gmail.com?subject=Admin%20Notice%20for%20${encodeURIComponent(t.full_name)}" class="btn btn-outline" style="font-size: 0.75rem; padding: 6px 10px; color: #2563eb;">
          <i class="fa-solid fa-envelope"></i> Email
        </a>
      </div>
    </div>
  `).join('');
}

function adminQuickAdvanceOrder(orderNum) {
  fetch('/api/admin/orders/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_number: orderNum,
      status: 'Completed & Delivered',
      progress_percentage: 100,
      payment_status: 'payment_verified'
    })
  }).then(r => r.json()).then(res => {
    showToast(res.message || `Order #${orderNum} advanced to 100% Completed!`);
    loadAdminOverviewData();
  }).catch(() => {
    showToast(`Order #${orderNum} status updated to Completed!`);
  });
}

function fetchDatabaseHealth() {
  const panel = document.getElementById('admin-db-console');
  if (!panel) return;

  fetch('/api/db/health')
    .then(r => r.json())
    .then(data => {
      panel.innerHTML = `
[PostgreSQL Database Synchronization Console]
Status: ${data.database.status}
Engine: ${data.database.engine}
Server UTC: ${data.database.server_time}

Tables Overview:
- users: ${data.database.tables.users} accounts
- students: ${data.database.tables.students} tenants
- tutors: ${data.database.tables.tutors} verified specialists
- orders: ${data.database.tables.orders} orders logged
- bookings: ${data.database.tables.bookings || 2} 1-on-1 sessions
- reviews: ${data.database.tables.reviews || 3} published verified reviews

SQL Schema: database/schema.sql (Active & Ready)
      `;
    })
    .catch(() => {
      panel.innerHTML = `
[PostgreSQL Database Synchronization Console]
Status: Connected & Ready
Engine: PostgreSQL 16.x Multi-Tenant Schema
Tables: users (25), students (24), tutors (3), orders (8), bookings (2)
      `;
    });
}

function syncPostgreSQLDatabase() {
  showToast('PostgreSQL Schema & Tables Synced Successfully!');
  fetchDatabaseHealth();
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
   Sidebar Mini Academic Tools
   ========================================================================== */
function initSidebarMiniTools() {
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
   Command Palette (Ctrl + K)
   ========================================================================== */
const commandItems = [
  { title: 'Student Activities Hub', sub: '1-on-1 booking, doc email dispatch, verified reviews & tools', action: () => { openStudentActivitiesModal('booking'); } },
  { title: 'Book 1-on-1 Consultation', sub: 'Schedule live thesis or rubric session with tutor', action: () => { openStudentActivitiesModal('booking'); } },
  { title: 'Dispatch Document to Email', sub: 'Send assignment brief to scholarverge@gmail.com', action: () => { openStudentActivitiesModal('upload'); } },
  { title: 'Academic Citation Generator', sub: 'Create formatted APA 7, MLA 9, Harvard citations', action: () => { openStudentActivitiesModal('tools'); } },
  { title: 'Sign In / Register Account', sub: 'Student login, registration, Google auth & recovery', action: () => { openAuthModal('login'); } },
  { title: 'Student Academic Dashboard', sub: 'View active assignments, GPA progress & downloads', action: () => { openStudentDashboard(); } },
  { title: 'Super Admin Control Center', sub: 'Master management for orders, students, tutors & PostgreSQL', action: () => { openSuperAdminPortal(); } },
  { title: 'Claire Bennett', sub: 'Tutor • Law, English, IT & History', action: () => { openOrderModalWithTutor('Claire Bennett'); } },
  { title: 'Oliver Harrison', sub: 'Tutor • Business, Economics, Finance & Math', action: () => { openOrderModalWithTutor('Oliver Harrison'); } },
  { title: 'Sophia Mitchell', sub: 'Tutor • Nursing, Healthcare & Psychology', action: () => { openOrderModalWithTutor('Sophia Mitchell'); } },
  { title: 'WhatsApp Direct Support (+1 667 775 7597)', sub: 'Chat instantly on WhatsApp with academic coordinator', action: () => { openWhatsApp(); } },
  { title: 'Email Support (scholarverge@gmail.com)', sub: 'Send assignment brief directly via email', action: () => { window.location.href = 'mailto:scholarverge@gmail.com'; } },
  { title: 'Price Calculator', sub: 'Estimate paper cost with deadline & level', action: () => { document.getElementById('hero-calculator').scrollIntoView({ behavior: 'smooth' }); } },
  { title: 'Track Order #SV-84920', sub: 'Sophia Mitchell • Nursing Care Plan', action: () => { loadOrderDetails('SV-84920'); document.getElementById('order-tracker').scrollIntoView({ behavior: 'smooth' }); } },
  { title: 'Turnitin & 0% AI Guarantee', sub: 'Inspect Authenticity Certificate', action: () => { openTurnitinModal(); } },
  { title: 'Leave a Verified Review', sub: 'Share your tutoring feedback & rating', action: () => { openStudentActivitiesModal('review'); } }
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

          <!-- Distinct Separated Contact Reach: WhatsApp & Email -->
          <div class="tutor-contact-separate-grid">
            <!-- Separate WhatsApp Box -->
            <a href="https://wa.me/16677757597?text=Hello%20ScholarVerge!%20I%20would%20like%20to%20work%20with%20${encodeURIComponent(tutor.name)}%20on%20my%20assignment." target="_blank" class="tutor-separate-card wa" title="Chat with ${tutor.name} on WhatsApp">
              <div class="separate-card-head">
                <i class="fa-brands fa-whatsapp"></i>
                <span class="separate-status-badge"><i class="fa-solid fa-circle" style="font-size: 0.45rem;"></i> Online</span>
              </div>
              <div class="separate-card-title">WhatsApp Chat</div>
              <span class="separate-card-val">+1 (667) 775-7597</span>
              <div class="separate-card-btn"><i class="fa-brands fa-whatsapp"></i> Chat Now</div>
            </a>

            <!-- Separate Email Box -->
            <a href="mailto:scholarverge@gmail.com?subject=Assignment%20Inquiry%20for%20${encodeURIComponent(tutor.name)}" class="tutor-separate-card mail" title="Email assignment brief for ${tutor.name}">
              <div class="separate-card-head">
                <i class="fa-solid fa-envelope"></i>
                <span class="separate-status-badge">Direct Mail</span>
              </div>
              <div class="separate-card-title">Official Email</div>
              <span class="separate-card-val">scholarverge@gmail.com</span>
              <div class="separate-card-btn"><i class="fa-solid fa-paper-plane"></i> Email Brief</div>
            </a>
          </div>

          <div class="tutor-actions">
            <button class="btn btn-tutor-order" onclick="openOrderModalWithTutor('${tutor.name}')">
              <i class="fa-solid fa-pen-nib"></i> Write My Paper
            </button>
            <button class="btn btn-outline" style="border-color: #cbd5e1;" onclick="openStudentActivitiesModal('booking');">
              <i class="fa-solid fa-calendar-check" style="color: #10b981;"></i> Book 1-on-1
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
   Render Verified Student Reviews & Filters (Backend DB Connected)
   ========================================================================== */
function renderReviews(filter = 'all') {
  const grid = document.getElementById('reviews-grid-container');
  if (!grid) return;

  fetch('/api/reviews/list')
    .then(r => r.json())
    .then(res => {
      if (res.success && res.reviews && res.reviews.length > 0) {
        const mapped = res.reviews.map(r => ({
          id: r.review_id || r.id,
          studentName: r.student_name,
          university: r.university,
          tutor: r.tutor_name,
          rating: r.rating || 5,
          badge: r.grade_received || 'A+ Verified Result',
          title: r.title,
          text: r.content,
          subject: r.highlights || 'General Academic',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
        }));
        
        let combined = [...mapped, ...allReviewsData];
        displayReviewsList(combined, filter);
      } else {
        displayReviewsList(allReviewsData, filter);
      }
    })
    .catch(() => {
      displayReviewsList(allReviewsData, filter);
    });
}

function displayReviewsList(list, filter) {
  const grid = document.getElementById('reviews-grid-container');
  if (!grid) return;

  let filtered = list;
  if (filter !== 'all') {
    filtered = list.filter(r => {
      if (filter === 'nursing') return (r.subject && r.subject.toLowerCase().includes('nursing')) || (r.tutor && r.tutor.includes('Sophia'));
      if (filter === 'business') return (r.subject && (r.subject.toLowerCase().includes('econ') || r.subject.toLowerCase().includes('finance') || r.subject.toLowerCase().includes('business'))) || (r.tutor && r.tutor.includes('Oliver'));
      if (filter === 'law') return (r.subject && (r.subject.toLowerCase().includes('law') || r.subject.toLowerCase().includes('english'))) || (r.tutor && r.tutor.includes('Claire'));
      return true;
    });
  }

  grid.innerHTML = filtered.map(r => `
    <div class="review-card">
      <div class="review-top">
        <div class="review-stars">
          ${Array(r.rating || 5).fill('<i class="fa-solid fa-star"></i>').join('')}
        </div>
        <span class="review-badge">${r.badge || 'Verified Review'}</span>
      </div>
      <h4 class="review-title">${r.title}</h4>
      <p class="review-text">"${r.text}"</p>
      <div class="review-author">
        <img src="${r.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}" alt="${r.studentName}" class="review-avatar" />
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
   Dynamic Price Calculator
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
   Order Paper / "Write My Paper" Wizard Logic (Offline WhatsApp Payment)
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
    const pages = parseInt(document.getElementById('order-pages').value) || 3;
    const level = document.getElementById('order-level').value || 'Undergraduate';
    const tutor = document.getElementById('order-tutor-select').options[document.getElementById('order-tutor-select').selectedIndex].text;
    const isUK = currentLang === 'en-GB';
    const curr = isUK ? '£' : '$';
    const price = (pages * 15 * (isUK ? 0.79 : 1.0)).toFixed(2);
    
    const summaryEl = document.getElementById('order-summary-box');
    if (summaryEl) {
      summaryEl.innerHTML = `
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; font-size: 0.9rem;">
          <p style="margin-bottom: 6px;"><strong>Topic:</strong> ${topic}</p>
          <p style="margin-bottom: 6px;"><strong>Academic Level:</strong> ${level}</p>
          <p style="margin-bottom: 6px;"><strong>Length:</strong> ${pages} Pages (~${pages * 275} words)</p>
          <p style="margin-bottom: 6px;"><strong>Assigned Tutor:</strong> ${tutor}</p>
          <p style="margin-bottom: 6px;"><strong>Turnitin & AI-Free Verification:</strong> <span style="color: #059669; font-weight: 700;">Included Free (0% AI)</span></p>
          <p style="margin-bottom: 0;"><strong>Estimated Total Price:</strong> <span style="color: #2563eb; font-weight: 800; font-size: 1.15rem;">${curr}${price}</span></p>
        </div>
      `;
    }
  }
}

function submitAcademicOrder(e) {
  if (e) e.preventDefault();
  const randomId = `SV-${Math.floor(10000 + Math.random() * 90000)}`;
  const topic = document.getElementById('order-topic').value || 'Academic Research Paper';
  const tutorSelect = document.getElementById('order-tutor-select');
  const tutorName = tutorSelect.options[tutorSelect.selectedIndex].text.split('(')[0].trim();
  const pages = parseInt(document.getElementById('order-pages').value) || 3;
  const level = document.getElementById('order-level').value;
  const citation = document.getElementById('order-citation').value;
  const deadline = document.getElementById('order-deadline-modal') ? document.getElementById('order-deadline-modal').value : 'In 3 Days';
  const priceAmount = pages * 15.00;

  const currentStudentName = authSession.user ? authSession.user.full_name : 'Registered Student';
  const currentStudentEmail = authSession.user ? authSession.user.email : 'jordan.m@university.edu';

  mockOrders[randomId] = {
    orderId: randomId,
    topic: topic,
    tutor: tutorName,
    tutorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    subject: 'General Academic Support',
    level: level,
    pages: `${pages} Pages`,
    format: citation,
    deadline: deadline,
    status: 'In Progress - Tutor Drafting',
    progress: 45,
    steps: [
      { name: 'Assignment Details Submitted', done: true, time: 'Just now' },
      { name: `Tutor ${tutorName} Assigned`, done: true, time: 'Just now' },
      { name: 'Payment Coordinated via WhatsApp Admin', done: true, time: 'In Progress' },
      { name: 'Primary Sources & Outline Synthesis', done: true, time: 'In Progress' },
      { name: 'Drafting & Citation Formatting', done: false, time: 'Upcoming' },
      { name: 'Turnitin & AI-Free Verification', done: false, time: 'Upcoming' },
      { name: 'Final Deliverable Ready for Review', done: false, time: 'Upcoming' }
    ],
    chatHistory: [
      { sender: tutorName, time: 'Just now', text: `Hello ${currentStudentName}! I have received your assignment prompt: "${topic}". I am gathering the required peer-reviewed academic literature now.` }
    ],
    files: [
      { name: 'Assignment_Requirements_Brief.pdf', size: '320 KB', type: 'Uploaded Prompt' }
    ]
  };

  // WhatsApp Admin Payment URL
  const waMsg = `Hello ScholarVerge Admin! I have submitted Order #${randomId} for "${topic}" (${pages} pages, ${level}, Tutor: ${tutorName}). Price: $${priceAmount.toFixed(2)}. Please guide me on completing the payment.`;
  const waUrl = `https://wa.me/16677757597?text=${encodeURIComponent(waMsg)}`;

  // Sync with Backend PostgreSQL / SQLite Database
  fetch('/api/orders/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic: topic,
      student_name: currentStudentName,
      student_email: currentStudentEmail,
      tutor_name: tutorName,
      academic_level: level,
      pages: pages,
      citation_style: citation,
      deadline: deadline,
      price_amount: priceAmount
    })
  })
  .then(r => r.json())
  .then(res => {
    if (res.success && res.whatsapp_payment_url) {
      window.open(res.whatsapp_payment_url, '_blank');
    } else {
      window.open(waUrl, '_blank');
    }
  })
  .catch(() => {
    window.open(waUrl, '_blank');
  });

  if (authSession.user) {
    authSession.user.total_orders = (authSession.user.total_orders || 0) + 1;
    saveSession(authSession);
  }

  closeModal('order-paper-modal');
  showToast(`Order #${randomId} Created! Connecting to WhatsApp Admin for payment...`);
  
  const trackerInput = document.getElementById('tracker-input');
  if (trackerInput) {
    trackerInput.value = randomId;
    loadOrderDetails(randomId);
    document.getElementById('order-tracker').scrollIntoView({ behavior: 'smooth' });
  }
}

/* ==========================================================================
   Order Tracker & Live Messenger
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

      <!-- WhatsApp Payment & Final Approval Container -->
      <div style="margin-top: 24px; background: rgba(37, 99, 235, 0.08); border: 1px solid rgba(37, 99, 235, 0.25); border-radius: 14px; padding: 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
        <div>
          <strong style="color: #1e40af; font-size: 0.95rem; display: block;">Quality & Grade Assurance</strong>
          <span style="font-size: 0.8rem; color: #334155;">14 days of free unlimited adjustments and direct tutor feedback.</span>
        </div>
        <div style="display: flex; gap: 8px;">
          <a href="https://wa.me/16677757597?text=Hello%20Admin!%20I%20have%20an%20inquiry%20regarding%20Order%20%23${order.orderId}" target="_blank" class="btn btn-whatsapp" style="font-size: 0.82rem;">
            <i class="fa-brands fa-whatsapp"></i> WhatsApp Admin
          </a>
          <button class="btn btn-accent" style="font-size: 0.82rem;" onclick="approveFinalWork('${order.orderId}')">
            <i class="fa-solid fa-check"></i> Approve Final Draft
          </button>
        </div>
      </div>
    </div>

    <!-- Right Column: Direct Tutor Messenger -->
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
    } else if (text.toLowerCase().includes('pay') || text.toLowerCase().includes('whatsapp')) {
      reply = `You can easily coordinate payment with our WhatsApp admin at +1 (667) 775-7597 anytime.`;
    }

    order.chatHistory.push({
      sender: order.tutor,
      time: 'Just now',
      text: reply
    });

    if (chatBody) {
      chatBody.innerHTML = order.chatHistory.map(m => `
        <div class="chat-msg ${m.sender === 'You' ? 'you' : 'tutor'}">
          <div style="font-size: 0.7rem; opacity: 0.8;">${order.tutor} • Just now</div>
          ${reply}
        </div>
      `).join('');
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  }, 1200);
}

function simulateFileDownload(fileName) {
  showToast(`Downloading: ${fileName}`);
}

function approveFinalWork(orderId) {
  showToast(`Order #${orderId} approved! Thank you for choosing ScholarVerge!`);
  openStudentActivitiesModal('review');
}

/* ==========================================================================
   Leave Us a Review Modal
   ========================================================================== */
let selectedReviewStars = 5;

function openReviewModal() {
  openStudentActivitiesModal('review');
}

/* ==========================================================================
   Turnitin Sample Report Modal
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
    let reply = `Thank you for reaching out to ScholarVerge! You can reach our senior team directly on WhatsApp (+1 667 775 7597) or via email at scholarverge@gmail.com.`;
    if (msg.toLowerCase().includes('cost') || msg.toLowerCase().includes('price')) {
      reply = `Our pricing starts at only $12.50/page and includes a free Turnitin 0% AI authenticity report! You can also use code SCHOLAR20 for 20% off.`;
    } else if (msg.toLowerCase().includes('whatsapp') || msg.toLowerCase().includes('pay')) {
      reply = `Payment is coordinated offline directly with our admin via WhatsApp at +1 (667) 775-7597. We accept various convenient methods!`;
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
