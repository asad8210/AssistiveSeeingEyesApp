import { NextRequest, NextResponse } from "next/server";
import { isContentRelevant, ContentRelevanceInput, ContentRelevanceOutput } from "../../../ai/flows/content-relevance";

// POST /api/content-relevance
// Expects a JSON body: { "query": string, "content": string }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input: ContentRelevanceInput = {
      query: body.query,
      content: body.content,
    };

    // Validate input
    if (!input.query || !input.content) {
      return NextResponse.json(
        { error: "Both query and content are required" },
        { status: 400 }
      );
    }

    // Call AI flow to evaluate content relevance
    const result: ContentRelevanceOutput = await isContentRelevant(input);

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow Capacitor app access (restrict in production)
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Error in content-relevance API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle CORS preflight requests
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  );
}