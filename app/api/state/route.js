import { NextResponse } from 'next/server';
import { getStateCollection } from '@/lib/mongodb';
import { isAuthorized, unauthorizedResponse } from '@/lib/apiAuth';
import { DEFAULT_STATE, normalizeStatePayload } from '@/lib/stateSchema';

export async function GET(request) {
  if (!isAuthorized(request)) return unauthorizedResponse();

  try {
    const col = await getStateCollection();
    const doc = await col.findOne({ _id: 'main' });
    return NextResponse.json(doc || DEFAULT_STATE);
  } catch (err) {
    console.error('GET /api/state error:', err);
    return NextResponse.json({ error: 'server_error', message: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  if (!isAuthorized(request)) return unauthorizedResponse();

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_payload', message: 'JSON tidak valid.' }, { status: 400 });
  }

  const { data, error } = normalizeStatePayload(body);
  if (error) {
    return NextResponse.json({ error: 'invalid_payload', message: error }, { status: 400 });
  }

  try {
    const col = await getStateCollection();
    await col.updateOne({ _id: 'main' }, { $set: data }, { upsert: true });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('PUT /api/state error:', err);
    return NextResponse.json({ error: 'server_error', message: err.message }, { status: 500 });
  }
}