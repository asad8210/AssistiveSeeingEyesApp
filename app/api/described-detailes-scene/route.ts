import { NextRequest, NextResponse } from "next/server";
import { describeDetailedScene, DescribeDetailedSceneInput, DescribeDetailedSceneOutput } from "../../../ai/flows/describe-detailed-scene-flow";

// POST /api/described-detailes-scene
// Expects a JSON body: { "photoDataUri": string, "previousDetailedDescription"?: string }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input: DescribeDetailedSceneInput = {
      photoDataUri: body.photoDataUri,
      previousDetailedDescription: body.previousDetailedDescription,
    };

    // Validate input
    if (!input.photoDataUri) {
      return NextResponse.json(
        { error: "photoDataUri is required" },
        { status: 400 }
      );
    }
    if (!input.photoDataUri.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "photoDataUri must be a valid base64-encoded image data URI" },
        { status: 400 }
      );
    }

    // Call AI flow to describe the scene
    const result: DescribeDetailedSceneOutput = await describeDetailedScene(input);

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Allow Capacitor app access (restrict in production)
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Error in described-detailes-scene API:", error);
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