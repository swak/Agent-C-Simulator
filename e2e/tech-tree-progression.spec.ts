/**
 * Integration Test: Tech Tree Progression
 *
 * Tests tech tree unlock flow and prerequisite validation.
 *
 * Expected: ALL TESTS FAIL (no UI implementation exists yet)
 */

import { test, expect } from '@playwright/test'

test.describe('Tech Tree Progression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('canvas', { timeout: 5000 })

    // Grant resources for testing
    await page.evaluate(() => {
      ;(window as any).game?.debug?.setResources({
        wood: 200,
        stone: 100,
        iron: 50,
      })
    })
  })

  test('BDD-06: Tech Tree Unlock', async ({ page }) => {
    // Given: The player has accumulated 50 wood and 30 stone
    await page.evaluate(() => {
      ;(window as any).game?.debug?.setResources({
        wood: 50,
        stone: 30,
      })
    })

    // When: The player opens the tech tree
    await page.keyboard.press('T')
    await expect(page.locator('[data-testid="tech-tree-modal"]')).toBeVisible()

    // And: Clicks on the locked "Advanced Miner Bot" node
    const techNode = page.locator('[data-testid="tech-node-advanced-miner"]')
    await expect(techNode).toBeVisible()
    await expect(techNode).toHaveClass(/locked/)

    await techNode.click()

    // Node detail should show
    await expect(page.locator('[data-testid="tech-node-detail"]')).toBeVisible()
    await expect(
      page.locator('[data-testid="tech-node-detail"]')
    ).toContainText('50 Wood, 30 Stone')

    // And: Confirms the unlock
    const unlockButton = page.locator('[data-testid="unlock-button"]')
    await expect(unlockButton).toBeEnabled()
    await unlockButton.click()

    // Then: The resources are consumed
    await page.keyboard.press('Escape') // Close tech tree
    const woodCounter = page.locator('[data-testid="resource-wood"]')
    const stoneCounter = page.locator('[data-testid="resource-stone"]')
    await expect(woodCounter).toContainText('0')
    await expect(stoneCounter).toContainText('0')

    // And: The "Advanced Miner Bot" node becomes available
    await page.keyboard.press('T') // Reopen
    await expect(techNode).not.toHaveClass(/locked/)
    await expect(techNode).toHaveClass(/unlocked/)

    // And: The Advanced Miner Bot blueprint is added to the bot creation menu
    await page.keyboard.press('Escape')
    await page.locator('[data-testid="bot-roster-add"]').click()

    const botTypeSelect = page.locator('[data-testid="bot-type-advanced-miner"]')
    await expect(botTypeSelect).toBeVisible()

    // And: A notification appears
    await expect(
      page.locator('[data-testid="notification-toast"]')
    ).toContainText('Unlocked: Advanced Miner Bot')
  })

  test('should display tech tree as node graph', async ({ page }) => {
    // Given: Tech tree is open
    await page.keyboard.press('T')

    // Then: Should show nodes and connecting lines
    const nodes = page.locator('[data-testid^="tech-node-"]')
    expect(await nodes.count()).toBeGreaterThan(5)

    const edges = page.locator('[data-testid^="tech-edge-"]')
    expect(await edges.count()).toBeGreaterThan(3)

    // Nodes should have visual states
    const unlockedNode = nodes.first()
    await expect(unlockedNode).toHaveClass(/unlocked/)

    const lockedNodes = await page
      .locator('[data-testid^="tech-node-"].locked')
      .count()
    expect(lockedNodes).toBeGreaterThan(0)
  })

  test('should show prerequisites for locked nodes', async ({ page }) => {
    // Given: Tech tree is open
    await page.keyboard.press('T')

    // When: Clicking a locked node with prerequisites
    const advancedNode = page.locator('[data-testid="tech-node-expert-miner"]')
    await advancedNode.click()

    // Then: Detail panel should show prerequisite nodes
    const detail = page.locator('[data-testid="tech-node-detail"]')
    await expect(detail.locator('[data-testid="prerequisite-list"]')).toBeVisible()
    await expect(
      detail.locator('[data-testid="prerequisite-list"]')
    ).toContainText('Requires: Advanced Miner Bot')

    // Unlock button should be disabled
    await expect(page.locator('[data-testid="unlock-button"]')).toBeDisabled()
  })

  test('should prevent unlock if prerequisites not met', async ({ page }) => {
    // Given: Sufficient resources but missing prerequisite
    await page.evaluate(() => {
      ;(window as any).game?.debug?.setResources({
        wood: 100,
        stone: 100,
        iron: 50,
      })
    })

    await page.keyboard.press('T')

    // When: Attempting to unlock advanced node
    const advancedNode = page.locator('[data-testid="tech-node-expert-miner"]')
    await advancedNode.click()

    const unlockButton = page.locator('[data-testid="unlock-button"]')

    // Then: Button should be disabled with tooltip
    await expect(unlockButton).toBeDisabled()
    await unlockButton.hover()
    await expect(page.locator('[data-testid="tooltip"]')).toContainText(
      'Prerequisite not met'
    )
  })

  test('should track unlock progress visually', async ({ page }) => {
    // Given: Some nodes unlocked
    await page.evaluate(() => {
      ;(window as any).game?.debug?.unlockTechNode('basic-miner')
      ;(window as any).game?.debug?.unlockTechNode('advanced-miner')
    })

    await page.keyboard.press('T')

    // When: Viewing tech tree
    // Then: Progress indicator should show
    const progressBar = page.locator('[data-testid="tech-tree-progress"]')
    await expect(progressBar).toBeVisible()

    const progressText = await progressBar.textContent()
    expect(progressText).toMatch(/\d+\/\d+ Unlocked/)

    // Visual path highlighting
    const unlockedPath = page.locator('[data-testid="tech-path-unlocked"]')
    await expect(unlockedPath).toBeVisible()
  })

  test('should support keyboard navigation in tech tree', async ({ page }) => {
    // Given: Tech tree is open
    await page.keyboard.press('T')

    // When: Using arrow keys to navigate
    await page.keyboard.press('ArrowRight')

    // Then: Next node should be focused
    const focusedNode = page.locator('[data-testid^="tech-node-"]:focus')
    await expect(focusedNode).toBeVisible()

    // Enter to select
    await page.keyboard.press('Enter')
    await expect(page.locator('[data-testid="tech-node-detail"]')).toBeVisible()
  })

  test('should show "NEW" badge on freshly unlocked nodes', async ({ page }) => {
    // Given: Tech tree with some unlocked nodes
    await page.keyboard.press('T')

    const node = page.locator('[data-testid="tech-node-basic-hauler"]')
    await node.click()

    // When: Unlocking a new node
    await page.locator('[data-testid="unlock-button"]').click()

    // Then: Node should have NEW badge
    await expect(node.locator('[data-testid="new-badge"]')).toBeVisible()

    // Badge should disappear after viewing detail again
    await node.click()
    await page.keyboard.press('Escape')
    await expect(node.locator('[data-testid="new-badge"]')).not.toBeVisible()
  })

  test('should show unlock animation', async ({ page }) => {
    // Given: About to unlock a node
    await page.keyboard.press('T')

    const node = page.locator('[data-testid="tech-node-basic-hauler"]')
    await node.click()
    await page.locator('[data-testid="unlock-button"]').click()

    // When: Unlock completes
    // Then: Animation should play
    await expect(node).toHaveClass(/unlocking/)

    // Wait for animation
    await page.waitForTimeout(1000)

    await expect(node).toHaveClass(/unlocked/)
    await expect(node).not.toHaveClass(/unlocking/)

    // Particle burst or glow effect
    await expect(
      page.locator('[data-testid="unlock-effect"]')
    ).toBeVisible({ timeout: 500 })
  })

  test('should display node benefits in tooltip', async ({ page }) => {
    // Given: Tech tree is open
    await page.keyboard.press('T')

    // When: Hovering over a node
    const node = page.locator('[data-testid="tech-node-advanced-miner"]')
    await node.hover()

    // Then: Tooltip should show benefits
    const tooltip = page.locator('[data-testid="tooltip"]')
    await expect(tooltip).toBeVisible()
    await expect(tooltip).toContainText('Unlocks:')
    await expect(tooltip).toContainText('Advanced Miner Bot')
    await expect(tooltip).toContainText('+50% mining speed')
  })

  test('should support zooming and panning tech tree', async ({ page }) => {
    // Given: Tech tree is open with many nodes
    await page.keyboard.press('T')

    const techTreeCanvas = page.locator('[data-testid="tech-tree-canvas"]')

    // When: Scrolling to zoom
    await techTreeCanvas.hover()
    await page.mouse.wheel(0, -100) // Scroll up to zoom in

    // Then: Zoom level should increase
    const zoomLevel = await page.evaluate(() => {
      return (window as any).game?.techTree?.zoomLevel || 1
    })
    expect(zoomLevel).toBeGreaterThan(1)

    // When: Dragging to pan
    await techTreeCanvas.hover()
    await page.mouse.down()
    await page.mouse.move(100, 100)
    await page.mouse.up()

    // Then: View should pan
    const panOffset = await page.evaluate(() => {
      return (window as any).game?.techTree?.panOffset || { x: 0, y: 0 }
    })
    expect(Math.abs(panOffset.x) + Math.abs(panOffset.y)).toBeGreaterThan(0)
  })
})

