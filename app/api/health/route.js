// File: app/api/state/route.js
import { NextResponse } from 'next/server';
import { getStateCollection } from '@/lib/mongodb';

export async function GET() {
  try {
    const col = await getStateCollection();
    const doc = await col.findOne({});
    return NextResponse.json(doc ?? {}, { status: 200 });
  } catch (err) {
    console.error("GET /api/state error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const col = await getStateCollection();
    await col.updateOne({}, { $set: body }, { upsert: true });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("PUT /api/state error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}