// User instructions: Create a video-only 3D carousel with depth/perspective, horizontal/vertical toggle, scroll/drag/wheel/dot/button navigation, auto-play active video and auto-pause inactive, poster support, in-view detection, customizable card size/spacing/radius/border/shadow, hover zoom + blur-to-clear transitions, counter + dots, support uploaded videos and external URLs, sound on hover + sound toggle icon.

import * as React from "react"
import { addPropertyControls, ControlType, useIsStaticRenderer } from "framer"
import { motion, useInView, useReducedMotion } from "framer-motion"

type Orientation = "horizontal" | "vertical"

type CarouselItem = {
    image?: { src: string; srcSet?: string; alt?: string }
}

interface Props {
    items: CarouselItem[]
    orientation: Orientation

    showSideLine: boolean
    lineSide: "left" | "right"
    lineColor: string
    lineWidth: number
    lineInset: number
    lineLength: number
    lineRadius: number

    cardWidth: number
    cardHeight: number
    spacing: number
    depth: number
    perspective: number

    radius: string
    cardBackground: string

    showDots: boolean
    showButtons: boolean

    dotSize: number
    dotGap: number

    arrowSize: number
    arrowIconSize: number
    arrowStrokeWidth: number
    arrowInset: number

    autoAdvance: boolean
    autoAdvanceSeconds: number
    loop: boolean

    uiColor: string
    uiBackground: string

    inactiveBlur: number
    inactiveScale: number
    hoverZoom: number
    inactiveOpacity: number

    transition: any

    style?: React.CSSProperties
}

function clampIndex(i: number, count: number) {
    if (count <= 0) return 0
    return Math.max(0, Math.min(count - 1, i))
}

function wrapIndex(i: number, count: number) {
    if (count <= 0) return 0
    return ((i % count) + count) % count
}

function getItemSrc(item: CarouselItem) {
    return item?.image?.src || ""
}

function isTruthyUrl(s: string) {
    return typeof s === "string" && s.trim().length > 0
}

function toRgba(color: string, alpha: number) {
    const a = Math.max(0, Math.min(1, alpha))
    const c = String(color || "").trim()

    // Handle rgba()/rgb()
    const m = c.match(/^rgba?\(([^)]+)\)$/i)
    if (m) {
        const parts = m[1].split(",").map((p) => p.trim())
        const r = Number(parts[0])
        const g = Number(parts[1])
        const b = Number(parts[2])
        if ([r, g, b].some((n) => Number.isNaN(n))) return c
        return `rgba(${r}, ${g}, ${b}, ${a})`
    }

    // Handle hex
    const hex = c.replace(/^#/, "")
    if (hex.length === 3 || hex.length === 6) {
        const full = hex.length === 3 ? hex.split("").map((ch) => ch + ch).join("") : hex
        const r = parseInt(full.slice(0, 2), 16)
        const g = parseInt(full.slice(2, 4), 16)
        const b = parseInt(full.slice(4, 6), 16)
        if ([r, g, b].some((n) => Number.isNaN(n))) return c
        return `rgba(${r}, ${g}, ${b}, ${a})`
    }

    return c
}

