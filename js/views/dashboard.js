import { sortTableData } from "../utils/tableSort.js";

export function init(container) {
    if (window.renderUI) window.renderUI();
    const savedTypeSelect = document.getElementById('global-type-filter');
    if (savedTypeSelect) savedTypeSelect.value = window.globalTypeFilter || 'All';
    const savedCategorySelect = document.getElementById('global-category-filter');
    if (savedCategorySelect) savedCategorySelect.value = window.globalCategoryFilter || 'All';
    return function cleanup() {};
}
