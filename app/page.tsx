import HeroSection from '@/components/home/HeroSection';
import MarqueeStrip from '@/components/home/MarqueeStrip';
import ValueProps from '@/components/home/ValueProps';
import BestSellers from '@/components/home/BestSellers';
import HowItWorks from '@/components/home/HowItWorks';
import SizingGuide from '@/components/home/SizingGuide';
import SocialProof from '@/components/home/SocialProof';
import BundleAndSave from '@/components/home/BundleAndSave';
import FAQSection from '@/components/home/FAQSection';

export default function Home() {
  return (
    <>
      <HeroSection />
      <MarqueeStrip />
      <ValueProps />
      <BestSellers />
      <HowItWorks />
      <SizingGuide />
      <SocialProof />
      <BundleAndSave />
      <FAQSection />
    </>
  );
}
