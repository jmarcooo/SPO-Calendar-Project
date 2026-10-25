import re

with open('js/app.js', 'r') as f:
    content = f.read()

# Instead of complex regex, let's just find where renderGameDetails is defined.
# I'll use simple string splitting.
parts = content.split('window.renderGameDetails = (gameId) => {')

if len(parts) == 2:
    # Now find the first closing bracket that marks the end of renderGameDetails
    # We can search for the end of that block.
    # It contains "window.renderGamePerformance(event);" in it.

    right_part = parts[1]

    # split right_part by window.renderGamePerformance(event); and then the first };
    sub_parts = right_part.split('window.renderGamePerformance(event);')
    if len(sub_parts) >= 2:
        after_performance = sub_parts[-1] # take the last one in case there are multiple
        # find first };
        close_idx = after_performance.find('};')
        if close_idx != -1:
            rest_of_file = after_performance[close_idx + 2:]

            new_func = """window.renderGameDetails = (gameId) => {
            const event = window.allEvents.find(e => String(e.id) === String(gameId));
            if (!event) return;
            window.openGameDrawer(event);
        };"""

            final_content = parts[0] + new_func + rest_of_file
            with open('js/app.js', 'w') as f:
                f.write(final_content)
                print("Successfully patched renderGameDetails")
        else:
            print("Could not find };")
    else:
        print("Could not find window.renderGamePerformance(event);")

else:
    print("Could not find window.renderGameDetails definition")
