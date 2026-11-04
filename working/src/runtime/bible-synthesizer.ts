// developing/working/src/runtime/bible-synthesizer.ts
// Writing OS v3.0 — Universal Story Bible Synthesizer & Dynamic Canon Manager

import { CharacterProfile, ChapterMilestone, CANON_CHARACTERS, CHAPTER_MILESTONES } from './bible-engine';
import { VoicePolisher, POVProfile } from './voice-polisher';

export type FactProvenance =
  | 'CANON_CONFIRMED'   // Directly established by author or verified canon
  | 'AUTHOR_STATED'     // Provided explicitly by author in premise/input
  | 'INFERRED'          // Logically deduced from verified canon
  | 'CANON_PROPOSAL'    // AI suggested / generated candidate (requires author confirmation)
  | 'UNKNOWN';          // Unverified / speculative hypothesis

export interface WorldRule {
  category: string;
  name: string;
  description: string;
  constraints: string[];
  provenance?: FactProvenance;
}

export interface PlotHookPlant {
  id: string;
  introducedChapter: number;
  propOrFact: string;
  intentDescription: string;
  status: 'ACTIVE_PLANT' | 'RESOLVED';
  resolvedChapter?: number;
  provenance?: FactProvenance;
}

export interface ProjectBible {
  projectId: string;
  title: string;
  genre: string;
  premise: string;
  characters: (CharacterProfile & { provenance?: FactProvenance })[];
  worldRules: WorldRule[];
  chapterMilestones: ChapterMilestone[];
  activePlants: PlotHookPlant[];
}

export const GENRE_SENSORY_MATRICES: Record<string, string[]> = {
  FANTASY: ['ancient stone', 'smell of burnt tallow', 'hum of runes', 'damp soil', 'cold steel', 'mountain wind', 'parchment dust', 'pine needles', 'hearth smoke'],
  GOTHIC_HORROR: ['smell of damp moss', 'rotting cedar', 'tallow candles', 'whispering fog', 'tomb dust', 'black velvet', 'freezing draft', 'creaking floorboards'],
  HARD_SCI_FI: ['ionized air', 'burnt circuitry', 'recycled oxygen', 'vibrating deck plates', 'cold chrome', 'sub-harmonic hum', 'liquid nitrogen hiss'],
  THRILLER: ['stale tobacco', 'rain on asphalt', 'gun oil', 'blinking neon through blinds', 'siren echo', 'diesel exhaust', 'slick pavement'],
  HISTORICAL: ['black powder', 'wet wool', 'horse lather', 'churned mud', 'creaking leather', 'smoke-stung eyes', 'river mist', 'flint spark'],
  LITERARY: ['afternoon dust motes', 'dry grass', 'faded ink', 'linen', 'distant thunder', 'porcelain click', 'autumn chill', 'salt spray'],
  GENERAL: ['cold wind', 'distant hum', 'shadows', 'heavy air', 'footsteps', 'sharp breath', 'iron scent']
};

export interface StylisticEntropyConfig {
  randomSeed?: number;
  cadenceVariance?: 'TIGHT_MINIMALIST' | 'ORGANIC_WAVEFORM' | 'LYRICAL_EXPANSIVE' | 'DYNAMIC_RANDOM';
  sensoryPalette?: string[];
  sceneOpeningStyle?: 'IN_MEDIA_RES' | 'ATMOSPHERIC_ESTABLISHING' | 'PSYCHOLOGICAL_INTERIORITY' | 'DIALOGUE_CLASH' | 'RANDOM_ROTATION';
  temperature?: number; // 0.0 to 1.0
  governor?: {
    strictCanonMilestones?: boolean;
    strictWorldRulePhysics?: boolean;
    strictCharacterLimitations?: boolean;
    forbiddenInventions?: string[];
  };
}

export class BibleEntropyGovernor {
  /**
   * Clamps and filters randomness so that stylistic variation NEVER violates Story Bible invariants.
   */
  public static governSensoryPalette(
    candidatePalette: string[],
    bible: ProjectBible,
    entropy?: StylisticEntropyConfig
  ): { governedPalette: string[]; clampedViolations: string[] } {
    const clampedViolations: string[] = [];
    const governedPalette: string[] = [];

    const isFantasyOrHistorical = bible.genre === 'FANTASY' || bible.genre === 'HISTORICAL';
    const forbiddenSciFiInFantasy = ['neon', 'circuit', 'cyber', 'laser', 'terminal', 'telemetry', 'datapad'];

    for (const item of candidatePalette) {
      const lower = item.toLowerCase();
      
      // Enforce World Rule / Physics Boundaries
      if (isFantasyOrHistorical && forbiddenSciFiInFantasy.some(kw => lower.includes(kw))) {
        clampedViolations.push(`Clamped anachronistic term '${item}' that violates ${bible.genre} world rules.`);
        governedPalette.push('ancient stone'); // Fallback to safe world anchor
        continue;
      }

      // Enforce user-defined forbidden inventions
      if (entropy?.governor?.forbiddenInventions && entropy.governor.forbiddenInventions.some(fi => lower.includes(fi.toLowerCase()))) {
        clampedViolations.push(`Clamped forbidden invention '${item}' by author governor.`);
        governedPalette.push('flickering flame');
        continue;
      }

      governedPalette.push(item);
    }

    return { governedPalette, clampedViolations };
  }
}

