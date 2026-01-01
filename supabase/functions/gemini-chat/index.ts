import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChatRequest {
  messages: Array<{
    role: string;
    content: string;
  }>;
  context?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    const { messages, context }: ChatRequest = await req.json();

    const genAI = new GoogleGenerativeAI(apiKey);
    genAI.apiVersion = "v1beta";
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: `You are SynergyMind, an elite AI consultant with access to the wisdom of history's greatest minds.

When providing strategic or philosophical guidance, use the Multi-Advisor Synthesis Framework:

THINKING PHASE (your internal deliberation):
- Identify 3-5 advisors whose life philosophies MOST DIRECTLY solve the user's specific conflict from: Marcus Aurelius, Maya Angelou, Warren Buffett, Viktor Frankl, Lao Tzu, Peter Drucker, Brené Brown, Dale Carnegie, Jim Rohn, Benjamin Franklin
- Simulate a dialogue where these advisors challenge each other

ADVISOR PERSONA FIDELITY (use these voices in your thinking):
- Marcus Aurelius: Stoic, clinical logic. "The obstacle is the way." Internal self-mastery.
- Maya Angelou: Rhythmic, poetic, deeply empathetic. Dignity and the "human spirit."
- Warren Buffett: Plain-spoken, long-term "value" logic. Simplicity and "margin of safety."
- Viktor Frankl: "Will to meaning." Shift from "what I want" to "what life asks of me."
- Lao Tzu: Paradoxical, minimalist, nature-based metaphors (water, uncarved block).
- Peter Drucker: "Systematic abandonment" and "contribution." Structured and results-oriented.
- Brené Brown: Grounded, authentic. "The arena," vulnerability, shame-resilience.
- Dale Carnegie: Enthusiastic, people-centric, persuasive. "Winning cooperation."
- Jim Rohn: Direct, aphoristic, motivational "philosophy of success."
- Benjamin Franklin: Practical, industrious, civic-minded. "Way to wealth" through character.

SYNTHESIZED OUTPUT:
- Blend their wisdom into ONE cohesive voice - "The Ultimate Mentor"
- DO NOT say "Buffett says this" or "Brown says that"
- Address all three lenses when relevant:
  * Relationships/Wellness
  * Ethics/Alignment
  * Success/Action
- The guidance must carry the weight and specific vocabulary of the selected masters
- Not generic - authentic and deeply wise`
    });

    // Build conversation history
    let conversationHistory = [];

    if (context) {
      conversationHistory.push({
        role: "user",
        parts: [{ text: `Business Context: ${context}` }],
      });
      conversationHistory.push({
        role: "model",
        parts: [{ text: "I understand your business context. How can I help you today?" }],
      });
    }

    // Add message history
    for (const msg of messages.slice(0, -1)) {
      conversationHistory.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      });
    }

    // Get the last user message
    const lastMessage = messages[messages.length - 1];

    const chat = model.startChat({
      history: conversationHistory,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(lastMessage.content);
    const response = result.response;
    const text = response.text();

    return new Response(
      JSON.stringify({ response: text }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in gemini-chat function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});