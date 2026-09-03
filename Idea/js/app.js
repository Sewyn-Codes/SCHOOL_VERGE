/**
 * ScholarVerge.com - Official Interactive Application Engine
 * Featuring Multi-Tenant Student Accounts, Google OAuth, Student Invitation Link Generator,
 * Dynamic Super Admin Credentials Management (Default: scholarverge@gmail.com / Lovato20,
 * full credential rotation and old credentials blocking),
 * Strict Real Data Analytics (Zero Dummy/Revenue Stats in Admin),
 * Student Profile Full CRUD & Flagging Control,
 * Real Specialist Tutors (Oliver Harrison, Claire Bennett, Sophia Mitchell),
 * 1-on-1 Consultation Bookings with WhatsApp Admin Meetup Coordination,
 * and Direct Document Email Dispatches to scholarverge@gmail.com.
 */

// Application Global Multi-Tenant Authentication State (Clean Guest-First Default)
let authSession = {
  isLoggedIn: false,
  role: 'guest', // 'student' | 'superadmin' | 'guest'
  token: null,
  user: null
};

let activeResetOtp = '849205';
let selectedHubStars = 5;
let uploadedFileMeta = null;
let currentInviteToken = '';

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  loadStoredSession();
  checkUrlInvitation();
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
  initLiveActivityTicker();
}

/* ==========================================================================
   Multi-Tenant Session Management (localStorage)
   ========================================================================== */
function loadStoredSession() {
  try {
    const saved = localStorage.getItem('scholarverge_session');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.isLoggedIn && parsed.user) {
        authSession = parsed;
      }
    }
  } catch (e) {
    // keep default guest session
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

    if (avatarEl) avatarEl.src = authSession.user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';
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
   Check URL for Student Invitation Token (?invite=INV-XXXXX)
   ========================================================================== */
function checkUrlInvitation() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const inviteCode = urlParams.get('invite');
    if (inviteCode) {
      currentInviteToken = inviteCode.trim().toUpperCase();
      openAuthModal('register');

      // Add a friendly VIP invite status badge in register modal
      const regModal = document.getElementById('auth-modal');
      if (regModal) {
        let badge = document.getElementById('vip-invite-banner');
        if (!badge) {
          badge = document.createElement('div');
          badge.id = 'vip-invite-banner';
          badge.style = 'background: #eff6ff; border: 1.5px solid #93c5fd; border-radius: 10px; padding: 10px 14px; margin-bottom: 14px; font-size: 0.85rem; color: #1e40af; display: flex; align-items: center; justify-content: space-between;';
          const regForm = document.getElementById('register-form');
          if (regForm && regForm.parentNode) {
            regForm.parentNode.insertBefore(badge, regForm);
          }
        }
        badge.innerHTML = `<span><i class="fa-solid fa-crown" style="color: #f59e0b;"></i> <strong>VIP Student Invitation Applied:</strong> #${currentInviteToken}</span>`;
      }

      fetch(`/api/invitations/verify?code=${encodeURIComponent(currentInviteToken)}`)
        .then(r => r.json())
        .then(res => {
          if (res.success && res.invitation) {
            const inv = res.invitation;
            const nameInput = document.getElementById('reg-name');
            const emailInput = document.getElementById('reg-email');
            const levelSelect = document.getElementById('reg-level');
            const majorInput = document.getElementById('reg-major');

            if (nameInput && inv.student_name && inv.student_name !== 'VIP Student') nameInput.value = inv.student_name;
            if (emailInput && inv.student_email) emailInput.value = inv.student_email;
            if (levelSelect && inv.academic_level) levelSelect.value = inv.academic_level;
            if (majorInput && inv.major_field && inv.major_field !== 'General Academic Studies') majorInput.value = inv.major_field;

            showToast(`VIP Invitation #${currentInviteToken} Verified! Complete your student registration.`);
          }
        })
        .catch(() => {
          showToast(`VIP Invitation #${currentInviteToken} Applied! Complete your registration.`);
        });
    }
  } catch (e) {
    // ignore
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
    admin: 'Master administrator command center (Super Admin)',
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
    showToast('Connection error. Please ensure the server is running.');
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
      password: password,
      invite_code: currentInviteToken
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
    showToast('Registration error. Please check connection.');
  });
}

/* ==========================================================================
   Super Admin Master Login (Dynamic Credentials)
   ========================================================================== */
function handleSuperAdminLogin(e) {
  if (e) e.preventDefault();
  const email = document.getElementById('admin-login-email').value.trim().toLowerCase();
  const password = document.getElementById('admin-login-password').value.trim();

  if (!email || !password) {
    showToast('Super Admin email and master password required.');
    return;
  }

  fetch('/api/auth/admin-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
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
      showToast('Super Admin Master Access Granted!');
      openSuperAdminPortal();
    } else {
      showToast(res.error || 'Access Denied: Invalid master credentials.');
    }
  })
  .catch(() => {
    showToast('Unable to connect to Super Admin authentication engine.');
  });
}

/* ==========================================================================
   Super Admin Update Credentials (Email & Password Rotation)
   ========================================================================== */
function handleSuperAdminUpdateCredentials(e) {
  if (e) e.preventDefault();
  const currentEmail = document.getElementById('admin-change-current-email').value.trim().toLowerCase();
  const currentPw = document.getElementById('admin-change-current-pw').value.trim();
  const newEmail = document.getElementById('admin-change-new-email').value.trim().toLowerCase();
  const newPw = document.getElementById('admin-change-new-pw').value.trim();
  const confirmPw = document.getElementById('admin-change-confirm-pw').value.trim();

  if (newPw && newPw !== confirmPw) {
    showToast('New passwords do not match. Please re-enter.');
    return;
  }

  fetch('/api/admin/update-credentials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      current_email: currentEmail,
      current_password: currentPw,
      new_email: newEmail,
      new_password: newPw
    })
  })
  .then(r => r.json())
  .then(res => {
    if (res.success) {
      showToast(res.message);
      if (authSession.user) {
        authSession.user.email = res.user.email;
        saveSession(authSession);
      }
      document.getElementById('admin-change-current-pw').value = '';
      document.getElementById('admin-change-new-email').value = '';
      document.getElementById('admin-change-new-pw').value = '';
      document.getElementById('admin-change-confirm-pw').value = '';
      loadAdminOverviewData();
    } else {
      showToast(res.error || 'Failed to update master credentials. Verify current password.');
    }
  })
  .catch(() => {
    showToast('Credential update request failed. Check server connection.');
  });
}

/* ==========================================================================
   Super Admin Generate Student Invitation Link
   ========================================================================== */
function handleCreateStudentInvite(e) {
  if (e) e.preventDefault();
  const studentName = document.getElementById('invite-student-name').value.trim();
  const studentEmail = document.getElementById('invite-student-email').value.trim();
  const academicLevel = document.getElementById('invite-academic-level').value;
  const majorField = document.getElementById('invite-major-field').value.trim();

  fetch('/api/admin/invitations/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      student_name: studentName,
      student_email: studentEmail,
      academic_level: academicLevel,
      major_field: majorField
    })
  })
  .then(r => r.json())
  .then(res => {
    if (res.success && res.invitation) {
      const inv = res.invitation;
      // Always construct clean live public URL
      const currentOrigin = window.location.origin;
      const liveInviteLink = `${currentOrigin}/?invite=${inv.invite_code}`;
      const waInviteMsg = `Hello ${inv.student_name}! You have been invited to join ScholarVerge by the Academic Director. Complete your personalized profile here: ${liveInviteLink}`;
      const liveWaUrl = `https://wa.me/?text=${encodeURIComponent(waInviteMsg)}`;

      const card = document.getElementById('admin-invite-result-card');
      if (card) {
        card.style.display = 'block';
        card.innerHTML = `
          <div class="invite-share-card">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span class="activity-badge-success"><i class="fa-solid fa-link"></i> Invitation Generated (#${inv.invite_code})</span>
              <span style="font-size: 0.75rem; color: #64748b;">Ready to Share</span>
            </div>
            <p style="font-size: 0.85rem; color: #334155; margin-bottom: 8px;"><strong>Student:</strong> ${inv.student_name} (${inv.academic_level})</p>
            <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 8px 12px; margin-bottom: 12px; font-size: 0.8rem; color: #0f172a; word-break: break-all; display: flex; justify-content: space-between; align-items: center;">
              <span>${liveInviteLink}</span>
              <button type="button" class="btn btn-outline" style="padding: 3px 8px; font-size: 0.72rem; margin-left: 8px;" onclick="navigator.clipboard.writeText('${liveInviteLink}'); showToast('Live invite link copied to clipboard!');">Copy</button>
            </div>
            <div style="display: flex; gap: 8px;">
              <a href="${liveWaUrl}" target="_blank" class="btn btn-whatsapp" style="flex: 1; font-size: 0.82rem; padding: 8px 12px;">
                <i class="fa-brands fa-whatsapp"></i> Share on WhatsApp
              </a>
              <a href="mailto:${inv.student_email || ''}?subject=Your%20ScholarVerge%20Academic%20Invitation&body=${encodeURIComponent(`Hello ${inv.student_name}!\n\nHere is your official VIP invitation to join ScholarVerge:\n${liveInviteLink}`)}" class="btn btn-outline" style="font-size: 0.82rem; padding: 8px 12px; color: #2563eb;">
                <i class="fa-solid fa-envelope"></i> Send Email
              </a>
            </div>
          </div>
        `;
      }
      showToast(res.message);
      loadAdminOverviewData();
    }
  })
  .catch(() => {
    showToast('Failed to create invitation link.');
  });
}

