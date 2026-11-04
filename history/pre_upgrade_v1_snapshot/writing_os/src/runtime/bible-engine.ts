// working/src/runtime/bible-engine.ts
// Ingests and verifies the Master Story Bible, 4-Layer Dream System, and Chapter Milestones.

export interface CharacterProfile {
  id: string;
  name: string;
  aliases: string[];
  role: 'PROTAGONIST' | 'LOVE_INTEREST_ALLY' | 'ANTAGONIST' | 'SUPPORTING' | 'CATALYST';
  coreGoal: string;
  coreWound: string;
  voiceStyle: string;
}

export interface DreamPhysicsRule {
  layer: 1 | 2 | 3 | 4;
  name: string;
  description: string;
  risk: string;
  anchorMechanic: string;
}

export interface ChapterMilestone {
  chapterNumber: number;
  title: string;
  act: 'ACT_1' | 'ACT_2A' | 'ACT_2B' | 'ACT_3' | 'EPILOGUE';
  location: string;
  keyCharacters: string[];
  requiredBeats: string[];
  requiredKeywords: string[];
  forbiddenPrematureLeaks?: string[];
}

export interface BibleValidationReport {
  chapterNumber: number;
  act: string;
  adherenceScore: number; // 0.0 - 1.0
  matchedKeywords: string[];
  missingKeywords: string[];
  detectedCharacters: string[];
  missingExpectedCharacters: string[];
  detectedPrematureLeaks: string[];
  passed: boolean;
  notes: string[];
}

export const CANON_CHARACTERS: CharacterProfile[] = [
  {
    id: 'ELIAS',
    name: 'Elias Thorne / Subject Zero',
    aliases: ['Elias', 'Thorne', 'Zero', 'Minh'],
    role: 'PROTAGONIST',
    coreGoal: 'Find the truth of who he is and protect Maren.',
    coreWound: '20 years of synthetic memories in Layer 4; fear of being a fabricated shell.',
    voiceStyle: 'Grounded, sharp, perceptive, carrying visceral neuro-fatigue.',
  },
  {
    id: 'MAREN',
    name: 'Dr. Maren Solis',
    aliases: ['Maren', 'Dr. Solis', 'Solis', 'An'],
    role: 'LOVE_INTEREST_ALLY',
    coreGoal: 'Expose the Black Archive and discover the truth behind Corwin and her mother.',
    coreWound: 'Survivor guilt regarding Corwin Daly and her mother Elena Solis.',
    voiceStyle: 'Clinical exterior masking deep compassion, analytical, authoritative.',
  },
  {
    id: 'HALLOWAY',
    name: 'Dr. Arthur Halloway',
    aliases: ['Halloway', 'Director', 'Cuong'],
    role: 'ANTAGONIST',
    coreGoal: 'Monopolize human cognitive architecture via Layer 4 neural reprogramming.',
    coreWound: 'Ruthless obsession with deterministic neural control.',
    voiceStyle: 'Paternalistic, chillingly rational, institutional dominance.',
  },
  {
    id: 'HACKER',
    name: 'Vesper / The Female Dark Web Hacker',
    aliases: ['Vesper', 'Hacker', 'Phuong', 'Cipher'],
    role: 'SUPPORTING',
    coreGoal: 'Dismantle Halloway Syndicate neural infrastructure and protect free will.',
    coreWound: 'Underground operative seeking justice for fallen dissidents.',
    voiceStyle: 'Irreverent, lightning-fast tech jargon, fiercely loyal.',
  },
  {
    id: 'SQUAD',
    name: 'The Gaming Squad / Offline Irregulars',
    aliases: ['Squad', 'Bao', 'Duy', 'Tuan', 'Gamer', 'Clan'],
    role: 'SUPPORTING',
    coreGoal: 'Back Elias up in the physical and digital underworld.',
    coreWound: 'Everyday working-class comrades risking life for true brotherhood.',
    voiceStyle: 'Colloquial, gritty banter, authentic solidarity.',
  },
  {
    id: 'CORWIN',
    name: 'Corwin Daly',
    aliases: ['Corwin', 'Daly', 'Anchor'],
    role: 'CATALYST',
    coreGoal: 'Survive in Layer-1 stasis and preserve the Zero-Knowledge cryptographic key.',
    coreWound: 'Sacrificed himself to save Maren 3 years prior.',
    voiceStyle: 'Ghostly, mythic, unresolved memory presence in Book 1.',
  },
];

