/**
 * BinaryGrid — a performant, mountable animated binary grid.
 *
 * Usage:
 *   const grid = new BinaryGrid(document.getElementById('my-container'), {
 *     cellSize: 24,
 *     updateInterval: 150,
 *     samplingRate: 0.03,
 *     colors: { bg: '#e0f2fe', base: '#bae6fd', highlight: '#60a5fa' },
 *   });
 *
 *   grid.destroy(); // stop and clean up
 */
type BinaryGridOptions = {
    cellSize?: number
    updateInterval?: number
    samplingRate?: number
    fontSize?: number
    fontFamily?: string
    fontWeight?: number
    highlightFontWeight?: number
    followMouse?: boolean
    colors?: {
        bg?: string
        base?: string
        highlight?: string
    }
}

type BinaryGridColorsRequired = {
    bg: string
    base: string
    highlight: string
}

type BinaryGridOptionsRequired = {
    cellSize: number
    updateInterval: number
    samplingRate: number
    fontSize: number
    fontFamily: string
    fontWeight: number
    highlightFontWeight: number
    followMouse: boolean
    colors: BinaryGridColorsRequired
}

// Default colors merged with user options
function mergeColorsWithDefaults(colors?: Record<string, string>): BinaryGridColorsRequired {
    const defaults: BinaryGridColorsRequired = {
        bg: '#e0f2fe',
        base: '#bae6fd',
        highlight: '#60a5fa',
    }
    return { ...defaults, ...(colors ?? {}) } as BinaryGridColorsRequired
}

