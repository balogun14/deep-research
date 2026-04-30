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
      let lastLoggedIndex = -1;

      while (true) {
        result = await this.client.interactions.get(interaction.id);
        
        const outputs = result.outputs || [];

        // Log any NEW outputs we haven't seen yet
        for (let i = lastLoggedIndex + 1; i < outputs.length; i++) {
          const output = outputs[i];
          if (output.type === 'thought_summary') {
            console.log(`🤔 [Thinking]: ${output.text}`);
          } else if (output.type === 'text') {
            console.log(`📝 [Progress]: New section received...`);
          }
          lastLoggedIndex = i;
        }

        if (result.status === 'completed') {
          console.log('✅ Research completed!');
          
          // Concatenate ALL text outputs to form the full report
          const fullReport = outputs
            .filter((o: any) => o.type === 'text')
            .map((o: any) => o.text)
            .join('\n\n');
          
          return {
            report: fullReport || "No text report found.",
            id: interaction.id
          };
        } else if (result.status === 'failed') {
          throw new Error(`Research failed: ${result.error}`);
        }

        if (outputs.length === 0) {
          console.log(`⏳ Initializing research (Status: ${result.status})...`);
        }

        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    } catch (error) {
      console.error('❌ Error during research:', error);
      throw error;
    }
  }

  /**
   * Saves the research report as a Markdown file.
   * @param report The text content of the report.
   * @param filePath The path where the Markdown should be saved.
   */
  async saveAsMarkdown(report: string, filePath: string): Promise<string> {
    await fs.promises.writeFile(filePath, report, 'utf8');
    return filePath;
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
        doc.fontSize(24).fillColor('#2c3e50').text('Deep Research Report', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(10).fillColor('#7f8c8d').text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown(2);

        // Content
        doc.fontSize(11).fillColor('#34495e').text(report, {
          align: 'justify',
          lineGap: 4
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

