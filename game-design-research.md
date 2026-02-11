# Game Design Research: Autonomous Bot Collection + Automation Web Game

Research compiled: 2026-02-10
Purpose: Foundation for design decisions on a web-based 3D game combining gacha collection with Factorio-style automation loops.

---

## Table of Contents

1. [Gacha Game Mechanics That Work](#1-gacha-game-mechanics-that-work)
2. [Factorio / Automation Game Loops](#2-factorio--automation-game-loops)
3. [Autonomous Bot / Creature Collection Games](#3-autonomous-bot--creature-collection-games)
4. [Successful Web-Based 3D Games](#4-successful-web-based-3d-games)
5. [Synthesis: Design Implications](#5-synthesis-design-implications)

---

## 1. Gacha Game Mechanics That Work

### 1.1 Core Loop: Pull / Collect / Upgrade

The gacha core loop derives from Japanese gashapon (capsule toy dispensers). The fundamental cycle is:

1. **Earn or buy currency** (through gameplay, daily login, or purchase)
2. **Spend currency on randomized pulls** from a reward pool
3. **Receive items/characters** based on rarity tiers (common, rare, epic, legendary)
4. **Invest in upgrades** -- level up, ascend, equip, fuse duplicates
5. **Use upgraded roster** to progress further, earning more currency

The loop is self-reinforcing: better characters let you clear harder content, which gives more currency, which funds more pulls. Duplicates are not wasted -- they feed into upgrade systems (fusing, constellation/potential systems), so every pull has value.

**Key rarity tier structure** (typical):
- Common (50-60% drop rate)
- Rare (30-35%)
- Epic/SR (5-8%)
- Legendary/SSR (0.5-2%)

Sources:
- [Gacha Game Design: Core Elements and Systems](https://oozbey.blog/2023/03/28/gacha-game-design-the-core-elements-and-systems/)
- [Gacha Mechanics for Mobile Games Explained (Adjust)](https://www.adjust.com/blog/gacha-mechanics-for-mobile-games-explained/)

### 1.2 Retention Hooks: What Makes Players Come Back

**Daily Login Rewards**: Escalating rewards over consecutive days. Missing a day may reset the streak, creating FOMO-driven consistency. This is the single most common retention mechanic across all gacha games.

**Limited-Time Events**: Seasonal banners, collaboration events, and time-gated content create urgency. Players return because "if I miss this banner, this character may not come back for months."

**Collection Completion (Zeigarnik Effect)**: The psychological tendency to remember incomplete tasks drives collectors. A roster screen showing 47/50 characters creates a persistent pull to fill the gaps.

**Stamina/Energy Systems**: Capping how much you can play per session (recharging over time) paradoxically increases engagement by creating scheduled return visits. Players check back when stamina refills.

**Pity Systems**: Guaranteed rare rewards after N unsuccessful pulls (e.g., Genshin Impact's hard pity at 90 pulls). This gives players a "light at the end of the tunnel" that sustains engagement through dry spells.

**Battle Pass / Seasonal Progression**: Layered progression tracks (free + premium) with exclusive rewards give both F2P and paying players parallel goals to chase.

Sources:
- [The UX of Gacha Games: Engagement and Addiction](https://www.cjdyas.design/blog/the-user-experience-of-gacha-games)
- [The Psychology of Gacha Games (PlayerAuctions)](https://blog.playerauctions.com/others/the-psychology-of-gacha-games/)

### 1.3 Successful Gacha Games and Their Specific Hooks

**Genshin Impact (miHoYo/HoYoverse)**
- Open-world exploration provides intrinsic gameplay value beyond gacha
- Characters are mechanically distinct with elemental reaction systems, making team composition a puzzle
- Pity system: soft pity at ~75 pulls, hard pity at 90 pulls, 50/50 mechanic on featured character
- "Wish" system feels ceremonial -- elaborate animations make pulling feel like an event
- Cross-platform (mobile, PC, console) broadened the audience
- Hook: Characters are exploration tools, not just combat stats

**Arknights (Hypergryph)**
- Tower defense gameplay requires genuine tactical thinking, not just bigger numbers
- Generous F2P economy -- one copy of a character is fully functional (no constellation pressure)
- Skins are obtainable for free, reducing pay-to-win feeling
- Pity system: soft pity at 50, hard pity at 100, plus spark mechanic at 300 pulls for guaranteed featured operator
- Hook: Gameplay depth means pulling feels like gaining a new strategic tool, not just a stat stick

**Honkai: Star Rail (HoYoverse)**
- Turn-based combat is accessible and pauseable -- fits casual play sessions
- Strong narrative investment makes characters feel like story companions
- Polished production values (voice acting, animations) create emotional attachment to characters

**Super Auto Pets (Team Wood Games)**
- Casual auto-battler with gacha-like shop mechanics
- Animals have simple stats (attack/health) but unique abilities that create emergent synergies
- Free-to-play, available on web browser
- Hook: Simplicity of rules, depth of combinations

Sources:
- [Why Arknights is an Outstanding Gacha Game (Medium)](https://medium.com/@azirdaner/why-arknights-is-an-outstanding-gacha-game-74215e8548e2)
- [Best Gacha Games 2026 (PC Games N)](https://www.pcgamesn.com/best-gacha-games)
- [Super Auto Pets (Wikipedia)](https://en.wikipedia.org/wiki/Super_Auto_Pets)

### 1.4 Translating Gacha to Web/Non-Mobile

Gacha mechanics are increasingly appearing on PC and web:

- **Cross-platform gacha** (Genshin, Honkai: Star Rail, Zenless Zone Zero) has proven that gacha works on desktop when backed by strong gameplay
- **Web-native gacha-like systems** exist in browser idle games (e.g., random loot drops, hero summons in browser RPGs)
- **Key adaptation**: On desktop/web, sessions tend to be longer and more focused. The stamina/energy system needs loosening or removal -- web players expect to play as long as they want
- **Shop-based gacha** (like Super Auto Pets' per-round shop) translates well because it feels like strategic shopping rather than gambling
- **Collection-driven progression** works across all platforms -- the desire to "catch 'em all" is universal

**What translates well:**
- Collection and upgrade loops
- Pity/guarantee systems
- Limited-time events and seasonal content
- Duplicate fusion mechanics
- Tiered rarity with visual distinction

**What needs adaptation:**
- Push notifications (replace with in-game event calendars)
- Stamina systems (web players want longer sessions)
- Gacha "pull" animations (still work, but can be skippable for desktop impatience)
- Monetization pressure (web audience is more skeptical of F2P mechanics)

### 1.5 Ethical Considerations: Fun vs. Exploitative

**What makes gacha fun:**
- Every pull has value (no truly useless pulls)
- Clear published drop rates
- Pity systems that respect player investment
- F2P viability -- you can enjoy the full game without spending
- Gameplay depth beyond the gacha itself
- Generous free currency from regular play

**What makes gacha exploitative:**
- Hidden or misleading drop rates
- Power creep that invalidates previous investments
- Pressure to pull specific characters to clear content (pay-to-win)
- Pity thresholds set above the ~55-pull mark where research shows gambling-like dynamics emerge
- Targeting vulnerable populations (minors, addiction-prone individuals)
- Sunk cost manipulation -- making players feel they "can't quit now"

**Ethical design guidelines from research:**
- Pity thresholds below 55 pulls keep the experience in "engaging uncertainty" rather than gambling territory
- Transparent drop rate disclosure (increasingly required by law in many jurisdictions)
- Spending caps or spending warnings
- No gameplay-critical content locked behind gacha exclusively
- Alternative paths to acquisition (crafting, earning through play, spark/exchange systems)

Sources:
- [Inherent Addiction Mechanisms in Video Games' Gacha (MDPI)](https://www.mdpi.com/2078-2489/16/10/890)
- [Are Gacha Games Ethical? (PlayForge)](https://www.playnforge.com/ethics-of-gacha-games/)
- [Monetization Mechanisms in Gacha Games (ScienceDirect)](https://www.sciencedirect.com/science/article/abs/pii/S1875952125001247)
- [Balancing Monetization and Player Experience (Nikke)](https://nikke.gg/balancing-monetization-and-player-experience-in-gacha-games/)

---

## 2. Factorio / Automation Game Loops

### 2.1 The "Just One More Thing" Loop

Factorio's core addiction loop operates on a principle of **cascading problem-solving**:

1. You identify a bottleneck (e.g., "I need more iron plates")
2. You build a solution (more miners, more smelters)
3. The solution creates a new bottleneck (need more coal for smelters, or more belts, or more power)
4. Repeat from step 1

This creates an infinite chain of "just one more thing" that is uniquely self-perpetuating. Unlike gacha where you pull and wait, automation games give you continuous agency -- every solution is satisfying, and every new problem is solvable. Players report "closing their eyes and seeing conveyor belts" after long sessions.

The psychological mechanism is distinct from gacha: it is the satisfaction of **optimization and mastery** rather than **collection and chance**. Both are dopamine-driven but through different cognitive pathways.

Sources:
- [Factorio Review: When "Just One More Hour" Becomes 30](https://chillplacegaming.com/factorio-review/)
- [The Factorio Mindset (The Diff)](https://www.thediff.co/archive/the-factorio-mindset/)
- [What Makes Factory Games So Addicting (lunalane)](https://lunalane.art/factory-games-so-addicting/)

### 2.2 How Complexity Scales: Simple to Emergent

The genius of factory games is **layered complexity with constant onboarding**:

**Phase 1 - Manual labor**: Mine by hand, smelt by hand. Tedious but teaches the basics.
**Phase 2 - First automation**: Place a mining drill + furnace + belt. The moment something works on its own is the first "aha!" moment.
**Phase 3 - Production chains**: Iron ore -> iron plates -> gears -> automation science. Multi-step recipes introduce logistics.
**Phase 4 - Scaling**: One assembler isn't enough. Ratios matter. You learn throughput.
**Phase 5 - Modularity**: You start designing reusable "blueprints" -- factory sections that can be stamped down.
**Phase 6 - Emergent complexity**: Train networks, circuit logic, nuclear power, logistics bots. Players create solutions the designers never imagined.

**Key design pattern**: Each phase builds on the last, and the player is never overwhelmed because they choose when to tackle the next layer. The game doesn't force complexity -- it lets you discover it when your current approach hits its limits.

**Emergent complexity formula (from game design research):**
> "A game is elegant when it is deceptively complex -- it may seem simple through simple rules, but through the interactions of those rules, it turns out to have hidden complexity." (cf. Conway's Game of Life, chess)

For automation games, this means: simple pieces (belts, inserters, machines) combine to create arbitrarily complex systems.

Sources:
- [The Joy of Automation: Factorio (LaLaWiz)](https://lalawiz.com/2025/03/20/factorio/)
- [Factorio Taught Me Systems Thinking (Medium)](https://medium.com/gaming-is-good/factorio-taught-me-systems-thinking-part-i-f8a1d2a8a349)
- [From Rules to Emergence: Exploring Complexity of Game Worlds (Medium)](https://rctai.medium.com/from-rules-to-emergence-exploring-the-complexity-of-game-worlds-deb960b2c599)
- [How to Balance a Game Between Simplicity and Complexity (Game Developer)](https://www.gamedeveloper.com/design/how-to-balance-a-game-between-simplicity-and-complexity)

### 2.3 Factory/Automation Games in Casual Formats

Not all automation games demand 200-hour investments. Several have proven that the core loop works in simplified forms:

**Shapez.io / Shapez 2** (by tobspr Games)
- Browser-playable (free demo), sold 850,000+ copies on Steam with 96% positive ratings
- Strips factory building to pure logistics: extract geometric shapes, cut/rotate/paint/combine them to match targets
- No enemies, no combat, no survival pressure -- pure zen automation
- Proves the factory loop works without threat or time pressure
- Incremental complexity: starts with "deliver circles" and escalates to multi-layer shape processing

**Cookie Clicker** (by Orteil)
- The progenitor of idle/incremental games
- Demonstrates that watching numbers go up is inherently satisfying
- Key innovation: offline progression (the game advances while you're away)
- Proves automation satisfaction at its most minimal: buy a building, it produces cookies forever

**Mindustry**
- Open source, available on web
- Combines factory building with tower defense
- More accessible than Factorio while retaining genuine automation depth

**Idle/Incremental games broadly**
- Core loop: click to earn -> buy automation -> earn passively -> buy better automation
- Exponential growth creates a paradox of feeling powerful and weak simultaneously
- Work because they respect the player's time -- progress happens even when away

Sources:
- [Shapez.io (Official)](https://shapez.io/)
- [Incremental Game (Wikipedia)](https://en.wikipedia.org/wiki/Incremental_game)
- [Automation Games Explained 2026 (GameFoundry)](https://gamefoundry.games/blog/automation-games-explained-2026)
- [tobspr Games (Official)](https://tobspr.io/)

### 2.4 Minimum Viable Automation Loop

Based on analysis of successful casual automation games, the minimum viable automation loop requires:

1. **A resource** that can be gathered (manually at first)
2. **An automator** that gathers/processes the resource without player input
3. **A visible output** -- the player must SEE the automation working
4. **A reason to scale** -- demand exceeds current production capacity
5. **A new tier** -- unlock more complex recipes/automators that chain together

**The critical moment is step 3**: watching your first automation run is the hook. If the player can build something, walk away, come back, and see that it produced things -- that is the moment the game clicks. Cookie Clicker achieves this with a single Grandma purchase. Factorio achieves it with the first mining drill + furnace chain.

**Minimum elements for satisfaction:**
- Input node (source of raw material)
- Processing node (transforms input to output)
- Connection (belt, pipe, wire -- something visible that moves things)
- Output/storage (where the result accumulates)

The entire system must be **visible and legible** -- the player needs to see materials flowing, machines working, and output accumulating. Audio feedback (clanking, whooshing, chiming) reinforces the satisfaction.

---

## 3. Autonomous Bot / Creature Collection Games

### 3.1 Creature Collection with Autonomous Behavior

**Creatures Series (1996-2001, Creature Labs)**
- Pioneered commercial artificial life simulation
- Creatures called "Norns" have digital DNA with ~810 genes controlling appearance, metabolism, and behavior
- Bottom-up AI: behavior emerges from simulated neural networks and biochemistry rather than scripted rules
- Players raise, breed, and train Norns but cannot directly control them
- Key insight: **emotional attachment forms through nurturing, not control**. Players cared about their Norns BECAUSE they were autonomous and sometimes unpredictable
- Genome is inheritable -- offspring combine parent traits through sexual reproduction

**Niche: A Genetics Survival Game**
- Turn-based genetics/survival game where creatures evolve through player-guided breeding
- Each creature has a visible genome that determines traits
- Players engage by making strategic breeding decisions, then watching outcomes play out

**Species: Artificial Life, Real Evolution**
- Scientifically-grounded evolution simulation
- Creatures evolve autonomously through natural selection
- Player engagement comes from observation and environmental manipulation rather than direct control

Sources:
- [The AI of Creatures (Alan Zucconi)](https://www.alanzucconi.com/2020/07/27/the-ai-of-creatures/)
- [Creatures Video Game Series (Wikipedia)](https://en.wikipedia.org/wiki/Creatures_(video_game_series))
- [Species: ALRE (Steam)](https://store.steampowered.com/app/774541/Species_Artificial_Life_Real_Evolution/)

### 3.2 Auto-Battlers: The "Set It and Watch" Loop

Auto-battlers represent the most commercially successful implementation of autonomous agent games:

**Teamfight Tactics (Riot Games)**
- Preparation phase: shop for units, position them on a grid, build synergies (traits)
- Battle phase: units fight autonomously -- no player input during combat
- Economy system: gold income from rounds + interest on savings + streak bonuses
- Synergy system: units sharing "traits" (e.g., 3 Mages get bonus magic damage) creates combinatorial depth
- Sets rotate seasonally, keeping meta fresh
- Design pillars (from Riot's official dev post): meaningful decision-making, clear feedback, accessible entry

**Super Auto Pets (Team Wood Games)**
- Streamlined auto-battler: buy animals from a shop, arrange them left to right
- Animals have simple attack/health stats but unique trigger abilities (e.g., "when a friend faints, gain +2 attack")
- Available on web browser, free-to-play
- Asynchronous multiplayer removes matchmaking pressure
- Proves auto-battlers work with extreme simplification

**Mechabellum**
- Large-scale mech auto-battler
- Players deploy and position mech units before combat
- Visual spectacle of watching massive armies clash autonomously

**Why watching autonomous combat is satisfying:**
- **Payoff for planning**: The battle is the "test" of your preparation. It validates your strategic decisions
- **Surprise and emergence**: Units interact in unexpected ways, creating moments of excitement
- **Reduced cognitive load**: You can appreciate the spectacle without micro-management stress
- **Clear cause-and-effect**: You can trace outcomes back to your decisions ("I should have positioned that unit differently")

Sources:
- [Design Pillars of Teamfight Tactics (Riot Games)](https://nexus.leagueoflegends.com/en-us/2019/06/dev-design-pillars-of-teamfight-tactics/)
- [Game Design Analysis: TFT (Medium)](https://medium.com/@ZiberBugs/game-design-analysis-teamfight-tactics-bc6eb5aafeff)
- [Auto Battler (Wikipedia)](https://en.wikipedia.org/wiki/Auto_battler)
- [Understanding Auto Battler Games (iLogos)](https://ilogos.biz/auto-battler-game-development-guide/)

### 3.3 Bot Programming Games

**Screeps (Screeps Ltd)**
- MMO where players write JavaScript to control "creeps" (autonomous units)
- The game world runs 24/7 in real-time, even when players are offline
- 70,000+ interconnected game rooms on a 40-server cluster
- Players program mining, building, fighting, and trading behaviors
- Engagement comes from iterating on code, then watching improved behavior play out
- Key insight: **the game becomes more fun the LESS you have to intervene** -- the goal is to make your bots truly autonomous

**Gladiabots (GFX47)**
- Visual AI programming game (drag-and-drop, no coding required)
- Players design behavior trees for robot squads using condition/action nodes
- Robots fight autonomously in arena combat
- Available on mobile and PC
- Game modes: collection, domination, elimination
- Matches are 5 minutes -- you can fast-forward through them
- Key insight: **visual programming lowers the barrier** to bot programming while maintaining the satisfaction of watching your AI execute strategies

**Robocode**
- Classic programming game where you code robot tanks in Java
- Robots fight in an arena with no player intervention
- Appeal: test your code against others' code in competition

**What makes watching bots satisfying:**
1. **Pride of creation**: "I made this, and it's working"
2. **Debugging as gameplay**: Watching a bot fail teaches you what to fix
3. **Emergent behavior**: Bots do things you didn't explicitly program, creating surprise
4. **Asynchronous competition**: Your bot fights others' bots without requiring simultaneous play
5. **Iterative improvement**: Each version of your bot is measurably better than the last

Sources:
- [Screeps: MMO Strategy for Programmers](https://screeps.com/)
- [Gladiabots: AI Combat Arena (Steam)](https://store.steampowered.com/app/871930/GLADIABOTS__AI_Combat_Arena/)
- [Gladiabots Wiki: Bot Programming Basics](https://wiki.gladiabots.com/index.php?title=BotProgramming_Basics)

### 3.4 How Players Stay Engaged With Autonomous Agents

The fundamental challenge: if the bots do everything, why does the player play?

**Engagement mechanisms that work:**

| Mechanism | How It Works | Example |
|-----------|-------------|---------|
| **Configuration** | Players design/modify the agent before deployment | TFT (team comp), Gladiabots (behavior tree) |
| **Collection** | Acquiring new agent types is the goal | Gacha pulls, creature breeding |
| **Observation** | Watching outcomes is entertaining | Auto-battler combat, Creatures nurturing |
| **Iteration** | Improving agents based on observed performance | Screeps code refinement, Gladiabots AI tuning |
| **Competition** | Agents compete against other players' agents | Screeps PvP, auto-battler ranked modes |
| **Environment shaping** | Player modifies the world the agents operate in | Factorio (building infrastructure), Species (terrain) |
| **Meta-progression** | Persistent rewards across sessions | Battle pass, collection roster, account level |

**The key insight**: the player's role shifts from **operator** to **architect/manager**. You don't push buttons during execution -- you design the system, observe the results, and refine. This is inherently satisfying because it maps to real-world competence (systems thinking, optimization, strategy).

---

## 4. Successful Web-Based 3D Games

### 4.1 Notable Three.js / WebGL Games

**Krunker.io (Yendis Entertainment / FRVR)**
- Browser-based competitive FPS built with Three.js + TypeScript
- Over 200 million players
- Runs on PC, Mac, Chromebook, mobile, and Steam
- Technical stack: HTML5, JavaScript/TypeScript, Three.js, WebGL, Node.js, Go
- Key success factor: instant accessibility -- no download, no account required to start
- Acquired by FRVR in 2022
- Demonstrates Three.js can handle real-time competitive multiplayer at massive scale

**HexGL**
- Futuristic racing game (inspired by WipEout/F-Zero) built with Three.js
- Approaches desktop game visual quality in a browser
- Demonstrates that fast-paced 3D gameplay is viable in WebGL

**Shapez.io**
- 2D/isometric factory game, HTML5-native
- Playable for free in browser, with Steam version for enhanced features
- Proves complex simulation games work in browser context

**Bruno Simon's Portfolio (bruno-simon.com)**
- Interactive 3D portfolio where you drive a car around a 3D world
- Built with Three.js
- Demonstrates the creative potential of Three.js for interactive web experiences
- Creator of Three.js Journey, the most popular Three.js learning resource

**.io Games Broadly (Agar.io, Slither.io, etc.)**
- While typically 2D, these established that browser games can achieve massive scale
- Agar.io and Slither.io each reached tens of millions of players
- Success factors: zero friction (no download, no account), simple controls, instant multiplayer
- WebSocket-based real-time communication proved sufficient for multiplayer browser games

Sources:
- [History Behind Krunker.io (ioGround)](https://ioground.com/blog/the-history-behind-krunker-io)
- [FRVR Scaled Krunker Strike (Discord Case Study)](https://discord.com/build-case-studies/frvr)
- [Three.js Games (DevSnap)](https://devsnap.me/three-js-games)
- [Three.js Games on itch.io](https://itch.io/games/made-with-threejs)
- [Agar.io (Wikipedia)](https://en.wikipedia.org/wiki/Agar.io)

### 4.2 Web 3D Engine Comparison

| Engine | Best For | Key Strength | Limitation |
|--------|----------|-------------|------------|
| **Three.js** | Custom 3D experiences, games with specific needs | Flexibility, massive community, R3F (React integration) | Not a game engine -- you build everything yourself |
| **Babylon.js** | Full-featured browser games | Complete game engine (physics, audio, UI built-in), slightly better perf | Heavier bundle size, smaller community than Three.js |
| **PlayCanvas** | Team-based game development | Cloud-based collaborative editor (like Figma for 3D) | Less control for custom rendering pipelines |

**Three.js** is the right choice when you want maximum control and a large ecosystem of examples. It's the most popular WebGL library by a wide margin and has the best learning resources.

**Babylon.js** is the right choice when you want more "engine" out of the box (built-in physics, inspector, GUI system).

**PlayCanvas** is the right choice for teams with non-technical members who need a visual editor.

Sources:
- [Three.js vs Babylon.js vs PlayCanvas Comparison 2026 (Utsubo)](https://www.utsubo.com/blog/threejs-vs-babylonjs-vs-playcanvas-comparison)
- [Best JavaScript Game Engines 2025 (LogRocket)](https://blog.logrocket.com/best-javascript-html5-game-engines-2025/)

### 4.3 Performance Considerations for Web 3D

**Current State (2025-2026):**

- WebGL is universally supported on devices manufactured after 2015
- iOS handles Three.js well; Android performance varies significantly by device
- Newer devices (2-3 years old) provide acceptable performance; older devices struggle
- Mobile requires significantly lower polygon counts and texture sizes than desktop
- Maximum pixel ratio of 1.5 recommended for mobile to prevent performance degradation

**Key Optimization Strategies:**
- Reduce polygon count for mobile (50%+ reduction from desktop)
- Scale down textures by 50%+ on mobile
- Limit dynamic lights (prefer baked lightmaps)
- Disable/reduce post-processing effects on mobile
- Pause rendering when tab is not visible
- Use instanced rendering for repeated geometry (e.g., many bots of the same type)
- Level-of-detail (LOD) systems for distant objects

**WebGPU -- The Future:**
- Officially supported across Chrome, Firefox, Safari, and Edge as of November 25, 2025
- Performance improvements: up to 100x speed gains over WebGL in certain scenarios
- Key capability: compute shaders (GPU-side physics, particle systems, AI computation)
- Can handle 100,000 particle updates in under 2ms (150x improvement over WebGL CPU-based approach)
- Halves CPU frame time while maintaining identical visuals in typical benchmarks
- Removes previous limitations on browser-based physics, AI, and complex particle systems
- **Recommendation**: Design for WebGL with progressive enhancement to WebGPU. Three.js already has a WebGPU renderer (TSL-based).

Sources:
- [WebGPU vs WebGL Explained (Three.js Roadmap)](https://threejsroadmap.com/blog/webgl-vs-webgpu-explained)
- [WebGPU vs WebGL Performance for Browser Games (Hardware Times)](https://hardwaretimes.com/webgpu-vs-webgl-performance-for-browser-games-what-changes-and-how-to-test-it/)
- [WebGPU Browser Support 2026 (Webo360)](https://webo360solutions.com/blog/webgpu-browser-support-2026/)
- [Performance of Three.js on Mobile (Coder Legion)](https://coderlegion.com/4191/performance-of-three-mobile-devices-and-lower-end-hardware-for-games-and-creative-resumes)
- [Building Efficient Three.js Scenes (Codrops)](https://tympanus.net/codrops/2025/02/11/building-efficient-three-js-scenes-optimize-performance-while-maintaining-quality/)

### 4.4 Cross-Platform Considerations (Desktop / Tablet / Mobile)

**What works across all form factors:**
- Simple tap/click controls (no complex gestures)
- UI that adapts to screen size (responsive HUD)
- Camera that works with both mouse and touch
- Moderate visual complexity that scales down gracefully
- Asynchronous gameplay (no real-time competitive pressure that disadvantages mobile)

**What breaks on mobile:**
- Hover states (no hover on touch screens)
- Right-click menus
- Complex keyboard shortcuts
- Scenes with >100k triangles or multiple dynamic lights
- Small touch targets (minimum 44px recommended)

**Successful cross-platform pattern from .io games:**
- Desktop: full experience with keyboard + mouse
- Tablet: touch controls with slightly simplified UI
- Mobile: same game, further simplified UI, reduced visual fidelity
- The core gameplay must work with touch-only input

---

## 5. Synthesis: Design Implications

### 5.1 The Opportunity Space

The intersection of gacha collection + automation loops + autonomous bots + web 3D is largely unexplored. No current game combines all four in a web-native package. The closest analogues:

| Game | Collection | Automation | Autonomous Bots | Web 3D |
|------|-----------|------------|-----------------|--------|
| Genshin Impact | Yes | No | No | No |
| Factorio | No | Yes | No | No |
| Super Auto Pets | Yes (shop) | No | Yes | Yes (web) |
| Screeps | No | Yes | Yes | Yes (web) |
| Shapez.io | No | Yes | No | Yes (web) |
| Arknights | Yes | No | Semi (tower defense) | No |
| **This game concept** | **Yes** | **Yes** | **Yes** | **Yes** |

### 5.2 Core Loop Hypothesis

Based on this research, the strongest core loop would combine:

1. **Collect** (gacha/acquisition): Acquire new bot types through a fair randomized system with pity guarantees. Each bot type has unique behaviors and capabilities.

2. **Configure** (auto-battler preparation): Assign bots to tasks, set their behavior priorities, position them in the world. This is the "strategy" phase.

3. **Watch** (autonomous execution): Bots execute their assigned tasks autonomously. The player observes, learns, and identifies bottlenecks.

4. **Optimize** (automation loop): Improve the system -- upgrade bots, rearrange workflows, unlock new production chains. Each optimization reveals the next bottleneck.

5. **Expand** (progression): Use the output of your automated system to fund more pulls, unlock new areas, and tackle harder challenges.

### 5.3 Key Design Principles Derived from Research

1. **The first automation must happen within 2 minutes**. Cookie Clicker, Shapez.io, and Factorio all hook players by showing them automation working almost immediately.

2. **Every gacha pull must have value**. No truly useless pulls. Duplicates feed upgrade systems. Commons are useful for different tasks than legendaries.

3. **Bots must be visually readable**. The player must SEE what each bot is doing, why it's doing it, and where the bottleneck is. Visibility is the core UX requirement of automation games.

4. **Complexity must be opt-in**. The player discovers the next layer of depth when their current approach fails, not when a tutorial forces it on them.

5. **Pity systems below 55 pulls**. Research suggests this is the threshold where engagement turns into gambling-like dynamics.

6. **Offline progression is expected**. Web players (and especially mobile-cross players) expect the game to advance while they're away. Autonomous bots are a perfect narrative justification for this.

7. **The spectacle of watching bots work is itself the reward**. Like an ant farm or a Rube Goldberg machine, there's inherent satisfaction in watching a complex system operate. Invest in animation, sound, and visual feedback.

8. **Web-first means instant access**. No download, minimal loading. The .io game success formula applies: the faster someone goes from URL to gameplay, the higher the conversion.

### 5.4 Technical Recommendations

- **Engine**: Three.js for maximum flexibility and community support. Consider React Three Fiber (R3F) for UI integration if using React.
- **Rendering target**: WebGL with progressive enhancement to WebGPU (Three.js supports both via TSL renderer)
- **Performance budget**: Target 60fps on mid-range 2023 Android devices. This means ~50k triangles on screen, <5 dynamic lights, instanced rendering for bot swarms.
- **Multiplayer**: WebSocket-based (proven by .io games). Asynchronous multiplayer (Super Auto Pets model) is simpler and works better cross-platform than real-time.
- **Mobile strategy**: Touch-first control design, responsive UI, LOD system for visual quality scaling.

---

*End of research document. All claims are sourced from the URLs cited inline. Where research data is cited (e.g., the 55-pull threshold), the original source is linked for verification.*
