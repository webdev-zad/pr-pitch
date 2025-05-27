import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { google } from "googleapis";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { to, subject, body } = await request.json();

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: session.accessToken as string,
    });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Create email message
    const emailLines = [`To: ${to}`, `Subject: ${subject}`, "", body];

    const email = emailLines.join("\n");
    const encodedEmail = Buffer.from(email).toString("base64").replace(/\+/g, "-").replace(/\//g, "_");

    // Send email
    const response = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: encodedEmail,
      },
    });

    return NextResponse.json({
      success: true,
      messageId: response.data.id,
    });
  } catch (error) {
    console.error("Gmail send error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
