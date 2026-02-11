# Test Suite for Agent-C Simulator V1

This test suite follows **Test-Driven Development (TDD)** principles. All tests are written **BEFORE** implementation and are expected to **FAIL initially** (Red phase).

## Test Coverage Summary

| Category | Test Count | Coverage Target | Files |
|----------|-----------|----------------|-------|
| **Unit Tests** | 82 | 99% code coverage | `__tests__/stores/`, `__tests__/ecs/` |
| **Integration Tests** | 46 | All P0 user flows | `e2e/*.spec.ts` |
| **Performance Tests** | 24 | 60fps desktop, 30fps mobile | `__tests__/performance/` |
| **Accessibility Tests** | 18 | WCAG AA compliance | `e2e/accessibility.spec.ts` |
| **TOTAL** | **146** | **99% combined** | |

## BDD Scenarios Covered

All user stories from `product-spec.md` are tested:

- **BDD-01:** First Bot Placement and Gathering
- **BDD-02:** Resource Gathering Loop (gather → return → repeat)
- **BDD-03:** Crafting a Bot Upgrade
- **BDD-04:** Offline Progress Accumulation (2-hour test, 8-hour cap)
- **BDD-05:** Cross-Platform Touch Controls (pinch, rotate, tap)
- **BDD-06:** Tech Tree Unlock with Prerequisites

## Running Tests

### Unit Tests (Vitest)

```bash
# Run all unit tests
npm run test

# Run with coverage report
npm run test:coverage

# Watch mode for TDD
npm run test:watch

# Run specific test file
npm run test __tests__/stores/game-state.test.ts
```

### Integration Tests (Playwright)

```bash
# Run all integration tests
npm run test:e2e

# Run specific browser
npm run test:e2e -- --project="Desktop Chrome"

# Run specific test file
npm run test:e2e e2e/bot-placement.spec.ts

# Debug mode (headed browser)
npm run test:e2e -- --debug

# Generate HTML report
npm run test:e2e -- --reporter=html
```

### Performance Tests

```bash
# Run performance benchmarks
npm run test:performance

# Check frame rate on specific device
npm run test:performance -- --grep "Desktop Performance"
```

### Accessibility Tests

```bash
# Run accessibility audit
npm run test:a11y

# Run with specific viewport
npm run test:a11y -- --project="Mobile Chrome"
```

## Test Structure

### Unit Tests

**Location:** `__tests__/`

Tests pure game logic without rendering:

- **Game State** (`stores/game-state.test.ts`): Resource management, bot inventory, tech tree, crafting, save/load
- **Bot Entity** (`ecs/bot-entity.test.ts`): ECS components, AI state machine, pathfinding, gathering, energy system

**Key Pattern:**
```typescript
describe('Feature', () => {
  it('should behave correctly', () => {
    // Given: Initial state
    const state = createState()

    // When: Action is performed
    const result = performAction(state)

    // Then: Expected outcome
    expect(result).toBe(expected)
  })
})
```

### Integration Tests

**Location:** `e2e/`

Tests complete user flows in a real browser:

- **Bot Placement** (`bot-placement.spec.ts`): Drag-and-drop, task assignment, gathering loop
- **Crafting** (`crafting-workflow.spec.ts`): Recipe selection, crafting queue, upgrade application
- **Tech Tree** (`tech-tree-progression.spec.ts`): Node unlocking, prerequisites, navigation
- **Offline Progress** (`offline-progress.spec.ts`): Time-based accumulation, welcome screen

**Key Pattern:**
```typescript
test('BDD-01: User Story', async ({ page }) => {
  // Given: User state
  await page.goto('/')

  // When: User action
  await page.click('[data-testid="button"]')

  // Then: Visible result
  await expect(page.locator('[data-testid="result"]')).toBeVisible()
})
```

### Performance Tests

**Location:** `__tests__/performance/`

Validates frame rate and load time targets:

- **Desktop:** 60fps with 20 bots, < 200 draw calls
- **Mobile:** 30fps with 10 bots, < 100 draw calls
- **Load Time:** < 3 seconds initial load
- **Offline Calc:** < 200ms for 8 hours of progress

### Accessibility Tests

**Location:** `e2e/accessibility.spec.ts`

Validates WCAG AA compliance:

- Keyboard navigation (Tab, Arrow keys, Enter, Escape)
- Touch targets (minimum 44×44px)
- Color contrast ratios
- ARIA labels and screen reader support
- Reduced motion preference

## Performance Benchmarks

