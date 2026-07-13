// dom_helpers.js - UI Component Helpers

/**
 * Render the source code display safely, injecting structural elements and toggling breakpoints
 */
export function updateCodePanel(container, currentAlgorithm, vm, onBreakpointToggle) {
    container.innerHTML = '';
    if (!currentAlgorithm) return;

    currentAlgorithm.display_code.forEach((line, idx) => {
        const row = document.createElement('div');
        row.className = 'code-line';
        row.id = `code-line-${idx}`;
        if (vm.breakpoints.has(idx)) {
            row.classList.add('breakpoint');
        }

        const trimmed = line.trim();
        const isNonExecutable = /^(\}$|^\{$|^\s*|\/\/.*)$/.test(trimmed);

        const numCol = document.createElement('div');
        numCol.className = 'line-number-col';

        if (!isNonExecutable) {
            numCol.innerText = idx + 1;
            row.classList.add('executable');

            numCol.addEventListener('click', (e) => {
                e.stopPropagation();
                const hasBp = onBreakpointToggle(idx);
                if (hasBp) {
                    row.classList.add('breakpoint');
                } else {
                    row.classList.remove('breakpoint');
                }
            });
        } else {
            numCol.innerHTML = '&nbsp;';
            row.classList.add('non-executable');
        }

        const codeCol = document.createElement('div');
        codeCol.className = 'line-code-col';
        codeCol.innerText = line;

        row.appendChild(numCol);
        row.appendChild(codeCol);
        container.appendChild(row);
    });
}

/**
 * Refresh variables inspector view panel
 */
export function updateVariablesDisplay(container, vars) {
    container.innerHTML = '';
    const keys = Object.keys(vars);

    if (keys.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; color: var(--text-muted); font-size: 12px; text-align: center;">
                No variables active in current scope
            </div>
        `;
        return;
    }

    keys.forEach(k => {
        const item = document.createElement('div');
        item.className = 'variable-item';

        const nameEl = document.createElement('div');
        nameEl.className = 'variable-name';
        nameEl.innerText = k;

        const valEl = document.createElement('div');
        valEl.className = 'variable-value';
        valEl.innerText = vars[k] !== undefined && vars[k] !== null ? vars[k] : 'undefined';

        item.appendChild(nameEl);
        item.appendChild(valEl);
        container.appendChild(item);
    });
}

/**
 * Repopulate performance analysis table records
 */
export function updateHistoryTable(container, historyLog) {
    if (!container) return;
    container.innerHTML = '';

    if (historyLog.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: var(--text-muted); font-size: 12px; padding: 20px;">
                    No history entries recorded yet.
                </td>
            </tr>
        `;
        return;
    }

    for (let i = historyLog.length - 1; i >= 0; i--) {
        const entry = historyLog[i];
        const tr = document.createElement('tr');
        const cleanOrder = entry.order.charAt(0).toUpperCase() + entry.order.slice(1);

        tr.innerHTML = `
            <td>
                <div class="history-setup-lbl">${entry.size} items</div>
                <div class="history-setup-sub">${cleanOrder}</div>
            </td>
            <td class="bold font-indigo">${entry.algo}</td>
            <td class="font-amber text-right">${entry.compares.toLocaleString()}</td>
            <td class="font-red text-right">${entry.swaps.toLocaleString()}</td>
        `;
        container.appendChild(tr);
    }
}
