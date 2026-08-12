# 🎈 Number Climber - Ascending & Descending Game

An interactive, kid-friendly web application game designed for Senior KG children (around age 5) to practice arranging numbers in **ascending** (smallest to biggest) and **descending** (biggest to smallest) order.

## 🚀 How to Run the Game on Your Laptop

Since this is built with standard web technologies (HTML, CSS, and Vanilla JavaScript) with **zero dependencies**, you don't need to install anything!

1.  Locate the project folder on your laptop.
2.  Find the `index.html` file.
3.  **Double-click `index.html`** to open it instantly in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari).
4.  Alternatively, you can run a simple local web server in this directory if you wish:
    ```bash
    # Python 3
    python3 -m http.server 8000
    # Then open http://localhost:8000 in your browser
    ```

---

## 🎮 Game Features & How to Play

*   **📖 Learn First (Tutorial)**: An interactive learning section demonstrating ascending (numbers going up from 1 to 5) and descending (numbers sliding down from 5 to 1) with animations and voiceover counting.
*   **Two Play Modes**: 
    *   **🪜 Climb Up (Ascending)**: Arrange numbers from smallest to biggest to help the mascot climb up the stairs.
    *   **🛝 Slide Down (Descending)**: Arrange numbers from biggest to smallest to help the mascot slide down.
*   **Structured Levels**:
    *   **Level 1**: Numbers **1 to 10** (3 items) - Simple starting block.
    *   **Level 2**: Numbers **11 to 20** (4 items).
    *   **Level 3**: Numbers **1 to 30** (4 items) - Mixes single and double digits.
    *   **Level 4**: Numbers **31 to 60** (5 items).
    *   **Level 5**: Challenge Mode: Numbers **1 to 100** (5 random items).
*   **Kid-Friendly Mechanics**:
    *   **Click-to-Place**: No complicated drag-and-drop. Just tap a bubble to place it.
    *   **Mascot Reward**: The mascot (e.g. 🐵, 🐸, 🐼) hops and dances along the stairs/slide as correct numbers are placed.
    *   **Voice Over Narration**: The browser reads instructions and hints aloud (e.g. *"Click the smallest number first!"*, *"Look for the smallest number, which is 5!"*).
    *   **Programmatic Audio Effects**: Satisfying bubble-pops, chimes, and victory fanfares generated in real-time.
    *   **Confetti Celebration**: Responsive confetti shower upon completing a level!
    *   **Easy Navigation**: Big buttons to select levels, replay levels, or go back.

---

## 🌐 Deploying to GitHub Pages

You can host this game on **GitHub Pages** for free:
1.  Go to repository **Settings** -> **Pages**.
2.  Set **Source** to "Deploy from a branch".
3.  Set **Branch** to `main` and folder to `/ (root)`.
4.  Click **Save**.
5.  Your site will be live at `https://<username>.github.io/<repository-name>/`.

---

## 🔄 Mobile Cache-Busting for Code Updates

Mobile browsers cache stylesheet and script files aggressively. If you modify `styles.css` or `game.js`, you must increment the version suffix (cache-buster parameter) inside `index.html` to force mobile devices to download the updates immediately:

1.  Open `index.html`.
2.  Change the version number (e.g. from `1.2.1` to `1.2.2`) in these three spots:
    *   `<link rel="stylesheet" href="styles.css?v=1.2.2">` (Line 11)
    *   `<div class="version-tag">v1.2.2</div>` (Line 43)
    *   `<script src="game.js?v=1.2.2"></script>` (Line 159)
3.  Commit and push your changes to GitHub to refresh the live deployment.
