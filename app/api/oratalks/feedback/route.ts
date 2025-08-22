    import { NextRequest, NextResponse } from "next/server"

    export async function POST(request: NextRequest) {
        try {
            const req = await request.json()
            console.log('Feedback received:', req)
            
            return NextResponse.json({ message: 'Feedback received' }, { status: 200 })
        } catch (error) {
            console.error('API error:', error)
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
        }
    }