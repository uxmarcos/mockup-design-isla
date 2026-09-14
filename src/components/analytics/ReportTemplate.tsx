import { forwardRef, useMemo } from "react";
import rodrigoAsset from "@/assets/rodrigo-baer.png.asset.json";
import {
  useIcpAudienceGrowth,
  useWarmupVelocity,
  useTopContentByIcpEngagement,
  SENDERS,
} from "@/lib/cross-data";
import { inboundKpis } from "@/lib/analytics-data";
import { scaleCount } from "@/lib/cross-filters";


function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

type Props = {
  rangeLabel: string;
  factor: number;
  sender: string; // display label, e.g. "All profiles" or "Name A, Name B"
  senders: string[]; // filter list; empty = all
  visible?: boolean;
};


export const ReportTemplate = forwardRef<HTMLDivElement, Props>(function ReportTemplate(
  { rangeLabel, factor, sender, senders, visible = false },
  ref,
) {

  
  const { data: growth } = useIcpAudienceGrowth();
  const { data: warm } = useWarmupVelocity();
  const { data: topPosts } = useTopContentByIcpEngagement(undefined, 10);

  const featuredMonth = useMemo(() => {
    if (!topPosts.length) return null;
    const latest = topPosts.reduce((a, b) =>
      new Date(a.publishedAt) > new Date(b.publishedAt) ? a : b,
    );
    const d = new Date(latest.publishedAt);
    return { year: d.getFullYear(), month: d.getMonth() };
  }, [topPosts]);

  const featuredMonthLabel = useMemo(() => {
    if (!featuredMonth) return "";
    return new Date(featuredMonth.year, featuredMonth.month, 1).toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    });
  }, [featuredMonth]);

  const filteredPosts = useMemo(() => {
    const bySender = senders.length === 0 ? topPosts : topPosts.filter((p) => senders.includes(p.author));
    const byMonth = featuredMonth
      ? bySender.filter((p) => {
          const d = new Date(p.publishedAt);
          return d.getFullYear() === featuredMonth.year && d.getMonth() === featuredMonth.month;
        })
      : bySender;
    return byMonth.slice(0, 8).map((p) => ({
      ...p,
      highIcpEngaged: scaleCount(p.highIcpEngaged, factor),
      totalEngaged: scaleCount(p.totalEngaged, factor),
    }));
  }, [topPosts, senders, factor, featuredMonth]);



  // Derive top engagers from senders as ICP-aligned people
  const topEngagers = useMemo(() => {
    const base = [
      { name: "Adriano Aguiar", role: "CIO/CTO · Advisor", score: 89, temp: "hot" as const },
      { name: "Luiz Vitor Martinez", role: "CEO & Founder @ DATENCE", score: 89, temp: "hot" as const },
      { name: "Giovanni Salvador", role: "CEO @ SCIENT · RevOps", score: 87, temp: "hot" as const },
      { name: "André Bartholomeu", role: "Founder @ Boom · Martech + AI", score: 87, temp: "hot" as const },
      { name: "Luis Rodeguero", role: "CFO/COO · Portfolio Manager", score: 86, temp: "warm" as const },
      { name: "Mariana Vasconcelos", role: "Founder @ Agrosmart", score: 85, temp: "warm" as const },
      { name: "Ingrid Barth", role: "Founder @ PilotIn · ex-Linker", score: 85, temp: "warm" as const },
      { name: "Changmin Lee", role: "Founder @ Zybro · Real Estate", score: 85, temp: "warm" as const },
      { name: "Camila Vargas Restrepo", role: "Co-founder @ Turbo AI", score: 85, temp: "warm" as const },
      { name: "Antonio Carlos Pina", role: "CTO · Cloud / Data / AI", score: 85, temp: "cold" as const },
    ];
    return base.map((e, i) => ({
      ...e,
      avatar: SENDERS[i % SENDERS.length].avatar,
    }));
  }, []);

  const posts = scaleCount(inboundKpis.posts, factor);
  const impressions = scaleCount(inboundKpis.impressions, factor);
  const engagement = scaleCount(inboundKpis.engagement, factor);
  const followers = scaleCount(inboundKpis.newFollowers, factor);

  const lastGrowth = growth.series[growth.series.length - 1];
  const newIcpInPeriod = scaleCount(growth.icpDelta, factor);
  const icpTotal = scaleCount(lastGrowth.icpFollowers, factor);
  const combinedTotal = scaleCount(lastGrowth.totalFollowers, factor);

  const warmStages = {
    cold: scaleCount(warm.stages.cold, factor),
    warming: scaleCount(warm.stages.warming, factor),
    hot: scaleCount(warm.stages.hot, factor),
  };



  const generatedAt = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      ref={ref}
      style={{
        ...(visible
          ? { position: "relative", margin: "0 auto" }
          : { position: "fixed", left: "-10000px", top: 0 }),
        width: "794px", // A4 width at 96dpi
        background: "#0A0A0A",
        color: "#FAFAFA",
        fontFamily: "Inter, system-ui, sans-serif",
        padding: "40px",
        boxSizing: "border-box",
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #2C2C2C",
          paddingBottom: "16px",
          marginBottom: "20px",
        }}
      >
        <svg width="65" height="25" viewBox="0 0 81 31" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: "#FAFAFA" }}>
          <path d="M16.2572 1.97943C18.9336 1.87977 21.5685 2.29069 23.0534 4.80844C23.4621 5.68647 24.0898 6.09288 24.5426 6.38605C24.705 6.49116 24.8449 6.58173 24.9441 6.67427C25.1175 6.84076 25.6284 7.11692 26.1761 7.41293C26.8857 7.79647 27.6571 8.21333 27.8361 8.4683C29.3383 10.5786 29.5415 11.8281 29.4818 14.356C28.9892 16.7886 27.0026 22.5503 22.9968 26.1359C20.5649 27.4845 18.4805 28.5037 15.7092 28.2908C15.6328 28.2857 15.556 28.2807 15.479 28.2757C14.9356 28.2402 14.3777 28.2037 13.8474 28.1123C13.3899 28.0439 12.9449 27.9306 12.4994 27.8171C12.2419 27.7516 11.9843 27.6859 11.7239 27.6289C11.5706 27.5954 11.4194 27.5626 11.2703 27.5303C8.91721 27.02 7.06342 26.618 5.15002 24.8999C4.79213 24.5786 4.51745 24.2016 4.23712 23.8169C4.20619 23.7745 4.17516 23.7319 4.14397 23.6894C2.97415 22.0926 2.09527 20.3288 1.98544 18.3176C1.93931 17.4726 1.97489 16.5746 2.0993 15.7368C2.13692 15.4834 2.18748 15.2319 2.23797 14.9805C2.27516 14.7954 2.31232 14.6104 2.34437 14.4246C2.38441 14.1923 2.42514 13.9599 2.46593 13.7273C2.63177 12.7813 2.79796 11.8332 2.91946 10.8817C2.99456 10.2939 3.03916 9.70676 3.08399 9.11735C3.09195 9.01246 3.09994 8.90747 3.1081 8.80242C3.11354 8.73237 3.11872 8.66218 3.1239 8.59199C3.15856 8.12041 3.1934 7.64656 3.31503 7.18861C3.50357 6.47845 3.86109 5.76645 4.35414 5.21905C6.83208 2.46799 12.1465 2.19255 15.8803 1.99906C16.0078 1.99244 16.1335 1.98596 16.2572 1.97943ZM16.9001 5.37027C14.2866 3.73372 11.0877 2.43047 8.48072 4.07731C4.64586 6.49985 2.87939 10.4133 4.25174 15.5349C5.34157 19.6022 7.22273 22.5973 9.32234 24.8581C12.6278 28.4173 18.4654 26.4723 21.8925 23.0299C25.4884 19.4179 28.9616 16.5847 27.7818 12.1815C26.2766 6.56414 22.3052 8.75494 16.9001 5.37027Z" fill="currentColor"/>
          <path d="M34.7334 26.7631V11.2273H38.9046V26.7631H34.7334Z" fill="currentColor"/>
          <path d="M55.5605 13.7424L51.7578 14.1573C51.6504 13.7732 51.462 13.4121 51.1933 13.0741C50.9321 12.7361 50.5786 12.4634 50.1333 12.256C49.6876 12.0486 49.142 11.9449 48.4969 11.9449C47.6289 11.9449 46.8991 12.1331 46.3074 12.5095C45.7238 12.8859 45.4358 13.3737 45.4433 13.9729C45.4358 14.4876 45.6238 14.9063 46.0079 15.2289C46.3998 15.5515 47.045 15.8166 47.9438 16.024L50.9629 16.6693C52.6373 17.0303 53.8818 17.6026 54.6961 18.3862C55.5182 19.1697 55.933 20.1953 55.9406 21.4628C55.933 22.5766 55.6063 23.5599 54.9611 24.4126C54.3235 25.2576 53.4362 25.9183 52.2995 26.3945C51.1625 26.8708 49.8567 27.1089 48.3815 27.1089C46.2153 27.1089 44.4714 26.6557 43.1503 25.7492C41.8291 24.8351 41.0417 23.5638 40.7881 21.9352L44.8558 21.5434C45.0399 22.3423 45.4318 22.9454 46.0311 23.3525C46.6301 23.7596 47.41 23.9632 48.3701 23.9632C49.3609 23.9632 50.1562 23.7596 50.7555 23.3525C51.3623 22.9454 51.6658 22.4422 51.6658 21.843C51.6658 21.336 51.4698 20.9173 51.0779 20.587C50.6939 20.2567 50.0946 20.0032 49.2803 19.8265L46.2615 19.1928C44.5638 18.8394 43.3079 18.244 42.4936 17.4067C41.6793 16.5617 41.276 15.4939 41.2835 14.2034C41.276 13.1125 41.5715 12.1677 42.1709 11.3688C42.7777 10.5621 43.6188 9.93992 44.6942 9.50206C45.7775 9.05649 47.026 8.83374 48.4392 8.83374C50.5134 8.83374 52.1458 9.27544 53.3366 10.1588C54.5349 11.0423 55.276 12.2368 55.5605 13.7424Z" fill="currentColor"/>
          <path d="M61.9291 3.16479V26.7636H57.7578V3.16479H61.9291Z" fill="currentColor"/>
          <path d="M69.689 27.1205C68.5677 27.1205 67.5575 26.9207 66.6587 26.5213C65.7674 26.1141 65.0607 25.515 64.5383 24.7237C64.0239 23.9325 63.7664 22.9569 63.7664 21.7969C63.7664 20.7983 63.9508 19.9725 64.3195 19.3195C64.6881 18.6665 65.1914 18.1442 65.829 17.7524C66.4667 17.3606 67.1849 17.0649 67.9838 16.8651C68.7902 16.6577 69.6238 16.508 70.4843 16.4157C71.5213 16.3082 72.3625 16.2122 73.0077 16.1277C73.6532 16.0355 74.1217 15.8972 74.4134 15.7129C74.7132 15.5208 74.8629 15.2251 74.8629 14.8256V14.7565C74.8629 13.8884 74.6057 13.2162 74.0909 12.74C73.5762 12.2637 72.835 12.0255 71.867 12.0255C70.8454 12.0255 70.0347 12.2483 69.4357 12.6939C68.8443 13.1394 68.4448 13.6656 68.2374 14.2725L64.3424 13.7194C64.6498 12.6439 65.157 11.7452 65.8634 11.0231C66.5702 10.2933 67.4346 9.74788 68.4563 9.38682C69.478 9.01809 70.6071 8.83374 71.8438 8.83374C72.6967 8.83374 73.5454 8.93358 74.3904 9.13333C75.2355 9.33304 76.0075 9.66337 76.7064 10.1243C77.4056 10.5775 77.9663 11.1959 78.389 11.9794C78.8192 12.763 79.0342 13.7424 79.0342 14.9178V26.7633H75.0241V24.3319H74.8859C74.6326 24.8236 74.2751 25.2845 73.8144 25.7147C73.3612 26.1372 72.7888 26.479 72.0974 26.7402C71.4139 26.9937 70.6111 27.1205 69.689 27.1205ZM70.7723 24.0554C71.6095 24.0554 72.3356 23.8902 72.95 23.5599C73.5647 23.2219 74.0372 22.7764 74.3675 22.2233C74.7053 21.6702 74.8744 21.0671 74.8744 20.4142V18.3286C74.744 18.4361 74.5212 18.536 74.2059 18.6281C73.8989 18.7203 73.5532 18.801 73.1692 18.8701C72.7848 18.9393 72.4047 19.0007 72.0282 19.0545C71.6517 19.1082 71.3254 19.1544 71.0488 19.1928C70.4266 19.2773 69.8696 19.4155 69.378 19.6076C68.8865 19.7996 68.4986 20.0685 68.2142 20.4142C67.9301 20.7522 67.7879 21.19 67.7879 21.7278C67.7879 22.496 68.0683 23.0759 68.629 23.4677C69.19 23.8595 69.9043 24.0554 70.7723 24.0554Z" fill="currentColor"/>
          <path d="M34.7878 5.71875H38.9594V9.89013H34.7878V5.71875Z" fill="currentColor"/>
        </svg>
        <div style={{ fontSize: "11px", letterSpacing: "0.18em", color: "#8A8A8A", fontWeight: 600 }}>
          CLIENT REPORT
        </div>
      </div>

      {/* Client identity */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          marginBottom: "28px",
        }}
      >
        <img
          src={rodrigoAsset.url}
          alt="Rodrigo Baer"
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            objectFit: "cover",
            border: "1px solid #2C2C2C",
          }}
          crossOrigin="anonymous"
        />
        <div>
          <div style={{ fontSize: "16px", fontWeight: 600, letterSpacing: "-0.01em" }}>
            Rodrigo Baer
          </div>
          <div style={{ fontSize: "12px", color: "#8A8A8A", marginTop: "2px" }}>
            Co Founder · 14B Venture Capital
          </div>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right", fontSize: "10px", color: "#8A8A8A" }}>
          <div style={{ color: "#FAFAFA" }}>{rangeLabel}</div>
          <div style={{ marginTop: "2px" }}>{generatedAt}</div>
          <div style={{ marginTop: "2px" }}>{sender}</div>
        </div>
      </div>



      {/* KPIs */}
      <SectionTitle>Content performance</SectionTitle>
      <KpiGrid
        items={[
          { label: "Posts", value: posts.toString() },
          { label: "Impressions", value: impressions.toLocaleString() },
          { label: "Engagement", value: engagement.toLocaleString() },
          { label: "New followers", value: `+${followers.toLocaleString()}` },
        ]}
      />

      {/* ICP audience growth */}
      <SectionTitle>ICP audience growth</SectionTitle>
      <KpiGrid
        items={[
          { label: "New ICP in period", value: `+${newIcpInPeriod.toLocaleString()}`, accent: "#00BFFF" },
          { label: "ICP followers total", value: icpTotal.toLocaleString(), accent: "#00BFFF" },
          { label: "Total followers", value: combinedTotal.toLocaleString() },
        ]}
      />


      {/* Warm-up velocity */}
      <SectionTitle>Warm-up velocity</SectionTitle>
      <KpiGrid
        items={[
          { label: "❄️ Cold", value: warmStages.cold.toLocaleString() },
          { label: "🌡️ Warming", value: warmStages.warming.toLocaleString() },
          { label: "🔥 Hot", value: warmStages.hot.toLocaleString() },
          { label: "From cold to hot", value: `Avg ${warm.avgDays}d`, accent: "#00BFFF" },
        ]}
      />

      {/* Top posts */}
      <SectionTitle>
        Top posts by high-ICP leads · {featuredMonthLabel}
      </SectionTitle>
      <Table
        head={["#", "Post", "Sender", "Published", "High-ICP", "Engagers", "Conv."]}
        widths={["24px", "auto", "120px", "80px", "60px", "60px", "50px"]}
        alignRight={[4, 5, 6]}
      >
        {filteredPosts.map((p, i) => (
          <tr key={p.id} style={{ borderBottom: "1px solid #1F1F1F" }}>
            <td style={cellStyle}>
              <span style={{ color: "#8A8A8A", fontWeight: 600 }}>{i + 1}</span>
            </td>
            <td style={{ ...cellStyle, maxWidth: 0 }}>
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "#FAFAFA",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {p.title}
              </a>

              <div
                style={{
                  fontSize: "10px",
                  color: "#8A8A8A",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {p.excerpt}
              </div>
            </td>
            <td style={cellStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    background: "#1A1A1A",
                    fontSize: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FAFAFA",
                    flexShrink: 0,
                  }}
                >
                  {initials(p.author)}
                </div>
                <span style={{ fontSize: "10px" }}>{p.author}</span>
              </div>
            </td>
            <td style={{ ...cellStyle, fontSize: "10px", color: "#8A8A8A" }}>
              {new Date(p.publishedAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
              })}
            </td>
            <td style={{ ...cellStyle, textAlign: "right", color: "#00BFFF", fontWeight: 600 }}>
              {p.highIcpEngaged}
            </td>
            <td style={{ ...cellStyle, textAlign: "right", fontWeight: 600 }}>{p.totalEngaged}</td>
            <td style={{ ...cellStyle, textAlign: "right", fontWeight: 600 }}>
              {Math.round(p.highIcpPct * 100)}%
            </td>
          </tr>
        ))}
      </Table>

      {/* Top engagers */}
      <SectionTitle>Top 10 engagers by ICP fit</SectionTitle>
      <Table
        head={["#", "Person", "Role", "Score", "Temp"]}
        widths={["24px", "auto", "auto", "60px", "70px"]}
        alignRight={[3, 4]}
      >
        {topEngagers.map((e, i) => (
          <tr key={e.name} style={{ borderBottom: "1px solid #1F1F1F" }}>
            <td style={cellStyle}>
              <span style={{ color: "#8A8A8A", fontWeight: 600 }}>{i + 1}</span>
            </td>
            <td style={cellStyle}>
              <div style={{ fontSize: "11px", fontWeight: 500 }}>{e.name}</div>
            </td>
            <td style={{ ...cellStyle, fontSize: "10px", color: "#8A8A8A" }}>{e.role}</td>
            <td style={{ ...cellStyle, textAlign: "right", color: "#00BFFF", fontWeight: 700 }}>
              {e.score}
            </td>
            <td style={{ ...cellStyle, textAlign: "right" }}>
              <TempBadge temp={e.temp} />
            </td>
          </tr>
        ))}
      </Table>

      <div
        style={{
          marginTop: "32px",
          paddingTop: "16px",
          borderTop: "1px solid #2C2C2C",
          fontSize: "10px",
          color: "#8A8A8A",
          textAlign: "center",
        }}
      >
        Generated on {generatedAt}
      </div>
    </div>
  );
});

