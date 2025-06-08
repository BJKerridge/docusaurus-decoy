---
sidebar_position: 3
pagination_next: null
pagination_prev: null
title: ADM - System Activity
description: ADM
---

# Activity Defence Multiplier (ADM)
The Activity Defense Multiplier makes a system harder to capture based on activity that happens within it.
- At ADM 1.0x, we have a 18h vulnerability cycle with a 10 minute capture timer
- At ADM 6.0x, we have a 3h vulnerability cycle with a 60 minute capture timer

ADM is increased by these three counters:
- **Strategic Index:** Increases over time by holding sovereignty
- **Military Index:** Increases by killing NPCs, decreases by 1% per hour
- **Industry Index:** Increases by mining ores, decreases by 1% per hour

The indexes have levels from 0 to 5, increasing in difficulty.

### Defending IHubs
In order to attack an ihub, a pilot must lock it up and activate an Entosis Link. This will spool up (T1 = 5m, T2 = 2m) and take effect upon its second cycle.
These can be interrupted, by killing, jamming, or bumping the pilot out of range.
If no link is active on an ihub (or command node), they will passively repair in favour of the defender.
