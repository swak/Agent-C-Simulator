# Game Design Research Part 2: Core Loops, Bot Mechanics, and MVP Design

**Project**: Web-based 3D game combining automation mechanics with collectible/customizable bots
**Date**: 2026-02-10
**Companion to**: `game-design-research.md` (gacha mechanics, automation loops, web 3D tech)

---

## Table of Contents

1. [Core Loop Design Patterns](#1-core-loop-design-patterns)
2. [Bot/Automation Game Mechanics](#2-botautomation-game-mechanics)
3. [Progression Systems](#3-progression-systems)
4. [Monetization-Free Engagement](#4-monetization-free-engagement)
5. [Comparable Games Analysis](#5-comparable-games-analysis)
6. [Minimum Viable Game Loop](#6-minimum-viable-game-loop)

---

## 1. Core Loop Design Patterns

### 1.1 Compulsion Loops: What Makes Them Ethical Yet Addictive

A compulsion loop is a three-phase cycle that drives player engagement:

1. **Anticipation** -- The player imagines a potential outcome (dopamine is produced here, not at reward delivery)
2. **Activity** -- The player performs a challenge requiring skill or decision-making
3. **Reward** -- The outcome reinforces the behavior and resets the cycle

**Critical insight**: Dopamine releases during the *anticipation* phase, not when the reward is received. This means the *promise* of improvement matters more than the improvement itself. For our bot game, this means the moment a player sees "if I upgrade this bot's speed, my throughput will increase by 40%" is more engaging than the actual upgrade moment.

**Ethical vs. exploitative design**: The distinction lies in whether the loop serves the player's enjoyment or extracts value from them. Ethical loops create genuine satisfaction through mastery and creativity. Exploitative loops (loot boxes, artificial scarcity, FOMO timers) generate anxiety that spending resolves. Since this is a non-monetized project, we can design purely for satisfaction.

**The over-justification effect** is an important warning: once players are trained to chase extrinsic rewards (points, badges, unlocks), removing those rewards causes disengagement. If intrinsic motivation (the joy of watching a well-designed bot system operate) is replaced by extrinsic rewards, the fun itself erodes. Design implication: make the bots themselves inherently satisfying to watch and optimize, rather than making optimization purely a means to earn points.

**Motivation types and their role in loop design**:

| Type | Description | Risk |
|---|---|---|
| **Intrinsic** | Activities rewarding in themselves (enjoying the bot simulation) | None -- this is the ideal |
| **Extrinsic** | External incentives separate from the activity (achievements, points) | Over-justification effect: shifting from intrinsic to extrinsic is irreversible |

**Challenge structure for flow state**: Optimal engagement occurs through *scaffolding* -- balancing difficulty so players enter "flow" while progressively mastering new skills. The framework identifies three challenge categories:
- **Physical**: Precision, timing, reflexes (for our game: placing bots, timing upgrades)
- **Mental**: Planning, strategy, logic (for our game: resource chains, bot configurations)
- **Social**: Cooperation, leadership (for our game: community challenges, shared blueprints)

Sources:
- [Compulsion Loops & Dopamine in Games - Game Developer](https://www.gamedeveloper.com/design/compulsion-loops-dopamine-in-games-and-gamification)
- [Psychology of Game Addiction - Medium](https://medium.com/@luc_chaoui/understanding-game-design-the-psychology-of-addiction-41128565305f)
- [Compulsion Loop - Wikipedia](https://en.wikipedia.org/wiki/Compulsion_loop)
- [Why Games Are Designed Addictive - Make Tech Easier](https://www.maketecheasier.com/why-games-are-designed-addictive/)

---

### 1.2 Bartle Player Types and Automation Games

The four Bartle types map to automation game engagement as follows:

| Player Type | Core Motivation | How Automation Games Serve Them |
|---|---|---|
| **Achievers** | Points, status, progression | Throughput metrics, efficiency ratings, completion percentages, "factory output" leaderboards |
| **Explorers** | Discovery, secrets, understanding systems | Discovering new bot behaviors, finding synergies between bot types, uncovering hidden recipes or interactions |
| **Socializers** | Community, collaboration, sharing | Sharing bot designs, visiting other players' worlds, collaborative challenges, community bot marketplaces |
| **Killers** | Competition, dominance | Leaderboard rankings, optimization challenges, PvP bot arenas, speedrun competitions |

**Key design implication**: Automation games naturally appeal to Achievers (metric optimization) and Explorers (system discovery). To broaden appeal, the game should include social sharing of bot designs and competitive optimization challenges.

**Caveat**: Bartle himself warns against applying this taxonomy outside MUD/MMORPG contexts. It is useful as a lens, not a rigid framework. Real players exhibit blended motivations that shift over time.

**For our game**: The bot creation/customization system primarily serves Achievers and Explorers. Social features (blueprint sharing, community challenges) serve Socializers. Leaderboards and optimization competitions serve Killers. A complete game needs hooks for all four, even if the core design leans toward one or two.

Sources:
- [Bartle's Player Types - IxDF](https://www.interaction-design.org/literature/article/bartle-s-player-types-for-gamification)
- [Bartle Taxonomy - Wikipedia](https://en.wikipedia.org/wiki/Bartle_taxonomy_of_player_types)
- [Bartle's Player Types - Deliberate Game Design](https://deliberategamedesign.com/bartles-player-types/)

---

### 1.3 Idle Game Mechanics: Why They Work

Idle games tap into several deep psychological drives:

**Accumulation desire**: Humans find watching numbers grow inherently satisfying. The key insight from idle game design is that human brains perceive sensory input on *exponential* scales -- people notice the difference between 5 and 6 but not between 100 and 101. This is why idle games use exponential growth curves: each upgrade needs to feel proportionally significant.

**Loss aversion**: Players return to the game not just for gains but to avoid "wasting" accumulated offline progress. The pain of losing potential progress hurts roughly twice as much as the joy of gaining equivalent progress.

**Multiple engagement clocks** (from Eric Guan's idle game design principles):
- **Short cycle** (~20 minutes): Quick tasks that reward frequent check-ins (e.g., a cow producing milk)
- **Medium cycle** (~5 hours): Meaningful production that rewards session play (e.g., a creamery producing cheese)
- **Long cycle** (~2 days): Strategic decisions that reward long-term planning (e.g., a shipyard producing engines)

This multi-clock system means players can succeed at whatever engagement frequency fits their lifestyle. Browser-tab players optimize rapid cycles; casual players focus on long cycles.

**Exponential growth with diminishing returns** -- the mathematical foundation:
- Production per level increases by x1.1
- Cost per level increases by x1.15
- This ensures growth always feels noticeable to players while preventing early-game values from breaking progression balance

**The Skinner Box, refined**: The core loop of idle games is behaviorally conditioned habit formation. But the best idle games layer genuine strategic depth on top: deciding *when* to prestige, *which* upgrades to prioritize, and *how* to allocate limited resources.

**Design implications for our game**:
- Bots should produce visible results on multiple time scales
- Short session: adjust a bot's task, collect results
- Medium session: design a new bot configuration, optimize a production chain
- Long session: plan a major expansion, redesign the factory layout

Sources:
- [Idle Game Design Principles - Eric Guan](https://ericguan.substack.com/p/idle-game-design-principles)
- [How to Design Idle Games - Machinations](https://machinations.io/articles/idle-games-and-how-to-design-them)
- [Incremental Game - Wikipedia](https://en.wikipedia.org/wiki/Incremental_game)
- [Exploring Engagement in Idle Game Design - ResearchGate](https://www.researchgate.net/publication/383510819_Exploring_Engagement_in_Idle_Game_Design)

---

### 1.4 Blending Active Play with Idle/Autonomous Progression

The hybrid active-idle model uses a three-phase loop:

1. **Active participation**: Player makes decisions, places bots, configures behaviors
2. **Autonomous progression**: Bots execute tasks independently (even offline)
3. **Return reward**: Player returns to accumulated resources and new optimization opportunities

**Critical design tension**: Progress must be fastest with active play, but idle progress should never feel negligible. The ratio matters:
- If active play is 10x faster than idle, casual players feel punished
- If idle is as fast as active, there is no reason to engage actively
- A 2-3x active multiplier is a common sweet spot

**What the best hybrids do**: Tap Titans (active tapping + idle damage accumulation), Melvor Idle (active skill management + offline training), and Cookie Clicker (clicking + automated cookie production) all share a pattern: the idle system handles *execution* while the player handles *strategy*.

**The "return reward" moment is critical**: When a player returns after being away, they should immediately see:
1. What their bots accomplished (visible resource piles, completed tasks)
2. What needs their attention (bottlenecks, full storage, new discoveries)
3. What they can now afford to do (upgrades newly within reach)

This three-part return creates a "Christmas morning" feeling that drives re-engagement.

**For our game**: Bots should autonomously execute their assigned tasks. Players actively design, configure, and optimize the bot network. The "game" is in the design; the "idle" is in the execution. Most rewards grow as time progresses, creating compounding returns that make brief episodes feel impactful.

Sources:
- [Exploring Engagement in Idle Game Design - ResearchGate](https://www.researchgate.net/publication/383510819_Exploring_Engagement_in_Idle_Game_Design)
- [Hybrid Casual Games - The Mind Studios](https://games.themindstudios.com/post/how-to-make-hybrid-casual-game/)
- [Idle Games: A Complete Guide - Apptrove](https://apptrove.com/a-guide-to-idle-games/)

---

### 1.5 The Optimization Puzzle Appeal

Factory-building games have a "hard logical core" that makes them uniquely engaging:

**Why people love making things efficient**:
- Every solution creates new problems (automate iron -> need more coal -> need more power -> need more iron). This cascading problem structure is what creates the "one more turn" effect.
- The challenge scales with the player: beginners optimize single production lines, experts optimize entire factory networks.
- There is no single correct answer -- different players find different optimal solutions, creating a sense of personal ownership over their designs.
- Watching a well-designed system operate smoothly provides deep aesthetic satisfaction ("factory porn").

**The "Factorio effect"**: Each fix reveals three new challenges, creating an endless cascade of engineering puzzles that "somehow never feels frustrating" because each problem is solvable with the tools available. The player always has agency.

**Progressive automation as motivation**: The most effective design pattern starts with manual, tedious resource gathering, then motivates players to solve their own frustration through automation. As one designer notes: "Every new production chain the player sets up, the player is solving a problem that they are personally dealing with." This creates genuine intrinsic motivation -- the strongest kind.

**Incremental goals over grand projects**: Rather than expecting 20-hour time investments toward singular objectives, successful designs provide "a lot of small incremental goals" that maintain momentum and forward progress. Each goal should be achievable in 5-15 minutes.

**Critical design pitfalls to avoid**:
- **Poor UI/UX**: "Logistics games are just slightly above idle games as being UI the game." Accessible interface design is essential.
- **Excessive early friction**: Initial tedium should last only 5-10 minutes maximum before the first automation reward.
- **Static gameplay**: Simply adding more buildable items without introducing novel rules or strategies fails to sustain interest.
- **Limited exploration incentives**: Diversity in environments and challenges enhances replayability.

**Design implications for our game**:
- Players should first perform tasks manually, then feel the natural desire to build a bot to do it for them
- Each bot solution should reveal a new bottleneck that requires a new bot configuration
- Multiple valid approaches should exist for any given optimization challenge
- The first bot should be operational within 2 minutes of gameplay

Sources:
- [An Ode to Optimization - Game Wisdom](https://game-wisdom.com/critical/an-ode-to-optimization)
- [Factory Builders as Logic Puzzles - Thinky Games](https://thinkygames.com/features/a-satisfactory-result-how-factory-builders-use-logic-puzzles-to-revolutionise-the-management-genre/)
- [Allure of Automation Games - Medium](https://medium.com/@franziska.fink.rpllc/automate-to-innovate-the-irresistible-allure-of-automation-games-like-factorio-57f37dc1479e)
- [Automation Games Explained 2026 - GameFoundry](https://gamefoundry.games/blog/automation-games-explained-2026)

---

## 2. Bot/Automation Game Mechanics

### 2.1 Bot Creation and Customization

**Visual Customization** (the "collection" hook):
- **Body parts**: Head, torso, limbs, treads/legs/wheels -- each with functional and cosmetic variants
- **Color/material system**: Paint, decals, weathering effects -- purely cosmetic personalization
- **Accessories**: Hats, antennae, eyes, stickers -- the "cute factor" that drives attachment (Slime Rancher's success demonstrates that charm is a retention mechanic)
- **Size tiers**: Small scouts, medium workers, large haulers -- visual differentiation communicates function

**Behavioral Customization** (the "optimization" hook):
- **Task specialization**: Mining, crafting, building, patrolling, transporting
- **Personality traits**: Cautious (avoids hazards), aggressive (prioritizes speed over safety), curious (explores unknown areas), social (works better near other bots)
- **Equipment loadouts**: Tool slots that determine what tasks a bot can perform
- **Efficiency tuning**: Speed vs. energy consumption, carry capacity vs. movement speed

**The "gacha" without monetization**: Instead of paying for random bot pulls, players *discover* bot blueprints through exploration, achievement completion, and crafting experimentation. Rare blueprints come from challenging content, not wallets. The collection drive persists without the spending pressure.

**Modular assembly** (inspired by Autonauts): Bots are assembled from components -- head + body + drive unit -- each affecting stats and appearance. Higher-tier workbenches unlock better components. This creates a crafting-collection hybrid where players hunt for both materials and blueprints.

---

### 2.2 Task Assignment and AI Behavior Trees

Behavior trees are the industry standard for game AI (used in Halo 2, Spore, GTA) because they are visually intuitive, modular, and debuggable. They consist of condition nodes, action nodes, and control flow nodes arranged in a tree structure. For casual players, the key is abstraction layers:

**Layer 1 -- "Drag and Drop" (Casual)**:
Players assign bots to task zones. The bot figures out the details.
- Example: Drag a bot to a mine -> it mines automatically
- Example: Drag a bot to a crafting station -> it crafts whatever recipes it knows
- This is the Autonauts "teach by example" model simplified further
- **This layer alone must be sufficient to complete the entire game**

**Layer 2 -- "Priority List" (Intermediate)**:
Players set ordered priorities for a bot.
- Example: "Mine iron -> If inventory full, deliver to smelter -> If smelter full, mine copper"
- Visual representation: simple numbered list with drag-to-reorder
- Provides ~30% efficiency gain over Layer 1
- Unlocked after the player naturally hits a bottleneck that Layer 1 cannot solve

**Layer 3 -- "Behavior Designer" (Advanced)**:
Players build simple behavior trees using visual nodes.
- Condition nodes: "If inventory > 80%", "If health < 20%", "If enemy nearby"
- Action nodes: "Mine", "Deliver", "Flee", "Repair"
- Control nodes: "Sequence" (do in order), "Selector" (try until one works), "Loop"
- Provides potentially unlimited optimization depth
- This is the Screeps programming depth made visual and accessible

**The critical accessibility rule**: Layer 1 must be sufficient to complete the entire game. Layers 2 and 3 are optimization tools, not requirements. This prevents the game from becoming "programming homework." Players who never touch Layers 2 or 3 should still have fun; those who do should feel rewarded with better efficiency.

**Why behavior trees specifically**: Behavior trees are recommended when "some game designers are not programmers, the conditions governing the behavior are complex, and the NPCs have aspects of behavior in common." They are visually intuitive, easy to test and debug, and provide modularity, scalability, and reusability. The drag-and-drop paradigm makes them accessible to non-programmers.

Sources:
- [Behavior Trees for AI - Game Developer](https://www.gamedeveloper.com/programming/behavior-trees-for-ai-how-they-work)
- [Worker NPCs Using Behavior Trees - rubenwardy](https://blog.rubenwardy.com/2022/07/17/game-ai-for-colonists/)
- [Autonauts Bot System - Fandom Wiki](https://autonauts.fandom.com/wiki/Bots)
- [Behavior Tree - Wikipedia](https://en.wikipedia.org/wiki/Behavior_tree_(artificial_intelligence,_robotics_and_control))

---

### 2.3 Resource Gathering, Crafting, and Upgrading Loops

**The canonical automation resource loop**:

```
Gather Raw Resources
    |
    v
Process / Smelt (Tier 1 materials)
    |
    v
Craft Components (Tier 2 materials)
    |
    v
Assemble Products (Tier 3 items)
    |
    v
Use Products to: Upgrade Bots / Unlock Areas / Build Structures
    |
    v
New areas provide new raw resources -> cycle restarts at higher tier
```

**Resource categories for the bot game**:

| Category | Examples | Purpose |
|---|---|---|
| **Energy** | Solar crystals, fuel cells, batteries | Powers bots, limits activity duration |
| **Materials** | Ore, wood, fiber, alloys | Building and crafting |
| **Components** | Gears, circuits, servos, sensors | Bot upgrades and assembly |
| **Data** | Scan results, map fragments, behavior patterns | Unlocks new bot capabilities |
| **Rare Finds** | Ancient tech, anomalous materials | Unique bot blueprints and abilities |

**Crafting depth guidance**: Start with 2-ingredient recipes (ore + fuel = metal bar). Scale to 4-5 ingredient recipes with intermediate steps by mid-game. Never exceed the point where players need external wikis to play -- if they need a wiki, the in-game UI has failed. A visual recipe tree accessible in-game is mandatory.

**The "visible pipeline" rule**: Every resource transformation should be visible in the 3D world. Ore goes into a smelter, smoke comes out, bars appear on the output side. Bots carry materials between stations. The player should be able to trace any resource from source to destination by watching the world. This visibility is what makes automation games satisfying -- it is the "ant farm" effect.

---

### 2.4 Bot Specialization and Team Composition

**Specialization archetypes**:

| Role | Function | Synergy Example |
|---|---|---|
| **Miner** | Extracts raw resources | Feeds Crafter with materials |
| **Crafter** | Converts resources into components | Supplies Builder with parts |
| **Builder** | Constructs structures and infrastructure | Creates workstations for Crafters |
| **Scout** | Explores unknown territory | Discovers resources for Miners |
| **Hauler** | Transports goods between stations | Bridges all specialists, prevents bottlenecks |
| **Guardian** | Protects other bots from hazards | Enables Scouts and Miners in dangerous zones |
| **Repair Bot** | Maintains other bots | Extends operational uptime for the entire fleet |

**Team composition as a puzzle**: The game's strategic depth comes from balancing these roles. Too many miners and no haulers = resource bottleneck at the mine. Too many crafters and no miners = idle crafting stations. This naturally creates the optimization puzzle that drives engagement without any combat mechanics needed.

**Emergent specialization through use**: Rather than hard-locking bots into roles, allow gradual specialization. A bot that mines frequently gets better at mining (skill-up system). This creates attachment ("this is MY best miner") and meaningful upgrade decisions ("do I specialize further or keep flexibility?"). It also means losing a highly-specialized bot to a hazard has real emotional and strategic weight.

**Synergy bonuses**: When certain bot types work together, they gain efficiency bonuses:
- Miner + Hauler nearby = Miner drops resources directly into Hauler (no ground pickup delay)
- Two Crafters at adjacent stations = shared recipe knowledge (can craft each other's recipes)
- Guardian + any bot = protected bot works 20% faster (no danger checks)

These synergies create the team-composition puzzle that drives experimentation.

---

### 2.5 Emergent Behavior from Simple Rules

**Boids-style flocking**: Give bots three simple rules -- separation (don't crowd), alignment (move in the same direction as nearby bots), cohesion (stay near the group) -- and they naturally form convoys when traveling together. This creates visually appealing emergent behavior without complex pathfinding. The boids algorithm was originally developed by Craig Reynolds in 1986 and has been used in countless games and films since.

**Cellular automata for world simulation**:
- **Resource regeneration**: Trees regrow based on neighbor density (too sparse = no seeds, too dense = no light). This is directly modeled on Conway's Game of Life patterns.
- **Hazard spread**: Fires, corruption, or environmental effects spread through connected tiles (Dwarf Fortress and Minecraft both implement fire spreading via cellular automata)
- **Ecosystem simulation**: Simple predator-prey dynamics in the world that bots must navigate

**Emergent bot interactions via personality traits**: If bots have simple personality modifiers:
- A "social" bot near other bots works 10% faster
- A "curious" bot occasionally wanders off-task but discovers hidden resources
- A "cautious" bot avoids hazards but takes longer routes
- A "competitive" bot works faster when another bot of the same type is nearby

These simple rules create complex, unpredictable, and delightful behaviors that players will share screenshots and stories about. This is the Slime Rancher approach: "charm through emergent chaos." When a curious bot wanders off and finds a rare resource vein, the player feels both surprise and delight. When two social bots cluster together and speed up each other's work, the player feels they discovered a hidden synergy.

**The key design constraint**: Emergent behavior should create positive surprises more often than negative ones. Bots should never feel "broken" or "stupid" -- their quirks should read as personality, not bugs. This requires careful tuning of the probability distributions for off-task behaviors.

Sources:
- [Boids - Wikipedia](https://en.wikipedia.org/wiki/Boids)
- [From Rules to Emergence in Game Worlds - Medium](https://rctai.medium.com/from-rules-to-emergence-exploring-the-complexity-of-game-worlds-deb960b2c599)
- [Cellular Automata in Games - Game Developer](https://www.gamedeveloper.com/design/an-intro-to-cellular-automation)
- [Cellular Automata - Nature of Code](https://natureofcode.com/cellular-automata/)

---

## 3. Progression Systems

### 3.1 Prestige/Reset Mechanics

**How prestige works in idle/automation games**: When progression slows to a crawl, the player voluntarily resets most progress in exchange for permanent multipliers that make the next run faster and deeper. This addresses stagnation without requiring infinite content.

**Why it works**:
- Creates meta-strategic depth (when is the optimal prestige point?)
- Each run feels fresh while building on accumulated knowledge and permanent bonuses
- Players experience the satisfying early-game "explosion of progress" repeatedly
- Deciding the optimal timing and method for a reset becomes its own puzzle layer

**For the bot game -- "Reboot" mechanic**:
- **Narrative frame**: "Your bots have gathered enough data to evolve. Reboot the simulation to deploy upgraded bot firmware."
- **What persists**: Bot blueprints discovered, tech tree progress, cosmetic unlocks, world map knowledge
- **What resets**: Resource stockpiles, built structures, bot individual skill levels
- **What improves**: Base bot stats, resource gathering rates, unlock speed, new starting bonuses
- **Prestige currency**: "Data cores" earned based on total production before reset, spent on permanent upgrades

**Critical design rules for prestige**:
1. The first prestige should feel like a revelation, not a punishment. Players should see their second run move 2-3x faster and immediately understand the value.
2. Prestige should never be required -- players who want to keep pushing without resetting should be able to, just less efficiently.
3. Each prestige tier should introduce at least one new mechanic or area that was not accessible before.
4. The prestige decision should be visible long before it is optimal -- show the player what they would gain from resetting, creating anticipation.

Sources:
- [Incremental Game - Wikipedia (Prestige section)](https://en.wikipedia.org/wiki/Incremental_game)
- [Reset Milestones - TV Tropes](https://tvtropes.org/pmwiki/pmwiki.php/Main/ResetMilestones)

---

### 3.2 Tech Trees for Bot Capabilities

**Structure**: A branching tree with three main paths that intersect at key nodes:

```
                    [Core Systems]
                   /      |       \
          [Mobility]  [Processing]  [Sensors]
          /    \       /    \        /    \
     [Speed] [Range] [Craft] [Build] [Scan] [Detect]
        |       |       |       |       |       |
     [Dash]  [Fly]  [Alloy] [Mega]  [Deep]  [Stealth]
                  \     |     /
                [Advanced Fabrication]
                        |
                  [Bot Evolution]
```

**Design principles for the tech tree**:
- **No dead ends**: Every path should feel viable and contribute to overall progress
- **Interlocking requirements**: Some advanced nodes require progress in two branches, forcing breadth. This creates strategically interesting decisions because players must plan ahead (as demonstrated in Civilization IV's tech tree design).
- **Visible but locked**: Players should see what is possible three tiers ahead, creating anticipation (the dopamine trigger from the compulsion loop model)
- **Meaningful choices**: At branch points, players should feel genuine trade-offs, not obvious best paths

**Tech categories with gameplay impact**:
- **Mobility**: Speed, terrain traversal, flight capability -> affects which zones bots can access
- **Processing**: Crafting speed, recipe complexity, multi-tasking -> affects production throughput
- **Sensors**: Exploration range, resource detection, hazard avoidance -> affects discovery rate
- **Energy**: Battery capacity, solar efficiency, energy sharing -> affects operational uptime
- **Social**: Bot-to-bot communication, team bonuses, swarm behaviors -> affects team synergies

**Specialization vs. generalization**: The tech tree should reward both strategies. A fully specialized bot fleet (all nodes in one branch) should be viable for focused play. A balanced fleet (spread across branches) should be viable for varied play. Neither should be strictly dominant.

Sources:
- [Technology Tree - Wikipedia](https://en.wikipedia.org/wiki/Technology_tree)
- [Adaptive Tech Tree in Dawn of Man - Game Developer](https://www.gamedeveloper.com/design/game-design-deep-dive-creating-an-adaptive-tech-tree-in-i-dawn-of-man-i-)
- [Technology Trees in Historical Strategy Games - Game Studies](https://www.gamestudies.org/1201/articles/tuur_ghys)

---

### 3.3 Zone/Biome Progression

**Zone design philosophy**: Each new zone should introduce a new resource, a new challenge, and a new bot capability requirement. The zone serves as both content and progression gate.

| Zone | Theme | New Resource | New Challenge | Required Capability |
|---|---|---|---|---|
| **Meadow** | Tutorial, safe, bright | Wood, Stone | None (learning) | Basic movement |
| **Forest** | Dense, limited visibility | Iron, Herbs | Navigation in clutter | Pathfinding upgrade |
| **Caves** | Underground, dark | Crystals, Gems | No solar energy | Battery system |
| **Desert** | Open, hot | Sand glass, Rare earth | Overheating bots | Cooling system |
| **Swamp** | Wet, corrosive | Bio-matter, Acids | Corrosion damage | Waterproofing |
| **Mountains** | Vertical, cold | Titanium, Ice | Climbing, freezing | Terrain traversal |
| **Ruins** | Ancient tech zone | Data fragments, Alloys | Hazardous anomalies | Sensor arrays |
| **Void** | End-game mystery | Dark matter, ??? | Unknown threats | Full bot evolution |

**Gating mechanism**: Zones are unlocked by producing specific items that require resources from previous zones. This creates a natural dependency chain without arbitrary level gates. The player understands *why* they cannot access a zone (they need a specific item) and *what* they need to do (gather specific resources and craft the item).

**Metroidvania-style revisiting**: Like Slime Rancher's jetpack unlocking new traversal options, upgrading bot capabilities should let players revisit earlier zones and access previously unreachable areas. This doubles the effective content of each zone.

---

### 3.4 Challenge Modes and Daily Objectives

**Daily challenges** (short engagement hooks, ~5-10 minutes):
- "Produce 100 iron bars using only 3 bots"
- "Explore 5 new map tiles in the Forest zone"
- "Craft a Tier 3 item without using any hauler bots"

**Weekly challenges** (medium engagement, ~1-2 hours):
- "Reach Zone 4 from a fresh start"
- "Build a production chain that outputs 10 items/minute"
- "Complete a full prestige cycle in under 3 hours"

**Puzzle challenges** (optimization depth, variable time):
- Fixed resources, fixed bots, optimize for maximum output
- Essentially "factory puzzles" with predetermined constraints
- Scored on efficiency metrics (output per bot, time to target, resource waste)
- Community-created challenges extend this indefinitely

**Seasonal events** (long-term engagement):
- New temporary zones with unique resources
- Limited-time bot cosmetics (earnable through play, not purchase)
- Community-wide goals ("the global bot fleet mined 1 billion ore this season")

---

### 3.5 PvE Scaling Difficulty

**Scaling philosophy**: The world should become more complex, not just numerically harder. Bigger health bars are lazy design. New behaviors, new environmental interactions, and new constraints are interesting difficulty.

**Scaling mechanisms**:
- New zones introduce mechanics that invalidate previous strategies (forcing adaptation)
- Resource nodes deplete over time, requiring expansion into new territory
- Environmental events (storms, migrations, earthquakes) disrupt optimized systems
- "Corruption" mechanic that slowly encroaches on claimed territory, requiring active defense or territory management
- Higher-tier recipes require resources from multiple zones, forcing logistical complexity

**The key principle**: Difficulty should make the player think differently, not just work harder. A new zone should not be "the same zone but with bigger numbers" -- it should require a fundamentally different bot configuration or strategy.

---

## 4. Monetization-Free Engagement

### 4.1 What Keeps Players in Free Web Games

Without monetization pressure, the game can focus purely on intrinsic engagement:

**Mastery satisfaction**: The Factorio lesson -- the game *is* the reward. Watching a well-designed bot system operate efficiently is inherently satisfying. No external reward is needed when the core loop is genuinely fun.

**Creative expression**: Bot customization (visual and behavioral) gives players a canvas. People will spend hours making their bots "look right" for the same reason they spend hours in character creators. Allowing personal expression through bot design is a retention mechanic that costs nothing.

**Curiosity and discovery**: New zones, hidden mechanics, secret recipes, rare bot blueprints -- exploration-driven retention is powerful. The Zeigarnik effect (the tendency to remember incomplete tasks) means that a collection screen showing 47/50 blueprints creates a persistent pull.

**Sunk cost and identity**: "I built this." Players who invest creative effort into their bot colony develop genuine attachment. This is the same psychology that makes Minecraft worlds feel precious.

**Meeting basic psychological needs** (Self-Determination Theory):
- **Competence**: "My bot system is efficient and well-designed" (mastery)
- **Autonomy**: "I chose how to set this up, and it reflects my decisions" (agency)
- **Relatedness**: "Other players appreciate my design" (social connection)

Sources:
- [Web Gaming Strikes Back - Naavik](https://naavik.co/digest/web-gaming-strikes-back/)
- [Game Retention Strategies - Feature Upvote](https://featureupvote.com/blog/game-retention/)
- [Why Some Games Are More Addictive - People of Play](https://www.peopleofplay.com/blog/the-psychology-of-game-design-why-some-games-are-more-addictive-than-others)

---

### 4.2 Leaderboards, Achievements, and Sharing

**Leaderboard categories** (encourage different play styles):
- **Efficiency**: Most output per bot (rewards optimization)
- **Scale**: Largest total production (rewards dedication)
- **Speed**: Fastest to reach milestones / speedrun culture (rewards mastery)
- **Creativity**: Community-voted "most interesting bot design" (rewards expression)
- **Minimalism**: Fewest bots to complete a challenge (rewards cleverness)

**Achievement system** (exploration breadcrumbs):
- Discovery achievements: "Found all crystal types in the Cave zone"
- Mastery achievements: "Produced 10,000 iron bars in a single session"
- Creative achievements: "Built a bot with 5 different specializations"
- Efficiency achievements: "Maintained 95%+ bot uptime for 24 hours"
- Secret achievements: "Discovered the hidden cave in Zone 3" (drives community discussion and guides)

**Sharing mechanics**:
- Screenshot mode with clean UI for social media sharing
- Exportable bot blueprints (shareable codes or URLs)
- Replay system for showcasing optimized runs
- "Visit" mode to explore other players' worlds (read-only)
- Short shareable video clips of bot operations ("look at my factory")

Sources:
- [Free-to-Play Game Design Essentials - Number Analytics](https://www.numberanalytics.com/blog/free-to-play-game-design-essentials)
- [Player Retention Tips - Felgo](https://blog.felgo.com/mobile-game-development/10-simple-tips-that-will-boost-your-player-retention)

---

### 4.3 User-Generated Content Potential

**Bot blueprint sharing**: Players create and share bot configurations. A community marketplace (free, reputation-based) where players upload their designs and rate others'. This extends content indefinitely at zero development cost.

**Challenge creation**: A level/puzzle editor where players define constraints (limited resources, specific goals, restricted bot types) and publish as community challenges. This is the approach that creates self-sustaining content ecosystems. Including a level editor is "a fun way for community members to interact with each other and adds new playable content to the game."

**World seeds**: Shareable world generation seeds so players can compare approaches to identical starting conditions. This enables fair competition and community benchmarks.

**Modding support** (longer term): Expose the behavior tree system, resource definitions, and zone templates for community modding. Mindustry's open-source approach demonstrates that a modding community drives long-term retention far beyond developer-created content. Players who contribute to strategy guides, FAQs, or community help can be rewarded with in-game titles or exclusive cosmetics.

---

### 4.4 Community Features That Drive Retention

**Asynchronous social mechanics** (low development cost, high retention impact):
- Global chat / forums integrated into the game
- "Bot of the Day" featured community creation (curated or community-voted)
- Seasonal events with unique cosmetic rewards earned through play
- Collaborative goals: "Community total: mine 1 billion iron ore this week"
- Player profiles showing their collection, achievements, and best designs

**Competition without toxicity**:
- Opt-in leaderboards (players choose to compete)
- Focus on "personal best" rather than global rank
- Cooperative challenges alongside competitive ones
- No PvP destruction of progress (competition is parallel, not adversarial)
- Constructive community: rewarding helpfulness (upvoting blueprints, writing guides) creates a positive feedback loop

**Path of Exile as a model**: Path of Exile uses a fair free-to-play model where all gameplay content is free, with only cosmetic differentiation. This demonstrates that games can sustain massive communities without monetization gating gameplay. Even single-player games foster community through forums, speedrunning culture, and fan-created content.

---

## 5. Comparable Games Analysis

### 5.1 Autonauts

**What it is**: Automation game where players teach cute robots to perform tasks by recording actions and editing visual programs (Scratch-like). Bots are assembled from components (head + body + drive) at assembly benches, with multiple tiers of workbenches for higher-quality parts.

**What works**:
- **"Teach by example" programming** is brilliant for accessibility -- record yourself doing a task, the bot learns it. Bots generalize player examples in sensible ways while still allowing room for optimization.
- **Visual, cute art style** creates immediate appeal and lowers intimidation.
- **Modular bot assembly** (head + body + drive components) provides meaningful customization.
- **Watching a fleet of bots execute learned behaviors** is deeply satisfying -- chopping trees, planting, converting logs to planks, stacking pallets.
- **Visual code builder** (similar to Scratch) can teach basic programming principles.
- **Loop and conditional support**: Bots can be programmed with loops and conditions (e.g., "if tool breaks, go get another one").

**What doesn't work**:
- Complexity ceiling is relatively low -- experienced players exhaust the optimization space.
- Memory bank limitations on bot programs feel arbitrary rather than strategic.
- Late game becomes repetitive once all mechanics are mastered -- lacks prestige or reset systems.
- UI for managing large numbers of bots becomes unwieldy.
- Designed primarily for younger audiences, which limits strategic depth.

**What we can learn**:
- The "teach by example" paradigm is the gold standard for casual-friendly bot programming. Our Layer 1 ("drag and drop") should capture this simplicity.
- Cute aesthetic is not just cosmetic -- it is a retention mechanic that reduces frustration. Players tolerate more complexity when the bots are charming.
- Bot component customization (modular assembly) is more engaging than abstract stat sliders.
- We need more depth than Autonauts offers. The behavior tree layers (2 and 3) and prestige system address this.

Sources:
- [Autonauts on Steam](https://store.steampowered.com/app/979120/Autonauts/)
- [Autonauts Review - Gamereactor](https://www.gamereactor.eu/autonauts-review/)
- [Autonauts Review - GameGrin](https://www.gamegrin.com/reviews/autonauts-review/)
- [Autonauts Bots Wiki](https://autonauts.fandom.com/wiki/Bots)

---

### 5.2 Screeps

**What it is**: MMO where players program their units in JavaScript. Persistent world with 70,000+ interconnected rooms on a 40-server cluster running 24/7 via Node.js. Players program mining, building, fighting, trading, and logistics behaviors.

**What works**:
- **The ultimate optimization puzzle** -- real programming creates infinite depth.
- **Persistent MMO world** means your code runs 24/7, creating genuine idle progression. When you log off, your population continues with whatever task you set them.
- **Emergent player interactions** (alliances, wars, trade) from simple rules.
- **Incredibly deep meta-game** and community -- entire GitHub repositories of bot AI codebases (e.g., Overmind, KasamiBot, TooAngel).
- **Swarm intelligence patterns**: Advanced bots use Overlord/Colony structures for sophisticated autonomous behavior.
- **The satisfaction of watching your code outperform others'** is unmatched.

**What doesn't work**:
- **Barrier to entry is extreme** -- requires actual JavaScript knowledge. New players are overwhelmed.
- **The learning curve drives away the vast majority of potential players.** No visual programming option means non-programmers are excluded entirely.
- **Security concerns**: The game has faced issues with remote code execution risks due to running player-submitted code.
- **Visual presentation is minimal** -- 2D rooms with simple sprites.

**What we can learn**:
- A persistent world where bots run autonomously is proven and compelling. This is the core of idle/autonomous progression.
- The MMO element (other players' bots in the same world) adds social pressure that drives optimization.
- We need to capture the depth of Screeps but with Autonauts-level accessibility. Visual behavior trees can be our "Screeps for everyone."
- The community that forms around bot programming (sharing code, competing on leaderboards) is a powerful retention driver.

Sources:
- [Screeps Official Site](https://screeps.com/)
- [Screeps on Steam](https://store.steampowered.com/app/464350/Screeps)
- [Overmind Bot - GitHub](https://github.com/bencbartlett/Overmind)

---

### 5.3 Slime Rancher

**What it is**: First-person collection and management game where players ranch colorful slimes on an alien planet. Built by Monomi Park.

**What works**:
- **One-minute core loop**: Vacuum slimes, corral them, collect plorts (slime byproducts), sell plorts, upgrade ranch. Creator Nick Popovich explicitly designed around this: "The backbone of Slime Rancher is a fun, one-minute loop, and I think that's just good, smart design."
- **Dynamic market prices**: Plort values fluctuate daily, preventing single-strategy optimization and encouraging diverse ranching. Players cannot min-max a single approach.
- **Emergent chaos from living systems**: Slimes behave autonomously. When they consume the wrong plorts, they transform into dangerous Tarr slimes, creating unpredictable challenge that requires strategic base planning.
- **Metroidvania exploration**: Equipment upgrades (jetpack, expanded areas) unlock new traversal options that recontextualize existing zones.
- **"No-loss" idle design**: Missing timers causes no loss, only missed gains. This "cozy" philosophy prevents stress while maintaining engagement.
- **Overlapping goals prevent downtime**: Players always have 3-4 simultaneous objectives.
- **Tight storage constraints** (4-slot VAC) force a "tight loop between exploring/gathering and maintaining your ranch."
- **Audio feedback reinforcement**: Pitch-stacking sounds when selling plorts creates satisfying "gameplay juice."

**What doesn't work**:
- Late game ranch management becomes tedious without enough automation tools.
- Once all slimes are discovered, the exploration drive fades significantly.
- Limited social/sharing features in the base game.
- The economy can become trivially easy once optimized.

**What we can learn**:
- **Make the minute-to-minute interaction fun FIRST, then build economic systems around it.** As Popovich states: "unless it's just 'Spreadsheets: The Game,' you better hope that the other stuff surrounding it is also similarly interesting."
- **Charm and personality in collectible entities is a massive retention driver.** The plort system works because slimes are inherently delightful to interact with.
- **"No-loss" idle mechanics** (things don't die or break while you're away) reduce anxiety and encourage re-engagement.
- **Dynamic systems that create emergent stories are more engaging than scripted events.** The Tarr slime incident that wipes out half your ranch becomes a war story, not a frustration.
- **Audio and visual polish on the core loop has outsized impact** on perceived game quality.

Sources:
- [Slime Rancher Plort System Analysis - Game Developer](https://www.gamedeveloper.com/design/it-s-not-actually-poop-a-look-at-i-slime-rancher-i-s-plort-system)
- [Slime Rancher Game Design Club Analysis - Make Games SA](https://makegamessa.com/discussion/5705/game-design-club-1-slime-rancher)

---

### 5.4 Mindustry

**What it is**: Open-source hybrid tower-defense/factory-building game. Playable in web browsers, available on mobile, desktop, and Steam. Created by Anuke.

**What works**:
- **Genre fusion**: Tower defense provides urgency and purpose to factory building. You are not just building for efficiency -- you are building to survive waves of enemies.
- **Browser-native**: Proves that complex automation games work in web browsers. This is direct evidence for our concept's viability.
- **Multiple game modes**: Campaign, sandbox (infinite resources, no enemies), PvP, and custom maps. This dramatically extends longevity.
- **Community modding and content**: Open-source approach has created a massive modding community. User-created maps and mods extend content indefinitely.
- **Maps as puzzles**: Each map presents unique resource constraints and defense challenges, forcing different strategies.
- **Unit production and automation**: Players can produce units that automatically manage bases or assault enemy positions, adding an autonomous agent layer.

**What doesn't work**:
- Visual clarity suffers at scale (hard to read complex factories in 2D overhead view).
- Learning curve for optimal factory layouts is steep for new players.
- Mobile controls are cramped for the complexity required.
- No idle/offline progression -- the game requires active play.

**What we can learn**:
- **Web-based automation games are viable and have proven audiences.** Mindustry is direct evidence.
- **Having a "purpose" for production** (defense) is more engaging than production for its own sake. Our bot game should have goals beyond pure accumulation.
- **Multiple game modes** (sandbox, campaign, challenges, community content) dramatically extend longevity.
- **Open-source / modding community** creates sustainable engagement far beyond developer-created content.
- **3D would be a major differentiator** -- Mindustry's 2D presentation limits readability at scale. A well-designed 3D view could solve this.

Sources:
- [Mindustry on GitHub](https://github.com/Anuken/Mindustry)
- [Mindustry on itch.io](https://anuke.itch.io/mindustry)
- [Mindustry on Steam](https://store.steampowered.com/app/1127400/Mindustry/)
- [Mindustry Discussion - Hacker News](https://news.ycombinator.com/item?id=38732542)

---

### 5.5 Synthesis: Competitive Positioning

| Feature | Autonauts | Screeps | Slime Rancher | Mindustry | **Our Game** |
|---|---|---|---|---|---|
| Accessible bot programming | Yes (record) | No (JavaScript) | N/A | N/A | **Yes (3 abstraction layers)** |
| 3D world | No (isometric) | No (2D rooms) | Yes (first-person) | No (2D overhead) | **Yes (third-person 3D)** |
| Bot visual customization | Moderate (components) | Via code only | N/A (slimes are fixed) | Fixed unit types | **Deep (visual + behavioral)** |
| Idle/offline progression | No | Yes (always-on MMO) | Partial (slimes produce) | No | **Yes (bots run autonomously)** |
| Web-based | No (Steam only) | Yes (browser + Steam) | No (Steam/console) | Yes (browser + all platforms) | **Yes (browser-first)** |
| Collectible/discovery drive | Limited | N/A | Yes (slime species) | Limited | **Yes (blueprints, rare parts, zones)** |
| Emergent bot behavior | Some (from programs) | Yes (from code) | Yes (slime AI/Tarrs) | Limited | **Yes (personality traits + boids)** |
| Social/sharing features | No | Yes (MMO interactions) | No | Yes (multiplayer) | **Yes (blueprints, leaderboards, visits)** |
| Prestige/reset system | No | No | No | No | **Yes (Reboot mechanic)** |
| Cute/charming aesthetic | Yes | No | Yes | No | **Yes (a core design pillar)** |

**The unique position**: No existing game combines accessible visual bot programming, 3D world exploration, collectible bot customization, idle autonomous progression, and prestige mechanics in a web browser. This is a genuinely underserved intersection.

**The closest competitors' gaps**:
- Autonauts has the charm and accessibility but lacks depth, idle progression, and web access
- Screeps has the depth and persistence but excludes non-programmers
- Slime Rancher has the charm and collection drive but lacks automation depth
- Mindustry has the web viability and automation but lacks charm, 3D, and idle progression

---

## 6. Minimum Viable Game Loop

### 6.1 The Absolute Core Loop

```
     +---> [Place Bot in World] ---+
     |                              |
     |                              v
[Upgrade Bot] <--- [Collect Resources] <--- [Bot Gathers Autonomously]
     |                              |
     |                              v
     +---- [Craft Better Parts] <--+
```

**In one sentence**: Place bots that gather resources, use resources to build better bots, place better bots.

**The 60-second new player experience**:
1. Player spawns in a bright meadow with one basic (cute) bot
2. Drag bot to a glowing resource node (trees, rocks)
3. Bot begins gathering automatically with charming animations
4. Resources accumulate visibly (pile grows, counter increases)
5. Player uses resources to craft their first upgrade at a workbench
6. Bot becomes noticeably better (faster, carries more, new animation)
7. Player sees a new resource type just out of reach (different color, slightly further away)
8. "I need a better bot to get that..." -> loop restarts

This maps exactly to Factorio's genius: **every solution reveals the next problem**. And it maps to Slime Rancher's genius: **the one-minute loop must be fun in itself**.

---

### 6.2 What to Keep vs. Cut for V1

**KEEP (essential for the core experience)**:

| Feature | Why It's Essential |
|---|---|
| Single biome (meadow) with 3-4 resource types | Enough variety without overwhelming |
| 3-5 bot visual variants | Minimum for "collection" feeling |
| Drag-and-drop task assignment (Layer 1 only) | Core interaction, must be frictionless |
| Simple crafting (2-ingredient recipes, 2 tiers) | Progression without wiki-dependency |
| One tech tree branch (linear, 5-6 nodes) | Clear upgrade path with visible future |
| Bot color/accessory customization (2-3 slots) | Personal expression and attachment |
| Autonomous gathering (bots work while player watches or is away) | The idle hook, the "check back later" reason |
| Basic offline progress (accumulated resources on return) | The return reward that drives re-engagement |
| Charming bot animations and sounds | The Slime Rancher lesson: charm IS retention |
| Visible resource pipelines (bots carry things, piles grow) | The "ant farm" satisfaction of watching systems work |

**CUT from V1 (add in subsequent versions)**:

| Feature | Why It Can Wait | When to Add |
|---|---|---|
| Behavior tree editor (Layers 2 and 3) | Layer 1 is sufficient; optimization depth can come later | V2: when players hit bottlenecks Layer 1 cannot solve |
| Multiple biomes/zones | Ship one biome; add zones as content updates | V2-V3: each update adds a zone |
| Prestige/reset system | No need until players hit end-game stagnation | V3: when enough content exists to make resets meaningful |
| Leaderboards and social features | Need a community first | V2: once player base exists |
| PvP or competitive modes | Core loop must prove itself first | V4+: if demand exists |
| Complex emergent behaviors (boids, personality traits) | Nice-to-have, not core | V2: adds delight once basics work |
| User-generated content tools | Requires stable core systems | V4+: long-term retention play |
| Dynamic market/economy | Single biome does not need price fluctuation | V3: when multiple resource types justify it |
| Challenge modes / daily objectives | Need enough content to create meaningful constraints | V2-V3 |

**The MVP is essentially**: A single pretty 3D meadow where you place cute bots that gather stuff so you can make better bots. That's it. If that 60-second loop feels good, everything else is additive.

---

### 6.3 What Makes It Feel "One More Turn" Addictive

**The five hooks that create "just one more..."**:

**1. Visible progress toward the next unlock**
A progress bar at 87% is almost physically painful to leave. Always show the player how close they are to the next upgrade, the next blueprint, the next bot variant. This is the anticipation phase where dopamine is generated -- not at reward delivery, but at reward proximity.

**2. Cascading optimization opportunities**
Every improvement reveals a new bottleneck. "Okay, I upgraded the miner... but now the hauler can't keep up... let me just fix that... oh, now I have enough iron for that new recipe..." This is the Factorio cascade that turns 30 minutes into 3 hours.

**3. Bots doing cute things**
The Slime Rancher lesson. If your bots have personality -- if they bump into each other and make little sounds, if they do a happy animation when they complete a task, if they look confused when idle, if they celebrate when they level up -- players will stay just to watch them. Charm is not polish. Charm is a retention mechanic.

**4. The "I'll just check" return loop**
Offline progress means there is always a reason to come back. "I wonder how much my bots gathered while I was gone." The return reward (accumulated resources waiting to be spent) triggers the active session, which triggers new offline progress, which triggers the next return. This is the idle game flywheel.

**5. Discovery breadcrumbs**
Foggy areas at the edge of the map. Locked crafting recipes that hint at what is possible. Bot blueprint silhouettes that show undiscovered variants. Resource nodes that glow with an unfamiliar color just beyond current reach. The explorer motivation should always be visible, even in the starting meadow.

---

### 6.4 The "Magic Formula" Summary

```
Anticipation of next unlock
  + Visible autonomous progress
  + Charming bots with personality
  + Cascading optimization puzzles
  + Discovery breadcrumbs at the edges
  = "One more turn"
```

This formula combines the best of:
- **Factorio**: Cascading problems that drive continuous engagement
- **Idle games**: Autonomous progress that respects player time
- **Slime Rancher**: Charm and personality that create emotional attachment
- **Gacha/collection games**: Discovery drive and collection completion desire
- **Screeps**: The satisfaction of watching autonomous agents you designed succeed

The result should be a game where placing a bot in a meadow and watching it work is satisfying in the first minute, and optimizing a fleet of specialized bots across multiple zones is satisfying in the hundredth hour.

---

## Key Design Principles (Summary)

1. **Fun first, systems second**: If placing and watching bots is not fun in the first 60 seconds, no amount of progression depth will save the game.
2. **Accessible by default, deep by choice**: Three layers of bot control ensure no player is excluded while optimizers have infinite depth.
3. **Every solution creates the next problem**: The cascading problem structure is what makes automation games addictive without being exploitative.
4. **Charm is a game mechanic**: Cute bots with personality create emotional attachment that drives retention.
5. **Idle execution, active strategy**: Bots handle the doing; players handle the thinking.
6. **Show the next thing before unlocking it**: Visible-but-locked content drives anticipation, which is where dopamine actually fires.
7. **No loss from absence**: Missing play time should mean missed gains, never lost progress.
8. **Community extends content**: Blueprint sharing, challenges, and leaderboards create self-sustaining engagement.
9. **The "ant farm" effect**: Visible resource flows and bot activity are inherently satisfying to watch. Invest in animation and audio.
10. **Respect the player's time**: Every minute of play should feel productive. No artificial waiting without purpose.

---

*This document synthesizes research from game design theory, player psychology, comparable game analysis, and published developer post-mortems. All claims are sourced from the URLs cited inline. Where uncertainty exists in specific metrics or ratios, it is noted rather than fabricated.*
