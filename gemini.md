# 🤖 Gemini Project Documentation: Number Climber

This project was designed and implemented by **Gemini** to create a playful, accessible web application for learning ascending and descending numbers.

---

## 📋 Project Summary

*   **Project Name**: Number Climber (Ascending & Descending Numbers)
*   **Target Audience**: Senior KG students (5 years old)
*   **Creator**: Gemini (Model: Gemini 3.5 Flash)
*   **Development Stack**: HTML5, CSS3, Vanilla JavaScript (Zero external assets/dependencies)

---

## 🎨 Design Considerations for 5-Year-Olds

During the planning and design phase, the following features were specifically implemented to make the game operable and engaging for a 5-year-old child:

1.  **Interactive Tutorial System ("Learn First!")**:
    *   To explain the mathematical concepts before starting a challenge, the child can open the **Learning Center**.
    *   This screen visualizes the concepts using a step-by-step auto-playing demonstration:
        *   **Climbing Up (Ascending)**: The mascot steps up stairs from 1 to 5, as each number appears and the voice synthesizer speaks the number out loud.
        *   **Sliding Down (Descending)**: The mascot slides down from 5 to 1, demonstrating descending order.
    *   This gives a multisensory understanding (visual mascot movement + step heights + voice counting) of the concepts before testing them.
2.  **Friction-Free Interaction (Click-to-Place)**:
    *   Young children often struggle with dragging elements using a laptop trackpad. 
    *   We replaced drag-and-drop with a simple **tap/click gesture**. When a number bubble is clicked, it automatically flies into its correct position.
3.  **Voice Narration (Text-to-Speech)**:
    *   Since Senior KG children are still learning to read, the game features spoken instructions.
    *   Using the browser's native **Web Speech API**, the game reads out level instructions (e.g. *"Help the monkey climb up! Click the smallest number first!"*) and interactive prompts.
4.  **Positive Reinforcement & Visual Scaffold**:
    *   No harsh buzzers or "Game Over" states. Incorrect answers prompt a gentle wobble animation and a spoken clue (e.g. *"Oops! Try looking for the smallest number, which is 3."*).
    *   Correct answers reward the child with mascot hops, sound chimes, and a confetti shower upon level completion.
5.  **Zero-Asset Offline Capability**:
    *   Audio sounds (pops, dings, victory arpeggios) are generated procedurally in code using the **Web Audio API** oscillator waves.
    *   Visual icons use colorful SVG and modern CSS emojis (🐵, 🐸, 🐼, 🛝, 🪜).
    *   This ensures the application loads instantly and runs 100% offline, anywhere.

---

## 📁 File Structure

The project is structured with clean, modular files in the workspace:

*   **[index.html](file:///home/rajeshkumardave/Rajesh/codebase_other/ascending/index.html)**: Defines the layout structure, game HUD, levels selector, stairs/slide track, bubble container, and the victory card.
*   **[styles.css](file:///home/rajeshkumardave/Rajesh/codebase_other/ascending/styles.css)**: Implements child-friendly typography (Fredoka), vibrant HSL colors, responsive layouts, floating animations, and pop transitions.
*   **[game.js](file:///home/rajeshkumardave/Rajesh/codebase_other/ascending/game.js)**: Runs the game loop, level generation logic, mascot positioning calculations, procedural sound synthesizer, and the canvas-based confetti loop.
*   **[README.md](file:///home/rajeshkumardave/Rajesh/codebase_other/ascending/README.md)**: Contains quickstart instructions to double-click and run the game on a laptop.

---

## 📈 Level Configurations

To build confidence step-by-step, the game utilizes a modular level progression:

| Level | Number Range | Card Count | Description |
| :--- | :--- | :--- | :--- |
| **Level 1** | 1 to 10 | 3 cards | Perfect introduction to numbers |
| **Level 2** | 11 to 20 | 4 cards | Practicing double-digit ranges |
| **Level 3** | 1 to 30 | 4 cards | Mixed single & double digits |
| **Level 4** | 31 to 60 | 5 cards | Larger numerical comparisons |
| **Level 5** | 1 to 100 | 5 cards | Challenge Mode (random assortment) |

---

## 🚀 Hosting & Deployment (GitHub Pages)

The project is configured for hosting on **GitHub Pages**, which provides free web hosting for public repositories:

*   **Free Plan Availability**: GitHub Pages is free for public repositories on standard plans.
*   **Generous Soft Limits**:
    *   **Bandwidth**: 100 GB per month (sufficient for ~1.6 million plays of this ~60 KB game).
    *   **Storage**: 1 GB maximum site size (project is under 100 KB).
    *   **Builds**: 10 builds per hour (triggered on pushes).
*   **Configuration**: Turned on in repository Settings -> Pages, pulling from the `/ (root)` of the `main` branch.

---

## 🔄 Versioning & Mobile Cache-Busting

Mobile browsers (like iOS Safari and Android Chrome) use aggressive caching of CSS and JS files to improve speed. When updates are pushed to GitHub Pages, mobile users might continue to see old layout issues unless cache-busting is used.

### Cache-Busting Technique
To ensure mobile devices download the fresh styles and scripts immediately, we append a version query parameter (`?v=X.Y.Z`) to the asset links in `index.html`:
```html
<link rel="stylesheet" href="styles.css?v=1.2.1">
<script src="game.js?v=1.2.1"></script>
```

### Development Workflow for Updates
Whenever you modify CSS (`styles.css`) or JS (`game.js`):
1.  Open `index.html`.
2.  Increment the version number (e.g. from `1.2.1` to `1.2.2`) in three places:
    *   The stylesheet query: `styles.css?v=1.2.2`
    *   The lobby footer indicator: `<div class="version-tag">v1.2.2</div>`
    *   The script query: `game.js?v=1.2.2`
3.  Commit and push the changes:
    ```bash
    git add index.html styles.css game.js
    git commit -m "Bump version to v1.2.2 with layout updates"
    git push origin main
    ```
4.  Mobile users will instantly download the new assets once the page is reloaded. The lobby screen version tag can be used to quickly verify they are running the latest code.
