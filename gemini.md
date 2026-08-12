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

1.  **Friction-Free Interaction (Click-to-Place)**:
    *   Young children often struggle with dragging elements using a laptop trackpad. 
    *   We replaced drag-and-drop with a simple **tap/click gesture**. When a number bubble is clicked, it automatically flies into its correct position.
2.  **Voice Narration (Text-to-Speech)**:
    *   Since Senior KG children are still learning to read, the game features spoken instructions.
    *   Using the browser's native **Web Speech API**, the game reads out level instructions (e.g. *"Help the monkey climb up! Click the smallest number first!"*) and interactive prompts.
3.  **Positive Reinforcement & Visual Scaffold**:
    *   No harsh buzzers or "Game Over" states. Incorrect answers prompt a gentle wobble animation and a spoken clue (e.g. *"Oops! Try looking for the smallest number, which is 3."*).
    *   Correct answers reward the child with mascot hops, sound chimes, and a confetti shower upon level completion.
4.  **Zero-Asset Offline Capability**:
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
