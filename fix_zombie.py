import re

with open('index.html', 'r') as f:
    text = f.read()

# I need to look for any remaining auto-migrate blocks
import re

blocks = re.findall(r'if \([a-zA-Z0-9_]+\.length === 0 && [a-zA-Z0-9_]+ && [a-zA-Z0-9_]+ !== \'\[\]\'\) \{', text)
print("Auto migrate blocks found:", len(blocks))
print(blocks)
