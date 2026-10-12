with open('index.html', 'r') as f:
    content = f.read()

search_init = """        window.initApp = () => {"""
replace_init = """        window.initApp = () => {
            const today = new Date();
            window.budgetFilterMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
"""
content = content.replace(search_init, replace_init)

with open('index.html', 'w') as f:
    f.write(content)
