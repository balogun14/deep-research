# Gemini Deep Research Orchestrator: PANS FUOYE Edition 💊

An autonomous research orchestrator built for the **"Autonomous Pharmacy: Re-engineering the Medication Lifecycle Leveraging AI"** hackathon theme. This tool uses the Gemini Deep Research API to brainstorm, delegate, and synthesize complex pharmaceutical research specifically for the Nigerian context.

## 🚀 Vision
To move from a "Dangerous Analog" medication lifecycle to a "Seamless, Self-Optimizing Ecosystem" by leveraging agentic AI that understands local constraints like low bandwidth, erratic power, and data silos.

## ✨ Core Features
- **Strategic Brainstorming**: Automatically generates 3-5 innovative pharmacy projects based on your custom `prompt.txt`.
- **Multi-Agent Orchestration**: Spins up dedicated research agents for every suggested project.
- **Real-Time Thought Streaming**: Watch the AI's internal reasoning process as it navigates the global and local research landscape.
- **Dual Format Export**: Generates professional **Markdown** and **PDF** reports for every project.
- **Nigerian Context Focus**: Prioritizes offline-first architecture, HL7/FHIR interoperability, and supply chain resilience.

## 🛠 Setup

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   pnpm install
   ```
3. **Configure Environment**:
   Create a `.env` file and add your Google API Key:
   ```env
   GOOGLE_API_KEY=your_api_key_here
   ```
4. **Define your Strategy**:
   Edit `prompt.txt` to fine-tune the agent's goals and constraints.

## 🏃 Usage
Start the orchestration engine:
```bash
pnpm start
```
The agent will:
1. Brainstorm project ideas.
2. Research each project deeply.
3. Save all reports to the `/output` folder.

## 📂 Project Structure
- `src/index.ts`: The Orchestrator engine.
- `src/research.ts`: The DeepResearchAgent implementation.
- `output/`: Where your winning reports are saved.
- `prompt.txt`: The strategic brain of your agents.

## ⚖️ Hackathon Winning Points
- **Interoperability**: Built with HL7/FHIR focus.
- **Clinical Safety**: Emphasizes Explainable AI (XAI).
- **Practicality**: Designed for low-bandwidth and offline-first environments.