const cellStyle: React.CSSProperties = {
  padding: "8px 6px",
  fontSize: "11px",
  verticalAlign: "middle",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: "10px",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "#8A8A8A",
        marginTop: "24px",
        marginBottom: "10px",
        fontWeight: 600,
      }}
    >
      {children}
    </div>
  );
}

function KpiGrid({
  items,
}: {
  items: { label: string; value: string; accent?: string }[];
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${items.length}, 1fr)`,
        gap: "10px",
      }}
    >
      {items.map((it) => (
        <div
          key={it.label}
          style={{
            background: "#111111",
            border: "1px solid #2C2C2C",
            borderRadius: "10px",
            padding: "14px",
          }}
        >
          <div
            style={{
              fontSize: "9px",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "#8A8A8A",
              fontWeight: 600,
            }}
          >
            {it.label}
          </div>
          <div
            style={{
              marginTop: "8px",
              fontSize: "22px",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: it.accent ?? "#FAFAFA",
            }}
          >
            {it.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function Table({
  head,
  widths,
  alignRight,
  children,
}: {
  head: string[];
  widths: string[];
  alignRight?: number[];
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#111111",
        border: "1px solid #2C2C2C",
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
        <colgroup>
          {widths.map((w, i) => (
            <col key={i} style={{ width: w }} />
          ))}
        </colgroup>
        <thead>
          <tr style={{ borderBottom: "1px solid #2C2C2C", background: "#0F0F0F" }}>
            {head.map((h, i) => (
              <th
                key={h}
                style={{
                  ...cellStyle,
                  fontSize: "9px",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "#8A8A8A",
                  fontWeight: 600,
                  textAlign: alignRight?.includes(i) ? "right" : "left",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function TempBadge({ temp }: { temp: "cold" | "warm" | "hot" }) {
  const map = {
    cold: { bg: "#363E53", label: "Cold" },
    warm: { bg: "#564D3D", label: "Warm" },
    hot: { bg: "#8C181C", label: "Hot" },
  } as const;
  const it = map[temp];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 8px",
        borderRadius: "6px",
        background: it.bg,
        color: "#FAFAFA",
        fontSize: "9px",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
      }}
    >
      {it.label}
    </span>
  );
}
