with open('js/app.js', 'r') as f:
    lines = f.readlines()

new_func = """        window.renderGameDetails = (gameId) => {
            const event = window.allEvents.find(e => String(e.id) === String(gameId));
            if (!event) return;
            window.openGameDrawer(event);
        };\n"""

# find start
start_idx = -1
for i, line in enumerate(lines):
    if "window.renderGameDetails =" in line:
        start_idx = i
        break

if start_idx != -1:
    # find end which is line containing "window.renderGamePerformance = "
    end_idx = -1
    for i in range(start_idx, len(lines)):
        if "window.renderGamePerformance =" in line:
             end_idx = i
             break
        # I actually just want to remove the whole block.
        # Let's find the end of renderGameDetails by counting braces.

    brace_count = 0
    in_func = False
    for i in range(start_idx, len(lines)):
        if "{" in lines[i]:
            brace_count += lines[i].count("{")
            in_func = True
        if "}" in lines[i]:
            brace_count -= lines[i].count("}")
        if in_func and brace_count == 0:
            end_idx = i
            break

    if end_idx != -1:
        del lines[start_idx:end_idx+1]
        lines.insert(start_idx, new_func)
        with open('js/app.js', 'w') as f:
            f.writelines(lines)
        print("Success")
    else:
        print("Could not find end of function")
