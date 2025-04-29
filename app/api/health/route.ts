import { NextResponse } from "next/server"

export async function GET() {
  // You can add more sophisticated health checks here
  // For example, checking database connections, etc.
  return NextResponse.json({ status: "ok", timestamp: new Date().toISOString() }, { status: 200 })
}
