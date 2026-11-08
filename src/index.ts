import { DeepResearchAgent } from './research.js';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const agent = new DeepResearchAgent();
  const outputDir = './output';

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // 1. Load the Strategy Prompt
  const promptPath = './prompt.txt';
  let strategyPrompt = '';
  if (fs.existsSync(promptPath)) {
    strategyPrompt = fs.readFileSync(promptPath, 'utf8');
    console.log('📖 Strategy Prompt injected from prompt.txt');
  }

  try {
    console.log('\n--- STAGE 1: STRATEGIC BRAINSTORMING ---');
    // We ask the agent to brainstorm the 3-5 projects first
    const brainstormingQuery = `${strategyPrompt}\n\nTASK: Based on your role, suggest 3-5 unique, innovative project ideas. For each idea, provide a clear title starting with "PROJECT_TITLE: " and a brief 2-sentence summary. Then stop.`;
    
    const brainstormingResult = await agent.performResearch(brainstormingQuery);
    
    // Save the brainstorming results
    await agent.saveAsMarkdown(brainstormingResult.report, path.join(outputDir, '00_strategic_brainstorming.md'));

    // 2. Extract project titles to delegate research
    const projectTitles = brainstormingResult.report
      .split('\n')
      .filter(line => line.includes('PROJECT_TITLE:'))
      .map(line => line.split('PROJECT_TITLE:')[1].trim());

    if (projectTitles.length === 0) {
      console.log('⚠️ No specific projects found to delegate. Saving master report only.');
      return;
    }

    console.log(`\n--- STAGE 2: DELEGATING RESEARCH TO ${projectTitles.length} AGENTS ---`);
    
    for (let i = 0; i < projectTitles.length; i++) {
      const title = projectTitles[i];
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 40);
      
      console.log(`\n🤖 Agent ${i + 1} starting deep dive: "${title}"...`);
      
      const projectQuery = `${strategyPrompt}\n\nPROJECT TO RESEARCH: ${title}\n\nTASK: Conduct a comprehensive deep dive into this specific project. Follow the "FOR EACH SUGGESTED PROJECT, RESEARCH AND OUTPUT" guidelines in your instructions.`;
      
      const projectResult = await agent.performResearch(projectQuery);
      
      const baseName = `${(i + 1).toString().padStart(2, '0')}_${slug}`;
      const mdPath = path.join(outputDir, `${baseName}.md`);
      const pdfPath = path.join(outputDir, `${baseName}.pdf`);

      await agent.saveAsMarkdown(projectResult.report, mdPath);
      await agent.saveAsPDF(projectResult.report, pdfPath);

      console.log(`✅ Finished Agent ${i + 1}: ${title}`);
      console.log(`   📄 Files: ${baseName}.md, ${baseName}.pdf`);
    }

    console.log('\n🏆 ALL RESEARCH AGENTS COMPLETED SUCCESSFULLY.');
    console.log(`📂 Check the "${outputDir}" folder for all generated reports.`);

  } catch (error) {
    console.error('❌ Orchestration failed:', error);
    process.exit(1);
  }
}

main();
