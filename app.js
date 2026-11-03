/**
 * u.park by UNIGA - Main Application Logic
 * Smart Parking & Slot Booking System Universitas Garut
 */

// ==========================================
// 1. Audio Effects Engine (Web Audio API)
// ==========================================
class SoundFX {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Pleasant double chime for QR Scan Success
  beepSuccess() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now); // A5
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.12);

      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1318.5, now + 0.12); // E6
      gain2.gain.setValueAtTime(0.18, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.35);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Buzzer tone for Timeout / Account Frozen
  buzzerWarning() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now); // A3
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.4);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  // Subtle tap sound for slot selection
  tap() {
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {}
  }
}

const audio = new SoundFX();

// ==========================================
// 2. Initial State & Data Store
// ==========================================
const INITIAL_SLOTS = {
  mobil: [
    // Rows A to E (5 rows), 8 cols (1-4 Left, 5-8 Right) -> 40 slots
    { id: 'A1', row: 'A', num: 1, status: 'taken', type: 'mobil' },
    { id: 'A2', row: 'A', num: 2, status: 'taken', type: 'mobil' },
    { id: 'A3', row: 'A', num: 3, status: 'available', type: 'mobil' },
    { id: 'A4', row: 'A', num: 4, status: 'available', type: 'mobil' },
    { id: 'A5', row: 'A', num: 5, status: 'available', type: 'mobil' },
    { id: 'A6', row: 'A', num: 6, status: 'taken', type: 'mobil' },
    { id: 'A7', row: 'A', num: 7, status: 'available', type: 'mobil' },
    { id: 'A8', row: 'A', num: 8, status: 'available', type: 'mobil' },

    { id: 'B1', row: 'B', num: 1, status: 'available', type: 'mobil' },
    { id: 'B2', row: 'B', num: 2, status: 'available', type: 'mobil' },
    { id: 'B3', row: 'B', num: 3, status: 'taken', type: 'mobil' },
    { id: 'B4', row: 'B', num: 4, status: 'taken', type: 'mobil' },
    { id: 'B5', row: 'B', num: 5, status: 'available', type: 'mobil' },
    { id: 'B6', row: 'B', num: 6, status: 'available', type: 'mobil' },
    { id: 'B7', row: 'B', num: 7, status: 'taken', type: 'mobil' },
    { id: 'B8', row: 'B', num: 8, status: 'available', type: 'mobil' },

    { id: 'C1', row: 'C', num: 1, status: 'available', type: 'mobil' },
    { id: 'C2', row: 'C', num: 2, status: 'taken', type: 'mobil' },
    { id: 'C3', row: 'C', num: 3, status: 'available', type: 'mobil' },
    { id: 'C4', row: 'C', num: 4, status: 'available', type: 'mobil' },
    { id: 'C5', row: 'C', num: 5, status: 'available', type: 'mobil' },
    { id: 'C6', row: 'C', num: 6, status: 'taken', type: 'mobil' },
    { id: 'C7', row: 'C', num: 7, status: 'available', type: 'mobil' },
    { id: 'C8', row: 'C', num: 8, status: 'not_available', type: 'mobil' }, // Maintenance

    { id: 'D1', row: 'D', num: 1, status: 'available', type: 'mobil' },
    { id: 'D2', row: 'D', num: 2, status: 'taken', type: 'mobil' },
    { id: 'D3', row: 'D', num: 3, status: 'available', type: 'mobil' },
    { id: 'D4', row: 'D', num: 4, status: 'taken', type: 'mobil' },
    { id: 'D5', row: 'D', num: 5, status: 'available', type: 'mobil' },
    { id: 'D6', row: 'D', num: 6, status: 'available', type: 'mobil' },
    { id: 'D7', row: 'D', num: 7, status: 'taken', type: 'mobil' },
    { id: 'D8', row: 'D', num: 8, status: 'available', type: 'mobil' },

    { id: 'E1', row: 'E', num: 1, status: 'available', type: 'mobil' },
    { id: 'E2', row: 'E', num: 2, status: 'available', type: 'mobil' },
    { id: 'E3', row: 'E', num: 3, status: 'taken', type: 'mobil' },
    { id: 'E4', row: 'E', num: 4, status: 'available', type: 'mobil' },
    { id: 'E5', row: 'E', num: 5, status: 'taken', type: 'mobil' },
    { id: 'E6', row: 'E', num: 6, status: 'available', type: 'mobil' },
    { id: 'E7', row: 'E', num: 7, status: 'available', type: 'mobil' },
    { id: 'E8', row: 'E', num: 8, status: 'available', type: 'mobil' },
  ],
  motor: []
};

// Generate 80 motorcycle slots: Rows M1 to M5 (5 rows), 16 cols (8 Left, 8 Right)
const motorRows = ['M1', 'M2', 'M3', 'M4', 'M5'];
motorRows.forEach((rName, rIdx) => {
  for (let c = 1; c <= 16; c++) {
    // Generate realistic distribution of taken vs available
    const isTaken = (rIdx * 16 + c) % 3 === 0 || (rIdx * 7 + c) % 5 === 0;
    const isMaint = (rName === 'M5' && (c === 15 || c === 16));
    let status = 'available';
    if (isMaint) status = 'not_available';
    else if (isTaken) status = 'taken';

    INITIAL_SLOTS.motor.push({
      id: `${rName}-${c < 10 ? '0' + c : c}`,
      row: rName,
      num: c,
      status: status,
      type: 'motor'
    });
  }
});

