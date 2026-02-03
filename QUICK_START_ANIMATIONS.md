# 🎨 How to Use Animations in Your App

## Quick Reference Guide

### 📦 What You Now Have

1. **shadcn/ui Button** - `src/components/ui/button.tsx`
2. **Framer Motion** - Already installed
3. **Rive** - `@rive-app/react-canvas` installed
4. **10 Animated Components** - `src/components/animated/AnimatedComponents.tsx`
5. **7 Rive Components** - `src/components/animated/RiveComponents.tsx`
6. **Demo Page** - Visit `/demo/animations` to see everything in action

---

## 🚀 Quick Start: 3 Ways to Use

### 1. Use Pre-Made Components (EASIEST)

```tsx
import { AnimatedStatCard } from '@/components/animated/AnimatedComponents'
import { Package } from 'lucide-react'

<AnimatedStatCard
  title="Órdenes Activas"
  value={24}
  change="+12% vs mes anterior"
  icon={Package}
  trend="up"
/>
```

### 2. Add Framer Motion to Existing Components

```tsx
import { motion } from 'framer-motion'

// Before
<div className="card">Content</div>

// After
<motion.div 
  className="card"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  whileHover={{ y: -4 }}
>
  Content
</motion.div>
```

### 3. Use Rive for Empty States

```tsx
import { RiveEmptyState } from '@/components/animated/RiveComponents'

<RiveEmptyState
  title="No hay datos"
  description="Crea tu primer elemento"
  actionLabel="Crear Nuevo"
  onAction={() => console.log('Create!')}
/>
```

---

## 💡 Real Examples for Your App

### Example 1: Animate the Dashboard Cards

**File**: `src/app/(dashboard)/dashboard/page.tsx`

```tsx
import { AnimatedStatCard } from '@/components/animated/AnimatedComponents'
import { Package, DollarSign, TrendingUp } from 'lucide-react'

// Replace existing stat cards with:
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <AnimatedStatCard
    title="Órdenes Activas"
    value={stats.activeOrders}
    change="+12%"
    icon={Package}
    trend="up"
  />
  <AnimatedStatCard
    title="Inversión Total"
    value={formatPesos(stats.totalInvestment)}
    change="+8.5%"
    icon={DollarSign}
    trend="up"
  />
  <AnimatedStatCard
    title="Eficiencia"
    value={`${stats.efficiency}%`}
    icon={TrendingUp}
    trend="up"
  />
</div>
```

### Example 2: Add Page Transitions

**File**: Any page component

```tsx
import { PageTransition } from '@/components/animated/AnimatedComponents'

export default function MyPage() {
  return (
    <PageTransition>
      {/* Your existing content */}
    </PageTransition>
  )
}
```

### Example 3: Animated Buttons

**File**: Anywhere you have buttons

```tsx
import { AnimatedButton } from '@/components/animated/AnimatedComponents'
import { Plus, Download } from 'lucide-react'

// Before
<button>Create New</button>

// After
<AnimatedButton icon={Plus}>
  Create New
</AnimatedButton>

// With loading state
<AnimatedButton 
  loading={isSubmitting}
  onClick={handleSubmit}
>
  Save Changes
</AnimatedButton>
```

### Example 4: Empty States with Rive

**File**: `src/app/(dashboard)/ordenes-trabajo/page.tsx`

```tsx
import { RiveEmptyState } from '@/components/animated/RiveComponents'

// When no orders exist:
{ordenes.length === 0 && (
  <RiveEmptyState
    title="No hay órdenes de trabajo"
    description="Crea tu primera orden para comenzar"
    actionLabel="Nueva Orden"
    onAction={() => setShowCreateModal(true)}
  />
)}
```

### Example 5: Staggered List Animation

**File**: Any list/table component

```tsx
import { StaggeredList } from '@/components/animated/AnimatedComponents'

const items = ordenes.map(orden => ({
  id: orden.id,
  content: <OrdenCard orden={orden} />
}))

<StaggeredList items={items} />
```

---

## 🎬 Getting Rive Animations

### Step 1: Visit Rive Community
Go to: https://rive.app/community

### Step 2: Search for Animations
Search for:
- "construction" or "building" (perfect for your app!)
- "loader" or "loading spinner"
- "empty state" or "empty box"
- "success" or "checkmark"
- "error" or "warning"

### Step 3: Download
1. Click on an animation you like
2. Click "Download" button
3. Save the `.riv` file

### Step 4: Add to Your Project
1. Create folder: `public/animations/`
2. Move the `.riv` file there
3. Use it in components:

```tsx
<RiveEmptyState animationSrc="/animations/your-file.riv" />
```

### Recommended Free Animations:
- **Construction Worker**: Search "construction worker" on Rive
- **Loading Spinner**: Search "loading" on Rive
- **Empty Box**: Search "empty state" on Rive
- **Success Checkmark**: Search "success" on Rive

---

## 🎯 Best Practices

### DO ✅
- Use animations to guide user attention
- Keep animations under 500ms for snappy feel
- Use stagger effects for lists (looks professional)
- Add loading states to buttons
- Use empty states with illustrations

### DON'T ❌
- Animate everything (too much is distracting)
- Use long animations (> 1 second)
- Animate on every interaction
- Forget about performance
- Ignore `prefers-reduced-motion`

---

## 📊 Performance Tips

1. **Lazy load Rive components**:
```tsx
const RiveEmptyState = dynamic(
  () => import('@/components/animated/RiveComponents').then(m => m.RiveEmptyState),
  { ssr: false }
)
```

2. **Use CSS transforms** (GPU accelerated):
```tsx
// Good ✅
whileHover={{ scale: 1.05, y: -4 }}

// Bad ❌
whileHover={{ marginTop: -4 }}
```

3. **Respect user preferences**:
```tsx
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

<motion.div
  animate={prefersReducedMotion ? {} : { y: -4 }}
>
```

---

## 🎨 Customization

All components in `AnimatedComponents.tsx` can be customized:

```tsx
// Change colors
<AnimatedBadge variant="success">Custom</AnimatedBadge>

// Change duration
<motion.div transition={{ duration: 0.8 }}>

// Change easing
<motion.div transition={{ ease: "easeInOut" }}>

// Custom animations
<motion.div
  initial={{ opacity: 0, rotate: -180 }}
  animate={{ opacity: 1, rotate: 0 }}
  transition={{ type: "spring", stiffness: 200 }}
>
```

---

## 📝 Next Steps

1. **Visit the demo page**: Go to `/demo/animations` in your app
2. **Try the components**: Copy examples from this guide
3. **Download Rive files**: Get animations from rive.app/community
4. **Enhance existing pages**: Add animations to Dashboard, Reports, etc.
5. **Create custom animations**: Modify components in `AnimatedComponents.tsx`

---

## 🆘 Troubleshooting

### Rive animations not showing?
- Make sure `.riv` file is in `public/animations/`
- Check the file path is correct
- Verify the file isn't corrupted

### Animations feel laggy?
- Reduce number of animated elements
- Use `will-change` CSS property
- Check browser DevTools Performance tab

### TypeScript errors?
- Make sure all imports are correct
- Check that Framer Motion types are installed
- Restart TypeScript server

---

## 🎉 You're Ready!

You now have:
- ✅ shadcn/ui Button component
- ✅ Framer Motion (already had it)
- ✅ Rive animations library
- ✅ 10 pre-made animated components
- ✅ 7 Rive components
- ✅ Demo page with examples
- ✅ This comprehensive guide

**Start by visiting `/demo/animations` to see everything in action!**

Then pick one page and add animations. I recommend starting with the Dashboard page.

Happy animating! 🚀
