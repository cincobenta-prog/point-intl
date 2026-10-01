import {
  NarrativePillarMeta,
  RelationshipCategory,
  TributeQuestionPrompt,
  DigitalTributeItem,
  CoffeeTableBookCompilation,
  CloudStorageRetentionTelemetry,
  FriendTributeInvitation
} from '../types/digitalTribute';

export const NARRATIVE_PILLARS: Record<string, NarrativePillarMeta> = {
  joy: {
    id: 'joy',
    label: 'Joy & Laughter',
    icon: '✨',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-300',
    description: 'Inside jokes, Sunday dinner laughter, hilarious adventures, and warmth'
  },
  pain: {
    id: 'pain',
    label: 'Pain & Resilience',
    icon: '🛡️',
    badgeBg: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    badgeText: 'text-indigo-800',
    badgeBorder: 'border-indigo-300',
    description: 'Valleys walked through together, quiet bravery, storms weathered, and endurance'
  },
  help: {
    id: 'help',
    label: 'Help & Sacrifice',
    icon: '🤝',
    badgeBg: 'bg-teal-100 text-teal-900 border-teal-300',
    badgeText: 'text-teal-800',
    badgeBorder: 'border-teal-300',
    description: 'Unspoken sacrifices, turning points, hands lent in need, and wisdom shared'
  },
  action: {
    id: 'action',
    label: 'Witnessing in Action',
    icon: '👁️',
    badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
    badgeText: 'text-purple-800',
    badgeBorder: 'border-purple-300',
    description: 'Living out principles, quiet integrity, defending others, and permanent legacy'
  }
};

export const RELATIONSHIP_CATEGORIES: RelationshipCategory[] = [
  // Immediate Family
  { id: 'spouse_partner', label: 'Spouse or Life Partner', sub: 'Spouses, partners, and soulmates', group: 'Immediate Family', icon: '💍' },
  { id: 'mother', label: 'Mother', sub: 'Matriarchs, mothers, and maternal figures', group: 'Immediate Family', icon: '🌸' },
  { id: 'father', label: 'Father', sub: 'Patriarchs, fathers, and paternal figures', group: 'Immediate Family', icon: '🌲' },
  { id: 'son', label: 'Son', sub: 'Sons, stepsons, and foster sons', group: 'Immediate Family', icon: '🌟' },
  { id: 'daughter', label: 'Daughter', sub: 'Daughters, stepdaughters, and foster daughters', group: 'Immediate Family', icon: '🌿' },
  { id: 'brother', label: 'Brother', sub: 'Brothers and stepbrothers', group: 'Immediate Family', icon: '🛡️' },
  { id: 'sister', label: 'Sister', sub: 'Sisters and stepsisters', group: 'Immediate Family', icon: '🕊️' },
  { id: 'grandfather', label: 'Grandfather', sub: 'Grandfathers and great-grandfathers', group: 'Immediate Family', icon: '👴' },
  { id: 'grandmother', label: 'Grandmother', sub: 'Grandmothers and great-grandmothers', group: 'Immediate Family', icon: '👵' },

  // Extended & In-Laws
  { id: 'in_law', label: 'In-Law & Extended Relative', sub: 'Sons/daughters-in-law, cousins, aunts & uncles', group: 'Extended & In-Laws', icon: '🏡' },
  { id: 'chosen_family', label: 'Chosen Family & Godparent', sub: 'Unbreakable bonds beyond bloodlines', group: 'Extended & In-Laws', icon: '💖' },

  // Friends & Early Years
  { id: 'childhood_friend', label: 'Childhood & Schoolyard Friend', sub: 'Growing up together, secret adventures & roots', group: 'Friends & Early Years', icon: '🚲' },
  { id: 'college_school_friend', label: 'College & Formative Friend', sub: 'Late night talks, road trips & young adulthood', group: 'Friends & Early Years', icon: '🎓' },
  { id: 'lifelong_friend', label: 'Lifelong Confidant & Close Friend', sub: 'Decades of shared seasons, loyalty & front porch talks', group: 'Friends & Early Years', icon: '☕' },
  { id: 'travel_hobby_friend', label: 'Travel & Passion Companion', sub: 'Expeditions, arts, gardening, sports & shared craft', group: 'Friends & Early Years', icon: '🧭' },

  // Mentors & Colleagues
  { id: 'work_colleague_friend', label: 'Work Colleague & Professional Ally', sub: 'In the trenches, career mentorship & workplace integrity', group: 'Mentors & Colleagues', icon: '💼' },
  { id: 'mentee_student', label: 'Mentee or Student', sub: 'Those they guided, taught, and elevated in life', group: 'Mentors & Colleagues', icon: '🌱' },
  { id: 'mentor_teacher', label: 'Teacher, Mentor & Guide', sub: 'Educators and elders who shaped their worldview', group: 'Mentors & Colleagues', icon: '📖' },

  // Community & Faith
  { id: 'community_faith_member', label: 'Church & Faith Community', sub: 'Congregations, choir members, prayer circles & ministry', group: 'Community & Faith', icon: '⛪' },
  { id: 'neighbor', label: 'Neighbor & Block Resident', sub: 'Porch lights, sidewalk conversations & street watch', group: 'Community & Faith', icon: '🏘️' },
  { id: 'admirer_acquaintance', label: 'Community Admirer & Citizen', sub: 'Witnessing their presence, civic grace & public impact', group: 'Community & Faith', icon: '🏛️' }
];

