import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Process Stacks webhook logic will go here
    
    return NextResponse.json({ 
      success: true, 
      message: 'Stacks webhook processed successfully' 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process Stacks webhook' },
      { status: 500 }
    );
  }
}