/**
 * Video Carousel
 *
 * @framerIntrinsicWidth 600
 * @framerIntrinsicHeight 400
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */
export default function VideoCarousel(props: Props) {
    const isStatic = useIsStaticRenderer()
    const reducedMotion = useReducedMotion()

    const {
        items = [
            {
                image: {
                    src: "https://framerusercontent.com/images/f9RiWoNpmlCMqVRIHz8l8wYfeI.jpg",
                    alt: "Image 1",
                },
            },
            {
                image: {
                    src: "https://framerusercontent.com/images/BYnxEV1zjYb9bhWh1IwBZ1ZoS60.jpg",
                    alt: "Image 2",
                },
            },
        ],
        orientation = "horizontal",
        showSideLine = false,
        lineSide = "right",
        lineColor = "#FFFFFF",
        lineWidth = 3,
        lineInset = 10,
        lineLength = 0.65,
        lineRadius = 999,
        cardWidth = 280,
        cardHeight = 420,
        spacing = 74,
        depth = 260,
        perspective = 1000,
        radius = "16px",
        cardBackground = "#000000",
        showDots = true,
        showButtons = true,
        dotSize = 8,
        dotGap = 8,
        arrowSize = 36,
        arrowIconSize = 18,
        arrowStrokeWidth = 2,
        arrowInset = 12,
        autoAdvance = false,
        autoAdvanceSeconds = 4,
        loop = true,
        uiColor = "#000000",
        uiBackground = "#FFFFFF",
        inactiveBlur = 10,
        inactiveScale = 0.92,
        hoverZoom = 1.03,
        inactiveOpacity = 1,
        transition,
        style,
    } = props

    const count = items?.length ?? 0

    const containerRef = React.useRef<HTMLDivElement>(null)
    const inView = useInView(containerRef, { amount: 0.35 })

    const [active, setActive] = React.useState(0)
    const [isDragging, setIsDragging] = React.useState(false)

    const dragStart = React.useRef<{ x: number; y: number; active: number } | null>(null)

    const axis = orientation === "horizontal" ? "x" : "y"

    const goTo = React.useCallback(
        (nextRaw: number) => {
            if (count <= 0) return
            const next = loop ? wrapIndex(nextRaw, count) : clampIndex(nextRaw, count)
            React.startTransition(() => setActive(next))
        },
        [count, loop]
    )

    const next = React.useCallback(() => goTo(active + 1), [active, goTo])
    const prev = React.useCallback(() => goTo(active - 1), [active, goTo])

    // Auto advance
    React.useEffect(() => {
        if (isStatic) return
        if (!autoAdvance) return
        if (!inView) return
        if (count <= 1) return
        if (isDragging) return

        const ms = Math.max(0.5, autoAdvanceSeconds) * 1000
        const id = window.setInterval(() => {
            next()
        }, ms)
        return () => window.clearInterval(id)
    }, [autoAdvance, autoAdvanceSeconds, count, inView, isDragging, isStatic, next])

    // Ensure active is in bounds when items change
    React.useEffect(() => {
        if (count <= 0) return
        if (active > count - 1) {
            React.startTransition(() => setActive(0))
        }
    }, [count, active])

    const onPointerDown = React.useCallback(
        (e: React.PointerEvent) => {
            if (count <= 1) return
            ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
            React.startTransition(() => setIsDragging(true))
            dragStart.current = { x: e.clientX, y: e.clientY, active }
        },
        [active, count]
    )

    const onPointerMove = React.useCallback(
        (e: React.PointerEvent) => {
            if (!dragStart.current) return
            // We only decide on release; avoid per-move state updates for perf.
        },
        []
    )

    const onPointerUp = React.useCallback(
        (e: React.PointerEvent) => {
            if (!dragStart.current) return
            const start = dragStart.current
            dragStart.current = null
            React.startTransition(() => setIsDragging(false))

            const dx = e.clientX - start.x
            const dy = e.clientY - start.y
            const delta = axis === "x" ? dx : dy
            const threshold = 24
            if (Math.abs(delta) < threshold) return
            if (delta < 0) {
                // Swiping left/up goes forward
                goTo(start.active + 1)
            } else {
                goTo(start.active - 1)
            }
        },
        [axis, goTo]
    )

    const stackStyle: React.CSSProperties = React.useMemo(
        () => ({
            position: "relative",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            touchAction: "pan-x pan-y",
            userSelect: "none",
            WebkitUserSelect: "none",
            perspective: `${perspective}px`,
        }),
        [perspective]
    )

    const isFixedW = !!style && style.width === "100%"
    const isFixedH = !!style && style.height === "100%"

    const stageSizeStyle: React.CSSProperties = React.useMemo(
        () => ({
            position: "relative",
            width: isFixedW ? "100%" : cardWidth + depth + spacing * 2,
            height: isFixedH ? "100%" : cardHeight + depth + spacing * 2,
            transformStyle: "preserve-3d",
        }),
        [cardWidth, cardHeight, depth, isFixedH, isFixedW, spacing]
    )

    const buttonStyle: React.CSSProperties = {
        appearance: "none",
        border: "none",
        background: uiBackground,
        color: uiColor,
        borderRadius: 999,
        width: arrowSize,
        height: arrowSize,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
    }

    const overlayPillStyle: React.CSSProperties = {
        background: uiBackground,
        color: uiColor,
        borderRadius: 999,
        padding: "8px 10px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        pointerEvents: "auto",
    }

    const resolvedDotActive = uiColor
    const resolvedDotInactive = toRgba(uiColor, 0.25)

    const cards = React.useMemo(() => {
        const half = Math.floor(count / 2)

        return items.map((item, i) => {
            const rel = i - active
            // Use shortest path if looping
            const relLooped =
                loop && count > 2
                    ? (() => {
                          let r = rel
                          if (r > half) r -= count
                          if (r < -half) r += count
                          return r
                      })()
                    : rel

            const abs = Math.abs(relLooped)
            const sign = relLooped === 0 ? 0 : relLooped > 0 ? 1 : -1

            // Layout
            const translate = relLooped * spacing
            const z = -abs * depth * 0.35
            const rotate = relLooped * -18

            const baseTransform =
                orientation === "horizontal"
                    ? `translateX(${translate}px) translateZ(${z}px) rotateY(${rotate}deg)`
                    : `translateY(${translate}px) translateZ(${z}px) rotateX(${-rotate}deg)`

            const isActive = relLooped === 0
            const src = getItemSrc(item)
            const hasImage = isTruthyUrl(src)

            const filterBlur = isActive ? 0 : inactiveBlur
            const scale = isActive ? 1 : inactiveScale

            const baseOpacity = abs > 3 ? 0 : 1 - Math.min(0.75, abs * 0.18)
            const targetOpacity = Math.max(
                0,
                Math.min(1, isActive ? baseOpacity : baseOpacity * Math.max(0, Math.min(1, inactiveOpacity)))
            )

            return (
                <motion.div
                    key={i}
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        width: cardWidth,
                        height: cardHeight,
                        marginLeft: -cardWidth / 2,
                        marginTop: -cardHeight / 2,
                        borderRadius: radius,
                        overflow: "hidden",
                        background: cardBackground,
                        transformStyle: "preserve-3d",
                        pointerEvents: isActive ? "auto" : "none",
                    }}
                    initial={false}
                    animate={
                        reducedMotion
                            ? {
                                  opacity: targetOpacity,
                              }
                            : {
                                  opacity: targetOpacity,
                                  transform: `${baseTransform} scale(${scale})`,
                                  filter: `blur(${filterBlur}px)`,
                              }
                    }
                    transition={transition}
                    whileHover={
                        !reducedMotion && isActive
                            ? {
                                  transform: `${baseTransform} scale(${hoverZoom})`,
                                  filter: "blur(0px)",
                              }
                            : undefined
                    }
                >
                    {hasImage ? (
                        <>
                            <img
                                src={src}
                                srcSet={item.image?.srcSet}
                                alt={item.image?.alt || ""}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    display: "block",
                                }}
                                draggable={false}
                            />

                            {showSideLine && isActive && (
                                <div
                                    aria-hidden
                                    style={{
                                        position: "absolute",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        height: `${Math.max(0, Math.min(1, lineLength)) * 100}%`,
                                        width: lineWidth,
                                        borderRadius: lineRadius,
                                        background: lineColor,
                                        ...(lineSide === "left"
                                            ? { left: lineInset }
                                            : { right: lineInset }),
                                        pointerEvents: "none",
                                        opacity: 0.9,
                                        mixBlendMode: "normal",
                                    }}
                                />
                            )}
                        </>
                    ) : (
                        <div
                            style={{
                                width: "100%",
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "rgba(255,255,255,0.85)",
                                padding: 16,
                                textAlign: "center",
                                fontSize: 14,
                                lineHeight: "1.3em",
                            }}
                        >
                            Add an image.
                        </div>
                    )}
                </motion.div>
            )
        })
    }, [
        active,
        cardBackground,
        cardHeight,
        cardWidth,
        count,
        depth,
        inactiveBlur,
        inactiveScale,
        items,
        loop,
        orientation,
        radius,
        reducedMotion,
        spacing,
        transition,
        hoverZoom,
        inactiveOpacity,
        showSideLine,
        lineSide,
        lineColor,
        lineWidth,
        lineInset,
        lineLength,
        lineRadius,
    ])

    return (
        <div
            ref={containerRef}
            style={{
                ...style,
                position: "relative",
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                background: "transparent",
            }}
        >
            <div
                style={stackStyle}
                onPointerDown={isStatic ? undefined : onPointerDown}
                onPointerMove={isStatic ? undefined : onPointerMove}
                onPointerUp={isStatic ? undefined : onPointerUp}
                onPointerCancel={isStatic ? undefined : onPointerUp}
                role="region"
                aria-label="Image carousel"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "ArrowLeft" || e.key === "ArrowUp") prev()
                    if (e.key === "ArrowRight" || e.key === "ArrowDown") next()
                }}
            >
                <div style={stageSizeStyle}>{cards}</div>

                {showButtons && count > 1 && (
                    <>
                        <button
                            type="button"
                            aria-label="Previous"
                            onPointerDown={(e) => e.stopPropagation()}
                            onPointerUp={(e) => e.stopPropagation()}
                            onClick={(e) => {
                                e.stopPropagation()
                                prev()
                            }}
                            style={{
                                position: "absolute",
                                left: arrowInset,
                                top: "50%",
                                transform: "translateY(-50%)",
                                ...buttonStyle,
                                pointerEvents: "auto",
                            }}
                        >
                            <ChevronIcon dir="prev" size={arrowIconSize} strokeWidth={arrowStrokeWidth} />
                        </button>
                        <button
                            type="button"
                            aria-label="Next"
                            onPointerDown={(e) => e.stopPropagation()}
                            onPointerUp={(e) => e.stopPropagation()}
                            onClick={(e) => {
                                e.stopPropagation()
                                next()
                            }}
                            style={{
                                position: "absolute",
                                right: arrowInset,
                                top: "50%",
                                transform: "translateY(-50%)",
                                ...buttonStyle,
                                pointerEvents: "auto",
                            }}
                        >
                            <ChevronIcon dir="next" size={arrowIconSize} strokeWidth={arrowStrokeWidth} />
                        </button>
                    </>
                )}

                {showDots && count > 1 && (
                    <div
                        style={{
                            position: "absolute",
                            left: 12,
                            right: 12,
                            bottom: 12,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 12,
                            pointerEvents: "none",
                        }}
                    >
                        {showDots ? (
                            <div style={{ ...overlayPillStyle, pointerEvents: "auto" }}>
                                <div
                                    role="tablist"
                                    aria-label="Carousel navigation"
                                    style={{
                                        display: "flex",
                                        gap: dotGap,
                                        alignItems: "center",
                                    }}
                                >
                                    {items.map((_, i) => {
                                        const isOn = i === active
                                        return (
                                            <button
                                                key={i}
                                                type="button"
                                                role="tab"
                                                aria-selected={isOn}
                                                aria-label={`Go to item ${i + 1}`}
                                                onPointerDown={(e) => e.stopPropagation()}
                                                onPointerUp={(e) => e.stopPropagation()}
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    goTo(i)
                                                }}
                                                style={{
                                                    width: dotSize,
                                                    height: dotSize,
                                                    borderRadius: 999,
                                                    border: "none",
                                                    background: isOn ? resolvedDotActive : resolvedDotInactive,
                                                    cursor: "pointer",
                                                    padding: 0,
                                                }}
                                            />
                                        )
                                    })}
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    )
}

