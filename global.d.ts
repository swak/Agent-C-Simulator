import type { ThreeElements } from '@react-three/fiber';

// React 19 moved JSX types to React.JSX namespace.
// R3F v8 still augments the old global JSX namespace.
// Bridge the gap by augmenting the React module.
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
