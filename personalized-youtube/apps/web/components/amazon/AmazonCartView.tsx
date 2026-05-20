'use client';

import { useAmazonCart } from '@/lib/amazon-cart';
import { formatUsd, parseAmazonPriceUsd } from '@/lib/amazon/image-utils';
import { usePageStore } from '@/lib/store';

export function AmazonCartView() {
  const { items, updateQty, removeItem, subtotal, goToCheckout, goToBrowse } = useAmazonCart();
  const { setWatching } = usePageStore();

  if (items.length === 0) {
    return (
      <div className="amazon-pdp bg-[#eaeded] min-h-[60vh] px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-lg border border-[#d5d9d9] bg-white p-10 text-center">
          <h1 className="text-2xl font-normal text-[#0f1111]">Your Amazon Cart is empty</h1>
          <p className="mt-3 text-[#565959]">Shop today&apos;s deals and best sellers.</p>
          <button
            type="button"
            onClick={() => {
              goToBrowse();
              setWatching(null);
            }}
            className="mt-6 rounded-sm border border-[#d5d9d9] bg-[#f0f2f2] px-6 py-2 text-sm shadow-sm hover:bg-[#e3e6e6]"
          >
            Continue shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="amazon-pdp bg-[#eaeded] min-h-full px-4 py-4">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-4 flex items-baseline justify-between">
          <h1 className="text-[28px] font-normal text-[#0f1111]">Shopping Cart</h1>
          <button type="button" onClick={() => { goToBrowse(); setWatching(null); }} className="text-[13px] text-[#007185] hover:underline">
            Continue shopping
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-lg border border-[#d5d9d9] bg-white">
            <div className="border-b border-[#e7e7e7] px-4 py-3 text-[13px] text-[#565959]">
              Price
            </div>
            <ul className="divide-y divide-[#e7e7e7]">
              {items.map((item) => (
                <li key={item.asin} className="flex gap-4 p-4">
                  <button
                    type="button"
                    onClick={() => setWatching(item.asin, item.title)}
                    className="h-[140px] w-[140px] shrink-0 overflow-hidden rounded-sm border border-[#ddd] bg-white p-2"
                  >
                    <img src={item.thumbnail} alt={item.title} className="h-full w-full object-contain" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => setWatching(item.asin, item.title)}
                      className="text-left text-[15px] text-[#007185] hover:text-[#c7511f] hover:underline"
                    >
                      {item.title}
                    </button>
                    <p className="mt-1 text-[13px] text-[#007600]">In Stock</p>
                    <p className="mt-1 text-[13px] text-[#565959]">Eligible for FREE Shipping</p>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-[13px]">
                      <label className="flex items-center gap-2">
                        <span className="text-[#565959]">Qty:</span>
                        <select
                          value={item.qty}
                          onChange={(e) => updateQty(item.asin, Number(e.target.value))}
                          className="rounded-sm border border-[#888c8c] bg-[#f0f2f2] px-2 py-1"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                      </label>
                      <button type="button" onClick={() => removeItem(item.asin)} className="text-[#007185] hover:text-[#c7511f] hover:underline">
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="shrink-0 text-right text-[15px] text-[#0f1111]">
                    {formatUsd(parseAmazonPriceUsd(item.price) * item.qty)}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="h-fit rounded-lg border border-[#d5d9d9] bg-white p-5">
            <p className="text-[13px] text-[#565959]">
              Subtotal ({items.reduce((n, i) => n + i.qty, 0)} items):
            </p>
            <p className="mt-1 text-[18px] font-bold text-[#b12704]">{formatUsd(subtotal)}</p>
            <label className="mt-3 flex items-start gap-2 text-[12px] text-[#565959]">
              <input type="checkbox" defaultChecked className="mt-0.5" />
              This order contains a gift
            </label>
            <button
              type="button"
              onClick={goToCheckout}
              className="mt-4 w-full rounded-full border border-[#ff8f00] bg-[#ffa41c] py-2 text-[13px] shadow-sm hover:bg-[#fa8900]"
            >
              Proceed to checkout ({items.reduce((n, i) => n + i.qty, 0)} items)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
