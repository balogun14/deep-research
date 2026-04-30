import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config();
/**
 * DeepResearchAgent class to handle complex research tasks using Gemini Deep Research.
 */
export class DeepResearchAgent {
    client;
    constructor(apiKey) {
        const key = apiKey || process.env.GOOGLE_API_KEY;
        if (!key) {
            throw new Error('GOOGLE_API_KEY is missing. Please set it in your .env file or pass it to the constructor.');
        }
        this.client = new GoogleGenAI(key);
    }
    /**
     * Executes a research task and returns the result as a structured format.
     * @param topic The research topic/query.
     * @param options Configuration for the research.
     */
    async performResearch(topic, options = {}) {
        const agentModel = options.maxComprehensiveness
            ? 'deep-research-max-preview-04-2026'
            : 'deep-research-preview-04-2026';
        console.log(`🚀 Starting deep research on: "${topic}" using ${agentModel}...`);
        // We steer the agent to provide results in a way that we can parse into a "dataframe" (JSON array)
        const prompt = `
      ${topic}
      
      IMPORTANT: After your detailed analysis, provide a summary table of the key data points found.
      Format this table as a CSV block at the end of your response, starting with "---DATA_START---" and ending with "---DATA_END---".
      Ensure the CSV has a header row.
    `;
        try {
            const interaction = await this.client.interactions.create({
                input: prompt,
                agent: agentModel,
                background: true,
                agent_config: {
                    type: 'deep-research',
                    thinking_summaries: 'auto',
                    visualization: 'auto'
                }
            });
            console.log(`🆔 Research ID: ${interaction.id}`);
            let result;
            while (true) {
                result = await this.client.interactions.get(interaction.id);
                if (result.status === 'completed') {
                    console.log('✅ Research completed!');
                    const lastOutput = result.outputs[result.outputs.length - 1].text;
                    return {
                        report: lastOutput,
                        data: this.parseDataframe(lastOutput),
                        id: interaction.id
                    };
                }
                else if (result.status === 'failed') {
                    throw new Error(`Research failed: ${result.error}`);
                }
                // Log thinking summaries if available
                const latestOutput = result.outputs[result.outputs.length - 1];
                if (latestOutput?.type === 'thought_summary') {
                    console.log(`🤔 Thinking: ${latestOutput.text}`);
                }
                else {
                    console.log(`⏳ Research in progress (Status: ${result.status})...`);
                }
                await new Promise(resolve => setTimeout(resolve, 15000)); // Poll every 15 seconds
            }
        }
        catch (error) {
            console.error('❌ Error during research:', error);
            throw error;
        }
    }
    /**
     * Parses the CSV block from the report into a JSON array (dataframe equivalent).
     */
    parseDataframe(text) {
        const startTag = '---DATA_START---';
        const endTag = '---DATA_END---';
        const startIndex = text.indexOf(startTag);
        const endIndex = text.indexOf(endTag);
        if (startIndex === -1 || endIndex === -1) {
            console.warn('⚠️ No structured data table found in the response.');
            return [];
        }
        const csvContent = text.substring(startIndex + startTag.length, endIndex).trim();
        const lines = csvContent.split('\n');
        if (lines.length < 2)
            return [];
        const headers = lines[0].split(',').map(h => h.trim());
        const data = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = values[index];
            });
            return obj;
        });
        return data;
    }
}