test.describe('Tech Tree - Mobile', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  })

  test('should adapt tech tree layout for vertical screen', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForSelector('canvas', { timeout: 5000 })

    // When: Opening tech tree on mobile
    await page.locator('[data-testid="fab-menu"]').tap()
    await page.locator('[data-testid="menu-tech-tree"]').tap()

    // Then: Tech tree should be full-screen and scrollable vertically
    const techTree = page.locator('[data-testid="tech-tree-modal"]')
    await expect(techTree).toBeVisible()

    const box = await techTree.boundingBox()
    expect(box?.height).toBeGreaterThan(800)

    // Nodes should be arranged in vertical columns
    const nodePositions = await page.evaluate(() => {
      const nodes = Array.from(
        document.querySelectorAll('[data-testid^="tech-node-"]')
      )
      return nodes.map((n) => {
        const rect = n.getBoundingClientRect()
        return { x: rect.x, y: rect.y }
      })
    })

    // Check that nodes are vertically stacked
    const verticalSpread =
      Math.max(...nodePositions.map((p) => p.y)) -
      Math.min(...nodePositions.map((p) => p.y))
    expect(verticalSpread).toBeGreaterThan(400)
  })

  test('should support pinch zoom in tech tree', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('canvas', { timeout: 5000 })

    await page.locator('[data-testid="fab-menu"]').tap()
    await page.locator('[data-testid="menu-tech-tree"]').tap()

    const techTree = page.locator('[data-testid="tech-tree-canvas"]')

    // When: Pinching to zoom
    const box = await techTree.boundingBox()
    if (!box) throw new Error('Tech tree not found')

    await page.touchscreen.tap(box.x + 100, box.y + 100)
    await page.touchscreen.tap(box.x + 200, box.y + 100)

    // Then: Zoom should change
    const zoomLevel = await page.evaluate(() => {
      return (window as any).game?.techTree?.zoomLevel || 1
    })
    expect(zoomLevel).not.toBe(1)
  })
})
