import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
}

const messagesFile = process.env.MESSAGES_FILE_PATH || path.join(process.cwd(), "data", "messages.json");

function readMessages(): Message[] {
  if (fs.existsSync(messagesFile)) {
    const data = fs.readFileSync(messagesFile, "utf8");
    return JSON.parse(data);
  }
  return [];
}

function writeMessages(messages: Message[]) {
  // Ensure the directory exists
  const dir = path.dirname(messagesFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(messagesFile, JSON.stringify(messages));
}

export async function GET() {
  const messages = readMessages();
  return NextResponse.json(messages);
}

export async function POST(request: Request) {
  const newMessage: Message = await request.json();
  const messages = readMessages();
  messages.push(newMessage);
  writeMessages(messages);
  return NextResponse.json(newMessage, { status: 201 });
}
