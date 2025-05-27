import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { google } from "googleapis";
import { authOptions } from "@/lib/auth";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: session.accessToken as string,
    });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Get list of messages
    const messagesResponse = await gmail.users.messages.list({
      userId: "me",
      maxResults: 5,
      q: "in:inbox",
    });

    const messages = messagesResponse.data.messages || [];

    // Get details for each message
    const messageDetails = await Promise.all(
      messages.map(async (message) => {
        const detail = await gmail.users.messages.get({
          userId: "me",
          id: message.id!,
        });

        const headers = detail.data.payload?.headers || [];
        const subject = headers.find((h) => h.name === "Subject")?.value || "";
        const from = headers.find((h) => h.name === "From")?.value || "";
        const date = headers.find((h) => h.name === "Date")?.value || "";

        return {
          id: message.id,
          subject,
          from,
          snippet: detail.data.snippet || "",
          date,
        };
      })
    );

    return NextResponse.json({ messages: messageDetails });
  } catch (error) {
    console.error("Gmail API error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}
