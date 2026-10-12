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

            # Switch to budget view
            page.evaluate("window.switchView('budget')")
            time.sleep(1)

            # Click Add Budget button
            page.evaluate("window.openBudgetModal()")
            time.sleep(1)

            # Fill the new form
            page.fill("#budget-name", "Monthly Giveaway")
            page.select_option("#budget-type", "Campaign Expenses")

            # Ensure items list works
            # Item 1
            page.fill(".budget-item-amount", "100.50")

            # Add Item 2
            page.evaluate("window.addBudgetItem()")
            time.sleep(1)

            # Fill Item 2
            amounts = page.locator(".budget-item-amount")
            amounts.nth(1).fill("200.75")
            page.evaluate("window.calcBudgetTotal()") # Trigger total update
            time.sleep(1)

            # Check total display
            allocated_text = page.inner_text("#budget-allocated-display")
            print("Total allocated budget reads:", allocated_text)

            # Save request
            page.click("#save-budget-btn")
            time.sleep(1)

            # Ensure the row actually appeared
            page.wait_for_selector("#budget-table-body tr")

            # Look at HTML of table body to debug
            print("Table body HTML:", page.inner_html("#budget-table-body"))

            # Take a screenshot
            page.screenshot(path="budget_workflow.png", full_page=True)
            print("Frontend verification successful. Screenshot saved to budget_workflow.png")

        finally:
            server.terminate()
            browser.close()

if __name__ == "__main__":
    run()
