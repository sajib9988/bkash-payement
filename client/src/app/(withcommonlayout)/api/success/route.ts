import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData(); // SSLCommerz sends form-data
    console.log("Payment success data from SSLCommerz:", Object.fromEntries(body));

    // Optional: Save to DB or verify payment

    // Redirect to frontend success page
    return NextResponse.redirect("http://localhost:3000/success", {
      status: 302,
    });
  } catch (error) {
    console.error("Error in SSLCommerz success handler:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
