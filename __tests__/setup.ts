/**
 * Test Setup for Agent-C Simulator
 *
 * Configures Vitest with:
 * - @react-three/test-renderer for R3F components
 * - Mock implementations for WebGL/Canvas APIs
 * - Zustand store reset between tests
 * - Audio mocks (Howler.js)
 */

import { vi } from 'vitest'
import { afterEach, beforeAll } from 'vitest'

// Mock WebGL context (Three.js requires it)
beforeAll(() => {
  const canvas = document.createElement('canvas')
  const gl = {
    getExtension: vi.fn(() => ({})),
    getParameter: vi.fn(() => 4096),
    createShader: vi.fn(() => ({})),
    shaderSource: vi.fn(),
    compileShader: vi.fn(),
    getShaderParameter: vi.fn(() => true),
    createProgram: vi.fn(() => ({})),
    attachShader: vi.fn(),
    linkProgram: vi.fn(),
    getProgramParameter: vi.fn(() => true),
    useProgram: vi.fn(),
    getUniformLocation: vi.fn(() => ({})),
    getAttribLocation: vi.fn(() => 0),
    enableVertexAttribArray: vi.fn(),
    vertexAttribPointer: vi.fn(),
    uniformMatrix4fv: vi.fn(),
    uniform3fv: vi.fn(),
    uniform1f: vi.fn(),
    uniform1i: vi.fn(),
    createBuffer: vi.fn(() => ({})),
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    createTexture: vi.fn(() => ({})),
    bindTexture: vi.fn(),
    texImage2D: vi.fn(),
    texParameteri: vi.fn(),
    generateMipmap: vi.fn(),
    activeTexture: vi.fn(),
    drawArrays: vi.fn(),
    drawElements: vi.fn(),
    viewport: vi.fn(),
    clearColor: vi.fn(),
    clear: vi.fn(),
    enable: vi.fn(),
    disable: vi.fn(),
    blendFunc: vi.fn(),
    depthFunc: vi.fn(),
    depthMask: vi.fn(),
    cullFace: vi.fn(),
    frontFace: vi.fn(),
  }

  HTMLCanvasElement.prototype.getContext = vi.fn((contextType: string) => {
    if (contextType === 'webgl' || contextType === 'webgl2') {
      return gl as any
    }
    return null
  })
})

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    },
  }
})()

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
})

// Mock Howler.js
vi.mock('howler', () => ({
  Howl: vi.fn().mockImplementation(() => ({
    play: vi.fn(() => 1),
    pause: vi.fn(),
    stop: vi.fn(),
    volume: vi.fn(),
    rate: vi.fn(),
    seek: vi.fn(),
    on: vi.fn(),
    once: vi.fn(),
    off: vi.fn(),
    fade: vi.fn(),
    playing: vi.fn(() => false),
    duration: vi.fn(() => 0),
    state: vi.fn(() => 'loaded'),
  })),
  Howler: {
    volume: vi.fn(),
    mute: vi.fn(),
    stop: vi.fn(),
    unload: vi.fn(),
  },
}))

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
