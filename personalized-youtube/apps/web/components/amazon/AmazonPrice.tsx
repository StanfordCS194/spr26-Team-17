'use client';

export function AmazonPrice({
  price,
  size = 'lg',
  className = '',
}: {
  price: string;
  size?: 'sm' | 'lg';
  className?: string;
}) {
  if (!price.startsWith('$')) return <span className={className}>{price}</span>;
  const [whole, frac = '00'] = price.replace('$', '').split('.');
  const wholeSize = size === 'lg' ? 'text-[28px]' : 'text-[21px]';
  const fracSize = size === 'lg' ? 'text-[13px]' : 'text-[11px]';

  return (
    <span className={`inline-flex items-start text-[#0f1111] ${className}`}>
      <span className={`${fracSize} mt-0.5`}>$</span>
      <span className={`${wholeSize} leading-none`}>{whole}</span>
      <span className={`${fracSize} mt-0.5`}>{frac}</span>
    </span>
  );
}
