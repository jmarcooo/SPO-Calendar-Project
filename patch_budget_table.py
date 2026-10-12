with open('index.html', 'r') as f:
    content = f.read()

# Replace rendering loop to match new table structure
import re

search_columns = """            ['month', 'name', 'type', 'owner', 'allocated', 'spent'].forEach(col => {"""
replace_columns = """            ['month', 'name', 'type', 'createdAt', 'owner', 'allocated', 'spent'].forEach(col => {"""
content = content.replace(search_columns, replace_columns)

search_td = """                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">${b.month || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" title="${escName}">${b.name.length > 20 ? b.name.substring(0,20)+'...' : b.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${b.type || 'N/A'}</td>
                    <td class="px-6 py-4 whitespace-nowrap" title="${escOwner}">
                        ${(function(){
                            let n = escOwner;
                            if (n === 'Unassigned') return '<span class="text-gray-400 italic text-xs">Unassigned</span>';
                            let initial = n.charAt(0).toUpperCase();
                            return '<div class="flex items-center space-x-2"><div class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">' + initial + '</div><span class="text-sm text-gray-900">' + n + '</span></div>';
                        })()}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">${window.formatCurrency(alloc)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">${window.formatCurrency(spent)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${remaining < 0 ? 'text-red-600' : 'text-emerald-600'}">${window.formatCurrency(remaining)}</td>"""

replace_td = """                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">${(function(){
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
                            if (n === 'Unassigned') return '<span class="text-gray-400 italic text-xs">Unassigned</span>';
                            let initial = n.charAt(0).toUpperCase();
                            return '<div class="flex items-center space-x-2"><div class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">' + initial + '</div><span class="text-sm text-gray-900">' + n + '</span></div>';
                        })()}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">${window.formatCurrency(alloc)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">${window.formatCurrency(spent)}</td>"""
content = content.replace(search_td, replace_td)

search_foot = """            const remainingEl = document.getElementById('budget-total-remaining');
            remainingEl.innerText = window.formatCurrency(totalRemaining);
            remainingEl.className = `px-6 py-4 text-right text-sm font-bold ${totalRemaining < 0 ? 'text-red-600' : 'text-blue-600'}`;"""
replace_foot = """            // Remaining removed"""
content = content.replace(search_foot, replace_foot)

search_foot2 = """                document.getElementById('budget-total-remaining').innerText = window.formatCurrency(0);"""
replace_foot2 = """                // Removed"""
content = content.replace(search_foot2, replace_foot2)


with open('index.html', 'w') as f:
    f.write(content)
