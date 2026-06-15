import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import type { MuseumItem } from '../types';

interface Props {
  items: MuseumItem[];
  onClose: () => void;
}

type Tab = 'sales' | 'games' | 'hardware' | 'prices';

// ── Number formatting helpers ─────────────────────────────────────────────────

function fmtUnits(n: number): string {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return String(n);
}

function fmtBytes(b: number): string {
  if (b >= 1024 * 1024 * 1024) return `${(b / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  if (b >= 1024 * 1024) return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  if (b >= 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${b} B`;
}

function fmtMhz(mhz: number): string {
  if (mhz >= 1000) return `${(mhz / 1000).toFixed(2)} GHz`;
  return `${mhz} MHz`;
}

function fmtPrice(usd: number): string {
  return `$${usd.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// ── Tab content components ─────────────────────────────────────────────────────

function SalesTab({ items }: { items: MuseumItem[] }) {
  const consolesWithData = items
    .filter((i) => i.kind === 'console' && i.metrics?.unitsSold != null)
    .sort((a, b) => b.metrics!.unitsSold! - a.metrics!.unitsSold!);

  const consoleMax = consolesWithData.length > 0 ? consolesWithData[0].metrics!.unitsSold! : 1;

  const totalConsoles = items.filter((i) => i.kind === 'console').length;
  const consolesMissing = items.filter((i) => i.kind === 'console' && i.metrics?.unitsSold == null).map((i) => i.name);

  const sources = deduplicateSources(consolesWithData);

  return (
    <>
      {consolesWithData.length > 0 && (
        <>
          <div className="data-section-label">Console hardware — lifetime units sold</div>
          <div className="data-chart">
            {consolesWithData.map((item) => {
              const sold = item.metrics!.unitsSold!;
              const label = item.metrics?.unitsSoldLabel ?? fmtUnits(sold);
              const pct = (sold / consoleMax) * 100;
              return (
                <div className="data-row" key={item.slug}>
                  <span className="data-row-label" title={`${item.name} (${item.year})`}>
                    {item.name}
                  </span>
                  <div className="data-bar-h">
                    <div className="data-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="data-row-value" title={label}>{fmtUnits(sold)}</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      <p className="data-note">
        Showing all {consolesWithData.length} of {totalConsoles} consoles with sourced lifetime sales.
        {consolesMissing.length > 0 && ` Not shown: ${consolesMissing.join(', ')} — lifetime unit sales were never officially disclosed.`}
        {' '}Figures are lifetime hardware units sold.
      </p>
      {sources.length > 0 && <SourcesFootnote sources={sources} />}
    </>
  );
}

function GamesTab({ items }: { items: MuseumItem[] }) {
  const gamesWithData = items
    .filter((i) => i.kind === 'game' && i.metrics?.unitsSold != null)
    .sort((a, b) => b.metrics!.unitsSold! - a.metrics!.unitsSold!);

  const gameMax = gamesWithData.length > 0 ? gamesWithData[0].metrics!.unitsSold! : 1;
  const sources = deduplicateSources(gamesWithData);

  return (
    <>
      {gamesWithData.length > 0 ? (
        <>
          <div className="data-section-label">Best-selling games — copies sold</div>
          <div className="data-chart">
            {gamesWithData.map((item) => {
              const sold = item.metrics!.unitsSold!;
              const label = item.metrics?.unitsSoldLabel ?? fmtUnits(sold);
              const pct = (sold / gameMax) * 100;
              return (
                <div className="data-row" key={item.slug}>
                  <span className="data-row-label" title={`${item.name} (${item.year})`}>
                    {item.name}
                  </span>
                  <div className="data-bar-h">
                    <div className="data-bar-fill cyan" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="data-row-value" title={label}>{fmtUnits(sold)}</span>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <p className="data-note">No game sales data available yet.</p>
      )}
      <p className="data-note">
        Showing {gamesWithData.length} games with sourced lifetime copies sold. Arcade coin-op
        classics (e.g. Pong, Pac-Man) and free-to-play or subscription titles (e.g. Fortnite,
        World of Warcraft) are excluded — they are not measured in copies sold.
      </p>
      {sources.length > 0 && <SourcesFootnote sources={sources} />}
    </>
  );
}

function HardwareTab({ items }: { items: MuseumItem[] }) {
  const withCpu = items
    .filter((i) => i.metrics?.cpuMhz != null)
    .sort((a, b) => a.year - b.year);

  const withRam = items
    .filter((i) => i.metrics?.ramBytes != null)
    .sort((a, b) => a.year - b.year);

  // Log10 scale for CPU (early vs late is orders of magnitude apart)
  const cpuLogMax =
    withCpu.length > 0
      ? Math.log10(Math.max(...withCpu.map((i) => i.metrics!.cpuMhz!)))
      : 1;
  const cpuLogMin =
    withCpu.length > 0
      ? Math.log10(Math.min(...withCpu.map((i) => i.metrics!.cpuMhz!)))
      : 0;
  const cpuLogRange = cpuLogMax - cpuLogMin || 1;

  const ramLogMax =
    withRam.length > 0
      ? Math.log10(Math.max(...withRam.map((i) => i.metrics!.ramBytes!)))
      : 1;
  const ramLogMin =
    withRam.length > 0
      ? Math.log10(Math.min(...withRam.map((i) => i.metrics!.ramBytes!)))
      : 0;
  const ramLogRange = ramLogMax - ramLogMin || 1;

  const totalConsoles = items.filter((i) => i.kind === 'console').length;

  const allHardware = [...withCpu, ...withRam];
  const sources = deduplicateSources(allHardware);

  return (
    <>
      {withCpu.length > 0 && (
        <>
          <div className="data-section-label">CPU Clock Speed (log scale)</div>
          <div className="data-chart">
            {withCpu.map((item) => {
              const mhz = item.metrics!.cpuMhz!;
              const pct = ((Math.log10(mhz) - cpuLogMin) / cpuLogRange) * 100;
              return (
                <div className="data-row" key={`cpu-${item.slug}`}>
                  <span className="data-row-label" title={`${item.name} (${item.year})`}>
                    {item.name} <span style={{ opacity: 0.45, fontSize: '13px' }}>{item.year}</span>
                  </span>
                  <div className="data-bar-h">
                    <div className="data-bar-fill" style={{ width: `${Math.max(pct, 2)}%` }} />
                  </div>
                  <span className="data-row-value">{fmtMhz(mhz)}</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {withRam.length > 0 && (
        <>
          <div className="data-section-label">RAM (log scale)</div>
          <div className="data-chart">
            {withRam.map((item) => {
              const bytes = item.metrics!.ramBytes!;
              const pct = ((Math.log10(bytes) - ramLogMin) / ramLogRange) * 100;
              return (
                <div className="data-row" key={`ram-${item.slug}`}>
                  <span className="data-row-label" title={`${item.name} (${item.year})`}>
                    {item.name} <span style={{ opacity: 0.45, fontSize: '13px' }}>{item.year}</span>
                  </span>
                  <div className="data-bar-h">
                    <div className="data-bar-fill cyan" style={{ width: `${Math.max(pct, 2)}%` }} />
                  </div>
                  <span className="data-row-value">{fmtBytes(bytes)}</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      <p className="data-note">
        Showing {withCpu.length} of {totalConsoles} consoles with CPU data and {withRam.length} with
        RAM data. The Magnavox Odyssey (1972) predates microprocessors — it uses discrete
        transistor-diode logic with no CPU or RAM. Log scale used so MHz-era and GHz-era hardware
        both read clearly.
      </p>
      {sources.length > 0 && <SourcesFootnote sources={sources} />}
    </>
  );
}

function PricesTab({ items }: { items: MuseumItem[] }) {
  const withPrice = items
    .filter((i) => i.metrics?.launchPriceUsd != null)
    .sort((a, b) => a.year - b.year);

  const maxPrice =
    withPrice.length > 0 ? Math.max(...withPrice.map((i) => i.metrics!.launchPriceUsd!)) : 1;

  const totalConsoles = items.filter((i) => i.kind === 'console').length;
  const pricesMissing = items
    .filter((i) => i.kind === 'console' && i.metrics?.launchPriceUsd == null)
    .map((i) => i.name);

  const sources = deduplicateSources(withPrice);

  return (
    <>
      {withPrice.length === 0 ? (
        <p className="data-note">No launch price data available yet.</p>
      ) : (
        <>
          <div className="data-chart">
            {withPrice.map((item) => {
              const price = item.metrics!.launchPriceUsd!;
              const pct = (price / maxPrice) * 100;
              return (
                <div className="data-row" key={item.slug}>
                  <span className="data-row-label" title={`${item.name} (${item.year})`}>
                    {item.name} <span style={{ opacity: 0.45, fontSize: '13px' }}>{item.year}</span>
                  </span>
                  <div className="data-bar-h">
                    <div className="data-bar-fill amber" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="data-row-value">{fmtPrice(price)}</span>
                </div>
              );
            })}
          </div>
          <p className="data-note">
            Showing {withPrice.length} of {totalConsoles} consoles with sourced launch prices (USD, not
            inflation-adjusted).
            {pricesMissing.length > 0 && ` Not shown: ${pricesMissing.join(', ')}.`}
          </p>
          {sources.length > 0 && <SourcesFootnote sources={sources} />}
        </>
      )}
    </>
  );
}

// ── Sources footnote ───────────────────────────────────────────────────────────

function deduplicateSources(items: MuseumItem[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of items) {
    const url = item.metrics?.sourceUrl;
    if (!url) continue;
    let key: string;
    try {
      key = new URL(url).hostname.replace(/^www\./, '');
    } catch {
      key = url;
    }
    if (!seen.has(key)) {
      seen.add(key);
      out.push(url);
    }
  }
  return out.slice(0, 6);
}

function SourcesFootnote({ sources }: { sources: string[] }) {
  if (sources.length === 0) return null;
  return (
    <div className="data-sources">
      Sources ↗:{' '}
      {sources.map((url, i) => {
        let label: string;
        try {
          label = new URL(url).hostname.replace(/^www\./, '');
        } catch {
          label = url;
        }
        return (
          <span key={url}>
            <a href={url} target="_blank" rel="noreferrer">
              {label}
            </a>
            {i < sources.length - 1 ? ', ' : ''}
          </span>
        );
      })}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export function DataPanel({ items, onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<Tab>('sales');

  useEffect(() => {
    const tl = gsap.timeline();
    tl.fromTo(
      cardRef.current,
      { y: 40, opacity: 0, scale: 0.96 },
      { y: 0, opacity: 1, scale: 1, duration: 0.35, ease: 'power3.out' }
    );

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="data-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal={true}
      aria-label="Data and Stats"
    >
      <div className="data-card" ref={cardRef} onClick={(e) => e.stopPropagation()}>
        <button className="data-close" onClick={onClose} aria-label="Close data panel">
          ✕
        </button>

        <h2 className="data-title">📊 Data &amp; Stats</h2>

        <div className="data-tabs">
          {(['sales', 'games', 'hardware', 'prices'] as Tab[]).map((t) => (
            <button
              key={t}
              className={`data-tab${tab === t ? ' active' : ''}`}
              onClick={() => setTab(t)}
              aria-pressed={tab === t}
            >
              {t === 'sales' ? '▦ Sales' : t === 'games' ? '🎮 Games' : t === 'hardware' ? '⚡ Hardware' : '$ Prices'}
            </button>
          ))}
        </div>

        {tab === 'sales' && <SalesTab items={items} />}
        {tab === 'games' && <GamesTab items={items} />}
        {tab === 'hardware' && <HardwareTab items={items} />}
        {tab === 'prices' && <PricesTab items={items} />}
      </div>
    </div>
  );
}
