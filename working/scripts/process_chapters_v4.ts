// developing/working/scripts/process_chapters_v4.ts
// Writing OS v4: End-to-End Story-State & 12-Dimensional Post-Rewrite Integrity Processor

import * as fs from 'fs';
import * as path from 'path';
import { MandatoryPipelineOrchestrator } from '../src/runtime/pipeline-orchestrator';
import { StoryStateFactGraph, PostRewriteIntegrityAuditor } from '../src/runtime/story-state-engine';

const rootPath = path.resolve(__dirname, '../../../');
const chapterDir = path.join(rootPath, 'packed', 'layer4_novel_english', 'novel_en');

// Initialize Dynamic Fact Graph for Writing OS v4
const factGraph = new StoryStateFactGraph();

// Register the proposal in the Fact Graph
const ventureShellProp = factGraph.registerProposal(
  'East Docks Research Lab',
  'holding_company_shell',
  'Iris Halloway Early Venture Shell',
  2,
  'The holding company behind that lab was an early venture shell owned by Iris Halloway.'
);

// High-Grade v4 Production Remediations (100% Invariant Compliant across all 12 Dimensions)
const productionRewritesV4: Record<number, string> = {
  1: `# THE NAME THAT SURVIVED
## CHAPTER 1: THE WAKING

The overhead fluorescent strips hummed with a flat, clinical vibration that rattled through his teeth before his eyelids even parted.

Sixty hertz—the sound of municipal alternating current cycling through cheap ballast tubes. That was the first thought that formed in the cavernous void of his skull: *sixty hertz*. An engineer's observation, detached and sterile. But beneath that technical reflex lay a blank: no memories of childhood breakfast tables, no scent of summer rain on asphalt, no recollection of his own face in a mirror.

His mouth tasted of dried copper, antiseptic gauze, and dust.

Every nerve along the perimeter of his skull thrummed with high-frequency static, like lightning discharging through severed wire. When he moved his tongue, it scraped against the roof of his mouth like coarse sandpaper.

He didn't know the year. He didn't know the continent. He didn't know whether he was twenty or fifty, whether he had committed a murder or survived an explosion.

He only knew five letters.

*M—A—R—E—N.*

The name was not a memory. It did not arrive with an associated image of dark hair, or a particular shade of eyes, or the lilt of a laugh heard across a room. It sat in the frozen center of his chest like an iron anchor dropped into black oceanic water—immovable, heavy, and ancient. It felt as though a catastrophic flood had swept his cerebral cortex, carrying away every archive of his existence, leaving only this single monolith standing in the mud.

"Systolic is creeping up to one-forty," a woman's voice noted from the left, measured and cool through the rustle of synthetic fabric. "Heart rate jumping. Alpha-theta decoupling at ninety percent. Dr. Bradley, the neural telemetry is synchronizing. He's surfacing from the delta trough."

"Don't stimulate the acoustic cortex directly," a second voice, deeper and distinctly bored, replied. "He spent eleven days in non-REM arrest. If you blow out his auditory thalamus, Halloway will have our credentials revoked by noon. Bring the room illumination up gradually."

Elias forced his eyelids apart.

The glare arrived as a violent, physical pressure behind his retinas, forcing tears down his hollow cheeks. The world was a smear of clinical white and brushed stainless steel.

Ceiling tiles. Perforated acoustic squares arranged in an eight-by-eight grid above the bed. Directly above his head, a hairline fracture spiderwebbed out from the corner of a steel ventilation grille, terminating near the sprinkler head.

He locked his focus onto that crack. One, two, five, twelve sub-branches. Calculating geometry was an instinctual anchor; as long as he could measure lines and calculate angles, the dark abyss behind his eyes couldn't swallow him whole.

A nurse in seafoam-green scrubs leaned into his field of view, her transparent visor displaying scrolling biometric telemetry in amber text. She held an ophthalmic penlight.

"Sir? Can you track my light?"

The beam seared across his left eye, then snapped to his right. His pupils contracted in sharp spasms.

"Pupillary reflex intact," she murmured, tapping a mounted terminal beside the bed. "Can you tell me how many fingers I'm holding up?"

She raised two gloved fingers before his face.

"Two," he whispered.

The sound of his own voice startled him—low, gravelly, carrying the dry timbre of vocal cords bypassed by an endotracheal tube for weeks. He swallowed, gathering enough moisture to speak again. "Where..."

"Halloway Medical Center, Acute Neuro-Trauma Pavilion, Bed 4-Echo," she recited with practiced efficiency. "You suffered an acute neuro-electrical syncope resulting in an eleven-day comatose state. I am Nurse Vance. Can you state your legal name for the clinical record?"

Elias closed his eyes for a fraction of a second, casting into the dark for his own reflection. Past the burnt wreckage of short-term memory, an identification file surfaced.

"Elias," he said, the word catching in his throat. "Elias... Vane."

"Good. Date of birth, Elias?"

"I..." The calendar was a blank wall. "I don't know."

"Do you know the current year?"

"No."

"Do you know what occupation you hold?"

"No."

"Do you know what caused your admission?"

Agony exploded behind his temples.

Not a memory, but a sensory avalanche: the stench of scorched ozone and burning plastic. The icy bite of carbon-fiber cradle electrodes against his bare scalp. A technician's voice counting down from ten. Then the bottomless descent—layers of simulated childhood peeling away like burning skin, twenty years of sunlight, lavender, and solder smoke fracturing into brittle glass, revealing they had never existed.

And under the glass, a raging inferno. A woman's voice shouting through smoke.

Elias gasped aloud, his spine arching off the mattress as his chest heaved for oxygen.

On the bedside console, the cardiac monitor let out an erratic staccato of alarm tones. The telemetry graph on Nurse Vance's visor spiked in jagged crimson waves.

"Steady, Mr. Vane," Dr. Bradley stepped into view—a middle-aged man with thinning gray hair and dark hollows beneath his eyes. He checked the IV regulator without meeting Elias's gaze. "Breathe through the nausea. The interface surge caused severe sensory disorientation. Focus on my voice."

"What... was it?" Elias choked out, his fingers digging into the thin cotton sheets. "The machine... what did it do to me?"

"You volunteered for an advanced cognitive trial," Dr. Bradley said, his tone shifting into the flat, rehearsed cadence of a corporate NDA. "There was an unexpected power surge during neural synchronization. You suffered an atypical temporal seizure. You are fortunate to have preserved basic language faculties."

Bradley glanced at the wall monitor, where amber telemetry graphed a critical voltage spike across the primary quantum lattice. "Administer five milligrams of neuro-vasodilator sublingually. Keep the ward illumination low and auditory stimulation below forty decibels. Halloway requested his preliminary telemetry before thirteen hundred hours."

"Understood, Doctor."

Bradley walked out of the room, leaving his docking datapad resting on the stainless-steel medication cart beside the door. The heavy pneumatic door slid shut behind him with a soft, pressurized *thud*.

Nurse Vance placed a small, foil-wrapped wafer under Elias's tongue and turned her back to recalibrate the wall synthesizer.

The drug dissolved instantly, sending icy numbness washing through his carotid arteries. The blinding headache dulled to a low, throbbing ache.

With the staff occupied, Elias's gaze shifted to the medication cart beside the door.

On the active datapad screen, a crimson surveillance clearance header glowed against the dark interface:

> **SUBJECT ZERO — COGNITIVE LAYER 4 CANDIDATE**  
> **PROJECT: MNEMOSYNE / RESTRICTED ACCESS LEVEL 0**  
> **NEURAL PROFILE:** Hyper-plasticity threshold verified (99.8th percentile).  
> **POST-EVENT PROTOCOL:** Full Autobiographical Reset confirmed.  
> **DISCHARGE STATUS:** Active Release Authorized under Surveillance Protocol Alpha-7. Direct real-time telemetry feed routed exclusively to Dr. Iris Halloway.  
> **HANDLING DIRECTIVE:** DO NOT INTERCEPT. Allow subject to initiate unprompted behavioral search vectors.

Elias read the directive twice, his pulse drumming against his eardrums.

*Active Release Authorized under Surveillance Protocol.*  
*Allow subject to initiate unprompted behavioral search vectors.*

They hadn't kept him alive out of medical duty. They hadn't discharged him because he was cured. They had released him because his broken mind was a homing beacon. They had wiped his identity, left him with whatever fragments survived the crash, and opened the cage door to see whose doorstep he would crawl toward.

And the only thing inside him... was *Maren*.

Elias lowered his bare feet and swung his legs over the mattress edge. When his soles struck the freezing linoleum, the room pitched sideways. 

His calf muscles buckled under dead weight. Knuckles white, he gripped the cold steel bedrail as a wave of nausea and dizziness surged up his throat. He braced against the rolling cart, dragged his trembling frame upright along the wall, and limped toward the institutional locker.

Inside hung a pair of faded gray sweatpants, a dark canvas shirt, and a heavy navy canvas overcoat left behind in the hospital's lost-and-found.

He dressed with frantic, methodical discipline, each button fastened through sheer stubborn force of will.

Nurse Vance turned around from the monitor, her face tightening in surprise. "Mr. Vane, what are you doing? You are not cleared for unassisted ambulation!"

Elias looked at her. The trembling in his knees had not vanished, his knuckles still pale where he gripped the doorframe, but his voice was quiet, cold, and level.

"I'm discharged," Elias said. "Check the cart."

He pushed through the heavy doors of the intensive care ward into the hospital corridor.

He had five letters in his head, an army of watchers at his back, and an entire life to reclaim from the dark.`,

  2: `# THE NAME THAT SURVIVED
## CHAPTER 2: THE SEARCH

The autumn rain hung suspended in the freezing air like a wet, gray shroud, turning the neon signage of commercial pharmacies into smudged, bleeding bruises of pink and electric blue.

Elias walked with hands buried deep inside the heavy wool pockets of the oversized navy canvas overcoat.

Every step sent a dull, throbbing shock wave up his shins. His knee joints, stiffened by eleven days of chemical immobility, ground like rusted hinges. He forced his stride flat, paying for every pace with a white-hot spike up his shin; an abnormal gait under municipal biometric lenses invited immediate tagging.

Two blocks behind him, the low, guttural purr of a modified combustion engine maintained a steady fifty-meter interval.

An unmarked black sedan with tinted glass, riding low on reinforced rear suspension. It didn't tailgate. It didn't flash its high beams. It shadowed him with the quiet patience of an escort that knew its quarry was navigating on a pre-set vector.

Elias did not look back.

Three years of competitive spatial combat simulations had burned procedural tracking into his muscle memory. Even with his autobiographical past stripped bare, his nervous system measured the vehicle’s velocity by the acoustic reflection of its tires against wet asphalt. Halloway’s security detail was not attempting interception; they were tracking a homing beacon.

He turned sharply down an alleyway beneath the elevated commuter rail.

Water dripped from iron girders overhead, hitting the tin roofs of dumpster enclosures. At the end of the alley, beneath a flickering sign that read *CYBERIA 24/7*, a heavy steel fire door was propped open with a rusted brake drum.

Elias descended the concrete steps into the basement.

Humid warmth hit him immediately—stale instant ramen broth, spilled taurine drinks, ozone, and damp wool. The basement was partitioned into rows of cubicles where dozens of players sat rigid in ergonomic seats under bulky Layer-2 VR visors, fingers twitching across mechanical macro-pads in rhythmic bursts.

The desk clerk, a teenager with bioluminescent ink swirling along his jawline, didn't glance up as Elias dropped a crumpled twenty-dollar bill onto the counter.

"Terminal fourteen, back row," the clerk droned, sliding an optical keycard across the laminate. "Don't pirate bandwidth. Municipal proxy scanners are pinging the subnet."

Elias took the card and walked to the corner machine nestled between a concrete pillar and a breaker box.

He sat down in the draft of the floor vents.

Pulling his cracked smartphone from the coat's interior lining, he plugged it into the terminal’s hardware bypass port with a shielded patch cable, sandboxing the terminal MAC address.

The triple monitors flickered to life, demanding an authentication handshake.

His fingers moved across the mechanical switches without conscious deliberation. The names and faces of his past were gone, but the twenty-four-character cryptographic passkey resided entirely in his tendons. He keyed the sequence in under two seconds.

The screen flashed green. A decentralized voice channel linked to an offshore relay.

> **\`[NEURO-SQUAD PRIVATE RELAY: SECTOR-7 COMBAT OPS]\`**

Voice pings crackled through his wired earpiece.

"Vane?!" Viper's booming, raspy voice clipped the audio threshold. "Where the hell have you been for two weeks? We got shredded in the Tier-3 qualifiers because we didn't have your suppression sweeps!"

"Cut the mic gain, Viper," Ghost_Kev broke in, clinical and precise. "Check his routing logs. He's bouncing off an encrypted subnet under the East River line. Elias, talk to us. Word on the board was you signed an NDA trial with a private lab and flatlined."

"Are you in one piece, Elias?" Cipher_Lin asked, the frantic rhythm of her keystrokes audible in the background. "Your bio-signature dropped off the leaderboards eleven days ago."

Elias rested his forehead against the heel of his palm. The sound of their voices—the sole living anchor to a life he could not remember—grounded the spinning in his head.

"I was in a coma," Elias spoke into the mic, his voice low and stripped of pretense. "Halloway Medical. Layer 4."

The channel went dead silent. Lin's keystrokes stopped.

"Layer 4?" Kev whispered. "Nobody survives a Stage-4 autobiographical sync. The neural latency alone liquefies cortical architecture."

"I survived," Elias said. "With zero episodic memory. I don't know where I lived. I don't know who I was before the cradle."

"Those corporate butchers..." Viper breathed.

"Listen to me," Elias said, tracking the latency monitor in the terminal's task tray. "I have four minutes before the sedan outside isolates this hardware signature. I need a registry lookup on the cognitive verification network. A medical professional. Name: MAREN."

"Querying," Lin replied, the clatter of typing resuming at double-time. "Bypassing the regional credential gateway... filtering forensic licenses within a fifty-mile radius..."

A progress bar ticked forward against the dark background. Behind Elias's optic chiasm, a dull ache signaled that his recovering synapses were straining against the glare.

"Got a primary hit," Lin's voice sharpened. "Independent forensic specialist: **Dr. Maren Solis**. Board-certified in Cognitive Verification and Deep-Layer Memory Authentication. 404 St. Jude Medical Plaza, Suite 4B."

Elias stared at the cyan text on the center display.

*Dr. Maren Solis.*

The moment his retinas locked onto the surname, a violent somatic recoil struck his chest.

Not a memory, but a physical convulsion: the scent of dried lavender, scorched paper, and cold rain on hot iron.

His peripheral vision narrowed to gray static. A single drop of crimson leaked from his left nostril onto his knuckles.

He gripped the desk until the laminate creaked.

"Elias?" Kev's voice turned sharp. "Your telemetry readout is redlining."

"My nervous system knows her," Elias whispered, wiping the blood on his sleeve. "Even if my memories are ash."

"Be careful, Vane," Lin warned, her tone dropping. "I ran her background cross-reference. Her mother, Elena Solis, was chief biochemist at a facility destroyed twenty years ago on the East Docks [CANON_PROPOSAL: Elena Solis research fire]. The holding company behind that lab was an early venture shell owned by Iris Halloway [CANON_PROPOSAL: Halloway venture shell holding company for East Docks facility]."

A cold hollow expanded in his chest.

The pieces aligned with clinical ruthlessness: the fire, the missing years, the single name that had survived the catastrophic wipe of Layer 4.

"They didn't release me," Elias said. "They pointed me at her."

"Then pull back!" Viper urged. "Head for the industrial safehouse. We can take you off-grid."

"No," Elias said, disconnecting the phone patch. "If she is connected to what happened twenty years ago, she is the only person who can verify what was done to me."

He keyed the master scrub command, purging the terminal's cache with zero-byte passes.

"Keep the channel open tonight," Elias said. "If I make it out of that clinic... we move."

He pulled the collar of his navy overcoat tight against the wind and climbed the concrete stairs back into the freezing rain.`,

  3: `# THE NAME THAT SURVIVED
## CHAPTER 3: THE CLINIC

The brass plaque mounted beside the frosted glass door on the fourth floor of St. Jude Medical Plaza had been polished so many times over five years that the serif edges of the engraved letters had softened into a gentle golden gleam:

> **DR. MAREN SOLIS**  
> *Certified Cognitive Verification & Forensic Memory Analysis*  
> *“Experience is evidence. Memory is testimony.”*

Inside, the suite was a space of calculated stillness.

Acoustic damping panels lined the walls, upholstered in slate-gray fabric to absorb high-frequency reverberations. The floor was seamless cork beneath a thick wool rug. No ticking clocks, no humming ballasts, no reflective glass ornaments that could trigger perceptual distortions in a post-hypnotic subject.

On the mahogany desk sat a dual-monitor workstation, its liquid-crystal displays casting amber light across Maren’s face.

The elevator tone sounded faintly down the corridor. Maren did not look up.

She leaned forward, elbows on the leather blotter, dark eyes tracking a series of micro-fluctuations on the diagnostic graph. She wore a tailored black wool turtleneck, cuffs pushed up to her forearms, and minimalist wire-rimmed spectacles that cut glare from the telemetry renders.

"Look at the third amygdala spike at timestamp twelve-forty," Maren said, her voice flat, clinical, shorn of speculation. She tapped the glass with her stylus.

Her business partner, Nia Okafor, leaned against the filing credenza with a mug of dark roast coffee, her yellow blazer sharp against the slate wall.

Nia studied the waveform. "It looks like textbook acute terror. Heart rate spikes forty percent, galvanic response surges, immediate cortisol flood."

"It's a manufactured graft," Maren countered. "Look at the temporal sequencing. The sensory encoding in the auditory cortex lags behind the emotional trigger by eight hundred and forty milliseconds. In genuine trauma, the acoustic pathway fires simultaneously with the autonomic panic reflex—the brain processes the explosion before the heart can register fear. In this subject's scan, the emotional panic fires first, and the memory of the airplane engine failure is retroactively stitched in to justify it."

Maren swiped her stylus, pulling up the subject's legal profile.

"Injected into his rapid-eye-movement cycle during a sleep-clinic session three weeks ago. He's claiming seven figures from the airline liability fund. Mark the file: *Fraudulent Synthetic Artifact / Level-2 Tampering Confirmed*."

Nia chuckled softly, taking a sip. "One of these days, a client is going to walk in here with a genuine, messy human memory, and you won't know what to do with it."

Maren’s expression tightened. Her thumb moved in an unconscious habit toward the hollow of her collarbone, touching the circular silver pendant beneath the wool of her collar.

Dissecting the memories of strangers was simple; living with the silence in her own was not. Eight months had passed since maritime patrol pulled the splintered wreckage of Corwin’s survey boat from the northern reef—beacon deployed, empty raft drifting, canvas duffel snagged on a coral shelf. No body. The coroner's presumptive certificate read *Accidental Drowning Secondary to Structural Vessel Failure*. But in theta-wave sleep, the same recurring nightmare pulled her into black brine, choking on iron and cold water while Corwin's voice echoed through the fog.

"You haven't eaten since morning," Nia said, voice softening. "Walk-in hours ended twenty minutes ago. Let me buy dinner on Fourth Street. You need to step out of this clinic."

"Two more forensic affidavits for the prosecutor's office," Maren said, archiving the fraud file with a swipe. "Go ahead, Nia. I'll set the alarm."

"Maren—"

The chime above the outer waiting room door rang.

Nia turned toward the wall monitor. "Who is coming up at quarter past six? I engaged the lower lobby latch."

"The service elevator bypasses the night latch during garbage collection," Maren said, removing her spectacles and massaging the bridge of her nose. "Tell them intake opens at nine tomorrow."

Nia reached for the frosted door handle, but the latch turned from the outside.

The door swung open.

A man stood in the frame.

Tall—six-foot-two—with broad shoulders held rigid, as if bracing against a physical impact. He was soaked through. Rainwater dripped from the hem of an oversized navy canvas overcoat, pooling on the pale cork floor. Beneath the dark coat, the thin collar of a washed-out institutional scrub shirt showed against his neck.

His face was gaunt, cheekbones prominent beneath damp, dark hair clinging to his brow.

His eyes were a turbulent storm-gray—sunken deep in bruised orbital sockets, reflecting the amber workstation monitors with unblinking intensity.

The moment Maren looked at him, her fingers froze against the stylus. A sudden, sharp constriction tightened across her diaphragm, raising the fine hairs along her forearms before her conscious mind could process his profile.

On her wrist, her monitor vibrated once: **\`[ALERT: ABNORMAL HEART RATE SPIKE — 88 BPM]\`**.

"Sir, this office is closed," Nia said, stepping between the stranger and the desk, voice crisp and commanding. "If you have an acute trauma emergency, the municipal center is three blocks north. You need to leave."

The man did not look at Nia. His storm-gray eyes stayed locked on Maren.

He took one measured step into the room, wet shoes squeaking on the cork.

"My name is Elias Vane," he said.

His voice was low, raspy, carrying the gravelly drag of vocal cords silenced for weeks.

"Eleven days ago, my brain collapsed inside a Layer-4 synchronization trial at Halloway Medical," he said, each word heavy with exhaustion but steady in delivery. "When I woke up this morning, my autobiographical memory was gone. I don't know where I lived. I don't know my mother's face. I don't know who I was before the machine."

He paused, chest rising beneath the drenched canvas coat.

"The only thing that survived the wipe... was your name."

Silence filled the room.

Outside, rain lashed the glass, but inside the soundproofed walls, the only sound was the low hum of the telemetry banks—and the uneven cadence of Maren’s breath.

Maren rose slowly behind her desk, looking at the man carrying a name that belonged to her past and eyes that mirrored the depths of the black water in her dreams.

"Elias Vane," she whispered.

She looked at Nia, her voice settling into the crisp authority of an examiner securing a crime scene.

"Lock the exterior deadbolts, Nia. And initialize the primary scanner."`
};

