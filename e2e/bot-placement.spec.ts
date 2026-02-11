/**
 * Integration Test: Bot Placement and Task Assignment
 *
 * Tests the complete user flow from bot placement to resource gathering.
 * Uses Playwright for browser automation and visual verification.
 *
 * Expected: ALL TESTS FAIL (no UI implementation exists yet)
 */

import { test, expect, Page } from '@playwright/test'

test.describe('Bot Placement and Task Assignment', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to game
    await page.goto('/')

    // Wait for 3D canvas to load
    await page.waitForSelector('canvas', { timeout: 5000 })

    // Wait for game initialization
    await page.waitForTimeout(1000)
  })

  test('BDD-01: First Bot Placement and Gathering', async ({ page }) => {
    // Given: The player has just started the game and has one basic bot
    await expect(page.locator('[data-testid="bot-roster"]')).toBeVisible()
    const botCount = await page.locator('[data-testid="bot-item"]').count()
    expect(botCount).toBeGreaterThanOrEqual(1)

    // When: The player drags the bot near a glowing tree resource node
    const firstBot = page.locator('[data-testid="bot-item"]').first()
    const resourceNode = page.locator('[data-testid="resource-node-wood"]').first()

    // Drag bot to resource node
    await firstBot.dragTo(resourceNode)

    // Then: The bot begins gathering wood automatically
    await expect(page.locator('[data-testid="bot-status-working"]')).toBeVisible({
      timeout: 2000,
    })

    // And: The bot plays a gathering animation with audio feedback
    // Visual check: bot should have gathering animation class
    const botInWorld = page.locator('[data-testid="bot-entity"]').first()
    await expect(botInWorld).toHaveClass(/gathering/)

    // And: The wood count in the HUD increments visibly
    const woodCounter = page.locator('[data-testid="resource-wood"]')
    const initialWood = parseInt(
      (await woodCounter.textContent()) || '0'
    )

    // Wait for resource increment (should happen within 5 seconds)
    await page.waitForFunction(
      (selector) => {
        const el = document.querySelector(selector)
        return el && parseInt(el.textContent || '0') > 0
      },
      '[data-testid="resource-wood"]',
      { timeout: 5000 }
    )

    const finalWood = parseInt((await woodCounter.textContent()) || '0')
    expect(finalWood).toBeGreaterThan(initialWood)
  })

  test('BDD-02: Resource Gathering Loop', async ({ page }) => {
    // Given: A bot is actively gathering resources from a node
    await placeBotNearResource(page, 'wood')

    // Wait for bot to start gathering
    await page.waitForSelector('[data-testid="bot-status-working"]', {
      timeout: 3000,
    })

    // When: The bot's inventory reaches full capacity
    // Monitor bot inventory through data attribute
    await page.waitForFunction(
      () => {
        const bot = document.querySelector('[data-testid="bot-entity"]')
        return bot?.getAttribute('data-inventory-full') === 'true'
      },
      { timeout: 30000 } // 30 seconds max
    )

    // Then: The bot travels to the nearest storage point
    await expect(page.locator('[data-testid="bot-status-returning"]')).toBeVisible({
      timeout: 5000,
    })

    // And: Deposits the resources
    await page.waitForFunction(
      () => {
        const bot = document.querySelector('[data-testid="bot-entity"]')
        return bot?.getAttribute('data-inventory-full') === 'false'
      },
      { timeout: 10000 }
    )

    // And: Returns to the resource node to continue gathering
    await expect(page.locator('[data-testid="bot-status-working"]')).toBeVisible({
      timeout: 5000,
    })
  })

  test('should show invalid placement feedback', async ({ page }) => {
    // Given: A bot selected for placement
    const firstBot = page.locator('[data-testid="bot-item"]').first()
    await firstBot.click()

    // When: Attempting to place in invalid location (e.g., too close to another bot)
    const invalidArea = page.locator('[data-testid="blocked-terrain"]').first()
    await invalidArea.click()

    // Then: Should show error feedback
    await expect(page.locator('[data-testid="placement-error"]')).toBeVisible()
    const errorText = await page.locator('[data-testid="placement-error"]').textContent()
    expect(errorText).toContain('Invalid placement')
  })

  test('should display bot status tooltip on hover', async ({ page }) => {
    // Given: A bot in the game world
    await placeBotNearResource(page, 'stone')

    const bot = page.locator('[data-testid="bot-entity"]').first()

    // When: Hovering over the bot
    await bot.hover()

    // Then: Tooltip should appear with status information
    await expect(page.locator('[data-testid="bot-tooltip"]')).toBeVisible()

    const tooltip = page.locator('[data-testid="bot-tooltip"]')
    await expect(tooltip).toContainText(/Energy:/)
    await expect(tooltip).toContainText(/Status:/)
    await expect(tooltip).toContainText(/Task:/)
  })

  test('should support keyboard selection of bots', async ({ page }) => {
    // Given: Multiple bots in roster
    await addMultipleBots(page, 3)

    // When: Using Q/E keys to cycle through bots
    await page.keyboard.press('Q')

    // Then: First bot should be selected
    await expect(
      page.locator('[data-testid="bot-item"]').first()
    ).toHaveClass(/selected/)

    // When: Pressing E to go to next
    await page.keyboard.press('E')

    // Then: Second bot should be selected
    await expect(
      page.locator('[data-testid="bot-item"]').nth(1)
    ).toHaveClass(/selected/)
  })

  test('should handle multi-select with shift-click', async ({ page }) => {
    // Given: Multiple bots placed
    await placeBotNearResource(page, 'wood')
    await placeBotNearResource(page, 'stone')

    const firstBot = page.locator('[data-testid="bot-entity"]').first()
    const secondBot = page.locator('[data-testid="bot-entity"]').nth(1)

    // When: Shift-clicking multiple bots
    await firstBot.click()
    await secondBot.click({ modifiers: ['Shift'] })

    // Then: Both bots should be selected
    await expect(firstBot).toHaveClass(/selected/)
    await expect(secondBot).toHaveClass(/selected/)

    const selectedCount = await page
      .locator('[data-testid="bot-entity"].selected')
      .count()
    expect(selectedCount).toBe(2)
  })

  test('should show gathering particle effects', async ({ page }) => {
    // Given: A bot gathering resources
    await placeBotNearResource(page, 'wood')

    await page.waitForSelector('[data-testid="bot-status-working"]', {
      timeout: 3000,
    })

    // When: Bot is actively gathering
    // Then: Particle effects should be visible
    await expect(
      page.locator('[data-testid="particle-system-gathering"]')
    ).toBeVisible({ timeout: 5000 })

    // Check that particles are animating (canvas should update)
    const canvas = page.locator('canvas')
    const initialSnapshot = await canvas.screenshot()

    await page.waitForTimeout(1000)

    const laterSnapshot = await canvas.screenshot()

    // Snapshots should differ (indicating animation)
    expect(initialSnapshot.equals(laterSnapshot)).toBe(false)
  })
})

