import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import Ticker from '@/components/Ticker'
import Pillars from '@/components/Pillars'
import ClientPaths from '@/components/ClientPaths'
import Proyectos from '@/components/Proyectos'
import CourseCard from '@/components/CourseCard'
import StatsBar from '@/components/StatsBar'
import Nosotros from '@/components/Nosotros'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="overflow-x-hidden relative">
      <Nav />
      <Hero />
      <Ticker />
      <Pillars />
      <ClientPaths />
      <Proyectos />
      <CourseCard />
      <StatsBar />
      <Nosotros />
      <Footer />
    </main>
  )
}
