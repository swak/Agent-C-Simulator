# Product Spec: Agent-C Simulator

**Type**: Vertical Slice / MVP
**Date**: 2026-02-10
**Status**: Ready for Engineering
**Priority**: High
**External Dependencies Validated**: Yes (see technical-assessment.md)

---

## Reference Documents

| Document | Location |
|----------|----------|
| Game Mechanics Research | `game-design-research.md` |
| Game Design Patterns | `game-design-research-part2.md` |
| Technical Assessment | `technical-assessment.md` |

---

# Product Vision

## Vision Statement

Agent-C Simulator is a browser-based 3D game where players build and optimize a colony of autonomous bots that gather resources, craft items, and explore procedurally arranged zones. At its core, it is a collection-driven automation puzzle: players collect diverse bot types with unique behaviors, configure their task priorities through intuitive drag-and-drop controls, and watch their bot colony operate autonomously to produce resources even while offline. The game occupies a unique intersection — the satisfaction of watching a well-designed Factorio-style production chain run smoothly, the charm and discovery drive of collecting and customizing Slime Rancher creatures, and the strategic depth of Screeps bot programming made accessible to non-programmers. Built as a vertical slice proof-of-concept, it demonstrates that a modern web stack can deliver engaging 3D gameplay while showcasing multi-agent coordination patterns that naturally mirror collaborative software development workflows.

## Strategic Fit

This concept serves dual purposes that reinforce each other. As a standalone game, it targets an underserved market intersection: no existing game combines accessible bot automation, 3D collection mechanics, idle progression, and web-first deployment. The closest competitors fall short — Autonauts has charm but lacks depth and web access, Screeps has depth but excludes non-programmers, and Mindustry proves web viability but lacks charm and idle mechanics. This creates a genuine product opportunity independent of any framework goals.

As a proof-of-concept for the miniature-guacamole framework, the game creates a concrete demonstration context for multi-agent coordination without requiring enterprise clients or proprietary codebases. The bot colony maps conceptually to a dev team: specialized roles, task assignment, autonomous execution, bottleneck identification, and iterative optimization. A product manager prioritizing feature work mirrors a player assigning bots to resource-gathering tasks. An engineering manager balancing team capacity mirrors a player optimizing bot allocation across production chains. The framework's task handoffs, memory protocol, and workstream tracking find natural analogs in bot behavior trees, resource pipelines, and progress metrics. The game becomes a shareable reference implementation that demonstrates the framework's value proposition through gameplay rather than documentation.

The synergy works both ways. Framework development provides natural test cases for the game's bot AI systems. Game development provides immediate feedback on framework ergonomics. Both benefit from shared patterns around task delegation, state management, and autonomous agent coordination. The proof-of-concept credibility increases because the game must succeed on its own merits as playable entertainment, not just as a technical demo.

## Target Audience

**Primary Persona: The Optimization Hobbyist**
Age 25-40, plays Factorio or Satisfactory on weekends, browses programming memes, appreciates elegant systems. Motivated by making things efficient and watching them work. Plays in 20-60 minute sessions at desktop but checks progress on mobile during commutes. Values depth over graphics, systems over story. Will spend hours perfecting a bot configuration for marginal efficiency gains. Likely has a technical background but games are leisure, not work.

**Secondary Persona: The Casual Collector**
Age 18-35, plays mobile gacha or Stardew Valley, enjoys cute aesthetics and completion-driven goals. Motivated by discovery and personalization. Plays in 5-15 minute bursts throughout the day. Values charm, accessibility, and visible progress. Will customize bot appearance extensively and share screenshots. Unlikely to engage with advanced optimization layers but appreciates watching bots do their work.

**Tertiary Persona: The Framework Explorer**
Age 28-45, technical lead or senior engineer evaluating agent coordination patterns for their own projects. Motivated by learning transferable concepts. Plays deliberately to understand the system architecture. Values transparency in how bot behaviors are structured and how inter-bot communication works. Likely to inspect the codebase and adapt patterns to their own context.

All three personas intersect at the core loop: placing bots, watching them work, and improving the system. The game's three-layer control abstraction serves all three — Layer 1 for casual collectors, Layer 2 for optimization hobbyists, Layer 3 for framework explorers.

## Core Value Proposition

The unique value lies at the convergence of four elements that no existing game combines in a web-native package:

1. **Collection Drive**: Discovering bot blueprints, unlocking variants, customizing appearance and behavior creates the gacha-style discovery satisfaction without monetization pressure. The roster screen showing 8 of 12 bot types unlocked leverages the Zeigarnik effect — the psychological pull to complete what is unfinished.

2. **Automation Satisfaction**: The Factorio "just one more thing" loop where every solution reveals the next bottleneck. Optimizing resource pipelines and watching production scale provides the same intrinsic satisfaction as watching an ant farm or a Rube Goldberg machine operate.

3. **Autonomous Agency**: Bots operate independently with emergent behaviors from simple personality traits and team synergies. Unlike Factorio where machines are static, or Slime Rancher where creatures are unpredictable, bots are both autonomous and configurable. This creates emotional attachment through nurturing and pride through optimization.

4. **Web 3D Accessibility**: Zero-friction entry, instant play, cross-device progress, and shareability. The .io game formula applied to a 3D automation game. No download, no install, no account required to start. The URL is the distribution.

The intersection creates something new: a game where configuring autonomous agents is the core mechanic, optimization is intrinsically satisfying, collection drives retention, and accessibility enables broad reach. It answers the question "What if Factorio and Slime Rancher had a baby, and it ran in your browser?"

## Success Metrics for V1

V1 validates the vertical slice — a single meadow biome with 3-5 bot types, drag-and-drop task assignment, basic crafting, and offline progression. Success is measured through engagement quality and technical validation, not scale or revenue:

**Engagement Validation:**
- Players return within 24 hours of first session: 40%+ target
- Average session length: 15+ minutes indicates the core loop hooks
- Completion of first bot upgrade: 70%+ of players who play >5 minutes
- Second biome unlock rate: 30%+ of players indicates progression pacing works
- Player-initiated shares or bot blueprint exports: 5%+ indicates community potential

**Technical Validation:**
- 60fps on desktop Chrome with 20+ bots active
- 30fps on mid-range mobile (2023+ Android) with 10+ bots active
- Initial load time <3 seconds on average US connection
- Zero client-side crashes in 100 sessions with browser console logging
- Offline progress calculation completes in <200ms on return

**Qualitative Validation:**
- Players describe the experience as "satisfying to watch" in feedback
- At least one player voluntarily shares a screenshot or video
- Framework team can map bot coordination patterns to agent workflows
- Codebase serves as reference implementation for at least two framework concepts

**Anti-Metrics (things we explicitly do not measure for V1):**
- Total player count or user acquisition
- Monetization or ARPU
- Viral coefficient or sharing rate
- Long-term retention beyond 7 days
- Completion rate of all content

