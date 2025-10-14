// app/api/leave-room/route.ts (Next.js App Router)
import { RoomUserService } from "@/lib/services/room_user.service"
import { NextRequest, NextResponse } from "next/server"

const roomUserService = new RoomUserService()

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { user_id } = body

        const res = await roomUserService.deleteByUser(user_id)

        if (res.success) {
            return NextResponse.json({ success: true })
        } else {
            return NextResponse.json({ success: false, error: res.error })
        }

        // Respond with success
    } catch (err) {
        console.error("Error in leave-room API:", err)
        return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 })
    }
}