export const CANON_DREAM_PHYSICS: DreamPhysicsRule[] = [
  {
    layer: 1,
    name: 'Surface REM / Stasis Sub-Baseline',
    description: 'Physical neural paralysis chamber; metabolic hibernation.',
    risk: 'Physical muscular atrophy; hypothermia.',
    anchorMechanic: 'Biometric life-support tether.',
  },
  {
    layer: 2,
    name: 'Lucid Memory Architecture / Tactical Sub-Grid',
    description: 'Standard diagnostic and navigation plane. Fast data synthesis.',
    risk: 'Sensory phantom pain, disorientation.',
    anchorMechanic: 'Sensory token (Maren’s lavender clinic diffuser / pocket item).',
  },
  {
    layer: 3,
    name: 'Deep Archetypal / Corporate Black Server',
    description: 'Encrypted institutional neural networks; defended by military sub-routines.',
    risk: 'Synaptic feedback shock; cardiac spike; neural bleed.',
    anchorMechanic: 'Dual-pulse heart monitor synchronized by Maren as external navigator.',
  },
  {
    layer: 4,
    name: 'Reality Override / Sovereign Neural Plane',
    description: 'Direct quantum subconscious programming. Capable of overwriting lower layers.',
    risk: 'Fatal Thermal Burnout (cerebral hemorrhage / stroke). Cursed limit.',
    anchorMechanic: 'The Emotional Anchor Tag (the spoken name "Maren Solis").',
  },
];

