/**
 * Global Vitest setup — runs once per test file, before the spec is imported.
 *
 * Scope: environment concerns only.
 *   - browser APIs that jsdom does not implement
 *   - globals the app itself mutates, reset between tests
 *
 * Per-test mocks/spies belong in the spec that needs them, not here.
 */
import { afterEach } from 'vitest'

/* -------------------------------------------------------------------------- */
/* Browser APIs missing from jsdom                                            */
/* -------------------------------------------------------------------------- */

// VueUse's usePreferredDark() (used by the settings store) reads matchMedia.
// Inert stub: always reports light. Override locally in a test to simulate dark.
if (typeof window.matchMedia !== 'function') {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}

// Reka UI (shadcn-vue primitives) observes element size/visibility.
class ObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}

if (typeof globalThis.ResizeObserver !== 'function') {
  globalThis.ResizeObserver = ObserverStub as unknown as typeof ResizeObserver
}

if (typeof globalThis.IntersectionObserver !== 'function') {
  globalThis.IntersectionObserver = ObserverStub as unknown as typeof IntersectionObserver
}

// jsdom ships MouseEvent but not PointerEvent, which Reka UI features reference.
if (typeof globalThis.PointerEvent !== 'function') {
  globalThis.PointerEvent =
    class PointerEvent extends MouseEvent {} as unknown as typeof PointerEvent
}

// jsdom implements neither scrolling nor pointer capture on elements.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {}
}

if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false
}

if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {}
}

if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {}
}

/* -------------------------------------------------------------------------- */
/* Globals mutated by the app                                                 */
/* -------------------------------------------------------------------------- */

// The settings store persists to localStorage and toggles <html class="dark">;
// App.vue also sets document.title. Reset all three between tests so specs
// cannot leak state into each other.
afterEach(() => {
  localStorage.clear()
  document.documentElement.className = ''
  document.title = ''
})
