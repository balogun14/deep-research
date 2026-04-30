import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

/**
 * DeepResearchAgent class to handle complex research tasks using Gemini Deep Research.
 */
export class DeepResearchAgent {
  private client: any;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GOOGLE_API_KEY;
    if (!key) {
      throw new Error('GOOGLE_API_KEY is missing. Please set it in your .env file or pass it to the constructor.');
    }
    this.client = new GoogleGenAI({ apiKey: key });
  }

  /**
   * Executes a research task and returns the result.
   * @param topic The research topic/query.
   * @param options Configuration for the research.
   */
  async performResearch(topic: string, options: { maxComprehensiveness?: boolean } = {}) {
    const agentModel = options.maxComprehensiveness 
      ? 'deep-research-max-preview-04-2026' 
      : 'deep-research-preview-04-2026';

    console.log(`🚀 Starting deep research on: "${topic}" using ${agentModel}...`);

    try {
      const interaction = await this.client.interactions.create({
        input: topic,
        agent: agentModel,
        background: true,
        agent_config: {
          type: 'deep-research',
          thinking_summaries: 'auto',
          visualization: 'auto'
        }
      });

      console.log(`🆔 Research ID: ${interaction.id}`);

      let result: any;
      while (true) {
        result = await this.client.interactions.get(interaction.id);
        
        const outputs = result.outputs || [];
        const latestOutput = outputs.length > 0 ? outputs[outputs.length - 1] : null;

        if (result.status === 'completed') {
          console.log('✅ Research completed!');
          
          // Find the final text report (it might not be the absolute last output if there are images/etc)
          const textOutput = outputs.reverse().find((o: any) => o.type === 'text')?.text || "No text report found.";
          
          return {
            report: textOutput,
            id: interaction.id
          };
        } else if (result.status === 'failed') {
          throw new Error(`Research failed: ${result.error}`);
        }

        // Log latest status/thinking
        if (latestOutput?.type === 'thought_summary') {
          console.log(`🤔 Thinking: ${latestOutput.text}`);
        } else if (latestOutput?.type === 'text') {
          console.log(`📝 Partial report received...`);
        } else {
          console.log(`⏳ Status: ${result.status}...`);
        }

        await new Promise(resolve => setTimeout(resolve, 15000));
      }
    } catch (error) {
      console.error('❌ Error during research:', error);
      throw error;
    }
  }

  /**
   * Saves the research report as a PDF file.
   * @param report The text content of the report.
   * @param filePath The path where the PDF should be saved.
   */
  async saveAsPDF(report: string, filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Title
        doc.fontSize(20).text('Deep Research Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown(2);

        // Content
        doc.fontSize(12).text(report, {
          align: 'justify',
          columns: 1,
          lineGap: 2
        });

        doc.end();

        stream.on('finish', () => {
          resolve(filePath);
        });

        stream.on('error', (err) => {
          reject(err);
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

