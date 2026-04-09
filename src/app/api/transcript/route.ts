import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get('videoId');

  if (!videoId) {
    return NextResponse.json({ error: 'Missing videoId parameter' }, { status: 400 });
  }

  try {
    const rawItems = await YoutubeTranscript.fetchTranscript(videoId);

    // Return each segment with its timestamp so the frontend can sync-highlight
    const segments = rawItems.map(item => ({
      text: item.text.replace(/\n/g, ' ').trim(),
      offset: item.offset / 1000,   // convert ms → seconds
      duration: item.duration / 1000,
    }));

    return NextResponse.json({ segments });
  } catch (error: any) {
    console.error('Transcript fetch error:', error);
    return NextResponse.json(
      { error: 'Could not fetch transcript. The video may have captions disabled or be unavailable.' },
      { status: 404 }
    );
  }
}
