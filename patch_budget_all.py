with open('index.html', 'r') as f:
    content = f.read()

search_add_item = """        window.budgetItems = [];
        window.addBudgetItem = (item = null) => {
            const container = document.getElementById('budget-items-container');
            const itemId = Date.now().toString() + Math.random().toString(36).substr(2, 5);

            const div = document.createElement('div');
            div.className = "flex space-x-2 items-center bg-gray-50 p-2 rounded-xl border border-gray-200";
            div.id = `budget-item-${itemId}`;

            const selType = item ? item.type : 'UGC Rewards';
            const valAmt = item ? item.amount : '';

            div.innerHTML = `
                <div class="flex-1">
                    <select class="budget-item-type block w-full border border-gray-300 rounded-lg py-1.5 px-2 sm:text-sm bg-white">
                        <option value="UGC Rewards" ${selType==='UGC Rewards'?'selected':''}>UGC Rewards</option>
                        <option value="SMS" ${selType==='SMS'?'selected':''}>SMS</option>
                        <option value="Daily Task" ${selType==='Daily Task'?'selected':''}>Daily Task</option>
                        <option value="Game Review" ${selType==='Game Review'?'selected':''}>Game Review</option>
                    </select>
                </div>"""

replace_add_item = """        window.updateBudgetItemTypes = () => {
            const budgetType = document.getElementById('budget-type').value;
            const typeContainers = document.querySelectorAll('.budget-item-type-container');
            typeContainers.forEach(container => {
                const currentInput = container.querySelector('.budget-item-type');
                const selType = currentInput ? currentInput.value : '';

                if (budgetType === 'Campaign Expenses') {
                    if (currentInput.tagName !== 'SELECT') {
                        container.innerHTML = `<select class="budget-item-type block w-full border border-gray-300 rounded-lg py-1.5 px-2 sm:text-sm bg-white">
                            <option value="UGC Rewards" ${selType==='UGC Rewards'?'selected':''}>UGC Rewards</option>
                            <option value="SMS" ${selType==='SMS'?'selected':''}>SMS</option>
                            <option value="Daily Task" ${selType==='Daily Task'?'selected':''}>Daily Task</option>
                            <option value="Game Review" ${selType==='Game Review'?'selected':''}>Game Review</option>
                        </select>`;
                    }
                } else {
                    if (currentInput.tagName !== 'INPUT') {
                        container.innerHTML = `<input type="text" class="budget-item-type block w-full border border-gray-300 rounded-lg py-1.5 px-2 sm:text-sm" placeholder="Expense Type" required value="${selType}">`;
                    }
                }
            });
        };

        window.budgetItems = [];
        window.addBudgetItem = (item = null) => {
            const container = document.getElementById('budget-items-container');
            const itemId = Date.now().toString() + Math.random().toString(36).substr(2, 5);

            const div = document.createElement('div');
            div.className = "flex space-x-2 items-center bg-gray-50 p-2 rounded-xl border border-gray-200";
            div.id = `budget-item-${itemId}`;

            const selType = item ? item.type : '';
            const valAmt = item ? item.amount : '';

            const budgetType = document.getElementById('budget-type').value;
            let typeInputHtml = '';

            if (budgetType === 'Campaign Expenses') {
                typeInputHtml = `<select class="budget-item-type block w-full border border-gray-300 rounded-lg py-1.5 px-2 sm:text-sm bg-white">
                    <option value="UGC Rewards" ${selType==='UGC Rewards'?'selected':''}>UGC Rewards</option>
                    <option value="SMS" ${selType==='SMS'?'selected':''}>SMS</option>
                    <option value="Daily Task" ${selType==='Daily Task'?'selected':''}>Daily Task</option>
                    <option value="Game Review" ${selType==='Game Review'?'selected':''}>Game Review</option>
                </select>`;
            } else {
                typeInputHtml = `<input type="text" class="budget-item-type block w-full border border-gray-300 rounded-lg py-1.5 px-2 sm:text-sm" placeholder="Expense Type" required value="${selType}">`;
            }

            div.innerHTML = `
                <div class="flex-1 budget-item-type-container">
                    ${typeInputHtml}
                </div>"""

# if it hasn't been replaced yet, replace it. Otherwise ignore.
if search_add_item in content:
    content = content.replace(search_add_item, replace_add_item)

# Add an onchange to the budget type select to re-render the inputs
search_budget_type_select = """                        <select id="budget-type" required class="mt-1 block w-full border border-gray-300 rounded-xl shadow-md shadow-slate-200/50 py-2 px-3 sm:text-sm">"""
replace_budget_type_select = """                        <select id="budget-type" required onchange="window.updateBudgetItemTypes()" class="mt-1 block w-full border border-gray-300 rounded-xl shadow-md shadow-slate-200/50 py-2 px-3 sm:text-sm">"""
if search_budget_type_select in content:
    content = content.replace(search_budget_type_select, replace_budget_type_select)

with open('index.html', 'w') as f:
    f.write(content)
