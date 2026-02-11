/**
 * Integration Test: Crafting Workflow
 *
 * Tests complete crafting flow:
 * - Recipe discovery and validation
 * - Resource consumption
 * - Crafting queue management
 * - Item application to bots
 *
 * Expected: ALL TESTS FAIL (no UI implementation exists yet)
 */

import { test, expect } from '@playwright/test'

test.describe('Crafting Workflow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('canvas', { timeout: 5000 })

    // Grant initial resources for testing
    await page.evaluate(() => {
      ;(window as any).game?.debug?.addResources({
        wood: 50,
        stone: 30,
        iron: 10,
      })
    })
  })

  test('BDD-03: Crafting a Bot Upgrade', async ({ page }) => {
    // Given: The player has collected 10 wood and 5 stone
    await page.evaluate(() => {
      ;(window as any).game?.debug?.setResources({
        wood: 10,
        stone: 5,
      })
    })

    const woodCounter = page.locator('[data-testid="resource-wood"]')
    await expect(woodCounter).toContainText('10')

    const stoneCounter = page.locator('[data-testid="resource-stone"]')
    await expect(stoneCounter).toContainText('5')

    // When: The player opens the crafting menu
    await page.keyboard.press('C')
    await expect(page.locator('[data-testid="crafting-panel"]')).toBeVisible()

    // And: Selects a "Speed Boost" recipe (requires 10 wood + 5 stone)
    const recipe = page.locator('[data-testid="recipe-speed-boost"]')
    await expect(recipe).toBeVisible()
    await recipe.click()

    // Recipe should show requirements
    await expect(recipe.locator('[data-testid="recipe-cost"]')).toContainText(
      '10 Wood, 5 Stone'
    )

    // And: Clicks the "Craft" button
    const craftButton = page.locator('[data-testid="craft-button"]')
    await expect(craftButton).toBeEnabled()
    await craftButton.click()

    // Then: The resources are consumed from inventory
    await expect(woodCounter).toContainText('0')
    await expect(stoneCounter).toContainText('0')

    // And: A "Speed Boost" item appears in the inventory
    const inventoryItem = page.locator('[data-testid="inventory-speed-boost"]')
    await expect(inventoryItem).toBeVisible({ timeout: 5000 })

    // And: The player receives visual and audio confirmation
    await expect(page.locator('[data-testid="craft-complete-toast"]')).toBeVisible()
    await expect(page.locator('[data-testid="craft-complete-toast"]')).toContainText(
      'Speed Boost crafted'
    )
  })

  test('should disable craft button when resources insufficient', async ({
    page,
  }) => {
    // Given: Insufficient resources
    await page.evaluate(() => {
      ;(window as any).game?.debug?.setResources({
        wood: 5,
        stone: 2,
      })
    })

    // When: Opening crafting menu
    await page.keyboard.press('C')

    // Then: Craft button for expensive recipe should be disabled
    const recipe = page.locator('[data-testid="recipe-advanced-component"]')
    await recipe.click()

    const craftButton = page.locator('[data-testid="craft-button"]')
    await expect(craftButton).toBeDisabled()

    // Tooltip should explain why
    await craftButton.hover()
    await expect(page.locator('[data-testid="tooltip"]')).toContainText(
      'Insufficient resources'
    )
  })

  test('should show recipe preview with ingredient breakdown', async ({
    page,
  }) => {
    // Given: Crafting panel is open
    await page.keyboard.press('C')

    // When: Hovering over a recipe
    const recipe = page.locator('[data-testid="recipe-gear-component"]')
    await recipe.hover()

    // Then: Preview should show ingredients and output
    const preview = page.locator('[data-testid="recipe-preview"]')
    await expect(preview).toBeVisible()
    await expect(preview.locator('[data-testid="ingredient-list"]')).toContainText(
      'Iron'
    )
    await expect(preview.locator('[data-testid="output-item"]')).toContainText(
      'Gear Component'
    )
  })

  test('should support crafting queue for multiple items', async ({ page }) => {
    // Given: Sufficient resources for multiple crafts
    await page.evaluate(() => {
      ;(window as any).game?.debug?.setResources({
        wood: 50,
        stone: 30,
      })
    })

    await page.keyboard.press('C')

    // When: Clicking "Craft x5" button
    const recipe = page.locator('[data-testid="recipe-basic-component"]')
    await recipe.click()

    const craftMultipleButton = page.locator('[data-testid="craft-multiple-button"]')
    await craftMultipleButton.click()

    // Select quantity
    const quantityInput = page.locator('[data-testid="craft-quantity-input"]')
    await quantityInput.fill('3')

    await page.locator('[data-testid="confirm-craft-button"]').click()

    // Then: Queue should show 3 items
    const queuePanel = page.locator('[data-testid="crafting-queue"]')
    await expect(queuePanel).toBeVisible()

    const queueItems = queuePanel.locator('[data-testid="queue-item"]')
    expect(await queueItems.count()).toBe(3)

    // First item should show progress bar
    const firstQueueItem = queueItems.first()
    await expect(
      firstQueueItem.locator('[data-testid="progress-bar"]')
    ).toBeVisible()
  })

  test('should complete crafting and notify player', async ({ page }) => {
    // Given: A short-duration craft in queue
    await page.evaluate(() => {
      ;(window as any).game?.debug?.setResources({ wood: 10, stone: 5 })
    })

    await page.keyboard.press('C')
    const recipe = page.locator('[data-testid="recipe-quick-craft"]')
    await recipe.click()
    await page.locator('[data-testid="craft-button"]').click()

    // When: Waiting for craft to complete (2 seconds)
    await page.waitForTimeout(2500)

    // Then: Notification should appear
    await expect(page.locator('[data-testid="craft-complete-toast"]')).toBeVisible()

    // Item should be in inventory
    const inventoryItem = page.locator('[data-testid="inventory-item"]').first()
    await expect(inventoryItem).toBeVisible()

    // Audio feedback should play (check via data attribute or event)
    const audioPlayed = await page.evaluate(() => {
      return (window as any).game?.audio?.lastPlayed === 'craft-complete'
    })
    expect(audioPlayed).toBe(true)
  })

  test('should apply crafted upgrade to bot', async ({ page }) => {
    // Given: A crafted upgrade in inventory
    await page.evaluate(() => {
      ;(window as any).game?.debug?.addInventoryItem('speed-upgrade')
    })

    // When: Opening bot roster and selecting a bot
    const bot = page.locator('[data-testid="bot-item"]').first()
    await bot.click()

    // Double-click to open detail panel
    await bot.dblclick()

    await expect(page.locator('[data-testid="bot-detail-panel"]')).toBeVisible()

    // And: Dragging upgrade to bot
    const upgrade = page.locator('[data-testid="inventory-speed-upgrade"]')
    const upgradeSlot = page.locator('[data-testid="bot-upgrade-slot"]').first()

    await upgrade.dragTo(upgradeSlot)

    // Then: Upgrade should be applied
    await expect(upgradeSlot).toContainText('Speed Upgrade')

    // Bot stats should update
    const speedStat = page.locator('[data-testid="bot-stat-speed"]')
    const speedValue = await speedStat.textContent()
    expect(parseFloat(speedValue || '0')).toBeGreaterThan(1.0)

    // Upgrade consumed from inventory
    await expect(upgrade).not.toBeVisible()
  })

  test('should show visual feedback when upgrade applied', async ({ page }) => {
    // Given: A bot and an upgrade
    await page.evaluate(() => {
      ;(window as any).game?.debug?.addInventoryItem('capacity-upgrade')
    })

    const bot = page.locator('[data-testid="bot-item"]').first()
    await bot.dblclick()

    // When: Applying upgrade
    const upgrade = page.locator('[data-testid="inventory-capacity-upgrade"]')
    const upgradeSlot = page.locator('[data-testid="bot-upgrade-slot"]').first()
    await upgrade.dragTo(upgradeSlot)

    // Then: Visual effect should play on bot in 3D world
    const botEntity = page.locator('[data-testid="bot-entity"]').first()
    await expect(botEntity).toHaveClass(/upgrading/)

    // Wait for animation to complete
    await page.waitForTimeout(1000)

    // Bot appearance should change (data attribute)
    const hasUpgrade = await botEntity.getAttribute('data-has-upgrades')
    expect(hasUpgrade).toBe('true')
  })

  test('should filter recipes by category', async ({ page }) => {
    // Given: Crafting panel is open
    await page.keyboard.press('C')

    // When: Selecting "Components" category
    await page.locator('[data-testid="category-components"]').click()

    // Then: Only component recipes should be visible
    const recipes = page.locator('[data-testid^="recipe-"]')
    const count = await recipes.count()

    for (let i = 0; i < count; i++) {
      const recipe = recipes.nth(i)
      const category = await recipe.getAttribute('data-category')
      expect(category).toBe('components')
    }
  })

  test('should unlock recipes through tech tree progression', async ({
    page,
  }) => {
    // Given: A locked recipe
    await page.keyboard.press('C')
    const lockedRecipe = page.locator('[data-testid="recipe-advanced-gear"]')
    await expect(lockedRecipe).toHaveClass(/locked/)

    // When: Unlocking required tech node
    await page.keyboard.press('T') // Open tech tree
    await page.evaluate(() => {
      ;(window as any).game?.debug?.unlockTechNode('advanced-crafting')
    })

    // Close tech tree
    await page.keyboard.press('Escape')

    // Reopen crafting
    await page.keyboard.press('C')

    // Then: Recipe should now be unlocked
    await expect(lockedRecipe).not.toHaveClass(/locked/)
    await expect(lockedRecipe.locator('[data-testid="new-badge"]')).toBeVisible()
  })
})

