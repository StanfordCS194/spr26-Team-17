'use client';

import { useAmazonCart } from '@/lib/amazon-cart';
import { usePageStore } from '@/lib/store';

export function AmazonOrderConfirmation() {
  const { lastOrderId, goToBrowse } = useAmazonCart();
  const { setWatching } = usePageStore();

  return (
    <div className="amazon-pdp bg-[#eaeded] min-h-[70vh] px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-lg border border-[#d5d9d9] bg-white p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#007600] text-2xl text-white">
          ✓
        </div>
        <h1 className="text-2xl font-normal text-[#0f1111]">Order placed, thanks!</h1>
        {lastOrderId && (
          <p className="mt-3 text-[14px] text-[#565959]">
            Confirmation will be sent to your email. Order #{' '}
            <span className="text-[#007185]">{lastOrderId}</span>
          </p>
        )}
        <p className="mt-2 text-[14px] text-[#565959]">
          Delivery estimate: within 2 days with Prime.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              goToBrowse();
              setWatching(null);
            }}
            className="rounded-full border border-[#ff8f00] bg-[#ffa41c] px-6 py-2 text-[13px] hover:bg-[#fa8900]"
          >
            Continue shopping
          </button>
          <button type="button" className="rounded-sm border border-[#d5d9d9] bg-[#f0f2f2] px-6 py-2 text-[13px] hover:bg-[#e3e6e6]">
            View order details
          </button>
        </div>
      </div>
    </div>
  );
}
