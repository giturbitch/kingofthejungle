# Jungle Predators

KING OF THE JUNGLE

Farming Agents — Complete Frontend Visual Rebuild

We are rebuilding the frontend of the existing Farming Agents application at:

https://farmingagents.fun

IMPORTANT:

DO NOT REBUILD THE PROTOCOL.
DO NOT CHANGE THE BACKEND.
DO NOT CHANGE THE SMART CONTRACT LOGIC.

The existing application already has the working farming/agent system.

We are taking the existing backend, blockchain integrations, contracts, wallet functionality, data structures, transactions, farmer logic, crop logic, cooldowns, harvesting, launchpads, categories, boosts, leaderboard, and all other existing functionality and putting an entirely new visual experience on top of it.

Think:

KEEP THE ENGINE.
REBUILD THE WORLD.

The new world is:

THE JUNGLE.

1. THE NEW CORE CONCEPT

The current application uses a farm/field metaphor.

We are replacing the visual concept of the farm with an animal kingdom / jungle ecosystem.

The user should feel like they are entering a living world populated by autonomous predators.

The hierarchy is:

FARMER → PREDATOR

FIELD → TERRITORY

CROP → PREY / TARGET

SOW → HUNT

GROWING → TRACKING PREY

RIPE → READY TO HARVEST

HARVEST → KILL / HARVEST

ROT → PREY ESCAPED

LEADERBOARD → FOOD CHAIN

TOP FARMER → KING OF THE JUNGLE

$FARM → POWER / TERRITORY CONTROL

Do NOT force these terms everywhere.

The actual protocol terminology should remain understandable.

The jungle is the visual/story layer.

2. THE MAIN EXPERIENCE

When a user opens the website, they should NOT feel like they are looking at a crypto dashboard.

They should feel like they are entering an ecosystem.

Opening sequence:

Dark screen.

Very subtle jungle ambience.

Fog.

Leaves moving.

Distant silhouettes.

A pair of animal eyes appears.

The jungle slowly becomes visible.

Then:

THE JUNGLE HAS A PECKING ORDER.

Supporting text:

Every farmer has a territory.
Every territory has a predator.
Every hunt has a reward.

CTA:

ENTER THE JUNGLE

Secondary:

EXPLORE THE FIELD

The animation must be lightweight and performant.

Do not create a long loading sequence that delays the application.

3. THE FIELD IS THE STAR OF THE WEBSITE

This is the MOST IMPORTANT part of the redesign.

The existing Farm/Field should become:

THE JUNGLE

It should function as a large interactive, zoomable world.

Think:

strategy game map

animal kingdom

jungle ecosystem

territory map

premium Web3 interface

NOT:

generic dashboard

grid of boring cards

standard farming UI

The user should be able to:

PAN

ZOOM

HOVER

CLICK

EXPLORE

The Field should occupy the majority of the screen.

4. BUILD A LIVING JUNGLE MAP

Create a large procedural/structured jungle environment.

The map should contain different environmental regions:

JUNGLE

Dense vegetation.

RIVER

Water flowing through the map.

SWAMP

Dark water and vegetation.

MOUNTAINS

Higher elevation and cliffs.

SAVANNA

Open grassland.

ANCIENT RUINS

Stone structures hidden in vegetation.

DARK FOREST

Dense trees and shadows.

WATERFALL

A visually impressive landmark.

These regions are primarily visual.

Do NOT change blockchain logic based on geography unless the existing backend already supports such behavior.

The environment is the skin.

5. TERRITORIES

Every existing farmer/plot should become a territory.

Do NOT simply render a square farm plot.

Instead create organic territory boundaries.

For example:

A territory might contain:

trees

rocks

plants

water

paths

a central animal

crop/target

subtle boundary

The territory should feel like land controlled by a predator.

Every territory should be deterministic.

The same farmer should always occupy the same visual territory.

Do NOT randomly rearrange farmers every time the page loads.

Use the existing farmer/plot identity to generate deterministic positioning.

6. ANIMALS REPRESENT FARMERS

Every farmer gets an animal identity.

Possible animals:

LION
TIGER
PANTHER
WOLF
BEAR
GORILLA
EAGLE
SNAKE
CROCODILE
JAGUAR
HYENA
BOAR

Use a deterministic mapping so the farmer consistently has the same animal.

Do NOT randomly change the animal.

The animal should visually represent the farmer.

Example:

LION

= dominant

WOLF

= pack

EAGLE

= vision

SNAKE

= stealth

CROCODILE

= patience

GORILLA

= power

PANTHER

= speed

TIGER

= aggression

These are visual identities.

They should NOT alter the existing backend behavior unless there is already a corresponding farmer attribute.

7. FARMER STATES SHOULD CHANGE THE ANIMAL

The animal should react to the actual farmer state.

IDLE

Animal casually moves around its territory.

GROWING

Animal watches the crop.

RIPE

Animal stands next to the harvestable crop.

COOLDOWN

Animal rests/sleeps.

ROT

