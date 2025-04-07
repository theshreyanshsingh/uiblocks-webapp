import { NextResponse } from "next/server";
import { createCheckout } from "@/app/config/polar";

export async function POST(request: Request) {
  try {
    // Get email and id from request body
    const { email, id } = await request.json();

    if (!email || !id) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Create checkout session at runtime
    const checkout = await createCheckout({ email, id });

    if (!checkout || !checkout.url) {
      throw new Error("Invalid checkout response: URL is missing");
    }

    // Return checkout URL instead of redirecting
    return NextResponse.json({ checkoutUrl: checkout.url });
  } catch (error) {
    console.error("Checkout creation error:", error);

    // Provide more specific error messages based on the error type
    if (error instanceof Error) {
      if (error.message.includes("access token")) {
        return NextResponse.json(
          { error: "Polar access token is not configured" },
          { status: 500 }
        );
      } else if (error.message.includes("URL is missing")) {
        return NextResponse.json(
          { error: "Invalid checkout response: URL is missing" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
