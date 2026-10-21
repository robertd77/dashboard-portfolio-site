import { ImageResponse } from "next/og";

export const alt = "Clearflow Reporting — Less manual work. Clearer reporting.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%", height: "100%", padding: "78px 86px", color: "#ffffff", background: "#173e32", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 35, fontWeight: 700, letterSpacing: -1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: 14, background: "#f1bd68", color: "#173e32", fontSize: 36 }}>C</div>
        Clearflow Reporting
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", fontSize: 72, fontWeight: 750, letterSpacing: -2 }}>Less manual work.</div>
        <div style={{ display: "flex", fontSize: 72, fontWeight: 750, letterSpacing: -2, color: "#f1bd68" }}>Clearer reporting.</div>
        <div style={{ display: "flex", fontSize: 27, marginTop: 20, color: "#d7e4db" }}>Reporting automation for small businesses</div>
      </div>
      <div style={{ display: "flex", fontSize: 23, color: "#d7e4db" }}>clearflowreporting.ca</div>
    </div>,
    size,
  );
}
