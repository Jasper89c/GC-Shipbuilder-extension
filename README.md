# GC Ship Builder Presets

A lightweight Chrome Extension for the Galactic Conquest ship builder. This tool allows you to save and load fleet configurations with a single click, featuring a persistent, draggable UI.

---

## 🚀 Features

* **5 Preset Slots:** Store multiple fleet compositions for quick switching.
* **Game-Reactive Logic:** Automatically triggers `input` and `change` events so the game updates fleet power and resource costs immediately.
* **Draggable Interface:** Move the panel anywhere on your screen using the drag handle.
* **Smart Persistence:** Remembers your saved presets and the panel's position even after refreshing the page.
* **Visual Indicators:** Buttons change color (Green) when a preset is saved in that slot.

---

## 🛠 Installation

1.  **Download** or clone this repository.
2.  Open Chrome and go to `chrome://extensions/`.
3.  Turn on **"Developer mode"** (top right toggle).
4.  Click **"Load unpacked"** and select the folder containing these files.

---

## 🎮 How to Use

| Action | Result |
| :--- | :--- |
| **Left Click** | **Load** the saved preset into the builder. |
| **Right Click** | **Save** your current ship counts into that slot. |
| **Double Click** | **Clear** the preset from that slot. |
| **Drag "⠿" Handle** | Move the panel to a new location. |

### Saving a Fleet
1.  Enter your ship numbers in the game.
2.  **Right-click** a Preset button. It will turn green.

### Loading a Fleet
1.  Click any green Preset button.
2.  The script will fill the fields and update the game's calculations automatically.

---

## 📂 File Structure

* `manifest.json`: Extension permissions and configuration.
* `content.js`: Main logic for UI, dragging, and game interaction.

---

## ⚖️ License
MIT License. Feel free to modify and share.
