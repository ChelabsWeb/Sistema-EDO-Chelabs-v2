# 🎨 Animation & Component Guide

This guide shows you how to use **shadcn/ui**, **Framer Motion**, and **Rive** in your app.

---

## 📦 **What's Installed**

### ✅ shadcn/ui Components
- **Button** - Premium buttons with variants
- Card, Dialog, Popover, ScrollArea, Tabs, Checkbox (already had these)

### ✅ Framer Motion
- Version: `12.23.26`
- Already installed, ready to use

### ✅ Rive
- Package: `@rive-app/react-canvas`
- For animated illustrations

---

## 🎯 **Quick Start Examples**

### 1. shadcn Button Component

```tsx
import { Button } from '@/components/ui/button'

// Variants
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>

// With icons
<Button>
  <Download className="mr-2 h-4 w-4" />
  Download
</Button>

// Loading state
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Please wait
</Button>
```

---

### 2. Framer Motion Animations

#### Page Transitions
```tsx
import { motion } from 'framer-motion'

export default function Page() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h1>Your Content</h1>
    </motion.div>
  )
}
```

#### Stagger Children (Lists)
```tsx
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
}

<motion.div
  variants={container}
  initial="hidden"
  animate="show"
>
  {items.map((item) => (
    <motion.div key={item.id} variants={item}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

#### Hover Animations
```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
>
  Click me
</motion.button>
```

#### Number Counter Animation
```tsx
import { motion, useSpring, useTransform } from 'framer-motion'

function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(value, { stiffness: 100, damping: 30 })
  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString()
  )

  return <motion.span>{display}</motion.span>
}
```

---

### 3. Rive Animations

#### Basic Usage
```tsx
'use client'

import { useRive } from '@rive-app/react-canvas'

export function RiveAnimation() {
  const { RiveComponent } = useRive({
    src: '/animations/construction.riv',
    autoplay: true,
  })

  return (
    <div className="w-64 h-64">
      <RiveComponent />
    </div>
  )
}
```

#### Interactive Rive
```tsx
'use client'

import { useRive, useStateMachineInput } from '@rive-app/react-canvas'

export function InteractiveRive() {
  const { rive, RiveComponent } = useRive({
    src: '/animations/button.riv',
    stateMachines: 'State Machine 1',
    autoplay: true,
  })

  const onHoverInput = useStateMachineInput(
    rive,
    'State Machine 1',
    'isHover'
  )

  return (
    <div
      className="w-32 h-32"
      onMouseEnter={() => onHoverInput && (onHoverInput.value = true)}
      onMouseLeave={() => onHoverInput && (onHoverInput.value = false)}
    >
      <RiveComponent />
    </div>
  )
}
```

---

## 🎨 **Real-World Examples**

### Example 1: Animated Card with shadcn + Framer Motion

```tsx
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export function AnimatedCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Orden de Trabajo #1234</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Estado: En Ejecución</p>
          <Button className="mt-4">
            Ver Detalles
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
```

### Example 2: Loading State with Rive

```tsx
'use client'

import { useRive } from '@rive-app/react-canvas'

export function LoadingState() {
  const { RiveComponent } = useRive({
    src: '/animations/loader.riv',
    autoplay: true,
  })

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="w-48 h-48">
        <RiveComponent />
      </div>
      <p className="mt-4 text-apple-gray-400 font-medium">
        Cargando datos...
      </p>
    </div>
  )
}
```

### Example 3: Empty State with Animation

```tsx
'use client'

import { motion } from 'framer-motion'
import { useRive } from '@rive-app/react-canvas'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export function EmptyState() {
  const { RiveComponent } = useRive({
    src: '/animations/empty-box.riv',
    autoplay: true,
  })

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <div className="w-64 h-64">
        <RiveComponent />
      </div>
      <h3 className="text-2xl font-black text-foreground mt-6">
        No hay órdenes de trabajo
      </h3>
      <p className="text-apple-gray-400 mt-2 max-w-md text-center">
        Crea tu primera orden de trabajo para comenzar a gestionar la ejecución de obra.
      </p>
      <Button className="mt-6">
        <Plus className="mr-2 h-4 w-4" />
        Nueva Orden de Trabajo
      </Button>
    </motion.div>
  )
}
```

---

## 🚀 **Where to Get Rive Files**

1. **Rive Community**: https://rive.app/community
2. **Create your own**: https://rive.app/editor
3. **Free packs**:
   - Construction/Building animations
   - Loading spinners
   - Success/Error states
   - Empty states

---

## 📝 **Next Steps**

1. **Install more shadcn components** as needed:
   ```bash
   npx shadcn@latest add input
   npx shadcn@latest add select
   npx shadcn@latest add dropdown-menu
   npx shadcn@latest add toast
   npx shadcn@latest add badge
   npx shadcn@latest add avatar
   npx shadcn@latest add skeleton
   ```

2. **Download Rive files** and place them in `public/animations/`

3. **Add animations** to existing pages (see examples above)

---

## 🎯 **Best Practices**

### Framer Motion
- Use `initial`, `animate`, `exit` for page transitions
- Use `whileHover`, `whileTap` for micro-interactions
- Use `staggerChildren` for lists
- Keep transitions under 500ms for snappy feel

### Rive
- Keep file sizes small (< 100KB)
- Use state machines for interactivity
- Preload animations for better UX
- Use for: loaders, empty states, success/error states

### shadcn
- Customize in `components/ui/` files
- Use variants for consistency
- Combine with Framer Motion for animated components
- Follow the design system (Apple aesthetic)

---

## 💡 **Pro Tips**

1. **Combine all three** for maximum impact:
   - shadcn for structure
   - Framer Motion for transitions
   - Rive for delightful illustrations

2. **Performance**:
   - Lazy load Rive components
   - Use `will-change` CSS for Framer Motion
   - Avoid animating too many elements at once

3. **Accessibility**:
   - Respect `prefers-reduced-motion`
   - Keep animations subtle
   - Ensure keyboard navigation works

---

Ready to make your app even more amazing! 🚀
