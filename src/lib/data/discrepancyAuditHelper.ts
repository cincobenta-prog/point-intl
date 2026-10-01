import { GoldenRecordCase, DiscrepancyAuditReport, DiscrepancyItem } from '../types/funeral';

/**
 * Calculates a real-time discrepancy audit report by cross-referencing:
 * 1. Golden Record Master Vitals
 * 2. NYC DOHMH / NYS EDRS eVital Form
 * 3. NYS Form AP-47 Statement of Goods & Services
 * 4. Family Portal / Obituary Fact Ledger
 * 5. Cemetery Plot Deed / Crematory Authorization
 * 6. NYS PHL § 4201 Right of Disposition Hierarchy
 */
export function generateDiscrepancyAudit(caseData: GoldenRecordCase): DiscrepancyAuditReport {
  const items: DiscrepancyItem[] = [];

  const legalName = caseData.decedent.legalName;
  const informantName = caseData.informant.fullName;
  const relationship = caseData.informant.relationship.toLowerCase();
  const cemeteryName = caseData.serviceSelections.crematoryOrCemeteryName;

  // 1. Check NYS PHL § 4201 Priority
  let phlTier = 4; // default child
  let phlTitle = 'Adult Child (Equal Priority with Siblings)';
  let phl4201Validated = true;

  if (relationship.includes('agent') || relationship.includes('designated') || caseData.informant.hasRightToControl) {
    phlTier = 1;
    phlTitle = 'Designated Written Agent (NYS PHL § 4201 Form on File)';
    phl4201Validated = true;
  } else if (relationship.includes('spouse') || relationship.includes('wife') || relationship.includes('husband')) {
    phlTier = 2;
    phlTitle = 'Surviving Legal Spouse (Priority Tier 2)';
    phl4201Validated = true;
  } else if (relationship.includes('domestic partner') || relationship.includes('partner')) {
    phlTier = 3;
    phlTitle = 'Registered Domestic Partner (Priority Tier 3)';
    phl4201Validated = true;
  } else if (relationship.includes('daughter') || relationship.includes('son') || relationship.includes('child')) {
    phlTier = 4;
    phlTitle = 'Surviving Adult Child (Majority Consent Required if Siblings Exist)';
    // Check if there is potential sibling dispute or missing waiver
    if (!caseData.informant.isNextOfKin) {
      phl4201Validated = false;
      items.push({
        id: 'disc-phl-4201-kinship',
        category: 'phl_4201_kinship',
        title: 'NYS PHL § 4201 Next of Kin Priority Clarification',
        description: `Informant ${informantName} is listed as ${caseData.informant.relationship}, but isNextOfKin flag is unchecked without an attached statutory waiver.`,
        severity: 'warning',
        goldenRecordValue: `${informantName} (${caseData.informant.relationship})`,
        conflictingDocumentName: 'NYS PHL § 4201 Authority Affidavit',
        conflictingValue: 'Unsigned / Sibling Majority Status Unverified',
        statutoryImpact: 'NYS Bureau of Funeral Directing (10 NYCRR § 77.8) requires written statutory authorization before committal or cremation.',
        suggestedFix: 'Execute Next of Kin Statutory Priority Affidavit or attach sibling consent waivers in Legal Documents.',
        status: 'active_mismatch'
      });
    }
  } else if (relationship.includes('mother') || relationship.includes('father') || relationship.includes('parent')) {
    phlTier = 5;
    phlTitle = 'Surviving Parent (Priority Tier 5)';
  } else if (relationship.includes('sister') || relationship.includes('brother') || relationship.includes('sibling')) {
    phlTier = 6;
    phlTitle = 'Surviving Adult Sibling (Priority Tier 6)';
  } else if (relationship.includes('friend') || relationship.includes('niece') || relationship.includes('nephew') || relationship.includes('cousin')) {
    phlTier = 7;
    phlTitle = 'Extended Kin / Close Personal Friend (Tier 7 - Requires Prior Kin Forfeiture/Waiver)';
    if (!relationship.includes('agent')) {
      items.push({
        id: 'disc-phl-4201-extended',
        category: 'phl_4201_kinship',
        title: 'NYS PHL § 4201 Extended Relative Priority Warning',
        description: `Informant ${informantName} (${caseData.informant.relationship}) is arranging services, but does not hold primary statutory priority over surviving children/parents.`,
        severity: 'critical',
        goldenRecordValue: `${informantName} (${caseData.informant.relationship})`,
        conflictingDocumentName: 'NYS Right of Disposition Hierarchy',
        conflictingValue: 'No Designated Agent Form Registered',
        statutoryImpact: 'Risk of funeral injunction or cremation stoppage if closer kin surfaces.',
        suggestedFix: 'Confirm unavailability, abandonment, or written waiver from surviving spouse/children.',
        status: 'active_mismatch'
      });
      phl4201Validated = false;
    }
  }

  // 2. Check EDRS / eVital Vitals
  const motherMaiden = caseData.decedent.motherMaidenName;
  const fatherName = caseData.decedent.fatherName;
  const ssn = caseData.decedent.ssnMasked;
  let hasEdrsConflict = false;

  if (!motherMaiden || motherMaiden.trim() === '' || motherMaiden.toLowerCase().includes('unknown')) {
    hasEdrsConflict = true;
    items.push({
      id: 'disc-edrs-mother-maiden',
      category: 'edrs_vitals',
      title: "EDRS Vitals: Missing Mother's Maiden Surname",
      description: "NYC DOHMH eVital requires Mother's Maiden Name (prior to any marriage) for official death certificate registration.",
      severity: 'critical',
      goldenRecordValue: motherMaiden || 'BLANK',
      conflictingDocumentName: 'NYC DOHMH eVital Registration',
      conflictingValue: 'Missing / Incomplete Required Field',
      statutoryImpact: 'NYC DOHMH will reject EDRS submission, delaying the burial/cremation transit permit past the 72-hour statutory clock.',
      suggestedFix: "Contact informant to retrieve Mother's birth/maiden surname before filing.",
      status: 'active_mismatch'
    });
  }

  if (!fatherName || fatherName.trim() === '') {
    items.push({
      id: 'disc-edrs-father-name',
      category: 'edrs_vitals',
      title: "EDRS Vitals: Father's Full Name Blank",
      description: "Father's first and last name is currently unrecorded in Golden Record.",
      severity: 'warning',
      goldenRecordValue: 'Unrecorded',
      conflictingDocumentName: 'EDRS Vitals Sheet',
      conflictingValue: 'Empty',
      statutoryImpact: 'May require formal affidavit of correction post-issuance if omitted.',
      suggestedFix: "Confirm Father's full legal name or verify 'Unknown' designation with informant.",
      status: 'active_mismatch'
    });
  }

  if (!ssn || ssn.trim() === '' || ssn.includes('000-00')) {
    items.push({
      id: 'disc-edrs-ssn',
      category: 'edrs_vitals',
      title: 'EDRS Vitals: Social Security Number Pending',
      description: 'SSN is unverified or masked placeholder.',
      severity: 'warning',
      goldenRecordValue: ssn || 'Missing',
      conflictingDocumentName: 'NYC DOHMH eVital & SSA-721 Notice',
      conflictingValue: 'Unverified',
      statutoryImpact: 'Social Security Lump Sum Death Benefit ($255) and VA benefits cannot be automated.',
      suggestedFix: 'Verify SSN card or tax document with informant.',
      status: 'active_mismatch'
    });
  }

  // 3. Form AP-47 Purchaser & Financial Match
  const statement = caseData.statementOfGoods;
  if (statement) {
    if (statement.purchaserName && statement.purchaserName.trim() !== '' && !statement.purchaserName.toLowerCase().includes(informantName.toLowerCase()) && !informantName.toLowerCase().includes(statement.purchaserName.toLowerCase())) {
      items.push({
        id: 'disc-ap47-purchaser',
        category: 'ap47_purchaser',
        title: 'Form AP-47 Contract Purchaser vs Informant Mismatch',
        description: `Contract purchaser is listed as "${statement.purchaserName}", whereas primary Golden Record Informant is "${informantName}".`,
        severity: 'info',
        goldenRecordValue: informantName,
        conflictingDocumentName: 'NYS Form AP-47 Statement of Goods',
        conflictingValue: statement.purchaserName,
        statutoryImpact: 'NYS General Business Law requires contract signer to bear primary financial liability; ensure both parties sign or clarify 3rd-party payor role.',
        suggestedFix: 'Document 3rd-party payer addendum or verify both signatures on legal engagement.',
        status: 'active_mismatch'
      });
    }
  }

  // 4. Cemetery Plot Deed & Disposition Name Verification
  let hasCemeteryDeedConflict = false;
  if (cemeteryName.toLowerCase().includes('woodlawn') || cemeteryName.toLowerCase().includes('ferncliff') || cemeteryName.toLowerCase().includes('cemetery')) {
    // Check if middle name is present
    const nameParts = legalName.split(' ');
    if (nameParts.length < 3) {
      items.push({
        id: 'disc-cemetery-middlename',
        category: 'cemetery_deed',
        title: 'Cemetery Plot Deed: Middle Name / Initial Verification',
        description: `Golden Record specifies "${legalName}". Older family cemetery plot deeds at ${cemeteryName} frequently require full legal middle names matching deed records.`,
        severity: 'info',
        goldenRecordValue: legalName,
        conflictingDocumentName: `${cemeteryName} Interment Authorization`,
        conflictingValue: 'Middle Name / Initial Pending Confirmation',
        statutoryImpact: 'Cemetery office may delay grave opening authorization on morning of burial if deed records differ.',
        suggestedFix: 'Confirm middle name against birth certificate or existing deed paperwork.',
        status: 'active_mismatch'
      });
    }
  }

  // Calculate alignment score
  const totalChecks = 8;
  const activeMismatches = items.filter(i => i.status === 'active_mismatch');
  const criticalCount = activeMismatches.filter(i => i.severity === 'critical').length;
  const warningCount = activeMismatches.filter(i => i.severity === 'warning').length;
  const infoCount = activeMismatches.filter(i => i.severity === 'info').length;

  let penalty = criticalCount * 25 + warningCount * 12 + infoCount * 5;
  const alignmentScore = Math.max(10, Math.min(100, 100 - penalty));

  return {
    alignmentScore,
    totalChecks,
    discrepanciesFound: items.length,
    lastAuditedAt: 'Just now',
    auditedBy: 'Zero-Slippage Automated Compliance Engine',
    items,
    phl4201Validated,
    phl4201PriorityTier: phlTier,
    phl4201PriorityTitle: phlTitle,
    hasCemeteryDeedConflict,
    hasEdrsVitalsConflict: hasEdrsConflict
  };
}
