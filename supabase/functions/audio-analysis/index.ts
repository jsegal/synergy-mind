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
      throw new Error("GEMINI_API_KEY not configured");
    }

    const { base64Audio, mimeType }: AudioAnalysisRequest = await req.json();

    if (!base64Audio || !mimeType) {
      throw new Error("Missing required fields: base64Audio and mimeType");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp",
      generationConfig: {
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
                    content: { type: "string" },
                    sageName: { type: "string" }
                  },
                  required: ["content", "sageName"]
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
   - wisePath: Philosophical suggestion. Pick the MOST relevant sage from: [Marcus Aurelius, Benjamin Franklin, Warren Buffett, Peter Drucker, Maya Angelou, Dale Carnegie, Viktor Frankl, Brené Brown, Lao Tzu, Jim Rohn].
4. keyPoints: speaker name, their point, and emphasis.
5. nextSteps: clear roadmap actions.
6. participantIntention: the deep why behind the talk.
`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType,
          data: base64Audio
        }
      },
      { text: prompt }
    ]);

    const response = result.response;
    const analysisResult = JSON.parse(response.text());

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