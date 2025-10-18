import { AI_MODELS } from "@/libraries/openai/domain/ai-models";
import { YoutubePlayerService } from "@/libraries/youtube/youtube-player.service";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { z } from "zod";
import { AudioPlayerService } from "../audio/audio-player.service";
import { AudioToolbarService } from "../audio/audio-toolbar.service";
import { AudioService } from "../audio/audio.service";

// Define the system prompt template
const systemPrompt = `You are Jarvis, an intelligent voice assistant with a distinct personality.
Provide concise, accurate responses with a touch of friendliness.
Focus on delivering practical information rather than lengthy explanations.
When asked for instructions or how-to guidance, break down complex processes into clear, numbered steps.
For factual questions, prioritize up-to-date, verified information.
If you cannot provide a definitive answer, clearly acknowledge this rather than speculating.
Adapt your tone to match the urgency and context of each query.
DO NOT use markdown formatting, use plain text. Adjust your response to spoken language, for example do not use symbols like * or _ or #, neither can you use phrases like "e.g." or "i.e." or "etc.".
You have access to the following tools:
- play_music: Use this tool to play a song when the user asks you to play music. The input should be a concise description of the song (e.g., 'Starboy by The Weeknd', 'latest hit by Taylor Swift').
- stop_music: Use this tool to stop any music currently playing.
IMPORTANT: When using tools that accept a query or text input from the user (like play_music), you MUST use the exact text and language provided by the user. DO NOT translate the user's query.
Respond ONLY with the final answer to the user, do not provide reasoning for tool usage unless explicitly asked.`;

export class JarvisAIService {
  private readonly llm: ChatGoogleGenerativeAI;
  private readonly agentExecutor: AgentExecutor;
  private chatHistory: BaseMessage[] = []; // Simple in-memory chat history

  constructor(
    private readonly aiAudioService: AudioService,
    private readonly youtubePlayerService: YoutubePlayerService,
    private readonly audioPlayerService: AudioPlayerService,
    private readonly audioToolbarService: AudioToolbarService
  ) {
    // Initialize the Gemini LLM
    this.llm = new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
      model: AI_MODELS.GEMINI_2_FLASH.name, // Use a modern Gemini model supporting tool calls
      temperature: 0.7,
    });

    // Define tools
    const tools = [
      new DynamicStructuredTool({
        name: "play_music",
        description: "Plays a song based on a textual query. IMPORTANT: Pass the user's query exactly as they provided it, without translation.",
        schema: z.object({
          language: z.string().describe("The language of the user's original request."),
          query: z.string().describe("The name of the song and/or artist to search for and play. MUST be in the same language as the user's original request. DO NOT translate."),
        }),
        func: async ({ language, query }) => {
          try {
            // Activate the audio toolbar with the song query as title
            this.audioToolbarService.activateToolbar(query);

            // Use the injected service
            await this.youtubePlayerService.playSong(query, language);

            return `Now playing song matching: ${query}`;
          } catch (error: any) {
            console.error("Error in play_music tool:", error);
            return `Failed to play song matching "${query}": ${error.message}`;
          }
        },
      }),
      new DynamicStructuredTool({
        name: "stop_music",
        description: "Stops the currently playing music.",
        schema: z.object({}), // No arguments needed
        func: async () => {
          try {
            // Use the injected service
            await this.audioPlayerService.stopAudio();

            return "Music stopped.";
          } catch (error: any) {
            console.error("Error in stop_music tool:", error);
            return `Failed to stop music: ${error.message}`;
          }
        },
      }),
    ];

    // Create the prompt template
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", systemPrompt],
      new MessagesPlaceholder("chat_history"),
      ["human", "{input}"],
      new MessagesPlaceholder("agent_scratchpad"),
    ]);

    // Create the agent
    const agent = createToolCallingAgent({
      llm: this.llm,
      tools,
      prompt,
    });

    // Create the agent executor
    this.agentExecutor = new AgentExecutor({
      agent,
      tools,
      verbose: true, // Optional: for logging agent steps
    });
  }

  async ask(query: string): Promise<string> {
    const response = await this.agentExecutor.invoke({
      input: query,
      chat_history: this.chatHistory,
    });

    // Add interaction to chat history
    this.chatHistory.push(new HumanMessage(query));
    this.chatHistory.push(new AIMessage(response.output));

    // Keep chat history length manageable (e.g., last 10 messages)
    if (this.chatHistory.length > 10) {
      this.chatHistory = this.chatHistory.slice(-10);
    }

    // The final answer is in the 'output' field
    return response.output;
  }

  async speak(textToSpeak: string): Promise<void> {
    await this.aiAudioService.speak(textToSpeak);
  }

  async askAndSpeak(query: string): Promise<void> {
    const responseText = await this.ask(query);
    // Only speak if there's a response text (tool calls might not have direct verbal output)
    if (responseText) {
      await this.aiAudioService.speak(responseText);
    }
  }
}
