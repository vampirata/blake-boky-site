import { addPropertyControls, ControlType } from "framer"
import { useRef, useEffect, useState, useCallback } from "react"

/**
 * Image Ticker
 *
 * Continuously loops a strip of CMS images. Dragging takes over, and on release
 * it carries on in whichever direction the visitor pulled. Empty CMS slots are
 * dropped in code. Native image dragging is disabled so a drag scrolls instead
 * of lifting a picture. Every image shares one height and keeps true proportions.
 *
 * Movement uses a transform rather than native scrolling, so slow speeds are not
 * lost to whole pixel rounding.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export default function ImageTicker(props) {
    const { heightVh, gap, speed, edgeFade, fadeColor, style } = props
    const src = (v) => (typeof v === "string" ? v : v && v.src) || null
    const list = [src(props.image1), src(props.image2), src(props.image3), src(props.image4), src(props.image5), src(props.image6), src(props.image7), src(props.image8), src(props.image9), src(props.image10), src(props.image11), src(props.image12)].filter(Boolean)

    const trackRef = useRef(null)
    const offset = useRef(0)
    const half = useRef(0)
    const dir = useRef(1)
    const drag = useRef({ active: false, startX: 0, startOffset: 0, lastX: 0, lastT: 0, vx: 0 })
    const [grabbing, setGrabbing] = useState(false)

    const measure = useCallback(() => {
        const t = trackRef.current
        if (!t) return
        // the list is rendered twice, so one loop is half the track
        half.current = t.scrollWidth / 2
    }, [])

    useEffect(() => {
        measure()
        const onResize = () => measure()
        window.addEventListener("resize", onResize)
        return () => window.removeEventListener("resize", onResize)
    }, [measure, list.length])

    useEffect(() => {
        if (!list.length) return
        let raf
        let last = performance.now()
        const frame = (now) => {
            const dt = Math.min((now - last) / 1000, 0.05)
            last = now
            const t = trackRef.current
            if (t) {
                if (!half.current) measure()
                if (!drag.current.active && speed > 0) {
                    offset.current += speed * dir.current * dt
                }
                const h = half.current
                if (h > 0) {
                    if (offset.current >= h) offset.current -= h
                    else if (offset.current < 0) offset.current += h
                }
                t.style.transform = "translate3d(" + -offset.current + "px, 0, 0)"
            }
            raf = requestAnimationFrame(frame)
        }
        raf = requestAnimationFrame(frame)
        return () => cancelAnimationFrame(raf)
    }, [speed, list.length, measure])

    const down = useCallback((e) => {
        drag.current = {
            active: true, startX: e.clientX, startOffset: offset.current,
            lastX: e.clientX, lastT: performance.now(), vx: 0,
        }
        setGrabbing(true)
        try { e.currentTarget.setPointerCapture(e.pointerId) } catch (err) {}
    }, [])

    const move = useCallback((e) => {
        if (!drag.current.active) return
        const now = performance.now()
        const dx = e.clientX - drag.current.lastX
        const dt = Math.max(now - drag.current.lastT, 1)
        drag.current.vx = dx / dt
        drag.current.lastX = e.clientX
        drag.current.lastT = now
        offset.current = drag.current.startOffset - (e.clientX - drag.current.startX)
    }, [])

    const up = useCallback((e) => {
        if (!drag.current.active) return
        if (Math.abs(drag.current.vx) > 0.02) dir.current = drag.current.vx < 0 ? 1 : -1
        drag.current.active = false
        setGrabbing(false)
        try { e.currentTarget.releasePointerCapture(e.pointerId) } catch (err) {}
    }, [])

    if (!list.length)
        return <div style={{ ...style, height: heightVh + "vh", opacity: 0.3, fontSize: 12 }}>No images set</div>

    const run = [...list, ...list]

    return (
        <div
            style={{ ...style, position: "relative", width: "100%", height: heightVh + "vh", overflow: "hidden" }}
        >
            <div
                onPointerDown={down}
                onPointerMove={move}
                onPointerUp={up}
                onPointerCancel={up}
                onDragStart={(e) => e.preventDefault()}
                style={{
                    position: "absolute", inset: 0,
                    cursor: grabbing ? "grabbing" : "grab",
                    touchAction: "pan-y",
                    userSelect: "none", WebkitUserSelect: "none",
                }}
            >
                <div
                    ref={trackRef}
                    style={{
                        display: "flex", alignItems: "center", gap,
                        height: "100%", width: "max-content", willChange: "transform",
                    }}
                >
                    {run.map((s, i) => (
                        <img
                            key={i}
                            src={s}
                            alt=""
                            draggable={false}
                            onLoad={measure}
                            onDragStart={(e) => e.preventDefault()}
                            style={{
                                height: "100%", width: "auto", flex: "0 0 auto", display: "block",
                                objectFit: "contain", pointerEvents: "none",
                                userSelect: "none", WebkitUserSelect: "none", WebkitUserDrag: "none",
                            }}
                        />
                    ))}
                </div>
            </div>

            {edgeFade > 0 && (
                <>
                    <div style={fade("left", edgeFade, fadeColor)} />
                    <div style={fade("right", edgeFade, fadeColor)} />
                </>
            )}
        </div>
    )
}

function fade(side, w, color) {
    return {
        position: "absolute", top: 0, bottom: 0, [side]: 0, width: w, pointerEvents: "none",
        background: "linear-gradient(to " + (side === "left" ? "right" : "left") + ", " + color + ", transparent)",
    }
}

ImageTicker.defaultProps = { heightVh: 70, gap: 4, speed: 40, edgeFade: 0, fadeColor: "rgb(15,15,15)" }

addPropertyControls(ImageTicker, {
    image1: { type: ControlType.Image, title: "Image 1" },
    image2: { type: ControlType.Image, title: "Image 2" },
    image3: { type: ControlType.Image, title: "Image 3" },
    image4: { type: ControlType.Image, title: "Image 4" },
    image5: { type: ControlType.Image, title: "Image 5" },
    image6: { type: ControlType.Image, title: "Image 6" },
    image7: { type: ControlType.Image, title: "Image 7" },
    image8: { type: ControlType.Image, title: "Image 8" },
    image9: { type: ControlType.Image, title: "Image 9" },
    image10: { type: ControlType.Image, title: "Image 10" },
    image11: { type: ControlType.Image, title: "Image 11" },
    image12: { type: ControlType.Image, title: "Image 12" },
    heightVh: { type: ControlType.Number, title: "Height (vh)", min: 20, max: 100, step: 5, displayStepper: true },
    gap: { type: ControlType.Number, title: "Gap", min: 0, max: 60, step: 1 },
    speed: { type: ControlType.Number, title: "Speed", min: 0, max: 200, step: 5, description: "Pixels per second. 0 stops the tick." },
    edgeFade: { type: ControlType.Number, title: "Edge Fade", min: 0, max: 240, step: 4 },
    fadeColor: { type: ControlType.Color, title: "Fade Colour" },
})
