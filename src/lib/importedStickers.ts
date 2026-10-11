import { StickerPack } from '../types';

type ImportedSticker = {
  id: string;
  packId: string;
  name: string;
  file: string;
  animated?: boolean;
  keywords?: string[];
  tags?: string[];
};

type ImportedPack = {
  id: string;
  name: string;
  displayName?: string;
  category?: string;
  cover: string;
  count?: number;
  animated?: boolean;
  stickers: ImportedSticker[];
};

type ImportedManifest = {
  collectionId: string;
  name: string;
  description: string;
  assetBasePath?: string;
  packs: ImportedPack[];
};

const collections = [
  {
    manifestUrl: '/stickers/hustmess-bunny/manifest.json',
    assetRoot: '/stickers/hustmess-bunny',
    author: 'Pinkmess Bunny'
  },
  {
    manifestUrl: '/stickers/hustmess-people/manifest.json',
    assetRoot: '/stickers/hustmess-people',
    author: 'Pinkmess Cute People'
  },
  {
    manifestUrl: '/stickers/pinkmess-funny/manifest.json',
    assetRoot: '/stickers/pinkmess-funny',
    author: 'Pinkmess Original'
  },
  {
    manifestUrl: '/stickers/pinkmess-github/manifest.json',
    assetRoot: '/stickers/pinkmess-github',
    author: 'GitHub Open Assets'
  }
] as const;

const toKeywords = (sticker: ImportedSticker, pack: ImportedPack) => [
  ...(sticker.keywords || sticker.tags || []),
  pack.name,
  pack.category || 'cute'
].filter(Boolean);

export async function loadImportedStickerPacks(): Promise<StickerPack[]> {
  const loaded = await Promise.allSettled(
    collections.map(async (collection) => {
      const response = await fetch(collection.manifestUrl);
      if (!response.ok) throw new Error(`Không thể tải ${collection.manifestUrl}`);
      const manifest = (await response.json()) as ImportedManifest;

      return { collection, manifest };
    })
  );

  return loaded.flatMap((result) => {
    if (result.status !== 'fulfilled') {
      console.warn('Không thể tải một kho sticker ZIP:', result.reason);
      return [];
    }

    const { collection, manifest } = result.value;
    const assetRoot = (manifest.assetBasePath || collection.assetRoot).replace(/\/$/, '');

    return manifest.packs.map((pack) => {
      const packId = `${manifest.collectionId}_${pack.id}`;
      const stickers = pack.stickers.map((sticker, index) => ({
        id: `${manifest.collectionId}_${sticker.id}`,
        packId,
        name: sticker.name,
        keywords: toKeywords(sticker, pack),
        emotion: pack.category || 'cute',
        svgContent: '',
        imageUrl: `${assetRoot}/${sticker.file}`,
        isAnimated: Boolean(sticker.animated || pack.animated),
        sortOrder: index + 1
      }));

      return {
        id: packId,
        name: pack.displayName || pack.name,
        slug: `${manifest.collectionId}-${pack.id}`,
        description: `${manifest.description} · ${pack.name}`,
        coverSvg: '',
        coverImage: `${assetRoot}/${pack.cover}`,
        category: pack.category || 'Bộ sưu tập',
        author: collection.author,
        stickersCount: stickers.length,
        isOfficial: true,
        isAnimated: Boolean(pack.animated),
        collectionId: manifest.collectionId,
        collectionName: manifest.name,
        createdAt: new Date().toISOString(),
        stickers
      };
    });
  });
}