| Metric | Desktop | Mobile | Test |
|--------|---------|--------|------|
| **Frame Rate** | 60 FPS (min 50) | 30 FPS (min 25) | `frame-rate.test.ts` |
| **Draw Calls** | < 200 | < 100 | `frame-rate.test.ts` |
| **Polygon Count** | 1-2M triangles | 300K-500K triangles | `frame-rate.test.ts` |
| **Frame Budget** | < 16.67ms | < 33.33ms | `frame-rate.test.ts` |
| **Load Time** | < 2 seconds | < 3 seconds | `frame-rate.test.ts` |
| **Offline Calc** | < 200ms (8 hrs) | < 200ms (8 hrs) | `game-state.test.ts` |

## Test Data Attributes

All tests use `data-testid` attributes for stable selectors:

```tsx
// In component:
<button data-testid="craft-button">Craft</button>

// In test:
await page.click('[data-testid="craft-button"]')
```

**Common Test IDs:**
- `bot-roster` - Bot inventory list
- `bot-item` - Individual bot in roster
- `bot-entity` - Bot in 3D world
- `resource-{type}` - Resource counter (wood, stone, iron)
- `crafting-panel` - Crafting menu
- `recipe-{name}` - Crafting recipe card
- `tech-tree-modal` - Tech tree overlay
- `tech-node-{id}` - Tech tree node
- `welcome-back-screen` - Offline progress screen

## Coverage Requirements

### Unit Test Coverage: 99%

All game logic must be covered:

```bash
npm run test:coverage
```

**Required Coverage:**
- `stores/` - 99% (state management)
- `ecs/` - 99% (entity logic)
- `lib/` - 99% (utilities)

**Excluded from coverage:**
- `__tests__/` - Test files
- `e2e/` - Integration tests
- `.next/` - Build output
- `node_modules/` - Dependencies

### Integration Test Coverage

All P0 user flows from `product-spec.md`:

- ✅ Bot placement and task assignment
- ✅ Resource gathering loop
- ✅ Crafting workflow
- ✅ Tech tree progression
- ✅ Offline progress accumulation
- ✅ Touch controls on mobile

## TDD Workflow

### 1. Red Phase (Current)

All tests are written and **expected to FAIL** because implementation doesn't exist yet.

```bash
npm run test
# Expected: All tests fail with "Cannot find module" or "undefined"
```

### 2. Green Phase (Next)

Implement minimal code to make tests pass:

```bash
npm run test:watch
# Write code until tests pass
```

### 3. Refactor Phase

Improve code quality while keeping tests green:

```bash
npm run test:coverage
# Ensure 99% coverage maintained
```

## Mock Data and Test Utilities

### Setup File (`__tests__/setup.ts`)

Configures test environment:

- WebGL context mock (Three.js requires it)
- localStorage mock
- Howler.js audio mock
- window.matchMedia mock

### Debug Helpers

Tests use `window.game.debug` API:

```typescript
// In test:
await page.evaluate(() => {
  window.game.debug.addResources({ wood: 100 })
  window.game.debug.addBot({ type: 'miner' })
  window.game.debug.unlockTechNode('advanced-miner')
})
```

**Debug API** (to be implemented):
- `addResources(resources)` - Grant resources
- `setResources(resources)` - Set exact amounts
- `addBot(config)` - Spawn bot instantly
- `updateBotStatus(id, status)` - Change bot state
- `unlockTechNode(id)` - Unlock tech instantly
- `addInventoryItem(itemType)` - Grant crafted item

## CI/CD Integration

### GitHub Actions (Recommended)

```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Troubleshooting

### Tests Not Found

```bash
# Check test file paths
npm run test -- --reporter=verbose
```

### WebGL Errors

```bash
# Setup file should mock WebGL
# If errors persist, check __tests__/setup.ts
```

### Playwright Timeouts

```bash
# Increase timeout in playwright.config.ts
use: {
  timeout: 60000, // 60 seconds
}
```

### Coverage Not 99%

```bash
# Identify uncovered lines
npm run test:coverage
# Open coverage/index.html in browser
```

## Next Steps

1. **Run tests to verify they fail** (Red phase)
2. **Implement game logic** to make tests pass (Green phase)
3. **Refactor code** while maintaining test coverage
4. **Verify performance benchmarks** on target devices
5. **Run accessibility audit** and fix violations

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [React Three Fiber Testing](https://docs.pmnd.rs/react-three-fiber/api/test-renderer)
- [WCAG AA Guidelines](https://www.w3.org/WAI/WCAG2AA-Conformance)

---

**Status:** Tests written, implementation pending
**Phase:** Red (TDD)
**Coverage Target:** 99%
**Workstream:** WS-01
