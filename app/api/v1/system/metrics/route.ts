import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // System metrics logic will go here
    
    return NextResponse.json({ 
      cpu: '15%',
      memory: '45%',
      disk: '60%',
      requests: 1250
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
