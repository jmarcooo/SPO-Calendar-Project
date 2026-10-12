with open('index.html', 'r') as f:
    content = f.read()

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

search_save = """        window.deleteBudgetEntry = async (id) => {"""
content = content.replace(search_save, item_logic + "\n" + search_save)

with open('index.html', 'w') as f:
    f.write(content)
