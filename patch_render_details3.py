with open('js/app.js', 'r') as f:
    content = f.read()

start_str = "window.renderGameDetails = (gameId) => {"
end_str = "window.renderGamePerformance(event);\n        };"

if start_str in content and end_str in content:
    start_idx = content.find(start_str)
    end_idx = content.find(end_str) + len(end_str)

    new_code = """window.renderGameDetails = (gameId) => {
            const event = window.allEvents.find(e => String(e.id) === String(gameId));
            if (!event) return;
            window.openGameDrawer(event);
        };"""

    content = content[:start_idx] + new_code + content[end_idx:]

    with open('js/app.js', 'w') as f:
        f.write(content)
