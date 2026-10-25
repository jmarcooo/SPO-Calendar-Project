with open('js/app.js', 'r') as f:
    lines = f.readlines()

funcs_to_remove = [
    "window.renderGameCarousel = ",
    "window.prevGameCarousel = ",
    "window.nextGameCarousel = ",
    "window.goToGameCarouselSlide = ",
    "window.renderGameRightSide = ",
    "window.renderGamePerformance = "
]

indices_to_delete = []

for func in funcs_to_remove:
    start_idx = -1
    for i, line in enumerate(lines):
        if func in line:
            start_idx = i
            break

    if start_idx != -1:
        brace_count = 0
        in_func = False
        end_idx = -1
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
            indices_to_delete.append((start_idx, end_idx))

# Sort in reverse order to delete from bottom up
indices_to_delete.sort(reverse=True)
for start, end in indices_to_delete:
    del lines[start:end+1]

with open('js/app.js', 'w') as f:
    f.writelines(lines)
print("Removed old unused game functions")
