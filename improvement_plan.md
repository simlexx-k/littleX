## LittleX Social Upgrade Plan

### Objective
Introduce AI-powered social media capabilities across the LittleX platform, building on the existing posting, follow, and feed primitives. The goal is to deliver intelligent content discovery, automated community building, enhanced conversation threading, and writing assistance across both the Jac backend and Jac-Client frontend.

### Discovery & Validation
1. Audit current backend nodes, walkers, and helper scripts in `littleX_BE` to document existing capabilities (profiles, tweets, feeds, embeds, search).
2. Review frontend (Jac-Client) components to understand current UI/UX surface for posting, feeds and profile interactions.
3. Identify missing instrumentation (e.g., engagement metrics, trending data) required to power AI features.

### Backend Enhancements
1. Extend graph schema with nodes/edges for:
   - Trending topics (@topic node, affinity edges)
   - Interest groups/community nodes with membership edges
   - Conversation threads with flow edges and thread metadata
   - Content themes/tags and user engagement tracking
2. Implement walkers that:
   - Curate advanced feeds via collaborative filtering (matching user interests, trending themes)
   - Generate hashtags and auto tag posts
   - Optimize conversation threads (summary/highlights, threading replies)
   - Discover communities by clustering interactions and proposing new groups
3. Implement `byLLM` helpers for:
   - Content suggestion/generation with tone/style guidance
   - Conversation starter creation and reply recommendations
   - Thread summarization and context-aware prompts
4. Introduce graph-based algorithms for:
   - Emerging community detection and optimal posting times
   - Viral content prediction (engagement momentum, trending hashtags)
   - Feedback loops from engagement metrics back into walker behavior

### Frontend (Jac-Client) Enhancements
1. Build new UI panels/components for:
   - AI writing assistant with auto-complete, tone switcher, and suggestion chips
   - Trending topics sidebar with topical filters and context cards
   - Intelligent thread navigation (summaries, jump-to, reply suggestions)
   - Personalized content discovery feeds and analytics dashboard
2. Add real-time collaboration features using `Spawn()` to backend walkers for:
   - Live discussion rooms and shared content creation canvases
   - Group brainstorming sessions with synchronous AI prompts
3. Surface conversation insights:
   - Smart reply suggestions inline with threaded view
   - Thread summaries/keywords accessible from threads
   - Community recommendation panels derived from backend grouping

### Analytics & Testing
1. Build dashboards that display:
   - Engagement patterns (likes, comments, shares)
   - Follower growth trajectories
   - Content performance (reach, predicted virality, best posting windows)
2. Instrument backend to collect metrics for all new walkers/nodes (timestamps, counts, AI prompt outcomes).
3. Extend existing `littleX_BE/littleX.test.jac` with scenario coverage for AI helpers, community discovery, and analytics reporting.
4. Add UI tests for new components and interaction flows, ideally using existing frontend test harnesses.

### Rollout & Documentation
1. Update README sections describing the new AI features, walkers, and UI experiences.
2. Document how to configure/extend `byLLM` helpers (e.g., keystore, model prefixes).
3. Provide troubleshooting notes for graph algorithms and collaborative session flows.

### Risks & Mitigations
1. **LLM cost/performance**: Start with stubbed `byLLM` outputs, then instrument caching/fallback logic.
2. **Thread consistency**: Ensure conversation flow edges maintain ordering; add validation in walkers.
3. **Data overload**: Limit analytics refresh windows and allow filtering on dashboards.

### Next Steps
1. Confirm backend schema extensions with stakeholders.
2. Prototype one AI-assisted feature (e.g., content suggestion walker + UI chip).
3. Incrementally build dashboard + real-time rooms, aligning on UX polish.
