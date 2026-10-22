import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import ToolShell from '@/components/tools/ToolShell'
import { COMPONENTES } from '@/components/tools/registro'
import { TOOLS, toolPorSlug } from '@/lib/tools'

export const dynamicParams = false

export function generateStaticParams() {
  return TOOLS.filter((t) => t.enRutaDinamica).map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const t = toolPorSlug(slug)
  if (!t) return {}
  return {
    title: `${t.nombre} — Herramientas Keyline Colombia`,
    description: t.seo,
    alternates: { canonical: t.href },
    openGraph: { title: `${t.nombre} — Keyline Colombia`, description: t.seo },
  }
}

export default async function HerramientaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const Herramienta = COMPONENTES[slug]
  if (!Herramienta) notFound()
  return (
    <main className="overflow-x-clip relative">
      <Nav />
      <ToolShell slug={slug}>
        <Herramienta />
      </ToolShell>
      <Footer />
    </main>
  )
}