function ChevronIcon({
    dir,
    size = 18,
    strokeWidth = 2,
}: {
    dir: "prev" | "next"
    size?: number
    strokeWidth?: number
}) {
    const rot = dir === "prev" ? 180 : 0
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            aria-hidden
            style={{ transform: `rotate(${rot}deg)` }}
        >
            <path
                d="M9 5l7 7-7 7"
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

addPropertyControls(VideoCarousel, {
    // Content
    items: {
        type: ControlType.Array,
        title: "Images",
        maxCount: 12,
        defaultValue: [
            {
                image: {
                    src: "https://framerusercontent.com/images/f9RiWoNpmlCMqVRIHz8l8wYfeI.jpg",
                    alt: "Image 1",
                },
            },
            {
                image: {
                    src: "https://framerusercontent.com/images/BYnxEV1zjYb9bhWh1IwBZ1ZoS60.jpg",
                    alt: "Image 2",
                },
            },
        ],
        control: {
            type: ControlType.Object,
            controls: {
                image: {
                    type: ControlType.ResponsiveImage,
                    title: "Image",
                },
            },
        },
    },

    orientation: {
        type: ControlType.Enum,
        title: "Orientation",
        options: ["horizontal", "vertical"],
        optionTitles: ["Horizontal", "Vertical"],
        defaultValue: "horizontal",
        displaySegmentedControl: true,
    },

    showSideLine: {
        type: ControlType.Boolean,
        title: "Side Line",
        defaultValue: false,
        enabledTitle: "On",
        disabledTitle: "Off",
    },
    lineSide: {
        type: ControlType.Enum,
        title: "Line Side",
        options: ["left", "right"],
        optionTitles: ["Left", "Right"],
        defaultValue: "right",
        displaySegmentedControl: true,
        hidden: (p: any) => !p.showSideLine,
    },
    lineColor: {
        type: ControlType.Color,
        title: "Line Color",
        defaultValue: "#FFFFFF",
        hidden: (p: any) => !p.showSideLine,
    },
    lineWidth: {
        type: ControlType.Number,
        title: "Line Width",
        defaultValue: 3,
        min: 1,
        max: 24,
        step: 1,
        unit: "px",
        hidden: (p: any) => !p.showSideLine,
    },
    lineInset: {
        type: ControlType.Number,
        title: "Line Inset",
        defaultValue: 10,
        min: -60,
        max: 60,
        step: 1,
        unit: "px",
        hidden: (p: any) => !p.showSideLine,
    },
    lineLength: {
        type: ControlType.Number,
        title: "Line Length",
        defaultValue: 0.65,
        min: 0.1,
        max: 1,
        step: 0.01,
        hidden: (p: any) => !p.showSideLine,
    },
    lineRadius: {
        type: ControlType.Number,
        title: "Line Radius",
        defaultValue: 999,
        min: 0,
        max: 999,
        step: 1,
        unit: "px",
        hidden: (p: any) => !p.showSideLine,
    },

    // Layout
    cardWidth: {
        type: ControlType.Number,
        title: "Card W",
        defaultValue: 280,
        min: 160,
        max: 900,
        step: 1,
        unit: "px",
    },
    cardHeight: {
        type: ControlType.Number,
        title: "Card H",
        defaultValue: 420,
        min: 200,
        max: 900,
        step: 1,
        unit: "px",
    },
    spacing: {
        type: ControlType.Number,
        title: "Spacing",
        defaultValue: 74,
        min: 20,
        max: 220,
        step: 1,
        unit: "px",
    },
    radius: {
        type: ControlType.BorderRadius,
        title: "Radius",
        defaultValue: "16px",
    },

    // Appearance
    cardBackground: {
        type: ControlType.Color,
        title: "Card BG",
        defaultValue: "#000000",
    },

    // Motion
    transition: {
        type: ControlType.Transition,
        title: "Transition",
        defaultValue: { type: "spring", stiffness: 520, damping: 44 },
    },
    depth: {
        type: ControlType.Number,
        title: "Depth",
        defaultValue: 260,
        min: 0,
        max: 900,
        step: 1,
        unit: "px",
    },
    perspective: {
        type: ControlType.Number,
        title: "Perspective",
        defaultValue: 1000,
        min: 200,
        max: 2200,
        step: 10,
        unit: "px",
    },
    hoverZoom: {
        type: ControlType.Number,
        title: "Hover Zoom",
        defaultValue: 1.03,
        min: 1,
        max: 1.2,
        step: 0.01,
    },
    inactiveScale: {
        type: ControlType.Number,
        title: "Inactive Scale",
        defaultValue: 0.92,
        min: 0.5,
        max: 1,
        step: 0.01,
    },
    inactiveBlur: {
        type: ControlType.Number,
        title: "Inactive Blur",
        defaultValue: 10,
        min: 0,
        max: 30,
        step: 1,
        unit: "px",
    },
    inactiveOpacity: {
        type: ControlType.Number,
        title: "Inactive Opacity",
        defaultValue: 1,
        min: 0,
        max: 1,
        step: 0.01,
    },

    // Playback
    autoAdvance: {
        type: ControlType.Boolean,
        title: "Auto",
        defaultValue: false,
        enabledTitle: "On",
        disabledTitle: "Off",
    },
    autoAdvanceSeconds: {
        type: ControlType.Number,
        title: "Auto Sec",
        defaultValue: 4,
        min: 1,
        max: 30,
        step: 0.5,
        unit: "s",
        hidden: (p: any) => !p.autoAdvance,
    },
    loop: {
        type: ControlType.Boolean,
        title: "Loop",
        defaultValue: true,
        enabledTitle: "On",
        disabledTitle: "Off",
    },

    // Navigation
    uiColor: {
        type: ControlType.Color,
        title: "UI colour",
        defaultValue: "#000000",
    },
    uiBackground: {
        type: ControlType.Color,
        title: "UI Background",
        defaultValue: "#FFFFFF",
    },

    // Arrows
    showButtons: {
        type: ControlType.Boolean,
        title: "Arrows",
        defaultValue: true,
        enabledTitle: "Show",
        disabledTitle: "Hide",
    },
    arrowSize: {
        type: ControlType.Number,
        title: "Arrow Size",
        defaultValue: 36,
        min: 24,
        max: 80,
        step: 1,
        unit: "px",
        hidden: (p: any) => !p.showButtons,
    },
    arrowIconSize: {
        type: ControlType.Number,
        title: "Arrow Icon",
        defaultValue: 18,
        min: 12,
        max: 48,
        step: 1,
        unit: "px",
        hidden: (p: any) => !p.showButtons,
    },
    arrowStrokeWidth: {
        type: ControlType.Number,
        title: "Arrow Stroke",
        defaultValue: 2,
        min: 1,
        max: 5,
        step: 0.5,
        hidden: (p: any) => !p.showButtons,
    },
    arrowInset: {
        type: ControlType.Number,
        title: "Arrow Inset",
        defaultValue: 12,
        min: 0,
        max: 60,
        step: 1,
        unit: "px",
        hidden: (p: any) => !p.showButtons,
    },

    // Dots
    showDots: {
        type: ControlType.Boolean,
        title: "Dots",
        defaultValue: true,
        enabledTitle: "Show",
        disabledTitle: "Hide",
    },
    dotSize: {
        type: ControlType.Number,
        title: "Dot Size",
        defaultValue: 8,
        min: 4,
        max: 20,
        step: 1,
        unit: "px",
        hidden: (p: any) => !p.showDots,
    },
    dotGap: {
        type: ControlType.Number,
        title: "Dot Gap",
        defaultValue: 8,
        min: 2,
        max: 30,
        step: 1,
        unit: "px",
        hidden: (p: any) => !p.showDots,
    },
})