export class BibleSynthesizer {
  private static registeredBibles: Map<string, ProjectBible> = new Map();

  /**
   * Reference Exemplar 1: Layer 4 (Hard Sci-Fi)
   */
  public static getLayer4ReferenceBible(): ProjectBible {
    return {
      projectId: 'LAYER_4_PROJECT',
      title: 'Layer 4: Mnemosyne Protocol',
      genre: 'HARD_SCI_FI',
      premise: 'A former cognitive test subject awakes with fractured memories, pursued across synthetic dream strata while uncovering Project Mnemosyne.',
      characters: CANON_CHARACTERS,
      worldRules: [
        {
          category: 'COGNITIVE_STRATA',
          name: '4-Layer Neural Reality Lattice',
          description: 'Descent into deeper subconscious layers causes exponential synaptic heat and memory erosion.',
          constraints: ['Non-REM arrest above 80Hz', 'Sensory anchor required for Layer 4 emergence']
        }
      ],
      chapterMilestones: CHAPTER_MILESTONES,
      activePlants: [
        {
          id: 'PLANT_01_SUBJECT_ZERO_DOSSIER',
          introducedChapter: 1,
          propOrFact: 'Medication cart datapad stamped SUBJECT ZERO — COGNITIVE LAYER 4 CANDIDATE',
          intentDescription: 'Deliberately placed by Dr. Halloway to trigger Elias unprompted behavioral search vector.',
          status: 'ACTIVE_PLANT'
        }
      ]
    };
  }

  /**
   * Reference Exemplar 2: Hội An 1920 (Historical Fiction / Drama)
   */
  public static getHoiAn1920ExemplarBible(): ProjectBible {
    return {
      projectId: 'HOI_AN_1920',
      title: 'Bến Thuyền Thu Bồn (The Silken Quay of Hội An)',
      genre: 'HISTORICAL',
      premise: 'Thương nhân tơ lụa Trần Văn Hậu đối đầu với liên minh thương nhân ngoại quốc để bảo tồn bí mật phường dệt cổ truyền giữa biến động thời cuộc 1920.',
      characters: [
        {
          id: 'TRAN_VAN_HAU',
          name: 'Trần Văn Hậu',
          aliases: ['Hậu', 'Cậu Ba'],
          role: 'PROTAGONIST',
          coreGoal: 'Bảo vệ xưởng dệt lụa tơ tằm cổ truyền của gia tộc trước mưu đồ thôn tính của thương hội.',
          coreWound: 'Món nợ thuế của người cha quá cố đè nặng lên từng kiện hàng.',
          voiceStyle: 'Điềm tĩnh, quan sát tinh tường từng thớ vải, bước đi nặng trĩu trách nhiệm gia tộc.'
        },
        {
          id: 'NGUYEN_THI_MAI',
          name: 'Nguyễn Thị Mai',
          aliases: ['Mai'],
          role: 'LOVE_INTEREST_ALLY',
          coreGoal: 'Khôi phục phương pháp nhuộm chàm cổ truyền thất truyền.',
          coreWound: 'Mất mát xưởng nhuộm gia đình sau trận lũ lụt năm Thìn.',
          voiceStyle: 'Dứt khoát, am hiểu hương mộc, nhạy cảm với thời tiết và dòng nước sông.'
        }
      ],
      worldRules: [
        {
          category: 'HISTORICAL_SETTING',
          name: 'Thương cảng Hội An Thập niên 1920',
          description: 'Thời kỳ chuyển giao giữa thuyền buồm truyền thống và tàu hơi nước, áp lực thuế quan thuộc địa.',
          constraints: ['Không có thiết bị điện tử hay máy móc hiện đại', 'Giao dịch dựa trên khế ước giấy bản và chữ ký son']
        }
      ],
      chapterMilestones: [
        {
          chapterNumber: 1,
          title: 'ĐÊM NƯỚC LỚN TRÊN SÔNG THU BỒN',
          act: 'ACT_1',
          location: 'Bến thuyền Hội An & Nhà cổ Phố Hội',
          keyCharacters: ['Trần Văn Hậu'],
          requiredBeats: ['Hậu kiểm tra những kiện lụa cuối cùng trước cơn bão', 'Phát hiện con dấu niêm phong giả trên kiện hàng của thuyền buôn', 'Đối mặt với mưa rào và sóng cuộn trên bến sông'],
          requiredKeywords: ['bến thuyền', 'lụa', 'thu bồn', 'hương trầm', 'khế ước', 'mưa', 'đèn bão']
        }
      ],
      activePlants: [
        {
          id: 'PLANT_HOI_AN_FAKE_SEAL',
          introducedChapter: 1,
          propOrFact: 'Con dấu sáp đỏ mang ký hiệu hoa cúc kép trên kiện hàng tơ',
          intentDescription: 'Manh mối chỉ ra kẻ phản bội trong phường dệt ở Chương 5.',
          status: 'ACTIVE_PLANT'
        }
      ]
    };
  }

