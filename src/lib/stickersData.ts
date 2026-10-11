import { Sticker, StickerPack } from '../types';

// Specialized SVG generator for Uploaded Image 1: Ribbon Bunny
export function createRibbonBunnySvg(options: {
  expression?: string;
  pose?: string;
  caption?: string;
  accessory?: string;
}): string {
  const { caption = '', accessory = '' } = options;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 260" width="100%" height="100%">
    <!-- Outer Glow -->
    <ellipse cx="120" cy="140" rx="95" ry="90" fill="#FFF0F6" opacity="0.6"/>

    <!-- Floppy Left Ear -->
    <path d="M75,90 C30,120 10,180 18,225 C25,245 48,245 55,220 C65,185 85,130 90,95 Z" fill="#FFFFFF" stroke="#F5A3BE" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M68,110 C35,140 25,185 30,220 C34,232 44,230 48,215 C56,185 75,140 80,110 Z" fill="#FFAEC9" opacity="0.85"/>

    <!-- Floppy Right Ear -->
    <path d="M165,90 C210,120 230,180 222,225 C215,245 192,245 185,220 C175,185 155,130 150,95 Z" fill="#FFFFFF" stroke="#F5A3BE" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M172,110 C205,140 215,185 210,220 C206,232 196,230 192,215 C184,185 165,140 160,110 Z" fill="#FFAEC9" opacity="0.85"/>

    <!-- Chubby Body & Sitting Back Paws -->
    <ellipse cx="120" cy="180" rx="65" ry="55" fill="#FFFFFF" stroke="#F5A3BE" stroke-width="3"/>
    <!-- Left Back Paw -->
    <path d="M60,200 C45,210 48,235 68,235 C80,235 85,220 80,205 Z" fill="#FFFFFF" stroke="#F5A3BE" stroke-width="2.5"/>
    <line x1="60" y1="230" x2="60" y2="222" stroke="#F5A3BE" stroke-width="2" stroke-linecap="round"/>
    <line x1="68" y1="230" x2="68" y2="222" stroke="#F5A3BE" stroke-width="2" stroke-linecap="round"/>
    <!-- Right Back Paw -->
    <path d="M180,200 C195,210 192,235 172,235 C160,235 155,220 160,205 Z" fill="#FFFFFF" stroke="#F5A3BE" stroke-width="2.5"/>
    <line x1="180" y1="230" x2="180" y2="222" stroke="#F5A3BE" stroke-width="2" stroke-linecap="round"/>
    <line x1="172" y1="230" x2="172" y2="222" stroke="#F5A3BE" stroke-width="2" stroke-linecap="round"/>

    <!-- Front Paws Resting Cute -->
    <path d="M92,175 C88,210 95,240 112,242 C120,242 125,230 125,185 Z" fill="#FFFFFF" stroke="#F5A3BE" stroke-width="3"/>
    <line x1="104" y1="240" x2="104" y2="230" stroke="#F5A3BE" stroke-width="2" stroke-linecap="round"/>
    <line x1="112" y1="240" x2="112" y2="230" stroke="#F5A3BE" stroke-width="2" stroke-linecap="round"/>

    <path d="M148,175 C152,210 145,240 128,242 C120,242 115,230 115,185 Z" fill="#FFFFFF" stroke="#F5A3BE" stroke-width="3"/>
    <line x1="136" y1="240" x2="136" y2="230" stroke="#F5A3BE" stroke-width="2" stroke-linecap="round"/>
    <line x1="128" y1="240" x2="128" y2="230" stroke="#F5A3BE" stroke-width="2" stroke-linecap="round"/>

    <!-- Head -->
    <ellipse cx="120" cy="115" rx="66" ry="58" fill="#FFFFFF" stroke="#F5A3BE" stroke-width="3.5"/>

    <!-- Cheeks Blush -->
    <ellipse cx="78" cy="128" rx="14" ry="9" fill="#FFAEC9" opacity="0.6"/>
    <ellipse cx="162" cy="128" rx="14" ry="9" fill="#FFAEC9" opacity="0.6"/>

    <!-- Big Sparkling Eyes with Eyelashes -->
    <!-- Left Eye -->
    <ellipse cx="98" cy="112" rx="8" ry="11" fill="#4C3441"/>
    <circle cx="96" cy="108" r="4" fill="#FFFFFF"/>
    <circle cx="101" cy="117" r="2" fill="#FFFFFF"/>
    <path d="M91,104 Q95,100 102,103" stroke="#4C3441" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M89,107 L87,104" stroke="#4C3441" stroke-width="1.8" stroke-linecap="round"/>

    <!-- Right Eye -->
    <ellipse cx="142" cy="112" rx="8" ry="11" fill="#4C3441"/>
    <circle cx="140" cy="108" r="4" fill="#FFFFFF"/>
    <circle cx="145" cy="117" r="2" fill="#FFFFFF"/>
    <path d="M149,104 Q145,100 138,103" stroke="#4C3441" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <path d="M151,107 L153,104" stroke="#4C3441" stroke-width="1.8" stroke-linecap="round"/>

    <!-- Tiny Pink Nose & Sweet Smiling Mouth -->
    <path d="M120,119 C117,119 116,122 120,125 C124,122 123,119 120,119 Z" fill="#FFAEC9" stroke="#F5A3BE" stroke-width="1"/>
    <path d="M115,127 Q120,131 125,127" stroke="#4C3441" stroke-width="2" fill="none" stroke-linecap="round"/>

    <!-- Big Pink Ribbon Bow On Top of Head -->
    <!-- Left Loop -->
    <path d="M115,50 C80,25 65,55 75,75 C85,88 110,75 115,65 Z" fill="#FFAEC9" stroke="#E67A9D" stroke-width="3"/>
    <path d="M82,48 C88,58 98,62 108,60" stroke="#E67A9D" stroke-width="2" fill="none" stroke-linecap="round"/>
    <!-- Right Loop -->
    <path d="M125,50 C160,25 175,55 165,75 C155,88 130,75 125,65 Z" fill="#FFAEC9" stroke="#E67A9D" stroke-width="3"/>
    <path d="M158,48 C152,58 142,62 132,60" stroke="#E67A9D" stroke-width="2" fill="none" stroke-linecap="round"/>
    <!-- Ribbon Center Knot -->
    <ellipse cx="120" cy="58" rx="14" ry="12" fill="#FFAEC9" stroke="#E67A9D" stroke-width="3"/>
    <line x1="116" y1="52" x2="116" y2="64" stroke="#E67A9D" stroke-width="1.5"/>
    <line x1="124" y1="52" x2="124" y2="64" stroke="#E67A9D" stroke-width="1.5"/>

    ${accessory === 'heart' ? `
      <path d="M120,170 C110,150 75,155 75,175 C75,195 120,215 120,215 C120,215 165,195 165,175 C165,155 130,150 120,170 Z" fill="#FF4F8B" stroke="#FFFFFF" stroke-width="2"/>
    ` : ''}

    ${caption ? `
      <rect x="35" y="235" width="170" height="22" rx="11" fill="#FFE4F0" stroke="#FF6F9F" stroke-width="1.5"/>
      <text x="120" y="250" font-family="'Be Vietnam Pro', sans-serif" font-weight="bold" font-size="11" text-anchor="middle" fill="#4C3441">${caption}</text>
    ` : ''}
  </svg>`;
}

// Specialized SVG generator for Uploaded Image 2: Kawaii Bunny Emotes
export function createEmoteBunnySvg(type: string, caption?: string): string {
  // Upright bunny ears with head and specific expressions
  let eyesSvg = '';
  let mouthSvg = '';
  let extraSvg = '';

  if (type === 'surprised') {
    // 1. Big round eyes with open tiny mouth
    eyesSvg = `
      <circle cx="78" cy="98" r="9" fill="#4C3441"/><circle cx="76" cy="95" r="3.5" fill="#FFFFFF"/>
      <circle cx="122" cy="98" r="9" fill="#4C3441"/><circle cx="120" cy="95" r="3.5" fill="#FFFFFF"/>
    `;
    mouthSvg = `<ellipse cx="100" cy="112" rx="3.5" ry="5" fill="#FF4F8B"/>`;
  } else if (type === 'angry_pout') {
    // 2. Furrowed brows, vein icon, pink heart
    eyesSvg = `
      <path d="M70,90 L85,94" stroke="#4C3441" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="78" cy="100" r="8" fill="#4C3441"/><circle cx="76" cy="97" r="3" fill="#FFFFFF"/>
      <path d="M130,90 L115,94" stroke="#4C3441" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="122" cy="100" r="8" fill="#4C3441"/><circle cx="120" cy="97" r="3" fill="#FFFFFF"/>
    `;
    mouthSvg = `<path d="M96,114 Q100,109 104,114" stroke="#4C3441" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
    extraSvg = `
      <path d="M135,78 C132,74 128,75 128,78 C128,83 135,87 135,87 C135,87 142,83 142,78 C142,75 138,74 135,78 Z" fill="#FF6F9F"/>
    `;
  } else if (type === 'cheeky_wink') {
    // 3. One eye open, one wink
    eyesSvg = `
      <circle cx="78" cy="98" r="8" fill="#4C3441"/><circle cx="76" cy="95" r="3" fill="#FFFFFF"/>
      <path d="M115,99 Q123,93 130,99" stroke="#4C3441" stroke-width="3" fill="none" stroke-linecap="round"/>
    `;
    mouthSvg = `<path d="M96,110 Q100,114 104,110" stroke="#4C3441" stroke-width="2.5" fill="none"/>`;
  } else if (type === 'laughing_heart') {
    // 4. Laughing mouth with tongue and heart
    eyesSvg = `
      <path d="M72,99 Q78,92 84,99" stroke="#4C3441" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M116,99 Q122,92 128,99" stroke="#4C3441" stroke-width="3" fill="none" stroke-linecap="round"/>
    `;
    mouthSvg = `
      <path d="M93,108 Q100,123 107,108 Z" fill="#FF4F8B" stroke="#4C3441" stroke-width="1.5"/>
      <path d="M96,114 Q100,122 104,114 Z" fill="#FFAEC9"/>
    `;
    extraSvg = `<path d="M134,80 C132,77 128,78 128,81 C128,85 134,88 134,88 C134,88 140,85 140,81 C140,78 136,77 134,80 Z" fill="#FF82AE"/>`;
  } else if (type === 'happy_smile') {
    // 5. Smiling curved eyes
    eyesSvg = `
      <path d="M70,99 Q78,91 86,99" stroke="#4C3441" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M114,99 Q122,91 130,99" stroke="#4C3441" stroke-width="3" fill="none" stroke-linecap="round"/>
    `;
    mouthSvg = `<path d="M96,110 Q100,114 104,110" stroke="#4C3441" stroke-width="2.5" fill="none"/>`;
  } else if (type === 'tongue_out') {
    // 6. Cute tongue out
    eyesSvg = `
      <path d="M70,99 Q78,91 86,99" stroke="#4C3441" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M114,99 Q122,91 130,99" stroke="#4C3441" stroke-width="3" fill="none" stroke-linecap="round"/>
    `;
    mouthSvg = `
      <path d="M96,108 Q100,111 104,108" stroke="#4C3441" stroke-width="2" fill="none"/>
      <ellipse cx="100" cy="114" rx="4" ry="5" fill="#FF4F8B"/>
    `;
  } else if (type === 'shy_embarrassed') {
    // 7. Blushing shy
    eyesSvg = `
      <path d="M72,97 Q80,92 86,99" stroke="#4C3441" stroke-width="2.5" fill="none"/>
      <path d="M114,97 Q120,92 128,99" stroke="#4C3441" stroke-width="2.5" fill="none"/>
    `;
    mouthSvg = `<path d="M96,112 Q100,109 104,112" stroke="#4C3441" stroke-width="2" fill="none"/>`;
  } else if (type === 'sparkle_hearts') {
    // 8. Hearts sparkle eyes
    eyesSvg = `
      <ellipse cx="78" cy="98" rx="8" ry="10" fill="#4C3441"/>
      <circle cx="76" cy="94" r="3.5" fill="#FFFFFF"/><circle cx="81" cy="102" r="2" fill="#FFFFFF"/>
      <ellipse cx="122" cy="98" rx="8" ry="10" fill="#4C3441"/>
      <circle cx="120" cy="94" r="3.5" fill="#FFFFFF"/><circle cx="125" cy="102" r="2" fill="#FFFFFF"/>
    `;
    mouthSvg = `<path d="M95,110 Q100,118 105,110 Z" fill="#FF4F8B"/>`;
    extraSvg = `<path d="M60,85 C58,82 54,83 54,86 C54,90 60,93 60,93 C60,93 66,90 66,86 C66,83 62,82 60,85 Z" fill="#FF6F9F"/>`;
  } else if (type === 'squint_laugh') {
    // 9. Laughing eyes squint
    eyesSvg = `
      <path d="M68,95 L76,101 L68,107" stroke="#4C3441" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M132,95 L124,101 L132,107" stroke="#4C3441" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    `;
    mouthSvg = `<path d="M93,108 Q100,122 107,108 Z" fill="#FF4F8B"/>`;
  } else if (type === 'playful_wink') {
    // 10. Playful wink with heart
    eyesSvg = `
      <path d="M70,99 Q78,91 86,99" stroke="#4C3441" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M116,97 Q123,93 130,97" stroke="#4C3441" stroke-width="3" fill="none"/>
    `;
    mouthSvg = `
      <path d="M96,108 Q100,111 104,108" stroke="#4C3441" stroke-width="2" fill="none"/>
      <ellipse cx="100" cy="114" rx="3.5" ry="4" fill="#FF4F8B"/>
    `;
    extraSvg = `<path d="M135,82 C133,79 129,80 129,83 C129,87 135,90 135,90 C135,90 141,87 141,83 C141,80 137,79 135,82 Z" fill="#FF6F9F"/>`;
  } else if (type === 'flirty_wink') {
    // 11. Flirty wink
    eyesSvg = `
      <path d="M70,98 Q78,92 86,98" stroke="#4C3441" stroke-width="3" fill="none"/>
      <circle cx="122" cy="98" r="8" fill="#4C3441"/><circle cx="120" cy="95" r="3" fill="#FFFFFF"/>
    `;
    mouthSvg = `<path d="M96,110 Q100,114 104,110" stroke="#4C3441" stroke-width="2" fill="none"/>`;
    extraSvg = `<path d="M136,80 C134,77 130,78 130,81 C130,85 136,88 136,88 C136,88 142,85 142,81 C142,78 138,77 136,80 Z" fill="#FF82AE"/>`;
  } else {
    // 12. Sweet gentle smile
    eyesSvg = `
      <path d="M72,98 Q80,91 88,98" stroke="#4C3441" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M112,98 Q120,91 128,98" stroke="#4C3441" stroke-width="3" fill="none" stroke-linecap="round"/>
    `;
    mouthSvg = `<path d="M96,110 Q100,114 104,110" stroke="#4C3441" stroke-width="2.5" fill="none"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
    <!-- Upright Ears -->
    <path d="M68,75 C45,15 65,5 78,18 C88,32 85,60 80,75 Z" fill="#FFFFFF" stroke="#4C3441" stroke-width="2.8"/>
    <path d="M70,70 C56,25 68,15 75,22 C80,30 78,55 75,68 Z" fill="#FFAEC9"/>
    <path d="M132,75 C155,15 135,5 122,18 C112,32 115,60 120,75 Z" fill="#FFFFFF" stroke="#4C3441" stroke-width="2.8"/>
    <path d="M130,70 C144,25 132,15 125,22 C120,30 122,55 125,68 Z" fill="#FFAEC9"/>

    <!-- Head -->
    <ellipse cx="100" cy="100" rx="55" ry="46" fill="#FFFFFF" stroke="#4C3441" stroke-width="3"/>
    <!-- Body hint -->
    <path d="M82,143 C80,165 120,165 118,143 Z" fill="#FFFFFF" stroke="#4C3441" stroke-width="2.5"/>

    <!-- Cheeks Blush -->
    <ellipse cx="66" cy="104" rx="9" ry="6" fill="#FFAEC9" opacity="0.6"/>
    <ellipse cx="134" cy="104" rx="9" ry="6" fill="#FFAEC9" opacity="0.6"/>

    <!-- Nose -->
    <path d="M98,104 L100,107 L102,104 Z" fill="#FF82AE"/>

    ${eyesSvg}
    ${mouthSvg}
    ${extraSvg}

    ${caption ? `
      <rect x="25" y="170" width="150" height="22" rx="11" fill="#FFE4F0" stroke="#FF6F9F" stroke-width="1.5"/>
      <text x="100" y="185" font-family="'Be Vietnam Pro', sans-serif" font-weight="bold" font-size="10" text-anchor="middle" fill="#4C3441">${caption}</text>
    ` : ''}
  </svg>`;
}