Animal leaves or becomes inactive.

HARVEST

Brief victory animation.

TRANSACTION

Subtle anticipation animation.

The visual state must be driven by REAL application data.

Never fake status.

8. CROPS BECOME LIVING OBJECTS

The current crop system remains exactly the same.

But visually represent the crop as a jungle resource.

Stage 1:

SEED

Tiny glowing object.

Stage 2:

GROWING

Plant begins developing.

Stage 3:

RIPE

Large exotic glowing fruit/plant.

Stage 4:

HARVESTABLE

Very obvious visual highlight.

Stage 5:

ROT

Plant decays.

Use animation and environmental changes to communicate the state.

The actual timestamps and blockchain state must determine which visual stage is shown.

9. ROT SHOULD LOOK AMAZING

When a ripe crop becomes rotten:

The territory should visually deteriorate.

Examples:

Leaves fall.

Plant darkens.

Fog increases.

Colors become muted.

Particles decay.

Animal walks away.

Display:

THE HUNT WAS MISSED.

Then show the appropriate existing action.

Do NOT alter the existing rot mechanics.

10. CLICKING A TERRITORY

When the user clicks a territory:

DO NOT immediately navigate away.

Instead:

Zoom the camera toward the territory.

Open a premium side panel.

Example:

🦁

KING LEONIDAS

TERRITORY #482

OWNER

0x83...A91

CURRENT STATUS

GROWING

08:42:31

CURRENT TARGET

MEME

$TOKEN

CATEGORIES

MEME
AI
ANIMAL

LAUNCHPAD

[existing launchpad]

NEXT HUNT

12:42:31

HARVEST

[button]

The information must come from the existing application data.

11. TERRITORY VISUAL HIERARCHY

Do NOT make every territory visually identical.

Small/less active territories:

Minimal vegetation.

Smaller animal.

Subtle lighting.

Higher-performing territories:

More developed environments.

More visual activity.

More trophies/structures.

Higher leaderboard positions:

More prestigious territory.

Potential crown/monument.

However:

DO NOT invent metrics.

Only visually exaggerate real data.

12. KING OF THE JUNGLE

Transform the existing leaderboard into:

KING OF THE JUNGLE

The top 3 farmers should receive special treatment.

1 — KING

Massive lion/throne visual.

2 — ALPHA

Prestigious territory.

3 — HUNTER

Strong visual presence.

Then:

THE PACK

All other ranked farmers.

The leaderboard must use the REAL existing leaderboard data.

Do not hardcode rankings.

When the #1 farmer changes, the King designation changes automatically.

13. KINGDOM VIEW

The existing "My Farmers" experience becomes:

MY KINGDOM

This is where the user manages their farmers.

Display each farmer as a territory.

Example:

🦁 KING LEONIDAS

STATUS
GROWING

CURRENT TARGET
MEME

COOLDOWN
07:21:44

BOOST
ACTIVE

CATEGORIES
MEME / AI / ANIMAL

NEXT ACTION
08:42:12

Allow the user to click:

ENTER TERRITORY

which takes them into the Jungle map focused on that farmer.

14. THE FORGE

The Forge becomes:

THE FORGE

Subtitle:

Every predator is born somewhere.

Preserve the entire existing farmer creation process.

The visual experience should feel like creating a new animal.

Step 1:

NAME YOUR FARMER

Make the permanent-name mechanic extremely clear.

Use language such as:

CHOOSE WISELY.

THIS NAME CANNOT BE CHANGED.

Do not change the actual backend rule.

Step 2:

CHOOSE YOUR PREDATOR

Animal visual identity.

Step 3:

CHOOSE YOUR TERRITORIES

Display the existing categories.

Use jungle-themed category environments.

Step 4:

CHOOSE YOUR SPEED

Preserve the existing speed/cooldown functionality.

Step 5:

CHOOSE YOUR LAUNCHPAD

Preserve existing launchpad functionality.

Step 6:

FORGE FARMER

The final transaction screen should feel like the birth of a new predator.

15. THE HUNT

The existing Launches section becomes:

THE HUNT

Show recently harvested/launched tokens.

Each item should visually feel like a completed hunt.

Example:

🦁 KING LEONIDAS

HARVESTED

$ROAR

MEME

LAUNCHPAD

4 MIN AGO

Clicking opens the existing launch/token information.

16. CATEGORY ENVIRONMENTS

The existing categories should have visual identities.

Do not change the underlying category system.

Examples:

MEME
→ chaotic jungle

ANIMAL
→ wildlife

AI
→ futuristic jungle

DEFI
→ river / treasure

GAMING
→ arena

ART
→ colorful exotic vegetation

MUSIC
→ nighttime jungle

SPORTS
→ competitive territory

POLITICS
→ battlefield

SCIENCE
→ experimental environment

SPACE
→ cosmic jungle

NOSTALGIA
→ ancient ruins

DOOMER
→ dead forest

These are visual themes only.

17. $FARM

Create:

THE FOOD CHAIN

