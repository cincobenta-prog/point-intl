import { 
  GoldenRecordCase, 
  StatementOfGoodsData, 
  PassThroughPayableCheck, 
  CashAdvanceCategory 
} from '../types/funeral';
import { getDefaultStatementOfGoodsForCase } from '../data/generalPriceList';

// ============================================================================
// ENGLISH WORD CONVERTER FOR LEGAL CHECK VOUCHERS
// ============================================================================

const ONES = [
  '', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE',
  'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN',
  'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'
];

const TENS = [
  '', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'
];

function convertBelowThousand(num: number): string {
  if (num === 0) return '';
  if (num < 20) return ONES[num];
  if (num < 100) {
    const remainder = num % 10;
    return TENS[Math.floor(num / 10)] + (remainder > 0 ? '-' + ONES[remainder] : '');
  }
  const hundred = Math.floor(num / 100);
  const remainder = num % 100;
  return ONES[hundred] + ' HUNDRED' + (remainder > 0 ? ' ' + convertBelowThousand(remainder) : '');
}

/**
 * Converts a dollar amount into legal English words for checks.
 * Example: 1850.00 -> "*** ONE THOUSAND EIGHT HUNDRED FIFTY AND 00/100 DOLLARS ***"
 */
export function numberToEnglishWords(amount: number): string {
  if (isNaN(amount) || amount < 0) return 'ZERO AND 00/100 DOLLARS';
  
  const dollars = Math.floor(amount);
  const cents = Math.round((amount - dollars) * 100);
  const centsFormatted = cents.toString().padStart(2, '0');

  if (dollars === 0) {
    return `*** ZERO AND ${centsFormatted}/100 DOLLARS ***`;
  }

  let words = '';
  
  // Millions
  if (dollars >= 1000000) {
    const millions = Math.floor(dollars / 1000000);
    words += convertBelowThousand(millions) + ' MILLION ';
  }
  
  // Thousands
  const remainderThousands = dollars % 1000000;
  if (remainderThousands >= 1000) {
    const thousands = Math.floor(remainderThousands / 1000);
    words += convertBelowThousand(thousands) + ' THOUSAND ';
  }
  
  // Hundreds & Below
  const remainderHundreds = remainderThousands % 1000;
  if (remainderHundreds > 0) {
    words += convertBelowThousand(remainderHundreds) + ' ';
  }

  return `*** ${words.trim()} AND ${centsFormatted}/100 DOLLARS ***`;
}

// ============================================================================
// CASH ADVANCE CHECK GENERATOR
// ============================================================================

