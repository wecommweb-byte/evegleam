export default function MarqueeStrip() {
  const text = "✦ FREE SHIPPING OVER ₨3,000  ·  ✦ CASH ON DELIVERY  ·  ✦ 10,000+ HAPPY CUSTOMERS  ·  ✦ REUSABLE UP TO 10X  ·  ✦ ECO-FRIENDLY PACKAGING  ·  ✦ 3-DAY DELIVERY  ·  ";
  
  return (
    <div className="bg-gold text-white py-3 overflow-hidden whitespace-nowrap flex w-full">
      <div className="animate-marquee flex gap-8">
        <span className="text-sm font-medium tracking-[0.1em] uppercase font-body">{text}</span>
        <span className="text-sm font-medium tracking-[0.1em] uppercase font-body">{text}</span>
        <span className="text-sm font-medium tracking-[0.1em] uppercase font-body">{text}</span>
      </div>
    </div>
  );
}
