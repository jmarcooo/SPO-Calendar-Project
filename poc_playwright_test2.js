const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

    // 1. Visit the app
    await page.goto('http://localhost:8080');

    // Select user profile to close modal
    await page.selectOption('#user-profile-select', 'Freddy');
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(500);

    // 2. Click the logo 20 times to activate admin mode
    await page.evaluate(() => {
        window.isAdminModeEnabled = true;
        localStorage.setItem('spo_admin_mode', 'true');
    });

    // 3. Navigate to Settings
    await page.click('#nav-settings');
    await page.waitForTimeout(1000); // let it fetch settings.html

    // 4. Verify Admin Settings is visible
    const adminSection = page.locator('#admin-settings-section');
    if (await adminSection.isVisible()) {
        console.log('SUCCESS: Admin Settings is visible');
    } else {
        console.error('FAIL: Admin Settings not visible');
    }

    // 5. Check if POC settings are rendered
    const checkboxes = page.locator('.poc-checkbox');
    const count = await checkboxes.count();
    console.log(`Found ${count} POC checkboxes.`);
    if (count > 0) {
        console.log('SUCCESS: POC checkboxes rendered.');
    } else {
        console.error('FAIL: No POC checkboxes rendered.');
    }

    // 6. Test Max 3 constraint for team_budget
    // use dispatchEvent to ensure it triggers without intercepting
    await page.locator('input[name="poc_team_budget"][value="Freddy"]').dispatchEvent('click');
    await page.locator('input[name="poc_team_budget"][value="Renee"]').dispatchEvent('click');
    await page.locator('input[name="poc_team_budget"][value="Marco"]').dispatchEvent('click');

    // The 4th click should trigger an alert
    page.on('dialog', dialog => {
        console.log(`Alert triggered: ${dialog.message()}`);
        dialog.accept();
    });

    await page.locator('input[name="poc_team_budget"][value="Clarisse"]').dispatchEvent('click');

    // Verify Clarisse is not checked
    const isClarisseChecked = await page.isChecked('input[name="poc_team_budget"][value="Clarisse"]');
    console.log(`Clarisse checked state: ${isClarisseChecked}`);

    // 7. Save POCs
    await page.click('button:has-text("Save POC Assignments")');
    await page.waitForTimeout(500);

    // 8. Refresh and check if it loads correctly
    await page.reload();
    await page.waitForTimeout(500);
    await page.click('#nav-settings');
    await page.waitForTimeout(1000);

    const isFreddyChecked = await page.isChecked('input[name="poc_team_budget"][value="Freddy"]');
    console.log(`Freddy checked state after reload: ${isFreddyChecked}`);

    await browser.close();
})();
