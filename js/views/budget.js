import { sortTableData } from "../utils/tableSort.js";

window.renderBudgetTable = () => {
            const table = document.getElementById('budget-table-body');
            if (!table) return;
            const filterEl = document.getElementById('budget-filter-month');
            if(filterEl && !filterEl.value && window.budgetFilterMonth) filterEl.value = window.budgetFilterMonth;
            table.innerHTML = '';

            ['month', 'name', 'type', 'createdAt', 'owner', 'allocated'].forEach(col => {
                const icon = document.getElementById(`budget-sort-icon-${col}`);
                if (icon) {
                    icon.className = 'fa-solid ml-1 transition-colors ' + (window.budgetSortCol === col ? (window.budgetSortAsc ? 'fa-sort-up text-primary-600 dark:text-primary-400' : 'fa-sort-down text-primary-600 dark:text-primary-400') : 'fa-sort text-gray-300');
                }
            });

            let currentBudgets = window.budgets && window.budgets.length > 0 ? window.budgets : JSON.parse(localStorage.getItem('spo_budget_data') || '[]');
            console.log("Current Budgets Count:", currentBudgets.length);
            let filteredBudgets = currentBudgets.filter(b => {
                const matchesSearch = !window.budgetSearchQuery || (b.name || '').toLowerCase().includes(window.budgetSearchQuery.toLowerCase()) || (b.owner || '').toLowerCase().includes(window.budgetSearchQuery.toLowerCase());
                const matchesMonth = !window.budgetFilterMonth || b.month === window.budgetFilterMonth || window.budgetFilterMonth === '';
                let bOwnerName = b.owner || '';
                try {
                    const o = JSON.parse(b.owner);
                    bOwnerName = o.name || o.username || bOwnerName;
                } catch(e) {}
                const matchesOwner = !window.budgetFilterOwner || window.budgetFilterOwner === 'All' || bOwnerName.trim() === window.budgetFilterOwner;
                return matchesSearch && matchesMonth && matchesOwner;
            });


            filteredBudgets = sortTableData(filteredBudgets, window.budgetSortCol, window.budgetSortAsc);


            if (filteredBudgets.length === 0) {
                table.innerHTML = `<tr><td colspan="6" class="px-6 py-8 text-center text-gray-500 dark:text-slate-400 ">No budget entries found matching filters.</td></tr>`;
                document.getElementById('budget-total-allocated').innerText = window.formatCurrency(0);
                // document.getElementById('budget-total-spent').innerText = window.formatCurrency(0);
                // Removed
                return;
            }

            let totalAllocated = 0;
            let totalSpent = 0;

            filteredBudgets.forEach(b => {
                const alloc = parseFloat(b.allocated) || 0;
                const spent = parseFloat(b.spent) || 0;
                const remaining = alloc - spent;

                totalAllocated += alloc;
                totalSpent += spent;

                const escName = b.name.replace(/"/g, '&quot;');
                const escOwner = (b.owner || 'Unassigned').replace(/"/g, '&quot;');

                const tr = document.createElement('tr');
                tr.className = 'hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-700 transition-colors duration-200 cursor-pointer';
                tr.onclick = (event) => {
                    if(!event.target.closest('button')) {
                        window.openBudgetDetails(b.id);
                    }
                };

                tr.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500 dark:text-slate-400 ">${(function(){
                        if(!b.month) return 'N/A';
                        const parts = b.month.split('-');
                        if(parts.length !== 2) return b.month;
                        const date = new Date(parts[0], parseInt(parts[1])-1);
                        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
                    })()}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white " title="${escName}">${b.name.length > 20 ? b.name.substring(0,20)+'...' : b.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400 ">${b.type || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400 ">${b.createdAt || '-'}</td>
                    <td class="px-6 py-4 whitespace-nowrap" title="${escOwner}">
                        ${(function(){
                            let n = escOwner;
                            try { const o = JSON.parse(n); n = o.name || o.username || n; } catch(e){}
                            if (n === 'Unassigned' || !n) return '<span class="text-gray-400 dark:text-slate-500 italic text-xs">Unassigned</span>';
                            let initial = n.charAt(0).toUpperCase();
                            return '<div class="flex items-center space-x-2"><div class="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xs font-bold">' + initial + '</div><span class="text-sm text-gray-900 dark:text-white ">' + n + '</span></div>';
                        })()}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400 text-right font-medium text-gray-900 dark:text-white ">${window.formatCurrency(alloc)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div class="flex justify-end space-x-2">
                            <button onclick="openBudgetModal('${b.id}')" class="text-primary-600 dark:text-primary-400 hover:text-primary-900 bg-primary-50 dark:bg-primary-900 p-1.5 rounded transition-colors" title="Edit">
                                <i class="fa-solid fa-pen"></i>
                            </button>
                            <button onclick="deleteBudgetEntry('${b.id}')" class="text-red-600 dark:text-red-400 hover:text-red-900 bg-red-50 dark:bg-red-900 p-1.5 rounded transition-colors" title="Delete">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </td>
                `;
                table.appendChild(tr);
            });

            const totalRemaining = totalAllocated - totalSpent;
            document.getElementById('budget-total-allocated').innerText = window.formatCurrency(totalAllocated);

            // Remaining removed
        }

window.updateBudgetItemTypes = () => {
            const budgetType = document.getElementById('budget-type').value;
            const typeContainers = document.querySelectorAll('.budget-item-type-container');
            typeContainers.forEach(container => {
                const currentInput = container.querySelector('.budget-item-type');
                const selType = currentInput ? currentInput.value : '';

                if (budgetType === 'Campaign Expenses') {
                    if (currentInput.tagName !== 'SELECT') {
                        container.innerHTML = `<select class="budget-item-type block w-full border border-gray-300 dark:border-slate-600 rounded-lg py-1.5 px-2 sm:text-sm bg-white dark:bg-slate-800">
                            <option value="UGC Rewards" ${selType==='UGC Rewards'?'selected':''}>UGC Rewards</option>
                            <option value="SMS" ${selType==='SMS'?'selected':''}>SMS</option>
                            <option value="Daily Task" ${selType==='Daily Task'?'selected':''}>Daily Task</option>
                            <option value="Game Review" ${selType==='Game Review'?'selected':''}>Game Review</option>
                        </select>`;
                    }
                } else {
                    if (currentInput.tagName !== 'INPUT') {
                        container.innerHTML = `<input type="text" class="budget-item-type block w-full border border-gray-300 dark:border-slate-600 rounded-lg py-1.5 px-2 sm:text-sm" placeholder="Expense Type" required value="${selType}">`;
                    }
                }
            });
        };


export function init(container) {
if (window.renderBudgetTable) window.renderBudgetTable();
    return function cleanup() {};
}
