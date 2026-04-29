import { NextResponse } from 'next/server';
import { saveSubscription } from '@/lib/sheets';
import type { PushSubscription } from 'web-push';

export async function POST(req: Request) {
  try {
    const subscription = await req.json() as PushSubscription;
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }

    await saveSubscription(subscription);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Subscription API Error:', error);
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
  }
}
