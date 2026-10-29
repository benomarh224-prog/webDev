import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminEmail || !adminPassword) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD before seeding')
  }
  console.log('Seeding database...')

  // Clean existing data
  await db.message.deleteMany()
  await db.experience.deleteMany()
  await db.skill.deleteMany()
  await db.project.deleteMany()
  await db.siteSettings.deleteMany()
  await db.admin.deleteMany()

  // ---- Admin user ----
  const passwordHash = await bcrypt.hash(adminPassword, 10)
  await db.admin.create({
    data: {
      email: adminEmail,
      passwordHash,
      name: 'Alex Carter',
    },
  })
  console.log('✓ Admin created')

  // ---- Site settings ----
  await db.siteSettings.create({
    data: {
      id: 'main',
      siteTitle: 'Alex Carter — Full-Stack Developer',
      ownerName: 'Alex Carter',
      ownerRole: 'Full-Stack Developer & UI Designer',
      heroTitle: 'Building digital experiences that matter',
      heroSubtitle:
        'I craft fast, accessible and beautiful web applications. From pixel-perfect interfaces to robust backend architecture — I turn ideas into products people love to use.',
      aboutText:
        "I'm a full-stack developer based in Paris with 6+ years of experience shipping products for startups and established companies. My sweet spot lives at the intersection of engineering and design — where clean architecture meets delightful user experience.\n\nI specialize in the React ecosystem and modern TypeScript tooling, paired with rock-solid Node.js backends. When I'm not coding, you'll find me sketching interface concepts, contributing to open source, or exploring the latest in AI-assisted development.",
      avatarUrl: '/images/avatar.png',
      email: 'hello@alexcarter.dev',
      location: 'Paris, France',
      resumeUrl: '#',
      githubUrl: 'https://github.com/alexcarter',
      linkedinUrl: 'https://linkedin.com/in/alexcarter',
      twitterUrl: 'https://twitter.com/alexcarter',
      dribbbleUrl: 'https://dribbble.com/alexcarter',
      yearsExperience: 6,
      clientsCount: 38,
      availableForWork: true,
    },
  })
  console.log('✓ Site settings created')

  // ---- Projects ----
  const projects = [
    {
      title: 'Nova Commerce',
      slug: 'nova-commerce',
      description:
        'A high-performance e-commerce platform with real-time analytics, inventory management and Stripe-powered checkout.',
      content:
        'Nova Commerce is a full-featured e-commerce solution serving 50+ merchants. It features a real-time analytics dashboard, automated inventory sync, abandoned-cart recovery emails and a blazing-fast one-page checkout. Built with a headless architecture, it handles 100k+ monthly sessions with sub-second page loads.',
      technologies: 'Next.js,TypeScript,Prisma,Stripe,Tailwind CSS,PostgreSQL',
      imageUrl: '/images/projects/ecommerce.png',
      demoUrl: 'https://example.com/nova',
      repoUrl: 'https://github.com/alexcarter/nova-commerce',
      category: 'Web App',
      featured: true,
      status: 'published',
      sortOrder: 1,
    },
    {
      title: 'Lumina AI',
      slug: 'lumina-ai',
      description:
        'An AI chat assistant with streaming responses, document understanding and a plugin ecosystem.',
      content:
        'Lumina AI is a conversational assistant platform with real-time streaming via WebSockets, retrieval-augmented generation over user documents, and a sandboxed plugin system. It supports multi-turn context, markdown rendering with syntax highlighting, and voice input. The backend autoscales with demand using a queue-based architecture.',
      technologies: 'React,Node.js,WebSockets,OpenAI,Redis,Docker',
      imageUrl: '/images/projects/ai-chat.png',
      demoUrl: 'https://example.com/lumina',
      repoUrl: 'https://github.com/alexcarter/lumina-ai',
      category: 'AI / ML',
      featured: true,
      status: 'published',
      sortOrder: 2,
    },
    {
      title: 'Wanderlust',
      slug: 'wanderlust',
      description:
        'A travel booking platform with interactive maps, personalized recommendations and flexible date search.',
      content:
        'Wanderlust helps travelers discover and book unique stays and experiences. It combines interactive map-based search, price trend insights, and a recommendation engine tuned by travel style. The booking flow was redesigned from the ground up, lifting conversion by 23%.',
      technologies: 'Next.js,Mapbox,PostgreSQL,Prisma,Stripe',
      imageUrl: '/images/projects/travel.png',
      demoUrl: 'https://example.com/wanderlust',
      repoUrl: null,
      category: 'Web App',
      featured: false,
      status: 'published',
      sortOrder: 3,
    },
    {
      title: 'PulseFit',
      slug: 'pulsefit',
      description:
        'A fitness tracking app with workout plans, wearable sync and social challenges.',
      content:
        'PulseFit turns training data into actionable insights. It syncs with Apple Health and Garmin devices, generates adaptive workout plans, and lets friends join weekly challenges. Offline-first design keeps workouts logging even in the gym basement.',
      technologies: 'React Native,GraphQL,Apollo,HealthKit,Firebase',
      imageUrl: '/images/projects/fitness.png',
      demoUrl: null,
      repoUrl: 'https://github.com/alexcarter/pulsefit',
      category: 'Mobile',
      featured: false,
      status: 'published',
      sortOrder: 4,
    },
    {
      title: 'Sonique',
      slug: 'sonique',
      description:
        'A music streaming app with collaborative playlists, lossless audio and live session sharing.',
      content:
        'Sonique is a social take on music streaming — friends can build playlists together in real time, vote on the next track, and share live listening sessions. The audio pipeline supports gapless lossless playback and was tuned for low battery usage on mobile.',
      technologies: 'Flutter,Firebase,Web Audio API,WebRTC',
      imageUrl: '/images/projects/music.png',
      demoUrl: 'https://example.com/sonique',
      repoUrl: null,
      category: 'Mobile',
      featured: true,
      status: 'published',
      sortOrder: 5,
    },
    {
      title: 'Estately',
      slug: 'estately',
      description:
        'A real estate marketplace with map search, virtual tours and agent tooling.',
      content:
        'Estately connects buyers, agents and agencies on one platform. It offers geospatial search with polygon drawing, 360° virtual tours, mortgage calculators, and a CRM-lite dashboard for agents to manage leads and listings. Powers 12k+ listings across 3 regions.',
      technologies: 'Vue.js,Laravel,Google Maps API,MySQL,Redis',
      imageUrl: '/images/projects/realestate.png',
      demoUrl: 'https://example.com/estately',
      repoUrl: null,
      category: 'Web App',
      featured: false,
      status: 'draft',
      sortOrder: 6,
    },
  ]

  for (const p of projects) {
    await db.project.create({ data: p })
  }
  console.log(`✓ ${projects.length} projects created`)

  // ---- Skills ----
  const skills = [
    { name: 'React', category: 'Frontend', level: 95, sortOrder: 1 },
    { name: 'TypeScript', category: 'Frontend', level: 92, sortOrder: 2 },
    { name: 'Next.js', category: 'Frontend', level: 90, sortOrder: 3 },
    { name: 'Tailwind CSS', category: 'Frontend', level: 88, sortOrder: 4 },
    { name: 'Vue.js', category: 'Frontend', level: 76, sortOrder: 5 },
    { name: 'Node.js', category: 'Backend', level: 88, sortOrder: 6 },
    { name: 'PostgreSQL', category: 'Backend', level: 82, sortOrder: 7 },
    { name: 'GraphQL', category: 'Backend', level: 80, sortOrder: 8 },
    { name: 'Prisma', category: 'Backend', level: 86, sortOrder: 9 },
    { name: 'Redis', category: 'Backend', level: 70, sortOrder: 10 },
    { name: 'React Native', category: 'Mobile', level: 82, sortOrder: 11 },
    { name: 'Flutter', category: 'Mobile', level: 72, sortOrder: 12 },
    { name: 'Electron', category: 'Mobile', level: 66, sortOrder: 13 },
    { name: 'Figma', category: 'Design & Tools', level: 85, sortOrder: 14 },
    { name: 'Docker', category: 'Design & Tools', level: 78, sortOrder: 15 },
    { name: 'Git & CI/CD', category: 'Design & Tools', level: 90, sortOrder: 16 },
    { name: 'AWS', category: 'Design & Tools', level: 72, sortOrder: 17 },
  ]

  for (const s of skills) {
    await db.skill.create({ data: s })
  }
  console.log(`✓ ${skills.length} skills created`)

  // ---- Experiences ----
  const experiences = [
    {
      company: 'TechNova',
      role: 'Senior Full-Stack Developer',
      description:
        'Leading a team of 5 developers building a B2B SaaS analytics platform. Architected the migration to Next.js App Router, introduced end-to-end testing, and cut page load times by 60%.',
      location: 'Paris, France',
      startDate: new Date('2022-03-01'),
      endDate: null,
      current: true,
      sortOrder: 1,
    },
    {
      company: 'DigitalCraft Agency',
      role: 'Full-Stack Developer',
      description:
        'Delivered 20+ client projects including e-commerce sites, booking platforms and marketing dashboards. Owned the full stack from database schema to pixel-perfect UI.',
      location: 'Lyon, France',
      startDate: new Date('2020-06-01'),
      endDate: new Date('2022-02-01'),
      current: false,
      sortOrder: 2,
    },
    {
      company: 'StartupLab',
      role: 'Frontend Developer',
      description:
        'Built the MVP of a fintech budgeting app used by 15k users. Implemented a design system from scratch and established a CI pipeline with visual regression testing.',
      location: 'Remote',
      startDate: new Date('2018-09-01'),
      endDate: new Date('2020-05-01'),
      current: false,
      sortOrder: 3,
    },
    {
      company: 'WebStudio',
      role: 'Junior Web Developer',
      description:
        'Started my professional journey building responsive marketing sites and CMS integrations for local businesses. Learned the value of clean, maintainable code the hard way.',
      location: 'Bordeaux, France',
      startDate: new Date('2017-07-01'),
      endDate: new Date('2018-08-01'),
      current: false,
      sortOrder: 4,
    },
  ]

  for (const e of experiences) {
    await db.experience.create({ data: e })
  }
  console.log(`✓ ${experiences.length} experiences created`)

  // ---- Messages ----
  const messages = [
    {
      name: 'Sarah Mitchell',
      email: 'sarah@brightside.co',
      subject: 'Project inquiry — SaaS dashboard redesign',
      message:
        "Hi Alex! We've been looking for a developer who can redesign our analytics dashboard. Your work on Nova Commerce caught our eye. Are you available for a 3-month engagement starting next month? Best, Sarah",
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    },
    {
      name: 'David Chen',
      email: 'd.chen@techflow.io',
      subject: 'Job opportunity — Lead Frontend Engineer',
      message:
        'Hello Alex, we are hiring a Lead Frontend Engineer at TechFlow. Given your experience with Next.js and design systems, I think you would be a great fit. Would you be open to a chat this week?',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26),
    },
    {
      name: 'Emma Laurent',
      email: 'emma@studioparis.fr',
      subject: 'Collaboration on an e-commerce project',
      message:
        "Bonjour Alex! I'm a brand designer working with a French fashion label. They need an online store and I'd love to collaborate with you on the build. Can we schedule a call? À bientôt, Emma",
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
    },
  ]

  for (const m of messages) {
    await db.message.create({ data: m })
  }
  console.log(`✓ ${messages.length} messages created`)

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
