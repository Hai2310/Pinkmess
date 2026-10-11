"use client";

import React, { useEffect, useState } from "react";

type Sticker = { id: string; name: string; file: string };
type StickerPack = { id: string; name: string; cover: string; stickers: Sticker[] };
type Manifest = { packs: StickerPack[]; totalStickers: number };

const ASSET_ROOT = "/stickers/hustmess-bunny/";

export default function NextJsStickerPicker({
  onSend,
}: {
  onSend: (stickerId: string) => void;
}) {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${ASSET_ROOT}manifest.json`, { signal: controller.signal })
      .then((r) => { if (!r.ok) throw new Error("Sticker manifest unavailable"); return r.json(); })
      .then((data: Manifest) => { setManifest(data); setSelectedPack(data.packs[0]?.id ?? null); })
      .catch((err) => { if (err.name !== "AbortError") setError(String(err)); });
    return () => controller.abort();
  }, []);

  if (error) return <p role="alert">Không tải được sticker: {error}</p>;
  if (!manifest) return <p>Đang tải sticker...</p>;
  const current = manifest.packs.find(p => p.id === selectedPack) ?? manifest.packs[0];
  const matches = current?.stickers.filter(s => `${s.name} ${s.id}`.toLowerCase().includes(query.toLowerCase())) ?? [];
  return (
    <section aria-label="Bunny Sticker World" style={{ padding: 16, maxWidth: 470, border: "1px solid #F7DDE8", borderRadius: 20 }}>
      <h2 style={{ color: "#C52B6F" }}>🐰 Bunny Sticker World</h2>
      <nav aria-label="Sticker packs" style={{ display: "flex", gap: 8, overflowX: "auto" }}>
        {manifest.packs.map(pack => (
          <button key={pack.id} onClick={() => { setSelectedPack(pack.id); setQuery(""); }}
            aria-pressed={pack.id === current.id} title={pack.name}
            style={{ background: pack.id === current.id ? "#FFE4F0" : "white", border: "1px solid #F7DDE8", borderRadius: 12, padding: 5, cursor: "pointer" }}>
            <img src={ASSET_ROOT + pack.cover} width={52} height={52} alt={pack.name} />
          </button>
        ))}
      </nav>
      <p>{current.name} ({current.stickers.length})</p>
      <input aria-label="Tìm sticker" placeholder="Tìm sticker..." value={query} onChange={e => setQuery(e.target.value)} style={{ padding: 10, width: "100%", borderRadius: 12, border: "1px solid #F7DDE8" }}/>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 8, maxHeight: 330, overflowY: "auto", marginTop: 12 }}>
        {matches.map(sticker => <button key={sticker.id} onClick={() => onSend(sticker.id)} title={sticker.name}
          style={{ background: "#FFF0F6", border: 0, borderRadius: 12, padding: 4, cursor: "pointer" }}>
          <img src={ASSET_ROOT + sticker.file} alt={sticker.name} width="100%" height="auto" loading="lazy" />
        </button>)}
      </div>
      {matches.length===0 && <p>Không tìm thấy sticker phù hợp.</p>}
    </section>
  );
}