class UParkApp {
  constructor() {
    this.user = null;
    this.activeBooking = null; // { ticketId, areaId, slotId, plate, bookingTime, expiresAt, status: 'on_hold' | 'checked_in' }
    this.slots = JSON.parse(JSON.stringify(INITIAL_SLOTS));
    this.selectedArea = 'mobil';
    this.selectedSlotId = null;

    this.otpTimerInterval = null;
    this.otpRemainingSeconds = 60;

    this.bookingTimerInterval = null;
    this.bookingRemainingSeconds = 900; // 15:00 minutes

    this.logs = [
      { time: '21:15:02', text: 'IoT Gate UNIGA Broker Online (MQTT uniga/gate/status: 200)' },
      { time: '21:18:40', text: 'Ultrasonic Distance Sensor: Calibrated (Vehicle clear)' }
    ];

    this.init();
  }

  init() {
    this.loadStorage();
    this.setupEventListeners();
    this.startLiveClock();

    // Check if user is logged in
    if (!this.user) {
      this.switchView('view-auth');
    } else {
      this.updateUserUI();
      this.switchView('view-home');
      if (this.activeBooking && this.activeBooking.status === 'on_hold') {
        this.startBookingTimer();
      }
    }
  }

  // ==========================================
  // Storage Handling
  // ==========================================
  loadStorage() {
    try {
      const savedUser = localStorage.getItem('upark_user');
      if (savedUser) this.user = JSON.parse(savedUser);

      const savedBooking = localStorage.getItem('upark_booking');
      if (savedBooking) {
        this.activeBooking = JSON.parse(savedBooking);
        // If booking expired while app was closed
        if (this.activeBooking.status === 'on_hold' && this.activeBooking.expiresAt <= Date.now()) {
          this.handleBookingExpired();
        }
      }

      const savedSlots = localStorage.getItem('upark_slots');
      if (savedSlots) this.slots = JSON.parse(savedSlots);
    } catch (e) {
      console.error('Failed loading storage:', e);
    }
  }

  saveStorage() {
    try {
      if (this.user) localStorage.setItem('upark_user', JSON.stringify(this.user));
      else localStorage.removeItem('upark_user');

      if (this.activeBooking) localStorage.setItem('upark_booking', JSON.stringify(this.activeBooking));
      else localStorage.removeItem('upark_booking');

      localStorage.setItem('upark_slots', JSON.stringify(this.slots));
    } catch (e) {
      console.error('Failed saving storage:', e);
    }
  }

  // ==========================================
  // Navigation & Views
  // ==========================================
  switchView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(viewId);
    if (target) {
      target.classList.add('active');
    }

    // Bottom nav bar state
    const bottomNav = document.getElementById('bottom-nav');
    if (viewId === 'view-auth') {
      bottomNav.style.display = 'none';
    } else {
      bottomNav.style.display = 'flex';
      // Highlight matching tab
      document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
      if (viewId === 'view-home') document.getElementById('nav-home')?.classList.add('active');
      else if (viewId === 'view-ticket') document.getElementById('nav-ticket')?.classList.add('active');
      else if (viewId === 'view-profile') document.getElementById('nav-profile')?.classList.add('active');
    }

    // Scroll to top
    const container = document.getElementById('app-content');
    if (container) container.scrollTop = 0;

