'use client';

import { useState } from 'react';
import { useAmazonCart } from '@/lib/amazon-cart';

function PrimeMark({ className = 'h-[18px]' }: { className?: string }) {
  return (
    <svg viewBox="0 0 54 16" className={className} aria-label="Prime">
      <text x="0" y="12" fill="#00a8e1" fontSize="13" fontWeight="700" fontFamily="Arial,sans-serif">
        prime
      </text>
    </svg>
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
  compact,
}: {
  asin: string;
  title: string;
  thumbnail: string;
  price: string;
  inStock: boolean;
  primeEligible: boolean;
  delivery: { day: string; cutoff: string };
  productUrl: string;
  compact?: boolean;
}) {
  const { addToCart, buyNow } = useAmazonCart();
  const [qty, setQty] = useState(1);

  function cartPayload() {
    return { asin, title, price, thumbnail };
  }

  return (
    <div className={`amazon-buy-box rounded-lg border border-[#d5d9d9] bg-white shadow-sm ${compact ? 'p-3' : 'p-4'}`}>
      {price && (
        <div className="mb-2">
          {!compact && <span className="text-xs text-[#565959]">Price:</span>}
          <div className="flex items-start gap-0.5">
            <span className="text-xs text-[#0f1111] align-top mt-1">$</span>
            <span className="text-[28px] leading-none text-[#0f1111]">{price.replace('$', '').split('.')[0]}</span>
            <span className="text-[13px] text-[#0f1111] mt-0.5">{price.includes('.') ? price.split('.')[1] : '00'}</span>
          </div>
        </div>
      )}

      {primeEligible && (
        <div className="mb-2 flex flex-wrap items-center gap-2 text-[13px]">
          <PrimeMark />
          <span className="text-[#007185]">
            FREE delivery <strong className="text-[#0f1111]">{delivery.day}</strong>
          </span>
        </div>
      )}

      {!primeEligible && inStock && (
        <p className="mb-2 text-[13px] text-[#007185]">
          FREE delivery <strong className="text-[#0f1111]">{delivery.day}</strong>
        </p>
      )}

      {inStock && <p className="mb-2 text-lg font-normal text-[#007600]">In Stock</p>}

      {inStock && (
        <p className="mb-3 text-[13px] text-[#565959]">
          Order within <span className="text-[#b12704]">{delivery.cutoff}</span>
        </p>
      )}

      <label className="mb-3 flex items-center gap-2 text-[13px]">
        <span>Qty:</span>
        <select
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          className="rounded-sm border border-[#888c8c] bg-[#f0f2f2] px-2 py-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)]"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </label>

      <button
        type="button"
        onClick={() => addToCart(cartPayload(), qty)}
        className="mb-2 w-full rounded-full border border-[#fcd200] bg-[#ffd814] py-2 text-[13px] shadow-sm hover:bg-[#f7ca00]"
      >
        Add to Cart
      </button>
      <button
        type="button"
        onClick={() => buyNow(cartPayload(), qty)}
        className="mb-3 w-full rounded-full border border-[#ff8f00] bg-[#ffa41c] py-2 text-[13px] shadow-sm hover:bg-[#fa8900]"
      >
        Buy Now
      </button>

      <div className="space-y-1 border-t border-[#e7e7e7] pt-3 text-[12px] text-[#565959]">
        <p><span className="text-[#007185]">Ships from</span> Amazon.com</p>
        <p><span className="text-[#007185]">Sold by</span> Amazon.com</p>
        <p><span className="text-[#007185]">Returns</span> Eligible for Return, Refund or Replacement within 30 days</p>
        <p><span className="text-[#007185]">Payment</span> Secure transaction</p>
      </div>

      <button
        type="button"
        className="mt-3 w-full text-left text-[12px] text-[#007185] hover:text-[#c7511f] hover:underline"
      >
        Add to List
      </button>

      <a
        href={productUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 block text-center text-[11px] text-[#565959] hover:text-[#c7511f] hover:underline"
      >
        View on Amazon.com ↗
      </a>
    </div>
  );
}
