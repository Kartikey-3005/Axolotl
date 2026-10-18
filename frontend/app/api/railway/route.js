import { NextResponse } from 'next/server';
import { configure, trackTrain, getTrainInfo, liveAtStation, searchTrainBetweenStations, checkPNRStatus } from 'railkit';

// Ensure SDK is configured with API key
const apiKey = process.env.RAILKIT_API_KEY || 'railkit_6c4ed9cbea90d077c3e16e8526af6397518ddd8a8fb564d3';
try {
  configure(apiKey);
} catch (e) {
  console.error('RailKit configuration error:', e);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'track';

  try {
    if (action === 'track') {
      const trainNo = searchParams.get('trainNo') || '12015';
      
      // Default to today in DD-MM-YYYY format
      let date = searchParams.get('date');
      if (!date) {
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const yyyy = now.getFullYear();
        date = `${dd}-${mm}-${yyyy}`;
      }

      const result = await trackTrain(trainNo, date);
      return NextResponse.json(result);
    }

    if (action === 'info') {
      const trainNo = searchParams.get('trainNo') || '12015';
      const result = await getTrainInfo(trainNo);
      return NextResponse.json(result);
    }

    if (action === 'station') {
      const code = searchParams.get('code') || 'NDLS';
      const hours = parseInt(searchParams.get('hours') || '2', 10);
      const result = await liveAtStation(code, hours);
      return NextResponse.json(result);
    }

    if (action === 'search') {
      const from = searchParams.get('from') || 'NDLS';
      const to = searchParams.get('to') || 'BCT';
      const result = await searchTrainBetweenStations(from, to);
      return NextResponse.json(result);
    }

    if (action === 'pnr') {
      const pnr = searchParams.get('pnr');
      if (!pnr) {
        return NextResponse.json({ success: false, error: 'PNR number required' }, { status: 400 });
      }
      const result = await checkPNRStatus(pnr);
      return NextResponse.json(result);
    }

    return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
