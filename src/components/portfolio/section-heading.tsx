'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  eyebrow: string
  title: string
  description?: string
  align?: 'left' | 'center'
}

export function SectionHeading({ eyebrow, title, description, align = 'center' }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center')}
    >
      <p
        className={cn(
          'flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-primary',
          align === 'center' && 'justify-center'
        )}
      >
        <span aria-hidden="true" className="h-px w-8 shrink-0 bg-primary" />
        {eyebrow}
        {align === 'center' ? <span aria-hidden="true" className="h-px w-8 shrink-0 bg-primary" /> : null}
      </p>
      <h2 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
      {description ? <p className="mt-3 text-muted-foreground md:text-lg">{description}</p> : null}
    </motion.div>
  )
}
