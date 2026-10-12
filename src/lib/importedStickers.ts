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
  collectionId?: string;
  id?: string;
  name?: string;
  collectionName?: string;
  description?: string;
  assetBasePath?: string;
  baseUrl?: string;
  packs: ImportedPack[];
};

const collections = [
  {
    collectionId: 'hustmess-bunny',
    manifestUrl: '/stickers/hustmess-bunny/manifest.json',
    assetRoot: '/stickers/hustmess-bunny',
    author: 'Pinkmess Bunny'
  },
  {
    collectionId: 'hustmess-people',
    manifestUrl: '/stickers/hustmess-people/manifest.json',
    assetRoot: '/stickers/hustmess-people',
    author: 'Pinkmess Cute People'
  },
  {
    collectionId: 'pinkmess-funny',
    manifestUrl: '/stickers/pinkmess-funny/manifest.json',
    assetRoot: '/stickers/pinkmess-funny',
    author: 'Pinkmess Original'
  },
  {
    collectionId: 'pinkmess-github',
    manifestUrl: '/stickers/pinkmess-github/manifest.json',
    assetRoot: '/stickers/pinkmess-github',
    author: 'GitHub Open Assets'
  },
  {
    collectionId: 'hazen-source',
    manifestUrl: '/stickers/hazen-source/manifest.json',
    assetRoot: '/stickers/hazen-source',
    author: 'Pinkmess Hazen'
  },
  {
    collectionId: 'pinkmess-meme-30',
    manifestUrl: '/stickers/pinkmess-meme-30/manifest.json',
    assetRoot: '/stickers/pinkmess-meme-30',
    author: 'Pinkmess Meme Originals'
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
    const collectionId = manifest.collectionId || collection.collectionId;
    const collectionName = manifest.name || manifest.collectionName || collectionId;
    const assetRoot = (manifest.assetBasePath || manifest.baseUrl || collection.assetRoot).replace(/\/$/, '');

    return manifest.packs.map((pack) => {
      const packId = `${collectionId}_${pack.id}`;
      const stickers = pack.stickers.map((sticker, index) => ({
        id: `${collectionId}_${sticker.id}`,
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
        slug: `${collectionId}-${pack.id}`,
        description: `${manifest.description || collectionName} · ${pack.name}`,
        coverSvg: '',
        coverImage: `${assetRoot}/${pack.cover}`,
        category: pack.category || 'Bộ sưu tập',
        author: collection.author,
        stickersCount: stickers.length,
        isOfficial: true,
        isAnimated: Boolean(pack.animated),
        collectionId,
        collectionName,
        createdAt: new Date().toISOString(),
        stickers
      };
    });
  });
}