  /**
   * Reference Exemplar 3: Đà Lạt 1950 (Gothic Horror)
   */
  public static getDaLatGothicExemplarBible(): ProjectBible {
    return {
      projectId: 'DALAT_GOTHIC_1950',
      title: 'Biệt Điện Bạch Lan (The White Orchid Manor)',
      genre: 'GOTHIC_HORROR',
      premise: 'Một nữ gia sư trẻ đến nhận việc tại biệt điện cổ cô lập giữa rừng thông Đà Lạt, nơi tiếng đàn dương cầm vẫn vang lên vào nửa đêm dù phòng nhạc đã bị niêm phong hai mươi năm.',
      characters: [
        {
          id: 'LE_THU_VAN',
          name: 'Lê Thu Vân',
          aliases: ['Vân'],
          role: 'PROTAGONIST',
          coreGoal: 'Tìm ra sự thật về cái chết của người chị gái từng làm gia sư tại biệt điện.',
          coreWound: 'Nỗi ám ảnh về bức thư tuyệt mệnh đứt đoạn gửi trong đêm mưa gió.',
          voiceStyle: 'Căng thẳng, giác quan nhạy bén với bóng tối, âm thanh cót két và mùi ẩm mốc.'
        }
      ],
      worldRules: [
        {
          category: 'GOTHIC_ATMOSPHERE',
          name: 'Sương Mù và Dinh Thự Cô Lập',
          description: 'Sương mù dày đặc cắt đứt liên lạc với thị trấn sau 6 giờ tối; những cánh cửa tự khóa từ bên trong.',
          constraints: ['Ánh sáng dựa vào đèn dầu và lò sưởi củi thông', 'Bóng tối làm biến dạng nhận thức thời gian']
        }
      ],
      chapterMilestones: [
        {
          chapterNumber: 1,
          title: 'CHUYẾN XE CUỐI QUA ĐÈO SƯƠNG',
          act: 'ACT_1',
          location: 'Cổng sắt Biệt Điện Bạch Lan',
          keyCharacters: ['Lê Thu Vân'],
          requiredBeats: ['Vân bước xuống xe giữa rừng thông mịt mù sương', 'Cánh cổng sắt rỉ sét tự mở', 'Nghe thấy tiếng dương cầm vẳng lại từ tầng tháp'],
          requiredKeywords: ['sương mù', 'rừng thông', 'biệt điện', 'cổng sắt', 'rêu phong', 'dương cầm', 'đèn dầu']
        }
      ],
      activePlants: [
        {
          id: 'PLANT_DALAT_MUSIC_SHEET',
          introducedChapter: 1,
          propOrFact: 'Bản nhạc dương cầm ố vàng bị xé góc để trên bậc thềm cổng',
          intentDescription: 'Manh mối về bài hát ru của nữ chủ nhân quá cố ở Chương 4.',
          status: 'ACTIVE_PLANT'
        }
      ]
    };
  }

  /**
   * Verifies that no anachronistic or sci-fi lexical leakage contaminates historical/fantasy texts
   */
  public static verifyLexicalIsolation(text: string, genre: string): { clean: boolean; leaks: string[] } {
    const lower = text.toLowerCase();
    const leaks: string[] = [];

    const isNonSciFi = ['HISTORICAL', 'FANTASY', 'GOTHIC_HORROR', 'LITERARY'].includes(genre.toUpperCase());
    if (isNonSciFi) {
      const sciFiForbidden = ['coolant', 'neural', 'telemetry', 'datapad', 'quantum', 'synaptic', 'circuit', 'psi', 'megawatt', 'halloway', 'mnemosyne'];
      for (const word of sciFiForbidden) {
        if (new RegExp(`\\b${word}\\b`, 'i').test(lower)) {
          leaks.push(word);
        }
      }
    }

    return { clean: leaks.length === 0, leaks };
  }

