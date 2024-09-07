import { NextResponse } from "next/server";

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
}

let messages: Message[] = [];

export async function GET() {
  return NextResponse.json(messages);
}

export async function POST(request: Request) {
  const newMessage: Message = await request.json();
  messages.push(newMessage);
  return NextResponse.json(newMessage, { status: 201 });
}
