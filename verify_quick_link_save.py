import os
from playwright.sync_api import sync_playwright

def run_cuj(page):
    page.goto("http://localhost:8080")
    page.wait_for_timeout(1000)

    # Click Add Quick Link
    page.locator("button[title='Add Quick Link']").click()
    page.wait_for_timeout(500)

    # Fill form
    page.locator("#ql-title").fill("Google")
    page.wait_for_timeout(200)
    page.locator("#ql-url").fill("https://google.com")
    page.wait_for_timeout(200)
    page.locator("#ql-created-by").fill("Test User")
    page.wait_for_timeout(500)

    # Save
    page.locator("#save-ql-btn").click()
    page.wait_for_timeout(1500)

    # Verify link was created
    assert page.locator("text=Google").is_visible()

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()
        try:
            run_cuj(page)
            print("Quick link saved and verified successfully.")
        finally:
            context.close()
            browser.close()