export const CURATED_QUESTION_BANK: TributeQuestionPrompt[] = [
  // ==================== 1. SPOUSE / PARTNER ====================
  {
    id: 'q-sp-1',
    relationshipType: 'spouse_partner',
    questionText: 'What was the exact moment or ordinary Tuesday when you realized, "This is the person I want to walk through the rest of my life with"?',
    followUpPrompt: 'What was it about the way they looked at you or treated you that made you completely certain?',
    pillar: 'joy',
    pillarLabel: 'Joy & Laughter',
    sortOrder: 1
  },
  {
    id: 'q-sp-2',
    relationshipType: 'spouse_partner',
    questionText: 'What was a quiet, private ritual of love they did every single day that you already miss so deeply?',
    followUpPrompt: 'How did that daily habit anchor your home and marriage across all those years?',
    pillar: 'help',
    pillarLabel: 'Help & Sacrifice',
    sortOrder: 2
  },
  {
    id: 'q-sp-3',
    relationshipType: 'spouse_partner',
    questionText: 'Describe the darkest valley you walked through together and how they held your hand through the storm.',
    followUpPrompt: 'What did their devotion in that difficult season reveal about the depth of their soul?',
    pillar: 'pain',
    pillarLabel: 'Pain & Resilience',
    sortOrder: 3
  },
  {
    id: 'q-sp-4',
    relationshipType: 'spouse_partner',
    questionText: 'What was your private shorthand, inside joke, or unspoken look across a crowded room?',
    followUpPrompt: 'What memory of laughing together in the middle of the night still brings warmth to your chest?',
    pillar: 'joy',
    pillarLabel: 'Joy & Laughter',
    sortOrder: 4
  },
  {
    id: 'q-sp-5',
    relationshipType: 'spouse_partner',
    questionText: 'If you could whisper one final promise into their ear for eternity, what would you promise them?',
    followUpPrompt: 'How will their love continue to guide your footsteps forward every single day?',
    pillar: 'action',
    pillarLabel: 'Witnessing in Action',
    sortOrder: 5
  },

  // ==================== 2. MOTHER ====================
  {
    id: 'q-mo-1',
    relationshipType: 'mother',
    questionText: 'What is a scent, sound, or ritual from your mother\'s kitchen or home that will always bring her right back to you?',
    followUpPrompt: 'What was the secret ingredient of love she poured into those moments that made you feel completely safe?',
    pillar: 'joy',
    pillarLabel: 'Joy & Laughter',
    sortOrder: 1
  },
  {
    id: 'q-mo-2',
    relationshipType: 'mother',
    questionText: 'Describe a sacrifice she made for you that you were too young to understand until you got older.',
    followUpPrompt: 'When did the realization hit you of just how much courage was behind that decision?',
    pillar: 'help',
    pillarLabel: 'Help & Sacrifice',
    sortOrder: 2
  },
  {
    id: 'q-mo-3',
    relationshipType: 'mother',
    questionText: 'What was a moment your mother held you together when your world felt like it was breaking apart?',
    followUpPrompt: 'What words or quiet touch of hers gave you the strength to stand back up?',
    pillar: 'pain',
    pillarLabel: 'Pain & Resilience',
    sortOrder: 3
  },
  {
    id: 'q-mo-4',
    relationshipType: 'mother',
    questionText: 'What was something uniquely hilarious or fierce about her personality that only the family truly knew?',
    followUpPrompt: 'What story captures that fire or humor better than anything else?',
    pillar: 'joy',
    pillarLabel: 'Joy & Laughter',
    sortOrder: 4
  },
  {
    id: 'q-mo-5',
    relationshipType: 'mother',
    questionText: 'What value of hers do you most hope lives on through your children and future generations?',
    followUpPrompt: 'How do you plan to keep that flame burning brightly in her honor?',
    pillar: 'action',
    pillarLabel: 'Witnessing in Action',
    sortOrder: 5
  },

  // ==================== 3. FATHER ====================
  {
    id: 'q-fa-1',
    relationshipType: 'father',
    questionText: 'What is a signature piece of advice from him that you still find yourself repeating to this day?',
    followUpPrompt: 'What was the exact situation where he first gave you that counsel?',
    pillar: 'help',
    pillarLabel: 'Help & Sacrifice',
    sortOrder: 1
  },
  {
    id: 'q-fa-2',
    relationshipType: 'father',
    questionText: 'Describe a moment he showed up for you when it mattered most, without question or hesitation.',
    followUpPrompt: 'How did his presence make you feel like everything was going to be alright?',
    pillar: 'action',
    pillarLabel: 'Witnessing in Action',
    sortOrder: 2
  },
  {
    id: 'q-fa-3',
    relationshipType: 'father',
    questionText: 'What did he teach you, without ever saying a single word out loud, just by how he lived his everyday life?',
    followUpPrompt: 'How did watching his quiet integrity shape your standard for manhood and honor?',
    pillar: 'pain',
    pillarLabel: 'Pain & Resilience',
    sortOrder: 3
  },
  {
    id: 'q-fa-4',
    relationshipType: 'father',
    questionText: 'What is a story about him that always makes the whole room erupt in laughter?',
    followUpPrompt: 'What was his signature grin or response whenever that story was told?',
    pillar: 'joy',
    pillarLabel: 'Joy & Laughter',
    sortOrder: 4
  },
  {
    id: 'q-fa-5',
    relationshipType: 'father',
    questionText: 'What do you want his grandchildren, great-grandchildren, or future generations to know about him?',
    followUpPrompt: 'What part of his spirit will never fade as long as this family endures?',
    pillar: 'action',
    pillarLabel: 'Witnessing in Action',
    sortOrder: 5
  },

  // ==================== 4. SON ====================
  {
    id: 'q-son-1',
    relationshipType: 'son',
    questionText: 'What was a moment your son stood up for what was right in a way that made your heart swell with pride?',
    followUpPrompt: 'What did that moment tell you about the man he had grown into?',
    pillar: 'action',
    pillarLabel: 'Witnessing in Action',
    sortOrder: 1
  },
  {
    id: 'q-son-2',
    relationshipType: 'son',
    questionText: 'What was an adventure or passion of his that he threw his whole entire heart into?',
    followUpPrompt: 'How did his enthusiasm light up everyone lucky enough to be in his orbit?',
    pillar: 'joy',
    pillarLabel: 'Joy & Laughter',
    sortOrder: 2
  },
  {
    id: 'q-son-3',
    relationshipType: 'son',
    questionText: 'What was a time he surprised you with his tenderness or generosity toward someone who was hurting?',
    followUpPrompt: 'What does that story reveal about the true size of his heart?',
    pillar: 'help',
    pillarLabel: 'Help & Sacrifice',
    sortOrder: 3
  },
  {
    id: 'q-son-4',
    relationshipType: 'son',
    questionText: 'What difficult challenge or hardship did you watch him face with quiet bravery?',
    followUpPrompt: 'What did he teach you about courage while fighting that battle?',
    pillar: 'pain',
    pillarLabel: 'Pain & Resilience',
    sortOrder: 4
  },

  // ==================== 5. DAUGHTER ====================
  {
    id: 'q-da-1',
    relationshipType: 'daughter',
    questionText: 'What was a moment your daughter showed a radiant, fierce kindness that took your breath away?',
    followUpPrompt: 'How did she have a way of seeing the best in people even when they couldn\'t see it themselves?',
    pillar: 'action',
    pillarLabel: 'Witnessing in Action',
    sortOrder: 1
  },
  {
    id: 'q-da-2',
    relationshipType: 'daughter',
    questionText: 'What is a memory of pure joy and infectious laughter with her that plays in your mind like a favorite song?',
    followUpPrompt: 'What made her smile so completely magnetic to everyone in the room?',
    pillar: 'joy',
    pillarLabel: 'Joy & Laughter',
    sortOrder: 2
  },
  {
    id: 'q-da-3',
    relationshipType: 'daughter',
    questionText: 'Describe a time she supported you or someone else with wisdom far beyond her years.',
    followUpPrompt: 'Where do you think she received that deep, intuitive well of understanding?',
    pillar: 'help',
    pillarLabel: 'Help & Sacrifice',
    sortOrder: 3
  },
  {
    id: 'q-da-4',
    relationshipType: 'daughter',
    questionText: 'What mountain did she climb or adversity did she face with unwavering grace?',
    followUpPrompt: 'What will you forever admire about how she carried herself through that season?',
    pillar: 'pain',
    pillarLabel: 'Pain & Resilience',
    sortOrder: 4
  },

  // ==================== 6. CHILDHOOD FRIEND ====================
  {
    id: 'q-cf-1',
    relationshipType: 'childhood_friend',
    questionText: 'What was a secret adventure, hideout, or scheme from growing up that your parents never found out about?',
    followUpPrompt: 'What was the moment during that adventure where you both laughed until your stomachs hurt?',
    pillar: 'joy',
    pillarLabel: 'Joy & Laughter',
    sortOrder: 1
  },
  {
    id: 'q-cf-2',
    relationshipType: 'childhood_friend',
    questionText: 'Describe a moment on the playground, schoolyard, or neighborhood street when they had your back against all odds.',
    followUpPrompt: 'How did that childhood loyalty lay the foundation for the lifelong friend they became?',
    pillar: 'help',
    pillarLabel: 'Help & Sacrifice',
    sortOrder: 2
  },
  {
    id: 'q-cf-3',
    relationshipType: 'childhood_friend',
    questionText: 'What was the hardest thing you both endured while growing up together, and how did your friendship survive it?',
    followUpPrompt: 'When you look back on those early years, what core truth about their spirit never changed?',
    pillar: 'pain',
    pillarLabel: 'Pain & Resilience',
    sortOrder: 3
  },
  {
    id: 'q-cf-4',
    relationshipType: 'childhood_friend',
    questionText: 'What do you want their family to know about the young kid they were before the world knew their name?',
    followUpPrompt: 'What spark of greatness did you see in them from day one?',
    pillar: 'action',
    pillarLabel: 'Witnessing in Action',
    sortOrder: 4
  },

  // ==================== 7. WORK COLLEAGUE & FRIEND ====================
  {
    id: 'q-wc-1',
    relationshipType: 'work_colleague_friend',
    questionText: 'What was it like to witness them in the trenches when stakes were high and deadlines were crashing?',
    followUpPrompt: 'How did their calmness, humor, or brilliant mind steer everyone through the chaos?',
    pillar: 'action',
    pillarLabel: 'Witnessing in Action',
    sortOrder: 1
  },
  {
    id: 'q-wc-2',
    relationshipType: 'work_colleague_friend',
    questionText: 'Describe a time they used their influence or stood up behind closed doors to advocate for you or a teammate.',
    followUpPrompt: 'What did that action teach you about real professional integrity and leadership?',
    pillar: 'help',
    pillarLabel: 'Help & Sacrifice',
    sortOrder: 2
  },
  {
    id: 'q-wc-3',
    relationshipType: 'work_colleague_friend',
    questionText: 'What was the most disastrous work mishap or high-stress day that you two turned into legendary office laughter?',
    followUpPrompt: 'What made working with them feel less like a job and more like a shared mission?',
    pillar: 'joy',
    pillarLabel: 'Joy & Laughter',
    sortOrder: 3
  },

  // ==================== 8. MENTEE OR STUDENT ====================
  {
    id: 'q-me-1',
    relationshipType: 'mentee_student',
    questionText: 'What was a specific moment they saw greatness in you when you were full of self-doubt?',
    followUpPrompt: 'What exact words did they say that changed the way you looked at your own potential?',
    pillar: 'help',
    pillarLabel: 'Help & Sacrifice',
    sortOrder: 1
  },
  {
    id: 'q-me-2',
    relationshipType: 'mentee_student',
    questionText: 'Describe a time they corrected you with tough love, grace, and total belief in your future.',
    followUpPrompt: 'How did that lesson save you or elevate your path down the road?',
    pillar: 'pain',
    pillarLabel: 'Pain & Resilience',
    sortOrder: 2
  },
  {
    id: 'q-me-3',
    relationshipType: 'mentee_student',
    questionText: 'What standard of excellence or quiet kindness of theirs do you now pass down to others you teach?',
    followUpPrompt: 'What do you want their family to understand about their ripple effect across the world?',
    pillar: 'action',
    pillarLabel: 'Witnessing in Action',
    sortOrder: 3
  },

  // ==================== 9. CHURCH & FAITH COMMUNITY ====================
  {
    id: 'q-cf-faith-1',
    relationshipType: 'community_faith_member',
    questionText: 'What was a moment you watched them serve others in the sanctuary or neighborhood without ever seeking credit?',
    followUpPrompt: 'What did their devotion teach the rest of the congregation about true faith in action?',
    pillar: 'action',
    pillarLabel: 'Witnessing in Action',
    sortOrder: 1
  },
  {
    id: 'q-cf-faith-2',
    relationshipType: 'community_faith_member',
    questionText: 'Describe a time their prayers, music, or comforting words brought light into a season of deep grief or sickness.',
    followUpPrompt: 'What was the spirit in their voice that brought peace into that room?',
    pillar: 'help',
    pillarLabel: 'Help & Sacrifice',
    sortOrder: 2
  },
  {
    id: 'q-cf-faith-3',
    relationshipType: 'community_faith_member',
    questionText: 'What is a joyful Sunday fellowship, choir rehearsal, or church picnic tradition where they were the life of the celebration?',
    followUpPrompt: 'What favorite hymn, blessing, or laughter of theirs will echo forever in our sanctuary?',
    pillar: 'joy',
    pillarLabel: 'Joy & Laughter',
    sortOrder: 3
  },

  // ==================== 10. GRANDFATHER & GRANDMOTHER ====================
  {
    id: 'q-gp-1',
    relationshipType: 'grandfather',
    questionText: 'What was a story about the old days, his upbringing, or the family roots that he loved to tell you on the porch?',
    followUpPrompt: 'What lesson was tucked inside that story that you find yourself living by today?',
    pillar: 'help',
    pillarLabel: 'Help & Sacrifice',
    sortOrder: 1
  },
  {
    id: 'q-gp-2',
    relationshipType: 'grandmother',
    questionText: 'What was a secret recipe, special hymn, or loving touch of hers that made you feel like you were the most special child in the world?',
    followUpPrompt: 'What warmth did she create in her home that nowhere else on earth could match?',
    pillar: 'joy',
    pillarLabel: 'Joy & Laughter',
    sortOrder: 1
  }
];

