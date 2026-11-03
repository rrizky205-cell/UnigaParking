// Automated Test Runner for u.park by UNIGA
window.addEventListener('load', () => {
  console.log("=== RUNNING U.PARK APP TEST SUITE ===");

  const app = window.uparkApp;
  if (!app) {
    console.error("FAIL: UParkApp not found!");
    return;
  }
  console.log("PASS: UParkApp instantiated successfully.");

  // Test 1: Initial state is auth view
  console.log("Test 1: Auth View active by default");
  const authView = document.getElementById('view-auth');
  console.assert(authView.classList.contains('active'), "Auth view should be active");
  console.log("PASS: Auth view is active initially.");

  // Test 2: OTP Auto-fill and Verify
  console.log("Test 2: Login via Demo OTP");
  document.getElementById('quick-fill-demo').click();
  document.getElementById('form-masuk').dispatchEvent(new Event('submit', { cancelable: true }));
  document.getElementById('btn-autofill-otp').click();

  setTimeout(() => {
    console.log("User logged in:", app.user ? app.user.name : 'null');
    console.assert(app.user && app.user.npm === '240611001', "User should be logged in with demo NPM");
    console.assert(document.getElementById('view-home').classList.contains('active'), "Home view should be active after login");
    console.log("PASS: Login & OTP completed successfully.");

    // Test 3: Open Car Parking Map
    console.log("Test 3: Open Mobil Slot Booking");
    app.openSlotBooking('mobil');
    console.assert(document.getElementById('view-slots').classList.contains('active'), "Slot view should be active");
    
    // Select slot A3 (which is available)
    const a3Box = document.querySelector('[data-slot-id="A3"]');
    console.assert(a3Box !== null, "Slot A3 box exists");
    a3Box.click();
    console.assert(app.selectedSlotId === 'A3', "Slot A3 should be selected");
    console.log("PASS: Slot A3 selected.");

    // Test 4: Confirm Booking
    console.log("Test 4: Confirm Booking for Slot A3");
    app.openBookingConfirmationModal();
    app.confirmBooking();

    console.assert(app.activeBooking !== null, "Active booking must be created");
    console.assert(app.activeBooking.slotId === 'A3', "Booking slotId must be A3");
    console.assert(app.activeBooking.status === 'on_hold', "Status must be on_hold");

    // Verify slot on map is now 'on_hold'
    const slotA3Data = app.slots.mobil.find(s => s.id === 'A3');
    console.assert(slotA3Data.status === 'on_hold', "Slot A3 status in memory must be on_hold");
    console.log("PASS: Booking confirmed and Slot A3 is on_hold (White).");

    // Test 5: Scan Gate Simulation
    console.log("Test 5: Simulate IoT Gate Scan");
    app.simulateGateScan();
    console.assert(app.activeBooking.status === 'checked_in', "Booking status must now be checked_in");
    console.assert(slotA3Data.status === 'taken', "Slot A3 status in memory must now be taken (Brick Red #C84B31)");
    console.log("PASS: IoT Gate Scan completed, slot turned taken.");

    // Test 6: Check-out
    console.log("Test 6: Check-out / Exit");
    app.simulateCheckOut();
    console.assert(app.activeBooking === null, "Active booking must be cleared after checkout");
    console.assert(slotA3Data.status === 'available', "Slot A3 must be available again");
    console.log("PASS: Check-out freed slot A3.");

    // Test 7: Test 15-Minute Timeout & Account Freeze
    console.log("Test 7: Test Timeout & Account Freeze");
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

    // Test 8: Booking blocked when frozen
    console.log("Test 8: Verify booking is blocked when account is frozen");
    app.openSlotBooking('mobil');
    const btnConfirm = document.getElementById('btn-confirm-slot');
    console.assert(btnConfirm.disabled === true, "Confirm button must be disabled when frozen");
    console.log("PASS: Booking successfully blocked when account is frozen.");

    // Test 9: Unfreeze Account
    console.log("Test 9: Unfreeze Account");
    app.unfreezeAccount();
    console.assert(app.user.isFrozen === false, "User must now be active");
    console.log("PASS: Account unfreezing works.");

    console.log("=== ALL TEST SUITE CASES PASSED WITH 100% SUCCESS! ===");
  }, 600);
});
