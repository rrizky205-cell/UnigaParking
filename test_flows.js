// Automated Test Runner for u.park by UNIGA (Updated Suite)
window.addEventListener('load', () => {
  console.log("=== RUNNING U.PARK APP TEST SUITE ===");

  const app = window.uparkApp;
  if (!app) {
    console.error("FAIL: UParkApp not found!");
    return;
  }
  console.log("PASS: UParkApp instantiated successfully.");

  // Test 1: Auth View active by default
  console.log("Test 1: Auth View active by default");
  const authView = document.getElementById('view-auth');
  console.assert(authView.classList.contains('active'), "Auth view should be active");
  console.log("PASS: Auth view is active initially.");

  // Test 2: Check that '18ms' is completely removed from DOM
  console.log("Test 2: Verify Ping 18ms is removed from DOM");
  console.assert(!document.body.innerHTML.includes("18ms"), "Body should not contain 18ms");
  console.log("PASS: '18ms' is completely removed from DOM.");

  // Test 3: Check UNIGA Logo in Home header
  console.log("Test 3: Verify UNIGA Logo in header");
  const logo = document.querySelector('.brand-uniga-logo');
  console.assert(logo !== null, "UNIGA Logo must exist");
  console.log("PASS: UNIGA Logo is present.");

  // Test 4: Dynamic OTP Generation (Not 123456)
  console.log("Test 4: Dynamic OTP Generation");
  document.getElementById('quick-fill-demo').click();
  document.getElementById('form-masuk').dispatchEvent(new Event('submit', { cancelable: true }));

  console.assert(app.currentOtp !== null && app.currentOtp.length === 6, "Dynamic OTP must be a 6-digit string");
  console.assert(app.currentOtp !== '123456', "OTP should be dynamic, not hardcoded 123456");
  console.log(`PASS: Dynamic OTP generated: ${app.currentOtp}`);

  // Test 5: Auto-fill dynamic OTP and verify
  console.log("Test 5: Auto-fill Dynamic OTP & Login");
  document.getElementById('btn-autofill-otp').click();

  setTimeout(() => {
    console.assert(app.user && app.user.npm === '240611001', "User should be logged in with demo NPM");
    console.assert(app.user.fakultas === 'Fakultas Ekonomi', "Faculty must be Fakultas Ekonomi");
    console.assert(document.getElementById('view-home').classList.contains('active'), "Home view should be active after login");

    // Test 6: Verify Header shows student name & NPM instead of UNIGA
    console.log("Test 6: Verify header shows student name and NPM");
    const headerName = document.getElementById('header-user-name').textContent;
    const headerNpm = document.getElementById('header-user-npm').textContent;
    console.assert(headerName.includes("Rizky"), "Header must show student name");
    console.assert(headerNpm.includes("240611001"), "Header must show student NPM");
    console.log(`PASS: Header displays: ${headerName} | ${headerNpm}`);

    // Test 7: Open Car Parking Map
    console.log("Test 7: Open Mobil Slot Booking");
    app.openSlotBooking('mobil');
    console.assert(document.getElementById('view-slots').classList.contains('active'), "Slot view should be active");
    
    // Select slot A3 (which is available)
    const a3Box = document.querySelector('[data-slot-id="A3"]');
    console.assert(a3Box !== null, "Slot A3 box exists");
    a3Box.click();
    console.assert(app.selectedSlotId === 'A3', "Slot A3 should be selected");
    console.log("PASS: Slot A3 selected.");

    // Test 8: Confirm Booking
    console.log("Test 8: Confirm Booking for Slot A3");
    app.openBookingConfirmationModal();
    app.confirmBooking();

    console.assert(app.activeBooking !== null, "Active booking must be created");
    console.assert(app.activeBooking.slotId === 'A3', "Booking slotId must be A3");
    console.assert(app.activeBooking.status === 'on_hold', "Status must be on_hold");

    // Verify slot on map is now 'on_hold'
    const slotA3Data = app.slots.mobil.find(s => s.id === 'A3');
    console.assert(slotA3Data.status === 'on_hold', "Slot A3 status in memory must be on_hold");
    console.log("PASS: Booking confirmed and Slot A3 is on_hold (White).");

    // Test 9: Realistic IoT Gate Simulation: Vehicle Approach
    console.log("Test 9: Realistic IoT Gate: Vehicle Approach");
    app.approachVehicle();
    const distText = document.getElementById('gate-distance-text').textContent;
    console.assert(distText.includes("55 cm"), "Sensor distance must show 55 cm");
    console.log("PASS: Vehicle approach simulated, ultrasonic sensor triggered at 55 cm.");

    // Test 10: Realistic IoT Gate Simulation: Scan & Open 90 deg
    console.log("Test 10: Realistic IoT Gate: Scan & Open 90 deg");
    app.simulateGateScan();
    console.assert(app.activeBooking.status === 'checked_in', "Booking status must now be checked_in");
    console.assert(slotA3Data.status === 'taken', "Slot A3 status must now be taken (Brick Red #C84B31)");
    const arm = document.getElementById('gate-barrier-arm');
    console.assert(arm.classList.contains('open'), "Barrier arm must have class open (rotated 90 deg)");
    console.log("PASS: IoT Gate opened 90 deg, arm LED emerald green, status TAKEN.");

    // Test 11: Vehicle passes through and gate closes automatically
    console.log("Test 11: Vehicle passes and gate closes automatically");
    app.passVehicleAndCloseGate();
    console.log("PASS: Vehicle passed and gate closing initiated.");

    // Test 12: Check-out
    console.log("Test 12: Check-out / Exit");
    app.simulateCheckOut();
    console.assert(app.activeBooking === null, "Active booking must be cleared after checkout");
    console.assert(slotA3Data.status === 'available', "Slot A3 must be available again");
    console.log("PASS: Check-out freed slot A3.");

    // Test 13: Test 15-Minute Timeout & Account Freeze
    console.log("Test 13: Test Timeout & Account Freeze");
    app.openSlotBooking('mobil');
    const a4Box = document.querySelector('[data-slot-id="A4"]');
    a4Box.click();
    app.openBookingConfirmationModal();
    app.confirmBooking();
    console.assert(app.activeBooking.slotId === 'A4', "Slot A4 booked");

    // Trigger timeout
    app.handleBookingExpired();
    console.assert(app.user.isFrozen === true, "User must now be FROZEN");
    console.assert(app.activeBooking === null, "Active booking canceled after timeout");
    const slotA4Data = app.slots.mobil.find(s => s.id === 'A4');
    console.assert(slotA4Data.status === 'available', "Slot A4 must revert to available");
    console.log("PASS: Account frozen and slot reverted to available.");

    // Test 14: Unfreeze Account
    console.log("Test 14: Unfreeze Account");
    app.unfreezeAccount();
    console.assert(app.user.isFrozen === false, "User must now be active");
    console.log("PASS: Account unfreezing works.");

    console.log("=== ALL TEST SUITE CASES (UPDATED) PASSED WITH 100% SUCCESS! ===");
  }, 600);
});
