import re

with open('index.html', 'r') as f:
    content = f.read()

match = re.search(r'<select id="user-profile-select"[\s\S]*?<\/select>', content)
if match:
    print(match.group(0))
