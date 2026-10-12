with open('index.html', 'r') as f:
    content = f.read()

# Add dynamic item logic
item_logic = """
        window.budgetItems = [];
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
                </div>
                <div class="flex-1 relative">
                    <div class="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <span class="text-gray-500 sm:text-xs">₱</span>
                    </div>
                    <input type="number" step="0.01" min="0" value="${valAmt}" placeholder="Amount" oninput="window.calcBudgetTotal()" required class="budget-item-amount block w-full pl-6 border border-gray-300 rounded-lg py-1.5 px-2 sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
                </div>
                <button type="button" onclick="window.removeBudgetItem('${itemId}')" class="text-red-500 hover:text-red-700 p-1">
                    <i class="fa-solid fa-times"></i>
                </button>
            `;
            container.appendChild(div);
            window.calcBudgetTotal();
        };

        window.removeBudgetItem = (itemId) => {
            const el = document.getElementById(`budget-item-${itemId}`);
            if(el) {
                el.remove();
                window.calcBudgetTotal();
            }
        };

        window.calcBudgetTotal = () => {
            const amounts = document.querySelectorAll('.budget-item-amount');
            let total = 0;
            amounts.forEach(input => {
                const val = parseFloat(input.value);
                if(!isNaN(val) && val > 0) total += val;
            });
            document.getElementById('budget-allocated-display').innerText = window.formatCurrency(total);
            document.getElementById('budget-allocated').value = total;
        };
"""

search_save = "        window.saveBudgetEntry = async (event) => {"
replace_save = item_logic + search_save

content = content.replace(search_save, replace_save)


# Update modal open
search_open = """        window.openBudgetModal = (id = null) => {
            document.getElementById('budget-form').reset();
            document.getElementById('budget-id').value = '';
            document.getElementById('budget-modal-title').innerText = 'Add Budget Entry';
            document.getElementById('budget-month').value = window.getCurrentMonthStr();
            document.getElementById('budget-type').value = 'UGC Rewards';

            if (id) {
                const b = window.budgets.find(x => x.id === id);
                if (b) {
                    document.getElementById('budget-id').value = b.id;
                    document.getElementById('budget-month').value = b.month || window.getCurrentMonthStr();

                    document.getElementById('budget-name').value = b.name;
                    if(b.type) document.getElementById('budget-type').value = b.type;
                    document.getElementById('budget-allocated').value = b.allocated;
                    document.getElementById('budget-spent').value = b.spent;
                    document.getElementById('budget-modal-title').innerText = 'Edit Budget Entry';
                }
            }

            document.getElementById('budget-modal').classList.remove('hidden');
        };"""

replace_open = """        window.openBudgetModal = (id = null) => {
            document.getElementById('budget-form').reset();
            document.getElementById('budget-id').value = '';
            document.getElementById('budget-modal-title').innerText = 'Add Budget Entry';
            document.getElementById('budget-month').value = window.getCurrentMonthStr();
            document.getElementById('budget-type').value = 'Campaign Expenses';

            const container = document.getElementById('budget-items-container');
            container.innerHTML = '';

            if (id) {
                const b = window.budgets.find(x => x.id === id);
                if (b) {
                    document.getElementById('budget-id').value = b.id;
                    document.getElementById('budget-month').value = b.month || window.getCurrentMonthStr();

                    document.getElementById('budget-name').value = b.name;
                    if(b.type) document.getElementById('budget-type').value = b.type;
                    document.getElementById('budget-allocated').value = b.allocated;

                    if (b.items && b.items.length > 0) {
                        b.items.forEach(it => window.addBudgetItem(it));
                    } else {
                        // Fallback for old entries without items but with an allocated budget
                        window.addBudgetItem({ type: 'UGC Rewards', amount: b.allocated || 0 });
                    }

                    document.getElementById('budget-modal-title').innerText = 'Edit Budget Entry';
                }
            } else {
                window.addBudgetItem(); // add one empty item by default
            }
            window.calcBudgetTotal();

            document.getElementById('budget-modal').classList.remove('hidden');
        };"""

content = content.replace(search_open, replace_open)

# Update Save Logic
search_save_payload = """            const name = document.getElementById('budget-name').value.trim();
            const type = document.getElementById('budget-type').value;
            const allocated = document.getElementById('budget-allocated').value;
            const spent = document.getElementById('budget-spent').value || 0;

            const entryId = id ? id : Date.now().toString();
            const entryData = {
                id: entryId,
                name,
                type,
                owner,
                month,
                allocated: parseFloat(allocated),
                spent: parseFloat(spent)
            };"""

replace_save_payload = """            const name = document.getElementById('budget-name').value.trim();
            const type = document.getElementById('budget-type').value;
            const allocated = document.getElementById('budget-allocated').value;

            // Gather items
            const itemEls = document.querySelectorAll('#budget-items-container > div');
            if(itemEls.length === 0) {
                window.showToast("At least one item is required", "error");
                return;
            }

            let items = [];
            itemEls.forEach(el => {
                const typeVal = el.querySelector('.budget-item-type').value;
                const amtVal = parseFloat(el.querySelector('.budget-item-amount').value) || 0;
                items.push({ type: typeVal, amount: amtVal });
            });

            const entryId = id ? id : Date.now().toString();
            const entryData = {
                id: entryId,
                name,
                type,
                owner,
                month,
                items: items,
                allocated: parseFloat(allocated),
                spent: 0
            };"""

content = content.replace(search_save_payload, replace_save_payload)


with open('index.html', 'w') as f:
    f.write(content)
