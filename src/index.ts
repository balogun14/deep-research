import { DeepResearchAgent } from './research.js';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const agent = new DeepResearchAgent();
  
  // Example topic
  const topic = process.argv[2] || 'Analyze the current state of the global semiconductor market and key players.';

  try {
    const result = await agent.performResearch(topic);
    
    // Ensure output directory exists
    const outputDir = './output';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    // Create a relevant filename from the topic
    const slug = topic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .substring(0, 50);
    
    const baseFileName = `${slug || 'research'}_${Date.now()}`;
    const pdfPath = path.join(outputDir, `${baseFileName}.pdf`);
    const mdPath = path.join(outputDir, `${baseFileName}.md`);
    
    console.log('\n--- RESEARCH REPORT SUMMARY ---');
    console.log(result.report.substring(0, 500) + '...');
    
    await agent.saveAsMarkdown(result.report, mdPath);
    await agent.saveAsPDF(result.report, pdfPath);

    console.log(`\n✅ Reports saved to:`);
    console.log(`   - Markdown: ${mdPath}`);
    console.log(`   - PDF: ${pdfPath}`);
    console.log(`Full results interaction ID: ${result.id}`);
  } catch (error) {
    console.error('Failed to perform research:', error);
    process.exit(1);
  }
}

main();