// Specialized SVG generator for Uploaded Image 3: Outline Mochi Bunny
export function createOutlineMochiSvg(type: string, caption?: string): string {
  let innerSvg = '';

  if (type === 'sleeping') {
    // Sleeping with snot bubble and z Z z
    innerSvg = `
      <path d="M72,98 Q80,102 86,98" stroke="#7A5242" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M114,98 Q120,102 128,98" stroke="#7A5242" stroke-width="3" fill="none" stroke-linecap="round"/>
      <ellipse cx="100" cy="108" rx="8" ry="4" fill="#FFAEC9"/>
      <!-- Snot Bubble -->
      <circle cx="126" cy="105" r="12" fill="#7CD0FF" opacity="0.8" stroke="#4EA5D9" stroke-width="1.5"/>
      <circle cx="123" cy="101" r="3" fill="#FFFFFF"/>
      <!-- z Z z -->
      <text x="155" y="75" font-family="sans-serif" font-weight="bold" font-size="14" fill="#7A5242">Z</text>
      <text x="148" y="88" font-family="sans-serif" font-weight="bold" font-size="11" fill="#7A5242">z</text>
      <text x="142" y="98" font-family="sans-serif" font-weight="bold" font-size="9" fill="#7A5242">z</text>
    `;
  } else if (type === 'laughing_sparkle') {
    // Laughing wide open mouth with sparkles
    innerSvg = `
      <circle cx="76" cy="96" r="6" fill="#7A5242"/>
      <circle cx="124" cy="96" r="6" fill="#7A5242"/>
      <path d="M88,104 Q100,126 112,104 Z" fill="#FFAEC9" stroke="#7A5242" stroke-width="2.5"/>
      <!-- Sparkles -->
      <polygon points="50,70 52,75 57,77 52,79 50,84 48,79 43,77 48,75" fill="#FF82AE"/>
      <polygon points="150,70 152,75 157,77 152,79 150,84 148,79 143,77 148,75" fill="#FF82AE"/>
    `;
  } else if (type === 'xd_grin') {
    // XD grin
    innerSvg = `
      <path d="M68,90 L76,96 L68,102" stroke="#7A5242" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M132,90 L124,96 L132,102" stroke="#7A5242" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M86,104 Q100,128 114,104 Z" fill="#FFAEC9" stroke="#7A5242" stroke-width="2.5"/>
    `;
  } else if (type === 'cat_smile') {
    // Cat smile :3
    innerSvg = `
      <circle cx="76" cy="96" r="6" fill="#7A5242"/>
      <circle cx="124" cy="96" r="6" fill="#7A5242"/>
      <path d="M92,107 Q96,113 100,107 Q104,113 108,107" stroke="#7A5242" stroke-width="2.5" fill="none"/>
    `;
  } else if (type === 'dizzy_stars') {
    // Swirl eyes with rotating stars
    innerSvg = `
      <!-- Left Swirl -->
      <circle cx="76" cy="96" r="7" stroke="#7A5242" stroke-width="2" fill="none"/>
      <circle cx="76" cy="96" r="3" stroke="#7A5242" stroke-width="2" fill="none"/>
      <!-- Right Swirl -->
      <circle cx="124" cy="96" r="7" stroke="#7A5242" stroke-width="2" fill="none"/>
      <circle cx="124" cy="96" r="3" stroke="#7A5242" stroke-width="2" fill="none"/>
      <ellipse cx="100" cy="112" rx="6" ry="4" fill="#FFAEC9" stroke="#7A5242" stroke-width="2"/>
      <!-- Stars around -->
      <polygon points="150,90 152,94 156,95 153,98 154,102 150,100 146,102 147,98 144,95 148,94" fill="#FFC837"/>
      <polygon points="160,110 161,113 164,114 162,116 163,119 160,117 157,119 158,116 156,114 159,113" fill="#FFC837"/>
    `;
  } else if (type === 'crying_tears') {
    // Crying with tears
    innerSvg = `
      <path d="M70,95 Q78,101 86,95" stroke="#7A5242" stroke-width="3" fill="none"/>
      <path d="M114,95 Q122,101 130,95" stroke="#7A5242" stroke-width="3" fill="none"/>
      <path d="M95,108 Q100,103 105,108" stroke="#7A5242" stroke-width="2.5" fill="none"/>
      <!-- Tears streaming -->
      <ellipse cx="72" cy="106" rx="4" ry="6" fill="#7CD0FF"/>
      <ellipse cx="70" cy="118" rx="3.5" ry="5" fill="#7CD0FF"/>
      <ellipse cx="128" cy="106" rx="4" ry="6" fill="#7CD0FF"/>
      <ellipse cx="130" cy="118" rx="3.5" ry="5" fill="#7CD0FF"/>
    `;
  } else if (type === 'heart_eyes') {
    // Heart eyes with open mouth
    innerSvg = `
      <path d="M76,92 C72,86 64,88 64,94 C64,102 76,108 76,108 C76,108 88,102 88,94 C88,88 80,86 76,92 Z" fill="#FF4F8B"/>
      <path d="M124,92 C120,86 112,88 112,94 C112,102 124,108 124,108 C124,108 136,102 136,94 C136,88 128,86 124,92 Z" fill="#FF4F8B"/>
      <path d="M90,107 Q100,122 110,107 Z" fill="#FFAEC9" stroke="#7A5242" stroke-width="2"/>
    `;
  } else if (type === 'kissy_wink') {
    // Kissy wink
    innerSvg = `
      <circle cx="76" cy="96" r="6" fill="#7A5242"/>
      <path d="M116,97 Q123,93 130,97" stroke="#7A5242" stroke-width="3" fill="none"/>
      <ellipse cx="100" cy="110" rx="3.5" ry="5" fill="#FF4F8B"/>
      <line x1="68" y1="104" x2="62" y2="104" stroke="#FFAEC9" stroke-width="2"/>
      <line x1="138" y1="104" x2="132" y2="104" stroke="#FFAEC9" stroke-width="2"/>
    `;
  } else if (type === 'playful_tongue') {
    // Winking with tongue
    innerSvg = `
      <path d="M68,97 Q76,92 84,97" stroke="#7A5242" stroke-width="3" fill="none"/>
      <circle cx="124" cy="96" r="6" fill="#7A5242"/>
      <path d="M96,106 Q100,109 104,106" stroke="#7A5242" stroke-width="2" fill="none"/>
      <ellipse cx="100" cy="112" rx="4" ry="5" fill="#FF4F8B"/>
    `;
  } else {
    // Sweet smile
    innerSvg = `
      <circle cx="76" cy="96" r="6" fill="#7A5242"/>
      <circle cx="124" cy="96" r="6" fill="#7A5242"/>
      <path d="M95,108 Q100,113 105,108" stroke="#7A5242" stroke-width="2.5" fill="none"/>
    `;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
    <!-- Sticker White Border Layer -->
    <path d="M62,75 C42,20 62,10 75,22 C84,32 82,55 78,75 C55,80 50,110 50,120 C50,150 75,155 100,155 C125,155 150,150 150,120 C150,110 145,80 122,75 C118,55 116,32 125,22 C138,10 158,20 138,75 Z" fill="#FFFFFF" stroke="#FFAEC9" stroke-width="6" stroke-linejoin="round"/>

    <!-- Ears -->
    <path d="M66,75 C48,25 66,16 77,26 C85,35 83,55 80,75 Z" fill="#FFFFFF" stroke="#7A5242" stroke-width="3"/>
    <path d="M69,70 C56,32 67,23 74,30 C79,37 78,54 76,68 Z" fill="#FFAEC9"/>
    <path d="M134,75 C152,25 134,16 123,26 C115,35 117,55 120,75 Z" fill="#FFFFFF" stroke="#7A5242" stroke-width="3"/>
    <path d="M131,70 C144,32 133,23 126,30 C121,37 122,54 124,68 Z" fill="#FFAEC9"/>

    <!-- Head Body Outline -->
    <ellipse cx="100" cy="115" rx="46" ry="40" fill="#FFFFFF" stroke="#7A5242" stroke-width="3"/>

    <!-- Cheeks Blush Lines -->
    <line x1="62" y1="110" x2="68" y2="110" stroke="#FFAEC9" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="62" y1="114" x2="68" y2="114" stroke="#FFAEC9" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="132" y1="110" x2="138" y2="110" stroke="#FFAEC9" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="132" y1="114" x2="138" y2="114" stroke="#FFAEC9" stroke-width="2.5" stroke-linecap="round"/>

    ${innerSvg}

    ${caption ? `
      <rect x="25" y="170" width="150" height="22" rx="11" fill="#FFE4F0" stroke="#FF6F9F" stroke-width="1.5"/>
      <text x="100" y="185" font-family="'Be Vietnam Pro', sans-serif" font-weight="bold" font-size="10" text-anchor="middle" fill="#4C3441">${caption}</text>
    ` : ''}
  </svg>`;
}

// Helper to construct cute Bunny / Mascot SVG stickers
function createBunnySvg(options: {
  expression: string;
  accessory?: string;
  blush?: boolean;
  mouthType?: 'smile' | 'open' | 'kiss' | 'o' | 'pout' | 'crying' | 'happy_teeth';
  eyesType?: 'sparkle' | 'heart' | 'closed_happy' | 'crying' | 'wink' | 'sleepy' | 'round';
  earsPose?: 'normal' | 'droop' | 'excited' | 'one_folded';
  caption?: string;
  bodyColor?: string;
  isCat?: boolean;
  isBear?: boolean;
  animatedEffect?: string;
}): string {
  const {
    accessory = 'heart',
    mouthType = 'smile',
    eyesType = 'sparkle',
    caption,
    bodyColor = '#FFFFFF',
    isCat = false,
    isBear = false,
    animatedEffect
  } = options;

  let animCss = '';
  if (animatedEffect === 'bounce') {
    animCss = `<style>
      @keyframes floatBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px) scale(1.05); } }
      .bunny-anim { animation: floatBounce 1.5s ease-in-out infinite; transform-origin: center; }
    </style>`;
  } else if (animatedEffect === 'wave') {
    animCss = `<style>
      @keyframes pawWave { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(20deg); } }
      .bunny-paw { animation: pawWave 1s ease-in-out infinite; transform-origin: 140px 140px; }
    </style>`;
  } else if (animatedEffect === 'pulse') {
    animCss = `<style>
      @keyframes heartPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
      .heart-anim { animation: heartPulse 1.2s ease-in-out infinite; transform-origin: 100px 140px; }
    </style>`;
  } else if (animatedEffect === 'rotate') {
    animCss = `<style>
      @keyframes starRotate { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      .star-anim { animation: starRotate 4s linear infinite; transform-origin: 100px 100px; }
    </style>`;
  }

  // Head and Ears
  let ears = '';
  if (isCat) {
    ears = `
      <polygon points="55,60 75,25 90,65" fill="#FFE4F0" stroke="#FF6F9F" stroke-width="3" stroke-linejoin="round" />
      <polygon points="62,58 75,34 85,62" fill="#FF82AE" />
      <polygon points="145,60 125,25 110,65" fill="#FFE4F0" stroke="#FF6F9F" stroke-width="3" stroke-linejoin="round" />
      <polygon points="138,58 125,34 115,62" fill="#FF82AE" />
    `;
  } else if (isBear) {
    ears = `
      <circle cx="65" cy="50" r="22" fill="#EBD2B9" stroke="#927D8A" stroke-width="3"/>
      <circle cx="65" cy="50" r="12" fill="#FF82AE" />
      <circle cx="135" cy="50" r="22" fill="#EBD2B9" stroke="#927D8A" stroke-width="3"/>
      <circle cx="135" cy="50" r="12" fill="#FF82AE" />
    `;
  } else {
    // Bunny Ears
    ears = `
      <!-- Left Ear -->
      <path d="M70,80 C50,20 65,10 78,25 C88,40 85,75 80,85 Z" fill="${bodyColor}" stroke="#FF82AE" stroke-width="3.5" />
      <path d="M72,75 C60,30 68,22 75,30 C80,40 78,70 75,76 Z" fill="#FFD6E5" />
      <!-- Right Ear -->
      <path d="M130,80 C150,20 135,10 122,25 C112,40 115,75 120,85 Z" fill="${bodyColor}" stroke="#FF82AE" stroke-width="3.5" />
      <path d="M128,75 C140,30 132,22 125,30 C120,40 122,70 125,76 Z" fill="#FFD6E5" />
    `;
  }

  // Eyes
  let eyes = '';
  if (eyesType === 'heart') {
    eyes = `
      <path d="M70,95 C66,90 60,92 60,96 C60,102 70,106 70,106 C70,106 80,102 80,96 C80,92 74,90 70,95 Z" fill="#FF4F8B" />
      <path d="M130,95 C126,90 120,92 120,96 C120,102 130,106 130,106 C130,106 140,102 140,96 C140,92 134,90 130,95 Z" fill="#FF4F8B" />
    `;
  } else if (eyesType === 'closed_happy') {
    eyes = `
      <path d="M60,98 Q70,90 80,98" stroke="#4C3441" stroke-width="3.5" fill="none" stroke-linecap="round" />
      <path d="M120,98 Q130,90 140,98" stroke="#4C3441" stroke-width="3.5" fill="none" stroke-linecap="round" />
    `;
  } else if (eyesType === 'wink') {
    eyes = `
      <circle cx="70" cy="95" r="7" fill="#4C3441" />
      <circle cx="72" cy="93" r="2.5" fill="#FFFFFF" />
      <path d="M120,98 Q130,90 140,98" stroke="#4C3441" stroke-width="3.5" fill="none" stroke-linecap="round" />
    `;
  } else if (eyesType === 'crying') {
    eyes = `
      <path d="M60,95 Q70,105 80,95" stroke="#4C3441" stroke-width="3.5" fill="none" stroke-linecap="round" />
      <path d="M120,95 Q130,105 140,95" stroke="#4C3441" stroke-width="3.5" fill="none" stroke-linecap="round" />
      <!-- Tears -->
      <path d="M62,105 C62,118 70,122 70,112 C70,105 65,102 62,105 Z" fill="#7CD0FF" />
      <path d="M138,105 C138,118 130,122 130,112 C130,105 135,102 138,105 Z" fill="#7CD0FF" />
    `;
  } else if (eyesType === 'sleepy') {
    eyes = `
      <path d="M62,97 Q72,100 78,97" stroke="#4C3441" stroke-width="3.5" fill="none" stroke-linecap="round" />
      <path d="M122,97 Q128,100 138,97" stroke="#4C3441" stroke-width="3.5" fill="none" stroke-linecap="round" />
    `;
  } else {
    // Sparkle big kawaii eyes
    eyes = `
      <circle cx="70" cy="95" r="8" fill="#4C3441" />
      <circle cx="68" cy="92" r="3" fill="#FFFFFF" />
      <circle cx="73" cy="98" r="1.5" fill="#FFFFFF" />
      <circle cx="130" cy="95" r="8" fill="#4C3441" />
      <circle cx="128" cy="92" r="3" fill="#FFFFFF" />
      <circle cx="133" cy="98" r="1.5" fill="#FFFFFF" />
    `;
  }

  // Mouth
  let mouth = '';
  if (mouthType === 'kiss') {
    mouth = `
      <path d="M96,112 C98,110 102,110 104,112 C102,114 98,114 96,112 Z" fill="#FF4F8B" />
      <path d="M106,108 C108,105 112,107 110,111 Z" fill="#FF6F9F" />
    `;
  } else if (mouthType === 'open') {
    mouth = `
      <path d="M94,110 Q100,122 106,110 Z" fill="#FF4F8B" stroke="#4C3441" stroke-width="1.5" />
    `;
  } else if (mouthType === 'o') {
    mouth = `
      <ellipse cx="100" cy="112" rx="4" ry="6" fill="#FF4F8B" stroke="#4C3441" stroke-width="1.5" />
    `;
  } else if (mouthType === 'pout') {
    mouth = `
      <path d="M95,115 Q100,108 105,115" stroke="#4C3441" stroke-width="2.5" fill="none" stroke-linecap="round" />
    `;
  } else if (mouthType === 'crying') {
    mouth = `
      <path d="M94,116 Q100,108 106,116" stroke="#4C3441" stroke-width="2.5" fill="none" stroke-linecap="round" />
    `;
  } else {
    // gentle smile
    mouth = `
      <path d="M96,106 Q100,109 104,106" stroke="#4C3441" stroke-width="2.5" fill="none" stroke-linecap="round" />
    `;
  }

  // Accessory / Props
  let accSvg = '';
  if (accessory === 'heart') {
    accSvg = `
      <g class="heart-anim">
        <path d="M100,145 C95,130 75,132 75,145 C75,158 100,172 100,172 C100,172 125,158 125,145 C125,132 105,130 100,145 Z" fill="#FF4F8B" />
      </g>
    `;
  } else if (accessory === 'rose') {
    accSvg = `
      <g transform="translate(105, 125)">
        <path d="M0,0 Q10,15 15,25" stroke="#77C880" stroke-width="3" fill="none" />
        <circle cx="1" cy="0" r="10" fill="#FF4F8B" />
        <circle cx="0" cy="0" r="6" fill="#FF82AE" />
      </g>
    `;
  } else if (accessory === 'coffee') {
    accSvg = `
      <g transform="translate(85, 130)">
        <rect x="0" y="5" width="28" height="25" rx="5" fill="#FFE4F0" stroke="#FF6F9F" stroke-width="2"/>
        <path d="M28,10 Q36,15 28,22" fill="none" stroke="#FF6F9F" stroke-width="2" />
        <path d="M8,0 Q10,-5 12,0" stroke="#927D8A" stroke-width="1.5" fill="none" />
        <path d="M16,0 Q18,-5 20,0" stroke="#927D8A" stroke-width="1.5" fill="none" />
        <text x="14" y="22" font-size="9" text-anchor="middle" fill="#FF4F8B">☕</text>
      </g>
    `;
  } else if (accessory === 'laptop') {
    accSvg = `
      <g transform="translate(65, 135)">
        <rect x="10" y="0" width="50" height="26" rx="3" fill="#4C3441" />
        <rect x="12" y="2" width="46" height="22" rx="2" fill="#FF82AE" />
        <text x="35" y="16" font-size="12" text-anchor="middle" fill="#FFFFFF">💻</text>
        <path d="M0,26 L70,26 L65,30 L5,30 Z" fill="#927D8A" />
      </g>
    `;
  } else if (accessory === 'pillow') {
    accSvg = `
      <g transform="translate(50, 130)">
        <rect x="15" y="0" width="70" height="35" rx="15" fill="#FFE4F0" stroke="#FF82AE" stroke-width="2" />
        <circle cx="50" cy="17" r="4" fill="#FFD6E5" />
      </g>
    `;
  } else if (accessory === 'cake') {
    accSvg = `
      <g transform="translate(75, 130)">
        <rect x="5" y="10" width="40" height="25" rx="4" fill="#FFE4F0" stroke="#FF82AE" stroke-width="2" />
        <path d="M5,15 Q25,20 45,15" fill="#FF4F8B" />
        <line x1="25" y1="2" x2="25" y2="10" stroke="#FFB800" stroke-width="2.5" />
        <circle cx="25" cy="0" r="3" fill="#FF4F8B" />
      </g>
    `;
  } else if (accessory === 'sparkles') {
    accSvg = `
      <g class="star-anim">
        <polygon points="100,20 103,28 111,30 105,36 107,44 100,40 93,44 95,36 89,30 97,28" fill="#FFF0B8" />
        <polygon points="40,90 42,95 47,96 43,100 44,105 40,102 36,105 37,100 33,96 38,95" fill="#FFF0B8" />
        <polygon points="160,90 162,95 167,96 163,100 164,105 160,102 156,105 157,100 153,96 158,95" fill="#FFF0B8" />
      </g>
    `;
  } else if (accessory === 'letter') {
    accSvg = `
      <g transform="translate(75, 130)">
        <rect x="0" y="0" width="50" height="30" rx="4" fill="#FFFFFF" stroke="#FF82AE" stroke-width="2"/>
        <polygon points="0,0 25,16 50,0" fill="#FFF0F6" stroke="#FF82AE" stroke-width="1.5" />
        <circle cx="25" cy="15" r="5" fill="#FF4F8B" />
      </g>
    `;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">
    ${animCss}
    <g class="${animatedEffect ? 'bunny-anim' : ''}">
      <!-- Background glow -->
      <circle cx="100" cy="105" r="85" fill="#FFF0F6" opacity="0.6"/>
      ${ears}
      
      <!-- Body -->
      <ellipse cx="100" cy="145" rx="55" ry="42" fill="${bodyColor}" stroke="#FF82AE" stroke-width="3" />
      
      <!-- Head -->
      <circle cx="100" cy="100" r="52" fill="${bodyColor}" stroke="#FF82AE" stroke-width="3.5" />
      
      <!-- Cheeks / Blush -->
      <ellipse cx="60" cy="106" rx="10" ry="6" fill="#FF82AE" opacity="0.5" />
      <ellipse cx="140" cy="106" rx="10" ry="6" fill="#FF82AE" opacity="0.5" />
      
      <!-- Nose -->
      <polygon points="100,102 96,106 104,106" fill="#FF6F9F" />
      
      <!-- Eyes -->
      ${eyes}
      
      <!-- Mouth -->
      ${mouth}

      <!-- Paws -->
      <g class="bunny-paw">
        <circle cx="68" cy="140" r="12" fill="${bodyColor}" stroke="#FF82AE" stroke-width="2.5" />
        <circle cx="132" cy="140" r="12" fill="${bodyColor}" stroke="#FF82AE" stroke-width="2.5" />
      </g>

      <!-- Accessory -->
      ${accSvg}

      <!-- Optional Vietnamese / Kawaii text banner -->
      ${caption ? `
        <rect x="25" y="172" width="150" height="24" rx="12" fill="#FFE4F0" stroke="#FF6F9F" stroke-width="1.5"/>
        <text x="100" y="188" font-family="'Be Vietnam Pro', sans-serif" font-weight="bold" font-size="11" text-anchor="middle" fill="#4C3441">${caption}</text>
      ` : ''}
    </g>
  </svg>`;
}

