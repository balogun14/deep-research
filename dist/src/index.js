import { DeepResearchAgent } from './research.js';
async function main() {
    const agent = new DeepResearchAgent();
    // Example topic
    const topic = process.argv[2] || 'Analyze the current state of the global semiconductor market and key players.';
    try {
        const result = await agent.performResearch(topic);
        console.log('\n--- RESEARCH REPORT ---');
        console.log(result.report);
        console.log('\n--- STRUCTURED DATA (DATAFRAME) ---');
        console.table(result.data);
        console.log(`\nFull results saved with ID: ${result.id}`);
    }
    catch (error) {
        process.exit(1);
    }
}
main();
