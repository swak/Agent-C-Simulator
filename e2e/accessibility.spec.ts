/**
 * Accessibility Tests
 *
 * Tests keyboard navigation, touch targets, color contrast, and screen reader support.
 *
 * Expected: ALL TESTS FAIL (no UI implementation exists yet)
 */

import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility - Keyboard Navigation', () => {
  test('should support full keyboard navigation in menus', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('canvas', { timeout: 5000 })

    // When: Opening crafting menu with keyboard
    await page.keyboard.press('C')
    await expect(page.locator('[data-testid="crafting-panel"]')).toBeVisible()

    // Then: Should be able to tab through interactive elements
    await page.keyboard.press('Tab')
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName)
    expect(firstFocused).toBeTruthy()

    // Navigate through recipe cards
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('ArrowRight')

    // Select with Enter
    await page.keyboard.press('Enter')
    await expect(page.locator('[data-testid="recipe-detail"]')).toBeVisible()

    // Close with Escape
    await page.keyboard.press('Escape')
    await expect(page.locator('[data-testid="crafting-panel"]')).not.toBeVisible()
  })

  test('should show focus indicators on all interactive elements', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForSelector('canvas', { timeout: 5000 })

    // When: Tabbing through UI
    await page.keyboard.press('Tab')

    // Then: Focused element should have visible outline
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()

    const outline = await focusedElement.evaluate((el) => {
      const styles = window.getComputedStyle(el)
      return styles.outline || styles.border
    })

    expect(outline).toBeTruthy()
    expect(outline).not.toBe('none')
  })

  test('should support keyboard shortcuts', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('canvas', { timeout: 5000 })

    // Given: Game is loaded
    // When: Pressing keyboard shortcuts
    await page.keyboard.press('I') // Inventory
    await expect(page.locator('[data-testid="inventory-panel"]')).toBeVisible()

    await page.keyboard.press('Escape')

    await page.keyboard.press('T') // Tech tree
    await expect(page.locator('[data-testid="tech-tree-modal"]')).toBeVisible()

    await page.keyboard.press('Escape')

    await page.keyboard.press('C') // Crafting
    await expect(page.locator('[data-testid="crafting-panel"]')).toBeVisible()
  })

  test('should allow bot selection with number keys', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('canvas', { timeout: 5000 })

    // Given: Multiple bots in roster
    await page.evaluate(() => {
      for (let i = 0; i < 3; i++) {
        ;(window as any).game?.debug?.addBot({ type: 'miner' })
      }
    })

    // When: Pressing number keys
    await page.keyboard.press('1')

    // Then: First bot should be selected
    const firstBot = page.locator('[data-testid="bot-item"]').first()
    await expect(firstBot).toHaveClass(/selected/)

    await page.keyboard.press('2')
    const secondBot = page.locator('[data-testid="bot-item"]').nth(1)
    await expect(secondBot).toHaveClass(/selected/)
  })

  test('should support Escape to close all modals', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('canvas', { timeout: 5000 })

    // Given: Multiple modals open
    await page.keyboard.press('T')
    await expect(page.locator('[data-testid="tech-tree-modal"]')).toBeVisible()

    // When: Pressing Escape
    await page.keyboard.press('Escape')

    // Then: Modal should close
    await expect(
      page.locator('[data-testid="tech-tree-modal"]')
    ).not.toBeVisible()
  })
})

test.describe('Accessibility - Touch Targets', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  })

  test('should have minimum 44px touch targets for all buttons', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForSelector('canvas', { timeout: 5000 })

    // When: Checking all interactive elements
    const buttons = page.locator('button, a, [role="button"]')
    const count = await buttons.count()

    const violations: string[] = []

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i)
      const box = await button.boundingBox()

      if (box) {
        if (box.width < 44 || box.height < 44) {
          const text = await button.textContent()
          violations.push(
            `Button "${text}" is ${box.width}x${box.height}px (min 44x44px)`
          )
        }
      }
    }

    // Then: All should meet minimum size
    expect(violations).toHaveLength(0)
  })

  test('should have adequate spacing between touch targets', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForSelector('canvas', { timeout: 5000 })

    // Open a menu with multiple buttons
    await page.locator('[data-testid="fab-menu"]').tap()

    const menuButtons = page.locator('[data-testid="menu-item"]')
    const count = await menuButtons.count()

    for (let i = 0; i < count - 1; i++) {
      const current = await menuButtons.nth(i).boundingBox()
      const next = await menuButtons.nth(i + 1).boundingBox()

      if (current && next) {
        const spacing = next.y - (current.y + current.height)

        // Should have at least 8px spacing
        expect(spacing).toBeGreaterThanOrEqual(8)
      }
    }
  })

  test('should enlarge bot icons in roster for touch', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('canvas', { timeout: 5000 })

    // When: Opening bot roster on mobile
    const botItem = page.locator('[data-testid="bot-item"]').first()
    const box = await botItem.boundingBox()

    // Then: Should be large enough for touch
    expect(box?.width).toBeGreaterThanOrEqual(56)
    expect(box?.height).toBeGreaterThanOrEqual(56)
  })
})