export const INITIAL_DIGITAL_TRIBUTES: DigitalTributeItem[] = [
  {
    id: 'dt-1',
    caseId: 'case-current',
    contributorName: 'Robert Vance',
    contributorEmail: 'robert.vance@example.com',
    contributorPhone: '(212) 555-0144',
    contributorRelation: 'Husband of 52 Years',
    relationshipCategory: 'spouse_partner',
    pillar: 'help',
    pillarLabel: 'Help & Sacrifice',
    promptQuestion: '“What was a quiet, private ritual of love she did every single day that you already miss so deeply?”',
    followUpPrompt: 'How did that daily habit anchor your home and marriage across all those years?',
    mediaType: 'voice',
    audioDuration: '02:14',
    durationSeconds: 134,
    audioWaveData: [24, 40, 56, 32, 60, 44, 28, 52, 20, 36, 48, 34, 58, 42, 26, 46, 30, 50],
    rawTranscript: 'Every morning began before the sun with quiet chamomile tea. She left notes upon the counter—nineteen thousand over fifty years—words of steady courage that held our house upright through every storm. She never asked for gratitude, only that we met the morning with hope.',
    poeticStanzas: [
      'Every morning began before the sun with quiet chamomile tea,',
      'She left nineteen thousand notes upon the kitchen counter across fifty years,',
      'Words of steady courage that held our house upright through every storm,',
      'She never asked for gratitude, only that we met each morning with hope.'
    ],
    status: 'featured',
    includeInBook: true,
    includeInSlideshow: true,
    isFeatured: true,
    recordedDate: 'September 18, 2026',
    createdAt: '2026-09-18T14:32:00Z',
    approvedAt: '2026-09-18T16:00:00Z',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://e-bfh.com/tribute/play/dt-1',
    privateNoteToFamily: 'My sweetest darling Eleanor, the house feels still without your morning steps, but your notes remain etched on my heart forever.'
  },
  {
    id: 'dt-2',
    caseId: 'case-current',
    contributorName: 'Claire Vance-Miller',
    contributorEmail: 'claire.vm@example.com',
    contributorPhone: '(917) 555-8821',
    contributorRelation: 'Daughter',
    relationshipCategory: 'daughter',
    pillar: 'joy',
    pillarLabel: 'Joy & Laughter',
    promptQuestion: '“What is a moment she made you proud in a way that took your breath away?”',
    followUpPrompt: 'How did she have a way of seeing the best in people even when they couldn\'t see it themselves?',
    mediaType: 'video',
    audioDuration: '01:45',
    durationSeconds: 105,
    audioWaveData: [18, 32, 45, 52, 38, 24, 48, 32, 20, 28, 50, 35, 22, 40, 44, 18, 25, 42],
    videoThumbnailUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80',
    videoPlaybackUrl: 'https://e-bfh.com/media/videos/claire-tribute-sample.mp4',
    rawTranscript: 'When the school closed its music hall, she opened our front door. Eight retired teachers, four years of after-school violin strings in our living room, never asking permission from the town board, only answering the call of children who wanted to play. Her life was an unending song of quiet courage.',
    poeticStanzas: [
      'When the school district closed its music hall, she opened our front door,',
      'Eight retired teachers and four years of after-school violin strings in our living room,',
      'Never asking permission from the town board, only answering children who wanted to play,',
      'Her entire life was an unending symphony of quiet Harlem courage.'
    ],
    status: 'approved',
    includeInBook: true,
    includeInSlideshow: true,
    isFeatured: false,
    recordedDate: 'September 18, 2026',
    createdAt: '2026-09-18T15:10:00Z',
    approvedAt: '2026-09-18T16:05:00Z',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://e-bfh.com/tribute/play/dt-2'
  },
  {
    id: 'dt-3',
    caseId: 'case-current',
    contributorName: 'Martha Hayes',
    contributorEmail: 'martha.hayes@example.com',
    contributorPhone: '(212) 555-7391',
    contributorRelation: 'Childhood & Lifelong Friend of 63 Years',
    relationshipCategory: 'childhood_friend',
    pillar: 'action',
    pillarLabel: 'Witnessing in Action',
    promptQuestion: '“What was an adventure only the two of you knew about?”',
    followUpPrompt: 'What was the moment during that adventure where you both laughed until you couldn\'t breathe?',
    mediaType: 'voice',
    audioDuration: '03:02',
    durationSeconds: 182,
    audioWaveData: [20, 35, 50, 28, 54, 40, 22, 46, 18, 32, 44, 30, 52, 38, 24, 42, 32, 48],
    rawTranscript: 'In the summer of \'62, our cedar fence raft sank in the mud of Mill Creek. While I was ready to cry, Eleanor stood in the reeds and laughed until she couldn\'t breathe. "Now we know how to build a better one," she smiled. That was how she treated every broken thing in this world.',
    poeticStanzas: [
      'In the golden summer of \'62, our cedar fence raft sank in Mill Creek mud,',
      'While I stood ready to cry, Eleanor stood in the reeds and laughed until we could not breathe,',
      '“Now we know how to build a stronger one,” she smiled into the evening sun,',
      'That was the sacred way she mended every broken thing in this world.'
    ],
    status: 'approved',
    includeInBook: true,
    includeInSlideshow: true,
    isFeatured: true,
    recordedDate: 'September 17, 2026',
    createdAt: '2026-09-17T16:20:00Z',
    approvedAt: '2026-09-17T18:00:00Z',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://e-bfh.com/tribute/play/dt-3'
  },
  {
    id: 'dt-4',
    caseId: 'case-current',
    contributorName: 'Rev. Dr. Calvin Butts IV',
    contributorEmail: 'pastor.butts@abyssinian.org',
    contributorPhone: '(212) 555-9011',
    contributorRelation: 'Pastor & Spiritual Shepherd',
    relationshipCategory: 'community_faith_member',
    pillar: 'action',
    pillarLabel: 'Witnessing in Action',
    promptQuestion: '“What was a moment you watched them serve others without ever seeking credit or attention?”',
    followUpPrompt: 'What did their devotion teach the rest of the congregation about faith in action?',
    mediaType: 'voice',
    audioDuration: '02:45',
    durationSeconds: 165,
    audioWaveData: [14, 28, 40, 50, 35, 22, 45, 30, 18, 26, 48, 32, 20, 38, 42, 16, 28, 38],
    rawTranscript: 'For thirty-two winters, Sister Eleanor was the first in the fellowship hall at 5:00 AM preparing hot oatmeal and care packages for our Harlem unhoused neighbors. She never sought a microphone or plaque. She walked with the humble grace of Christ every hour of her life.',
    poeticStanzas: [
      'For thirty-two winters, Sister Eleanor was first in the fellowship hall at five in the morning,',
      'Stirring warm pots of nourishment and packing wool gloves for our Harlem neighbors,',
      'Never once seeking a microphone, a pulpit citation, or an engraved plaque,',
      'She walked the sanctuary aisle of life with the quiet, radiant humility of grace.'
    ],
    status: 'approved',
    includeInBook: true,
    includeInSlideshow: true,
    isFeatured: false,
    recordedDate: 'September 17, 2026',
    createdAt: '2026-09-17T18:45:00Z',
    approvedAt: '2026-09-17T19:30:00Z',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://e-bfh.com/tribute/play/dt-4'
  },
  {
    id: 'dt-5',
    caseId: 'case-current',
    contributorName: 'Marcus Vance',
    contributorEmail: 'marcus.vance@example.com',
    contributorPhone: '(212) 555-4309',
    contributorRelation: 'Grandson',
    relationshipCategory: 'grandmother',
    pillar: 'joy',
    pillarLabel: 'Joy & Laughter',
    promptQuestion: '“What was a secret recipe, special hymn, or loving touch of hers that made you feel like the most special person in the world?”',
    followUpPrompt: 'What warmth did she create in her home that nowhere else on earth could match?',
    mediaType: 'written',
    rawTranscript: 'Grandma’s peach cobbler on Sunday afternoons wasn’t just dessert—it was an event. She would slip me the warm crust corners before anyone else sat down at the table and tell me, "Marcus, you have a mind made for big things. Never let anyone shrink your horizons." I carry that into every courtroom I walk into today.',
    poeticStanzas: [
      'Grandma’s Sunday peach cobbler was far more than dessert—it was a holy family event,',
      'She slipped me the warm caramelized crust corners before anyone else took their seat,',
      'Whispering: “Marcus, your mind was built for great horizons; never let the world shrink you,”',
      'I carry her steady whisper into every courtroom and chapter of my life.'
    ],
    status: 'pending',
    includeInBook: true,
    includeInSlideshow: false,
    isFeatured: false,
    recordedDate: 'September 19, 2026',
    createdAt: '2026-09-19T10:15:00Z',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://e-bfh.com/tribute/play/dt-5',
    privateNoteToFamily: 'Grandma Eleanor gave us all wings to fly. We love you Grandad.'
  }
];