  /**
   * Synthesizes a completely distinct, standalone ProjectBible tailored exclusively to the user's premise.
   * Completely isolated with ZERO cross-contamination from other projects.
   */
  public static synthesizeFromPremise(input: {
    projectId: string;
    title: string;
    genre: string;
    premise: string;
    rawCharacters?: Array<{ name: string; role: CharacterProfile['role']; goal: string; wound: string; voiceKeywords?: string[] }>;
    rawRules?: Array<{ category: string; name: string; description: string; constraints: string[] }>;
    chapterOutlines?: Array<{ chapterNumber: number; title: string; location: string; keyCharacters: string[]; beats: string[]; keywords: string[] }>;
    entropy?: StylisticEntropyConfig;
  }): ProjectBible {
    const characters: (CharacterProfile & { provenance?: FactProvenance })[] = [];

    const genreKey = input.genre.toUpperCase().replace(/[^A-Z0-9_]/g, '');
    const defaultSensory = GENRE_SENSORY_MATRICES[genreKey] || GENRE_SENSORY_MATRICES.GENERAL;

    if (input.rawCharacters && input.rawCharacters.length > 0) {
      for (const rc of input.rawCharacters) {
        const charId = rc.name.toUpperCase().replace(/[^A-Z0-9]/g, '_');
        characters.push({
          id: charId,
          name: rc.name,
          aliases: [rc.name.split(' ')[0]],
          role: rc.role,
          coreGoal: rc.goal,
          coreWound: rc.wound,
          voiceStyle: `${rc.name}'s distinctive voice: tailored for ${input.genre}, shaped by ${rc.wound}.`,
          provenance: 'AUTHOR_STATED'
        });

        // Register custom character profile dynamically
        const profile: POVProfile = {
          preferred: rc.voiceKeywords || defaultSensory.slice(0, 5),
          discouraged: ['suddenly', 'seemed to'],
          maxAvgSentenceLength: rc.role === 'PROTAGONIST' ? 22 : 18,
          description: `${rc.name} (${rc.role}) POV Lexical & Cadence Profile for ${input.title}`
        };
        VoicePolisher.registerPOVProfile(charId, profile);
      }
    } else {
      // Create a candidate protagonist marked strictly as CANON_PROPOSAL (NEVER silently promoted to confirmed canon)
      const defaultName = `${input.genre} Protagonist`;
      characters.push({
        id: 'PROTAGONIST',
        name: defaultName,
        aliases: ['Protagonist'],
        role: 'PROTAGONIST',
        coreGoal: `Overcome central conflict in ${input.title}.`,
        coreWound: 'Unresolved origin conflict.',
        voiceStyle: `Authentic ${input.genre} sensory perspective.`,
        provenance: 'CANON_PROPOSAL'
      });
    }

    const worldRules: WorldRule[] = (input.rawRules || []).map(r => ({
      ...r,
      provenance: 'AUTHOR_STATED'
    }));

    const chapterMilestones: ChapterMilestone[] = (input.chapterOutlines || []).map(co => ({
      chapterNumber: co.chapterNumber,
      title: co.title,
      act: co.chapterNumber <= 3 ? 'ACT_1' : co.chapterNumber <= 8 ? 'ACT_2A' : co.chapterNumber <= 13 ? 'ACT_2B' : 'ACT_3',
      location: co.location,
      keyCharacters: co.keyCharacters,
      requiredBeats: co.beats,
      requiredKeywords: co.keywords,
    }));

    const bible: ProjectBible = {
      projectId: input.projectId,
      title: input.title,
      genre: input.genre,
      premise: input.premise,
      characters,
      worldRules: input.rawRules || [],
      chapterMilestones,
      activePlants: []
    };

    this.registeredBibles.set(input.projectId, bible);
    return bible;
  }

  /**
   * Registers or updates an active story bible
   */
  public static registerBible(bible: ProjectBible): void {
    this.registeredBibles.set(bible.projectId, bible);
  }

  /**
   * Retrieves an existing ProjectBible. If not found, synthesizes a brand-new unique one (NO Layer 4 default).
   */
  public static getBible(projectId: string): ProjectBible {
    const existing = this.registeredBibles.get(projectId);
    if (existing) return existing;

    if (projectId === 'LAYER_4_PROJECT') {
      return this.getLayer4ReferenceBible();
    }

    // Auto-synthesize a standalone unique bible for this new project
    return this.synthesizeFromPremise({
      projectId,
      title: `Standalone Project ${projectId}`,
      genre: 'GENERAL',
      premise: `Original story premise for ${projectId}.`,
    });
  }

  /**
   * Records a confirmed author plant (foreshadowing / Chekhov's gun) into the Bible
   */
  public static recordPlant(projectId: string, plant: PlotHookPlant): void {
    const bible = this.getBible(projectId);
    const existingIndex = bible.activePlants.findIndex(p => p.id === plant.id);
    if (existingIndex >= 0) {
      bible.activePlants[existingIndex] = plant;
    } else {
      bible.activePlants.push(plant);
    }
  }
}
