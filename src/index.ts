import { DeepResearchAgent } from './research.js';

async function main() {
  const agent = new DeepResearchAgent();
  
  // Example topic
  const topic = process.argv[2] || 'Analyze the current state of the global semiconductor market and key players.';

  try {
    const result = await agent.performResearch(topic);
    console.log('\n--- RESEARCH REPORT ---');
    console.log(result.report.substring(0, 500) + '...');
    
    const pdfPath = `research_${Date.now()}.pdf`;
    await agent.saveAsPDF(result.report, pdfPath);

    console.log(`\n✅ PDF Report saved to: ${pdfPath}`);
    console.log(`Full results interaction ID: ${result.id}`);
  } catch (error) {
    console.error('Failed to perform research:', error);
    process.exit(1);
  }
}

main();
