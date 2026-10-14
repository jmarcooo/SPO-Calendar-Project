const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf-8');

// There is another sorting function around line 3877 (the background table). We should update this to match as well for consistency.

const oldSortBackground = `
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
                }`;

const newSortBackground = `
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
                }`;

html = html.replace(oldSortBackground, newSortBackground);

const oldSortTitles = `
                sortIcon.title = window.pinSortMode === 1 ? 'Sort: Page > Position > Sort' :
                    (window.pinSortMode === 2 ? 'Sort: Position > Page > Sort' : 'Sort: Sort > Position > Page');`;

const newSortTitles = `
                sortIcon.title = window.pinSortMode === 1 ? 'Sort: Sort > Page > Position' :
                    (window.pinSortMode === 2 ? 'Sort: Position > Page > Sort' : 'Sort: Page > Position > Sort');`;

html = html.replace(oldSortTitles, newSortTitles);

fs.writeFileSync('index.html', html);
