# 🔄 The Pumping Lemma

**A beginner-friendly deep-dive into why some languages break machines.**

[**Live Demo** →](https://v0-deploy-project-gamma.vercel.app/index.html)

---

## 📖 What is The Pumping Lemma?

The Pumping Lemma is a fundamental concept in computational theory that proves whether a language can be recognized by a machine. If we can "pump" (repeat) a portion of any string long enough and it stays in the language, the language might be regular. If pumping breaks it — the language is **NOT regular**.

---

## 🎯 Key Features

### **Regular Language Simulator**
- Interactive visualization of how finite state automata work
- Test string pumping on L = {PⁿDⁿ}
- Learn the adversary game: **You vs. the hypothetical FSM**

### **Context-Free Language Simulator** 
- Explore Pushdown Automata (PDAs) with memory/stack
- Visualize parse tree collapse
- Prove languages like L = {aⁿbⁿcⁿ} are not context-free

### **Educational Breakdown**
- **3-Part Decomposition** (s = xyz) for Regular Languages
- **5-Part Decomposition** (s = uvxyz) for Context-Free Languages
- Real-world examples proving language properties
- Formal proof structures with step-by-step walkthroughs

---

## 💡 The Core Concept

**Problem:** Can this machine recognize this language?
- ✅ YES → Regular Language (FSA can handle it)
- ❌ NO → Pumping Lemma proves it's impossible

**The Proof by Contradiction:**
1. Assume the language is regular
2. Choose a carefully crafted string
3. The machine partitions it into x, y, z
4. Pump y (repeat it endlessly)
5. The result breaks the language
6. **Contradiction! The language is NOT regular**

---

## 📚 Core Topics Covered

- **Finite State Automata (FSA)** - Machines with no memory
- **Regular Languages** - What FSAs can recognize
- **Pushdown Automata (PDA)** - Machines with a stack
- **Context-Free Languages** - More powerful than regular
- **Pumping Length** - The critical threshold
- **Formal Proofs** - Prove language properties mathematically

---

## 🚀 Live Simulators

### [RL Simulator](https://v0-deploy-project-gamma.vercel.app/simulator.html)
Watch a string get pumped and see the FSA respond.

### [CFL Simulator](https://v0-deploy-project-gamma.vercel.app/cfl-simulator.html)
Visualize parse tree structures collapse under pumping.

---

## 📂 Project Structure

```
.
├── index.html         # Main landing page & theory
├── simulator.html     # Regular Language visualizer
├── cfl-simulator.html # Context-Free Language visualizer
├── src/
│   ├── main.js        # Application entry
│   ├── sim.js         # RL simulator logic
│   ├── cfl-sim.js     # CFL simulator logic
│   └── index.css      # Styling
```

---

## 🛠 Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Libraries used via CDN:** GSAP, Three.js, Lenis Smooth Scroll
- **Architecture:** Zero-build static site

---

## ⚡ Quick Start

Since this project requires no build tools or package managers:

1. Clone or download the repository
2. Open `index.html` directly in any modern web browser
3. (Optional) Serve via any simple local web server like Live Server (VS Code) or Python's `http.server`.

---

## 📖 Theory Section Content

- **The Enemy Game** - Adversarial proof structure
- **String Decomposition** - Breaking strings into pumped parts
- **RL vs CFL Comparison** - Key differences explained
- **Formal Conditions** - Exact mathematical constraints
- **Real Examples** - Prove { aⁿbⁿ }, { aⁿbⁿcⁿ } aren't regular/CF

---

## 🎓 Perfect For

- 🎓 Computer Science students (Theory of Computation)
- 👨‍💻 Algorithm enthusiasts learning language classes
- 📚 Anyone curious about computational limits
- 🧠 Visual learners (interactive simulators)

---

## 📝 License

This project is part of the CD Project RED series. See LICENSE file for details.

---

**Protocol 002 • Theory of Computation Dept. • Pumping Lemma v3.0**