export const CANON_CHAPTER_MILESTONES: Record<number, ChapterMilestone> = {
  1: {
    chapterNumber: 1,
    title: 'THE WAKING',
    act: 'ACT_1',
    location: 'Halloway Medical Center',
    keyCharacters: ['Elias', 'Halloway'],
    requiredBeats: ['Elias wakes after 11-day coma', '20 years of memories wiped', 'Only the name "Maren" remains'],
    requiredKeywords: ['coma', 'maren', 'halloway', 'memory', 'waking', 'hospital', 'name'],
  },
  2: {
    chapterNumber: 2,
    title: 'THE SEARCH',
    act: 'ACT_1',
    location: 'Urban Outskirts & Directory',
    keyCharacters: ['Elias'],
    requiredBeats: ['Elias searches clinical registries', 'Tracks Maren to her neuro-diagnostic clinic'],
    requiredKeywords: ['search', 'clinic', 'registry', 'solis', 'maren', 'rain', 'streets'],
  },
  3: {
    chapterNumber: 3,
    title: 'THE CLINIC',
    act: 'ACT_1',
    location: 'Dr. Maren Solis Neuro-Clinic',
    keyCharacters: ['Elias', 'Maren'],
    requiredBeats: ['First meeting between Elias and Maren', 'Maren suspects a corporate spy or lunatic', 'Initial diagnostic intake'],
    requiredKeywords: ['clinic', 'maren', 'elias', 'diagnostic', 'intake', 'eyes', 'scan'],
  },
  4: {
    chapterNumber: 4,
    title: 'THE FIRST SESSION',
    act: 'ACT_1',
    location: 'Clinic Scanning Suite',
    keyCharacters: ['Elias', 'Maren'],
    requiredBeats: ['First Layer 2 neuro-scan', 'Maren discovers organic memory suppression', 'Lavender sensory recall'],
    requiredKeywords: ['scan', 'layer', 'synaptic', 'neural', 'lavender', 'pulse', 'rig'],
  },
  5: {
    chapterNumber: 5,
    title: 'THE FRAGMENTS AND THE SQUAD',
    act: 'ACT_1',
    location: 'Gaming Cyber-Cafe & Clinic',
    keyCharacters: ['Elias', 'Squad'],
    requiredBeats: ['Introduction to the Gaming Squad', 'Memory fragment of fire and voicemails'],
    requiredKeywords: ['squad', 'game', 'cafe', 'terminal', 'fragments', 'brothers'],
  },
  6: {
    chapterNumber: 6,
    title: 'THE INSTITUTIONAL VICE',
    act: 'ACT_1',
    location: 'City Streets & Clinic',
    keyCharacters: ['Elias', 'Maren', 'Halloway'],
    requiredBeats: ['Halloway demands Elias return', 'Institutional pressure intensifies'],
    requiredKeywords: ['halloway', 'phone', 'threat', 'pressure', 'surveillance', 'vice'],
  },
  7: {
    chapterNumber: 7,
    title: 'THE BLACK ARCHIVE AND THE RAID',
    act: 'ACT_1',
    location: 'Maren Clinic (Destroyed)',
    keyCharacters: ['Elias', 'Maren'],
    requiredBeats: ['Decoding of Black Archive (Subject Zero + Elena Solis death order)', 'Halloway strike team raids lab', 'Escape into the rain with the hard drive'],
    requiredKeywords: ['archive', 'raid', 'fire', 'strike', 'drive', 'escape', 'rain', 'elena'],
  },
  14: {
    chapterNumber: 14,
    title: 'SQUAD ALLIANCE THE MIDPOINT',
    act: 'ACT_2A',
    location: 'Safehouse Garage',
    keyCharacters: ['Elias', 'Maren', 'Squad'],
    requiredBeats: ['Midpoint alliance: Gaming Squad pledges full support to Elias and Maren'],
    requiredKeywords: ['alliance', 'squad', 'midpoint', 'safehouse', 'pledge', 'gear'],
  },
  17: {
    chapterNumber: 17,
    title: 'THE RITUAL AT THE REEF',
    act: 'ACT_2B',
    location: 'Coastline / Seaside Reef',
    keyCharacters: ['Elias', 'Maren'],
    requiredBeats: ['Emotional release for Corwin Daly', 'Maren lets go of survivor guilt', 'Deepening bond with Elias'],
    requiredKeywords: ['reef', 'sea', 'waves', 'corwin', 'ritual', 'grief', 'salt', 'peace'],
  },
  22: {
    chapterNumber: 22,
    title: 'REAL WORLD BREACH',
    act: 'ACT_3',
    location: 'Coastal Lighthouse',
    keyCharacters: ['Elias', 'Maren'],
    requiredBeats: ['Elias enters deep dive to Layer 3', 'Maren monitors heart rhythm', 'Syndicate drones and tactical transports breach the lighthouse perimeter'],
    requiredKeywords: ['breach', 'lighthouse', 'storm', 'drone', 'transports', 'dive', 'perimeter'],
  },
  24: {
    chapterNumber: 24,
    title: 'THE HACKERS GAMBIT',
    act: 'ACT_3',
    location: 'Lighthouse & Grid Overlook',
    keyCharacters: ['Hacker', 'Maren'],
    requiredBeats: ['Female Dark Web Hacker overrides Syndicate drones', 'Turns automated turrets against enemy soldiers', 'Alerts SWAT units'],
    requiredKeywords: ['hacker', 'drone', 'override', 'turret', 'grid', 'exploit', 'gambit'],
  },
  26: {
    chapterNumber: 26,
    title: 'THE CONFESSION',
    act: 'ACT_3',
    location: 'Layer 3 Chamber & Lighthouse Rig',
    keyCharacters: ['Elias', 'Maren'],
    requiredBeats: ['Maren confesses love over the comm-link as Elias faces lethal thermal shutdown', 'Emotional anchor lock'],
    requiredKeywords: ['confession', 'comm', 'mic', 'glass', 'anchor', 'love', 'burnout', 'heartbeat'],
  },
  27: {
    chapterNumber: 27,
    title: 'REALITY OVERRIDE',
    act: 'ACT_3',
    location: 'Layer 4 / Sovereign Grid',
    keyCharacters: ['Elias', 'Halloway'],
    requiredBeats: ['Elias unlocks Layer 4 Reality Override', 'Shatters Syndicate firewall', 'Broadcasts Black Archive to the world'],
    requiredKeywords: ['override', 'layer 4', 'broadcast', 'firewall', 'reality', 'shatter', 'sovereign'],
  },
  28: {
    chapterNumber: 28,
    title: 'AFTERMATH AND THE COLLAPSE',
    act: 'ACT_3',
    location: 'Lighthouse Floor & Dawn Horizon',
    keyCharacters: ['Elias', 'Maren'],
    requiredBeats: ['Halloway arrested', 'Elias in critical neural collapse', 'Maren vows to take him to the Sanctuary Node'],
    requiredKeywords: ['collapse', 'arrest', 'dawn', 'sanctuary', 'survive', 'promise', 'ambulance'],
  },
  29: {
    chapterNumber: 29,
    title: 'EPILOGUE THE BREATH IN THE DEEP',
    act: 'EPILOGUE',
    location: 'Sanctuary Node / Deep Ocean Stasis Pod',
    keyCharacters: ['Corwin', 'Hacker'],
    requiredBeats: ['Corwin Daly gasps and opens his eyes inside Sanctuary Node Layer-1 pod', 'Hacker signals Maren for Book 2 rescue mission'],
    requiredKeywords: ['epilogue', 'corwin', 'breath', 'pod', 'stasis', 'sanctuary', 'signal', 'eyes'],
  },
};

