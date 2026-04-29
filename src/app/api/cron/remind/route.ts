import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { getAllVocabulary, getAllSubscriptions } from '@/lib/sheets';
import { getDueWords } from '@/lib/srs';

// Define keys - these should be in your Vercel Environment Variables
const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || '';
const email = 'mailto:admin@langme.app';

if (publicVapidKey && privateVapidKey) {
  webpush.setVapidDetails(email, publicVapidKey, privateVapidKey);
}

export async function GET(req: Request) {
  try {
    // Verify auth header for cron job to prevent unauthorized access
    const authHeader = req.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // Return 401 if unauthorized (only if CRON_SECRET is set)
      return new NextResponse('Unauthorized', { status: 401 });
    }

    if (!publicVapidKey || !privateVapidKey) {
      return NextResponse.json({ error: 'VAPID keys not configured' }, { status: 500 });
    }

    // Check if there are due words
    const allWords = await getAllVocabulary();
    const dueWords = getDueWords(allWords);

    if (dueWords.length === 0) {
      return NextResponse.json({ message: 'No words due today, no notification sent.' });
    }

    // Get all subscriptions
    const subscriptions = await getAllSubscriptions();
    
    if (subscriptions.length === 0) {
      return NextResponse.json({ message: 'No active subscriptions found.' });
    }

    // Payload for the push notification
    const payload = JSON.stringify({
      title: 'Đã đến giờ ôn tập!',
      body: `Bạn có ${dueWords.length} từ vựng LangMe đang chờ được ôn tập. Vào ôn ngay cho nóng nhé! 🔥`,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      url: '/learn',
    });

    // Send push notification to all subscribers
    const sendPromises = subscriptions.map((sub) =>
      webpush.sendNotification(sub, payload).catch((err) => {
        console.error('Failed to send notification to subscription:', err);
        // Could potentially remove stale subscriptions here
      })
    );

    await Promise.all(sendPromises);

    return NextResponse.json({ success: true, message: `Sent reminders to ${subscriptions.length} devices.` });
  } catch (error) {
    console.error('Cron Error:', error);
    return NextResponse.json({ error: 'Failed to process cron' }, { status: 500 });
  }
}
