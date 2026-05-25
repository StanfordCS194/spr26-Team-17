'use client';

import { useState } from 'react';
import { AmazonPrice } from '@/components/amazon/AmazonPrice';
import { useAmazonCart } from '@/lib/amazon-cart';

function PrimeMark() {
  return (
    <span className="inline-flex items-center text-[#00a8e1]">
      <svg viewBox="0 0 54 16" className="h-[16px] w-[52px]" aria-label="Prime">
        <text x="0" y="12" fill="#00a8e1" fontSize="13" fontWeight="700" fontFamily="Arial,sans-serif">
          prime
        </text>
      </svg>
    </span>
  );
}

export function AmazonBuyBox({
  asin,
  title,
  thumbnail,
  price,
  inStock,
  primeEligible,
  delivery,
  productUrl,
}: {
  asin: string;
  title: string;
  thumbnail: string;
  price: string;
  inStock: boolean;
  primeEligible: boolean;
  delivery: { day: string; cutoff: string };
  productUrl: string;
}) {
  const { addToCart, buyNow } = useAmazonCart();
  const [qty, setQty] = useState(1);

  function cartPayload() {
    return { asin, title, price, thumbnail };
  }

  return (
    <div className="amazon-buy-box rounded border border-[#d5d9d9] bg-white p-4">
      {price && (
        <div className="mb-1">
          <AmazonPrice price={price} />
        </div>
      )}

      {primeEligible && (
        <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[13px] leading-snug">
          <PrimeMark />
          <span className="text-[#007185]">
            FREE delivery <span className="font-semibold text-[#0f1111]">{delivery.day}</span>
          </span>
        </div>
      )}

      {!primeEligible && inStock && (
        <p className="mb-2 text-[13px] text-[#007185]">
          FREE delivery <span className="font-semibold text-[#0f1111]">{delivery.day}</span>
        </p>
      )}

      {inStock && (
        <>
          <p className="text-lg text-[#007600]">In Stock</p>
          <p className="mb-3 mt-1 text-[13px] text-[#565959]">
            Order within <span className="text-[#b12704]">{delivery.cutoff}</span>
          </p>
        </>
      )}

      <div className="mb-3 flex items-center gap-2 text-[13px] text-[#0f1111]">
        <label htmlFor={`qty-${asin}`}>Quantity:</label>
        <select
          id={`qty-${asin}`}
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          className="min-w-[4.5rem] rounded-sm border border-[#888c8c] bg-[linear-gradient(to_bottom,#f7f8fa,#e3e6e6)] px-2 py-1.5 text-[13px] shadow-[0_2px_5px_rgba(15,17,17,0.15)]"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => addToCart(cartPayload(), qty)}
          className="amazon-btn-cart w-full rounded-full py-2.5 text-[13px] font-normal text-[#0f1111]"
        >
          Add to Cart
        </button>
        <button
          type="button"
          onClick={() => buyNow(cartPayload(), qty)}
          className="amazon-btn-buy w-full rounded-full py-2.5 text-[13px] font-normal text-[#0f1111]"
        >
          Buy Now
        </button>
      </div>

      <dl className="mt-4 space-y-1.5 border-t border-[#e7e7e7] pt-3 text-[12px] leading-relaxed">
        <div><dt className="inline text-[#007185]">Ships from</dt> <dd className="inline text-[#565959]">Amazon.com</dd></div>
        <div><dt className="inline text-[#007185]">Sold by</dt> <dd className="inline text-[#565959]">Amazon.com</dd></div>
        <div><dt className="inline text-[#007185]">Returns</dt> <dd className="inline text-[#565959]">30-day refund / replacement</dd></div>
      </dl>

      <button type="button" className="mt-3 text-[12px] text-[#007185] hover:text-[#c7511f] hover:underline">
        Add to List
      </button>

      <a
        href={productUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 block text-[11px] text-[#565959] hover:text-[#c7511f] hover:underline"
      >
        View on Amazon.com ↗
      </a>
    </div>
  );
}
