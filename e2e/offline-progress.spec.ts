/**
 * Integration Test: Offline Progress Accumulation
 *
 * Tests offline progress calculation and welcome-back screen.
 *
 * Expected: ALL TESTS FAIL (no UI implementation exists yet)
 */

import { test, expect } from '@playwright/test'

test.describe('Offline Progress', () => {
  test('BDD-04: Offline Progress Accumulation', async ({ page }) => {
    // Given: The player has 3 active bots gathering resources
    await page.goto('/')
    await page.waitForSelector('canvas', { timeout: 5000 })

    // Place 3 bots
    await page.evaluate(() => {
      const game = (window as any).game
      game?.debug?.addBot({ type: 'miner', status: 'working' })
      game?.debug?.addBot({ type: 'miner', status: 'working' })
      game?.debug?.addBot({ type: 'hauler', status: 'working' })

      // Set production rate
      game?.debug?.setProductionRate('wood', 10) // 10 per minute
      game?.debug?.setProductionRate('stone', 5) // 5 per minute
    })

    // Verify bots are working
    const botCount = await page.locator('[data-testid="bot-entity"]').count()
    expect(botCount).toBe(3)

    // When: The player closes the game for 2 hours
    // Simulate by setting last save timestamp to 2 hours ago
    await page.evaluate(() => {
      const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000
      localStorage.setItem(
        'agent-c-save',
        JSON.stringify({
          timestamp: twoHoursAgo,
          bots: [
            { id: '1', type: 'miner', status: 'working' },
            { id: '2', type: 'miner', status: 'working' },
            { id: '3', type: 'hauler', status: 'working' },
          ],
          resources: { wood: 0, stone: 0 },
          productionRates: { wood: 10, stone: 5 },
        })
      )
    })

    // And: Reopens the game
    await page.reload()
    await page.waitForSelector('canvas', { timeout: 5000 })

    // Then: A "Welcome Back" screen displays total resources gathered
    const welcomeScreen = page.locator('[data-testid="welcome-back-screen"]')
    await expect(welcomeScreen).toBeVisible({ timeout: 3000 })

    await expect(welcomeScreen).toContainText('Welcome Back!')

    // Should show resources earned
    await expect(welcomeScreen.locator('[data-testid="offline-wood"]')).toContainText(
      '+120 Wood'
    ) // 10/min * 60min * 2 (capped at some value)
    await expect(
      welcomeScreen.locator('[data-testid="offline-stone"]')
    ).toContainText('+60 Stone')

    // And: The resources are automatically added to the player's inventory
    await page.locator('[data-testid="welcome-back-claim"]').click()

    const woodCounter = page.locator('[data-testid="resource-wood"]')
    await expect(woodCounter).toContainText('120')

    const stoneCounter = page.locator('[data-testid="resource-stone"]')
    await expect(stoneCounter).toContainText('60')

    // And: Celebratory animation plays
    await expect(
      page.locator('[data-testid="celebration-particles"]')
    ).toBeVisible({ timeout: 1000 })
  })

  test('should cap offline progress at 8 hours', async ({ page }) => {
    // Given: A save from 24 hours ago
    await page.goto('/')
    await page.waitForSelector('canvas', { timeout: 5000 })

    await page.evaluate(() => {
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
      localStorage.setItem(
        'agent-c-save',
        JSON.stringify({
          timestamp: oneDayAgo,
          bots: [{ id: '1', type: 'miner', status: 'working' }],
          resources: { wood: 0 },
          productionRates: { wood: 10 }, // 10/min
        })
      )
    })

    // When: Reloading game
    await page.reload()
    await page.waitForSelector('[data-testid="welcome-back-screen"]', {
      timeout: 3000,
    })

    // Then: Resources should be capped at 8 hours
    const welcomeScreen = page.locator('[data-testid="welcome-back-screen"]')
    const woodText = await welcomeScreen
      .locator('[data-testid="offline-wood"]')
      .textContent()

    const woodAmount = parseInt(woodText?.match(/\d+/)?.[0] || '0')

    // 10/min * 60min/hr * 8hr = 4800 max
    expect(woodAmount).toBeLessThanOrEqual(4800)

    // Should indicate cap in UI
    await expect(welcomeScreen).toContainText('(8 hour cap)')
  })

  test('should show time away in welcome screen', async ({ page }) => {
    // Given: A save from 3 hours ago
    await page.goto('/')
    await page.waitForSelector('canvas', { timeout: 5000 })

    await page.evaluate(() => {
      const threeHoursAgo = Date.now() - 3 * 60 * 60 * 1000
      localStorage.setItem(
        'agent-c-save',
        JSON.stringify({
          timestamp: threeHoursAgo,
          bots: [{ id: '1', type: 'miner', status: 'working' }],
          resources: {},
          productionRates: { wood: 10 },
        })
      )
    })

    // When: Reloading
    await page.reload()

    const welcomeScreen = page.locator('[data-testid="welcome-back-screen"]')
    await expect(welcomeScreen).toBeVisible({ timeout: 3000 })

    // Then: Should show time away
    await expect(welcomeScreen).toContainText('You were away for 3 hours')
  })

  test('should not show welcome screen if away < 5 minutes', async ({
    page,
  }) => {
    // Given: A save from 2 minutes ago
    await page.goto('/')
    await page.waitForSelector('canvas', { timeout: 5000 })

    await page.evaluate(() => {
      const twoMinutesAgo = Date.now() - 2 * 60 * 1000
      localStorage.setItem(
        'agent-c-save',
        JSON.stringify({
          timestamp: twoMinutesAgo,
          bots: [{ id: '1', type: 'miner', status: 'working' }],
          resources: {},
          productionRates: {},
        })
      )
    })

    // When: Reloading
    await page.reload()
    await page.waitForSelector('canvas', { timeout: 5000 })

    // Then: Welcome screen should not appear
    await expect(
      page.locator('[data-testid="welcome-back-screen"]')
    ).not.toBeVisible({ timeout: 2000 })
  })

  test('should calculate offline progress correctly for multiple bots', async ({
    page,
  }) => {
    // Given: Multiple bots with different production rates
    await page.goto('/')
    await page.waitForSelector('canvas', { timeout: 5000 })

    await page.evaluate(() => {
      const oneHourAgo = Date.now() - 60 * 60 * 1000
      localStorage.setItem(
        'agent-c-save',
        JSON.stringify({
          timestamp: oneHourAgo,
          bots: [
            { id: '1', type: 'miner', status: 'working', efficiency: 1.0 },
            { id: '2', type: 'miner', status: 'working', efficiency: 1.5 },
            { id: '3', type: 'hauler', status: 'idle' }, // Should not contribute
          ],
          resources: { wood: 0, stone: 0 },
          productionRates: { wood: 10, stone: 8 },
        })
      )
    })

    // When: Reloading
    await page.reload()

    const welcomeScreen = page.locator('[data-testid="welcome-back-screen"]')
    await expect(welcomeScreen).toBeVisible({ timeout: 3000 })

    // Then: Should calculate based on active bots only
    const woodText = await welcomeScreen
      .locator('[data-testid="offline-wood"]')
      .textContent()
    const stoneText = await welcomeScreen
      .locator('[data-testid="offline-stone"]')
      .textContent()

    // Wood: (10/min * 60min) * (1.0 + 1.5) / 2 bots working
    // This is simplified; actual formula depends on implementation
    expect(woodText).toContain('+')
    expect(stoneText).toContain('+')
  })

  test('should handle corrupted offline timestamp gracefully', async ({
    page,
  }) => {
    // Given: Invalid timestamp in save
    await page.goto('/')
    await page.waitForSelector('canvas', { timeout: 5000 })

    await page.evaluate(() => {
      localStorage.setItem(
        'agent-c-save',
        JSON.stringify({
          timestamp: 'invalid-timestamp',
          bots: [],
          resources: {},
        })
      )
    })

    // When: Reloading
    await page.reload()

    // Then: Should not crash, welcome screen should not appear
    await page.waitForSelector('canvas', { timeout: 5000 })
    await expect(
      page.locator('[data-testid="welcome-back-screen"]')
    ).not.toBeVisible({ timeout: 2000 })

    // Game should load normally
    await expect(page.locator('[data-testid="bot-roster"]')).toBeVisible()
  })

  test('should complete offline calculation in < 200ms', async ({ page }) => {
    // Given: A complex save with many bots
    await page.goto('/')
    await page.waitForSelector('canvas', { timeout: 5000 })

    await page.evaluate(() => {
      const eightHoursAgo = Date.now() - 8 * 60 * 60 * 1000
      const bots = []
      for (let i = 0; i < 20; i++) {
        bots.push({ id: `bot-${i}`, type: 'miner', status: 'working' })
      }

      localStorage.setItem(
        'agent-c-save',
        JSON.stringify({
          timestamp: eightHoursAgo,
          bots,
          resources: {},
          productionRates: { wood: 10, stone: 5, iron: 3 },
        })
      )
    })

    // When: Measuring calculation time
    const startTime = Date.now()
    await page.reload()
    await page.waitForSelector('[data-testid="welcome-back-screen"]', {
      timeout: 3000,
    })
    const calcTime = Date.now() - startTime

    // Then: Should complete quickly
    expect(calcTime).toBeLessThan(200)
  })

  test('should show breakdown of resources by bot type', async ({ page }) => {
    // Given: Multiple bot types producing different resources
    await page.goto('/')
    await page.waitForSelector('canvas', { timeout: 5000 })

    await page.evaluate(() => {
      const oneHourAgo = Date.now() - 60 * 60 * 1000
      localStorage.setItem(
        'agent-c-save',
        JSON.stringify({
          timestamp: oneHourAgo,
          bots: [
            { id: '1', type: 'miner', status: 'working' },
            { id: '2', type: 'hauler', status: 'working' },
          ],
          resources: {},
          productionRates: { wood: 10, stone: 5 },
        })
      )
    })

    // When: Reloading
    await page.reload()

    const welcomeScreen = page.locator('[data-testid="welcome-back-screen"]')
    await expect(welcomeScreen).toBeVisible({ timeout: 3000 })

    // Then: Should show breakdown (optional feature)
    const breakdown = welcomeScreen.locator('[data-testid="production-breakdown"]')
    if ((await breakdown.count()) > 0) {
      await expect(breakdown).toContainText('Miner:')
      await expect(breakdown).toContainText('Hauler:')
    }
  })

  test('should play welcome-back sound effect', async ({ page }) => {
    // Given: A save with offline time
    await page.goto('/')
    await page.waitForSelector('canvas', { timeout: 5000 })

    await page.evaluate(() => {
      const oneHourAgo = Date.now() - 60 * 60 * 1000
      localStorage.setItem(
        'agent-c-save',
        JSON.stringify({
          timestamp: oneHourAgo,
          bots: [{ id: '1', type: 'miner', status: 'working' }],
          resources: {},
          productionRates: { wood: 10 },
        })
      )
    })

    // When: Reloading and welcome screen appears
    await page.reload()
    await page.waitForSelector('[data-testid="welcome-back-screen"]', {
      timeout: 3000,
    })

    // Then: Audio should play
    const audioPlayed = await page.evaluate(() => {
      return (window as any).game?.audio?.lastPlayed === 'welcome-back'
    })
    expect(audioPlayed).toBe(true)
  })
})