test.describe('Touch Controls (Mobile)', () => {
  test.use({
    viewport: { width: 390, height: 844 }, // iPhone 14 Pro
    hasTouch: true,
  })

  test('BDD-05: Cross-Platform Touch Controls', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('canvas', { timeout: 5000 })

    const canvas = page.locator('canvas')

    // Given: The player is on a mobile device
    // When: The player pinches two fingers together on the screen
    await pinchZoom(page, canvas, 'in', 0.5)

    // Then: The camera zooms in
    // Check camera distance decreased (via data attribute or JS evaluation)
    const zoomLevelAfterPinchIn = await page.evaluate(() => {
      return (window as any).game?.camera?.zoom || 1
    })
    expect(zoomLevelAfterPinchIn).toBeGreaterThan(1)

    // When: The player spreads two fingers apart
    await pinchZoom(page, canvas, 'out', 2)

    // Then: The camera zooms out
    const zoomLevelAfterPinchOut = await page.evaluate(() => {
      return (window as any).game?.camera?.zoom || 1
    })
    expect(zoomLevelAfterPinchOut).toBeLessThan(zoomLevelAfterPinchIn)

    // When: The player drags two fingers across the screen
    await twoFingerDrag(page, canvas, { x: 100, y: 100 })

    // Then: The camera rotates around the scene
    const cameraRotation = await page.evaluate(() => {
      return (window as any).game?.camera?.rotation?.y || 0
    })
    expect(Math.abs(cameraRotation)).toBeGreaterThan(0)

    // When: The player taps a bot
    const bot = page.locator('[data-testid="bot-entity"]').first()
    await bot.tap()

    // Then: The bot is selected with visual feedback
    await expect(bot).toHaveClass(/selected/)
    await expect(page.locator('[data-testid="bot-tooltip"]')).toBeVisible()
  })

  test('should have minimum 44px touch targets', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('canvas', { timeout: 5000 })

    // Check UI button sizes
    const buttons = page.locator('button')
    const count = await buttons.count()

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i)
      const box = await button.boundingBox()

      if (box) {
        expect(box.width).toBeGreaterThanOrEqual(44)
        expect(box.height).toBeGreaterThanOrEqual(44)
      }
    }
  })

  test('should support single-thumb radial menu', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('canvas', { timeout: 5000 })

    // Given: A bot selected on mobile
    const bot = page.locator('[data-testid="bot-entity"]').first()
    await bot.tap()

    // When: Long-pressing the bot
    await bot.tap({ timeout: 1000 }) // Long press simulation

    // Then: Radial menu should appear
    await expect(page.locator('[data-testid="radial-menu"]')).toBeVisible()

    // Menu should have action options
    await expect(page.locator('[data-testid="menu-action-gather"]')).toBeVisible()
    await expect(page.locator('[data-testid="menu-action-upgrade"]')).toBeVisible()
  })
})

// Helper Functions

async function placeBotNearResource(page: Page, resourceType: string) {
  const bot = page.locator('[data-testid="bot-item"]').first()
  const resource = page
    .locator(`[data-testid="resource-node-${resourceType}"]`)
    .first()

  await bot.dragTo(resource)

  // Wait for placement confirmation
  await page.waitForSelector('[data-testid="bot-entity"]', { timeout: 2000 })
}

async function addMultipleBots(page: Page, count: number) {
  // Click "Add Bot" button multiple times (assuming debug/test mode)
  for (let i = 0; i < count; i++) {
    await page.locator('[data-testid="add-bot-button"]').click()
    await page.waitForTimeout(100)
  }
}

async function pinchZoom(
  page: Page,
  element: any,
  direction: 'in' | 'out',
  scale: number
) {
  const box = await element.boundingBox()
  if (!box) throw new Error('Element not found')

  const centerX = box.x + box.width / 2
  const centerY = box.y + box.height / 2

  const distance = direction === 'in' ? -50 : 50

  await page.touchscreen.tap(centerX - distance, centerY)
  await page.touchscreen.tap(centerX + distance, centerY)
}

async function twoFingerDrag(
  page: Page,
  element: any,
  delta: { x: number; y: number }
) {
  const box = await element.boundingBox()
  if (!box) throw new Error('Element not found')

  const startX = box.x + box.width / 2
  const startY = box.y + box.height / 2

  // Simulate two-finger drag by moving both touch points
  await page.touchscreen.tap(startX - 20, startY)
  await page.touchscreen.tap(startX + 20, startY)

  await page.mouse.move(startX + delta.x, startY + delta.y)
}
