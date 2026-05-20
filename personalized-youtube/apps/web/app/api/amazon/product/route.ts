import { NextResponse } from 'next/server';
import { getAmazonProductDetail } from '@/lib/amazon/product-detail';
import { interceptUnavailable } from '@/lib/intercept/api-response';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const asin = url.searchParams.get('asin')?.trim().toUpperCase() ?? '';
  if (!/^[A-Z0-9]{10}$/.test(asin)) {
    return NextResponse.json({ ok: false, reason: 'invalid asin' }, { status: 400 });
  }
  const result = await getAmazonProductDetail(asin);
  if (result.kind !== 'ok') {
    return interceptUnavailable(result.reason);
  }
  return NextResponse.json({ ok: true, product: result.product });
}
