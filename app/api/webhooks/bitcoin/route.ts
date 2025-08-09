import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Process Bitcoin webhook logic will go here
    
    return NextResponse.json({ 
      success: true, 
      message: 'Bitcoin webhook processed successfully' 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process Bitcoin webhook' },
      { status: 500 }
    );
  }
}