V1 succeeds if it proves three things: the core loop is fun, the tech stack performs, and the patterns transfer to framework context.

## Priority Tiers

**P0 (Must Have for V1 — Vertical Slice):**
- Single biome (meadow) with 3D terrain, day/night cycle, ambient sound
- 3-5 bot visual variants with charming idle animations
- Drag-and-drop task assignment (Layer 1 control only)
- 2-3 resource types with visible gathering animations
- Simple crafting system with 2-ingredient recipes across 2 tiers
- One linear tech tree branch with 5-6 nodes
- Bot color and accessory customization (2-3 slots)
- Autonomous bot gathering with pathfinding
- Offline progress that accumulates resources while away
- LocalStorage-based save/load
- Basic HUD showing resources, bot status, available upgrades
- Audio feedback for bot actions and crafting completion
- Performance: 60fps desktop, 30fps mid-range mobile

**P1 (Next Version — Depth Expansion):**
- Priority list control (Layer 2) for intermediate optimization
- Second biome (forest or caves) with unique resources and challenges
- 3-5 additional bot types with specialized roles
- Bot specialization system through repeated task performance
- Team synergy bonuses between bot types
- Tech tree branching with meaningful trade-off decisions
- Challenge modes with fixed constraints and optimization scoring
- Blueprint export/import for sharing bot configurations
- Leaderboards for optimization challenges
- Cloud save via Next.js API routes
- Visual behavior tree editor preview (Layer 3 prototype)

