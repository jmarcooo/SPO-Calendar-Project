const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf-8');

html = html.replace(`                if (window.pinSortMode === 1) {
                    if (aS !== bS) return aS - bS;
                    if (aP !== bP) return aP - bP;
                    if (aPo !== bPo) return aPo - bPo;`, `                if (window.pinSortMode === 1 || !window.pinSortMode) {
                    if (aS !== bS) return aS - bS;
                    if (aP !== bP) return aP - bP;
                    if (aPo !== bPo) return aPo - bPo;`);

html = html.replace(`                } else if (window.pinSortMode === 3) {
                    if (aP !== bP) return aP - bP;
                    if (aPo !== bPo) return aPo - bPo;
                    if (aS !== bS) return aS - bS;
                }`, `                } else {
                    if (aP !== bP) return aP - bP;
                    if (aPo !== bPo) return aPo - bPo;
                    if (aS !== bS) return aS - bS;
                }`);

fs.writeFileSync('index.html', html);
