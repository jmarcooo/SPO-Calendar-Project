with open('index.html', 'r') as f:
    lines = f.readlines()

for i, l in enumerate(lines):
    if 'window.addBudgetItem =' in l:
        print("Found at line:", i)
        break
else:
    print("NOT FOUND")
