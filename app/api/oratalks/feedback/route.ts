    import { NextRequest, NextResponse } from "next/server"
    const API_URL = process.env.NEXT_PUBLIC_API_URL
    export async function POST(request: NextRequest) {
        console.log('API route hit - POST method called')
        try {
            const req = await request.json()
            console.log('Feedback received:', req)
            
            // Deconstruct the request and map to Gravity Forms field IDs
            const gravityFormsData = {
                'input_1': req.episode, // Episode title
                'input_2': req.rating, // Rating field (1-5 stars)
                'input_3': req.feedback, // Feedback text
                'input_4': req.user.email, // User email
                'input_5': req.episode_number, // Episode number
            }
            
            console.log('Mapped to Gravity Forms:', gravityFormsData)
            console.log('Sending to Gravity Forms URL:', `${API_URL}/wp-json/gf/v2/forms/2/submissions`)
            console.log('Request body being sent:', JSON.stringify(gravityFormsData, null, 2))
            
            try {
              const response = await fetch(
                `${API_URL}/wp-json/gf/v2/forms/${req.form_id}/submissions`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(gravityFormsData),
                }
              );
              const res = await response.json();
              console.log('Gravity Forms response:', res)
            } catch (e) {
              console.log('Gravity Forms error:', e);
            }
            
            
            return NextResponse.json({ message: 'Feedback received' }, { status: 200 })
        } catch (error) {
            console.error('API error:', error)
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
        }
    }