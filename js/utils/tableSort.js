
export function sortTableData(data, sortCol, sortAsc, getRankFn = null) {
    return [...data].sort((a, b) => {
        let valA = a[sortCol];
        let valB = b[sortCol];

        if (sortCol === 'default' && getRankFn) {
            const rankA = getRankFn(a);
            const rankB = getRankFn(b);
            if (rankA !== rankB) return rankB - rankA;
            // secondary by date
            const dateA = new Date(a.startDate || a.date || a.timestamp || 0).getTime();
            const dateB = new Date(b.startDate || b.date || b.timestamp || 0).getTime();
            return dateB - dateA;
        }

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (Array.isArray(valA)) valA = valA.join(', ');
        if (Array.isArray(valB)) valB = valB.join(', ');

        if (['allocated', 'spent'].includes(sortCol) || typeof valA === 'number') {
            valA = parseFloat(valA) || 0;
            valB = parseFloat(valB) || 0;
        }

        if (sortCol === 'startDate' || sortCol === 'endDate' || sortCol === 'date' || sortCol === 'createdAt') {
            const dateA = new Date(a[sortCol] || 0).getTime();
            const dateB = new Date(b[sortCol] || 0).getTime();
            if (dateA < dateB) return sortAsc ? -1 : 1;
            if (dateA > dateB) return sortAsc ? 1 : -1;
            return 0;
        }

        if (valA === undefined || valA === null) valA = '';
        if (valB === undefined || valB === null) valB = '';

        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
    });
}
