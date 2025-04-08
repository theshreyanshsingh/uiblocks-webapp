// app/api/chat/route.ts
import { makeStreamText } from "@/app/helpers/AiGen";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const runtime = "edge"; // Edge runtime is good for streaming
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const token = await getToken({
      req,
      secret: process.env.NEXT_PUBLIC_NEXTAUTH_SECRET,
    });

    // If no token exists, user is not authenticated
    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    const string = await req.json();
    const { userPrompt, framework, csslib, memory, chatHistory, data, images } =
      string;

    if (!userPrompt) {
      return new NextResponse(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const prompt = JSON.stringify({
      userPrompt,
      csslib,
      framework,
      memory,
      files: data,
    });

    const text = await makeStreamText({ prompt, images, history: chatHistory });

    return new Response(text, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error: unknown) {
    console.log(error);
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    return new NextResponse(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
