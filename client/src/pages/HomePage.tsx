import HeroSection from '@/components/home/HeroSection'
import ServicesSection from '@/components/home/ServicesSection'
import WhySection from '@/components/home/WhySection'
import TeamSection from '@/components/home/TeamSection'
import QueueCTASection from '@/components/home/QueueCTASection'
import Footer from '@/components/home/Footer'

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <ServicesSection />
      <WhySection />
      <TeamSection />
      <QueueCTASection />
      <Footer />
    </main>
  )
}
