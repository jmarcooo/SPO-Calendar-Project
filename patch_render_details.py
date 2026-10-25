import re

with open('js/app.js', 'r') as f:
    content = f.read()

# Replace renderGameDetails with logic that just opens the drawer
old_render_game_details_pattern = r'window\.renderGameDetails = \(gameId\) => \{[\s\S]*?window\.renderGamePerformance\(event\);\n        \};'

new_render_game_details = """window.renderGameDetails = (gameId) => {
            const event = window.allEvents.find(e => String(e.id) === String(gameId));
            if (!event) return;
            window.openGameDrawer(event);
        };"""

content = re.sub(old_render_game_details_pattern, new_render_game_details, content)

with open('js/app.js', 'w') as f:
    f.write(content)
