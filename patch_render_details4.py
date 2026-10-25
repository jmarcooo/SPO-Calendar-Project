with open('js/app.js', 'r') as f:
    content = f.read()

start_str = "window.renderGameDetails = (gameId) => {"
end_str = "window.renderGamePerformance(event);"
if start_str in content and end_str in content:
    start_idx = content.find(start_str)
    # find the closing brace after end_str
    temp_idx = content.find(end_str)
    brace_idx = content.find("};", temp_idx) + 2

    new_code = """window.renderGameDetails = (gameId) => {
            const event = window.allEvents.find(e => String(e.id) === String(gameId));
            if (!event) return;
            window.openGameDrawer(event);
        };"""

    content = content[:start_idx] + new_code + content[brace_idx:]

    with open('js/app.js', 'w') as f:
        f.write(content)
