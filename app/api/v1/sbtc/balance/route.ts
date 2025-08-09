import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get sBTC balance logic will go here
    
    return NextResponse.json({ 
      balance: '0',
      confirmed: '0',
      pending: '0'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch balance' },
      { status: 500 }
    );
  }
}
