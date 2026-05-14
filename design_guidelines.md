{
  "brand": {
    "name": "InterviewIQ",
    "attributes": [
      "premium",
      "focused",
      "high-trust",
      "fast",
      "quietly-confident",
      "data-driven"
    ],
    "north_star": "Help users improve interview performance quickly via repeatable practice + measurable scoring."
  },
  "design_personality": {
    "reference_fusion": {
      "layout_principles": [
        "Linear: disciplined spacing, subtle borders, minimal chrome",
        "Vercel: crisp typography hierarchy, bento grids, restrained glow",
        "Ramp: conversion-first landing flow + social proof blocks"
      ],
      "visual_motifs": [
        "glass cards with thin borders",
        "radial glow accents (indigo/cyan) used sparingly",
        "bento grids for features + analytics widgets",
        "mono labels (JetBrains Mono) for metadata like FIG, round type, plan tags"
      ]
    },
    "do_not": [
      "No purple/pink gradients (restricted).",
      "No gradients on text-heavy areas.",
      "No centered-page reading layout.",
      "No heavy skeuomorphic shadows; keep shadows soft and wide.",
      "Avoid neon overload; cyan is an accent, not a fill color."
    ]
  },
  "tokens": {
    "css_custom_properties": {
      "note": "Implement as CSS variables in /frontend/src/index.css :root. Keep HSL tokens for shadcn + hex tokens for custom utilities.",
      "colors": {
        "bg_base": "#0A0F1E",
        "bg_surface": "#0E162B",
        "bg_card": "rgba(17, 24, 39, 0.78)",
        "bg_card_hover": "rgba(17, 24, 39, 0.88)",
        "bg_sidebar": "#070B16",
        "text_primary": "#EAF0FF",
        "text_secondary": "#A7B4D6",
        "text_muted": "#6B7AA6",
        "border_subtle": "rgba(255,255,255,0.08)",
        "border_strong": "rgba(255,255,255,0.14)",
        "primary_indigo": "#6366F1",
        "accent_cyan": "#22D3EE",
        "success": "#10B981",
        "warning": "#F59E0B",
        "danger": "#EF4444",
        "info": "#60A5FA",
        "focus_ring": "rgba(99,102,241,0.35)",
        "shadow_elev_1": "0 10px 30px rgba(0,0,0,0.35)",
        "shadow_elev_2": "0 18px 60px rgba(0,0,0,0.45)"
      },
      "shadcn_hsl": {
        "background": "222 45% 8%",
        "foreground": "220 60% 96%",
        "card": "226 39% 12%",
        "card_foreground": "220 60% 96%",
        "popover": "226 39% 12%",
        "popover_foreground": "220 60% 96%",
        "primary": "239 84% 67%",
        "primary_foreground": "222 45% 6%",
        "secondary": "226 30% 16%",
        "secondary_foreground": "220 60% 96%",
        "muted": "226 30% 16%",
        "muted_foreground": "221 25% 70%",
        "accent": "226 30% 16%",
        "accent_foreground": "220 60% 96%",
        "destructive": "0 84% 60%",
        "destructive_foreground": "220 60% 96%",
        "border": "0 0% 100% / 0.10",
        "input": "0 0% 100% / 0.12",
        "ring": "239 84% 67% / 0.45",
        "chart_1": "239 84% 67%",
        "chart_2": "188 86% 55%",
        "chart_3": "158 64% 45%",
        "chart_4": "38 92% 55%",
        "chart_5": "0 84% 60%"
      },
      "radii": {
        "radius_sm": "10px",
        "radius_md": "14px",
        "radius_lg": "18px",
        "radius_xl": "24px"
      },
      "spacing": {
        "container_max": "1200px",
        "section_py": "py-16 sm:py-20 lg:py-24",
        "card_padding": "p-4 sm:p-6",
        "stack_gap": "gap-3 sm:gap-4"
      }
    },
    "gradients_and_textures": {
      "allowed_gradients": [
        {
          "name": "hero-radial-indigo",
          "usage": "Hero background overlay only (<=20% viewport coverage)",
          "css": "radial-gradient(700px circle at 20% 10%, rgba(99,102,241,0.18), transparent 55%)"
        },
        {
          "name": "hero-radial-cyan",
          "usage": "Hero background overlay only (<=20% viewport coverage)",
          "css": "radial-gradient(600px circle at 80% 0%, rgba(34,211,238,0.12), transparent 60%)"
        }
      ],
      "noise": {
        "usage": "Apply as ::before overlay on large cards/hero wrappers only",
        "opacity": "0.035–0.06",
        "implementation": "Reuse existing .noise-overlay in App.css; wrap hero + key glass cards with relative + overflow-hidden."
      }
    }
  },
  "typography": {
    "fonts": {
      "display": {
        "family": "Syne",
        "weights": [600, 700, 800],
        "usage": "H1/H2, KPI numbers, pricing plan names"
      },
      "body": {
        "family": "Inter",
        "note": "Project currently imports DM Sans; switch to Inter to match spec.",
        "weights": [400, 500, 600],
        "usage": "Body, labels, helper text"
      },
      "mono": {
        "family": "JetBrains Mono",
        "weights": [400, 500, 600],
        "usage": "FIG labels, round tags, code-like metadata"
      }
    },
    "scale": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl font-display tracking-tight",
      "h2": "text-base md:text-lg text-[color:var(--text-secondary)]",
      "section_title": "text-2xl sm:text-3xl font-display",
      "card_title": "text-lg font-semibold",
      "body": "text-sm sm:text-base leading-relaxed",
      "caption": "text-xs text-[color:var(--text-muted)]"
    },
    "copy_rules": [
      "Prefer short, confident sentences.",
      "Use numbers + outcomes: “Improve clarity by 18% in 7 days”.",
      "Avoid hype words; keep premium tone."
    ]
  },
  "layout": {
    "grid": {
      "app_shell": {
        "desktop": "Sidebar (260px) + content (fluid) + optional right rail (360px for scoring panel)",
        "mobile": "Bottom sheet / drawer navigation; right rail becomes Tabs"
      },
      "landing": {
        "pattern": "Z-pattern hero -> bento features -> how-it-works steps -> testimonials -> pricing -> final CTA",
        "max_width": "max-w-6xl",
        "gutters": "px-4 sm:px-6 lg:px-8"
      },
      "bento": {
        "classes": "grid grid-cols-1 md:grid-cols-12 gap-4",
        "cards": [
          "md:col-span-7 (primary demo)",
          "md:col-span-5 (persona preview)",
          "md:col-span-4 (feature)",
          "md:col-span-8 (feature)"
        ]
      }
    },
    "page_templates": {
      "auth_split": {
        "left": "Brand + value props + testimonial",
        "right": "Form card (glass) with minimal fields",
        "mobile": "Stacked; brand block collapses into top header"
      },
      "dashboard_home": {
        "top_row": "4 KPI cards (score avg, streak, interviews left, next goal)",
        "main": "Recent sessions table + Quick Start card",
        "secondary": "Daily challenge + Achievements preview"
      },
      "wizard": {
        "pattern": "Stepper + card sections; each step is a Card with radio/select",
        "cta": "Sticky bottom bar on mobile with Back/Continue"
      },
      "chat_with_scoring": {
        "left": "Chat transcript",
        "right": "Live scoring panel (score ring + dimension bars + tips)",
        "mobile": "Tabs: Chat | Score | Notes"
      },
      "report": {
        "top": "Overall score ring + summary bullets",
        "middle": "Radar chart + dimension breakdown",
        "bottom": "Question review accordion + next actions"
      }
    }
  },
  "components": {
    "component_path": {
      "shadcn_primary": [
        "/app/frontend/src/components/ui/button.jsx",
        "/app/frontend/src/components/ui/card.jsx",
        "/app/frontend/src/components/ui/badge.jsx",
        "/app/frontend/src/components/ui/tabs.jsx",
        "/app/frontend/src/components/ui/dialog.jsx",
        "/app/frontend/src/components/ui/drawer.jsx",
        "/app/frontend/src/components/ui/sheet.jsx",
        "/app/frontend/src/components/ui/input.jsx",
        "/app/frontend/src/components/ui/textarea.jsx",
        "/app/frontend/src/components/ui/select.jsx",
        "/app/frontend/src/components/ui/accordion.jsx",
        "/app/frontend/src/components/ui/table.jsx",
        "/app/frontend/src/components/ui/skeleton.jsx",
        "/app/frontend/src/components/ui/sonner.jsx",
        "/app/frontend/src/components/ui/calendar.jsx",
        "/app/frontend/src/components/ui/tooltip.jsx",
        "/app/frontend/src/components/ui/progress.jsx"
      ],
      "custom_components_to_create": [
        "src/components/ScoreRing.jsx (animated SVG ring)",
        "src/components/DimensionBars.jsx (animated bars)",
        "src/components/AppShell.jsx (sidebar + topbar)",
        "src/components/Marketing/Hero.jsx",
        "src/components/Marketing/PricingCards.jsx",
        "src/components/Charts/RadarSixDimensions.jsx",
        "src/components/Charts/TrendLine.jsx",
        "src/components/Charts/SessionHeatmap.jsx",
        "src/components/PersonaSelector.jsx"
      ]
    },
    "buttons": {
      "variants": {
        "primary": {
          "style": "Indigo fill, subtle glow, rounded-xl",
          "tailwind": "rounded-xl bg-[color:var(--primary-indigo)] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_30px_rgba(0,0,0,0.35)] hover:bg-[color:rgba(99,102,241,0.92)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)]",
          "motion": "whileHover: { y: -1 }, whileTap: { scale: 0.98 }"
        },
        "secondary": {
          "style": "Glass button",
          "tailwind": "rounded-xl bg-white/5 text-[color:var(--text-primary)] border border-white/10 hover:bg-white/8 focus-visible:ring-2 focus-visible:ring-[color:var(--focus-ring)]"
        },
        "ghost": {
          "style": "Text button",
          "tailwind": "rounded-xl hover:bg-white/5 text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
        },
        "danger": {
          "style": "Solid danger",
          "tailwind": "rounded-xl bg-[color:var(--danger)] text-white hover:bg-[color:rgba(239,68,68,0.92)]"
        }
      },
      "sizes": {
        "sm": "h-9 px-3 text-sm",
        "md": "h-10 px-4 text-sm",
        "lg": "h-11 px-5 text-base"
      }
    },
    "cards": {
      "base": "glass-card noise-overlay relative overflow-hidden",
      "header": "flex items-start justify-between gap-3",
      "kpi": "p-4 sm:p-6",
      "hover": "hover:border-white/15 hover:shadow-[0_18px_60px_rgba(0,0,0,0.45)]"
    },
    "badges": {
      "plan": "bg-white/5 border border-white/10 text-[color:var(--text-secondary)]",
      "status_success": "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
      "status_warn": "bg-amber-500/10 text-amber-300 border border-amber-500/20",
      "status_danger": "bg-rose-500/10 text-rose-300 border border-rose-500/20"
    },
    "forms": {
      "inputs": "Use shadcn Input/Textarea/Select. Add left icons only when it improves scan speed.",
      "validation": "Inline error text in danger color + subtle shake animation (Framer Motion) on submit.",
      "upload": "Resume upload uses Card + dashed border + drag hover state."
    },
    "navigation": {
      "sidebar": {
        "style": "Dark solid (no gradient), subtle separators, active item indigo left border",
        "mobile": "Use Sheet or Drawer for nav; keep primary CTA accessible"
      },
      "topbar": {
        "contents": "Search (Command), plan badge, user avatar dropdown",
        "component": "command.jsx + dropdown-menu.jsx"
      }
    }
  },
  "data_viz": {
    "libraries": {
      "recharts": {
        "use_for": ["radar", "line trend", "bar breakdown"],
        "theme": "Use CSS vars --chart-1..5; grid lines rgba(255,255,255,0.08)",
        "empty_state": "Show Skeleton + caption: 'Complete 1 interview to unlock analytics'"
      }
    },
    "score_ring": {
      "spec": {
        "size": "112–140px",
        "stroke": "8",
        "track": "rgba(255,255,255,0.10)",
        "progress": "indigo for overall; cyan for improvement delta",
        "animation": "stroke-dashoffset spring + number count-up"
      },
      "accessibility": "Include aria-label like 'Overall score 82 out of 100'."
    },
    "radar_six_dimensions": {
      "dimensions": [
        "Clarity",
        "Structure",
        "Relevance",
        "Depth",
        "Confidence",
        "Conciseness"
      ],
      "styling": {
        "fill": "rgba(99,102,241,0.22)",
        "stroke": "#6366F1",
        "dots": "small, cyan on hover"
      }
    },
    "heatmap": {
      "pattern": "GitHub-like weekly grid; intensity uses indigo alpha steps",
      "tooltip": "Use Tooltip component; show date + score"
    }
  },
  "motion": {
    "library": "Framer Motion",
    "principles": [
      "Entrance: subtle y+opacity (8–16px) with stagger",
      "Hover: lift 2–6px + border brighten",
      "Tap: scale 0.98",
      "Avoid constant looping animations except tiny shimmer on skeletons"
    ],
    "presets": {
      "page_enter": "initial {opacity:0,y:14} animate {opacity:1,y:0} transition {duration:0.45,ease:[0.22,1,0.36,1]}",
      "card_hover": "whileHover {y:-4} transition {duration:0.2}",
      "stagger": "container variants with staggerChildren: 0.06"
    },
    "micro_interactions": {
      "buttons": "Glow increases slightly on hover (shadow only).",
      "inputs": "Focus ring appears (no transform).",
      "chat": "New message slides in from y:8 with fade.",
      "wizard": "Step change uses crossfade + slight x shift.",
      "pricing": "Popular plan has gentle pulse-glow on border (use existing keyframes)."
    }
  },
  "accessibility": {
    "contrast": "All text must meet WCAG AA on #0A0F1E. Use text_secondary only for non-critical metadata.",
    "focus": "Visible focus ring using --focus-ring; never remove outline without replacement.",
    "reduced_motion": "Respect prefers-reduced-motion: disable parallax + reduce spring stiffness.",
    "keyboard": "All menus/dialogs/tabs must be keyboard navigable (shadcn defaults).",
    "aria": [
      "Score rings: aria-label",
      "Charts: provide textual summary below chart",
      "Upload: aria-describedby for accepted formats"
    ]
  },
  "testing": {
    "data_testid_rules": {
      "convention": "kebab-case describing role, not appearance",
      "must_apply_to": [
        "all buttons",
        "links",
        "inputs/selects/textareas",
        "tabs",
        "menus",
        "pricing plan CTAs",
        "key metrics (overall score, streak, plan name)",
        "error banners/toasts"
      ],
      "examples": [
        "data-testid=\"landing-hero-primary-cta\"",
        "data-testid=\"login-form-submit-button\"",
        "data-testid=\"dashboard-kpi-overall-score\"",
        "data-testid=\"interview-setup-persona-select\"",
        "data-testid=\"active-interview-send-message-button\"",
        "data-testid=\"pricing-plan-pro-select-button\""
      ]
    }
  },
  "images": {
    "image_urls": {
      "hero_background": [
        {
          "url": "https://images.unsplash.com/photo-1557683316-973673baf926?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwxfHxkYXJrJTIwcHJlbWl1bSUyMGFic3RyYWN0JTIwZ3JhZGllbnQlMjBtZXNoJTIwYmFja2dyb3VuZHxlbnwwfHx8Ymx1ZXwxNzc4NzYxNTY4fDA&ixlib=rb-4.1.0&q=85",
          "description": "Subtle blue gradient mesh; use as low-opacity background image behind hero overlays (<=20% viewport)."
        },
        {
          "url": "https://images.unsplash.com/photo-1635776063328-153b13e3c245?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHw0fHxkYXJrJTIwcHJlbWl1bSUyMGFic3RyYWN0JTIwZ3JhZGllbnQlMjBtZXNoJTIwYmFja2dyb3VuZHxlbnwwfHx8Ymx1ZXwxNzc4NzYxNTY4fDA&ixlib=rb-4.1.0&q=85",
          "description": "Abstract blur; use for marketing section separators with heavy blur + opacity 0.12."
        }
      ],
      "testimonials_avatars": [
        {
          "url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2OTV8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHBvcnRyYWl0fGVufDB8fHx8MTc3ODc2MTU3NHww&ixlib=rb-4.1.0&q=85",
          "description": "Avatar 1"
        },
        {
          "url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2OTV8MHwxfHNlYXJjaHwzfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHBvcnRyYWl0fGVufDB8fHx8MTc3ODc2MTU3NHww&ixlib=rb-4.1.0&q=85",
          "description": "Avatar 2"
        },
        {
          "url": "https://images.unsplash.com/photo-1607503873903-c5e95f80d7b9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2OTV8MHwxfHNlYXJjaHw0fHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdCUyMHBvcnRyYWl0fGVufDB8fHx8MTc3ODc2MTU3NHww&ixlib=rb-4.1.0&q=85",
          "description": "Avatar 3"
        }
      ]
    }
  },
  "implementation_notes": {
    "instructions_to_main_agent": [
      "Update /frontend/src/index.css to match user-chosen palette: bg #0A0F1E, card #111827, primary #6366F1, accent #22D3EE, success/warn/danger as provided. Keep existing glass-card utilities in App.css but adjust --bg-card values accordingly.",
      "Switch body font from DM Sans to Inter in index.css import and --font-body. Keep Syne for headings and JetBrains Mono for labels.",
      "Use shadcn components from /src/components/ui (no raw HTML dropdowns/calendars/toasts).",
      "All interactive elements and key metrics must include data-testid attributes.",
      "Landing page: implement bento feature grid + pricing cards with one 'Most Popular' plan highlight (Pro).",
      "Active Interview: split layout with right scoring rail on desktop; on mobile use Tabs (Chat/Score/Notes).",
      "Charts: use Recharts with dark grid lines and provide textual summaries for accessibility.",
      "Motion: use Framer Motion presets; avoid universal transition: all; only transition colors/shadows/border-opacity.",
      "Gradients: only as subtle radial overlays in hero/section backgrounds; never on small elements or reading areas; keep under 20% viewport.",
      "Use Skeleton components for loading states across dashboard, report, resume analysis.",
      "Plan gating: show lock badges + upgrade CTA (Dialog) for Premium-only features like Salary Coach."
    ],
    "js_file_convention": {
      "note": "Project uses .jsx. Provide components in .jsx with named exports for components and default exports for pages.",
      "exports": {
        "components": "export const ScoreRing = (...) => { ... }",
        "pages": "export default function DashboardPage() { ... }"
      }
    },
    "extra_libraries": {
      "framer_motion": {
        "install": "npm i framer-motion",
        "usage": "Use motion.div for cards, AnimatePresence for dialogs/toasts transitions."
      },
      "recharts": {
        "install": "npm i recharts",
        "usage": "RadarChart for 6-dimension scoring; LineChart for trends."
      },
      "zustand": {
        "install": "npm i zustand",
        "usage": "Auth/session state + interview flow state."
      }
    }
  },
  "general_ui_ux_design_guidelines": "<General UI UX Design Guidelines>  \n    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms\n    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text\n   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json\n\n **GRADIENT RESTRICTION RULE**\nNEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc\nNEVER use dark gradients for logo, testimonial, footer etc\nNEVER let gradients cover more than 20% of the viewport.\nNEVER apply gradients to text-heavy content or reading areas.\nNEVER use gradients on small UI elements (<100px width).\nNEVER stack multiple gradient layers in the same viewport.\n\n**ENFORCEMENT RULE:**\n    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors\n\n**How and where to use:**\n   • Section backgrounds (not content backgrounds)\n   • Hero section header content. Eg: dark to light to dark color\n   • Decorative overlays and accent elements only\n   • Hero section with 2-3 mild color\n   • Gradients creation can be done for any angle say horizontal, vertical or diagonal\n\n- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**\n\n</Font Guidelines>\n\n- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. \n   \n- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.\n\n- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.\n   \n- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly\n    Eg: - if it implies playful/energetic, choose a colorful scheme\n           - if it implies monochrome/minimal, choose a black–white/neutral scheme\n\n**Component Reuse:**\n\t- Prioritize using pre-existing components from src/components/ui when applicable\n\t- Create new components that match the style and conventions of existing components when needed\n\t- Examine existing components to understand the project's component patterns before creating new ones\n\n**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component\n\n**Best Practices:**\n\t- Use Shadcn/UI as the primary component library for consistency and accessibility\n\t- Import path: ./components/[component-name]\n\n**Export Conventions:**\n\t- Components MUST use named exports (export const ComponentName = ...)\n\t- Pages MUST use default exports (export default function PageName() {...})\n\n**Toasts:**\n  - Use `sonner` for toasts\"\n  - Sonner component are located in `/app/src/components/ui/sonner.tsx`\n\nUse 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.\n</General UI UX Design Guidelines>"
}
