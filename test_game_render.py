from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        page.goto('http://localhost:3000')
        page.evaluate("localStorage.setItem('spo_current_user', 'Liezl')")
        page.reload()
        page.wait_for_timeout(2000)

        # Inject some mock data to verify render
        page.evaluate('''
            const mockEvents = [
                {
                    id: "g1",
                    itemType: "game",
                    title: "Mock Game",
                    startDate: "2026-10-01 00:00:00",
                    endDate: "2026-10-31 00:00:00",
                    iconUrl: "https://via.placeholder.com/150",
                    bannerUrl: "https://via.placeholder.com/600x200",
                    progress: 50
                }
            ];
            window.events = mockEvents;
            window.allEvents = mockEvents;
            window.currentMonth = 9; // October (0-indexed)
            window.currentYear = 2026;

            // Switch to new games view
            window.location.hash = '#/new-games';
        ''')
        page.wait_for_timeout(2000)

        # Force a render
        page.evaluate("window.renderGameCards()")
        page.wait_for_timeout(2000)

        page.screenshot(path='game_card_render_mock.png')

        browser.close()

if __name__ == "__main__":
    run()
