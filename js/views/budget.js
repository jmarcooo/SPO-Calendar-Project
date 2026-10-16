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
                    icon.className = 'fa-solid ml-1 transition-colors ' + (window.budgetSortCol === col ? (window.budgetSortAsc ? 'fa-sort-up text-indigo-600' : 'fa-sort-down text-indigo-600') : 'fa-sort text-gray-300');
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
                table.innerHTML = `<tr><td colspan="6" class="px-6 py-8 text-center text-gray-500">No budget entries found matching filters.</td></tr>`;
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
                tr.className = 'hover:bg-slate-50 transition-colors duration-200 cursor-pointer';
                tr.onclick = (event) => {
                    if(!event.target.closest('button')) {
                        window.openBudgetDetails(b.id);
                    }
                };

                tr.innerHTML = `
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">${(function(){
                        if(!b.month) return 'N/A';
                        const parts = b.month.split('-');
                        if(parts.length !== 2) return b.month;
                        const date = new Date(parts[0], parseInt(parts[1])-1);
                        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
                    })()}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" title="${escName}">${b.name.length > 20 ? b.name.substring(0,20)+'...' : b.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${b.type || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${b.createdAt || '-'}</td>
                    <td class="px-6 py-4 whitespace-nowrap" title="${escOwner}">
                        ${(function(){
                            let n = escOwner;
                            try { const o = JSON.parse(n); n = o.name || o.username || n; } catch(e){}
                            if (n === 'Unassigned' || !n) return '<span class="text-gray-400 italic text-xs">Unassigned</span>';
                            let initial = n.charAt(0).toUpperCase();
                            return '<div class="flex items-center space-x-2"><div class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">' + initial + '</div><span class="text-sm text-gray-900">' + n + '</span></div>';
                        })()}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right font-medium text-gray-900">${window.formatCurrency(alloc)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div class="flex justify-end space-x-2">
                            <button onclick="openBudgetModal('${b.id}')" class="text-indigo-600 hover:text-indigo-900 bg-indigo-50 p-1.5 rounded transition-colors" title="Edit">
                                <i class="fa-solid fa-pen"></i>
                            </button>
                            <button onclick="deleteBudgetEntry('${b.id}')" class="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded transition-colors" title="Delete">
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

        window.saveBudgetEntry = async (e) => {
            e.preventDefault();
            const form = document.getElementById('budget-form');
            if (!form.reportValidity()) return;

            const id = document.getElementById('budget-id').value;
            const month = document.getElementById('budget-month').value;
            const owner = window.currentUserProfile || 'Unknown';
            const name = document.getElementById('budget-name').value.trim();
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
            };

            if (!id) {
                entryData.createdAt = window.getFormattedCreatedTime();
            } else {
                const existingBudget = window.budgets.find(b => b.id === id);
                if (existingBudget && existingBudget.createdAt) {
                    entryData.createdAt = existingBudget.createdAt;
                } else {
                    entryData.createdAt = window.getFormattedCreatedTime();
                }
            }

            const btn = document.getElementById('save-budget-btn');
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
            btn.disabled = true;

            try {
                // Update Local Storage Fallback Immediately
                const idx = window.budgets.findIndex(b => b.id === entryId);
                if (idx > -1) window.budgets[idx] = entryData;
                else window.budgets.push(entryData);
                localStorage.setItem('spo_budget_data', JSON.stringify(window.budgets));

                if (db) {
                    await setDoc(doc(db, "budgets", entryId), entryData);
                }

                window.showToast(id ? "Budget entry updated" : "Budget entry added", "success");
                window.closeBudgetModal();
                window.renderUI();
            } catch(e) {
                window.showToast("Error saving budget", "error");
            } finally {
                btn.innerHTML = 'Save Entry';
                btn.disabled = false;
            }
        };

export function init(container) {
    window.renderBudgetTable();
    return function cleanup() {};
}
