import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import Ticker from '@/components/Ticker'
import Pillars from '@/components/Pillars'
import ClientPaths from '@/components/ClientPaths'
import Proyectos from '@/components/Proyectos'
import LandscapeBreak from '@/components/LandscapeBreak'
import CourseCard from '@/components/CourseCard'
import StatsBar from '@/components/StatsBar'
import Clients from '@/components/Clients'
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
      <LandscapeBreak
        image="/assets/atardecer_montañas.jpg"
        quote="El agua no se pierde — se diseña."
        sub="Principio Keyline · Diseño regenerativo de paisajes"
      />
      <CourseCard />
      <StatsBar />
      <LandscapeBreak
        image="/assets/atardecer_sol.jpg"
        quote="Más de 1.600 hectáreas transformadas en Colombia."
        sub="Keyline Colombia · 2020 – 2025"
      />
      <Clients />
      <Nosotros />
      <Footer />
    </main>
  )
}
