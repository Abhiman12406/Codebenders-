# Neo-Fintech Design System Specification (Exact Photo Sampled)
Derived directly from Reference Comp (`uploaded_media_1795339107986.jpg`)

## 1. Direct Color Sampling from Photo

Every single color token below was extracted by direct pixel analysis from the user-provided comp image:

| Component / Layer | Photo-Sampled HEX | RGB | Notes |
|:---|:---|:---|:---|
| **Canvas Ambient Backdrop** | `#EFEFEF` | `239, 239, 239` | Exact soft neutral gray of the canvas background |
| **Left Dock Background** | `#1C1C1C` | `28, 28, 28` | Exact dark charcoal sidebar |
| **Right Panel Background** | `#1C1C1C` | `28, 28, 28` | Deep container for "My Cards" and "Recent Contacts" |
| **Total Balance Card (Card 1)** | `#1E1E1E` / `#1D1B1C` | `30, 30, 30` | Top left obsidian dark card |
| **Total Spending Card (Card 2)**| `#FFFFFF` | `255, 255, 255` | Crisp pure white surface |
| **Total Saved Card (Card 3)**   | `#FFFFFF` | `255, 255, 255` | Crisp pure white surface |
| **Neon Lime Accent** | `#C4FC51` | `196, 252, 81` | Visa card body & Total Balance circle badge |
| **Electric Purple / Violet Accent** | `#675DFC` | `103, 93, 252` | Top wave on Visa card & circular `+` buttons |
| **Active Dock Home Capsule** | `#6458E2` | `100, 88, 226` | Active navigation pill in the left dock |
| **Expences Active Purple Bar** | `#625BFF` | `98, 91, 255` | Highlighted active bar in the expenses chart |
| **Income Bezier Curve Stroke** | `#A298DF` | `162, 152, 223`| Smooth line stroke in the Income card |
| **Income +28% Growth Pill** | `#C3EA75` | `195, 234, 117`| Green growth badge background |
| **Dark Tooltip Capsules** | `#0E0E0E` | `14, 14, 14` | Floating badges `$4121` and `$2121` |
| **Hatched Bar Stripes** | `#747474` | `116, 116, 116`| Diagonal pattern lines on Expenses bars |
| **Primary Heading Text** | `#1C1C1C` | `28, 28, 28` | "Welcome Back!", numbers, titles |
| **Muted Subtitles & Labels** | `#909090` | `144, 144, 144`| "Dashboard", "Total Balance", dropdowns |
| **Send / Receive Pill Buttons** | `#FFFFFF` | `255, 255, 255`| White action pills inside right dark panel |

---

## 2. Component Geometry & Spacing
- **Card Corner Radii**: `rounded-[28px]` for stat cards, Income, Expenses, and Transactions cards.
- **Panel Corner Radii**: `rounded-[32px]` for the right-hand panel (`#1C1C1C`).
- **Visa Card**: `rounded-2xl` (~20px) with fluid organic wave top contour (`#675DFC`) over `#C4FC51`.
- **Action Buttons**: `rounded-full` (pill shape).
