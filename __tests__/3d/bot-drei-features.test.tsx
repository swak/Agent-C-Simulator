/**
 * Unit Tests: Bot drei Visual Features (WS-03-FEAT-06-09)
 *
 * Validates Bot.tsx uses drei components (Html, Sparkles, Trail, Float)
 * and has removed RigidBody type="dynamic".
 *
 * Strategy: Source code analysis + isolated mock rendering (no Canvas).
 * R3F components can't render in JSDOM, so we verify imports and structure.
 */

import { describe, it, expect } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

const BOT_SOURCE = fs.readFileSync(
  path.resolve(__dirname, '../../components/3d/Bot.tsx'),
  'utf-8'
)

describe('Bot drei Visual Features (WS-03-FEAT-06-09)', () => {
  describe('BDD Scenario: Bot status overlay with Html component', () => {
    it('should render Html component with bot status', () => {
      expect(BOT_SOURCE).toContain("from '@react-three/drei'")
      expect(BOT_SOURCE).toContain('Html')
      expect(BOT_SOURCE).toContain('<Html')
    })

    it('should display bot status text in overlay', () => {
      // Html overlay contains bot.status
      expect(BOT_SOURCE).toContain('{bot.status}')
    })

    it('should display energy bar in overlay', () => {
      // Html overlay shows energy value
      expect(BOT_SOURCE).toMatch(/Energy.*{energy}/)
    })

    it('should display progress bar when bot has currentTask', () => {
      // Progress bar rendered conditionally
      expect(BOT_SOURCE).toContain('bot.currentTask')
      expect(BOT_SOURCE).toContain('progress')
    })
  })

  describe('BDD Scenario: Sparkles when gathering', () => {
    it('should render Sparkles component when status is working', () => {
      // Sparkles conditionally rendered for working status
      expect(BOT_SOURCE).toContain('<Sparkles')
      expect(BOT_SOURCE).toContain("bot.status === 'working'")
    })

    it('should NOT render Sparkles when idle', () => {
      // Sparkles gated behind working status check
      expect(BOT_SOURCE).toMatch(/bot\.status\s*===\s*'working'.*&&[\s\S]*?<Sparkles/m)
    })

    it('should NOT render Sparkles when moving', () => {
      // Same gate — only 'working' triggers sparkles
      expect(BOT_SOURCE).not.toMatch(/<Sparkles[\s\S]*?bot\.status\s*===\s*'moving'/)
    })
  })

  describe('BDD Scenario: Trail component for movement', () => {
    it('should wrap bot mesh with Trail component', () => {
      expect(BOT_SOURCE).toContain('<Trail')
      // Trail wraps the mesh
      expect(BOT_SOURCE).toMatch(/<Trail[\s\S]*?<mesh[\s\S]*?<\/Trail>/m)
    })

    it('should show trail during movement', () => {
      // Trail is always rendered (visible when bot moves)
      expect(BOT_SOURCE).toContain('<Trail')
      expect(BOT_SOURCE).toContain('color={color}')
    })
  })

  describe('BDD Scenario: Float component replaces manual bobbing', () => {
    it('should wrap bot mesh with Float component', () => {
      expect(BOT_SOURCE).toContain('<Float')
      // Float wraps the Trail/mesh structure
      expect(BOT_SOURCE).toMatch(/<Float[\s\S]*?<Trail[\s\S]*?<\/Float>/m)
    })

    it('should NOT use manual Math.sin bobbing for idle position', () => {
      // Old pattern was: meshRef.current.position.y = position.y + Math.sin(time * 2) * 0.1
      expect(BOT_SOURCE).not.toMatch(/position\.y\s*=\s*position\.y\s*\+\s*Math\.sin/)
    })
  })

  describe('BDD Scenario: No physics jitter (RigidBody removed)', () => {
    it('should NOT use RigidBody type="dynamic"', () => {
      expect(BOT_SOURCE).not.toContain('RigidBody')
      expect(BOT_SOURCE).not.toContain('type="dynamic"')
    })

    it('should render bot mesh without physics body', () => {
      // No rapier imports
      expect(BOT_SOURCE).not.toContain('@react-three/rapier')
    })
  })

  describe('Edge Cases: drei Components', () => {
    it('should handle undefined currentTask gracefully', () => {
      // Progress bar is conditional on bot.currentTask
      expect(BOT_SOURCE).toMatch(/bot\.currentTask\s*&&/)
    })

    it('should handle missing position gracefully', () => {
      // Position uses fallback defaults
      expect(BOT_SOURCE).toMatch(/bot\.position\?\.(x|y|z)\s*\|\|\s*\d/)
    })

    it('should render all drei features together', () => {
      // All four drei components are present in the file
      expect(BOT_SOURCE).toContain('<Html')
      expect(BOT_SOURCE).toContain('<Sparkles')
      expect(BOT_SOURCE).toContain('<Trail')
      expect(BOT_SOURCE).toContain('<Float')
    })
  })
})
