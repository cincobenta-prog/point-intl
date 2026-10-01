import { GoldenRecordCase, FamilyProofApprovalRecord } from '../types/funeral';

export function getInitialProofApproval(caseData: GoldenRecordCase): FamilyProofApprovalRecord {
  return {
    status: 'draft_in_review',
    programApproved: false,
    keepsakeBookApproved: false,
    spellingsVerified: false,
    photosApproved: false,
    legalPrintLockAcknowledged: false,
    signatoryFullName: caseData.informant.fullName,
    signatoryRelationship: caseData.informant.relationship,
    signatoryEmail: caseData.informant.email,
    pressOrderQuantity: {
      memorialPrograms: 250,
      keepsakeVolumes: 25
    },
    pressJobTicketNumber: `PRESS-${caseData.caseNumber}-2026`
  };
}
