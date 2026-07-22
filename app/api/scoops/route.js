import { NextResponse } from 'next/server';
import { getScoops } from '../../../lib/scoopStore';

export async function GET() {
  const scoops = await getScoops();
  return NextResponse.json({ scoops });
}
