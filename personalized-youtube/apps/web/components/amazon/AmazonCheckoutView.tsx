'use client';

import { useState } from 'react';
import { useAmazonCart } from '@/lib/amazon-cart';
import { formatUsd, parseAmazonPriceUsd } from '@/lib/amazon/image-utils';
import { usePageStore } from '@/lib/store';

export function AmazonCheckoutView() {
  const { items, subtotal, placeOrder, goToCart } = useAmazonCart();
  const { setWatching } = usePageStore();
  const [placing, setPlacing] = useState(false);

  if (items.length === 0) {
    return (
      <div className="amazon-pdp bg-[#eaeded] px-4 py-10 text-center">
        <p className="text-[#565959]">Your cart is empty.</p>
        <button type="button" onClick={goToCart} className="mt-4 text-[#007185] hover:underline">
          Return to cart
        </button>
      </div>
    );
  }

  const tax = subtotal * 0.0925;
  const total = subtotal + tax;

  async function onPlaceOrder() {
    setPlacing(true);
    await new Promise((r) => setTimeout(r, 900));
    placeOrder();
    setWatching(null);
    setPlacing(false);
  }

  return (
    <div className="amazon-pdp bg-[#eaeded] min-h-full px-4 py-4">
      <div className="mx-auto max-w-[1100px]">
        <h1 className="mb-4 text-[28px] font-normal text-[#0f1111]">Checkout</h1>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <section className="rounded-lg border border-[#d5d9d9] bg-white p-5">
              <h2 className="text-lg font-bold text-[#0f1111]">1. Delivery address</h2>
              <div className="mt-3 rounded-sm border border-[#007185] bg-[#f7fafa] p-4 text-[14px]">
                <p className="font-bold text-[#0f1111]">Akira Tran</p>
                <p className="text-[#565959]">450 Serra Mall, Stanford, CA 94305</p>
                <p className="text-[#565959]">United States</p>
                <p className="mt-2 text-[#007185]">Phone: (650) 555-0199</p>
              </div>
              <button type="button" className="mt-3 text-[13px] text-[#007185] hover:underline">
                Add delivery instructions
              </button>
            </section>

            <section className="rounded-lg border border-[#d5d9d9] bg-white p-5">
              <h2 className="text-lg font-bold text-[#0f1111]">2. Payment method</h2>
              <div className="mt-3 flex items-center gap-3 rounded-sm border border-[#007185] bg-[#f7fafa] p-4">
                <div className="rounded bg-[#232f3e] px-2 py-1 text-xs font-bold text-white">VISA</div>
                <div className="text-[14px]">
                  <p className="font-bold text-[#0f1111]">Visa ending in 4242</p>
                  <p className="text-[#565959]">Billing address same as shipping</p>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-[#d5d9d9] bg-white p-5">
              <h2 className="text-lg font-bold text-[#0f1111]">3. Review items and shipping</h2>
              <ul className="mt-4 divide-y divide-[#e7e7e7]">
                {items.map((item) => (
                  <li key={item.asin} className="flex gap-4 py-4 first:pt-0">
                    <img src={item.thumbnail} alt="" className="h-20 w-20 object-contain" />
                    <div className="min-w-0 flex-1 text-[14px]">
                      <p className="line-clamp-2 text-[#0f1111]">{item.title}</p>
                      <p className="mt-1 text-[#565959]">Qty: {item.qty}</p>
                      <p className="mt-1 text-[#007600]">FREE Prime Delivery</p>
                    </div>
                    <p className="shrink-0 text-[14px]">{formatUsd(parseAmazonPriceUsd(item.price) * item.qty)}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="h-fit rounded-lg border border-[#d5d9d9] bg-white p-5">
            <button
              type="button"
              onClick={onPlaceOrder}
              disabled={placing}
              className="w-full rounded-full border border-[#ff8f00] bg-[#ffa41c] py-2.5 text-[14px] font-normal shadow-sm hover:bg-[#fa8900] disabled:opacity-60"
            >
              {placing ? 'Placing your order…' : 'Place your order'}
            </button>
            <p className="mt-2 text-center text-[11px] text-[#565959]">
              By placing your order, you agree to Amazon&apos;s privacy notice and conditions of use.
            </p>

            <dl className="mt-5 space-y-2 border-t border-[#e7e7e7] pt-4 text-[14px]">
              <div className="flex justify-between">
                <dt className="text-[#565959]">Items:</dt>
                <dd>{formatUsd(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#565959]">Shipping &amp; handling:</dt>
                <dd className="text-[#007600]">FREE</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#565959]">Estimated tax:</dt>
                <dd>{formatUsd(tax)}</dd>
              </div>
              <div className="flex justify-between border-t border-[#e7e7e7] pt-2 text-[#b12704]">
                <dt className="font-bold">Order total:</dt>
                <dd className="font-bold">{formatUsd(total)}</dd>
              </div>
            </dl>

            <button type="button" onClick={goToCart} className="mt-4 w-full text-[13px] text-[#007185] hover:underline">
              Back to cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