test.describe('Accessibility - Color Contrast', () => {
  test('should meet WCAG AA contrast ratios', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('canvas', { timeout: 5000 })

    // When: Running axe accessibility audit
    const results = await new AxeBuilder({ page }).analyze()

    // Then: Should have no color contrast violations
    const contrastViolations = results.violations.filter((v) =>
      v.id.includes('color-contrast')
    )

    expect(contrastViolations).toHaveLength(0)
  })

  test('should differentiate resources with shapes in addition to color', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForSelector('canvas', { timeout: 5000 })

    // When: Checking resource icons
    const woodIcon = page.locator('[data-testid="resource-icon-wood"]')
    const stoneIcon = page.locator('[data-testid="resource-icon-stone"]')

    // Then: Should have data attributes for shape/pattern
    const woodShape = await woodIcon.getAttribute('data-shape')
    const stoneShape = await stoneIcon.getAttribute('data-shape')

    expect(woodShape).toBeTruthy()
    expect(stoneShape).toBeTruthy()
    expect(woodShape).not.toBe(stoneShape)
  })

  test('should use symbols in addition to color for status indicators', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForSelector('canvas', { timeout: 5000 })

    // Given: A bot with status
    await page.evaluate(() => {
      ;(window as any).game?.debug?.addBot({ type: 'miner', status: 'working' })
    })

    // When: Checking status indicator
    const statusIndicator = page.locator('[data-testid="bot-status"]').first()

    // Then: Should have icon in addition to color
    const icon = statusIndicator.locator('svg, [data-icon]')
    await expect(icon).toBeVisible()
  })
})

test.describe('Accessibility - Screen Reader Support', () => {
  test('should have ARIA labels on all interactive elements', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForSelector('canvas', { timeout: 5000 })

    // When: Checking interactive elements
    const buttons = page.locator('button')
    const count = await buttons.count()

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i)
      const ariaLabel = await button.getAttribute('aria-label')
      const text = await button.textContent()

      // Then: Should have label or visible text
      expect(ariaLabel || text?.trim()).toBeTruthy()
    }
  })

  test('should announce resource changes to screen readers', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForSelector('canvas', { timeout: 5000 })

    // When: Resources change
    await page.evaluate(() => {
      ;(window as any).game?.debug?.addResources({ wood: 10 })
    })

    // Then: Live region should announce change
    const liveRegion = page.locator('[role="status"], [aria-live="polite"]')
    await expect(liveRegion).toContainText(/Wood.*10/i, { timeout: 2000 })
  })

  test('should announce bot status changes', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('canvas', { timeout: 5000 })

    // Given: A bot
    await page.evaluate(() => {
      ;(window as any).game?.debug?.addBot({
        id: 'test-bot',
        type: 'miner',
        status: 'idle',
      })
    })

    // When: Bot starts working
    await page.evaluate(() => {
      ;(window as any).game?.debug?.updateBotStatus('test-bot', 'working')
    })

    // Then: Should announce to screen reader
    const announcement = page.locator('[role="status"]')
    await expect(announcement).toContainText(/Bot.*working/i, { timeout: 2000 })
  })

  test('should provide descriptive labels for tech tree nodes', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForSelector('canvas', { timeout: 5000 })

    await page.keyboard.press('T')

    // When: Checking tech nodes
    const techNode = page.locator('[data-testid="tech-node-advanced-miner"]')
    const ariaLabel = await techNode.getAttribute('aria-label')

    // Then: Should have descriptive label
    expect(ariaLabel).toContain('Advanced Miner')
    expect(ariaLabel).toMatch(/Requires.*\d+.*Wood/i)
  })

  test('should have semantic HTML structure', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('canvas', { timeout: 5000 })

    // When: Checking page structure
    const main = page.locator('main')
    await expect(main).toBeVisible()

    const nav = page.locator('nav, [role="navigation"]')
    expect(await nav.count()).toBeGreaterThan(0)

    // Headings should be in logical order
    const headings = page.locator('h1, h2, h3, h4')
    const count = await headings.count()
    expect(count).toBeGreaterThan(0)
  })
})

test.describe('Accessibility - Reduced Motion', () => {
  test.use({
    colorScheme: 'light',
    // Simulate prefers-reduced-motion
    extraHTTPHeaders: {
      'Sec-CH-Prefers-Reduced-Motion': 'reduce',
    },
  })

  test('should disable animations when reduced motion enabled', async ({
    page,
  }) => {
    await page.goto('/')
    await page.waitForSelector('canvas', { timeout: 5000 })

    // When: Reduced motion preference detected
    const reducedMotion = await page.evaluate(() => {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    })

    if (reducedMotion) {
      // Then: Animations should be disabled or simplified
      const settings = await page.evaluate(() => {
        return (window as any).game?.settings?.reducedMotion
      })
      expect(settings).toBe(true)
    }
  })

  test('should provide toggle for motion reduction', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('canvas', { timeout: 5000 })

    // When: Opening settings
    await page.locator('[data-testid="settings-button"]').click()

    // Then: Should have reduced motion toggle
    const toggle = page.locator('[data-testid="setting-reduced-motion"]')
    await expect(toggle).toBeVisible()

    // Toggle should work
    await toggle.click()

    const enabled = await page.evaluate(() => {
      return (window as any).game?.settings?.reducedMotion
    })
    expect(enabled).toBe(true)
  })
})

test.describe('Accessibility - Comprehensive Audit', () => {
  test('should pass automated accessibility audit', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('canvas', { timeout: 5000 })

    // Run full axe audit
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    // Should have no critical violations
    expect(results.violations).toHaveLength(0)

    // Log any incomplete rules for manual review
    if (results.incomplete.length > 0) {
      console.log('Manual review needed:', results.incomplete)
    }
  })

  test('should be navigable with screen reader shortcuts', async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('canvas', { timeout: 5000 })

    // Simulate screen reader navigation (heading jump)
    await page.keyboard.press('h') // Jump to heading (simulated)

    // Check that headings are present and in order
    const h1 = await page.locator('h1').count()
    expect(h1).toBeGreaterThanOrEqual(1)

    // Landmarks should be navigable
    const landmarks = await page
      .locator('main, nav, aside, [role="navigation"], [role="complementary"]')
      .count()
    expect(landmarks).toBeGreaterThan(0)
  })
})
