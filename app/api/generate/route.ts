// app/api/generate/route.ts
import { GenerateFiles } from "@/app/helpers/AiGen";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const string = await req.json(); // Add backend

    const { input, framework, cssLibrary, memory, images } = string;
    if (!input) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }
    if (!framework) {
      return NextResponse.json(
        { error: "Framework is required" },
        { status: 400 }
      );
    }
    if (!cssLibrary) {
      return NextResponse.json(
        { error: "CSS Library is required" },
        { status: 400 }
      );
    }

    const text = await GenerateFiles({
      prompt: input,
      memory,
      framework,
      cssLib: cssLibrary,
      images,
    });
    return new Response(text, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