export function generateCashAdvanceChecks(
  caseData: GoldenRecordCase,
  customStatement?: StatementOfGoodsData
): PassThroughPayableCheck[] {
  const statement = customStatement || caseData.statementOfGoods || getDefaultStatementOfGoodsForCase(caseData);
  const s2 = statement.sectionII;
  const isCremation = caseData.dispositionType.includes('cremation');
  const serviceDate = caseData.serviceSelections.serviceDate || '2026-09-24';
  const decedentName = caseData.decedent.legalName;
  const caseNumber = caseData.caseNumber;

  // Base starting check number sequence for this case
  const baseCheckNumber = 10480 + (parseInt(caseNumber.replace(/\D/g, '').slice(-3) || '1') % 100);
  let checkOffset = 1;

  const checks: PassThroughPayableCheck[] = [];

  const createCheck = (params: {
    category: CashAdvanceCategory;
    categoryLabel: string;
    payeeName: string;
    payeeAddress?: string;
    amount: number;
    memoPrefix: string;
    notes?: string;
  }): PassThroughPayableCheck => {
    const chkNum = `CHK-${baseCheckNumber + checkOffset++}`;
    const cleanChkNum = chkNum.replace('CHK-', '');
    return {
      id: `chk-${caseData.id}-${params.category}-${Date.now()}-${checkOffset}`,
      checkNumber: chkNum,
      caseId: caseData.id,
      caseNumber: caseData.caseNumber,
      decedentName: decedentName,
      serviceDate: serviceDate,
      category: params.category,
      categoryLabel: params.categoryLabel,
      payeeName: params.payeeName,
      payeeAddress: params.payeeAddress,
      amount: params.amount,
      amountInWords: numberToEnglishWords(params.amount),
      memo: `${params.memoPrefix}: ${decedentName} • Case #${caseNumber} • Svc Date: ${serviceDate}`,
      dateOfService: serviceDate,
      status: 'draft_queued',
      bankAccount: 'JPMorgan Chase Operating Pass-Through (**4892)',
      micrEncoding: `⑆021000021⑆ 9823489204⑈ ${cleanChkNum}`,
      signedByDirector: caseData.assignedDirector && caseData.assignedDirector.length > 3
        ? `${caseData.assignedDirector}, LFD`
        : 'Jason Benta, LFD #08850',
      generatedAt: new Date().toISOString(),
      notes: params.notes || 'Pass-through cash advance check pursuant to NYS 10 NYCRR § 77.8. 0% markup.'
    };
  };

  // 1. Cemetery / Crematory Fee
  if (s2.cemeteryOrCrematoryAmount > 0) {
    const payee = s2.cemeteryOrCrematoryName || caseData.serviceSelections.crematoryOrCemeteryName || (isCremation ? 'Woodlawn Crematory' : 'Woodlawn Cemetery');
    checks.push(
      createCheck({
        category: isCremation ? 'crematory_fee' : 'cemetery_interment',
        categoryLabel: isCremation ? 'Crematory Fee & Retort Service' : 'Cemetery Interment & Vault Opening',
        payeeName: payee,
        payeeAddress: '4199 Webster Ave, Bronx, NY 10470',
        amount: s2.cemeteryOrCrematoryAmount,
        memoPrefix: isCremation ? 'Cremation Fee' : 'Interment Fee',
        notes: 'Hand-deliver to cemetery / crematory superintendent upon arrival of cortege.'
      })
    );
  }

  // 2. Clergy / Church Honoraria
  if (s2.clergyHonorariaAmount > 0) {
    const payee = s2.clergyChurchName || caseData.serviceSelections.officiantName || 'Abyssinian Baptist Church / Officiant Guild';
    checks.push(
      createCheck({
        category: 'clergy_officiant',
        categoryLabel: 'Clergy Honoraria & Officiant Pastoral Fee',
        payeeName: payee,
        payeeAddress: '132 W 138th St, New York, NY 10030',
        amount: s2.clergyHonorariaAmount,
        memoPrefix: 'Pastoral Honorarium',
        notes: 'Present to minister / clergy officiant prior to processional invocation.'
      })
    );
  }

  // 3. NYC Certified Death Certificate Transcripts
  if (s2.deathCertificateTranscriptsAmount > 0) {
    checks.push(
      createCheck({
        category: 'evital_edrs_filing',
        categoryLabel: `NYC Certified Death Certificates (${s2.deathCertificateTranscriptsCount} Copies @ $15)`,
        payeeName: 'NYC Department of Health & Mental Hygiene (DOHMH)',
        payeeAddress: '125 Worth Street, CN-4, Rm 119, New York, NY 10013',
        amount: s2.deathCertificateTranscriptsAmount,
        memoPrefix: `Death Transcripts (${s2.deathCertificateTranscriptsCount}x)`,
        notes: 'Payable to NYC DOHMH Bureau of Vital Statistics for certified transcripts.'
      })
    );
  }

  // 4. Organist / Musician Accompaniment
  if (s2.organistMusicianAmount > 0) {
    const payee = s2.organistMusicianName || caseData.serviceSelections.organistName || 'Harlem Musician & Organist Ensemble';
    checks.push(
      createCheck({
        category: 'organist_musician',
        categoryLabel: 'Musician & Organist Accompaniment',
        payeeName: payee,
        payeeAddress: '630 St Nicholas Ave, New York, NY 10030',
        amount: s2.organistMusicianAmount,
        memoPrefix: 'Organist Accompaniment',
        notes: 'Deliver to principal organist/soloist at sanctuary music prelude.'
      })
    );
  }

  // 5. Pallbearers (Professional Crew)
  if (s2.pallbearersAmount > 0) {
    checks.push(
      createCheck({
        category: 'pallbearer_gratuity',
        categoryLabel: `Pallbearer Professional Service Crew (${s2.pallbearersCount || 4} Staff)`,
        payeeName: 'Harlem Professional Pallbearers Guild',
        payeeAddress: '630 St Nicholas Ave, New York, NY 10030',
        amount: s2.pallbearersAmount,
        memoPrefix: 'Pallbearer Crew Fee',
        notes: 'Disburse to lead pallbearer upon committal completion.'
      })
    );
  }

  // 6. Bridge / Road Tolls & Chauffeur Disbursements
  const tollsAndGratuities = (s2.bridgeAndRoadTollsAmount || 0) + (s2.gratuitiesLiveryAndStaffAmount || 0);
  if (tollsAndGratuities > 0) {
    checks.push(
      createCheck({
        category: 'livery_tolls',
        categoryLabel: 'Bridge, Tunnel & Chauffeur Pass-Through Tolls',
        payeeName: 'MTA Bridges & Tunnels / Chauffeur Tolls Pool',
        payeeAddress: 'Triborough Bridge Station, New York, NY',
        amount: tollsAndGratuities,
        memoPrefix: 'Cortege Highway Tolls',
        notes: 'Provide to lead chauffeur vehicle for RFK/George Washington Bridge and toll plazas.'
      })
    );
  }

  // 7. Custom Cash Advances
  if (s2.customCashAdvances && s2.customCashAdvances.length > 0) {
    s2.customCashAdvances.forEach(custom => {
      if (custom.amount > 0) {
        checks.push(
          createCheck({
            category: 'custom_advance',
            categoryLabel: custom.description,
            payeeName: custom.description,
            amount: custom.amount,
            memoPrefix: custom.description.slice(0, 24),
            notes: 'Custom pass-through advance item as designated on Form AP-47.'
          })
        );
      }
    });
  }

  return checks;
}