export class BinaryGrid {
    static #DEFAULT_OPTIONS = {
        cellSize: 24,
        updateInterval: 150, // ms between batch updates
        samplingRate: 0.03, // fraction of cells to flip per tick
        fontSize: 14,
        fontFamily: "'Roboto Mono', 'Courier New', monospace",
        fontWeight: 600,
        highlightFontWeight: 800,
        followMouse: false,
        colors: {
            bg: '#e0f2fe',
            base: '#bae6fd',
            highlight: '#60a5fa',
        },
    }

    #el: HTMLElement
    #canvas: HTMLCanvasElement | null = null
    #ctx: CanvasRenderingContext2D | null = null
    #opts: BinaryGridOptionsRequired
    #state: Uint8Array = new Uint8Array()
    #highlight: Uint8Array = new Uint8Array()
    #cols = 0
    #rows = 0
    #intervalId: NodeJS.Timeout | null = null
    #ro: ResizeObserver | undefined
    #pixelRatio: number = 1
    #mouseX: number = 0
    #mouseY: number = 0

    constructor(element: HTMLElement, options: BinaryGridOptions = {}) {
        this.#el = element
        this.#opts = this.#mergeOptions(options)
        this.#mount()
    }

    // ─── public API ───────────────────────────────────────────────────────────

    /** Stop animation, remove canvas, disconnect resize observer. */
    destroy(): void {
        this.#stop()
        this.#ro?.disconnect()
        this.#canvas?.remove()
        this.#canvas = null
        this.#ctx = null
    }

    /** Update options at runtime. Pass a partial options object. */
    configure(options: BinaryGridOptions = {}): void {
        this.#opts = this.#mergeOptions(options, this.#opts)
        this.#applyCanvasStyles()
        this.#stop()
        this.#randomize()
        this.#computeHighlights()
        this.#redraw()
        this.#start()
    }

    // ─── setup ────────────────────────────────────────────────────────────────

    #mergeOptions(
        incoming: BinaryGridOptions,
        base: BinaryGridOptions = BinaryGrid.#DEFAULT_OPTIONS,
    ): BinaryGridOptionsRequired {
        const merged = {
            ...base,
            ...incoming,
            colors: mergeColorsWithDefaults(incoming.colors),
        } as BinaryGridOptionsRequired

        // Respect prefers-reduced-motion by using 10x higher update interval
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            merged.updateInterval *= 10
        }

        return merged
    }

    #mount(): void {
        // Ensure mount element is positioned so the canvas fills it
        const pos = getComputedStyle(this.#el).position
        if (pos === 'static') this.#el.style.position = 'relative'

        this.#canvas = document.createElement('canvas')
        this.#canvas.style.cssText = `
            display: block;
            position: absolute;
            inset: 0;
            pointer-events: none;
        `
        this.#ctx = this.#canvas.getContext('2d')

        // Set up device pixel ratio for high-DPI displays
        this.#pixelRatio = window.devicePixelRatio || 1
        if (this.#ctx && this.#pixelRatio !== 1) {
            this.#ctx.scale(this.#pixelRatio, this.#pixelRatio)
        }

        this.#el.appendChild(this.#canvas)

        this.#ro = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect
            this.#resize(width, height)
        })
        this.#ro.observe(this.#el)

        // Add mouse tracking if followMouse is enabled
        if (this.#opts.followMouse) {
            document.addEventListener('mousemove', e => this.#handleMouseMove(e))
        }

        // Initial size
        const { width, height } = this.#el.getBoundingClientRect()
        this.#resize(width, height)
    }

    #handleMouseMove(event: MouseEvent): void {
        const rect = this.#el.getBoundingClientRect()
        this.#mouseX = event.clientX - rect.left
        this.#mouseY = event.clientY - rect.top
    }

    #applyCanvasStyles(): void {
        if (this.#canvas) {
            this.#canvas.style.background = this.#opts.colors.bg
        }
    }

    // ─── grid lifecycle ───────────────────────────────────────────────────────

    #resize(width: number, height: number): void {
        const { cellSize } = this.#opts
        const newCols = Math.max(1, Math.ceil(width / cellSize))
        const newRows = Math.max(1, Math.ceil(height / cellSize))

        if (!this.#canvas || !this.#ctx) return

        // Set canvas drawing surface size (accounts for pixel ratio)
        this.#canvas.width = newCols * cellSize * this.#pixelRatio
        this.#canvas.height = newRows * cellSize * this.#pixelRatio

        // Reapply scale transform after canvas size change (which resets transformations)
        if (this.#pixelRatio !== 1) {
            this.#ctx.scale(this.#pixelRatio, this.#pixelRatio)
        }

        // Set canvas display size (CSS)
        this.#canvas.style.width = '100%'
        this.#canvas.style.height = '100%'
        this.#canvas.style.background = this.#opts.colors.bg

        this.#cols = newCols
        this.#rows = newRows

        this.#state = new Uint8Array(newCols * newRows)
        this.#highlight = new Uint8Array(newCols * newRows)

        this.#randomize()
        this.#computeHighlights()
        this.#redraw()

        this.#stop()
        this.#start()
    }

    #randomize(): void {
        for (let i = 0; i < this.#state.length; i++) {
            this.#state[i] = Math.random() < 0.5 ? 1 : 0
        }
    }

    #start(): void {
        if (this.#intervalId !== null) return
        this.#intervalId = setInterval(() => this.#tick(), this.#opts.updateInterval)
    }

    #stop(): void {
        if (this.#intervalId === null) return
        clearInterval(this.#intervalId)
        this.#intervalId = null
    }

    // ─── per-tick update ──────────────────────────────────────────────────────

    #tick(): void {
        const total = this.#state.length
        const sampleSize = Math.max(1, Math.round(total * this.#opts.samplingRate))

        // Track which rows are dirtied so we recompute highlights only where needed
        const dirtyRows: Set<number> = new Set()

        for (let i = 0; i < sampleSize; i++) {
            const idx = (Math.random() * total) | 0
            this.#state[idx] = Math.random() < 0.5 ? 1 : 0
            dirtyRows.add((idx / this.#cols) | 0)
        }

        for (const row of dirtyRows) {
            this.#computeHighlightsForRow(row)
        }

        this.#redrawRows(dirtyRows)
    }

    // ─── highlight logic ──────────────────────────────────────────────────────

    /** Recompute highlights for every row. */
    #computeHighlights(): void {
        for (let r = 0; r < this.#rows; r++) {
            this.#computeHighlightsForRow(r)
        }
    }

    /** Find central "1 0" pair(s) within clusters of consecutive "1 0" pairs. */
    #computeHighlightsForRow(row: number): void {
        const cols = this.#cols
        const base = row * cols

        // Clear previous highlight flags for this row
        this.#highlight.fill(0, base, base + cols)

        // Collect all "1 0" pair start indices
        const pairs = []
        for (let c = 0; c < cols - 1; c++) {
            if (this.#state[base + c] === 1 && this.#state[base + c + 1] === 0) {
                pairs.push(c)
            }
        }
        if (pairs.length === 0) return

        // Group into clusters of overlapping / adjacent pairs
        let clusterStart = 0
        for (let i = 1; i <= pairs.length; i++) {
            const isLast = i === pairs.length
            const gapBreaks = !isLast && pairs[i] > pairs[i - 1] + 2

            if (isLast || gapBreaks) {
                const cluster = pairs.slice(clusterStart, i)
                const mid = cluster[cluster.length >> 1]
                this.#highlight[base + mid] = 1
                this.#highlight[base + mid + 1] = 1
                clusterStart = i
            }
        }
    }

    // ─── rendering ────────────────────────────────────────────────────────────

    #redraw(): void {
        const allRows: Set<number> = new Set()
        for (let r = 0; r < this.#rows; r++) allRows.add(r)
        this.#redrawRows(allRows)
    }

    #redrawRows(rows: Set<number>): void {
        const { cellSize, fontSize, fontFamily, colors } = this.#opts
        const ctx = this.#ctx
        const cols = this.#cols

        if (!ctx) return

        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        const cx = cellSize / 2
        const cy = cellSize / 2
        const followMouseRadius = 5 * cellSize

        for (const r of rows) {
            const y = r * cellSize
            const base = r * cols

            // Clear the row strip
            ctx.clearRect(0, y, cols * cellSize, cellSize)

            for (let c = 0; c < cols; c++) {
                let isHigh = this.#highlight[base + c] === 1

                // Reduce opacity for base cells within mouse radius
                if (this.#opts.followMouse && !isHigh) {
                    const cellCenterX = c * cellSize + cx
                    const cellCenterY = y + cy
                    const dx = cellCenterX - this.#mouseX
                    const dy = cellCenterY - this.#mouseY
                    const distance = Math.sqrt(dx * dx + dy * dy)

                    if (distance < followMouseRadius) {
                        isHigh = true
                    }
                }

                ctx.font = `${isHigh ? this.#opts.highlightFontWeight : this.#opts.fontWeight} ${fontSize}px ${fontFamily}`
                ctx.fillStyle = isHigh ? colors.highlight : colors.base
                ctx.fillText(String(this.#state[base + c]), c * cellSize + cx, y + cy)
            }
        }
    }
}
