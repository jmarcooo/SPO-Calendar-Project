from playwright.sync_api import sync_playwright

def run_cuj(page):

    page.goto("http://localhost:3000")
    page.wait_for_timeout(1000)
    # Set dark mode
    page.evaluate("localStorage.setItem('spo_dark_mode', 'true')")
    page.evaluate("localStorage.setItem('spo_current_user', 'Liezl')")
    page.goto("http://localhost:3000")
    page.wait_for_timeout(1000)


if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Catch console logs
        page.on("console", lambda msg: print(f"Browser console: {msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: print(f"Browser error: {err}"))

        try:
            run_cuj(page)
        finally:
            browser.close()