export const INITIAL_BOOK_COMPILATION: CoffeeTableBookCompilation = {
  id: 'book-vance-2026',
  caseId: 'case-current',
  decedentName: 'Eleanor Vance',
  datesOfGrace: 'March 14, 1948 — November 22, 2025',
  chapelName: 'Benta\'s Funeral Home — Main Sanctuary & Memorial Chapel',
  coverPhotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80',
  biographicalEpitaph: '“A devoted educator of 38 years in New York City Public Schools, master botanist, choir lead, and beloved matriarch whose radiant wisdom, generous kitchen, and unforgettable bedtime stories touched generations of family and Harlem community members.”',
  chapters: [
    {
      id: 'chap-1',
      title: 'Words from Spouse & Life Partner',
      subtitle: 'Fifty-two years of devotion, morning tea, and enduring love',
      tributes: [INITIAL_DIGITAL_TRIBUTES[0]],
      photoUrls: [
        { url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&q=80', caption: 'Fifty-second wedding anniversary celebration with family.' }
      ]
    },
    {
      id: 'chap-2',
      title: 'Voices of Her Children & Grandchildren',
      subtitle: 'Lessons of courage, music in the living room, and Sunday traditions',
      tributes: [INITIAL_DIGITAL_TRIBUTES[1]],
      photoUrls: [
        { url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80', caption: 'Sunday dinner gathering at the Edgecombe Avenue residence.' }
      ]
    },
    {
      id: 'chap-3',
      title: 'Childhood Roots & Lifelong Confidants',
      subtitle: 'Secret creek adventures, schoolyard loyalty, and sixty years of laughter',
      tributes: [INITIAL_DIGITAL_TRIBUTES[2]],
      photoUrls: [
        { url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80', caption: 'Eleanor and Martha in Harlem, summer of 1968.' }
      ]
    },
    {
      id: 'chap-4',
      title: 'Faith, Service & Harlem Community',
      subtitle: 'Fellowship mornings, quiet generosity, and ministry in action',
      tributes: [INITIAL_DIGITAL_TRIBUTES[3]],
      photoUrls: []
    }
  ],
  totalTributes: 4,
  totalAudioSeconds: 481,
  totalPhotos: 3,
  isCompiled: true,
  lastCompiledAt: '2026-09-18T18:00:00Z',
  pdfDownloadUrl: 'https://e-bfh.com/downloads/keepsake-volume-eleanor-vance.pdf'
};

export const INITIAL_STORAGE_TELEMETRY: CloudStorageRetentionTelemetry = {
  rawStorageUsedMB: 142.6,
  rawStorageLimitMB: 500.0,
  permanentMasterUsedMB: 38.4,
  rawMediaFilesCount: 14,
  permanentKeepsakeFilesCount: 8,
  retentionDaysRemaining: 74,
  lastDailyPurgeTimestamp: '2026-09-30 03:00 UTC',
  nextScheduledPurgeTimestamp: '2026-10-01 03:00 UTC',
  rlsPoliciesActive: 6,
  purgeProcedureStatus: 'operational'
};

export const INITIAL_FRIEND_INVITATIONS: FriendTributeInvitation[] = [
  {
    id: 'inv-1',
    caseId: 'case-current',
    recipientName: 'Martha Hayes',
    recipientContact: '(212) 555-7391',
    channel: 'sms',
    status: 'recorded',
    personalNote: 'Martha, Eleanor spoke of your Mill Creek days so fondly. Please share a favorite memory on her tribute audio archive.',
    sentAt: 'Sep 17, 2026 2:10 PM',
    openedAt: 'Sep 17, 2026 2:44 PM',
    recordedAt: 'Sep 17, 2026 4:20 PM',
    magicToken: 'tok_martha_6381',
    tributeId: 'dt-3'
  },
  {
    id: 'inv-2',
    caseId: 'case-current',
    recipientName: 'Rev. Dr. Calvin Butts IV',
    recipientContact: 'pastor.butts@abyssinian.org',
    channel: 'email',
    status: 'recorded',
    personalNote: 'Dear Pastor, we would be blessed to have your prayer and reflection in Eleanor\'s digital memorial volume.',
    sentAt: 'Sep 17, 2026 2:15 PM',
    openedAt: 'Sep 17, 2026 3:30 PM',
    recordedAt: 'Sep 17, 2026 6:45 PM',
    magicToken: 'tok_pastor_9912',
    tributeId: 'dt-4'
  },
  {
    id: 'inv-3',
    caseId: 'case-current',
    recipientName: 'Dr. Evelyn Montgomery',
    recipientContact: '(917) 555-3301',
    channel: 'sms',
    status: 'opened',
    personalNote: 'Evelyn, we would love for you to record a short story from the botanical garden society in Eleanor\'s keepsake book.',
    sentAt: 'Sep 18, 2026 9:00 AM',
    openedAt: 'Sep 18, 2026 11:15 AM',
    magicToken: 'tok_evelyn_4401'
  },
  {
    id: 'inv-4',
    caseId: 'case-current',
    recipientName: 'Deacon Harold Vance',
    recipientContact: 'harold.vance@example.com',
    channel: 'email',
    status: 'sent',
    personalNote: 'Uncle Harold, we are compiling the Coffee Table Volume for Eleanor. Tap the link to listen and add your voice.',
    sentAt: 'Sep 19, 2026 8:30 AM',
    magicToken: 'tok_harold_1120'
  }
];
