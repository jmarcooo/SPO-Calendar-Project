import urllib.request
import json

url = "https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/calendar-days.svg"
try:
    with urllib.request.urlopen(url) as response:
        svg_content = response.read().decode('utf-8')
        print(svg_content)
except Exception as e:
    print(f"Error: {e}")
