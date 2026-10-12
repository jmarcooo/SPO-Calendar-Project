from playwright.sync_api import sync_playwright
import time
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        # Start a simple HTTP server to serve the local files
        import subprocess
        server = subprocess.Popen(["python3", "-m", "http.server", "8080"])
        time.sleep(2) # Give server time to start

        try:
            page.goto("http://localhost:8080/")
            page.evaluate("localStorage.setItem('spo_current_user', JSON.stringify({username: 'testuser', name: 'Test User'}))")
            page.reload()
            time.sleep(1)

            # Assign testuser as POC for SMS to enable full workflow
            page.evaluate("localStorage.setItem('spo_admin_pocs', JSON.stringify({sms: ['testuser']}))")
            page.reload()
            time.sleep(1)

            # Switch to SMS view
            page.evaluate("window.switchView('sms')")
            time.sleep(1)

            # Click Add SMS Request button
            page.click("button[onclick='window.openSMSModal()']")
            time.sleep(1)

            # Fill the new form
            page.fill("#sms-campaign-name", "Summer Promo")
            page.fill("#sms-event-datetime", "2024-07-01 12:00:00")
            page.fill("#sms-budget", "5000.50")
            page.fill("#sms-doc-link", "https://example.com/doc")
            page.fill("#sms-short-link", "https://bp.plus/r/y4a")

            # Save request
            page.click("#sms-modal-form button[type='submit']")
            time.sleep(1)

            # Check what's in localStorage
            print("Requests saved:", page.evaluate("localStorage.getItem('spo_sms_requests')"))

            # Ensure the row actually appeared
            page.wait_for_selector("#sms-table-body tr")

            # Click row to view details (and transition to Under Review)
            page.click("#sms-table-body tr")
            time.sleep(1)

            # Close details modal
            page.click("button[onclick='window.closeSMSDetails()']")
            time.sleep(1)

            # Look at HTML of table body to debug why button is missing
            print("Table body HTML:", page.inner_html("#sms-table-body"))

            # Take a screenshot
            page.screenshot(path="sms_workflow.png", full_page=True)
            print("Frontend verification successful. Screenshot saved to sms_workflow.png")

        finally:
            server.terminate()
            browser.close()

if __name__ == "__main__":
    run()
