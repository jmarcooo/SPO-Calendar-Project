import re

with open('js/app.js', 'r') as f:
    content = f.read()

# Replace the specific old renderGameDetails logic using regex since I now know what it looks like
old_pattern = r'window\.renderGameDetails = \(gameId\) => \{[\s\S]*?renderGamePerformance\(gameId\);\n        \};'

new_func = """window.renderGameDetails = (gameId) => {
            const event = window.allEvents.find(e => String(e.id) === String(gameId));
            if (!event) return;
            window.openGameDrawer(event);
        };"""

content = re.sub(old_pattern, new_func, content)

with open('js/app.js', 'w') as f:
    f.write(content)