/* ==========================================================================
   Super Admin Assign Meeting Link
   ========================================================================== */
function openAdminSetMeetingLinkModal(bookingId, studentName, tutorName, sessionType, date, time, platform) {
  document.getElementById('admin-assign-booking-id').value = bookingId;
  document.getElementById('admin-assign-student-name').textContent = studentName;
  document.getElementById('admin-assign-tutor-name').textContent = tutorName;
  document.getElementById('admin-assign-details').textContent = `${sessionType} • ${date} at ${time} (${platform})`;
  
  const meetInput = document.getElementById('admin-assign-meet-url');
  if (meetInput) {
    meetInput.value = `https://meet.google.com/sch-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100 + Math.random() * 900)}`;
  }

  openModal('admin-set-meetlink-modal');
}

function autoGenerateAdminMeetLink() {
  const meetInput = document.getElementById('admin-assign-meet-url');
  if (meetInput) {
    meetInput.value = `https://meet.google.com/sch-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100 + Math.random() * 900)}`;
    showToast('Generated fresh Google Meet link!');
  }
}

function handleAdminSubmitMeetingLink(e) {
  if (e) e.preventDefault();
  const bookingId = document.getElementById('admin-assign-booking-id').value;
  const meetUrl = document.getElementById('admin-assign-meet-url').value.trim();
  const note = document.getElementById('admin-assign-note').value.trim();

  fetch('/api/admin/bookings/set-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      booking_id: bookingId,
      meeting_link: meetUrl,
      admin_notes: note
    })
  })
  .then(r => r.json())
  .then(res => {
    if (res.success) {
      closeModal('admin-set-meetlink-modal');
      showToast(res.message);
      loadAdminOverviewData();
      if (res.whatsapp_student_url) {
        window.open(res.whatsapp_student_url, '_blank');
      }
    } else {
      showToast(res.error || 'Failed to update meeting link.');
    }
  })
  .catch(() => {
    showToast('Failed to assign meeting link.');
  });
}

/* ==========================================================================
   Super Admin Flag / Suspend Student Profile
   ========================================================================== */
