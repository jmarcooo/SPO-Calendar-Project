const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf-8');

// The reviewer said "failed to update the else block (which dictates the default view)".
// Let's just make sure ALL blocks are distinct but the FIRST (default) is Sort->Page->Position.
const searchSortModal = `
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
`;

const replaceSortModal = `
                if (window.modalTimelineSortState === 1 || !window.modalTimelineSortState) {
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
`;
html = html.replace(searchSortModal, replaceSortModal);

// And the PR timeline:
const searchSortPR = `
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
`;

const replaceSortPR = `
                if (window.pinSortMode === 1 || !window.pinSortMode) {
                    if (aS !== bS) return aS - bS;
                    if (aP !== bP) return aP - bP;
                    if (aPo !== bPo) return aPo - bPo;
                } else if (window.pinSortMode === 2) {
                    if (aPo !== bPo) return aPo - bPo;
                    if (aP !== bP) return aP - bP;
                    if (aS !== bS) return aS - bS;
                } else {
                    if (aP !== bP) return aP - bP;
                    if (aPo !== bPo) return aPo - bPo;
                    if (aS !== bS) return aS - bS;
                }
`;
html = html.replace(searchSortPR, replaceSortPR);

fs.writeFileSync('index.html', html);
