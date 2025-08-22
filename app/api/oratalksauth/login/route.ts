import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'


const JWT_SECRET = process.env.JWT_SECRET;
const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const listId = process.env.HUBSPOT_REGULAR_LIST_ID;

export async function POST(request: NextRequest) {

  if (!HUBSPOT_ACCESS_TOKEN) {
    return NextResponse.json({ error: 'HubSpot not configured' }, { status: 500 })
  }
  // Get the request body first
  const body = await request.json()
  const { email } = body
  
  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  if (!listId) {
    return NextResponse.json({ error: 'HubSpot list ID not configured' }, { status: 500 })
  }

  try {
    // First, get the contact by email to get their ID
    const contactSearchResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filterGroups: [{
          filters: [{
            propertyName: 'email',
            operator: 'EQ',
            value: email
          }]
        }],
        properties: ['email', 'firstname', 'lastname'],
        limit: 1
      })
    });

    const contactSearchResults = await contactSearchResponse.json();
    console.log('Contact search results:', contactSearchResults)

    if (!contactSearchResults.results || contactSearchResults.results.length === 0) {
      return NextResponse.json({ error: 'Contact not found in HubSpot' }, { status: 404 })
    }

    const contact = contactSearchResults.results[0];
    console.log('Found contact:', contact)

    // Now check if this contact is a member of the specific list
    const listMembershipResponse = await fetch(`https://api.hubapi.com/contacts/v1/lists/${listId}/contacts/all`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!listMembershipResponse.ok) {
      console.error('Failed to check list membership:', listMembershipResponse.status, listMembershipResponse.statusText)
      return NextResponse.json({ error: 'Failed to verify list membership' }, { status: 500 })
    }

    const listMembershipData = await listMembershipResponse.json();
    console.log('List membership data:', listMembershipData)

    // Check if the contact is in the list
    const isInList = listMembershipData.contacts && 
      listMembershipData.contacts.some((listContact: any) => {
        const emailMatch = listContact.email === email;
        const idMatch = listContact.vid.toString() === contact.id;
        console.log(`Checking list contact: vid=${listContact.vid} (${typeof listContact.vid}), contact.id=${contact.id} (${typeof contact.id}), emailMatch=${emailMatch}, idMatch=${idMatch}`);
        return emailMatch || idMatch;
      })

    console.log('Final isInList result:', isInList)

    if (!isInList) {
      return NextResponse.json({ error: 'Contact is not a member of the required list' }, { status: 403 })
    }

    console.log('Contact verified as list member')
    
    // Create response with cookie
    const response = NextResponse.json({ 
      success: true, 
      message: 'Logged in successfully' 
    })

    // Generate JWT token
    const token = jwt.sign(
        { 
          email: email,
          userId: email, // Get from your user database
          role: 'user',           // User role/permissions
          iat: Math.floor(Date.now() / 1000), // Issued at
          exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) // 7 days
        },
        JWT_SECRET || 'your-secret-key'
      )
    
    // Set authentication cookie
    response.cookies.set('auth-token', token, {
      sameSite: 'strict',    // CSRF protection
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',             // Cookie available across site
    })
    
    return response
    
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}