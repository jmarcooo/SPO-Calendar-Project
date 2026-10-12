with open('index.html', 'r') as f:
    content = f.read()

# Fix the active month display
search_initApp = """        window.initApp = () => {
            const today = new Date();
            window.budgetFilterMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;"""

replace_initApp = """        window.initApp = () => {
            const today = new Date();
            window.budgetFilterMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
            const filterEl = document.getElementById('budget-filter-month');
            if(filterEl) filterEl.value = window.budgetFilterMonth;"""

if search_initApp in content:
    content = content.replace(search_initApp, replace_initApp)

search_render = """        window.renderBudgetTable = () => {
            const table = document.getElementById('budget-table-body');
            if (!table) return;"""

replace_render = """        window.renderBudgetTable = () => {
            const table = document.getElementById('budget-table-body');
            if (!table) return;
            const filterEl = document.getElementById('budget-filter-month');
            if(filterEl && !filterEl.value && window.budgetFilterMonth) filterEl.value = window.budgetFilterMonth;"""

if search_render in content:
    content = content.replace(search_render, replace_render)

with open('index.html', 'w') as f:
    f.write(content)
