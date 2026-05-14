// 1. UI Setup
chrome.storage.local.get(['panelPos'], (res) => {
    const pos = res.panelPos || { top: '20px', left: 'auto', right: '20px' };
    
    const container = document.createElement('div');
    container.id = 'gcc-preset-panel';
    container.style.cssText = `position:fixed; top:${pos.top}; left:${pos.left}; right:${pos.right}; width:170px; background:#1a1a1a; border:2px solid #444; z-index:99999; border-radius:8px; overflow:hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); font-family: sans-serif; color: white;`;
    
    container.innerHTML = `
        <div id="gcc-handle" style="background:#333; padding:8px; cursor:move; text-align:center; font-weight:bold; font-size:11px; border-bottom:1px solid #444;">⠿ DRAG PANEL</div>
        <div style="padding:8px;">
            <div id="gcc-btn-area"></div>
            
            <div style="margin-top:8px; padding-top:8px; border-top:1px solid #333;">
                <div style="font-size:10px; color:#aaa; margin-bottom:5px; text-align:center;">QUICK CLUSTER</div>
                
                <select id="gcc-mineral-select" style="width:100%; background:#222; color:white; border:1px solid #444; font-size:10px; margin-bottom:5px; padding:2px;">
                    <option value="2">Red Crystal</option>
                    <option value="6">Strafez Organism</option>
                </select>

                <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:2px;">
                    <button class="cl-btn" data-tier="20" style="background:#4a148c;">L1</button>
                    <button class="cl-btn" data-tier="21" style="background:#6a1b9a;">L2</button>
                    <button class="cl-btn" data-tier="22" style="background:#8e24aa;">L3</button>
                </div>
            </div>
        </div>
        <div style="font-size:9px; color:#555; text-align:center; padding-bottom:6px;">L: Load | R: Save | Dbl: Clear</div>
    `;
    document.body.appendChild(container);

    // Apply shared styles to cluster buttons
    container.querySelectorAll('.cl-btn').forEach(btn => {
        btn.style.cssText += "color:white; border:none; padding:5px 0; border-radius:3px; cursor:pointer; font-size:10px; font-weight:bold;";
    });

    setupLogic(container);
});

function setupLogic(container) {
    let isDragging = false;
    let offset = { x: 0, y: 0 };
    const handle = document.getElementById('gcc-handle');

    // --- Drag Logic ---
    handle.addEventListener('mousedown', (e) => {
        isDragging = true;
        offset.x = e.clientX - container.offsetLeft;
        offset.y = e.clientY - container.offsetTop;
        container.style.transition = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        container.style.left = (e.clientX - offset.x) + 'px';
        container.style.top = (e.clientY - offset.y) + 'px';
        container.style.right = 'auto';
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            chrome.storage.local.set({
                panelPos: { top: container.style.top, left: container.style.left, right: 'auto' }
            });
        }
    });

    // --- Preset Button Logic ---
    chrome.storage.local.get(['presets'], (res) => {
        const savedData = res.presets || {};
        const btnArea = document.getElementById('gcc-btn-area');

        for (let i = 1; i <= 5; i++) {
            const btn = document.createElement('button');
            btn.innerText = `Preset ${i}`;
            btn.style.cssText = `width:100%; margin:2px 0; padding:6px; cursor:pointer; border-radius:4px; border:1px solid #444; font-size:11px; background:${savedData[i] ? "#2e7d32" : "#222"}; color:white;`;
            
            btn.onclick = () => loadPreset(i);
            btn.oncontextmenu = (e) => { e.preventDefault(); savePreset(i, btn); };
            btn.ondblclick = (e) => { e.stopPropagation(); clearPreset(i, btn); };
            btnArea.appendChild(btn);
        }
    });

    // --- Cluster Button Click Logic ---
    container.querySelectorAll('.cl-btn').forEach(btn => {
        btn.onclick = () => {
            const tier = btn.getAttribute('data-tier');
            const mineral = document.getElementById('gcc-mineral-select').value;
            const lvl = btn.innerText;

            if(confirm(`Confirm: Cluster colonies into ${lvl}?`)) {
                performCluster(tier, mineral);
            }
        };
    });
}

// --- API Function ---
async function performCluster(tierId, mineralId) {
    const sessionMatch = document.body.innerHTML.match(/i\.cfm\?&(\d+)/);
    if (!sessionMatch) {
        alert("Session ID not found.");
        return;
    }
    const sessionId = sessionMatch[1];
    const url = `i.cfm?&${sessionId}&f=com_colupgrade&tid=${tierId}&con=1`;

    const formData = new FormData();
    formData.append('goodid', mineralId);

    try {
        const response = await fetch(url, { method: 'POST', body: formData });
        if (response.ok) {
            alert("Action sent to server. Refreshing...");
            window.location.reload();
        }
    } catch (err) {
        alert("Network error.");
        console.error(err);
    }
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