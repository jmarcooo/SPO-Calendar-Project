const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf-8');

// Update sorting logic to match the new image sequence for State 1:
// 1-1-1, 1-2-1, ... 1-10-1, 2-1-1 ... 2-10-1, 1-1-2 ...
// This means the primary sort is 'sort' (3rd element), secondary is 'page' (1st element), tertiary is 'position' (2nd element)
// Wait, the elements are page-position-sort.
// So order: sort, page, pos.

const oldSortModal = `
            allSlots.sort((a, b) => {
                if (window.modalTimelineSortState === 1) {
                    if (a.pos !== b.pos) return a.pos - b.pos;
                    if (a.page !== b.page) return a.page - b.page;
                    return a.sort - b.sort;
                } else if (window.modalTimelineSortState === 2) {
                    if (a.sort !== b.sort) return a.sort - b.sort;
                    if (a.pos !== b.pos) return a.pos - b.pos;
                    return a.page - b.page;
                } else {
                    if (a.page !== b.page) return a.page - b.page;
                    if (a.pos !== b.pos) return a.pos - b.pos;
                    return a.sort - b.sort;
                }
            });`;

const newSortModal = `
            allSlots.sort((a, b) => {
                if (window.modalTimelineSortState === 1) {
                    if (a.sort !== b.sort) return a.sort - b.sort;
                    if (a.page !== b.page) return a.page - b.page;
                    return a.pos - b.pos;
                } else if (window.modalTimelineSortState === 2) {
                    if (a.pos !== b.pos) return a.pos - b.pos;
                    if (a.page !== b.page) return a.page - b.page;
                    return a.sort - b.sort;
                } else {
                    if (a.page !== b.page) return a.page - b.page;
                    if (a.pos !== b.pos) return a.pos - b.pos;
                    return a.sort - b.sort;
                }
            });`;


const oldSortPR = `
            allSlots.sort((a, b) => {
                const aP = a.page; const bP = b.page;
                const aPo = a.position; const bPo = b.position;
                const aS = a.sort; const bS = b.sort;

                if (window.pinSortMode === 1) {
                    if (aP !== bP) return aP - bP;
                    if (aPo !== bPo) return aPo - bPo;
                    if (aS !== bS) return aS - bS;
                } else if (window.pinSortMode === 2) {
                    if (aPo !== bPo) return aPo - bPo;
                    if (aP !== bP) return aP - bP;
                    if (aS !== bS) return aS - bS;
                } else if (window.pinSortMode === 3) {
                    if (aS !== bS) return aS - bS;
                    if (aPo !== bPo) return aPo - bPo;
                    if (aP !== bP) return aP - bP;
                }
                return 0;
            });`;

const newSortPR = `
            allSlots.sort((a, b) => {
                const aP = a.page; const bP = b.page;
                const aPo = a.position; const bPo = b.position;
                const aS = a.sort; const bS = b.sort;

                if (window.pinSortMode === 1) {
                    if (aS !== bS) return aS - bS;
                    if (aP !== bP) return aP - bP;
                    if (aPo !== bPo) return aPo - bPo;
                } else if (window.pinSortMode === 2) {
                    if (aPo !== bPo) return aPo - bPo;
                    if (aP !== bP) return aP - bP;
                    if (aS !== bS) return aS - bS;
                } else if (window.pinSortMode === 3) {
                    if (aP !== bP) return aP - bP;
                    if (aPo !== bPo) return aPo - bPo;
                    if (aS !== bS) return aS - bS;
                }
                return 0;
            });`;

html = html.replace(oldSortModal, newSortModal);
html = html.replace(oldSortPR, newSortPR);

fs.writeFileSync('index.html', html);
