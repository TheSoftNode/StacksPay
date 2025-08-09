import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get current merchant info logic will go here
    
    return NextResponse.json({ 
      merchant: null 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch merchant info' },
      { status: 500 }
    );
  }
}
