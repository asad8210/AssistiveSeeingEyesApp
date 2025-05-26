import { NextRequest, NextResponse } from "next/server";
import { personalAssistant, PersonalAssistantInput, PersonalAssistantOutput } from "../../../ai/flows/personal-assistant";

// POST /api/personal-assistant
// Expects a JSON body: { "speech": string, "location"?: string }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input: PersonalAssistantInput = {
      speech: body.speech,
      location: body.location,
    };

    // Validate input
    if (!input.speech) {
      return NextResponse.json(
        { error: "speech is required" },
        { status: 400 }
      );
    }

    // Call AI flow to process the assistant request
    const result: PersonalAssistantOutput = await personalAssistant(input);

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow Capacitor app access (restrict in production)
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Error in personal-assistant API:", error);
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