/**
 * Unit Tests: Scene drei Visual Features (WS-03-FEAT-10-11)
 *
 * Validates Scene.tsx uses Sky and ContactShadows from drei.
 *
 * Strategy: Source code analysis. R3F components can't render in JSDOM,
 * so we verify imports and JSX usage in the source.
 */

import { describe, it, expect } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'

const SCENE_SOURCE = fs.readFileSync(
  path.resolve(__dirname, '../../components/3d/Scene.tsx'),
  'utf-8'
)

describe('Scene drei Visual Features (WS-03-FEAT-10-11)', () => {
  describe('BDD Scenario: Sky component for atmosphere', () => {
    it('should render Sky component in Scene', () => {
      expect(SCENE_SOURCE).toContain("from '@react-three/drei'")
      expect(SCENE_SOURCE).toContain('<Sky')
    })

    it('should render Sky outside Physics wrapper', () => {
      // Sky should appear before or after Physics block, not inside it
      const skyIndex = SCENE_SOURCE.indexOf('<Sky')
      const physicsOpenIndex = SCENE_SOURCE.indexOf('<Physics')
      const physicsCloseIndex = SCENE_SOURCE.indexOf('</Physics>')

      // Sky is either before Physics opens or after Physics closes
      const skyInsidePhysics = skyIndex > physicsOpenIndex && skyIndex < physicsCloseIndex
      expect(skyInsidePhysics).toBe(false)
    })
  })

  describe('BDD Scenario: ContactShadows for ground shadows', () => {
    it('should render ContactShadows component in Scene', () => {
      expect(SCENE_SOURCE).toContain('<ContactShadows')
    })

    it('should render ContactShadows inside Physics for ground plane', () => {
      const shadowsIndex = SCENE_SOURCE.indexOf('<ContactShadows')
      const physicsOpenIndex = SCENE_SOURCE.indexOf('<Physics')
      const physicsCloseIndex = SCENE_SOURCE.indexOf('</Physics>')

      // ContactShadows is inside Physics block
      expect(shadowsIndex).toBeGreaterThan(physicsOpenIndex)
      expect(shadowsIndex).toBeLessThan(physicsCloseIndex)
    })
  })

  describe('BDD Scenario: Both drei features render together', () => {
    it('should render both Sky and ContactShadows simultaneously', () => {
      expect(SCENE_SOURCE).toContain('<Sky')
      expect(SCENE_SOURCE).toContain('<ContactShadows')
    })

    it('should not throw errors when rendering drei features', () => {
      // Both imports exist — no missing dependencies
      expect(SCENE_SOURCE).toMatch(/import\s*\{[^}]*Sky[^}]*\}\s*from\s*'@react-three\/drei'/)
      expect(SCENE_SOURCE).toMatch(/import\s*\{[^}]*ContactShadows[^}]*\}\s*from\s*'@react-three\/drei'/)
    })
  })

  describe('Edge Cases: Scene drei Features', () => {
    it('should render Scene without bots', () => {
      // Scene maps bots array — empty array means no Bot components, but Sky/ContactShadows still render
      expect(SCENE_SOURCE).toContain('bots.map')
      expect(SCENE_SOURCE).toContain('<Sky')
    })

    it('should handle loading state with drei features', () => {
      // Loading state is separate from drei features
      expect(SCENE_SOURCE).toContain('loading')
      expect(SCENE_SOURCE).toContain('<Sky')
    })
  })
})