// Generate the complete catalog of 14 packs (12 static packs of 12 stickers + 2 animated packs of 8 stickers = 160 total stickers)
export function getStickerCatalog(): StickerPack[] {
  const packs: StickerPack[] = [];

  // PACK 01 — Bunny Love
  const p1Stickers: { name: string; caption: string; emotion: string; eyes: any; mouth: any; acc?: string }[] = [
    { name: 'Heart Eyes', caption: 'Mê chữ ê kéo dài 💕', emotion: 'love', eyes: 'heart', mouth: 'open', acc: 'heart' },
    { name: 'Sending Kisses', caption: 'Chụt chụt nè 💋', emotion: 'kiss', eyes: 'wink', mouth: 'kiss', acc: 'heart' },
    { name: 'Hugging a Heart', caption: 'Ôm tim gửi cậu 💖', emotion: 'hug', eyes: 'closed_happy', mouth: 'smile', acc: 'heart' },
    { name: 'I Love You', caption: 'Thương cậu nhất! 💗', emotion: 'love', eyes: 'sparkle', mouth: 'open', acc: 'heart' },
    { name: 'Blushing', caption: 'Ngại quá đi à 🙈', emotion: 'shy', eyes: 'closed_happy', mouth: 'smile', acc: 'sparkles' },
    { name: 'Flying Kiss', caption: 'Bắn tim nè pằng pằng 💘', emotion: 'kiss', eyes: 'wink', mouth: 'kiss', acc: 'heart' },
    { name: 'Bunny With Roses', caption: 'Tặng hoa cho nè 🌹', emotion: 'romantic', eyes: 'sparkle', mouth: 'smile', acc: 'rose' },
    { name: 'Holding Love Letter', caption: 'Thư tình gửi cậu 💌', emotion: 'love', eyes: 'closed_happy', mouth: 'smile', acc: 'letter' },
    { name: 'Shy Bunny', caption: 'Xí hổ quá... 😳', emotion: 'shy', eyes: 'round', mouth: 'pout', acc: 'heart' },
    { name: 'Heart Explosion', caption: 'Tràn ngập yêu thương 🎆', emotion: 'love', eyes: 'heart', mouth: 'open', acc: 'sparkles' },
    { name: 'Cuddling', caption: 'Muốn ôm một cái 🤗', emotion: 'cuddle', eyes: 'closed_happy', mouth: 'smile', acc: 'heart' },
    { name: 'Miss You', caption: 'Nhớ cậu lắm ó 🥺', emotion: 'miss', eyes: 'crying', mouth: 'pout', acc: 'heart' },
  ];

  packs.push({
    id: 'pack_01',
    name: 'Bunny Love',
    slug: 'bunny-love',
    description: 'Thỏ hồng đáng yêu gửi gắm tình yêu ngọt ngào và những nụ hôn ấm áp 🐰💕',
    category: 'Love & Romance',
    author: 'HustMess Bunny Studio',
    coverSvg: createBunnySvg({ expression: 'love', eyesType: 'heart', mouthType: 'smile', accessory: 'heart' }),
    stickersCount: 12,
    isOfficial: true,
    isAnimated: false,
    createdAt: '2026-10-10',
    stickers: p1Stickers.map((s, idx) => ({
      id: `p1_stk_${idx + 1}`,
      packId: 'pack_01',
      name: s.name,
      keywords: ['bunny', 'love', 'thỏ', 'yêu', 'thương', s.emotion, s.caption],
      emotion: s.emotion,
      svgContent: createBunnySvg({
        expression: s.name,
        caption: s.caption,
        eyesType: s.eyes,
        mouthType: s.mouth,
        accessory: s.acc || 'heart'
      }),
      sortOrder: idx + 1
    }))
  });

  // PACK 02 — Bunny Emotions
  const p2Stickers: { name: string; caption: string; emotion: string; eyes: any; mouth: any; acc?: string }[] = [
    { name: 'Happy', caption: 'Vui vẻ cả ngày! ✨', emotion: 'happy', eyes: 'sparkle', mouth: 'open', acc: 'sparkles' },
    { name: 'Sad', caption: 'Buồn xỉu luôn 💧', emotion: 'sad', eyes: 'crying', mouth: 'crying' },
    { name: 'Angry', caption: 'Giận rồi nha! 😾', emotion: 'angry', eyes: 'round', mouth: 'pout' },
    { name: 'Confused', caption: 'Ủa là sao ta? ❓', emotion: 'confused', eyes: 'round', mouth: 'o' },
    { name: 'Surprised', caption: 'Hết hồn chim én! 😲', emotion: 'surprised', eyes: 'round', mouth: 'o', acc: 'sparkles' },
    { name: 'Excited', caption: 'Hóng quá đi nè! 🥳', emotion: 'excited', eyes: 'sparkle', mouth: 'open', acc: 'sparkles' },
    { name: 'Sleepy', caption: 'Buồn ngủ díu mắt 💤', emotion: 'sleepy', eyes: 'sleepy', mouth: 'smile', acc: 'pillow' },
    { name: 'Nervous', caption: 'Run bần bật luông 🥶', emotion: 'nervous', eyes: 'crying', mouth: 'pout' },
    { name: 'Crying', caption: 'Khóc một dòng sông 😭', emotion: 'crying', eyes: 'crying', mouth: 'crying' },
    { name: 'Laughing', caption: 'Haha cười xỉu ngang 🤣', emotion: 'laugh', eyes: 'closed_happy', mouth: 'open' },
    { name: 'Embarrassed', caption: 'Quê chữ ê ê 🫣', emotion: 'embarrassed', eyes: 'closed_happy', mouth: 'smile' },
    { name: 'Proud', caption: 'Tự hào về mình ghê 😎', emotion: 'proud', eyes: 'sparkle', mouth: 'smile', acc: 'sparkles' },
  ];

  packs.push({
    id: 'pack_02',
    name: 'Bunny Emotions',
    slug: 'bunny-emotions',
    description: 'Muôn vàn sắc thái cảm xúc hàng ngày của chú Thỏ Bunny tròn xoe!',
    category: 'Bunny Collection',
    author: 'HustMess Bunny Studio',
    coverSvg: createBunnySvg({ expression: 'happy', eyesType: 'sparkle', mouthType: 'open', accessory: 'sparkles' }),
    stickersCount: 12,
    isOfficial: true,
    isAnimated: false,
    createdAt: '2026-10-10',
    stickers: p2Stickers.map((s, idx) => ({
      id: `p2_stk_${idx + 1}`,
      packId: 'pack_02',
      name: s.name,
      keywords: ['bunny', 'emotion', 'cảm xúc', s.emotion, s.caption],
      emotion: s.emotion,
      svgContent: createBunnySvg({
        expression: s.name,
        caption: s.caption,
        eyesType: s.eyes,
        mouthType: s.mouth,
        accessory: s.acc
      }),
      sortOrder: idx + 1
    }))
  });

  // PACK 03 — Sleepy Bunny
  const p3Stickers = [
    { name: 'Good Night', caption: 'Ngủ ngon nha bấy bì 🌙', emotion: 'night', eyes: 'sleepy', mouth: 'smile', acc: 'pillow' },
    { name: 'Sleeping', caption: 'Khò khò zZz... 😴', emotion: 'sleep', eyes: 'sleepy', mouth: 'o', acc: 'pillow' },
    { name: 'Yawning', caption: 'Ngáp một cái dài 🥱', emotion: 'yawn', eyes: 'sleepy', mouth: 'open' },
    { name: 'Wrapped In Blanket', caption: 'Cuộn chăn ấm áp 🛏️', emotion: 'cozy', eyes: 'closed_happy', mouth: 'smile', acc: 'pillow' },
    { name: 'Hugging Pillow', caption: 'Ôm gối ngủ say 🧸', emotion: 'cozy', eyes: 'closed_happy', mouth: 'smile', acc: 'pillow' },
    { name: 'Dreaming', caption: 'Mơ về kẹo ngọt 🍬', emotion: 'dream', eyes: 'closed_happy', mouth: 'smile', acc: 'sparkles' },
    { name: 'Snoozing', caption: 'Cho ngủ thêm 5p ⏰', emotion: 'snooze', eyes: 'sleepy', mouth: 'pout' },
    { name: 'Waking Up', caption: 'Vươn vai thức giấc 🌅', emotion: 'morning', eyes: 'sparkle', mouth: 'open' },
    { name: 'Drinking Warm Milk', caption: 'Uống sữa nóng 🥛', emotion: 'warm', eyes: 'closed_happy', mouth: 'smile', acc: 'coffee' },
    { name: 'Wearing Pajamas', caption: 'Đồ ngủ hồng cute 🌸', emotion: 'cute', eyes: 'sparkle', mouth: 'smile' },
    { name: 'Dont Wake Me', caption: 'Đừng gọi dậy mò 🔕', emotion: 'sleep', eyes: 'sleepy', mouth: 'pout', acc: 'pillow' },
    { name: 'Good Morning', caption: 'Chào buổi sáng tinh mơ! ☀️', emotion: 'morning', eyes: 'sparkle', mouth: 'open', acc: 'sparkles' },
  ];

  packs.push({
    id: 'pack_03',
    name: 'Sleepy Bunny',
    slug: 'sleepy-bunny',
    description: 'Chú thỏ mê ngủ nướng, thích uống sữa ấm và đắp chăn bông mềm mại.',
    category: 'Good Morning / Good Night',
    author: 'HustMess Bunny Studio',
    coverSvg: createBunnySvg({ expression: 'sleepy', eyesType: 'sleepy', mouthType: 'smile', accessory: 'pillow' }),
    stickersCount: 12,
    isOfficial: true,
    isAnimated: false,
    createdAt: '2026-10-10',
    stickers: p3Stickers.map((s, idx) => ({
      id: `p3_stk_${idx + 1}`,
      packId: 'pack_03',
      name: s.name,
      keywords: ['sleep', 'ngủ', 'goodnight', 'morning', s.caption],
      emotion: s.emotion,
      svgContent: createBunnySvg({
        expression: s.name,
        caption: s.caption,
        eyesType: s.eyes as any,
        mouthType: s.mouth as any,
        accessory: s.acc
      }),
      sortOrder: idx + 1
    }))
  });

  // PACK 04 — Mochi Bunny
  const p4Stickers = [
    { name: 'Squishy Cheeks', caption: 'Má bánh bao nựng nè 🍡', emotion: 'cute', eyes: 'closed_happy', mouth: 'smile' },
    { name: 'Eating Mochi', caption: 'Ngon nhức nách 😋', emotion: 'eat', eyes: 'sparkle', mouth: 'open', acc: 'cake' },
    { name: 'Rolling Around', caption: 'Lăn lông lốc tròn vo 🌀', emotion: 'play', eyes: 'closed_happy', mouth: 'open' },
    { name: 'Bouncing', caption: 'Tưng tưng nhún nhảy 🐇', emotion: 'happy', eyes: 'sparkle', mouth: 'open', acc: 'sparkles' },
    { name: 'Pouting', caption: 'Dỗi rồi đừng có nịnh 😤', emotion: 'pout', eyes: 'round', mouth: 'pout' },
    { name: 'Hugging Food', caption: 'Bảo bối đồ ăn 🍰', emotion: 'eat', eyes: 'heart', mouth: 'open', acc: 'cake' },
    { name: 'Stretching', caption: 'Dãn cơ thể dẻo dai 🧘', emotion: 'relax', eyes: 'closed_happy', mouth: 'smile' },
    { name: 'Happy Dance', caption: 'Nhảy múa tưng bừng 💃', emotion: 'dance', eyes: 'closed_happy', mouth: 'open', acc: 'sparkles' },
    { name: 'Chewing', caption: 'Nhai nhồm nhoàm 🍓', emotion: 'eat', eyes: 'sparkle', mouth: 'open' },
    { name: 'Falling Down', caption: 'Té ngã cái bịch 💥', emotion: 'oops', eyes: 'round', mouth: 'o' },
    { name: 'Hiding', caption: 'Trốn kỹ không ai thấy 🙈', emotion: 'hide', eyes: 'closed_happy', mouth: 'smile' },
    { name: 'Big Hug', caption: 'Ôm một cái siêu to 🫂', emotion: 'hug', eyes: 'closed_happy', mouth: 'smile', acc: 'heart' },
  ];

  packs.push({
    id: 'pack_04',
    name: 'Mochi Bunny',
    slug: 'mochi-bunny',
    description: 'Thỏ Mochi mập mạp má phúng phính thích ăn vặt và lăn tròn đáng yêu!',
    category: 'Bunny Collection',
    author: 'HustMess Bunny Studio',
    coverSvg: createBunnySvg({ expression: 'mochi', eyesType: 'closed_happy', mouthType: 'smile', accessory: 'cake' }),
    stickersCount: 12,
    isOfficial: true,
    isAnimated: false,
    createdAt: '2026-10-10',
    stickers: p4Stickers.map((s, idx) => ({
      id: `p4_stk_${idx + 1}`,
      packId: 'pack_04',
      name: s.name,
      keywords: ['mochi', 'bunny', 'bánh bao', 'ăn vặt', s.caption],
      emotion: s.emotion,
      svgContent: createBunnySvg({
        expression: s.name,
        caption: s.caption,
        eyesType: s.eyes as any,
        mouthType: s.mouth as any,
        accessory: s.acc
      }),
      sortOrder: idx + 1
    }))
  });

  // PACK 05 — Bunny & Bestie
  const p5Stickers = [
    { name: 'Hugging Bestie', caption: 'Bạn thân là số 1 👭', emotion: 'friend', eyes: 'closed_happy', mouth: 'smile', acc: 'heart' },
    { name: 'High Five', caption: 'Đập tay cái nào! ✋', emotion: 'cheer', eyes: 'sparkle', mouth: 'open', acc: 'sparkles' },
    { name: 'Playing Together', caption: 'Chơi cùng nhau vui ghê 🎠', emotion: 'play', eyes: 'sparkle', mouth: 'open' },
    { name: 'Cheering', caption: 'Cố lên bạn ơiii! 📣', emotion: 'cheer', eyes: 'sparkle', mouth: 'open', acc: 'sparkles' },
    { name: 'Laughing', caption: 'Cười không nhặt được mồm 😆', emotion: 'laugh', eyes: 'closed_happy', mouth: 'open' },
    { name: 'Best Friends Forever', caption: 'Mãi là bạn tốt 💖', emotion: 'bff', eyes: 'heart', mouth: 'smile', acc: 'heart' },
    { name: 'Holding Hands', caption: 'Nắm tay đi muôn nơi 🤝', emotion: 'love', eyes: 'sparkle', mouth: 'smile' },
    { name: 'Sharing Snacks', caption: 'Chia đồ ăn ngon nè 🍩', emotion: 'share', eyes: 'sparkle', mouth: 'smile', acc: 'cake' },
    { name: 'Missing You', caption: 'Nhớ bạn quá chừng 🥺', emotion: 'miss', eyes: 'crying', mouth: 'pout' },
    { name: 'Celebrating', caption: 'Ăn mừng chiến thắng 🎉', emotion: 'party', eyes: 'sparkle', mouth: 'open', acc: 'sparkles' },
    { name: 'Studying Together', caption: 'Cùng nhau học bài 📚', emotion: 'study', eyes: 'sparkle', mouth: 'smile', acc: 'laptop' },
    { name: 'Sleepover', caption: 'Ngủ nhà bạn thân ⛺', emotion: 'sleepover', eyes: 'sleepy', mouth: 'smile', acc: 'pillow' },
  ];

  packs.push({
    id: 'pack_05',
    name: 'Bunny & Bestie',
    slug: 'bunny-bestie',
    description: 'Khoảnh khắc tình bạn gắn bó keo sơn ngọt ngào của đôi bạn thân thiết.',
    category: 'Love & Romance',
    author: 'HustMess Bunny Studio',
    coverSvg: createBunnySvg({ expression: 'bestie', eyesType: 'sparkle', mouthType: 'open', accessory: 'heart' }),
    stickersCount: 12,
    isOfficial: true,
    isAnimated: false,
    createdAt: '2026-10-10',
    stickers: p5Stickers.map((s, idx) => ({
      id: `p5_stk_${idx + 1}`,
      packId: 'pack_05',
      name: s.name,
      keywords: ['bestie', 'bạn thân', 'tình bạn', s.caption],
      emotion: s.emotion,
      svgContent: createBunnySvg({
        expression: s.name,
        caption: s.caption,
        eyesType: s.eyes as any,
        mouthType: s.mouth as any,
        accessory: s.acc
      }),
      sortOrder: idx + 1
    }))
  });

  // PACK 06 — Kawaii Kitty
  const p6Stickers = [
    { name: 'Meow', caption: 'Meo meo xin chào 🐾', emotion: 'hello', eyes: 'sparkle', mouth: 'smile', isCat: true },
    { name: 'Purring', caption: 'Gừ gừ sướng rơn 😸', emotion: 'happy', eyes: 'closed_happy', mouth: 'smile', isCat: true },
    { name: 'Sleeping Kitty', caption: 'Mèo lười say giấc 💤', emotion: 'sleep', eyes: 'sleepy', mouth: 'smile', isCat: true, acc: 'pillow' },
    { name: 'Blushing Kitty', caption: 'Ngại ngùng meo meo 😽', emotion: 'shy', eyes: 'closed_happy', mouth: 'smile', isCat: true },
    { name: 'Holding Fish', caption: 'Cá ngon số dách 🐟', emotion: 'eat', eyes: 'sparkle', mouth: 'open', isCat: true },
    { name: 'Angry Kitty', caption: 'Cào cho một phát giờ 😾', emotion: 'angry', eyes: 'round', mouth: 'pout', isCat: true },
    { name: 'Playful Paws', caption: 'Đưa tay đây nào 🐾', emotion: 'play', eyes: 'sparkle', mouth: 'smile', isCat: true },
    { name: 'Heart Eyes Cat', caption: 'Mê mẩn cậu rồi 😻', emotion: 'love', eyes: 'heart', mouth: 'open', isCat: true, acc: 'heart' },
    { name: 'Tiny Smile', caption: 'Cười mỉm chi cute 😽', emotion: 'smile', eyes: 'closed_happy', mouth: 'smile', isCat: true },
    { name: 'Happy Jump', caption: 'Nhảy phốc lên lòng 💖', emotion: 'happy', eyes: 'sparkle', mouth: 'open', isCat: true, acc: 'sparkles' },
    { name: 'Confused Kitty', caption: 'Mèo ngơ ngác 🙀', emotion: 'confused', eyes: 'round', mouth: 'o', isCat: true },
    { name: 'Cat Hug', caption: 'Ôm mèo ấm áp 🫂', emotion: 'hug', eyes: 'closed_happy', mouth: 'smile', isCat: true, acc: 'heart' },
  ];

  packs.push({
    id: 'pack_06',
    name: 'Kawaii Kitty',
    slug: 'kawaii-kitty',
    description: 'Mèo con má hồng mắt long lanh đồng hành cùng hội bạn Bunny!',
    category: 'Cats',
    author: 'HustMess Bunny Studio',
    coverSvg: createBunnySvg({ expression: 'cat', isCat: true, eyesType: 'heart', mouthType: 'smile', accessory: 'heart' }),
    stickersCount: 12,
    isOfficial: true,
    isAnimated: false,
    createdAt: '2026-10-10',
    stickers: p6Stickers.map((s, idx) => ({
      id: `p6_stk_${idx + 1}`,
      packId: 'pack_06',
      name: s.name,
      keywords: ['cat', 'kitty', 'mèo', 'meow', s.caption],
      emotion: s.emotion,
      svgContent: createBunnySvg({
        expression: s.name,
        caption: s.caption,
        eyesType: s.eyes as any,
        mouthType: s.mouth as any,
        accessory: s.acc,
        isCat: true
      }),
      sortOrder: idx + 1
    }))
  });

  // PACK 07 — Teddy Bear Hugs
  const p7Stickers = [
    { name: 'Big Bear Hug', caption: 'Gấu bự ôm cái nè 🐻', emotion: 'hug', eyes: 'closed_happy', mouth: 'smile', isBear: true, acc: 'heart' },
    { name: 'Love You Bear', caption: 'Thương lắm cơ 💕', emotion: 'love', eyes: 'heart', mouth: 'open', isBear: true, acc: 'heart' },
    { name: 'Thank You', caption: 'Cảm ơn cậu nhiều nha! 🌸', emotion: 'thanks', eyes: 'sparkle', mouth: 'smile', isBear: true },
    { name: 'Sorry', caption: 'Tớ xin lỗi mò 🥺', emotion: 'sorry', eyes: 'crying', mouth: 'pout', isBear: true },
    { name: 'Sleep Well Bear', caption: 'Chúc ngủ ngon giấc 🧸', emotion: 'night', eyes: 'sleepy', mouth: 'smile', isBear: true, acc: 'pillow' },
    { name: 'Sending Flowers', caption: 'Hoa xinh tặng cậu 🌷', emotion: 'flower', eyes: 'sparkle', mouth: 'smile', isBear: true, acc: 'rose' },
    { name: 'Happy Birthday', caption: 'Sinh nhật vui vẻ! 🎂', emotion: 'birthday', eyes: 'sparkle', mouth: 'open', isBear: true, acc: 'cake' },
    { name: 'Good Luck', caption: 'Chúc may mắn nha 🍀', emotion: 'luck', eyes: 'sparkle', mouth: 'smile', isBear: true, acc: 'sparkles' },
    { name: 'Dont Cry', caption: 'Ngoan nào đừng khóc 🩹', emotion: 'comfort', eyes: 'sparkle', mouth: 'smile', isBear: true },
    { name: 'Heart Gift', caption: 'Quà tặng trái tim 🎁', emotion: 'gift', eyes: 'heart', mouth: 'smile', isBear: true, acc: 'heart' },
    { name: 'Cheer Up', caption: 'Vui lên đi nào ✨', emotion: 'cheer', eyes: 'sparkle', mouth: 'open', isBear: true, acc: 'sparkles' },
    { name: 'Proud Of You', caption: 'Tự hào về cậu quá! 👏', emotion: 'proud', eyes: 'sparkle', mouth: 'smile', isBear: true },
  ];

  packs.push({
    id: 'pack_07',
    name: 'Teddy Bear Hugs',
    slug: 'teddy-bear-hugs',
    description: 'Chú gấu bông nâu nhạt ấm áp mang đến những cái ôm xoa dịu tâm hồn.',
    category: 'Bears',
    author: 'HustMess Bunny Studio',
    coverSvg: createBunnySvg({ expression: 'bear', isBear: true, eyesType: 'sparkle', mouthType: 'smile', accessory: 'heart' }),
    stickersCount: 12,
    isOfficial: true,
    isAnimated: false,
    createdAt: '2026-10-10',
    stickers: p7Stickers.map((s, idx) => ({
      id: `p7_stk_${idx + 1}`,
      packId: 'pack_07',
      name: s.name,
      keywords: ['bear', 'gấu', 'hug', 'ôm', s.caption],
      emotion: s.emotion,
      svgContent: createBunnySvg({
        expression: s.name,
        caption: s.caption,
        eyesType: s.eyes as any,
        mouthType: s.mouth as any,
        accessory: s.acc,
        isBear: true
      }),
      sortOrder: idx + 1
    }))
  });

  // PACK 08 — Pinky Daily Life
  const p8Stickers = [
    { name: 'Working', caption: 'Chăm chỉ làm việc 💼', emotion: 'work', eyes: 'sparkle', mouth: 'smile', acc: 'laptop' },
    { name: 'Studying', caption: 'Học bài chăm ngoan 📖', emotion: 'study', eyes: 'sparkle', mouth: 'smile', acc: 'laptop' },
    { name: 'Drinking Coffee', caption: 'Nạp cafein tỉnh táo ☕', emotion: 'coffee', eyes: 'closed_happy', mouth: 'smile', acc: 'coffee' },
    { name: 'Eating Noodles', caption: 'Ăn mì xì xụp 🍜', emotion: 'eat', eyes: 'sparkle', mouth: 'open' },
    { name: 'Watching Movies', caption: 'Cày phim chill chill 🎬', emotion: 'movie', eyes: 'sparkle', mouth: 'open' },
    { name: 'Gaming', caption: 'Chiến game gánh team 🎮', emotion: 'game', eyes: 'sparkle', mouth: 'open', acc: 'sparkles' },
    { name: 'Shopping', caption: 'Chốt đơn mỏi tay 🛍️', emotion: 'shop', eyes: 'heart', mouth: 'open', acc: 'heart' },
    { name: 'Taking Selfies', caption: 'Tự sướng tấm hình 📸', emotion: 'selfie', eyes: 'wink', mouth: 'smile', acc: 'sparkles' },
    { name: 'Listening To Music', caption: 'Giai điệu du dương 🎧', emotion: 'music', eyes: 'closed_happy', mouth: 'smile' },
    { name: 'Exercising', caption: 'Tập thể dục giữ dáng 🏃', emotion: 'sport', eyes: 'sparkle', mouth: 'open' },
    { name: 'Relaxing', caption: 'Nghỉ ngơi thư giãn 🌿', emotion: 'relax', eyes: 'closed_happy', mouth: 'smile' },
    { name: 'Cleaning Room', caption: 'Dọn phòng sạch bong 🧹', emotion: 'clean', eyes: 'sparkle', mouth: 'smile', acc: 'sparkles' },
  ];

  packs.push({
    id: 'pack_08',
    name: 'Pinky Daily Life',
    slug: 'pinky-daily-life',
    description: 'Một ngày năng động từ làm việc, uống cà phê tới cày phim của Bunny.',
    category: 'School & Work',
    author: 'HustMess Bunny Studio',
    coverSvg: createBunnySvg({ expression: 'coffee', eyesType: 'closed_happy', mouthType: 'smile', accessory: 'coffee' }),
    stickersCount: 12,
    isOfficial: true,
    isAnimated: false,
    createdAt: '2026-10-10',
    stickers: p8Stickers.map((s, idx) => ({
      id: `p8_stk_${idx + 1}`,
      packId: 'pack_08',
      name: s.name,
      keywords: ['daily', 'cuộc sống', 'cafe', 'work', s.caption],
      emotion: s.emotion,
      svgContent: createBunnySvg({
        expression: s.name,
        caption: s.caption,
        eyesType: s.eyes as any,
        mouthType: s.mouth as any,
        accessory: s.acc
      }),
      sortOrder: idx + 1
    }))
  });

  // PACK 09 — Bunny Funny
  const p9Stickers = [
    { name: 'LOL', caption: 'Cười nội thương 🤣', emotion: 'lol', eyes: 'closed_happy', mouth: 'open' },
    { name: 'Facepalm', caption: 'Bó tay chấm com 🤦', emotion: 'facepalm', eyes: 'round', mouth: 'pout' },
    { name: 'Speechless', caption: 'Câm nín luôn á 😶', emotion: 'speechless', eyes: 'round', mouth: 'smile' },
    { name: 'Shocked', caption: 'Mắt chữ A mồm chữ O 😱', emotion: 'shocked', eyes: 'round', mouth: 'o', acc: 'sparkles' },
    { name: 'Side Eye', caption: 'Liếc xéo một cái 👀', emotion: 'sideeye', eyes: 'round', mouth: 'smile' },
    { name: 'Suspicious', caption: 'Nghi vấn lắm nha 🕵️', emotion: 'sus', eyes: 'wink', mouth: 'pout' },
    { name: 'Dramatic Crying', caption: 'Khóc lóc ăn vạ 😭', emotion: 'cry', eyes: 'crying', mouth: 'crying' },
    { name: 'Overthinking', caption: 'Nghĩ nhiều đau đầu 🤯', emotion: 'think', eyes: 'round', mouth: 'o' },
    { name: 'Panic', caption: 'Hốt hoảng loạn cào cào 🚨', emotion: 'panic', eyes: 'crying', mouth: 'o' },
    { name: 'Victory', caption: 'Thắng lợi rực rỡ ✌️', emotion: 'victory', eyes: 'wink', mouth: 'open', acc: 'sparkles' },
    { name: 'Silly Dancing', caption: 'Múa quạt điệu nghệ 🕺', emotion: 'dance', eyes: 'closed_happy', mouth: 'open' },
    { name: 'Funny Wink', caption: 'Nháy mắt tinh nghịch 😉', emotion: 'wink', eyes: 'wink', mouth: 'smile' },
  ];

  packs.push({
    id: 'pack_09',
    name: 'Bunny Funny',
    slug: 'bunny-funny',
    description: 'Gói sticker hài hước meme cực bựa đem lại tràng cười thả ga!',
    category: 'Funny & Meme',
    author: 'HustMess Bunny Studio',
    coverSvg: createBunnySvg({ expression: 'lol', eyesType: 'closed_happy', mouthType: 'open' }),
    stickersCount: 12,
    isOfficial: true,
    isAnimated: false,
    createdAt: '2026-10-10',
    stickers: p9Stickers.map((s, idx) => ({
      id: `p9_stk_${idx + 1}`,
      packId: 'pack_09',
      name: s.name,
      keywords: ['meme', 'funny', 'hài hước', 'lol', s.caption],
      emotion: s.emotion,
      svgContent: createBunnySvg({
        expression: s.name,
        caption: s.caption,
        eyesType: s.eyes as any,
        mouthType: s.mouth as any,
        accessory: s.acc
      }),
      sortOrder: idx + 1
    }))
  });

  // PACK 10 — Sweet Messages
  const p10Stickers = [
    { name: 'Hello', caption: 'Xin chào bạn iu 👋', emotion: 'hello', eyes: 'sparkle', mouth: 'open' },
    { name: 'Good Morning Message', caption: 'Ngày mới an lành nha 🌻', emotion: 'morning', eyes: 'sparkle', mouth: 'smile', acc: 'sparkles' },
    { name: 'Good Night Message', caption: 'Ngủ ngon mơ đẹp 🌙', emotion: 'night', eyes: 'sleepy', mouth: 'smile', acc: 'pillow' },
    { name: 'Thank You Message', caption: 'Cảm ơn nhiều lắm nè 💖', emotion: 'thanks', eyes: 'closed_happy', mouth: 'smile', acc: 'heart' },
    { name: 'Sorry Message', caption: 'Cho tớ tạ lỗi nhe 🥺', emotion: 'sorry', eyes: 'crying', mouth: 'pout' },
    { name: 'Please', caption: 'Đi mà, năn nỉ đó 🙏', emotion: 'please', eyes: 'sparkle', mouth: 'pout' },
    { name: 'Take Care', caption: 'Nhớ giữ gìn sức khoẻ 🧣', emotion: 'care', eyes: 'sparkle', mouth: 'smile' },
    { name: 'Miss You Message', caption: 'Nhớ ơi là nhớ luông 💌', emotion: 'miss', eyes: 'heart', mouth: 'smile', acc: 'letter' },
    { name: 'See You', caption: 'Hẹn gặp lại sớm nhé 🎀', emotion: 'bye', eyes: 'wink', mouth: 'smile' },
    { name: 'You Can Do It', caption: 'Cậu làm được mà, cố lên! 💪', emotion: 'cheer', eyes: 'sparkle', mouth: 'open', acc: 'sparkles' },
    { name: 'Congrats', caption: 'Chúc mừng thành công! 💐', emotion: 'congrats', eyes: 'sparkle', mouth: 'open', acc: 'rose' },
    { name: 'Sending Love', caption: 'Gửi ngàn nụ hôn 💋', emotion: 'love', eyes: 'heart', mouth: 'kiss', acc: 'heart' },
  ];

  packs.push({
    id: 'pack_10',
    name: 'Sweet Messages',
    slug: 'sweet-messages',
    description: 'Những lời chúc ấm lòng, tin nhắn ngọt ngào nhắn gửi người thương.',
    category: 'Love & Romance',
    author: 'HustMess Bunny Studio',
    coverSvg: createBunnySvg({ expression: 'hello', eyesType: 'sparkle', mouthType: 'open', accessory: 'heart' }),
    stickersCount: 12,
    isOfficial: true,
    isAnimated: false,
    createdAt: '2026-10-10',
    stickers: p10Stickers.map((s, idx) => ({
      id: `p10_stk_${idx + 1}`,
      packId: 'pack_10',
      name: s.name,
      keywords: ['message', 'tin nhắn', 'chúc', 'ngọt ngào', s.caption],
      emotion: s.emotion,
      svgContent: createBunnySvg({
        expression: s.name,
        caption: s.caption,
        eyesType: s.eyes as any,
        mouthType: s.mouth as any,
        accessory: s.acc
      }),
      sortOrder: idx + 1
    }))
  });

  // PACK 11 — Bunny Seasons
  const p11Stickers = [
    { name: 'Spring Flowers', caption: 'Hoa xuân nở rộ 🌸', emotion: 'spring', eyes: 'sparkle', mouth: 'smile', acc: 'rose' },
    { name: 'Summer Sunshine', caption: 'Nắng hè rực rỡ 🏖️', emotion: 'summer', eyes: 'sparkle', mouth: 'open', acc: 'sparkles' },
    { name: 'Rainy Day', caption: 'Mưa rơi tí tách ☔', emotion: 'rain', eyes: 'sleepy', mouth: 'smile' },
    { name: 'Autumn Leaves', caption: 'Mùa thu lá vàng 🍂', emotion: 'autumn', eyes: 'closed_happy', mouth: 'smile' },
    { name: 'Winter Scarf', caption: 'Mùa đông quàng khăn ấm 🧣', emotion: 'winter', eyes: 'closed_happy', mouth: 'smile' },
    { name: 'Christmas', caption: 'Giáng sinh an lành 🎄', emotion: 'xmas', eyes: 'sparkle', mouth: 'open', acc: 'sparkles' },
    { name: 'New Year', caption: 'Chúc mừng năm mới! 🎆', emotion: 'newyear', eyes: 'sparkle', mouth: 'open', acc: 'sparkles' },
    { name: 'Valentines Day', caption: 'Valentine ngọt ngào 🍫', emotion: 'valentine', eyes: 'heart', mouth: 'kiss', acc: 'heart' },
    { name: 'Birthday', caption: 'Thổi nến sinh nhật 🎂', emotion: 'birthday', eyes: 'sparkle', mouth: 'open', acc: 'cake' },
    { name: 'Mid Autumn Festival', caption: 'Tết Trung Thu rước đèn 🏮', emotion: 'midautumn', eyes: 'sparkle', mouth: 'smile' },
    { name: 'Graduation', caption: 'Lễ tốt nghiệp rạng rỡ 🎓', emotion: 'graduate', eyes: 'sparkle', mouth: 'open' },
    { name: 'Halloween', caption: 'Kẹo hay bị ghẹo 🎃', emotion: 'halloween', eyes: 'wink', mouth: 'open' },
  ];

  packs.push({
    id: 'pack_11',
    name: 'Bunny Seasons',
    slug: 'bunny-seasons',
    description: 'Bốn mùa lễ hội rộn ràng cùng sắc hoa và những dịp kỷ niệm ý nghĩa.',
    category: 'Holidays',
    author: 'HustMess Bunny Studio',
    coverSvg: createBunnySvg({ expression: 'season', eyesType: 'sparkle', mouthType: 'open', accessory: 'sparkles' }),
    stickersCount: 12,
    isOfficial: true,
    isAnimated: false,
    createdAt: '2026-10-10',
    stickers: p11Stickers.map((s, idx) => ({
      id: `p11_stk_${idx + 1}`,
      packId: 'pack_11',
      name: s.name,
      keywords: ['season', 'mùa', 'lễ hội', 'tết', s.caption],
      emotion: s.emotion,
      svgContent: createBunnySvg({
        expression: s.name,
        caption: s.caption,
        eyesType: s.eyes as any,
        mouthType: s.mouth as any,
        accessory: s.acc
      }),
      sortOrder: idx + 1
    }))
  });

  // PACK 12 — Bunny Study & Work
  const p12Stickers = [
    { name: 'Studying Hard', caption: 'Cắm đầu ôn thi ✍️', emotion: 'study', eyes: 'round', mouth: 'smile', acc: 'laptop' },
    { name: 'Deadline Panic', caption: 'Cháy deadline cứu tui! 🔥', emotion: 'deadline', eyes: 'crying', mouth: 'o' },
    { name: 'Finished Homework', caption: 'Xong bài tập rồi, hú vía 🎉', emotion: 'done', eyes: 'closed_happy', mouth: 'open', acc: 'sparkles' },
    { name: 'Teamwork', caption: 'Làm việc nhóm ăn ý 🤝', emotion: 'team', eyes: 'sparkle', mouth: 'smile' },
    { name: 'Brainstorming', caption: 'Ý tưởng tuôn trào 💡', emotion: 'idea', eyes: 'sparkle', mouth: 'open', acc: 'sparkles' },
    { name: 'Coding', caption: 'Gõ code mượt như bơ 💻', emotion: 'code', eyes: 'sparkle', mouth: 'smile', acc: 'laptop' },
    { name: 'Debugging', caption: 'Bug ở đâu ra mà lắm thế 🐛', emotion: 'debug', eyes: 'round', mouth: 'pout', acc: 'laptop' },
    { name: 'Exam Stress', caption: 'Stress mùa thi cử 😭', emotion: 'stress', eyes: 'crying', mouth: 'crying' },
    { name: 'Passed Exam', caption: 'Qua môn rồi hú yeah! 💯', emotion: 'pass', eyes: 'sparkle', mouth: 'open', acc: 'sparkles' },
    { name: 'Taking Notes', caption: 'Ghi chép cẩn thận 📝', emotion: 'note', eyes: 'sparkle', mouth: 'smile' },
    { name: 'Coffee Break', caption: 'Giải lao cốc cà phê ☕', emotion: 'break', eyes: 'closed_happy', mouth: 'smile', acc: 'coffee' },
    { name: 'Success', caption: 'Thành công mỹ mãn ⭐', emotion: 'success', eyes: 'sparkle', mouth: 'open', acc: 'sparkles' },
  ];

  packs.push({
    id: 'pack_12',
    name: 'Bunny Study & Work',
    slug: 'bunny-study-work',
    description: 'Chinh phục deadline, thi cử, lập trình cùng tinh thần học tập hết mình.',
    category: 'School & Work',
    author: 'HustMess Bunny Studio',
    coverSvg: createBunnySvg({ expression: 'study', eyesType: 'sparkle', mouthType: 'open', accessory: 'laptop' }),
    stickersCount: 12,
    isOfficial: true,
    isAnimated: false,
    createdAt: '2026-10-10',
    stickers: p12Stickers.map((s, idx) => ({
      id: `p12_stk_${idx + 1}`,
      packId: 'pack_12',
      name: s.name,
      keywords: ['study', 'học', 'deadline', 'code', 'thi cử', s.caption],
      emotion: s.emotion,
      svgContent: createBunnySvg({
        expression: s.name,
        caption: s.caption,
        eyesType: s.eyes as any,
        mouthType: s.mouth as any,
        accessory: s.acc
      }),
      sortOrder: idx + 1
    }))
  });

  // ANIMATED PACK 01 — Bunny Motion (8 animated stickers)
  const anim1Stickers = [
    { name: 'Bunny Jumping', caption: 'Nhảy tưng tưng vui sướng 🐰', anim: 'bounce', eyes: 'sparkle', mouth: 'open', acc: 'sparkles' },
    { name: 'Bunny Waving', caption: 'Vẫy tay xin chào 👋', anim: 'wave', eyes: 'sparkle', mouth: 'smile' },
    { name: 'Bunny Sending Hearts', caption: 'Bắn tim liên hoàn 💓', anim: 'pulse', eyes: 'heart', mouth: 'kiss', acc: 'heart' },
    { name: 'Bunny Laughing', caption: 'Cười rung cả rốn 🤣', anim: 'bounce', eyes: 'closed_happy', mouth: 'open' },
    { name: 'Bunny Crying', caption: 'Khóc nấc thành tiếng 😭', anim: 'bounce', eyes: 'crying', mouth: 'crying' },
    { name: 'Bunny Hugging', caption: 'Ôm chặt không buông 🫂', anim: 'pulse', eyes: 'closed_happy', mouth: 'smile', acc: 'heart' },
    { name: 'Bunny Dancing', caption: 'Vũ điệu lắc lư 💃', anim: 'bounce', eyes: 'sparkle', mouth: 'open', acc: 'sparkles' },
    { name: 'Bunny Sleeping', caption: 'Thở đều trong mơ 💤', anim: 'pulse', eyes: 'sleepy', mouth: 'smile', acc: 'pillow' },
  ];

  packs.push({
    id: 'pack_anim_01',
    name: 'Bunny Motion (Động)',
    slug: 'bunny-motion',
    description: '8 sticker chuyển động siêu cấp đáng yêu với hiệu ứng nhảy nhót sống động!',
    category: 'Animated Stickers',
    author: 'HustMess Bunny Studio',
    coverSvg: createBunnySvg({ expression: 'anim', eyesType: 'sparkle', mouthType: 'open', animatedEffect: 'bounce', accessory: 'sparkles' }),
    stickersCount: 8,
    isOfficial: true,
    isAnimated: true,
    createdAt: '2026-10-10',
    stickers: anim1Stickers.map((s, idx) => ({
      id: `panim1_stk_${idx + 1}`,
      packId: 'pack_anim_01',
      name: s.name,
      keywords: ['animated', 'động', 'bunny', 'motion', s.caption],
      emotion: 'animated',
      isAnimated: true,
      animationType: s.anim,
      svgContent: createBunnySvg({
        expression: s.name,
        caption: s.caption,
        eyesType: s.eyes as any,
        mouthType: s.mouth as any,
        accessory: s.acc,
        animatedEffect: s.anim
      }),
      sortOrder: idx + 1
    }))
  });

  // ANIMATED PACK 02 — Bunny Magic (8 animated stickers)
  const anim2Stickers = [
    { name: 'Sparkling Hearts', caption: 'Trái tim toả sáng lung linh ✨', anim: 'pulse', eyes: 'heart', mouth: 'smile', acc: 'heart' },
    { name: 'Bunny Confetti', caption: 'Pháo hoa giấy rực rỡ 🎊', anim: 'bounce', eyes: 'sparkle', mouth: 'open', acc: 'sparkles' },
    { name: 'Shooting Love Arrow', caption: 'Mũi tên tình yêu 💘', anim: 'pulse', eyes: 'wink', mouth: 'kiss', acc: 'heart' },
    { name: 'Floating On Cloud', caption: 'Lơ lửng trên mây hồng ☁️', anim: 'bounce', eyes: 'closed_happy', mouth: 'smile' },
    { name: 'Blowing Kisses', caption: 'Thổi ngàn nụ hôn bay 💋', anim: 'pulse', eyes: 'wink', mouth: 'kiss', acc: 'heart' },
    { name: 'Magic Wand Wave', caption: 'Biến hoá phép thuật 🪄', anim: 'wave', eyes: 'sparkle', mouth: 'open', acc: 'sparkles' },
    { name: 'Bunny Celebration', caption: 'Tưng bừng ngày hội 🥳', anim: 'bounce', eyes: 'sparkle', mouth: 'open', acc: 'cake' },
    { name: 'Rotating Stars', caption: 'Sao lấp lánh xoay tròn 🌟', anim: 'rotate', eyes: 'sparkle', mouth: 'smile', acc: 'sparkles' },
  ];

  packs.push({
    id: 'pack_anim_02',
    name: 'Bunny Magic (Phép Thuật)',
    slug: 'bunny-magic',
    description: 'Thế giới phép thuật hồng phấn với ngôi sao xoay vòng và phép màu lung linh!',
    category: 'Animated Stickers',
    author: 'HustMess Bunny Studio',
    coverSvg: createBunnySvg({ expression: 'magic', eyesType: 'sparkle', mouthType: 'smile', animatedEffect: 'rotate', accessory: 'sparkles' }),
    stickersCount: 8,
    isOfficial: true,
    isAnimated: true,
    createdAt: '2026-10-10',
    stickers: anim2Stickers.map((s, idx) => ({
      id: `panim2_stk_${idx + 1}`,
      packId: 'pack_anim_02',
      name: s.name,
      keywords: ['animated', 'magic', 'phép thuật', 'ngôi sao', s.caption],
      emotion: 'magic',
      isAnimated: true,
      animationType: s.anim,
      svgContent: createBunnySvg({
        expression: s.name,
        caption: s.caption,
        eyesType: s.eyes as any,
        mouthType: s.mouth as any,
        accessory: s.acc,
        animatedEffect: s.anim
      }),
      sortOrder: idx + 1
    }))
  });

  // PACK 15 (Uploaded Image 1) — Ribbon Bunny (Thỏ Nơ Hồng)
  const ribbonStickers = [
    { name: 'Ribbon Hello', caption: 'Thỏ nơ chào bạn iu 🎀', acc: '' },
    { name: 'Holding Heart', caption: 'Gửi trọn con tim 💖', acc: 'heart' },
    { name: 'Sweet Ribbon', caption: 'Dễ thương xỉu luôn 💕', acc: '' },
    { name: 'Love You', caption: 'Thương cậu nhiều lắm 🌸', acc: 'heart' },
    { name: 'Cute Pose', caption: 'Ngồi ngoan chờ tin nhắn 🐰', acc: '' },
    { name: 'Kisses', caption: 'Moah moah chụt chụt 💋', acc: 'heart' },
    { name: 'Happy Ribbon', caption: 'Vui vẻ cả ngày nha ✨', acc: '' },
    { name: 'Shy Ribbon', caption: 'Ngại ngùng má đỏ 🙈', acc: '' },
    { name: 'Ribbon Cheer', caption: 'Cố lên cậu ơi 🎀', acc: '' },
    { name: 'Warm Hug', caption: 'Ôm một cái thật chặt 🫂', acc: 'heart' },
    { name: 'Good Night Ribbon', caption: 'Ngủ ngoan mơ đẹp nè 🌙', acc: '' },
    { name: 'Always With You', caption: 'Mãi là bạn tốt của nhau 🤍', acc: 'heart' }
  ];

  packs.push({
    id: 'pack_ribbon_bunny',
    name: 'Ribbon Bunny (Thỏ Nơ Hồng)',
    slug: 'ribbon-bunny',
    description: 'Bé Thỏ Nơ Hồng tai rủ siêu ngọt ngào với đôi mắt lấp lánh và chiếc nơ hồng công chúa!',
    category: 'Bunny Collection',
    author: 'HustMess Bunny Exclusive',
    coverSvg: createRibbonBunnySvg({ accessory: 'heart' }),
    stickersCount: 12,
    isOfficial: true,
    isAnimated: false,
    createdAt: '2026-10-11',
    stickers: ribbonStickers.map((s, idx) => ({
      id: `p_ribbon_${idx + 1}`,
      packId: 'pack_ribbon_bunny',
      name: s.name,
      keywords: ['ribbon', 'thỏ nơ', 'nơ hồng', 'bunny', s.caption],
      emotion: 'cute',
      svgContent: createRibbonBunnySvg({ caption: s.caption, accessory: s.acc }),
      sortOrder: idx + 1
    }))
  });

  // PACK 16 (Uploaded Image 2) — Kawaii Bunny Emotes (12 biểu cảm đầu thỏ tai vểnh)
  const emoteTypes = [
    { type: 'surprised', name: 'Ngơ ngác mắt tròn', caption: 'Ủa là sao ta? ❓' },
    { type: 'angry_pout', name: 'Dỗi hờn giận dỗi', caption: 'Dỗi rồi đừng có nịnh 😾' },
    { type: 'cheeky_wink', name: 'Nháy mắt tinh nghịch', caption: 'Bắt quả tang nhé 😉' },
    { type: 'laughing_heart', name: 'Cười tít mắt vui sướng', caption: 'Cười tươi rói haha 💗' },
    { type: 'happy_smile', name: 'Mỉm chi đáng yêu', caption: 'Hạnh phúc ngập tràn 🌸' },
    { type: 'tongue_out', name: 'Lè lưỡi trêu chọc', caption: 'Lêu lêu bắt không được 😋' },
    { type: 'shy_embarrassed', name: 'Ngượng ngùng đỏ mặt', caption: 'Mắc cỡ quá đi à 😳' },
    { type: 'sparkle_hearts', name: 'Mắt lấp lánh bắn tim', caption: 'Mê đắm đuối luôn ✨' },
    { type: 'squint_laugh', name: 'Cười thả ga', caption: 'Cười không ngậm được miệng 🤣' },
    { type: 'playful_wink', name: 'Trêu ghẹo đáng yêu', caption: 'Tớ đùa tí thôi mò 😜' },
    { type: 'flirty_wink', name: 'Thả thính ngọt ngào', caption: 'Thả tim nè pằng pằng 💘' },
    { type: 'sweet_smile', name: 'Ngoan ngoãn dịu dàng', caption: 'Bé ngoan của bạn 🤍' }
  ];

  packs.push({
    id: 'pack_bunny_emotes',
    name: 'Kawaii Bunny Emotes (Biểu Cảm Thỏ Con)',
    slug: 'kawaii-bunny-emotes',
    description: 'Bộ sưu tập 12 biểu cảm khuôn mặt thỏ trắng tai hồng cực kỳ sống động và giàu cảm xúc!',
    category: 'Bunny Collection',
    author: 'HustMess Bunny Exclusive',
    coverSvg: createEmoteBunnySvg('sparkle_hearts'),
    stickersCount: 12,
    isOfficial: true,
    isAnimated: false,
    createdAt: '2026-10-11',
    stickers: emoteTypes.map((s, idx) => ({
      id: `p_emote_${idx + 1}`,
      packId: 'pack_bunny_emotes',
      name: s.name,
      keywords: ['emote', 'biểu cảm', 'thỏ', 'bunny', s.caption],
      emotion: s.type,
      svgContent: createEmoteBunnySvg(s.type, s.caption),
      sortOrder: idx + 1
    }))
  });

  // PACK 17 (Uploaded Image 3) — Outline Mochi Bunny (12 sticker thỏ viền nét ngộ nghĩnh)
  const outlineTypes = [
    { type: 'sweet_smile', name: 'Mỉm cười ngọt ngào', caption: 'Hello ngày mới ☀️' },
    { type: 'sleeping', name: 'Ngủ chảy bong bóng', caption: 'Khò khò say giấc zZz 😴' },
    { type: 'pouting_sideways', name: 'Bĩu môi hờn dỗi', caption: 'Hờn cả thế giới 😤' },
    { type: 'laughing_sparkle', name: 'Cười há miệng vui vẻ', caption: 'Haha vui quá đi ✨' },
    { type: 'xd_grin', name: 'Mắt híp cười toe toét', caption: 'Sướng rơn cả người 😆' },
    { type: 'cat_smile', name: 'Miệng mèo mỉm chi', caption: 'Meo meo cute :3' },
    { type: 'dizzy_stars', name: 'Hoa mắt chóng mặt', caption: 'Chóng mặt quá rồi ⭐' },
    { type: 'crying_tears', name: 'Mếu máo rớt nước mắt', caption: 'Hu hu thương tớ với 😭' },
    { type: 'kissy_wink', name: 'Nháy mắt chu môi', caption: 'Hôn gió một cái 💋' },
    { type: 'heart_eyes', name: 'Mắt hình trái tim', caption: 'Yêu ngay từ cái nhìn đầu 💖' },
    { type: 'playful_tongue', name: 'Lè lưỡi lém lỉnh', caption: 'Hihi chọc tức nè 😛' },
    { type: 'relaxed_smile', name: 'Cười duyên dịu dàng', caption: 'Bình yên bên cậu 🌸' }
  ];

  packs.push({
    id: 'pack_outline_mochi',
    name: 'Outline Mochi Bunny (Thỏ Viền Mochi)',
    slug: 'outline-mochi-bunny',
    description: '12 sticker nét viền phong cách hoạt hoạ pastel với chiếc bong bóng ngủ và biểu cảm siêu hài hước!',
    category: 'Funny & Meme',
    author: 'HustMess Bunny Exclusive',
    coverSvg: createOutlineMochiSvg('heart_eyes'),
    stickersCount: 12,
    isOfficial: true,
    isAnimated: false,
    createdAt: '2026-10-11',
    stickers: outlineTypes.map((s, idx) => ({
      id: `p_outline_${idx + 1}`,
      packId: 'pack_outline_mochi',
      name: s.name,
      keywords: ['outline', 'mochi', 'viền', 'sticker', s.caption],
      emotion: s.type,
      svgContent: createOutlineMochiSvg(s.type, s.caption),
      sortOrder: idx + 1
    }))
  });

  return packs;
}
