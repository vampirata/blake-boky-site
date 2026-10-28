import { addPropertyControls, ControlType } from "framer"
import { useState, useEffect, useCallback } from "react"

/**
 * Gallery Lightbox
 *
 * Bind Image 1 to 12 from the CMS. Empty slots are removed in code, so the grid
 * and the lightbox only ever contain real images, and the image you click is the
 * image that opens. Next and previous slide horizontally through the same list.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export default function GalleryLightbox(props) {
    const { columns, gap, backdrop, accent, highlight, style } = props
    const src = (v) => (typeof v === "string" ? v : v && v.src) || null
    const list = [src(props.image1), src(props.image2), src(props.image3), src(props.image4), src(props.image5), src(props.image6), src(props.image7), src(props.image8), src(props.image9), src(props.image10), src(props.image11), src(props.image12)].filter(Boolean)

    const [open, setOpen] = useState(-1)
    const close = useCallback(() => setOpen(-1), [])
    const step = useCallback(
        (d) => setOpen((i) => (i < 0 ? i : (i + d + list.length) % list.length)),
        [list.length]
    )

    useEffect(() => {
        if (open < 0) return
        const onKey = (e) => {
            if (e.key === "Escape") close()
            else if (e.key === "ArrowRight") step(1)
            else if (e.key === "ArrowLeft") step(-1)
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [open, close, step])

    if (!list.length)
        return <div style={{ ...style, minHeight: 32, opacity: 0.35, fontSize: 12 }}>No images set</div>

    return (
        <div style={{ ...style, width: "100%" }}>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap }}>
                {list.map((s, i) => (
                    <Tile key={i} src={s} highlight={highlight}
                        label={`Open image ${i + 1} of ${list.length}`} onClick={() => setOpen(i)} />
                ))}
            </div>

            {open >= 0 && (
                <div onClick={close} style={{
                    position: "fixed", inset: 0, zIndex: 2147483000, background: backdrop,
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    {/* sliding track — locked to a 9:16 frame so every image shows at the same scale */}
                    <div onClick={(e) => e.stopPropagation()} style={{
                        position: "relative", height: "min(80vh, 100%)", aspectRatio: "9 / 16",
                        maxWidth: "90vw", overflow: "hidden",
                    }}>
                        <div style={{
                            display: "flex", height: "100%", width: "100%",
                            transform: `translateX(-${open * 100}%)`,
                            transition: "transform 560ms cubic-bezier(0.22, 0.61, 0.36, 1)",
                        }}>
                            {list.map((s, i) => (
                                <div key={i} style={{
                                    flex: "0 0 100%", height: "100%",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                }}>
                                    <img src={s} alt="" draggable={false}
                                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <Circle side={{ left: "clamp(16px, 4vw, 56px)" }} accent={accent} highlight={highlight}
                        label="Previous image" onClick={(e) => { e.stopPropagation(); step(-1) }}>‹</Circle>
                    <Circle side={{ right: "clamp(16px, 4vw, 56px)" }} accent={accent} highlight={highlight}
                        label="Next image" onClick={(e) => { e.stopPropagation(); step(1) }}>›</Circle>
                    <Circle side={{ right: "clamp(16px, 4vw, 56px)", top: 32, transform: "none" }} size={44}
                        accent={accent} highlight={highlight}
                        label="Close" onClick={(e) => { e.stopPropagation(); close() }}>×</Circle>

                    <div style={{
                        position: "absolute", bottom: 30, left: 0, right: 0, textAlign: "center",
                        color: accent, fontSize: 12, letterSpacing: "0.18em",
                        fontFamily: "Inter, sans-serif", fontWeight: 300,
                    }}>
                        {open + 1} / {list.length}
                    </div>
                </div>
            )}
        </div>
    )
}

function Tile({ src, label, onClick, highlight }) {
    const [h, setH] = useState(false)
    return (
        <button onClick={onClick} aria-label={label}
            onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
            style={{
                padding: 0, border: "none", cursor: "pointer", overflow: "hidden",
                width: "100%", aspectRatio: "9 / 16",
                background: "rgba(255,255,255,0.04)", position: "relative",
                outline: h ? `1px solid ${highlight}` : "1px solid transparent",
                transition: "outline-color 260ms ease",
            }}>
            <img src={src} alt="" style={{
                width: "100%", height: "100%", objectFit: "cover", display: "block",
                transform: h ? "scale(1.04)" : "scale(1)",
                transition: "transform 620ms cubic-bezier(0.22, 0.61, 0.36, 1)",
            }} />
        </button>
    )
}

function Circle({ children, side, accent, highlight, label, onClick, size = 52 }) {
    const [h, setH] = useState(false)
    const [a, setA] = useState(false)
    return (
        <button onClick={onClick} aria-label={label}
            onMouseEnter={() => setH(true)} onMouseLeave={() => { setH(false); setA(false) }}
            onMouseDown={() => setA(true)} onMouseUp={() => setA(false)}
            style={{
                position: "absolute", top: "50%", transform: "translateY(-50%)",
                width: size, height: size, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `1px solid ${h ? highlight : accent}`,
                background: h ? highlight : "transparent",
                color: h ? "rgb(20,19,17)" : accent,
                fontSize: size * 0.62, lineHeight: 1, paddingBottom: 4,
                cursor: "pointer",
                transition: "background 240ms ease, color 240ms ease, border-color 240ms ease, transform 140ms ease",
                ...side,
                ...(a ? { transform: (side.transform || "translateY(-50%)") + " scale(0.92)" } : {}),
            }}>
            {children}
        </button>
    )
}

GalleryLightbox.defaultProps = {
    columns: 3, gap: 16,
    backdrop: "rgba(10,10,10,0.94)",
    accent: "rgba(240,238,232,0.9)",
    highlight: "rgb(227, 202, 166)",
}

addPropertyControls(GalleryLightbox, {
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
    columns: { type: ControlType.Number, title: "Columns", min: 1, max: 6, step: 1, displayStepper: true },
    gap: { type: ControlType.Number, title: "Gap", min: 0, max: 80, step: 2 },
    backdrop: { type: ControlType.Color, title: "Backdrop" },
    accent: { type: ControlType.Color, title: "Accent" },
    highlight: { type: ControlType.Color, title: "Highlight" },
})


