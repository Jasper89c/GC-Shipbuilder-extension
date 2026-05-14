// 1. Create the UI Panel
const panel = document.createElement('div');
panel.id = 'gcc-memory-panel';
panel.innerHTML = '<div style="color:gold; font-weight:bold; margin-bottom:5px; font-size:12px;">SHIP PRESETS</div>';
document.body.appendChild(panel);

// 2. Create 5 Slots
for (let i = 1; i <= 5; i++) {
    const btn = document.createElement('button');
    btn.innerText = `Preset ${i}`;
    btn.className = 'memory-btn';
    
    let timer = null;

    btn.onclick = (e) => {
        if (e.detail === 1) {
            timer = setTimeout(() => handleAction(i, btn, 'click'), 200);
        }
    };

    btn.ondblclick = () => {
        clearTimeout(timer);
        handleAction(i, btn, 'dblclick');
    };

    panel.appendChild(btn);
}

// 3. Handle Saving, Loading, and Clearing
function handleAction(slot, button, type) {
    const storageKey = `gcc_preset_${slot}`;
    const inputs = document.querySelectorAll('.gc-builder-input');

    if (type === 'dblclick') {
        // CLEAR
        chrome.storage.local.remove(storageKey, () => {
            button.classList.remove('has-data');
            console.log(`Preset ${slot} cleared`);
        });
        return;
    }

    chrome.storage.local.get([storageKey], (result) => {
        const savedData = result[storageKey];

        if (savedData) {
            // LOAD: Map saved values back to IDs to ensure they go in the right boxes
            inputs.forEach(input => {
                if (savedData[input.id]) {
                    input.value = savedData[input.id];
                    // Trigger events so the game updates its "Turns Used" calculation
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
            console.log(`Preset ${slot} loaded`);
        } else {
            // SAVE: Save values using the unique ID of each ship input
            const dataToSave = {};
            let hasValues = false;

            inputs.forEach(input => {
                if (input.value && input.value !== "0") {
                    dataToSave[input.id] = input.value;
                    hasValues = true;
                }
            });

            if (hasValues) {
                chrome.storage.local.set({ [storageKey]: dataToSave }, () => {
                    button.classList.add('has-data');
                    console.log(`Preset ${slot} saved`);
                });
            }
        }
    });
}

// Check on load if buttons should be green
chrome.storage.local.get(null, (allData) => {
    document.querySelectorAll('.memory-btn').forEach((btn, idx) => {
        if (allData[`gcc_preset_${idx + 1}`]) btn.classList.add('has-data');
    });
});