import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    // Logic to find users who haven't studied today
    const users = await prisma.user.findMany()
    
    // In a real app, you'd send a push notification or email here
    console.log(`Sending notifications to ${users.length} users...`)
    
    return NextResponse.json({ success: true, notified: users.length })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}
