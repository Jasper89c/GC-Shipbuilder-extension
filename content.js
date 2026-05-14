// 1. Create the UI
const panel = document.createElement('div');
panel.id = 'gcc-preset-panel';
panel.innerHTML = `
    <div style="font-weight:bold; margin-bottom:10px; text-align:center; border-bottom:1px solid #444; padding-bottom:5px;">SHIP PRESETS</div>
    <div id="btn-container"></div>
`;
document.body.appendChild(panel);

// 2. Load Position and Data
chrome.storage.local.get(['presets', 'panelPos'], (res) => {
    // Restore Position
    if (res.panelPos) {
        panel.style.top = res.panelPos.top;
        panel.style.left = res.panelPos.left;
        panel.style.right = 'auto'; // Disable default right alignment
    }

    // Initialize Buttons
    const savedData = res.presets || {};
    for (let i = 1; i <= 5; i++) {
        const btn = document.createElement('button');
        btn.className = `preset-btn ${savedData[i] ? 'saved' : ''}`;
        btn.innerText = `Preset ${i}`;
        
        // Load on click
        btn.onclick = () => loadPreset(i);
        // Save on right-click (context menu)
        btn.oncontextmenu = (e) => {
            e.preventDefault();
            savePreset(i, btn);
        };

        document.getElementById('btn-container').appendChild(btn);
    }
});

// 3. Dragging Logic
let isDragging = false;
let offset = { x: 0, y: 0 };

panel.addEventListener('mousedown', (e) => {
    isDragging = true;
    offset.x = e.clientX - panel.offsetLeft;
    offset.y = e.clientY - panel.offsetTop;
    panel.style.opacity = '0.8';
});

document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const x = e.clientX - offset.x;
    const y = e.clientY - offset.y;
    
    panel.style.left = `${x}px`;
    panel.style.top = `${y}px`;
    panel.style.right = 'auto';
});

document.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        panel.style.opacity = '1';
        // Save position to storage
        chrome.storage.local.set({
            panelPos: { top: panel.style.top, left: panel.style.left }
        });
    }
});

// 4. Save/Load Functions (Same logic as before)
function savePreset(id, btn) {
    const inputs = document.querySelectorAll('input[type="number"]');
    const data = {};
    inputs.forEach(input => {
        if (input.value > 0) data[input.name || input.id] = input.value;
    });

    chrome.storage.local.get('presets', (res) => {
        const presets = res.presets || {};
        presets[id] = data;
        chrome.storage.local.set({ presets }, () => {
            btn.classList.add('saved');
            console.log(`Preset ${id} saved!`);
        });
    });
}

function loadPreset(id) {
    chrome.storage.local.get('presets', (res) => {
        const data = res.presets?.[id];
        if (!data) return alert('No data in this slot!');

        for (const [name, value] of Object.entries(data)) {
            const input = document.querySelector(`input[name="${name}"], input[id="${name}"]`);
            if (input) {
                input.value = value;
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
    });
}