    // Refresh view specific contents
    if (viewId === 'view-home') this.renderHome();
    if (viewId === 'view-slots') this.renderSlots();
    if (viewId === 'view-ticket') this.renderTicket();
    if (viewId === 'view-profile') this.renderProfile();
    if (viewId === 'view-iot-sim') this.renderIoTSim();
  }

  // ==========================================
  // ALUR 1: Autentikasi (Login / Register & OTP)
  // ==========================================
  setupAuth() {
    // Tab switcher Masuk / Daftar
    const tabMasuk = document.getElementById('tab-masuk');
    const tabDaftar = document.getElementById('tab-daftar');
    const formMasuk = document.getElementById('form-masuk');
    const formDaftar = document.getElementById('form-daftar');
    const otpSection = document.getElementById('otp-section');

    tabMasuk?.addEventListener('click', () => {
      tabMasuk.classList.add('active');
      tabDaftar.classList.remove('active');
      formMasuk.style.display = 'block';
      formDaftar.style.display = 'none';
      otpSection.style.display = 'none';
    });

    tabDaftar?.addEventListener('click', () => {
      tabDaftar.classList.add('active');
      tabMasuk.classList.remove('active');
      formDaftar.style.display = 'block';
      formMasuk.style.display = 'none';
      otpSection.style.display = 'none';
    });

    // Show/Hide Password Buttons
    document.querySelectorAll('.toggle-password-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = btn.getAttribute('data-target');
        const input = document.getElementById(targetId);
        if (input) {
          if (input.type === 'password') {
            input.type = 'text';
            btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
          } else {
            input.type = 'password';
            btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
          }
        }
      });
    });

    // Real-time password match validation in Register Form
    const regPass = document.getElementById('reg-password');
    const regConfirm = document.getElementById('reg-confirm-password');
    const passMatchMsg = document.getElementById('pass-match-msg');

    const checkPasswordMatch = () => {
      if (!regPass.value || !regConfirm.value) {
        passMatchMsg.innerHTML = '';
        return;
      }
      if (regPass.value === regConfirm.value) {
        passMatchMsg.className = 'validation-message success';
        passMatchMsg.innerHTML = '✓ Password Cocok';
      } else {
        passMatchMsg.className = 'validation-message error';
        passMatchMsg.innerHTML = '✗ Password Belum Cocok';
      }
    };

    regPass?.addEventListener('input', checkPasswordMatch);
    regConfirm?.addEventListener('input', checkPasswordMatch);

    // Form Register Submit -> Go to OTP
    formDaftar?.addEventListener('submit', (e) => {
      e.preventDefault();
      const nama = document.getElementById('reg-nama').value.trim();
      const npm = document.getElementById('reg-npm').value.trim();
      const wa = document.getElementById('reg-wa').value.trim();
      const pass = regPass.value;
      const confirm = regConfirm.value;

      if (!nama || !npm || !wa || !pass) {
        this.showToast('Harap lengkapi semua data pendaftaran', 'danger');
        return;
      }
      if (pass !== confirm) {
        this.showToast('Konfirmasi password tidak cocok', 'danger');
        return;
      }

      this.tempAuthData = { name: nama, npm, wa, isFrozen: false, defaultPlate: 'Z 1234 GAR' };
      this.openOtpScreen(wa);
    });

    // Form Login Submit -> Go to OTP
    formMasuk?.addEventListener('submit', (e) => {
      e.preventDefault();
      const npm = document.getElementById('login-npm').value.trim();
      const pass = document.getElementById('login-password').value;

      if (!npm || !pass) {
        this.showToast('Masukkan NPM dan Password Anda', 'danger');
        return;
      }

      // Check if matches demo or existing user
      let userName = 'Rizky Muhammad Riady';
      let isFrozen = false;
      let plate = 'Z 1234 GAR';
      if (this.user && this.user.npm === npm) {
        userName = this.user.name;
        isFrozen = this.user.isFrozen;
        plate = this.user.defaultPlate || plate;
      }

      this.tempAuthData = { name: userName, npm, wa: '081234567890', isFrozen, defaultPlate: plate };
      this.openOtpScreen('081234567890');
    });

    // Quick Fill Demo Account
    document.getElementById('quick-fill-demo')?.addEventListener('click', () => {
      document.getElementById('login-npm').value = '240611001';
      document.getElementById('login-password').value = 'uniga123';
      this.showToast('Akun demo terisi otomatis', 'success');
    });

    // OTP Inputs Auto-advance
    const otpBoxes = document.querySelectorAll('.otp-box');
    otpBoxes.forEach((box, idx) => {
      box.addEventListener('input', (e) => {
        const val = e.target.value;
        if (val.length === 1 && idx < otpBoxes.length - 1) {
          otpBoxes[idx + 1].focus();
        }
      });
      box.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !box.value && idx > 0) {
          otpBoxes[idx - 1].focus();
        }
      });
    });

    // Auto-fill OTP Demo Button
    document.getElementById('btn-autofill-otp')?.addEventListener('click', () => {
      const demoCode = '123456';
      otpBoxes.forEach((b, i) => b.value = demoCode[i]);
      this.showToast('Kode OTP Demo (123456) diterapkan', 'success');
      // Auto submit OTP
      setTimeout(() => this.verifyOtp(), 300);
    });

    // Submit OTP Button
    document.getElementById('btn-verify-otp')?.addEventListener('click', () => {
      this.verifyOtp();
    });
  }

  openOtpScreen(waNumber) {
    document.getElementById('form-masuk').style.display = 'none';
    document.getElementById('form-daftar').style.display = 'none';
    document.getElementById('auth-tab-bar').style.display = 'none';

    const otpSection = document.getElementById('otp-section');
    otpSection.style.display = 'block';

    const waDisplay = document.getElementById('otp-wa-display');
    if (waDisplay) waDisplay.textContent = waNumber;

    // Reset OTP input boxes
    document.querySelectorAll('.otp-box').forEach(b => b.value = '');
    document.querySelector('.otp-box')?.focus();

    // Start 60s countdown
    this.otpRemainingSeconds = 60;
    this.updateOtpTimerDisplay();
    clearInterval(this.otpTimerInterval);
    this.otpTimerInterval = setInterval(() => {
      this.otpRemainingSeconds--;
      this.updateOtpTimerDisplay();
      if (this.otpRemainingSeconds <= 0) {
        clearInterval(this.otpTimerInterval);
      }
    }, 1000);
  }

  updateOtpTimerDisplay() {
    const el = document.getElementById('otp-countdown');
    if (el) {
      const sec = this.otpRemainingSeconds < 10 ? '0' + this.otpRemainingSeconds : this.otpRemainingSeconds;
      el.textContent = `00:${sec}`;
    }
  }

  verifyOtp() {
    const otpBoxes = document.querySelectorAll('.otp-box');
    let enteredCode = '';
    otpBoxes.forEach(b => enteredCode += b.value);

    if (enteredCode.length < 6) {
      this.showToast('Masukkan 6 digit kode OTP', 'danger');
      return;
    }

    if (enteredCode === '123456') {
      audio.beepSuccess();
      clearInterval(this.otpTimerInterval);

      // Save user logged in
      this.user = this.tempAuthData || {
        name: 'Rizky Muhammad Riady',
        npm: '240611001',
        wa: '081234567890',
        isFrozen: false,
        defaultPlate: 'Z 1234 GAR'
      };
      this.saveStorage();
      this.updateUserUI();

      this.showToast(`Selamat datang, ${this.user.name}!`, 'success');
      this.switchView('view-home');
    } else {
      audio.buzzerWarning();
      this.showToast('Kode OTP salah! (Gunakan demo: 123456)', 'danger');
    }
  }

  // ==========================================
  // ALUR 2: Halaman Beranda (M-Tix Style)
  // ==========================================
  renderHome() {
    this.updateUserUI();

    // Mobil slots counter
    const mobilTotal = this.slots.mobil.length;
    const mobilAvail = this.slots.mobil.filter(s => s.status === 'available').length;
    const mobilTaken = this.slots.mobil.filter(s => s.status === 'taken' || s.status === 'on_hold').length;
    const mobilPercent = Math.round((mobilTaken / mobilTotal) * 100);

    const elMobilAvail = document.getElementById('home-mobil-avail');
    if (elMobilAvail) elMobilAvail.textContent = `${mobilAvail} Tersedia`;
    const elMobilBar = document.getElementById('home-mobil-bar');
    if (elMobilBar) elMobilBar.style.width = `${mobilPercent}%`;

    // Motor slots counter
    const motorTotal = this.slots.motor.length;
    const motorAvail = this.slots.motor.filter(s => s.status === 'available').length;
    const motorTaken = this.slots.motor.filter(s => s.status === 'taken' || s.status === 'on_hold').length;
    const motorPercent = Math.round((motorTaken / motorTotal) * 100);

    const elMotorAvail = document.getElementById('home-motor-avail');
    if (elMotorAvail) elMotorAvail.textContent = `${motorAvail} Tersedia`;
    const elMotorBar = document.getElementById('home-motor-bar');
    if (elMotorBar) elMotorBar.style.width = `${motorPercent}%`;

    // Active Ticket Badge on Bottom Nav
    const ticketBadge = document.getElementById('nav-ticket-badge');
    if (ticketBadge) {
      ticketBadge.style.display = (this.activeBooking && this.activeBooking.status === 'on_hold') ? 'block' : 'none';
    }
  }

  updateUserUI() {
    if (!this.user) return;

    // Account Status Banner on Home
    const banner = document.getElementById('banner-account-status');
    if (banner) {
      if (this.user.isFrozen) {
        banner.className = 'account-status-pill frozen-status';
        banner.innerHTML = `
          <div class="status-text">
            <span>⚠️</span>
            <span>Status Akun: <strong>DIBEKUKAN</strong></span>
          </div>
          <span style="font-size: 10px; background: rgba(0,0,0,0.3); padding: 2px 6px; border-radius: 4px;">Sanksi 15 Menit</span>
        `;
      } else {
        banner.className = 'account-status-pill active-status';
        banner.innerHTML = `
          <div class="status-text">
            <span>✓</span>
            <span>Status Akun: <strong>Aktif (Bisa Booking)</strong></span>
          </div>
          <span style="font-size: 10px; color: #10B981;">NPM Terdaftar</span>
        `;
      }
    }
  }

  // ==========================================
  // ALUR 3: Halaman Denah Booking Slot (Cinema Seat)
  // ==========================================
  openSlotBooking(area) {
    this.selectedArea = area;
    this.selectedSlotId = null;
    this.switchView('view-slots');
  }

  renderSlots() {
    const titleEl = document.getElementById('slot-view-title');
    const capacityEl = document.getElementById('slot-view-capacity');
    const gridContainer = document.getElementById('slots-grid-container');

    if (!gridContainer) return;

    if (this.selectedArea === 'mobil') {
      titleEl.textContent = 'AREA PARKIR MOBIL';
      capacityEl.textContent = 'Kapasitas 40 Slot • Mobil / Roda 4';
      this.renderMobilGrid(gridContainer);
    } else {
      titleEl.textContent = 'AREA PARKIR MOTOR';
      capacityEl.textContent = 'Kapasitas 80 Slot • Sepeda Motor / Roda 2';
      this.renderMotorGrid(gridContainer);
    }

    this.updateSelectionSummary();
  }

  renderMobilGrid(container) {
    // Mobil: Rows A to E, 8 slots per row. Left 1-4, aisle, Right 5-8
    const rows = ['A', 'B', 'C', 'D', 'E'];
    let html = '';

    rows.forEach(r => {
      const rowSlots = this.slots.mobil.filter(s => s.row === r);
      const leftSlots = rowSlots.filter(s => s.num >= 1 && s.num <= 4);
      const rightSlots = rowSlots.filter(s => s.num >= 5 && s.num <= 8);

      html += `<div class="grid-row-container">`;
      html += `<div class="row-label">${r}</div>`;

      // Left block
      html += `<div class="block-slots-group">`;
      leftSlots.forEach(s => {
        html += this.renderSlotButton(s, 'car-slot');
      });
      html += `</div>`;

      // Center aisle
      html += `
        <div class="center-road-aisle">
          <div class="aisle-line"></div>
        </div>
      `;

      // Right block
      html += `<div class="block-slots-group">`;
      rightSlots.forEach(s => {
        html += this.renderSlotButton(s, 'car-slot');
      });
      html += `</div>`;

      html += `<div class="row-label">${r}</div>`;
      html += `</div>`;
    });

    container.innerHTML = html;
    this.attachSlotClickEvents();
  }

  renderMotorGrid(container) {
    // Motor: Rows M1 to M5, 16 slots per row. Left 1-8, aisle, Right 9-16
    const rows = ['M1', 'M2', 'M3', 'M4', 'M5'];
    let html = '';

    rows.forEach(r => {
      const rowSlots = this.slots.motor.filter(s => s.row === r);
      const leftSlots = rowSlots.filter(s => s.num >= 1 && s.num <= 8);
      const rightSlots = rowSlots.filter(s => s.num >= 9 && s.num <= 16);

      html += `<div class="grid-row-container" style="margin-bottom: 3px;">`;
      html += `<div class="row-label" style="font-size: 9px;">${r}</div>`;

      // Left block
      html += `<div class="block-slots-group" style="gap: 4px;">`;
      leftSlots.forEach(s => {
        html += this.renderSlotButton(s, 'motor-slot');
      });
      html += `</div>`;

      // Center aisle
      html += `
        <div class="center-road-aisle" style="width: 14px;">
          <div class="aisle-line" style="height: 22px;"></div>
        </div>
      `;

      // Right block
      html += `<div class="block-slots-group" style="gap: 4px;">`;
      rightSlots.forEach(s => {
        html += this.renderSlotButton(s, 'motor-slot');
      });
      html += `</div>`;

      html += `<div class="row-label" style="font-size: 9px;">${r}</div>`;
      html += `</div>`;
    });

    container.innerHTML = html;
    this.attachSlotClickEvents();
  }

  renderSlotButton(slot, extraClass) {
    let statusClass = `status-${slot.status}`;
    // If selected by user right now
    if (this.selectedSlotId === slot.id) {
      statusClass = 'status-onhold';
    }

    const shortLabel = slot.type === 'mobil' ? slot.id : slot.num;
    return `
      <div class="slot-box ${extraClass} ${statusClass}" 
           data-slot-id="${slot.id}" 
           data-slot-status="${slot.status}"
           title="Slot ${slot.id} (${slot.status.toUpperCase()})">
        ${shortLabel}
      </div>
    `;
  }

  attachSlotClickEvents() {
    document.querySelectorAll('.slot-box').forEach(box => {
      box.addEventListener('click', () => {
        const slotId = box.getAttribute('data-slot-id');
        const status = box.getAttribute('data-slot-status');

        if (status === 'taken') {
          this.showToast(`Slot ${slotId} sudah terisi kendaraan`, 'danger');
          return;
        }
        if (status === 'not_available') {
          this.showToast(`Slot ${slotId} dalam pemeliharaan (Closed)`, 'danger');
          return;
        }

        // Tap available slot
        audio.tap();
        if (this.selectedSlotId === slotId) {
          // Deselect
          this.selectedSlotId = null;
        } else {
          this.selectedSlotId = slotId;
        }

        this.renderSlots();
      });
    });
  }

  updateSelectionSummary() {
    const slotCodeEl = document.getElementById('selected-slot-code');
    const areaNameEl = document.getElementById('selected-area-name');
    const btnConfirm = document.getElementById('btn-confirm-slot');
    const frozenWarning = document.getElementById('slot-frozen-warning');

    if (!slotCodeEl || !btnConfirm) return;

    if (this.user && this.user.isFrozen) {
      if (frozenWarning) frozenWarning.style.display = 'block';
      btnConfirm.disabled = true;
      btnConfirm.textContent = 'Akun Dibekukan';
      slotCodeEl.textContent = '-';
      return;
    }

    if (frozenWarning) frozenWarning.style.display = 'none';

    if (this.selectedSlotId) {
      slotCodeEl.textContent = this.selectedSlotId;
      areaNameEl.textContent = this.selectedArea === 'mobil' ? 'Area Parkir Mobil UNIGA' : 'Area Parkir Motor UNIGA';
      btnConfirm.disabled = false;
      btnConfirm.textContent = 'Konfirmasi Booking →';
    } else {
      slotCodeEl.textContent = '-';
      areaNameEl.textContent = 'Pilih salah satu slot di atas';
      btnConfirm.disabled = true;
      btnConfirm.textContent = 'Pilih Slot';
    }
  }

  // ==========================================
  // ALUR 4: Konfirmasi Booking & Tiket QR
  // ==========================================
  openBookingConfirmationModal() {
    if (!this.selectedSlotId) return;

    if (this.user && this.user.isFrozen) {
      this.showToast('Akun Anda sedang DIBEKUKAN. Buka pembekuan di Profil atau Simulasi IoT.', 'danger');
      return;
    }

    // Strict rule: 1 Akun NPM = Maksimal 1 Slot Aktif
    if (this.activeBooking && (this.activeBooking.status === 'on_hold' || this.activeBooking.status === 'checked_in')) {
      audio.buzzerWarning();
      this.showToast(`Gagal! Akun Anda sudah memiliki booking aktif di Slot ${this.activeBooking.slotId}. (Maksimal 1 Slot per NPM)`, 'danger');
      return;
    }

    const modal = document.getElementById('modal-booking-confirm');
    const modalNama = document.getElementById('modal-conf-nama');
    const modalNpm = document.getElementById('modal-conf-npm');
    const modalSlot = document.getElementById('modal-conf-slot');
    const modalPlate = document.getElementById('modal-conf-plate');

    if (modalNama) modalNama.textContent = this.user.name;
    if (modalNpm) modalNpm.textContent = this.user.npm;
    if (modalSlot) modalSlot.textContent = `${this.selectedSlotId} (${this.selectedArea.toUpperCase()})`;
    if (modalPlate) modalPlate.value = this.user.defaultPlate || 'Z 1234 GAR';

    modal.classList.add('active');
  }

  confirmBooking() {
    const plateInput = document.getElementById('modal-conf-plate');
    const plate = plateInput ? plateInput.value.trim().toUpperCase() : 'Z 1234 GAR';

    if (!plate) {
      this.showToast('Masukkan nomor plat kendaraan Anda', 'danger');
      return;
    }

    // Close modal
    document.getElementById('modal-booking-confirm').classList.remove('active');

    // Create Booking
    const bookingTime = Date.now();
    const expiresAt = bookingTime + (15 * 60 * 1000); // 15:00 minutes
    const ticketId = `UPK-${this.user.npm.slice(-4)}-${this.selectedSlotId}`;

    this.activeBooking = {
      ticketId,
      areaId: this.selectedArea,
      slotId: this.selectedSlotId,
      plateNumber: plate,
      bookingTime,
      expiresAt,
      status: 'on_hold' // White on map
    };

    // Update slot status on map to 'on_hold'
    const targetSlot = this.slots[this.selectedArea].find(s => s.id === this.selectedSlotId);
    if (targetSlot) {
      targetSlot.status = 'on_hold';
    }

    this.addLog(`Booking dibuat oleh NPM ${this.user.npm} untuk Slot ${this.selectedSlotId} (Status: ON HOLD, Timer 15m)`);

    this.saveStorage();
    audio.beepSuccess();
    this.showToast(`Booking Berhasil! Tiket QR terbit untuk Slot ${this.selectedSlotId}`, 'success');

    // Reset selection & navigate to Tiket QR
    this.selectedSlotId = null;
    this.startBookingTimer();
    this.switchView('view-ticket');
  }

  startBookingTimer() {
    clearInterval(this.bookingTimerInterval);
    if (!this.activeBooking || this.activeBooking.status !== 'on_hold') return;

    const tick = () => {
      const now = Date.now();
      const diffMs = this.activeBooking.expiresAt - now;

      if (diffMs <= 0) {
        clearInterval(this.bookingTimerInterval);
        this.handleBookingExpired();
        return;
      }

      this.bookingRemainingSeconds = Math.floor(diffMs / 1000);
      this.updateBookingTimerDisplay();
    };

    tick();
    this.bookingTimerInterval = setInterval(tick, 1000);
  }

  updateBookingTimerDisplay() {
    const digitsEl = document.getElementById('ticket-timer-digits');
    if (!digitsEl) return;

    const mins = Math.floor(this.bookingRemainingSeconds / 60);
    const secs = this.bookingRemainingSeconds % 60;
    const formatted = `${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`;
    digitsEl.textContent = formatted;

    if (this.bookingRemainingSeconds <= 180) { // Under 3 minutes
      digitsEl.classList.add('warning-time');
    } else {
      digitsEl.classList.remove('warning-time');
    }
  }

  renderTicket() {
    const noTicketCard = document.getElementById('ticket-empty-card');
    const ticketCard = document.getElementById('ticket-active-card');

    if (!this.activeBooking) {
      if (noTicketCard) noTicketCard.style.display = 'block';
      if (ticketCard) ticketCard.style.display = 'none';
      return;
    }

    if (noTicketCard) noTicketCard.style.display = 'none';
    if (ticketCard) ticketCard.style.display = 'block';

    const b = this.activeBooking;
    document.getElementById('ticket-id-display').textContent = b.ticketId;
    document.getElementById('ticket-nama-val').textContent = this.user.name;
    document.getElementById('ticket-npm-val').textContent = this.user.npm;
    document.getElementById('ticket-slot-val').textContent = `${b.slotId} (${b.areaId === 'mobil' ? 'Parkir Mobil' : 'Parkir Motor'})`;
    document.getElementById('ticket-plate-val').textContent = b.plateNumber;

    // Status pill
    const statusPill = document.getElementById('ticket-status-pill');
    const timerHeader = document.getElementById('ticket-timer-header');
    const simScanBtn = document.getElementById('btn-sim-gate-scan');
    const checkoutBtn = document.getElementById('btn-sim-checkout');
    const simTimeoutBtn = document.getElementById('btn-sim-timeout');

    if (b.status === 'on_hold') {
      statusPill.innerHTML = `<span style="background: #E2E8F0; color: #0F172A; padding: 4px 10px; border-radius: 6px; font-weight: 800;">ON HOLD (MENUNGGU SCAN QR)</span>`;
      timerHeader.style.display = 'block';
      simScanBtn.style.display = 'flex';
      simTimeoutBtn.style.display = 'flex';
      checkoutBtn.style.display = 'none';
    } else if (b.status === 'checked_in') {
      statusPill.innerHTML = `<span style="background: rgba(16, 185, 129, 0.2); border: 1px solid #10B981; color: #34D399; padding: 4px 10px; border-radius: 6px; font-weight: 800;">PARKIR AKTIF (CHECKED-IN)</span>`;
      timerHeader.style.display = 'none';
      simScanBtn.style.display = 'none';
      simTimeoutBtn.style.display = 'none';
      checkoutBtn.style.display = 'flex';
    }

    // Render Dynamic QR Code using standalone engine
    const qrContainer = document.getElementById('qrcode-canvas-wrap');
    if (qrContainer && window.UParkQR) {
      const qrData = JSON.stringify({
        id: b.ticketId,
        npm: this.user.npm,
        slot: b.slotId,
        area: b.areaId,
        plate: b.plateNumber,
        status: b.status
      });
      qrContainer.innerHTML = window.UParkQR.generateSVG(qrData, 190, '#0B252A', '#FFFFFF');
    }
  }

  // ==========================================
  // Check-in IoT Simulation
  // ==========================================
  simulateGateScan() {
    if (!this.activeBooking || this.activeBooking.status !== 'on_hold') return;

    audio.beepSuccess();
    clearInterval(this.bookingTimerInterval);

    // Update status to checked_in
    this.activeBooking.status = 'checked_in';
    this.activeBooking.checkInTime = Date.now();

    // In parking map, convert slot from on_hold (White) to taken (Brick Red #C84B31)
    const slot = this.slots[this.activeBooking.areaId].find(s => s.id === this.activeBooking.slotId);
    if (slot) {
      slot.status = 'taken';
    }

    this.addLog(`[ESP32 GATE] QR Scanned: Tiket ${this.activeBooking.ticketId} MATCH! Servo arm UP 90 deg.`);
    this.saveStorage();

    // Show Gate Modal Animation
    this.showGateOpenModal('Gerbang Terbuka!', `QR Code Terverifikasi untuk Slot ${this.activeBooking.slotId}. Palang gerbang membuka, silakan memarkirkan kendaraan Anda.`);

    this.renderTicket();
    this.renderHome();
  }

  simulateCheckOut() {
    if (!this.activeBooking) return;

    audio.beepSuccess();
    // Return slot to available
    const slot = this.slots[this.activeBooking.areaId].find(s => s.id === this.activeBooking.slotId);
    if (slot) {
      slot.status = 'available';
    }

    this.addLog(`[GATE EXIT] Kendaraan ${this.activeBooking.plateNumber} keluar gerbang. Slot ${this.activeBooking.slotId} kembali AVAILABLE.`);

    const completedSlot = this.activeBooking.slotId;
    this.activeBooking = null;
    this.saveStorage();

    this.showGateOpenModal('Gerbang Keluar Terbuka', `Terima kasih telah menggunakan u.park by UNIGA! Slot ${completedSlot} telah dibebaskan.`);

    this.renderTicket();
    this.renderHome();
  }

  // ==========================================
  // Account Freeze Mechanism (>15 Menit)
  // ==========================================
  handleBookingExpired() {
    audio.buzzerWarning();
    clearInterval(this.bookingTimerInterval);

    if (this.activeBooking) {
      // Slot reverts to available (#1C3338)
      const slot = this.slots[this.activeBooking.areaId].find(s => s.id === this.activeBooking.slotId);
      if (slot) {
        slot.status = 'available';
      }
      this.addLog(`[TIMEOUT] Batas waktu 15m terlampaui untuk Tiket ${this.activeBooking.ticketId}. Slot ${this.activeBooking.slotId} DIBATALKAN!`);
    }

    // Freeze student account
    if (this.user) {
      this.user.isFrozen = true;
      this.user.frozenReason = 'Tidak melakukan Scan QR di gerbang dalam batas waktu 15 menit';
    }

    this.activeBooking = null;
    this.saveStorage();

    // Alert User
    this.showAccountFrozenModal();

    this.updateUserUI();
    this.renderTicket();
    this.renderHome();
  }

  showAccountFrozenModal() {
    const modal = document.getElementById('modal-frozen-alert');
    if (modal) modal.classList.add('active');
  }

  unfreezeAccount() {
    if (this.user) {
      this.user.isFrozen = false;
      this.user.frozenReason = null;
      this.saveStorage();
      audio.beepSuccess();
      this.showToast('Akun NPM berhasil dipulihkan! Status kembali Aktif.', 'success');
      this.updateUserUI();
      this.renderHome();
      this.renderProfile();
      this.renderIoTSim();
    }
  }

  resetAllDemoData() {
    this.slots = JSON.parse(JSON.stringify(INITIAL_SLOTS));
    this.activeBooking = null;
    if (this.user) {
      this.user.isFrozen = false;
      this.user.frozenReason = null;
    }
    clearInterval(this.bookingTimerInterval);
    this.saveStorage();
    audio.beepSuccess();
    this.showToast('Semua data denah dan status berhasil di-reset ke kondisi awal.', 'success');
    this.updateUserUI();
    this.renderHome();
    this.renderSlots();
    this.renderTicket();
    this.renderProfile();
    this.renderIoTSim();
  }

  // ==========================================
  // Gate Visualizer Modal
  // ==========================================
  showGateOpenModal(title, msg) {
    const modal = document.getElementById('modal-gate-sim');
    const titleEl = document.getElementById('gate-modal-title');
    const msgEl = document.getElementById('gate-modal-msg');
    const arm = document.getElementById('modal-gate-arm');
    const led = document.getElementById('modal-gate-led');

    if (titleEl) titleEl.textContent = title;
    if (msgEl) msgEl.textContent = msg;

    modal.classList.add('active');

    // Barrier animation
    if (arm) arm.classList.add('open');
    if (led) led.classList.add('green-on');

    setTimeout(() => {
      if (arm) arm.classList.remove('open');
      if (led) led.classList.remove('green-on');
    }, 4500);
  }

  // ==========================================
  // ALUR 5: IoT Scanner Simulation Center
  // ==========================================
  renderIoTSim() {
    const logContainer = document.getElementById('iot-logs-wrap');
    if (logContainer) {
      logContainer.innerHTML = this.logs.map(l => `
        <div style="font-family: monospace; font-size: 11px; margin-bottom: 4px; color: #8FA6AC;">
          <span style="color: #26A69A;">[${l.time}]</span> ${l.text}
        </div>
      `).join('');
      logContainer.scrollTop = logContainer.scrollHeight;
    }

    const simStatusText = document.getElementById('iot-sim-user-status');
    if (simStatusText && this.user) {
      simStatusText.textContent = this.user.isFrozen ? 'DIBEKUKAN (Akun Diblokir)' : 'AKTIF (Normal)';
      simStatusText.style.color = this.user.isFrozen ? '#F87171' : '#34D399';
    }
  }

  addLog(text) {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    this.logs.push({ time: timeStr, text });
    if (this.logs.length > 25) this.logs.shift();
    this.renderIoTSim();
  }

  // ==========================================
  // ALUR 6: Profil Mahasiswa
  // ==========================================
  renderProfile() {
    if (!this.user) return;

    document.getElementById('profile-nama').textContent = this.user.name;
    document.getElementById('profile-npm').textContent = `NPM: ${this.user.npm}`;
    document.getElementById('profile-wa').textContent = this.user.wa;

    const statusBadge = document.getElementById('profile-status-badge');
    const unfreezeBtn = document.getElementById('profile-unfreeze-btn');

    if (this.user.isFrozen) {
      statusBadge.className = 'account-status-pill frozen-status';
      statusBadge.innerHTML = '⚠️ Akun Dibekukan (Pelanggaran Waktu 15 Menit)';
      if (unfreezeBtn) unfreezeBtn.style.display = 'block';
    } else {
      statusBadge.className = 'account-status-pill active-status';
      statusBadge.innerHTML = '✓ Akun Aktif & Terverifikasi (Universitas Garut)';
      if (unfreezeBtn) unfreezeBtn.style.display = 'none';
    }
  }

  logout() {
    localStorage.removeItem('upark_user');
    this.user = null;
    this.switchView('view-auth');
    document.getElementById('form-masuk').style.display = 'block';
    document.getElementById('form-daftar').style.display = 'none';
    document.getElementById('otp-section').style.display = 'none';
    document.getElementById('auth-tab-bar').style.display = 'flex';
    this.showToast('Anda telah keluar dari aplikasi', 'success');
  }

  // ==========================================
  // Utility & Event Listeners
  // ==========================================
  startLiveClock() {
    const updateTime = () => {
      const now = new Date();
      // Date formatting in Indonesian
      const options = { weekday: 'short', day: 'numeric', month: 'short' };
      const dateStr = now.toLocaleDateString('id-ID', options);
      const timeStr = now.toTimeString().split(' ')[0] + ' WIB';

      const clockDate = document.getElementById('realtime-date');
      const clockTime = document.getElementById('realtime-time');
      if (clockDate) clockDate.textContent = dateStr;
      if (clockTime) clockTime.textContent = timeStr;

      // Smartphone bar clock
      const barTime = document.getElementById('mobile-bar-time');
      if (barTime) {
        const h = now.getHours().toString().padStart(2, '0');
        const m = now.getMinutes().toString().padStart(2, '0');
        barTime.textContent = `${h}:${m}`;
      }
    };

    updateTime();
    setInterval(updateTime, 1000);
  }

  showToast(message, type = 'info') {
    const toast = document.getElementById('toast-notice');
    if (!toast) return;

    toast.className = `toast-notice ${type} show`;
    toast.textContent = message;

    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  setupEventListeners() {
    this.setupAuth();

    // Home 3 Menu Buttons
    document.getElementById('btn-menu-mobil')?.addEventListener('click', () => {
      this.openSlotBooking('mobil');
    });
    document.getElementById('btn-menu-motor')?.addEventListener('click', () => {
      this.openSlotBooking('motor');
    });
    document.getElementById('btn-menu-iot')?.addEventListener('click', () => {
      this.switchView('view-iot-sim');
    });

    // Home 2 Area Cards
    document.getElementById('card-area-mobil')?.addEventListener('click', () => {
      this.openSlotBooking('mobil');
    });
    document.getElementById('card-area-motor')?.addEventListener('click', () => {
      this.openSlotBooking('motor');
    });

    // Slot view back button
    document.getElementById('btn-back-slots')?.addEventListener('click', () => {
      this.switchView('view-home');
    });

    // Confirm booking buttons
    document.getElementById('btn-confirm-slot')?.addEventListener('click', () => {
      this.openBookingConfirmationModal();
    });
    document.getElementById('btn-modal-confirm-booking')?.addEventListener('click', () => {
      this.confirmBooking();
    });
    document.getElementById('btn-modal-cancel-booking')?.addEventListener('click', () => {
      document.getElementById('modal-booking-confirm').classList.remove('active');
    });

    // Ticket Simulation Buttons
    document.getElementById('btn-sim-gate-scan')?.addEventListener('click', () => {
      this.simulateGateScan();
    });
    document.getElementById('btn-sim-timeout')?.addEventListener('click', () => {
      this.handleBookingExpired();
    });
    document.getElementById('btn-sim-checkout')?.addEventListener('click', () => {
      this.simulateCheckOut();
    });

    // Close Modals
    document.getElementById('btn-close-gate-modal')?.addEventListener('click', () => {
      document.getElementById('modal-gate-sim').classList.remove('active');
    });
    document.getElementById('btn-close-frozen-modal')?.addEventListener('click', () => {
      document.getElementById('modal-frozen-alert').classList.remove('active');
      this.switchView('view-profile');
    });

    // Unfreeze Demo Buttons
    document.getElementById('profile-unfreeze-btn')?.addEventListener('click', () => {
      this.unfreezeAccount();
    });
    document.getElementById('iot-unfreeze-btn')?.addEventListener('click', () => {
      this.unfreezeAccount();
    });

    // Reset Demo buttons
    document.getElementById('profile-reset-demo-btn')?.addEventListener('click', () => {
      this.resetAllDemoData();
    });
    document.getElementById('iot-reset-demo-btn')?.addEventListener('click', () => {
      this.resetAllDemoData();
    });

    // IoT Sim direct actions
    document.getElementById('iot-action-scan-btn')?.addEventListener('click', () => {
      if (this.activeBooking && this.activeBooking.status === 'on_hold') {
        this.simulateGateScan();
      } else {
        this.showGateOpenModal('Scan IoT Gerbang', 'Simulasi sensor mendeteksi kendaraan. Palang gerbang berputar 90 derajat.');
      }
    });

    document.getElementById('iot-action-timeout-btn')?.addEventListener('click', () => {
      this.handleBookingExpired();
    });

    // Logout button
    document.getElementById('btn-logout')?.addEventListener('click', () => {
      this.logout();
    });

    // Bottom Navigation Bar
    document.getElementById('nav-home')?.addEventListener('click', () => this.switchView('view-home'));
    document.getElementById('nav-ticket')?.addEventListener('click', () => this.switchView('view-ticket'));
    document.getElementById('nav-profile')?.addEventListener('click', () => this.switchView('view-profile'));
  }
}

// Instantiate on DOM loaded
window.addEventListener('DOMContentLoaded', () => {
  window.uparkApp = new UParkApp();
});
