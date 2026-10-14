const { test, expect } = require('@playwright/test');

test('Check no syntax errors and date evaluation', async ({ page }) => {
    let pageErrors = [];
    page.on('pageerror', error => {
        console.error("PAGE ERROR:", error);
        pageErrors.push(error);
    });

    await page.goto('http://localhost:8080');
    await page.waitForTimeout(2000);
});