test.describe('Crafting UI - Mobile', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  })

  test('should show full-screen crafting modal on mobile', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('canvas', { timeout: 5000 })

    // When: Tapping floating action button to open crafting
    await page.locator('[data-testid="fab-craft"]').tap()

    // Then: Full-screen modal should appear
    const craftingModal = page.locator('[data-testid="crafting-modal"]')
    await expect(craftingModal).toBeVisible()

    // Modal should cover entire viewport
    const box = await craftingModal.boundingBox()
    expect(box?.height).toBeGreaterThan(800)
  })

  test('should confirm craft with modal on mobile', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('canvas', { timeout: 5000 })

    await page.evaluate(() => {
      ;(window as any).game?.debug?.setResources({ wood: 10, stone: 5 })
    })

    await page.locator('[data-testid="fab-craft"]').tap()

    const recipe = page.locator('[data-testid="recipe-basic-component"]')
    await recipe.tap()

    // When: Tapping craft button
    await page.locator('[data-testid="craft-button"]').tap()

    // Then: Confirmation modal should appear
    const confirmModal = page.locator('[data-testid="craft-confirm-modal"]')
    await expect(confirmModal).toBeVisible()
    await expect(confirmModal).toContainText('Craft 1x Basic Component?')

    // Confirm button
    await page.locator('[data-testid="confirm-yes"]').tap()

    // Toast notification
    await expect(page.locator('[data-testid="craft-complete-toast"]')).toBeVisible()
  })
})
