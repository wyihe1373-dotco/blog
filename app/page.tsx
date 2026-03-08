import dynamic from 'next/dynamic'
import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'

const Stats    = dynamic(() => import('@/components/Stats'))
const Projects = dynamic(() => import('@/components/Projects'))
const Blog     = dynamic(() => import('@/components/Blog'))
const Contact  = dynamic(() => import('@/components/Contact'))

export default function Home() {
  return (
    <main className="relative overflow-x-hidden">
      <Navigation />
      <Hero />
      <Stats />
      <Projects />
      <Blog />
      <Contact />
    </main>
  )
}
