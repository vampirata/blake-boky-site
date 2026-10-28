import { addPropertyControls, ControlType } from "framer"
import { useState, useMemo } from "react"

/**
 * Works Search Grid
 *
 * Bind Title/Image/Link 1 through 20 from the CMS. Empty slots are removed in
 * code. A live search filters the grid by title. Cards use the site's shared
 * hover: lift on hover, full-width underline draws in under the title.
 *
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export default function WorksSearchGrid(props) {
    const { columns, gap, highlight, textColor, mutedColor, lineColor, cardBg, placeholder, style } = props
    const src = (v) => (typeof v === "string" ? v : v && v.src) || null
    const href = (v) => (typeof v === "string" ? v : v && v.href) || null

    const items = []
    for (let i = 1; i <= 24; i++) {
        const title = props[`title${i}`]
        const image = src(props[`image${i}`])
        const link = href(props[`link${i}`])
        if (title && image) items.push({ title, image, link: link || "#" })
    }

    const [query, setQuery] = useState("")
    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return items
        return items.filter((it) => it.title.toLowerCase().includes(q))
    }, [items, query])

    if (!items.length)
        return <div style={{ ...style, minHeight: 32, opacity: 0.35, fontSize: 12 }}>No works set</div>

    return (
        <div style={{ ...style, width: "100%", fontFamily: "Inter, sans-serif" }}>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    borderBottom: `1px solid ${lineColor}`,
                    padding: "12px 2px",
                    marginBottom: 44,
                }}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={mutedColor} strokeWidth="1.6" style={{ flex: "none", opacity: 0.7 }}>
                    <circle cx="11" cy="11" r="7" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    style={{
                        flex: 1,
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        color: textColor,
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 300,
                        fontSize: 15,
                    }}
                />
                <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: mutedColor, flex: "none" }}>
                    {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
                </span>
            </div>

            {filtered.length === 0 ? (
                <p style={{ fontSize: 14, color: mutedColor }}>No pieces match your search.</p>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: `${gap}px ${gap * 0.85}px` }}>
                    {filtered.map((it, i) => (
                        <Card key={it.title + i} item={it} highlight={highlight} textColor={textColor} cardBg={cardBg} />
                    ))}
                </div>
            )}
        </div>
    )
}

function Card({ item, highlight, textColor, cardBg }) {
    const [hover, setHover] = useState(false)
    return (
        <a
            href={item.link}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                display: "block",
                textDecoration: "none",
                transform: hover ? "translateY(-10px)" : "translateY(0px)",
                transition: "transform 0.4s cubic-bezier(0.59,0.02,0.44,1)",
            }}
        >
            <div style={{ width: "100%", aspectRatio: "9 / 16", overflow: "hidden", background: cardBg }}>
                <img src={item.image} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
            <span style={{ display: "block", width: "100%", marginTop: 14, position: "relative" }}>
                <span
                    style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 16,
                        color: textColor,
                    }}
                >
                    {item.title}
                </span>
                <span
                    style={{
                        position: "absolute",
                        left: 0,
                        bottom: -3,
                        width: "100%",
                        height: 1,
                        background: highlight,
                        transform: hover ? "scaleX(1)" : "scaleX(0)",
                        transformOrigin: "left",
                        transition: "transform 0.35s ease",
                    }}
                />
            </span>
        </a>
    )
}

const controls = { columns: { type: ControlType.Number, title: "Columns", min: 1, max: 6, step: 1, displayStepper: true, defaultValue: 4 },
    gap: { type: ControlType.Number, title: "Gap", min: 0, max: 80, step: 2, defaultValue: 24 },
    highlight: { type: ControlType.Color, title: "Highlight", defaultValue: "rgb(227, 202, 166)" },
    textColor: { type: ControlType.Color, title: "Text Color", defaultValue: "rgb(242, 242, 242)" },
    mutedColor: { type: ControlType.Color, title: "Muted Color", defaultValue: "rgb(138, 138, 134)" },
    lineColor: { type: ControlType.Color, title: "Line Color", defaultValue: "rgb(42, 42, 40)" },
    cardBg: { type: ControlType.Color, title: "Card Background", defaultValue: "rgb(22, 22, 21)" },
    placeholder: { type: ControlType.String, title: "Placeholder", defaultValue: "Search pieces in this collection…" },
}
for (let i = 1; i <= 24; i++) {
    controls[`title${i}`] = { type: ControlType.String, title: `Title ${i}` }
    controls[`image${i}`] = { type: ControlType.Image, title: `Image ${i}` }
    controls[`link${i}`] = { type: ControlType.Link, title: `Link ${i}` }
}

addPropertyControls(WorksSearchGrid, controls)
