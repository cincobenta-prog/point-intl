export type NarrativePillar = 'joy' | 'pain' | 'help' | 'action';

export interface NarrativePillarMeta {
  id: NarrativePillar;
  label: string;
  icon: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  description: string;
}

export type RelationshipGroup = 
  | 'Immediate Family'
  | 'Extended & In-Laws'
  | 'Friends & Early Years'
  | 'Mentors & Colleagues'
  | 'Community & Faith';

export interface RelationshipCategory {
  id: string;
  label: string;
  sub: string;
  group: RelationshipGroup;
  icon: string;
}

export interface TributeQuestionPrompt {
  id: string;
  relationshipType: string;
  questionText: string;
  followUpPrompt: string;
  pillar: NarrativePillar;
  pillarLabel: string;
  sortOrder: number;
}

export type TributeMediaType = 'voice' | 'video' | 'written' | 'photo';

export type TributeStatus = 'pending' | 'approved' | 'featured' | 'archived';

export interface DigitalTributeItem {
  id: string;
  caseId: string;
  contributorName: string;
  contributorEmail?: string;
  contributorPhone?: string;
  contributorRelation: string;
  relationshipCategory: string;
  pillar: NarrativePillar;
  pillarLabel: string;
  promptQuestion: string;
  followUpPrompt?: string;
  mediaType: TributeMediaType;
  audioDuration?: string;
  durationSeconds?: number;
  audioWaveData?: number[];
  videoThumbnailUrl?: string;
  videoPlaybackUrl?: string;
  photoUrl?: string;
  photoCaption?: string;
  rawTranscript?: string;
  poeticStanzas?: string[];
  status: TributeStatus;
  includeInBook: boolean;
  includeInSlideshow: boolean;
  isFeatured: boolean;
  recordedDate: string;
  createdAt: string;
  approvedAt?: string;
  qrCodeUrl?: string;
  privateNoteToFamily?: string;
  pinVerified?: boolean;
}

export interface CoffeeTableBookChapter {
  id: string;
  title: string;
  subtitle: string;
  tributes: DigitalTributeItem[];
  photoUrls?: { url: string; caption: string }[];
}

export interface CoffeeTableBookCompilation {
  id: string;
  caseId: string;
  decedentName: string;
  datesOfGrace: string;
  chapelName: string;
  coverPhotoUrl: string;
  biographicalEpitaph: string;
  chapters: CoffeeTableBookChapter[];
  totalTributes: number;
  totalAudioSeconds: number;
  totalPhotos: number;
  isCompiled: boolean;
  lastCompiledAt: string;
  pdfDownloadUrl?: string;
}

export interface FriendTributeInvitation {
  id: string;
  caseId: string;
  recipientName: string;
  recipientContact: string;
  channel: 'sms' | 'email' | 'whatsapp';
  status: 'sent' | 'opened' | 'recorded';
  personalNote: string;
  sentAt: string;
  openedAt?: string;
  recordedAt?: string;
  magicToken: string;
  tributeId?: string;
}

export interface CloudStorageRetentionTelemetry {
  rawStorageUsedMB: number;
  rawStorageLimitMB: number;
  permanentMasterUsedMB: number;
  rawMediaFilesCount: number;
  permanentKeepsakeFilesCount: number;
  retentionDaysRemaining: number;
  lastDailyPurgeTimestamp: string;
  nextScheduledPurgeTimestamp: string;
  rlsPoliciesActive: number;
  purgeProcedureStatus: 'operational' | 'in_progress' | 'standby';
}
