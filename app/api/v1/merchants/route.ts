import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get all merchants logic will go here
    
    return NextResponse.json({ 
      merchants: [],
      total: 0 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch merchants' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Create merchant logic will go here
    
    return NextResponse.json({ 
      success: true, 
      message: 'Merchant created successfully' 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create merchant' },
      { status: 500 }
    );
  }
}