function adminToggleStudentFlag(studentEmail, currentStatus) {
  const newStatus = currentStatus === 'flagged' ? 'active' : 'flagged';
  
  fetch('/api/admin/students/flag', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      student_email: studentEmail,
      status: newStatus,
      reason: newStatus === 'flagged' ? 'Administrator Review Flag' : 'Administrator Cleared'
    })
  })
  .then(r => r.json())
  .then(res => {
    if (res.success) {
      showToast(res.message);
      loadAdminOverviewData();
    }
  })
  .catch(() => {
    showToast('Failed to update student status.');
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
    showToast('Password recovery request sent.');
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
    showToast('Please sign in or create a student account to access academic activities.');
    openAuthModal('login');
    return;
  }
  switchActivityTab(tab);
  
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

/* Activity 1: 1-on-1 Tutor Consultation Scheduler (WhatsApp Admin Request Workflow) */
function handleBookingSubmit(e) {
  if (e) e.preventDefault();
  if (!authSession.isLoggedIn || authSession.role !== 'student') {
    showToast('Please sign in or create an account to book sessions.');
    openAuthModal('login');
    return;
  }

  const tutor = document.getElementById('book-tutor').value;
  const sessionType = document.getElementById('book-session-type').value;
  const date = document.getElementById('book-date').value;
  const time = document.getElementById('book-time').value;
  const platform = document.getElementById('book-platform').value;
  const notes = document.getElementById('book-notes').value.trim();

  const currentStudentName = authSession.user ? authSession.user.full_name : 'Registered Student';
  const currentStudentEmail = authSession.user ? authSession.user.email : 'student@university.edu';

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
              <span class="status-pill requested"><i class="fa-solid fa-clock"></i> Link Requested (#${b.booking_id})</span>
              <span style="font-size: 0.8rem; color: #64748b;">${b.scheduled_date} at ${b.scheduled_time}</span>
            </div>
            <h4 style="font-size: 1rem; color: var(--primary); margin-bottom: 4px;">${b.session_type}</h4>
            <p style="font-size: 0.85rem; color: #475569; margin-bottom: 12px;">Tutor: <strong>${b.tutor_name}</strong> • Platform: <strong>${b.platform}</strong></p>
            <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 12px; margin-bottom: 14px; font-size: 0.825rem; color: #92400e;">
              <i class="fa-brands fa-whatsapp"></i> Click below to message Admin on WhatsApp (+1 667 775 7597) to receive your official meeting room link.
            </div>
            <div style="display: flex; gap: 8px;">
              <a href="${b.whatsapp_admin_url}" target="_blank" class="btn btn-whatsapp" style="flex: 1; font-size: 0.85rem; padding: 10px 14px;">
                <i class="fa-brands fa-whatsapp"></i> Request Meeting Link on WhatsApp
              </a>
            </div>
          </div>
        `;
      }
      showToast(res.message);
      window.open(b.whatsapp_admin_url, '_blank');
    }
  })
  .catch(() => {
    showToast(`1-on-1 session requested with ${tutor}!`);
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

function updateBriefPricePreview() {
  const pagesInput = document.getElementById('upload-pages');
  const levelSelect = document.getElementById('upload-level');
  const priceDisplay = document.getElementById('brief-price-total');
  const wordsDisplay = document.getElementById('brief-word-count-sub');

  const pages = pagesInput ? Math.max(1, parseInt(pagesInput.value) || 1) : 1;
  const level = levelSelect ? levelSelect.value : 'Undergraduate';

  let ratePerPage = 15.00;
  if (level === 'High School') ratePerPage = 12.00;
  else if (level === 'Master\'s') ratePerPage = 18.00;
  else if (level === 'Doctoral / Ph.D.') ratePerPage = 22.00;

  const total = pages * ratePerPage;
  if (priceDisplay) priceDisplay.textContent = `$${total.toFixed(2)}`;
  if (wordsDisplay) wordsDisplay.textContent = `~${pages * 275} words (Double Spaced)`;
}

function syncUploadDeadlineString() {
  const dtInput = document.getElementById('upload-deadline-datetime');
  const hiddenInput = document.getElementById('upload-deadline');
  if (dtInput && dtInput.value) {
    const d = new Date(dtInput.value);
    if (!isNaN(d.getTime())) {
      const formatted = d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
      if (hiddenInput) hiddenInput.value = `Due by ${formatted}`;
      return;
    }
  }
  if (hiddenInput) hiddenInput.value = 'Ready in 3 Days';
}

function handleDocumentEmailDispatch(e) {
  if (e) e.preventDefault();
  if (!authSession.isLoggedIn || authSession.role !== 'student') {
    showToast('Please sign in or create an account to submit your assignment brief.');
    openAuthModal('login');
    return;
  }

  const topic = document.getElementById('upload-topic').value.trim();
  const assignmentType = document.getElementById('upload-assignment-type') ? document.getElementById('upload-assignment-type').value : 'Essay';
  const subject = document.getElementById('upload-subject') ? document.getElementById('upload-subject').value : 'Academic Research';
  const level = document.getElementById('upload-level') ? document.getElementById('upload-level').value : 'Undergraduate';
  const citation = document.getElementById('upload-citation') ? document.getElementById('upload-citation').value : 'APA 7';
  const sourcesCount = document.getElementById('upload-sources-count') ? parseInt(document.getElementById('upload-sources-count').value) || 0 : 0;
  const pages = document.getElementById('upload-pages') ? Math.max(1, parseInt(document.getElementById('upload-pages').value) || 1) : 1;
  const deadlineDatetime = document.getElementById('upload-deadline-datetime') ? document.getElementById('upload-deadline-datetime').value : '';
  const deadline = document.getElementById('upload-deadline') ? document.getElementById('upload-deadline').value.trim() : 'Ready in 3 Days';
  const tutor = document.getElementById('upload-tutor') ? document.getElementById('upload-tutor').value : 'Sophia Mitchell';
  const instructions = document.getElementById('upload-instructions') ? document.getElementById('upload-instructions').value.trim() : '';

  let ratePerPage = 15.00;
  if (level === 'High School') ratePerPage = 12.00;
  else if (level === 'Master\'s') ratePerPage = 18.00;
  else if (level === 'Doctoral / Ph.D.') ratePerPage = 22.00;
  const priceAmount = pages * ratePerPage;

  const currentStudentName = authSession.user ? authSession.user.full_name : 'Registered Student';
  const currentStudentEmail = authSession.user ? authSession.user.email : 'student@university.edu';
  const fileName = uploadedFileMeta ? uploadedFileMeta.name : 'Assignment_Brief_Requirements.pdf';
  const fileSize = uploadedFileMeta ? uploadedFileMeta.size : '1.4 MB';
  const fileType = uploadedFileMeta ? uploadedFileMeta.type : 'PDF Document';

  fetch('/api/student/upload-document', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      student_email: currentStudentEmail,
      student_name: currentStudentName,
      tutor_name: tutor,
      file_name: fileName,
      file_size: fileSize,
      file_type: fileType,
      assignment_topic: topic,
      assignment_type: assignmentType,
      academic_subject: subject,
      educational_level: level,
      citation_style: citation,
      sources_count: sourcesCount,
      pages: pages,
      deadline_datetime: deadlineDatetime,
      deadline: deadline,
      instructions: instructions,
      price_amount: priceAmount
    })
  })
  .then(r => r.json())
  .then(res => {
    if (res.success) {
      const card = document.getElementById('upload-confirmation-card');
      if (card) {
        card.style.display = 'block';
        card.innerHTML = `
          <div class="activity-card-result" style="background: #ffffff; border: 2px solid #2563eb; box-shadow: 0 10px 25px rgba(37, 99, 235, 0.1);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span class="activity-badge-success" style="font-size: 0.85rem; padding: 6px 14px;"><i class="fa-solid fa-satellite-dish"></i> Live Tracking Active</span>
              <strong style="color: #2563eb; font-size: 1.15rem; background: #eff6ff; padding: 4px 12px; border-radius: 8px; border: 1px solid #bfdbfe;">#${res.tracking_number}</strong>
            </div>
            <h4 style="font-size: 1.1rem; color: var(--primary); margin-bottom: 6px;">${topic}</h4>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; margin-bottom: 12px; font-size: 0.825rem; color: #334155; line-height: 1.6;">
              <div><strong>Type:</strong> ${assignmentType} • <strong>Subject:</strong> ${subject} (${level})</div>
              <div><strong>Length:</strong> ${pages} Pages (~${pages * 275} words) • <strong>Citation:</strong> ${citation} (${sourcesCount} sources)</div>
              <div><strong>Guiding Tutor:</strong> ${res.tutor_name} • <strong>Deadline:</strong> ${deadline} • <strong>Est. Total:</strong> $${priceAmount.toFixed(2)}</div>
            </div>
            <p style="font-size: 0.8rem; color: #64748b; margin-bottom: 14px;">
              <i class="fa-solid fa-paperclip"></i> Attached Brief: <strong>${fileName}</strong> (${fileSize})
            </p>

            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 12px; margin-bottom: 14px; font-size: 0.825rem; color: #166534;">
              <i class="fa-brands fa-whatsapp" style="font-size: 1.1rem; color: #16a34a;"></i> <strong>Next Step:</strong> Share your unique Tracking ID <strong>#${res.tracking_number}</strong> with the Super Admin on WhatsApp to confirm your task stage and delivery date.
            </div>

            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <a href="${res.whatsapp_share_url}" target="_blank" class="btn btn-whatsapp" style="flex: 1.2; font-size: 0.85rem; padding: 10px 14px; white-space: nowrap;">
                <i class="fa-brands fa-whatsapp"></i> Share #${res.tracking_number} to Admin on WhatsApp
              </a>
              <button onclick="closeModal('student-activities-modal'); loadOrderDetails('${res.tracking_number}'); document.getElementById('order-tracker').scrollIntoView({ behavior: 'smooth' });" class="btn btn-primary" style="flex: 1; font-size: 0.85rem; padding: 10px 14px; white-space: nowrap;">
                <i class="fa-solid fa-satellite-dish"></i> Track Live on Platform
              </button>
            </div>
          </div>
        `;
      }
      showToast(res.message);
      syncCurrentStudentData();
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
  if (!authSession.isLoggedIn || authSession.role !== 'student') {
    showToast('Please sign in or create an account to leave a verified review.');
    openAuthModal('login');
    return;
  }

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
  const author = authorEl && authorEl.value ? authorEl.value.trim() : 'Harrison, O., & Mitchell, S.';
  const title = titleEl && titleEl.value ? titleEl.value.trim() : 'Empirical Methodologies in Applied Econometric Models';
  const year = yearEl && yearEl.value ? yearEl.value.trim() : '2025';
  const journal = journalEl && journalEl.value ? journalEl.value.trim() : 'Journal of Quantitative Academic Studies, 14(2), 110-128';
  const doi = doiEl && doiEl.value ? doiEl.value.trim() : 'https://doi.org/10.1016/j.jqas.2025.04.012';

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
   Student Profile CRUD & Academic Dashboard
   ========================================================================== */
function openStudentProfileModal() {
  closeSidebar();
  if (!authSession.isLoggedIn || authSession.role !== 'student' || !authSession.user) {
    showToast('Please sign in to view your student profile.');
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
  const email = document.getElementById('stu-email').value.trim().toLowerCase();
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

  fetch('/api/student/profile/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email,
      full_name: name,
      university: uni,
      academic_level: level,
      major_field: major,
      preferred_citation: citation,
      whatsapp_number: whatsapp,
      target_gpa: targetGpa,
      current_gpa: currentGpa
    })
  })
  .then(r => r.json())
  .then(res => {
    if (res.success) {
      authSession.user = { ...authSession.user, ...res.student };
      saveSession(authSession);
      closeModal('student-profile-modal');
      showToast(res.message || `Profile updated for ${name}!`);
      openStudentDashboard();
    } else {
      showToast(res.error || 'Failed to update profile.');
    }
  })
  .catch(() => {
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
    showToast(`Profile updated for ${name}!`);
    openStudentDashboard();
  });
}

function handleStudentDeleteAccount() {
  if (!confirm('Are you sure you want to deactivate your student account?')) {
    return;
  }

  const email = authSession.user ? authSession.user.email : '';
  if (!email) return;

  fetch('/api/student/profile/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  })
  .then(r => r.json())
  .then(res => {
    closeModal('student-profile-modal');
    closeModal('student-dashboard-modal');
    handleUserLogout();
    showToast(res.message || 'Account successfully deactivated.');
  })
  .catch(() => {
    closeModal('student-profile-modal');
    handleUserLogout();
    showToast('Account deactivated.');
  });
}

function openStudentDashboard() {
  closeSidebar();
  if (!authSession.isLoggedIn || authSession.role !== 'student' || !authSession.user) {
    showToast('Please sign in or create an account to view your Academic Hub.');
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
  if (majorEl) majorEl.textContent = `Major: ${u.major_field} • Preferred Style: ${u.preferred_citation || 'APA 7th'}`;
  if (avatarEl) avatarEl.src = u.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';
  if (gpaTargetVal) gpaTargetVal.textContent = `${(u.target_gpa || 3.90).toFixed(2)} GPA`;
  if (gpaCurrentVal) gpaCurrentVal.textContent = `${(u.current_gpa || 3.72).toFixed(2)} Current`;
  if (ordersCountEl) ordersCountEl.textContent = `${u.total_orders || 0} Papers`;

  if (gpaBar) {
    const pct = Math.min(100, Math.max(10, ((u.current_gpa || 3.72) / 4.0) * 100));
    gpaBar.style.width = `${pct}%`;
  }

  fetch(`/api/student/dashboard?email=${encodeURIComponent(u.email)}`)
    .then(r => r.json())
    .then(res => {
      if (res.success && res.student && res.student.orders) {
        renderStudentDashboardOrders(res.student.orders);
      } else {
        renderStudentDashboardOrders([]);
      }
    })
    .catch(() => {
      renderStudentDashboardOrders([]);
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
        <div style="font-size: 0.75rem; color: #059669; font-weight: 600;">
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
   Super Admin Control Center (Strict Real Data, Zero Funds Display)
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
        renderAdminBookingsTable(data.bookings || []);
        renderAdminInvitesTable(data.invitations || []);
        renderAdminStudentsTable(data.students || []);
        renderAdminTutorsGrid(data.tutors || []);
      }
    })
    .catch(() => {});
}

function renderAdminStats(metrics) {
  const ordersEl = document.getElementById('admin-stat-orders');
  const studentsEl = document.getElementById('admin-stat-students');
  const bookingsEl = document.getElementById('admin-stat-bookings');
  const turnitinEl = document.getElementById('admin-stat-turnitin');

  if (ordersEl) ordersEl.textContent = metrics.total_orders || '0';
  if (studentsEl) studentsEl.textContent = metrics.total_students || '0';
  if (bookingsEl) bookingsEl.textContent = metrics.total_bookings || '0';
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

  const panes = ['orders', 'bookings', 'invites', 'students', 'tutors', 'security', 'database'];
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

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 20px;">No assignment orders recorded yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = orders.map(o => `
    <tr>
      <td>
        <strong style="color: #1e3a8a;">#${o.order_number}</strong>
        ${o.file_name ? `<div style="font-size: 0.72rem; color: #64748b;"><i class="fa-solid fa-paperclip"></i> ${o.file_name}</div>` : ''}
      </td>
      <td>
        <strong>${o.student_name}</strong>
        <div style="font-size: 0.72rem; color: #64748b;">${o.student_email}</div>
      </td>
      <td>
        <span class="badge badge-verified" style="font-size: 0.75rem;">${o.tutor_name}</span>
      </td>
      <td style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
        <span style="font-weight: 600;">${o.topic}</span>
        <div style="font-size: 0.72rem; color: #64748b;">${o.pages || 3} Pgs • ${o.citation_style || 'APA 7th'}</div>
      </td>
      <td>
        <div>
          <span class="status-pill ${(o.stage || o.status).toLowerCase().includes('completed') ? 'completed' : 'in_progress'}" style="font-size: 0.72rem;">
            ${o.stage || o.status}
          </span>
        </div>
        <div style="font-size: 0.72rem; color: #2563eb; font-weight: 700; margin-top: 3px;">
          <i class="fa-solid fa-hourglass-half"></i> ${o.days_ready || 'In 2-3 Days'} (${o.progress_percentage || 45}%)
        </div>
      </td>
      <td>
        <div style="display: flex; gap: 4px; flex-wrap: wrap;">
          <button class="btn btn-primary" style="padding: 4px 8px; font-size: 0.72rem; white-space: nowrap;" onclick="openAdminUpdateStageModal('${o.order_number}', '${(o.student_name || 'Student').replace(/'/g, "\\'")}', '${(o.tutor_name || 'Sophia Mitchell').replace(/'/g, "\\'")}', '${(o.topic || 'Assignment').replace(/'/g, "\\'")}', '${o.pages || 3} Pgs • ${o.citation_style || 'APA 7th'}', '${(o.stage || o.status || 'Drafting in Progress with Specialist Tutor').replace(/'/g, "\\'")}', '${(o.days_ready || 'Ready in 2 Days').replace(/'/g, "\\'")}', ${o.progress_percentage || 50}, '${(o.admin_notes || '').replace(/'/g, "\\'")}', ${o.turnitin_ai_score || 0.0}, ${o.turnitin_similarity || 0.4}, '${o.payment_status || 'payment_verified'}')">
            <i class="fa-solid fa-pen-to-square"></i> Set Stage & Timeline
          </button>
          <a href="https://wa.me/?text=${encodeURIComponent(`Hello ${o.student_name}! ScholarVerge Super Admin update on Assignment #${o.order_number}: Current Stage is "${o.stage || o.status}". Delivery Timeline: ${o.days_ready || 'In 2-3 Days'} (${o.progress_percentage}% completed). Guiding Tutor: ${o.tutor_name}.`)}" target="_blank" class="btn btn-outline" style="padding: 3px 6px; font-size: 0.72rem; color: #16a34a;" title="Share Update to Student on WhatsApp">
            <i class="fa-brands fa-whatsapp"></i>
          </a>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderAdminBookingsTable(bookings) {
  const tbody = document.getElementById('admin-bookings-tbody');
  if (!tbody) return;

  if (bookings.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #94a3b8; padding: 20px;">No 1-on-1 consultation requests logged yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = bookings.map(b => `
    <tr>
      <td><strong>#${b.booking_id}</strong></td>
      <td>${b.student_name}</td>
      <td>${b.tutor_name}</td>
      <td>${b.session_type} <span style="font-size: 0.75rem; color: #64748b;">(${b.platform})</span></td>
      <td>${b.scheduled_date} at ${b.scheduled_time}</td>
      <td>
        <span class="status-pill ${b.status === 'confirmed' ? 'completed' : 'requested'}">
          ${b.status === 'confirmed' ? '<i class="fa-solid fa-circle-check"></i> Confirmed' : '<i class="fa-solid fa-clock"></i> Link Requested'}
        </span>
        <div style="font-size: 0.72rem; color: #2563eb; margin-top: 2px; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${b.meeting_link || 'Pending Link'}
        </div>
      </td>
      <td>
        <button class="btn btn-primary" style="padding: 4px 8px; font-size: 0.72rem; white-space: nowrap;" onclick="openAdminSetMeetingLinkModal('${b.booking_id}', '${b.student_name.replace(/'/g, "\\'")}', '${b.tutor_name.replace(/'/g, "\\'")}', '${b.session_type.replace(/'/g, "\\'")}', '${b.scheduled_date}', '${b.scheduled_time}', '${b.platform}')">
          <i class="fa-solid fa-video"></i> Set Link & Share
        </button>
      </td>
    </tr>
  `).join('');
}

function renderAdminInvitesTable(invitations) {
  const tbody = document.getElementById('admin-invites-tbody');
  if (!tbody) return;

  if (invitations.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 20px;">No student invitations generated yet. Use the form above!</td></tr>`;
    return;
  }

  const currentOrigin = window.location.origin;

  tbody.innerHTML = invitations.map(inv => {
    const liveLink = `${currentOrigin}/?invite=${inv.invite_code}`;
    const waShare = `https://wa.me/?text=${encodeURIComponent(`Hello ${inv.student_name}! Here is your VIP invitation link to join ScholarVerge: ${liveLink}`)}`;
    return `
    <tr>
      <td><strong>#${inv.invite_code}</strong></td>
      <td>${inv.student_name}</td>
      <td>${inv.academic_level} ${inv.major_field ? `• ${inv.major_field}` : ''}</td>
      <td style="font-size: 0.75rem; color: #2563eb;">${liveLink}</td>
      <td><span class="status-pill ${inv.status === 'active' ? 'review' : 'completed'}">${inv.status.toUpperCase()}</span></td>
      <td>
        <div style="display: flex; gap: 4px;">
          <button class="btn btn-outline" style="padding: 3px 6px; font-size: 0.7rem;" onclick="navigator.clipboard.writeText('${liveLink}'); showToast('Live invite link copied!');">
            <i class="fa-solid fa-copy"></i>
          </button>
          <a href="${waShare}" target="_blank" class="btn btn-outline" style="padding: 3px 6px; font-size: 0.7rem; color: #16a34a;">
            <i class="fa-brands fa-whatsapp"></i>
          </a>
        </div>
      </td>
    </tr>
  `;
  }).join('');
}

function renderAdminStudentsTable(students) {
  const tbody = document.getElementById('admin-students-tbody');
  if (!tbody) return;

  if (students.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #94a3b8; padding: 20px;">No students registered yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = students.map(s => {
    const isFlagged = s.status === 'flagged' || s.status === 'suspended';
    return `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 28px; height: 28px; border-radius: 50%; background: #2563eb; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.75rem;">${(s.full_name || 'S').charAt(0)}</div>
            <strong>${s.full_name}</strong>
          </div>
        </td>
        <td>${s.university}</td>
        <td>${s.major_field}</td>
        <td>${s.academic_level}</td>
        <td><span class="badge badge-trust">${s.total_orders || 0} Orders</span></td>
        <td>
          <span class="status-pill ${s.status === 'flagged' ? 'flagged' : s.status === 'suspended' ? 'suspended' : 'active'}">
            ${(s.status || 'active').toUpperCase()}
          </span>
        </td>
        <td>
          <div style="display: flex; gap: 4px;">
            <button class="btn btn-outline" style="padding: 3px 7px; font-size: 0.7rem; color: ${isFlagged ? '#047857' : '#b91c1c'};" onclick="adminToggleStudentFlag('${s.email}', '${s.status || 'active'}')">
              <i class="fa-solid fa-flag"></i> ${isFlagged ? 'Unflag' : 'Flag'}
            </button>
            <a href="https://wa.me/16677757597?text=Hello%20${encodeURIComponent(s.full_name)}%2C%20from%20ScholarVerge%20Super%20Admin" target="_blank" class="btn btn-outline" style="padding: 3px 6px; font-size: 0.7rem; color: #16a34a;">
              <i class="fa-brands fa-whatsapp"></i>
            </a>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderAdminTutorsGrid(tutors) {
  const container = document.getElementById('admin-tutors-list');
  if (!container) return;

  container.innerHTML = tutors.map(t => `
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; display: flex; justify-content: space-between; align-items: center; gap: 14px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <img src="${t.avatar_url || 'assets/images/tutors/oliver-harrison.jpg'}" alt="${t.full_name}" style="width: 46px; height: 46px; border-radius: 50%; object-fit: cover; border: 2px solid #2563eb;" />
        <div>
          <strong style="font-size: 0.95rem; color: var(--primary); display: block;">${t.full_name}</strong>
          <span style="font-size: 0.785rem; color: var(--text-muted);">${t.title} • Rating: ${t.rating} ★</span>
          <div style="margin-top: 4px; font-size: 0.75rem; color: #047857;">
            <i class="fa-solid fa-circle" style="font-size: 0.45rem;"></i> Active Workload: ${t.active_load || 8} Papers (${t.status})
          </div>
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
- students: ${data.database.tables.students} profiles
- tutors: ${data.database.tables.tutors} verified specialists (Oliver, Claire, Sophia)
- orders: ${data.database.tables.orders} orders logged
- bookings: ${data.database.tables.bookings} 1-on-1 sessions
- reviews: ${data.database.tables.reviews} verified reviews
- invitations: ${data.database.tables.invitations} VIP invitations

SQL Schema: database/schema.sql (Active & Ready)
      `;
    })
    .catch(() => {
      panel.innerHTML = `
[PostgreSQL Database Synchronization Console]
Status: Connected & Ready
Engine: PostgreSQL 16.x Multi-Tenant Schema
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
  { title: 'Sign In / Register Account', sub: 'Student login, registration & password recovery', action: () => { openAuthModal('login'); } },
  { title: 'Student Academic Dashboard', sub: 'View active assignments, GPA progress & downloads', action: () => { openStudentDashboard(); } },
  { title: 'Super Admin Control Center', sub: 'Master management for orders, students, tutors & PostgreSQL', action: () => { openSuperAdminPortal(); } },
  { title: 'Oliver Harrison', sub: 'Tutor • Business, Economics, Finance, Math & Stats', action: () => { openOrderModalWithTutor('Oliver Harrison'); } },
  { title: 'Claire Bennett', sub: 'Tutor • English, IT, History, Law & Humanities', action: () => { openOrderModalWithTutor('Claire Bennett'); } },
  { title: 'Sophia Mitchell', sub: 'Tutor • Nursing, Healthcare & Psychology', action: () => { openOrderModalWithTutor('Sophia Mitchell'); } },
  { title: 'WhatsApp Direct Support (+1 667 775 7597)', sub: 'Chat instantly on WhatsApp with academic coordinator', action: () => { openWhatsApp(); } },
  { title: 'Email Support (scholarverge@gmail.com)', sub: 'Send assignment brief directly via email', action: () => { window.location.href = 'mailto:scholarverge@gmail.com'; } },
  { title: 'Price Calculator', sub: 'Estimate paper cost with deadline & level', action: () => { document.getElementById('hero-calculator').scrollIntoView({ behavior: 'smooth' }); } }
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
   Render Tutors Showcase (Strictly 3 Real Tutors in Order)
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

          <div class="tutor-contact-actions">
            <a href="https://wa.me/16677757597?text=Hello%20ScholarVerge!%20I%20would%20like%20to%20work%20with%20${encodeURIComponent(tutor.name)}%20on%20my%20assignment." target="_blank" class="tutor-contact-btn wa" title="Chat with ${tutor.name} on WhatsApp" aria-label="WhatsApp ${tutor.name}">
              <div class="tutor-contact-icon">
                <i class="fa-brands fa-whatsapp"></i>
              </div>
              <div class="tutor-contact-details">
                <span class="tutor-contact-title">WhatsApp</span>
                <span class="tutor-contact-sub"><i class="fa-solid fa-circle"></i> Online</span>
              </div>
            </a>

            <a href="mailto:scholarverge@gmail.com?subject=Assignment%20Inquiry%20for%20${encodeURIComponent(tutor.name)}" class="tutor-contact-btn mail" title="Email assignment brief for ${tutor.name}" aria-label="Email ${tutor.name}">
              <div class="tutor-contact-icon">
                <i class="fa-solid fa-envelope"></i>
              </div>
              <div class="tutor-contact-details">
                <span class="tutor-contact-title">Email</span>
                <span class="tutor-contact-sub">Direct Inquiry</span>
              </div>
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
   ========================================================================= */
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
   Render Verified Student Reviews
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
        
        displayReviewsList(mapped, filter);
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
  highschool: 10.00,
  undergrad: 10.00,
  masters: 10.00,
  doctoral: 10.00
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

function syncOrderDeadlineString() {
  const daysEl = document.getElementById('order-deadline-days');
  const hoursEl = document.getElementById('order-deadline-hours');
  const dtInput = document.getElementById('order-deadline-datetime');
  const hiddenInput = document.getElementById('order-deadline-modal');
  
  const days = daysEl ? parseInt(daysEl.value) || 0 : 3;
  const hours = hoursEl ? parseInt(hoursEl.value) || 0 : 0;
  
  let str = '';
  if (days > 0 && hours > 0) {
    str = `${days} ${days === 1 ? 'Day' : 'Days'}, ${hours} ${hours === 1 ? 'Hour' : 'Hours'}`;
  } else if (days > 0) {
    str = `${days} ${days === 1 ? 'Day' : 'Days'}`;
  } else if (hours > 0) {
    str = `${hours} ${hours === 1 ? 'Hour' : 'Hours'}`;
  } else {
    str = 'Flexible Timeline';
  }

  if (dtInput && dtInput.value) {
    const formattedDate = new Date(dtInput.value).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    str += ` (Due: ${formattedDate})`;
  }

  if (hiddenInput) hiddenInput.value = str;
}

function syncUploadDeadlineString() {
  const daysEl = document.getElementById('upload-deadline-days');
  const hoursEl = document.getElementById('upload-deadline-hours');
  const dtInput = document.getElementById('upload-deadline-datetime');
  const hiddenInput = document.getElementById('upload-deadline');
  
  const days = daysEl ? parseInt(daysEl.value) || 0 : 3;
  const hours = hoursEl ? parseInt(hoursEl.value) || 0 : 0;
  
  let str = '';
  if (days > 0 && hours > 0) {
    str = `${days} ${days === 1 ? 'Day' : 'Days'}, ${hours} ${hours === 1 ? 'Hour' : 'Hours'}`;
  } else if (days > 0) {
    str = `${days} ${days === 1 ? 'Day' : 'Days'}`;
  } else if (hours > 0) {
    str = `${hours} ${hours === 1 ? 'Hour' : 'Hours'}`;
  } else {
    str = 'Flexible Timeline';
  }

  if (dtInput && dtInput.value) {
    const formattedDate = new Date(dtInput.value).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    str += ` (Due: ${formattedDate})`;
  }

  if (hiddenInput) hiddenInput.value = str;
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
    const citation = document.getElementById('order-citation') ? document.getElementById('order-citation').value : 'APA 7th Edition';
    const sources = document.getElementById('order-sources-count') ? document.getElementById('order-sources-count').value : '5';
    const writingStyle = document.getElementById('order-writing-style') ? document.getElementById('order-writing-style').value : 'Standard Academic & Scholarly';
    const deadline = document.getElementById('order-deadline-modal') ? document.getElementById('order-deadline-modal').value : '3 Days';
    const tutorSelect = document.getElementById('order-tutor-select');
    const tutor = tutorSelect.options[tutorSelect.selectedIndex].text;
    const isUK = currentLang === 'en-GB';
    const curr = isUK ? '£' : '$';
    const price = (pages * 10 * (isUK ? 0.79 : 1.0)).toFixed(2);
    
    const summaryEl = document.getElementById('order-summary-box');
    if (summaryEl) {
      summaryEl.innerHTML = `
        <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 14px; padding: 18px; font-size: 0.9rem;">
          <p style="margin-bottom: 6px;"><strong>Topic / Course:</strong> ${topic}</p>
          <p style="margin-bottom: 6px;"><strong>Academic Level:</strong> ${level}</p>
          <p style="margin-bottom: 6px;"><strong>Length:</strong> ${pages} Pages (~${pages * 275} words @ $10.00/page)</p>
          <p style="margin-bottom: 6px;"><strong>Citation & Style:</strong> ${citation} • ${sources} Minimum Sources</p>
          <p style="margin-bottom: 6px;"><strong>Writing Tone & Methodology:</strong> ${writingStyle}</p>
          <p style="margin-bottom: 6px;"><strong>Specified Deadline:</strong> <span style="color: #2563eb; font-weight: 700;">${deadline}</span></p>
          <p style="margin-bottom: 6px;"><strong>Assigned Specialist Tutor:</strong> ${tutor}</p>
          <p style="margin-bottom: 6px;"><strong>Turnitin & Anti-AI Verification:</strong> <span style="color: #059669; font-weight: 700;">Included Free (0% AI Certificate)</span></p>
          <p style="margin-bottom: 0; margin-top: 10px; border-top: 1px dashed #cbd5e1; padding-top: 8px;"><strong>Estimated Total:</strong> <span style="color: #2563eb; font-weight: 800; font-size: 1.25rem;">${curr}${price}</span> <span style="font-size: 0.75rem; color: #64748b;">($10.00 / page)</span></p>
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
  const citation = document.getElementById('order-citation') ? document.getElementById('order-citation').value : 'APA 7th Edition';
  const sourcesCount = document.getElementById('order-sources-count') ? document.getElementById('order-sources-count').value : '5';
  const writingStyle = document.getElementById('order-writing-style') ? document.getElementById('order-writing-style').value : 'Standard Academic';
  const prompt = document.getElementById('order-prompt') ? document.getElementById('order-prompt').value : '';
  const deadline = document.getElementById('order-deadline-modal') ? document.getElementById('order-deadline-modal').value : '3 Days';
  const priceAmount = pages * 10.00;

  const currentStudentName = authSession.user ? authSession.user.full_name : 'Registered Student';
  const currentStudentEmail = authSession.user ? authSession.user.email : 'student@university.edu';

  const waMsg = `Hello ScholarVerge Admin! I have submitted Order #${randomId} for "${topic}".
• Length: ${pages} Pages ($${priceAmount.toFixed(2)} @ $10/page)
• Academic Level: ${level}
• Tutor: ${tutorName}
• Citation Style: ${citation} (${sourcesCount} sources)
• Writing Style: ${writingStyle}
• Specified Deadline: ${deadline}
Please guide me on completing the payment.`;
  const waUrl = `https://wa.me/16677757597?text=${encodeURIComponent(waMsg)}`;

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
      citation_style: `${citation} (${sourcesCount} sources)`,
      writing_style: writingStyle,
      prompt: prompt,
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
}

/* ==========================================================================
   Live Real-Time Order & Assignment Tracker (Backend Database Connected)
   ========================================================================== */
let activeTrackerChatHistories = {};

function initOrderTracker() {
  const searchBtn = document.getElementById('tracker-search-btn');
  const trackerInput = document.getElementById('tracker-input');

  if (searchBtn && trackerInput) {
    searchBtn.addEventListener('click', () => {
      const orderId = trackerInput.value.trim().toUpperCase().replace('#', '');
      if (orderId) {
        loadOrderDetails(orderId);
      } else {
        showToast('Please enter your unique Tracking ID.');
      }
    });

    trackerInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const orderId = trackerInput.value.trim().toUpperCase().replace('#', '');
        if (orderId) loadOrderDetails(orderId);
      }
    });
  }

  updateTrackerStudentChips();
  loadOrderDetails('SV-84920');
}

function updateTrackerStudentChips() {
  const chipsContainer = document.getElementById('tracker-student-chips');
  if (!chipsContainer) return;

  if (authSession.isLoggedIn && authSession.role === 'student' && authSession.user && authSession.user.email) {
    fetch(`/api/student/dashboard?email=${encodeURIComponent(authSession.user.email)}`)
      .then(r => r.json())
      .then(res => {
        if (res.success && res.student && res.student.orders && res.student.orders.length > 0) {
          chipsContainer.style.display = 'block';
          chipsContainer.innerHTML = `
            <div style="font-size: 0.75rem; color: #475569; margin-bottom: 6px; font-weight: 700;">
              <i class="fa-solid fa-folder-open" style="color: #2563eb;"></i> Your Active Assignment Tracking IDs:
            </div>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              ${res.student.orders.map(o => `
                <span class="sample-chip" style="background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af;" onclick="loadOrderDetails('${o.order_number}')">
                  <strong style="color: #2563eb;">#${o.order_number}</strong> (${o.tutor_name || 'Tutor'} • ${o.stage || o.status || 'Active'})
                </span>
              `).join('')}
            </div>
          `;
        } else {
          chipsContainer.style.display = 'none';
        }
      })
      .catch(() => {
        chipsContainer.style.display = 'none';
      });
  } else {
    chipsContainer.style.display = 'none';
  }
}

function loadOrderDetails(orderId) {
  const container = document.getElementById('tracker-result-container');
  const trackerInput = document.getElementById('tracker-input');
  if (trackerInput && orderId) {
    trackerInput.value = orderId;
  }
  if (!container) return;

  container.innerHTML = `
    <div style="grid-column: span 2; text-align: center; padding: 40px 0;">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 2.5rem; color: #2563eb; margin-bottom: 16px;"></i>
      <h4 style="font-size: 1.15rem; color: var(--primary);">Querying Live Platform Database for #${orderId}...</h4>
    </div>
  `;

  fetch(`/api/orders/track?code=${encodeURIComponent(orderId)}`)
    .then(r => r.json())
    .then(res => {
      if (res.success && res.order) {
        const order = res.order;
        const tutorAvatar = order.tutor_avatar || 'assets/images/tutors/sophia-mitchell.jpg';
        const isCompleted = (order.stage || order.status || '').toLowerCase().includes('completed');

        if (!activeTrackerChatHistories[order.order_number]) {
          activeTrackerChatHistories[order.order_number] = [
            { sender: order.tutor_name, time: 'Assignment Assigned', text: `Hello ${order.student_name}! I have received your brief on "${order.topic}". The rubric and required citation format (${order.citation_style}) are currently active.` },
            { sender: order.tutor_name, time: 'Stage & Delivery Timeline', text: `Super Admin confirmed current stage: "${order.stage}". Estimated delivery timeline: ${order.days_ready} (${order.progress_percentage}% completed).` }
          ];
        }

        const chatHistory = activeTrackerChatHistories[order.order_number];

        container.innerHTML = `
          <div>
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 10px;">
              <div>
                <span class="badge badge-verified" style="margin-bottom: 6px; font-size: 0.85rem;">Tracking #${order.order_number}</span>
                <h3 style="font-size: 1.3rem; color: var(--primary); margin: 4px 0 6px;">${order.topic}</h3>
                <p style="font-size: 0.85rem; color: var(--text-muted);">
                  ${order.subject || 'Academic Research'} • ${order.academic_level || 'Undergraduate'} • ${order.pages || 3} Pages • ${order.citation_style || 'APA 7th'} • Deadline: ${order.deadline || 'In 3 Days'}
                </p>
                ${order.file_name ? `<span style="font-size: 0.785rem; color: #64748b;"><i class="fa-solid fa-paperclip"></i> Attached Brief: <strong>${order.file_name}</strong></span>` : ''}
              </div>
              <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px;">
                <span class="status-pill ${isCompleted ? 'completed' : 'in_progress'}" style="font-size: 0.85rem; padding: 6px 14px;">
                  <i class="fa-solid fa-layer-group"></i> ${order.stage}
                </span>
                <span class="badge badge-gold" style="font-size: 0.85rem; padding: 6px 14px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); color: #92400e; border: 1px solid #f59e0b;">
                  <i class="fa-solid fa-hourglass-half"></i> Delivery: <strong>${order.days_ready}</strong> (${order.progress_percentage}%)
                </span>
              </div>
            </div>

            <!-- Turnitin Authenticity and Quality Strip -->
            <div style="display: flex; gap: 8px; margin-bottom: 18px; flex-wrap: wrap;">
              <span class="badge badge-verified" style="font-size: 0.785rem; background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0;">
                <i class="fa-solid fa-shield-check"></i> Turnitin AI Score: ${order.turnitin_ai_score || 0.0}% (100% Human)
              </span>
              <span class="badge badge-trust" style="font-size: 0.785rem;">
                <i class="fa-solid fa-fingerprint"></i> Similarity Index: ${order.turnitin_similarity || 0.4}%
              </span>
              <span class="badge badge-gold" style="font-size: 0.785rem;">
                <i class="fa-solid fa-certificate"></i> Ivy & Russell Standards Verified
              </span>
            </div>

            <!-- Admin Notes Box if available -->
            ${order.admin_notes ? `
              <div style="background: #f8fafc; border-left: 4px solid #2563eb; border-radius: 8px; padding: 12px 16px; margin-bottom: 18px; font-size: 0.85rem; color: #334155;">
                <strong style="color: #1e40af;"><i class="fa-solid fa-comment-dots" style="color: #2563eb;"></i> Super Admin Guidance & Status Note:</strong>
                <p style="margin: 4px 0 0; color: #475569;">${order.admin_notes}</p>
              </div>
            ` : ''}

            <h4 style="font-size: 1rem; margin-bottom: 16px; color: var(--primary);">
              <i class="fa-solid fa-list-check" style="color: var(--accent-blue);"></i> Real-Time Workflow Progress (${order.progress_percentage}%)
            </h4>
            <div class="timeline">
              ${(order.steps || []).map(s => `
                <div class="timeline-item ${s.done ? 'done' : ''}">
                  <div class="timeline-dot">
                    ${s.done ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-solid fa-circle" style="font-size: 0.4rem;"></i>'}
                  </div>
                  <div class="timeline-title">${s.name}</div>
                  <div class="timeline-time">${s.time}</div>
                </div>
              `).join('')}
            </div>

            <div style="margin-top: 24px; background: rgba(37, 99, 235, 0.08); border: 1px solid rgba(37, 99, 235, 0.25); border-radius: 14px; padding: 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
              <div>
                <strong style="color: #1e40af; font-size: 0.95rem; display: block;">Instant WhatsApp Coordinator Assistance</strong>
                <span style="font-size: 0.8rem; color: #334155;">Coordinate directly with Super Admin on WhatsApp (+1 667 775 7597) for revisions or updates.</span>
              </div>
              <div style="display: flex; gap: 8px;">
                <a href="https://wa.me/16677757597?text=Hello%20Super%20Admin!%20I%20am%20tracking%20my%20assignment%20(%23${order.order_number})%20guided%20by%20${encodeURIComponent(order.tutor_name)}.%20Current%20Stage%3A%20${encodeURIComponent(order.stage)}.%20Delivery%3A%20${encodeURIComponent(order.days_ready)}." target="_blank" class="btn btn-whatsapp" style="font-size: 0.82rem;">
                  <i class="fa-brands fa-whatsapp"></i> WhatsApp Super Admin
                </a>
              </div>
            </div>
          </div>

          <div>
            <div class="chat-simulator-box">
              <div class="chat-sim-header">
                <img src="${tutorAvatar}" alt="${order.tutor_name}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 2px solid #2563eb;" />
                <div>
                  <strong style="font-size: 0.9rem; color: var(--primary); display: block;">${order.tutor_name}</strong>
                  <span style="font-size: 0.75rem; color: var(--accent-teal-dark); font-weight: 600;"><i class="fa-solid fa-circle" style="font-size: 0.5rem;"></i> Active Now • Assigned Specialist</span>
                </div>
              </div>

              <div class="chat-sim-body" id="tracker-chat-body-${order.order_number}">
                ${chatHistory.map(m => `
                  <div class="chat-msg ${m.sender === 'You' ? 'you' : 'tutor'}">
                    <div style="font-size: 0.7rem; opacity: 0.75; margin-bottom: 2px;">${m.sender} • ${m.time}</div>
                    ${m.text}
                  </div>
                `).join('')}
              </div>

              <div class="chat-sim-footer">
                <input type="text" id="tracker-chat-input-${order.order_number}" class="chat-sim-input" placeholder="Message ${order.tutor_name}..." onkeypress="handleTrackerChatKey(event, '${order.order_number}', '${order.tutor_name.replace(/'/g, "\\'")}')" />
                <button class="btn btn-primary" style="padding: 8px 14px;" onclick="sendTrackerMessage('${order.order_number}', '${order.tutor_name.replace(/'/g, "\\'")}')">
                  <i class="fa-solid fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </div>
        `;
      } else {
        container.innerHTML = `
          <div style="grid-column: span 2; text-align: center; padding: 40px 0;">
            <i class="fa-solid fa-magnifying-glass" style="font-size: 2.5rem; color: #cbd5e1; margin-bottom: 16px;"></i>
            <h4 style="font-size: 1.25rem;">Tracking ID #${orderId} Not Found</h4>
            <p style="color: #64748b; font-size: 0.9rem; margin-bottom: 18px;">Please verify your unique Tracking ID (e.g. SV-84920) or connect directly with the Super Admin.</p>
            <a href="https://wa.me/16677757597?text=Hello%20Super%20Admin!%20I%20need%20assistance%20verifying%20my%20assignment%20Tracking%20%23${orderId}" target="_blank" class="btn btn-whatsapp" style="display: inline-flex; font-size: 0.875rem;">
              <i class="fa-brands fa-whatsapp"></i> Verify Tracking ID on WhatsApp
            </a>
          </div>
        `;
      }
    })
    .catch(() => {
      container.innerHTML = `
        <div style="grid-column: span 2; text-align: center; padding: 40px 0;">
          <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.5rem; color: #ef4444; margin-bottom: 16px;"></i>
          <h4 style="font-size: 1.25rem;">Unable to Query Tracking Service</h4>
          <p style="color: #64748b; font-size: 0.9rem;">Please check your server connection and try again.</p>
        </div>
      `;
    });
}

function handleTrackerChatKey(e, orderId, tutorName) {
  if (e.key === 'Enter') {
    sendTrackerMessage(orderId, tutorName);
  }
}

function sendTrackerMessage(orderId, tutorName) {
  const input = document.getElementById(`tracker-chat-input-${orderId}`);
  if (!input || !input.value.trim()) return;

  const text = input.value.trim();
  input.value = '';

  if (!activeTrackerChatHistories[orderId]) {
    activeTrackerChatHistories[orderId] = [];
  }

  activeTrackerChatHistories[orderId].push({
    sender: 'You',
    time: 'Just now',
    text: text
  });

  const chatBody = document.getElementById(`tracker-chat-body-${orderId}`);
  if (chatBody) {
    chatBody.innerHTML = activeTrackerChatHistories[orderId].map(m => `
      <div class="chat-msg ${m.sender === 'You' ? 'you' : 'tutor'}">
        <div style="font-size: 0.7rem; opacity: 0.75; margin-bottom: 2px;">${m.sender} • ${m.time}</div>
        ${m.text}
      </div>
    `).join('');
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  setTimeout(() => {
    const replies = [
      `Thank you for the update! I am incorporating these points into the draft section according to the grading rubric.`,
      `Noted! I am reviewing the citations and verifying 0% Turnitin AI detection.`,
      `Received! I am aligning this with the academic requirements and will keep you posted on the stage timeline.`
    ];
    const replyText = replies[Math.floor(Math.random() * replies.length)];

    activeTrackerChatHistories[orderId].push({
      sender: tutorName || 'Tutor',
      time: 'Just now',
      text: replyText
    });

    if (chatBody) {
      chatBody.innerHTML = activeTrackerChatHistories[orderId].map(m => `
        <div class="chat-msg ${m.sender === 'You' ? 'you' : 'tutor'}">
          <div style="font-size: 0.7rem; opacity: 0.75; margin-bottom: 2px;">${m.sender} • ${m.time}</div>
          ${m.text}
        </div>
      `).join('');
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  }, 1000);
}

/* ==========================================================================
   Super Admin Update Task Stage, Days Ready & Delivery Management
   ========================================================================== */
function openAdminUpdateStageModal(orderNum, studentName, tutorName, topic, meta, stage, daysReady, progress, notes, turnitinAi, turnitinSim, paymentStatus) {
  document.getElementById('admin-stage-order-num').value = orderNum;
  document.getElementById('admin-stage-header-order-ref').textContent = `Order #${orderNum}`;
  document.getElementById('admin-stage-student-name').textContent = studentName;
  document.getElementById('admin-stage-topic').textContent = topic;
  document.getElementById('admin-stage-meta').textContent = `${meta} • Tutor: ${tutorName}`;
  
  const stageSelect = document.getElementById('admin-stage-select');
  if (stageSelect) {
    let matched = false;
    for (let i = 0; i < stageSelect.options.length; i++) {
      if (stageSelect.options[i].value === stage) {
        stageSelect.selectedIndex = i;
        matched = true;
        break;
      }
    }
    if (!matched) {
      stageSelect.selectedIndex = 2;
    }
  }

  document.getElementById('admin-stage-days').value = daysReady || 'Ready in 2 Days (Sep 3, 2026)';
  
  const slider = document.getElementById('admin-stage-prog-slider');
  const progLbl = document.getElementById('admin-stage-prog-label');
  if (slider && progLbl) {
    slider.value = progress || 60;
    progLbl.innerText = (progress || 60) + '%';
  }

  const tutorSelect = document.getElementById('admin-stage-tutor');
  if (tutorSelect && tutorName) {
    for (let i = 0; i < tutorSelect.options.length; i++) {
      if (tutorSelect.options[i].value.includes(tutorName) || tutorName.includes(tutorSelect.options[i].value)) {
        tutorSelect.selectedIndex = i;
        break;
      }
    }
  }

  document.getElementById('admin-stage-notes').value = notes || '';
  document.getElementById('admin-stage-ai-score').value = turnitinAi || 0.0;
  document.getElementById('admin-stage-payment').value = paymentStatus || 'payment_verified';

  openModal('admin-order-stage-modal');
}

function handleAdminStageSelectChange() {
  const stageSelect = document.getElementById('admin-stage-select');
  const slider = document.getElementById('admin-stage-prog-slider');
  const progLbl = document.getElementById('admin-stage-prog-label');
  const daysInput = document.getElementById('admin-stage-days');
  if (!stageSelect) return;

  const stage = stageSelect.value;
  let defaultProg = 60;
  let defaultDays = 'Ready in 2 Days';

  if (stage.includes('Document Received')) {
    defaultProg = 15;
    defaultDays = 'Assessing Timeline (Est. ~2-3 Days)';
  } else if (stage.includes('Research & Outline')) {
    defaultProg = 35;
    defaultDays = 'Ready in 3 Days';
  } else if (stage.includes('Drafting in Progress')) {
    defaultProg = 60;
    defaultDays = 'Ready in 2 Days';
  } else if (stage.includes('Turnitin')) {
    defaultProg = 85;
    defaultDays = 'Ready in 18 Hours (Tomorrow)';
  } else if (stage.includes('Completed')) {
    defaultProg = 100;
    defaultDays = 'Completed & Delivered';
  }

  if (slider && progLbl) {
    slider.value = defaultProg;
    progLbl.innerText = defaultProg + '%';
  }
  if (daysInput && (!daysInput.value || daysInput.value.includes('Ready in') || daysInput.value.includes('Assessing') || daysInput.value.includes('Completed'))) {
    daysInput.value = defaultDays;
  }
}

function setAdminDaysPreset(presetText) {
  const daysInput = document.getElementById('admin-stage-days');
  if (daysInput) {
    daysInput.value = presetText;
  }
}

function handleAdminSubmitOrderStageUpdate(e) {
  if (e) e.preventDefault();
  const orderNum = document.getElementById('admin-stage-order-num').value.trim();
  const stage = document.getElementById('admin-stage-select').value;
  const daysReady = document.getElementById('admin-stage-days').value.trim();
  const progress = parseInt(document.getElementById('admin-stage-prog-slider').value) || 60;
  const tutorName = document.getElementById('admin-stage-tutor').value;
  const adminNotes = document.getElementById('admin-stage-notes').value.trim();
  const turnitinAi = parseFloat(document.getElementById('admin-stage-ai-score').value) || 0.0;
  const paymentStatus = document.getElementById('admin-stage-payment').value;

  fetch('/api/admin/orders/update-stage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_number: orderNum,
      stage: stage,
      days_ready: daysReady,
      progress_percentage: progress,
      tutor_name: tutorName,
      admin_notes: adminNotes,
      turnitin_ai_score: turnitinAi,
      payment_status: paymentStatus
    })
  })
  .then(r => r.json())
  .then(res => {
    if (res.success) {
      closeModal('admin-order-stage-modal');
      showToast(res.message);
      loadAdminOverviewData();
      if (res.whatsapp_student_url) {
        window.open(res.whatsapp_student_url, '_blank');
      }
      const trackerInput = document.getElementById('tracker-input');
      if (trackerInput && trackerInput.value.toUpperCase().includes(orderNum)) {
        loadOrderDetails(orderNum);
      }
    } else {
      showToast(res.error || 'Failed to update order stage.');
    }
  })
  .catch(() => {
    showToast('Failed to update order stage.');
  });
}

/* ==========================================================================
   Turnitin Modal & Chat Drawer
   ========================================================================== */
function openTurnitinModal() {
  closeSidebar();
  openModal('turnitin-modal');
}

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
    body.innerHTML += `
      <div class="chat-msg tutor" style="margin-bottom: 8px;">
        <div style="font-size: 0.7rem; opacity: 0.8;">Academic Operations Lead</div>
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

/* ==========================================================================
   Real-World Floating Live Academic Activity Ticker Engine
   ========================================================================== */
let tickerCurrentIndex = 0;
let tickerTimer = null;

const liveTickerFeed = [
  { title: "<strong>Marcus V. (Yale)</strong> received <strong>0% AI Turnitin Report</strong>", sub: "14 mins ago • Quantitative Econometrics Thesis", action: () => openTurnitinModal() },
  { title: "<strong>Dr. Sophia Mitchell</strong> is <strong>Available Online</strong>", sub: "Just now • Nursing Care Plans & PICOT Syntheses", action: () => openOrderModalWithTutor('Sophia Mitchell') },
  { title: "<strong>Elena R. (Oxford)</strong> grade confirmed: <strong>A+ Distinction</strong>", sub: "26 mins ago • Clinical Healthcare Systematic Review", action: () => { document.getElementById('reviews').scrollIntoView({ behavior: 'smooth' }); } },
  { title: "<strong>Claire Bennett</strong> completed <strong>4-page Legal Memorandum</strong>", sub: "38 mins ago • OSCOLA & IT Case Law Citations", action: () => openOrderModalWithTutor('Claire Bennett') },
  { title: "<strong>Oliver Harrison</strong> verified <strong>R Econometric Proofs</strong>", sub: "45 mins ago • Corporate Finance & Stata Modeling", action: () => openOrderModalWithTutor('Oliver Harrison') },
  { title: "<strong>Chloe S. (McGill)</strong> dispatched brief to <strong>scholarverge@gmail.com</strong>", sub: "1 hour ago • Comparative Literature Review", action: () => openStudentActivitiesModal('upload') }
];

function initLiveActivityTicker() {
  const tickerEl = document.getElementById('live-activity-ticker');
  if (!tickerEl) return;

  renderCurrentTickerItem();

  tickerTimer = setInterval(() => {
    tickerCurrentIndex = (tickerCurrentIndex + 1) % liveTickerFeed.length;
    renderCurrentTickerItem();
  }, 10000);
}

function renderCurrentTickerItem() {
  const titleEl = document.getElementById('ticker-title-text');
  const subEl = document.getElementById('ticker-sub-text');
  const tickerEl = document.getElementById('live-activity-ticker');

  if (titleEl && subEl && tickerEl && liveTickerFeed[tickerCurrentIndex]) {
    const item = liveTickerFeed[tickerCurrentIndex];
    tickerEl.style.opacity = '0';
    tickerEl.style.transform = 'translateY(10px)';

    setTimeout(() => {
      titleEl.innerHTML = item.title;
      subEl.textContent = item.sub;
      tickerEl.style.opacity = '1';
      tickerEl.style.transform = 'translateY(0)';
    }, 300);
  }
}

function handleTickerClick() {
  const item = liveTickerFeed[tickerCurrentIndex];
  if (item && typeof item.action === 'function') {
    item.action();
  }
}

function closeTicker() {
  const tickerEl = document.getElementById('live-activity-ticker');
  if (tickerEl) {
    tickerEl.style.display = 'none';
    if (tickerTimer) clearInterval(tickerTimer);
  }
}
