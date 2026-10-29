'use client'

import { Navbar } from './navbar'
import { Hero } from './hero'
import { About } from './about'
import { Skills } from './skills'
import { Projects } from './projects'
import { ExperienceSection } from './experience-section'
import { Contact } from './contact'
import { Footer } from './footer'

export function PortfolioView() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <About />
        <Skills />
        <Projects />
        <ExperienceSection />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}