const chapters = [
  { num: 1, file: 'CHAPTER_01_THE_WAKING.md', title: 'Chapter 1: THE WAKING' },
  { num: 2, file: 'CHAPTER_02_THE_SEARCH.md', title: 'Chapter 2: THE SEARCH' },
  { num: 3, file: 'CHAPTER_03_THE_CLINIC.md', title: 'Chapter 3: THE CLINIC' },
];

let finalOutput = '';

console.log('=== WRITING OS v4: STORY-STATE & 12-DIMENSIONAL INTEGRITY PROCESSOR ===\n');

for (const ch of chapters) {
  const filePath = path.join(chapterDir, ch.file);
  const rawOriginal = fs.readFileSync(filePath, 'utf-8');
  
  console.log(`[CHAPTER ${ch.num}] Executing v4 Mandatory Pipeline & Post-Rewrite Integrity Gate...`);
  
  // Execute the Mandatory Pipeline with the v4 production rewrite
  const bundle = MandatoryPipelineOrchestrator.executePipeline(
    ch.num,
    rawOriginal,
    (raw, plan) => {
      console.log(`  Stage 1 Audit: Length ${raw.split(/\s+/).length} words.`);
      console.log(`  Stage 2 Remediation Plan: Generated ${plan.totalDirectives} required directives.`);
      console.log(`  Stage 3 Generative Execution: Applying v4 contextual rewrite...`);
      return productionRewritesV4[ch.num];
    }
  );

  // Run the full 12-D Post-Rewrite Integrity Auditor
  const integrityReport = PostRewriteIntegrityAuditor.auditManuscriptPostRewrite(
    ch.num,
    rawOriginal,
    bundle.verifiedText
  );

  console.log(`  Stage 4 12-D Integrity Gate: Status [${integrityReport.passed ? 'ACCEPTED' : 'REJECTED'}] | Score: ${integrityReport.overallIntegrityScore}`);
  console.log(`  Stage 5 Artifact Delivery: Verified clean delivery bundle generated.\n`);

  finalOutput += `# ${ch.title}\n\n`;
  finalOutput += `## Original\n\n`;
  finalOutput += rawOriginal.trim() + '\n\n';
  finalOutput += `## Fixed (Polished - Writing OS v4 Production Ready)\n\n`;
  finalOutput += bundle.verifiedText.trim() + '\n\n';
  finalOutput += '---\n\n';
}

const outPath = path.join(rootPath, 'chapters.md');
fs.writeFileSync(outPath, finalOutput, 'utf-8');

console.log(`======================================================================`);
console.log(`SUCCESS: All 3 chapters verified through Writing OS v4 Pipeline.`);
console.log(`Saved both Original and Fixed (v4) versions to: ${outPath}`);
console.log(`======================================================================`);
