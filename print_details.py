with open('js/app.js', 'r') as f:
    content = f.read()

start_idx = content.find("window.renderGameDetails = (gameId) => {")
if start_idx != -1:
    print(content[start_idx:start_idx+1000])