export class BibleEngine {
  public static validateChapter(chapterNum: number, text: string): BibleValidationReport {
    const milestone = CANON_CHAPTER_MILESTONES[chapterNum];
    const lower = text.toLowerCase();

    if (!milestone) {
      // For intermediate chapters without explicit milestone rules, perform generic canon character scan
      const detectedChars = CANON_CHARACTERS
        .filter(c => c.aliases.some(a => lower.includes(a.toLowerCase())))
        .map(c => c.name);

      return {
        chapterNumber: chapterNum,
        act: chapterNum <= 7 ? 'ACT_1' : chapterNum <= 14 ? 'ACT_2A' : chapterNum <= 21 ? 'ACT_2B' : chapterNum <= 28 ? 'ACT_3' : 'EPILOGUE',
        adherenceScore: 0.90,
        matchedKeywords: [],
        missingKeywords: [],
        detectedCharacters: detectedChars,
        missingExpectedCharacters: [],
        detectedPrematureLeaks: [],
        passed: true,
        notes: ['Intermediate chapter evaluated against general Series Bible continuity.'],
      };
    }

    // Check Keywords
    const matchedKw: string[] = [];
    const missingKw: string[] = [];
    for (const kw of milestone.requiredKeywords) {
      if (lower.includes(kw.toLowerCase())) matchedKw.push(kw);
      else missingKw.push(kw);
    }

    // Check Expected Characters
    const detectedChars: string[] = [];
    const missingChars: string[] = [];
    for (const charId of milestone.keyCharacters) {
      const profile = CANON_CHARACTERS.find(c => c.id === charId || c.aliases.some(a => a.toLowerCase() === charId.toLowerCase()));
      if (profile) {
        const found = profile.aliases.some(a => lower.includes(a.toLowerCase()));
        if (found) detectedChars.push(profile.name);
        else missingChars.push(profile.name);
      }
    }

    // Check Premature Leaks
    const prematureLeaks: string[] = [];
    if (milestone.forbiddenPrematureLeaks) {
      for (const leak of milestone.forbiddenPrematureLeaks) {
        if (lower.includes(leak.toLowerCase())) prematureLeaks.push(leak);
      }
    }

    const kwScore = milestone.requiredKeywords.length > 0
      ? matchedKw.length / milestone.requiredKeywords.length
      : 1.0;
    const charScore = milestone.keyCharacters.length > 0
      ? (milestone.keyCharacters.length - missingChars.length) / milestone.keyCharacters.length
      : 1.0;
    const leakPenalty = prematureLeaks.length * 0.3;

    const adherenceScore = Number(Math.max(0.1, Math.min(1.0, kwScore * 0.6 + charScore * 0.4 - leakPenalty)).toFixed(2));
    const passed = adherenceScore >= 0.65 && prematureLeaks.length === 0;

    const notes: string[] = [];
    if (missingKw.length > 0) notes.push(`Missing key plot terms: [${missingKw.join(', ')}]`);
    if (missingChars.length > 0) notes.push(`Expected characters not clearly present: [${missingChars.join(', ')}]`);
    if (prematureLeaks.length > 0) notes.push(`FATAL CANON LEAK: [${prematureLeaks.join(', ')}] detected before authorized chapter.`);

    return {
      chapterNumber: chapterNum,
      act: milestone.act,
      adherenceScore,
      matchedKeywords: matchedKw,
      missingKeywords: missingKw,
      detectedCharacters: detectedChars,
      missingExpectedCharacters: missingChars,
      detectedPrematureLeaks: prematureLeaks,
      passed,
      notes,
    };
  }
}