**P2 (Future — Community and Scale):**
- Full behavior tree editor (Layer 3 control)
- 4+ additional biomes with Metroidvania-style revisiting
- Prestige/Reboot system for meta-progression
- User-generated challenge creation and sharing
- Community bot marketplace with rating system
- Seasonal events with unique cosmetic unlocks
- Asynchronous multiplayer (visit other players' colonies read-only)
- Mobile app wrapper with push notifications for milestone completion
- Modding support via exposed behavior tree and resource systems
- Full audio/music suite with dynamic adaptive scoring

## Risks and Mitigations

**Risk 1: Core Loop Does Not Hook Within First 60 Seconds**
*Impact*: High — if placing and watching bots is not immediately satisfying, no amount of depth will save engagement.
*Mitigation*: Ruthless focus on the minute-to-minute interaction. Charming bot animations, satisfying audio feedback, and visible progress must exist from the first prototype. Playtest with target personas at every milestone. If testers do not smile or lean forward when the first bot completes a task, redesign before adding features.

**Risk 2: Mobile Performance Fails to Meet 30fps Target**
*Impact*: Medium — excludes casual collectors who play primarily on mobile.
*Mitigation*: Build performance budgets into the design from day one. Use `useDetectGPU` to implement adaptive quality tiers. Prototype on actual mid-range Android devices within the first two weeks. If performance is borderline, simplify bot models or reduce simultaneous on-screen bots before adding new features. Desktop-first with mobile as progressive enhancement is acceptable for V1.

**Risk 3: Automation Complexity Ceiling Too Low (Autonauts Problem)**
*Impact*: Medium — optimization hobbyists exhaust content quickly and leave.
*Mitigation*: Layer 2 and 3 controls provide depth runway. Ensure Layer 1 is sufficient to complete all content, but Layer 2/3 unlock 30-50% efficiency gains. Design resource chains that have non-obvious bottlenecks solvable through clever bot configuration. Monitor playtime distribution — if 90th percentile players are finishing all content in under 5 hours, P1 must prioritize depth over breadth.

**Risk 4: No Differentiation from Existing Automation Games**
*Impact*: High — becomes "Factorio in a browser" without compelling unique value.
*Mitigation*: Double down on bot personality and charm. The emotional attachment from watching autonomous agents with emergent quirks is the differentiator. If bots feel like interchangeable machines, we have failed. Invest in idle animations, bot-to-bot interactions, and personality trait systems early. The game must pass the "would you feel bad deleting a bot?" test.

**Risk 5: Framework Proof-of-Concept Value Not Clear**
*Impact*: Low — game succeeds but does not serve framework goals.
*Mitigation*: Document explicit mappings between bot systems and framework patterns. Create supplementary blog posts or video breakdowns showing how bot behavior trees implement agent task management. Ensure codebase is readable as reference implementation — clear separation between game logic and rendering, well-commented agent coordination patterns, and architectural decision records explaining key choices.

**Risk 6: Scope Creep Into P1/P2 Features Before V1 Validation**
*Impact*: High — delays validation of core assumptions.
*Mitigation*: Hard cutoff: V1 ships when P0 checklist is complete and success metrics are measurable. No P1 features until engagement validation passes thresholds. Product owner has authority to reject feature requests that are not P0-critical. If tempted to add "just one more bot type," the answer is no.

**Risk 7: Web 3D Technical Stack Immaturity**
*Impact*: Low — Three.js + R3F ecosystem is battle-tested.
*Mitigation*: Vertical slice prototype validates technical feasibility within first sprint. If frame rate or bundle size concerns emerge, pivot to simpler art style or 2.5D before abandoning the concept. The technical assessment indicates low risk, but early validation prevents sunk cost.

---

# Requirements

## 1. User Stories

### US-01: Initial Bot Placement
**As a** player new to the game,  
**I want** to place my first bot near a resource node,  
**so that** I can start collecting resources autonomously and understand the core mechanic.

**Acceptance Criteria:**
- [ ] Player can drag or click a bot from their available bot list
- [ ] Player can place the bot anywhere in the meadow biome
- [ ] Bot automatically begins gathering when placed near a resource node
- [ ] Visual feedback shows bot is actively gathering (animation, particles, sound)

---

### US-02: Autonomous Resource Gathering
**As a** player who has placed bots,  
**I want** my bots to continue gathering resources without my input,  
**so that** I can watch progress accumulate and feel the satisfaction of automation.

**Acceptance Criteria:**
- [ ] Bots gather resources continuously when near assigned resource nodes
- [ ] Resource accumulation is visible (growing piles, incrementing counters)
- [ ] Bots show distinct animations for idle, traveling, and gathering states
- [ ] Audio feedback plays when resources are collected

---

### US-03: Resource Collection and Storage
**As a** player with autonomous bots,  
**I want** to see my collected resources visibly accumulate,  
**so that** I understand what I have earned and what I can use for crafting.

**Acceptance Criteria:**
- [ ] HUD displays current resource counts for all resource types
- [ ] Visual resource piles appear in the 3D world near collection points
- [ ] Resources are automatically transferred to player inventory when bots deliver them
- [ ] Clear visual distinction between resource types (color, shape, icon)

---

### US-04: Simple Crafting
**As a** player with gathered resources,  
**I want** to combine 2 ingredients at a crafting station to create bot upgrades,  
**so that** I can improve my bots and progress.

**Acceptance Criteria:**
- [ ] Crafting UI shows available recipes (2-ingredient maximum for MVP)
- [ ] Recipes display required resources and output item
- [ ] Craft button is disabled when resources are insufficient
- [ ] Crafted items appear in inventory with visual feedback (animation, sound)

---

### US-05: Bot Upgrades
**As a** player who has crafted upgrades,  
**I want** to apply them to my bots to increase their capabilities,  
**so that** they gather resources faster or carry more.

**Acceptance Criteria:**
- [ ] Upgrade UI shows available upgrades for selected bot
- [ ] Applying an upgrade consumes the crafted item
- [ ] Bot stats change visibly (speed, capacity, etc.)
- [ ] Bot visual appearance reflects upgrades (new accessory, color change, animation)

---

### US-06: Tech Tree Progression
**As a** player unlocking new capabilities,  
**I want** to progress through a linear tech tree with 5-6 nodes,  
**so that** I can unlock new bot types, recipes, and mechanics in a clear sequence.

**Acceptance Criteria:**
- [ ] Tech tree UI displays all nodes (locked and unlocked)
- [ ] Each node shows unlock requirements (resource cost or prerequisite nodes)
- [ ] Unlocking a node grants new recipes, bot types, or abilities
- [ ] Visual feedback shows newly unlocked content

---

### US-07: Bot Visual Customization
**As a** player who wants to personalize my bots,  
**I want** to customize their colors and accessories (2-3 slots),  
**so that** my bot fleet feels unique and expresses my preferences.

**Acceptance Criteria:**
- [ ] Customization UI shows available colors and accessories
- [ ] Changes preview in real-time before applying
- [ ] Customizations persist across sessions
- [ ] No gameplay impact from cosmetic choices (purely visual)

---

### US-08: Offline Progress
**As a** player returning to the game after being away,  
**I want** to see accumulated resources from my bots' autonomous work,  
**so that** I feel rewarded for returning and motivated to engage again.

**Acceptance Criteria:**
- [ ] Bots continue gathering while player is offline (time-capped, e.g., max 8 hours)
- [ ] Return screen shows total resources gathered during absence
- [ ] Resources are added to inventory automatically
- [ ] "Welcome back" moment is celebratory with visual/audio feedback

---

### US-09: Cross-Platform Touch Controls
**As a** mobile or tablet player,  
**I want** intuitive touch controls for camera, bot placement, and interaction,  
**so that** the game is fully playable without a mouse and keyboard.

**Acceptance Criteria:**
- [ ] Pinch-to-zoom controls camera distance
- [ ] Two-finger drag rotates camera
- [ ] Single tap selects bots or interacts with objects
- [ ] Drag gesture moves bots to new locations
- [ ] All UI elements meet minimum 44px touch target size

---

### US-10: Exploring the Meadow
**As a** player in the starting meadow,  
**I want** to see distinct resource types in different areas,  
**so that** I am encouraged to explore and expand my bot network.

**Acceptance Criteria:**
- [ ] At least 3 distinct resource types visible in the meadow (trees, rocks, plants)
- [ ] Resources are visually distinct (different colors, shapes, animations)
- [ ] Resource nodes regenerate over time (or new nodes appear)
- [ ] Edge of accessible area hints at future content (fog, locked gates, distant biomes)

---

### US-11: Bot Specialization Discovery
**As a** player with multiple bot types,  
**I want** to discover that different bots excel at different tasks,  
**so that** I learn to match bot capabilities to resource types.

**Acceptance Criteria:**
- [ ] At least 3 bot variants available in MVP (e.g., Miner, Crafter, Hauler archetypes)
- [ ] Each bot type has visible stat differences (speed, capacity, specialization)
- [ ] Tooltip or info panel explains bot strengths
- [ ] Player can observe efficiency differences when assigning bots to tasks

---

### US-12: Clear Progression Feedback
**As a** player working toward the next upgrade,  
**I want** to see a progress bar or indicator showing how close I am,  
**so that** I feel motivated to continue playing.

**Acceptance Criteria:**
- [ ] HUD shows progress toward next tech tree unlock
- [ ] Crafting UI shows how many more resources are needed for desired items
- [ ] Visual indicators on locked content preview what will be unlocked
- [ ] Achievement or milestone notifications when key thresholds are reached

---

## 2. BDD Scenarios

### BDD-01: First Bot Placement and Gathering

**Given** the player has just started the game and has one basic bot  
**When** the player drags the bot near a glowing tree resource node  
**Then** the bot begins gathering wood automatically  
**And** the bot plays a gathering animation with audio feedback  
**And** the wood count in the HUD increments visibly  

---

### BDD-02: Resource Gathering Loop

**Given** a bot is actively gathering resources from a node  
**When** the bot's inventory reaches full capacity  
**Then** the bot travels to the nearest storage point  
**And** deposits the resources  
**And** returns to the resource node to continue gathering  

---

### BDD-03: Crafting a Bot Upgrade

**Given** the player has collected 10 wood and 5 stone  
**When** the player opens the crafting menu  
**And** selects a "Speed Boost" recipe (requires 10 wood + 5 stone)  
**And** clicks the "Craft" button  
**Then** the resources are consumed from inventory  
**And** a "Speed Boost" item appears in the inventory  
**And** the player receives visual and audio confirmation  

---

### BDD-04: Offline Progress Accumulation

**Given** the player has 3 active bots gathering resources  
**When** the player closes the game for 2 hours  
**And** reopens the game  
**Then** a "Welcome Back" screen displays total resources gathered (e.g., +120 wood, +60 stone)  
**And** the resources are automatically added to the player's inventory  
**And** celebratory animation plays  

---

### BDD-05: Cross-Platform Touch Controls

**Given** the player is on a mobile device  
**When** the player pinches two fingers together on the screen  
**Then** the camera zooms out  
**When** the player spreads two fingers apart  
**Then** the camera zooms in  
**When** the player drags two fingers across the screen  
**Then** the camera rotates around the scene  
**When** the player taps a bot  
**Then** the bot is selected with visual feedback (outline, highlight)  

---

### BDD-06: Tech Tree Unlock

**Given** the player has accumulated 50 wood and 30 stone  
**When** the player opens the tech tree  
**And** clicks on the locked "Advanced Miner Bot" node (requires 50 wood + 30 stone)  
**And** confirms the unlock  
**Then** the resources are consumed  
**And** the "Advanced Miner Bot" node becomes available  
**And** the Advanced Miner Bot blueprint is added to the bot creation menu  
**And** a notification appears: "Unlocked: Advanced Miner Bot"  

---

## 3. Feature Breakdown

### P0: Core Loop (Must Ship)

| Feature | Description |
|---------|-------------|
| **Single Meadow Biome** | Bright, inviting 3D environment with grass, trees, rocks, plants. ~500K triangles budget. |
| **3-4 Resource Types** | Wood (trees), Stone (rocks), Fiber (plants), and optionally Ore (small deposit nodes). |
| **3-5 Bot Visual Variants** | Basic Bot, Miner Bot, Hauler Bot, Crafter Bot, Scout Bot. Modular appearance (body + accessory slots). |
| **Drag-and-Drop Task Assignment** | Player drags bots to resource nodes; bots auto-gather. No behavior tree editor in V1. |
| **Autonomous Gathering** | Bots gather resources, transport to storage, repeat. Visible animations and audio. |
| **Simple Crafting System** | 2-ingredient recipes. Tier 1 (raw -> processed), Tier 2 (processed -> bot upgrades). 8-10 total recipes. |
| **Linear Tech Tree** | 5-6 nodes in sequence. Each node unlocks a bot type, recipe, or capability upgrade. |
| **Bot Color/Accessory Customization** | 2-3 customization slots (primary color, secondary color, accessory/hat). Cosmetic only. |
| **Basic Offline Progress** | Time-capped (e.g., 8 hours max). Bots continue gathering. "Welcome Back" reward screen. |
| **HUD and Menus** | Resource counter, bot list, crafting menu, tech tree, customization panel. Tailwind-styled overlay. |
| **Cross-Platform Controls** | Desktop (mouse + keyboard), tablet/mobile (touch gestures). Responsive camera and UI. |

---

### P1: Polish and Engagement (Next Sprint)

| Feature | Description |
|---------|-------------|
| **Charming Bot Animations** | Idle fidgets, celebration dances, confused looks when idle, bounce when delivering resources. |
| **Ambient Audio and SFX** | Background music, gathering sounds, crafting chimes, bot movement audio. |
| **Visual Polish** | Post-processing (bloom, tone mapping, vignette). Particle effects for gathering/crafting. |
| **Bot Personality Traits** | Curious (wanders occasionally), Social (works faster near others), Cautious (slower but safer). |
| **Boids Flocking** | Bots traveling together naturally form convoys. Emergent charm. |
| **Resource Node Regeneration** | Depleted nodes slowly regenerate. Visual feedback (sapling -> tree). |
| **Achievement System** | 10-15 discovery/mastery achievements. Unlocks cosmetic rewards. |
| **Persistent World Improvements** | Save/load to localStorage. Cloud save via Next.js API route (optional). |
| **Onboarding Tutorial** | First 60 seconds guided: place bot, watch gather, craft first upgrade. |

---

### P2: Future (Deferred)

| Feature | Description |
|---------|-------------|
| **Behavior Tree Editor** | Layers 2 and 3 from the research doc. Visual programming for bot optimization. |
| **Multiple Biomes** | Forest, Caves, Desert. Each with new resources and challenges. |
| **Prestige/Reboot System** | Reset progress for permanent multipliers and new starting bonuses. |
| **Leaderboards** | Efficiency, scale, speed categories. Community-voted creativity board. |
| **Bot Blueprint Sharing** | Export/import codes. Community marketplace. |
| **Challenge Modes** | Daily/weekly puzzles. Constraints-based optimization challenges. |
| **Multiplayer (Asynchronous)** | Visit other players' worlds (read-only). Community challenges. |
| **Advanced Emergent Behavior** | Complex synergies, ecosystem simulation, hazard avoidance. |
| **User-Generated Content** | Level editor for community challenges. |

---

## 4. Non-Functional Requirements

### Performance Targets

| Platform | Frame Rate | Load Time | Draw Calls | Polygon Count |
|----------|-----------|-----------|------------|---------------|
| **Desktop (2023+ hardware)** | 60 FPS sustained | <2 seconds | <200 | 1-2M triangles |
| **Tablet (iPad/Android)** | 45-60 FPS | <3 seconds | <150 | 500K-1M triangles |
| **Mobile (mid-range 2023+)** | 30 FPS minimum | <3 seconds | <100 | 300K-500K triangles |

**Optimization Strategies:**
- InstancedMesh for repeated bot models (100 bots = 1 draw call)
- LOD system with 3 tiers (high detail <10m, medium <50m, low >50m)
- Adaptive quality via GPU tier detection (useDetectGPU)
- Pixel ratio capped at 2 on high-DPI displays
- Texture atlases and shared materials
- On-demand rendering when scene is static

---

### Supported Platforms and Browsers

| Platform | Browsers | Notes |
|----------|----------|-------|
| **Desktop** | Chrome 110+, Edge 110+, Firefox 115+, Safari 16+ | WebGL 2 or WebGPU |
| **Tablet** | Chrome 110+, Safari 16+ (iPadOS) | Touch optimized |
| **Mobile** | Chrome 110+ (Android), Safari 16+ (iOS 16+) | Reduced visual fidelity |

**Progressive Enhancement:**
- WebGL 2 baseline (universal support)
- WebGPU progressive enhancement (70%+ browser support as of 2026)
- Graceful degradation for older devices (reduced effects, lower polygon counts)

---

### Accessibility Baseline

| Requirement | Implementation |
|-------------|----------------|
| **Minimum Touch Target Size** | 44x44 pixels (iOS standard) |
| **Color Contrast** | WCAG AA compliance for UI text and critical icons |
| **Keyboard Navigation** | Full menu navigation via Tab/Enter/Escape |
| **Screen Reader Support** | Basic ARIA labels for menus and HUD elements |
| **Adjustable Text Size** | HUD text scales with browser zoom settings |
| **Motion Sensitivity** | Option to reduce camera shake and particle effects |

**Deferred Accessibility (Post-MVP):**
- Colorblind modes (resource icons use shapes + colors)
- High-contrast mode toggle
- Customizable control remapping
- Audio description for key events

---

### Loading and Responsiveness

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Initial HTML Paint** | <500ms | Time to first contentful paint (FCP) |
| **Game Canvas Ready** | <2 seconds (desktop), <3 seconds (mobile) | Time to interactive |
| **Asset Load (3D models, textures)** | <1.5 seconds | Progressive loading with fallback |
| **HUD Interaction Latency** | <100ms | Click/tap to UI response |
| **Bot Placement Feedback** | <50ms | Drag-to-placement visual confirmation |

**Loading Strategy:**
- Static shell SSR (instant first paint)
- 3D assets lazy-loaded behind "Start Game" button
- Draco compression for models, KTX2 for textures
- Progressive asset loading (essential models first, decorative assets deferred)

---

### Data Persistence

| Mechanism | Data Stored | Reliability |
|-----------|-------------|-------------|
| **localStorage** | Game state (resources, bots, tech tree progress) | High (client-side, ~5-10MB limit) |
| **Auto-save** | Every 30 seconds during active play | Prevents loss on tab close |
| **Optional Cloud Save** | Full game state sync via Next.js API route | Requires authentication (post-MVP) |
| **Offline Progress Checkpoint** | On tab close/minimize, save timestamp for idle calculation | Ensures offline rewards on return |

---

### Security and Data Privacy

| Requirement | Implementation |
|-------------|----------------|
| **No Personal Data Collection (MVP)** | Game state is local-only. No analytics or tracking. |
| **HTTPS Required** | Vercel enforces HTTPS for all traffic. |
| **Content Security Policy** | Restrict external script sources. |
| **No Third-Party Cookies** | Game is self-contained; no external dependencies. |

**Future (Cloud Saves):**
- User authentication via OAuth (Google, GitHub, etc.)
- GDPR-compliant data handling
- Right to deletion and data export

---

### Browser Compatibility Matrix

| Feature | Chrome/Edge | Firefox | Safari | Mobile Safari | Android Chrome |
|---------|-------------|---------|--------|---------------|----------------|
| **WebGL 2** | Full support | Full support | Full support | Full support | Full support |
| **WebGPU** | Full support (110+) | Full support (115+) | Full support (16+) | Full support (iOS 16+) | Full support (110+) |
| **Touch Gestures** | Full support | Full support | Full support | Full support | Full support |
| **localStorage** | Full support | Full support | Full support | Full support | Full support |
| **Audio (Howler.js)** | Full support | Full support | Full support | Requires user gesture | Full support |
| **InstancedMesh** | Full support | Full support | Full support | Full support | Full support |

---

### Bundle Size Budget

| Asset Type | Budget (Gzipped) | Notes |
|------------|------------------|-------|
| **JavaScript (Framework)** | ~400-550 KB | Three.js, R3F, Drei, Rapier |
| **JavaScript (Game Logic)** | ~100-200 KB | ECS, game state, bot AI |
| **3D Models** | ~500 KB - 1 MB | Draco-compressed GLTF |
| **Textures** | ~300-500 KB | KTX2 format, texture atlases |
| **Audio** | ~200-400 KB | Compressed MP3/OGG, deferred load |
| **Total Initial Load** | <1.5 MB | Code-split game behind interaction |

---

### Testing Requirements

| Test Type | Coverage Target | Tools |
|-----------|----------------|-------|
| **Unit Tests (Game Logic)** | 80%+ | Vitest |
| **Component Tests (R3F)** | Core components only | @react-three/test-renderer |
| **Integration Tests** | Critical user flows (bot placement, crafting, tech unlock) | Playwright |
| **Performance Tests** | FPS benchmarks on target devices | r3f-perf, manual device testing |
| **Visual Regression** | Manual QA on 3 devices (desktop, tablet, mobile) | Screenshot comparison |

**Continuous Integration:**
- GitHub Actions for unit/component tests on every PR
- Vercel preview deployments for manual QA
- Automated Lighthouse checks for performance metrics

---

## 5. Success Metrics (MVP Launch)

| Metric | Target | Measurement Window |
|--------|--------|-------------------|
| **Player Retention (Day 1)** | 40%+ | Players who return the day after first play |
| **Session Length (Median)** | 10-15 minutes | Time from load to tab close |
| **First Bot Placement** | 90%+ | Percentage of players who place at least one bot |
| **First Craft Completion** | 60%+ | Percentage of players who craft an upgrade |
| **Tech Tree Progress** | 30%+ | Percentage of players who unlock at least 2 nodes |
| **Mobile vs Desktop FPS** | 30 FPS mobile, 60 FPS desktop | Measured via r3f-perf |
| **Load Time (P75)** | <3 seconds | 75th percentile load time to interactive |
| **Error Rate** | <1% | JavaScript errors per session |

---

---

Now I'll write the Design section based on the research context.

---

# Design

## 1. Visual Direction

### Art Style

Agent-C Simulator uses a **low-poly, stylized aesthetic** with a **cozy charm** focus — a hybrid of Autonauts' approachable geometry, Slime Rancher's personality-driven design, and Super Auto Pets' clean readability. The visual approach prioritizes:

- **Clarity over realism**: Simple, readable shapes that communicate function at a glance
- **Warmth over sterility**: Rounded edges, inviting colors, organic forms balanced with tech elements
- **Personality through animation**: Bots express emotion and state through motion, not complex facial rigs
- **Distance readability**: Bot types and resource states must be identifiable from zoomed-out views

Low-poly meshes (~500-2000 triangles per bot) with flat-shaded or gradient-textured materials keep draw calls low while maintaining visual charm. The style should feel **handcrafted and inviting**, not procedural or cold.

### Color Palette

The meadow biome establishes the foundational palette:

**Environment:**
- Sky: Soft gradient from pale blue (#A8D5F2) to warm peach (#FFD4B8) — suggests perpetual "golden hour"
- Grass: Lush green base (#7BCB60) with subtle yellow-green highlights (#B8E986)
- Terrain: Warm earth tones (#8B7355) with sandy accents (#D4C4A8)
- Water/Streams: Clear cyan (#5DD9E8) with deeper teal shadows (#3A9BA6)

**Resources (designed for color-blind accessibility):**
- Wood: Rich brown (#8B5A3C) + vertical grain pattern
- Stone: Cool gray (#6B7A88) + angular facets
- Iron Ore: Rusty orange (#C47E58) + metallic specks
- Crystals: Vibrant magenta (#E84FA4) + glow effect + hexagonal shape
- Bio-matter: Lime green (#9ACD32) + pulsing animation

Each resource type pairs color with distinct **shape language** and **surface pattern** to ensure differentiation for color-blind players. Resources also have contextual glow or particle effects when interactable.

**Bot Palette:**
- Base chassis: Off-white (#F4F1EA) or warm gray (#C4BDB6) — neutral canvas for player customization
- Accent colors: Player-selectable from a 12-color palette (HSL-spaced for variety)
- Status indicators: Green glow (active), amber pulse (low energy), red flash (idle/blocked)
- Rarity tiers: Common (bronze trim #CD7F32), Rare (silver #C0C0C0), Epic (gold #FFD700), Legendary (iridescent shader)

### Bot Design Philosophy

**Modular construction**: Bots are visually assembled from **head, body, drive system** components — each combination produces a distinct silhouette. This communicates both function and player customization choices.

**Specialization through form:**
- Miners: Boxy heads with drill attachments, wide-stance drive systems
- Haulers: Tall torsos with cargo racks, tank treads or multi-wheel bases
- Scouts: Sleek, narrow profiles, hover or wheeled drives, antenna-studded heads
- Crafters: Multi-arm torsos, compact heads with visual displays, stationary or slow wheels

**Expressiveness without faces**: Bots use **eye-lights** (simple glowing shapes), **antenna motion**, and **posture shifts** to communicate state. A bot at 10% battery droops slightly and dims its eyes. A bot that just completed a task does a quick "bounce" animation. This anthropomorphism creates emotional attachment without requiring complex character modeling.

**Customization layers:**
1. **Functional**: Component selection affects stats and visuals (better drive = faster, different treads)
2. **Cosmetic**: Hats, decals, paint colors, weathering effects — purely expressive
3. **Progression**: Tier upgrades add visual complexity (Tier 1 bots are simple cubes, Tier 3 have articulated limbs)

### World Feel

The meadow should evoke **"ant farm meets toy workshop"** — players observe their bots as both adorable toys and functional agents. The world is:

- **Inviting**: No harsh lighting, no threatening environments (in V1)
- **Alive**: Ambient wildlife (butterflies, birds), gentle wind effects on grass, day-night cycle (subtle, not disruptive)
- **Readable**: Clear visual hierarchy — bots pop against environment, resources glow softly, paths are visible
- **Cozy**: Players should feel safe to experiment, fail, and iterate without punishment

The aesthetic goal is to make players want to **screenshot their bot colony** and feel proud of what they've built.

---

## 2. Camera & Controls

### Camera Style

**Orbit camera** with constrained tilt — a hybrid of RTS observation and isometric clarity:

- **Default view**: 30-45° angle from horizontal, positioned to show both ground detail and medium-distance overview
- **Zoom range**: Close (individual bot observation, ~5 units from target) to Wide (full colony view, ~50 units)
- **Rotation**: Full 360° horizontal orbit around a focus point (player-controlled or auto-centering on selected bot)
- **Tilt constraint**: 15°-60° vertical angle — prevents disorienting top-down or ground-level views

This style balances **spatial clarity** (can see bot positions and resource locations) with **emotional connection** (close enough to appreciate bot animations and personality).

### Desktop Controls (Mouse + Keyboard)

**Camera:**
- Right-click drag: Rotate camera around focus point
- Mouse wheel: Zoom in/out
- Middle-click drag: Pan camera laterally
- F key: Focus on selected bot or structure
- Spacebar: Reset camera to default overview

**Interaction:**
- Left-click: Select bot or object (highlights, shows status tooltip)
- Click-drag: Box select multiple bots
- Double-click bot: Open bot detail panel
- Click-drag bot icon from roster: Place bot in world
- Shift + click: Add to selection
- Ctrl + click: Remove from selection

**Bot control:**
- Select bot(s) → right-click resource node: Assign gathering task
- Select bot(s) → right-click crafting station: Assign crafting task
- Q/E keys: Cycle through bot roster
- 1-5 keys: Select bot groups (assignable)

**UI shortcuts:**
- I: Open inventory
- C: Open crafting panel
- T: Open tech tree
- B: Open bot roster
- Esc: Close panels / deselect

### Tablet Controls (Touch + Gestures)

**Camera:**
- One-finger drag: Rotate camera
- Two-finger pinch: Zoom
- Two-finger drag: Pan camera
- Double-tap empty space: Reset camera to overview

**Interaction:**
- Tap bot: Select (persistent selection highlight)
- Tap resource node after selecting bot: Assign task
- Tap empty ground after selecting bot: Move here
- Long-press bot: Open context menu (assign task, upgrade, customize)
- Tap UI panel: Open panel (docked to screen edges)

**Challenges:**
- No hover states (all interactions require taps)
- Touch targets minimum 44px × 44px
- Contextual radial menus replace right-click menus

### Mobile Controls (Simplified Touch)

Mobile uses a **simplified control scheme** to account for smaller screens and single-thumb play:

**Camera:**
- Fixed camera position with pre-set zoom levels (no free orbit)
- Pinch to zoom between 3 levels: Close / Medium / Wide
- Swipe to pan camera (limited range to prevent disorientation)
- Tap "Focus" button to center on active bots

**Interaction:**
- Tap bot roster icon → tap world: Place bot (two-step drag-and-drop)
- Tap bot in world: Select and show radial action menu
  - "Gather" → highlights nearby resource nodes
  - "Craft" → shows available recipes
  - "Upgrade" → opens upgrade quick-view
- No multi-select on mobile (streamlined for single-focus interaction)

**HUD:**
- Bottom drawer (swipe up): Bot roster
- Top bar: Resource counters (collapsible)
- Floating action button (bottom-right): Quick access to crafting and tech tree
- Hamburger menu (top-left): Settings, save/load, help

**Simplifications:**
- Bots auto-assign to nearest tasks when placed (Layer 1 AI only)
- No manual path-drawing or complex behavior trees
- Pre-configured bot loadouts replace granular customization

### Camera Behavior Across Form Factors

| Feature | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| Orbit | Full 360° | Full 360° | Disabled (fixed angles) |
| Zoom | Smooth scroll | Pinch continuous | Pinch stepped (3 levels) |
| Pan | Middle-drag or WASD | Two-finger drag | Limited swipe |
| Tilt | Mouse edge or drag | Limited tilt on drag | Fixed angle |
| Focus/Reset | F key / Spacebar | Double-tap | "Focus" button |

**Adaptive camera intelligence**: On mobile, the camera auto-centers on the "action zone" where bots are currently working, reducing need for manual repositioning.

---

## 3. HUD & UI Layout

### Key UI Elements for V1

**Resource Counters (persistent, top bar):**
- Shows current quantity of Wood, Stone, Iron, and Energy
- Format: Icon + Number (e.g., 🪵 247)
- Expandable on hover/tap to show production rate ("+ 12/min")

**Bot Roster Panel (docked left, collapsible):**
- Scrollable list of owned bots
- Each entry: Bot name, type icon, status indicator, energy bar
- Drag bot from roster to world to place
- Filter/sort: By type, status, or custom groups

**Crafting Panel (modal overlay or right-side dock):**
- Recipe browser with visual tree (shows ingredient requirements)
- "Craft" button (disabled if resources unavailable)
- Queue display for active crafting tasks
- Unlock indicator for grayed-out recipes

**Tech Tree View (full-screen modal):**
- Node-and-edge graph showing research progress
- Current research highlighted, locked nodes grayed with requirements shown
- Click node to start research (consumes resources or time)

**Bot Customization Panel (modal overlay):**
- 3D preview of selected bot (rotatable)
- Component slots: Head, Body, Drive, Accessory 1, Accessory 2
- Color picker for primary/secondary/accent colors
- Visual stat comparison (before/after upgrade)

**Settings/Menu (modal overlay):**
- Graphics quality slider (Auto / Low / Medium / High)
- Audio sliders (Master / SFX / Music)
- Save/Load game state
- Help/Tutorial access
- About/Credits

### Layout Strategy: Desktop → Tablet → Mobile

**Desktop (1920×1080 baseline):**
- **Resource counters**: Top-right corner, horizontal bar
- **Bot roster**: Left sidebar (250px wide), always visible
- **Crafting panel**: Right sidebar (300px wide), toggled with C key
- **Tech tree**: Full-screen modal overlay (semi-transparent backdrop)
- **3D viewport**: Center, fills remaining space (100% height, flexible width)
- **Status tooltips**: Follow cursor, 200px max width, appear on hover

**Tablet (1024×768 landscape):**
- **Resource counters**: Top bar, slightly compressed (icon + abbreviated number)
- **Bot roster**: Left drawer (300px), swipe or tap to reveal/hide (overlays viewport when open)
- **Crafting panel**: Right drawer (350px), same behavior as roster
- **Tech tree**: Full-screen modal, zoomed to fit (pinch-to-zoom enabled)
- **3D viewport**: Full screen behind drawers
- **Status tooltips**: Tap-to-show, anchored to bottom of screen (avoids covering fingers)

**Mobile (390×844 portrait):**
- **Resource counters**: Top bar, icon-only with tap-to-expand
- **Bot roster**: Bottom sheet drawer, swipe up from bottom (covers lower 40% of viewport)
- **Crafting panel**: Full-screen modal (replaces viewport temporarily)
- **Tech tree**: Full-screen modal with simplified node layout (scrollable vertically)
- **3D viewport**: Top 60% of screen (bottom 40% reserved for UI drawers)
- **Floating action button**: Bottom-right, opens quick-access radial menu

### Overlay vs Full-Screen Panels

**Overlay panels** (stay on screen while 3D viewport remains visible):
- Resource counters (persistent)
- Bot status tooltips (contextual)
- Notification toasts (e.g., "Blueprint unlocked!")

**Full-screen panels** (replace or obscure viewport):
- Tech tree (complex graph, needs focus)
- Bot customization (needs 3D preview without distraction)
- Settings/Menu
- Crafting (on mobile only; desktop/tablet use sidebar)

**Adaptive rule**: On screen widths <768px, all panels except resource counters become full-screen modals to maximize touch target size and readability.

---

## 4. Core Interaction Patterns

### Bot Placement

**Desktop:**
1. Click bot in roster panel
2. Cursor changes to "placement mode" (bot preview ghost follows cursor)
3. Ghost snaps to valid placement locations (terrain grid)
4. Click to confirm placement
5. Bot animates "beaming in" or "deploying" from ghost state

**Tablet/Mobile:**
1. Tap bot in roster
2. Tap valid location in world (grid highlights on tap)
3. Bot appears with deploy animation

**Invalid placement feedback**: Ghost turns red, tooltip shows reason ("Too close to another bot", "Blocked terrain", "Insufficient energy")

### Crafting Workflow

**Desktop:**
1. Open crafting panel (C key or click "Craft" button)
2. Browse recipe tree (categories: Basic, Components, Upgrades)
3. Click recipe card to select
4. Preview shows required resources (grayed if unavailable)
5. Click "Craft" button
6. Resource counters decrement, crafting progress bar appears
7. Completion notification toast, item added to inventory

**Tablet/Mobile:**
1. Tap floating action button → "Craft"
2. Full-screen recipe browser
3. Tap recipe → confirm modal ("Craft 1x? [Yes] [Cancel]")
4. Progress shown as notification bar at top of screen
5. Completion vibration + toast

**Queue system** (desktop only in V1): Click "Craft x5" to queue multiple items; mobile supports single crafts only.

### Observing Bot Activity

**Status indicators visible in 3D world:**
- **Active/Working**: Green glow around bot, tool animation (drill spinning, arms moving)
- **Moving**: Bot tilts in direction of travel, wheels/treads rotate
- **Idle**: Amber pulse, bot looks around (head rotation animation)
- **Low Energy**: Red flash, bot moves slower, drooping posture
- **Blocked**: Bot stops, displays "?" icon above head (tap to see reason)

**Activity log** (desktop/tablet): Small scrolling text feed in bottom-left corner shows recent bot actions ("Bot #3 gathered 10 Wood", "Blueprint unlocked: Hauler Mk2"). Mobile version omits this (screen real estate).

**Selection feedback**: Selected bots have a glowing ring at their base, status tooltip above their head (name, task, energy %, progress bar for current task).

### Upgrade Feedback

When a bot is upgraded (new component or stat boost):

**Visual:**
- Upgrade animation: Bot spins, light burst, transforms to new appearance
- Comparison tooltip: "Speed: 1.0 → 1.5 (+50%)"
- New components visibly appear (new drill replaces old, new wheels, etc.)

**Audio:**
- Ascending chime (pitch stacks if upgrading multiple bots)
- Satisfying "click" when upgrade completes
- Bot emits unique sound on first action after upgrade (celebratory beep)

**Haptic** (mobile/tablet): Success vibration pattern (short-short-long)

### The First 60 Seconds

**Tutorial overlay** (first-time players, dismissible):

1. **0:00 - Welcome**: "Welcome to your meadow! Meet your first bot."
   - Camera focuses on starter bot
2. **0:10 - Task assignment**: "Tap the bot, then tap the glowing tree to gather wood."
   - Highlight bot → highlight tree → bot walks over and gathers
3. **0:25 - Resource collection**: "Watch your resources grow!"
   - Resource counter animates as wood accumulates
4. **0:40 - Crafting intro**: "You have enough wood! Tap 'Craft' to build a component."
   - Crafting panel opens, first recipe highlighted
5. **0:55 - Upgrade**: "Attach the component to your bot to make it faster!"
   - Bot customization panel opens, drag component to slot
6. **1:00 - Loop complete**: "Your bot is now better! Assign it to gather more."
   - Tutorial ends, player has experienced core loop

**No text walls** — each step is 1-2 sentences max, with visual highlights and arrows. Players can skip tutorial entirely ("I know how to play" button).

---

## 5. Accessibility

### Color-Blind Safe Resource Differentiation

Each resource type uses **color + shape + pattern**:

| Resource | Color | Shape | Pattern/Effect |
|----------|-------|-------|----------------|
| Wood | Brown | Cylindrical logs | Vertical grain lines |
| Stone | Gray | Angular chunks | Faceted surface |
| Iron Ore | Orange | Rough spheres | Metallic glints |
| Crystals | Magenta | Hexagonal prisms | Pulsing glow |
| Bio-matter | Lime | Blobby organic | Animated squirm |

**Status indicators** use symbols in addition to color:
- Active: Green + checkmark icon
- Idle: Amber + pause icon
- Blocked: Red + exclamation icon
- Low Energy: Red + battery icon

**Deuteranopia/Protanopia mode** (optional setting): Replaces red/green indicators with blue/yellow, increases contrast on resource icons.

### Minimum Touch Targets

All interactive elements on touch devices: **minimum 44×44px** (iOS Human Interface Guidelines standard)

- Bot roster icons: 56×56px
- Crafting recipe cards: 80×80px
- Bots in 3D world: 60px effective tap zone (even if visual is smaller)
- Floating action button: 56×56px

Tap zones extend beyond visual bounds when necessary (invisible padding).

### Keyboard Navigation for All Menus

- Tab: Cycle through interactive elements
- Enter: Activate selected button or panel
- Esc: Close modals, deselect
- Arrow keys: Navigate tech tree nodes, recipe grids
- Spacebar: Toggle panel open/close

**Focus indicators**: Blue outline on keyboard-focused elements (2px solid #3B82F6)

**Screen reader landmarks**: All panels use semantic HTML (`<nav>`, `<main>`, `<aside>`) and ARIA labels ("Bot roster", "Resource counter: Wood, 247 units").

### Reduced Motion Option

**Settings toggle**: "Reduce motion" (default off)

When enabled:
- Bot deploy animations become instant fade-in (no spin)
- Camera transitions become instant cuts (no smooth pan)
- Particle effects disabled
- Crafting progress bars use static fill (no animated shimmer)
- Upgrade animations skip to final state

Resource gathering animations persist (core gameplay feedback), but move slower.

### Screen Reader Support for HUD Elements

- **Resource counters**: "Wood: 247 units, increasing at 12 per minute"
- **Bot roster**: "Bot 1: Miner, Active, 80% energy, currently gathering iron ore"
- **Crafting recipes**: "Iron bar recipe: requires 5 iron ore and 2 wood. You have enough resources. Craft button."
- **Tech tree nodes**: "Upgrade: Advanced Sensors. Requires 100 iron bars and Research Node: Basic Electronics. Status: Locked."

Live regions announce bot status changes ("Bot 3 has completed gathering", "Crafting finished: Gear component").

---

## 6. Animation & Audio Direction

### Bot Animations

**Idle** (looping, 3-5 second cycle):
- Head rotates slowly (looks around)
- Slight "breathing" bob (2-3% scale pulse)
- Antenna sway
- Eye-lights blink every 4 seconds

**Working** (task-specific):
- **Mining**: Drill arm extends, rotates, retracts (1-second loop)
- **Gathering**: Arms reach out, scoop motion, retract with item (1.5-second loop)
- **Crafting**: Multi-arm manipulation, sparks or steam puffs (2-second loop)
- **Building**: Welding arm extends, arc flash effect, moves along structure (1.5-second loop)

**Carrying** (when moving with inventory):
- Torso tilts slightly forward (loaded posture)
- Cargo rack glows or items visible in arms
- Slower movement speed (70% of base)

**Celebrating** (on task completion, upgrade, or level-up):
- Quick bounce (0.3-second hop)
- Eye-lights brighten
- Antenna spring up
- Optional confetti particle burst (if not reduced motion mode)

**Low energy** (below 20%):
- Movement becomes jerky (stuttered animation)
- Posture droops (5° forward tilt)
- Eye-lights dim and flicker
- Slower overall playback speed (80%)

**All animations designed for visibility at distance** — exaggerated motion arcs, clear silhouette changes.

### Resource Gathering Effects

**On collection** (when bot picks up resource):
- **Particles**: Small burst of colored particles matching resource type (5-10 particles, 0.5-second lifespan)
- **Glow pulse**: Resource node dims slightly, bot glows briefly
- **Sound**: Pitched collection sound (see audio section)

**Resource node states:**
- **Full**: Bright, pulsing glow, full-size model
- **Depleted**: Dim, smaller model, cracked/withered appearance
- **Regenerating**: Gradual growth animation (1% per second), soft glow increases

**Conveyor/transport effects** (future, not V1):
- Visible resource items move along paths between bots
- Glowing trail effect shows flow direction

### Upgrade Effects

**When bot receives upgrade:**
- **Particle burst**: Radial explosion of light (1-second duration)
- **Model swap**: Instant transition to new component mesh
- **Glow ring**: Expanding ring at bot's base (0.5-second fade-out)
- **Sound**: Ascending chime stack

**When structure/workbench upgrades:**
- **Build animation**: Components assemble piece-by-piece (2-3 seconds)
- **Completion flash**: Bright pulse on final piece placement
- **Sound**: Mechanical assembly sounds, final "clunk" on completion

### Audio Cues

**Resource gathering** (pitch-stacking inspired by Slime Rancher):
- Each resource type has a base pitch (Wood: C4, Stone: E4, Iron: G4, Crystals: C5)
- When multiple bots gather simultaneously, pitches stack into a chord
- Each collection plays a 0.1-second pluck/chime
- Creates satisfying "musical factory" effect when many bots work in sync

**Crafting:**
- Crafting start: Mechanical "whirr" (1 second)
- Crafting loop: Ambient hammering, welding, or assembly sounds (subtle, 50% volume)
- Crafting complete: Satisfying "ding" + steam hiss

**Upgrades:**
- Upgrade applied: Ascending arpeggio (C-E-G-C over 0.5 seconds)
- Tech tree unlock: Futuristic "discovery" chime (major 7th chord)

**UI sounds:**
- Button click: Soft "tap" (wood block sound)
- Panel open/close: Gentle "whoosh"
- Error/invalid action: Subtle "bonk" (not harsh)
- Selection: Quiet "beep"

**Ambient meadow sounds** (looping, subtle):
- Light wind rustling grass (10% volume)
- Distant bird calls (occasional, 5% volume)
- Bot motors humming (scales with number of active bots, 15% volume)
- Water streams (if near water, 8% volume)

**Audio mixing:**
- SFX: 80% volume
- Ambient: 20% volume
- Music: 30% volume (optional BGM, looping calm electronica or lo-fi beats)

**Accessibility:**
- All critical feedback has visual equivalent (audio is enhancement, not requirement)
- Master volume slider + individual sliders for SFX, ambient, and music
- "Mute all" quick toggle

---

## Visual Standards

All progress indicators, status bars, and quantitative visualizations follow **ASCII-style patterns** per the shared visual formatting protocol:

**Progress bars:**
```
[████████░░] 80%
```

**Bot status:**
```
Bot #3 [Miner]
Energy: [██████░░░░] 60%
Task:   Gathering Iron [████░░░░░░] 40%
```

**Resource stockpile:**
```
Wood:    247 ↑ +12/min
Stone:   182 ↑ +8/min
Iron:     45 ↑ +3/min
```

Used in debug overlays, status tooltips, and API responses (not in primary HUD, which uses graphical bars).

---

This design section establishes the visual and interaction foundation for Agent-C Simulator V1: a charming, accessible, cross-platform 3D automation game where watching cute bots work is inherently satisfying.

---

## Ready for Engineering

**Priority**: High
**External Dependencies Validated**: Yes
**Tech Stack Validated**: Yes (see technical-assessment.md)
**Next**: `/mg-build`

---

*Product spec assembled from Product Owner, Product Manager, and Designer inputs. All design decisions are grounded in the research documents listed above.*
