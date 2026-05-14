// 1. UI Setup - Load saved position first
chrome.storage.local.get(['panelPos'], (res) => {
    const pos = res.panelPos || { top: '20px', left: 'auto', right: '20px' };
    
    const container = document.createElement('div');
    container.id = 'gcc-preset-panel';
    container.style.cssText = `position:fixed; top:${pos.top}; left:${pos.left}; right:${pos.right}; width:160px; background:#1a1a1a; border:2px solid #444; z-index:99999; border-radius:8px; overflow:hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); font-family: sans-serif;`;
    container.innerHTML = `
        <div id="gcc-handle" style="background:#333; color:white; padding:8px; cursor:move; text-align:center; font-weight:bold; font-size:12px; border-bottom:1px solid #444;">⠿ DRAG HERE</div>
        <div style="padding:10px;" id="gcc-btn-area"></div>
        <div style="font-size:9px; color:#777; text-align:center; padding-bottom:8px;">L: Load | R: Save | Dbl: Clear</div>
    `;
    document.body.appendChild(container);

    setupLogic(container);
});

// 2. Wrap the rest of the logic so it waits for the container to exist
function setupLogic(container) {
    let isDragging = false;
    let offset = { x: 0, y: 0 };

    const handle = document.getElementById('gcc-handle');

    handle.addEventListener('mousedown', (e) => {
        isDragging = true;
        offset.x = e.clientX - container.offsetLeft;
        offset.y = e.clientY - container.offsetTop;
        container.style.transition = 'none'; // Disable transitions while dragging
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const newLeft = (e.clientX - offset.x);
        const newTop = (e.clientY - offset.y);
        
        container.style.left = newLeft + 'px';
        container.style.top = newTop + 'px';
        container.style.right = 'auto';
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            // SAVE POSITION
            chrome.storage.local.set({
                panelPos: {
                    top: container.style.top,
                    left: container.style.left,
                    right: 'auto'
                }
            });
        }
    });

    // 3. Main Button Logic (Same as before)
    chrome.storage.local.get(['presets'], (res) => {
        const savedData = res.presets || {};
        const btnArea = document.getElementById('gcc-btn-area');

        for (let i = 1; i <= 5; i++) {
            const btn = document.createElement('button');
            btn.innerText = `Preset ${i}`;
            btn.style.cssText = `width:100%; margin:3px 0; padding:6px; cursor:pointer; border-radius:4px; border:1px solid #555; font-size:12px; background:${savedData[i] ? "#2e7d32" : "#333"}; color:white;`;
            
            btn.onclick = () => loadPreset(i);
            btn.oncontextmenu = (e) => { e.preventDefault(); savePreset(i, btn); };
            btn.ondblclick = (e) => { e.stopPropagation(); clearPreset(i, btn); };
            btnArea.appendChild(btn);
        }
    });
}

// Keep your savePreset, loadPreset, and clearPreset functions exactly as they were below...

function savePreset(id, btn) {
    const inputs = document.querySelectorAll('.gc-builder-input');
    let data = {};
    inputs.forEach(input => {
        if (input.value && parseInt(input.value) > 0) {
            data[input.id] = input.value;
        }
    });

    chrome.storage.local.get('presets', (res) => {
        let presets = res.presets || {};
        presets[id] = data;
        chrome.storage.local.set({ presets }, () => {
            btn.style.background = "#2e7d32";
            console.log("Saved Preset", id, data);
        });
    });
}

function loadPreset(id) {
    chrome.storage.local.get('presets', (res) => {
        const data = res.presets?.[id];
        if (!data) return;

        // Reset all inputs first
        document.querySelectorAll('.gc-builder-input').forEach(i => {
            i.value = "";
            i.dispatchEvent(new Event('input', { bubbles: true }));
        });

        // Load saved data
        for (const [inputId, val] of Object.entries(data)) {
            const input = document.getElementById(inputId);
            if (input) {
                input.focus();
                input.value = val;
                
                // Trigger events to let the game know we changed things
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
                input.dispatchEvent(new Event('blur', { bubbles: true }));
            }
        }
        console.log("Loaded Preset", id);
    });
}

function clearPreset(id, btn) {
    chrome.storage.local.get('presets', (res) => {
        let presets = res.presets || {};
        delete presets[id];
        chrome.storage.local.set({ presets }, () => {
            btn.style.background = "#333";
        });
    });
}