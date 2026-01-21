import { createApp, ref, computed, h } from 'vue'

export interface DiagnosticError {
  line: number
  column: number
  message: string
  severity: 'error' | 'warning'
  ruleId?: string
}

export interface DiagnosticData {
  file: string
  errors: DiagnosticError[]
}

export interface OverlayOptions {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  initialIsOpen?: boolean
  maxIssues?: number
}

interface OverlayInstance {
  updateDiagnostics: (diagnostics: DiagnosticData[]) => void
  destroy: () => void
}

// Static style constants
const BASE_STYLES = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  font-size: 13px;
  line-height: 1.5;
`

const HEADER_STYLES = `
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  transition: background 0.2s, color 0.2s;
`

const BADGE_STYLES = `
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
`

const FILE_PATH_STYLES = `
  padding: 8px 12px;
  background: #f9fafb;
  font-weight: 500;
  color: #374151;
  font-size: 12px;
  border-bottom: 1px solid #e5e7eb;
  word-break: break-all;
`

const ERROR_ITEM_STYLES = `
  padding: 8px 12px;
  border-left: 2px solid;
  border-bottom: 1px solid #f3f4f6;
`

const positionStyles: Record<string, string> = {
  'top-right': 'top: 20px; right: 20px;',
  'top-left': 'top: 20px; left: 20px;',
  'bottom-right': 'bottom: 20px; right: 20px;',
  'bottom-left': 'bottom: 20px; left: 20px;'
} as const

const validPositions = ['top-right', 'top-left', 'bottom-right', 'bottom-left'] as const
type ValidPosition = typeof validPositions[number]

// Shared state for overlay instance
interface OverlayState {
  isOpen: ReturnType<typeof ref<boolean>>
  diagnostics: ReturnType<typeof ref<DiagnosticData[]>>
  maxIssues: ReturnType<typeof ref<number>>
}

const OverlayComponent = {
  name: 'ESLintOverlay',
  props: {
    state: {
      type: Object as () => OverlayState,
      required: true
    },
    position: {
      type: String as () => ValidPosition,
      default: 'bottom-right'
    }
  },
  setup(props: { state: OverlayState; position: string }) {
    const { isOpen, diagnostics, maxIssues } = props.state

    // Runtime validation for position prop
    const normalizedPosition = validPositions.includes(props.position as ValidPosition)
      ? (props.position as ValidPosition)
      : 'bottom-right'

    const errorCount = computed(() => {
      return diagnostics.value.reduce((sum, data) => {
        return sum + data.errors.filter(e => e.severity === 'error').length
      }, 0)
    })

    const warningCount = computed(() => {
      return diagnostics.value.reduce((sum, data) => {
        return sum + data.errors.filter(e => e.severity === 'warning').length
      }, 0)
    })

    const totalIssues = computed(() => errorCount.value + warningCount.value)

    const hasErrors = computed(() => errorCount.value > 0)

    const displayDiagnostics = computed(() => {
      if (maxIssues.value <= 0) return diagnostics.value
      return diagnostics.value.map(data => ({
        ...data,
        errors: data.errors.slice(0, maxIssues.value)
      }))
    })

    const toggle = () => {
      isOpen.value = !isOpen.value
    }

    const open = () => {
      isOpen.value = true
    }

    const close = () => {
      isOpen.value = false
    }

    return () => {
      const isError = hasErrors.value
      const positionStyle = positionStyles[normalizedPosition]

      return h('div', {
        style: `
          ${BASE_STYLES}
          position: fixed;
          ${positionStyle};
          z-index: 999999;
          display: flex;
          flex-direction: column;
          align-items: ${normalizedPosition.includes('right') ? 'flex-end' : 'flex-start'};
        `
      }, [
        // Header with badge
        h('div', {
          style: `
            ${HEADER_STYLES}
            background: ${isOpen.value ? '#ffffff' : isError ? '#ef4444' : '#f59e0b'};
            color: ${isOpen.value ? '#1f2937' : '#ffffff'};
            border: 1px solid ${isOpen.value ? '#e5e7eb' : 'transparent'};
          `,
          onClick: toggle
        }, [
          h('span', {
            style: `
              font-size: 16px;
              transform: rotate(${isOpen.value ? '90deg' : '0deg'});
              transition: transform 0.2s;
            `
          }, '▶'),
          h('span', {}, `ESLint ${totalIssues.value}`),
          errorCount.value > 0 && h('span', {
            style: `
              ${BADGE_STYLES}
              background: #ef4444;
              color: #ffffff;
            `
          }, `${errorCount.value}E`),
          warningCount.value > 0 && h('span', {
            style: `
              ${BADGE_STYLES}
              background: #f59e0b;
              color: #ffffff;
            `
          }, `${warningCount.value}W`)
        ]),

        // Content panel
        isOpen.value && h('div', {
          style: `
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            margin-top: 8px;
            max-width: 500px;
            max-height: 60vh;
            overflow-y: auto;
            overflow-x: hidden;
          `
        }, [
          displayDiagnostics.value.map(data => {
            const hasFileErrors = data.errors.some(e => e.severity === 'error')
            return h('div', {
              style: `
                border-bottom: 1px solid #e5e7eb;
                ${hasFileErrors ? 'border-left: 3px solid #ef4444;' : 'border-left: 3px solid #f59e0b;'}
              `
            }, [
              // File path
              h('div', {
                style: FILE_PATH_STYLES
              }, data.file),
              // Errors
              ...data.errors.map(error => {
                const isError = error.severity === 'error'
                return h('div', {
                  style: `
                    ${ERROR_ITEM_STYLES}
                    border-left-color: ${isError ? '#ef4444' : '#f59e0b'};
                  `
                }, [
                  h('div', {
                    style: `
                      display: flex;
                      align-items: center;
                      gap: 6px;
                      margin-bottom: 4px;
                    `
                  }, [
                    h('span', {
                      style: `
                        font-weight: 600;
                        color: ${isError ? '#ef4444' : '#f59e0b'};
                        font-size: 12px;
                      `
                    }, isError ? 'Error' : 'Warning'),
                    h('span', {
                      style: `
                        color: #6b7280;
                        font-size: 11px;
                      `
                    }, `Line ${error.line}, Column ${error.column}`),
                    error.ruleId && h('span', {
                      style: `
                        color: #6b7280;
                        font-size: 11px;
                        font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
                      `
                    }, error.ruleId)
                  ]),
                  h('div', {
                    style: `
                      color: #374151;
                      font-size: 13px;
                    `
                  }, error.message)
                ])
              })
            ])
          })
        ])
      ])
    }
  }
}

export function createOverlay(
  container: HTMLElement,
  options: OverlayOptions = {}
): OverlayInstance {
  const {
    position = 'bottom-right',
    initialIsOpen = false,
    maxIssues = 100
  } = options

  // Create shared state
  const state: OverlayState = {
    isOpen: ref(initialIsOpen),
    diagnostics: ref<DiagnosticData[]>([]),
    maxIssues: ref(maxIssues)
  }

  const app = createApp(OverlayComponent, {
    state,
    position
  })
  const rootElement = document.createElement('div')
  container.appendChild(rootElement)
  app.mount(rootElement)

  let isDestroyed = false

  return {
    updateDiagnostics(data: DiagnosticData[]) {
      if (isDestroyed) return

      // Null check for safety
      if (!data || !Array.isArray(data)) {
        state.diagnostics.value = []
        return
      }

      state.diagnostics.value = data
      // Auto-open if there are errors
      const hasErrors = data.some(d =>
        d && d.errors && Array.isArray(d.errors) &&
        d.errors.some(e => e && e.severity === 'error')
      )
      if (hasErrors) {
        state.isOpen.value = true
      }
    },
    destroy() {
      if (isDestroyed) return
      isDestroyed = true

      app.unmount()
      if (rootElement.parentNode) {
        rootElement.parentNode.removeChild(rootElement)
      }

      // Clear state refs to release references
      state.isOpen.value = false
      state.diagnostics.value = []
    }
  }
}

export function createDefaultOverlay(): OverlayInstance {
  const container = document.body
  return createOverlay(container, {
    position: 'bottom-right',
    initialIsOpen: false,
    maxIssues: 100
  })
}
