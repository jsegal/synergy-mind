import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AudioAnalysisRequest {
  base64Audio: string;
  mimeType: string;
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
      return new Response(
        JSON.stringify({
          error: "GEMINI_API_KEY not configured. Please add your Gemini API key in Supabase Dashboard > Edge Functions > Secrets"
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { base64Audio, mimeType }: AudioAnalysisRequest = await req.json();

    if (!base64Audio || !mimeType) {
      throw new Error("Missing required fields: base64Audio and mimeType");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    genAI.apiVersion = "v1beta";
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        thinkingMode: "enabled",
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            transcript: { type: "string" },
            summary: { type: "string" },
            keyPoints: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  speaker: { type: "string" },
                  point: { type: "string" },
                  emphasis: { type: "string" }
                },
                required: ["speaker", "point", "emphasis"]
              }
            },
            nextSteps: {
              type: "array",
              items: { type: "string" }
            },
            participantIntention: { type: "string" },
            insights: {
              type: "object",
              properties: {
                bigPicture: { type: "string" },
                hiddenOpportunity: { type: "string" },
                wisePath: {
                  type: "object",
                  properties: {
                    content: { type: "string" }
                  },
                  required: ["content"]
                }
              },
              required: ["bigPicture", "hiddenOpportunity", "wisePath"]
            }
          },
          required: ["transcript", "summary", "keyPoints", "nextSteps", "participantIntention", "insights"]
        }
      }
    });

    const prompt = `
Analyze this conversation as SynergyMind, an elite consultant.
Generate a JSON report with:
1. transcript: full transcription.
2. summary: concise value summary.
3. Trinity of Insight (insights object):
   - bigPicture: A wider perspective, future goals, and possible great outcomes.
   - hiddenOpportunity: How to make the best of the situation using untapped resources or hidden benefits.
   - wisePath: Multi-Advisor Synthesis using this framework:

     THINKING PHASE (hidden internal deliberation):
     - Identify 3-5 advisors from this list whose life philosophies MOST DIRECTLY solve this specific conflict: Marcus Aurelius, Maya Angelou, Warren Buffett, Viktor Frankl, Lao Tzu, Peter Drucker, Brené Brown, Dale Carnegie, Jim Rohn, Benjamin Franklin
     - Simulate a dialogue where these advisors challenge each other. Example: Have Drucker analyze the 'efficiency' while Angelou questions the 'human cost.'

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

     SYNTHESIZED OUTPUT (wisePath.content - 150 words max):
     - Blend their wisdom into ONE cohesive voice - "The Ultimate Mentor"
     - DO NOT say "Buffett says this" or "Brown says that"
     - MUST address all three lenses:
       * Relationships/Wellness
       * Ethics/Alignment
       * Success/Action
     - The statement must carry the weight and specific vocabulary of the selected masters
     - Not generic - authentic and deeply wise

4. keyPoints: speaker name, their point, and emphasis.
5. nextSteps: clear roadmap actions.
6. participantIntention: the deep why behind the talk.
`;

    console.log("Calling Gemini API with audio data...");
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64Audio
        }
      },
      { text: prompt }
    ]);

    console.log("Gemini API call successful");
    const response = result.response;
    const responseText = response.text();
    console.log("Response text length:", responseText.length);

    const analysisResult = JSON.parse(responseText);
    console.log("Successfully parsed analysis result");

    return new Response(
      JSON.stringify(analysisResult),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in audio-analysis function:", error);

    let errorMessage = "Internal server error";
    let errorDetails = "";

    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = error.stack || "";
    }

    console.error("Error details:", errorDetails);

    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: errorDetails.substring(0, 500)
      }),
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