This is the $FARM section.

Explain the existing boost mechanics.

Visually represent boost slots as territories controlled by the user's predators.

Example:

YOUR POWER

🦁 BOOST ACTIVE

🐆 BOOST ACTIVE

🐍 AVAILABLE

All calculations must use the existing backend.

Do not create fake balances.

Do not change contract logic.

18. NAVIGATION

Use a minimal premium navigation.

Logo:

KING OF THE JUNGLE

Navigation:

JUNGLE
FORGE
THE HUNT
MY KINGDOM
KING

Wallet:

CONNECT WALLET

Once connected:

wallet address

$FARM balance

farmer count

Do not clutter the navigation.

19. VISUAL LANGUAGE

Use:

Near-black backgrounds.

Deep jungle greens.

Muted gold.

Ivory typography.

Very subtle red for danger.

High-quality animal artwork.

Fog.

Atmospheric depth.

Subtle particles.

Organic shapes.

Cinematic lighting.

The site should feel:

DARK

PREMIUM

POWERFUL

MYSTERIOUS

ALIVE

Avoid:

Purple Web3 gradients.

Generic glassmorphism.

Cheap cartoon animals.

NFT marketplace aesthetics.

Overly rounded cards.

Generic SaaS dashboards.

Excessive neon.

20. TYPOGRAPHY

Headlines should feel editorial and powerful.

Example:

THE JUNGLE

HAS A

PECKING

ORDER.

Use a sophisticated display font.

Use a clean sans-serif for all functional UI.

Numbers, timers, addresses, and blockchain data should use a highly legible font.

21. CAMERA SYSTEM

The Jungle should have a camera system.

Users can:

ZOOM OUT

→ entire jungle

ZOOM IN

→ territories

ZOOM FURTHER

→ individual farmer

Use smooth camera transitions.

When clicking a farmer:

Camera smoothly focuses on that territory.

When closing the farmer panel:

Camera returns to previous position.

Do not create disorienting camera movement.

22. WORLD DEPTH

Create visual layers.

BACKGROUND:

Mountains.

Sky.

Fog.

MIDGROUND:

Trees.

Water.

Ruins.

Foreground:

Territories.

Animals.

Crops.

Particles.

This should create a sense of depth even if the world is primarily 2D/2.5D.

23. TECHNOLOGY

Use the existing project's framework where possible.

If appropriate, use:

React

Three.js

React Three Fiber

Canvas

CSS animations

WebGL

Do NOT introduce massive unnecessary dependencies.

Performance is extremely important.

The map must remain usable with many farmers.

Implement:

LOD

lazy loading

instancing

optimized textures

limited particle counts

efficient rendering

Do not render hundreds of unique high-poly animals simultaneously.

24. MOBILE

On mobile, the Jungle becomes a compact exploration interface.

The user should still be able to:

PAN

ZOOM

SELECT FARMER

VIEW STATUS

HARVEST

MANAGE FARMERS

Use bottom sheets instead of desktop side panels.

Do NOT simply stack the desktop interface.

25. BACKEND SAFETY RULE

This is critical.

Before modifying anything:

Inspect the existing codebase.

Identify:

wallet provider

contract addresses

ABIs

hooks

data fetching

transaction functions

farmer creation

farmer ownership

sowing

crop state

cooldowns

harvesting

rot

launchpads

categories

boosts

leaderboard

launches

Do not replace working blockchain functionality.

Wrap the existing functionality with the new frontend.

If the existing function is:

Field.sow()

the new UI may call it through:

"HUNT"

but the underlying call remains:

Field.sow()

Same principle for every contract interaction.

26. DATA MUST ALWAYS BE REAL

Never use fake protocol data.

Never hardcode:

farmer counts

leaderboard positions

crop status

timers

wallet balances

token launches

ownership

$FARM balances

contract state

All of these should be derived from the existing backend/blockchain.

For development, mock data may be used temporarily only if absolutely necessary, but production must use live data.

27. THE FINAL FEEL

The finished website should feel like:

A living digital jungle.

A strategy game.

An autonomous-agent ecosystem.

A premium crypto protocol.

An animal kingdom.

All at the same time.

The user should open the application and immediately think:

"Holy shit. This isn't a farming dashboard."

They should think:

"I'm inside the jungle."

FINAL DESIGN PRINCIPLE

The original product is:

FARMING AGENTS.

The new visual identity is:

KING OF THE JUNGLE.

The backend remains the farming protocol.

The frontend becomes the jungle.

The blockchain is the engine.

The farmers are predators.

The field is their territory.

The crops are their targets.

The harvest is the kill.

The leaderboard determines the food chain.

And at the top:

ONE KING.

Build this as a production-quality frontend.

Do not create a static mockup.

Do not fake functionality.

Do not remove existing functionality.

Do not break wallet interactions.

Do not change the smart contracts.

KEEP THE ENGINE.

REBUILD THE WORLD.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/29c93bd1-59f8-40e3-991a-840e0e0e7dd8).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
