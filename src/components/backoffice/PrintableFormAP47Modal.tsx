import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download,
  HandCoins
} from 'lucide-react';
import { GoldenRecordCase } from '../../lib/types/funeral';
import { getDefaultStatementOfGoodsForCase } from '../../lib/data/generalPriceList';
import { CashAdvanceCheckPrinterModal } from './CashAdvanceCheckPrinterModal';

interface PrintableFormAP47ModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: GoldenRecordCase;
  onOpenCheckPrinter?: (targetCase: GoldenRecordCase) => void;
}

export const PrintableFormAP47Modal: React.FC<PrintableFormAP47ModalProps> = ({
  isOpen,
  onClose,
  caseData,
  onOpenCheckPrinter
}) => {
  const [isInternalCheckPrinterOpen, setIsInternalCheckPrinterOpen] = useState(false);
  if (!isOpen) return null;

  const sog = caseData.statementOfGoods || getDefaultStatementOfGoodsForCase(caseData);

  const handlePrint = () => {
    window.print();
  };

  const handleOpenChecks = () => {
    if (onOpenCheckPrinter) {
      onOpenCheckPrinter(caseData);
    } else {
      setIsInternalCheckPrinterOpen(true);
    }
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sog, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `NYS_Form_AP47_${caseData.caseNumber}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 print:p-0 font-sans animate-fadeIn">
      
      {/* Modal Container */}
      <div className="bg-white border border-neutral-200 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden print:max-w-none print:max-h-none print:border-none print:shadow-none print:rounded-none">
        
        {/* Screen-Only Header Bar */}
        <div className="p-4 sm:p-5 bg-neutral-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-xs">
              AP47
            </div>
            <div>
              <h3 className="font-serif-title text-sm sm:text-base font-bold text-neutral-100">
                Official Statement of Goods & Services Selected (NYS Form AP-47)
              </h3>
              <p className="text-[11px] text-neutral-400 font-light">
                Conforms to 10 NYCRR § 77.8 and NYS Public Health Law § 3440-a • Case <strong className="text-amber-300 font-mono">{caseData.caseNumber}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleOpenChecks}
              className="bg-neutral-800 hover:bg-neutral-700 text-amber-300 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition border border-amber-400/40"
              title="Print 3-Part Cash Advance Check Vouchers"
            >
              <HandCoins className="w-3.5 h-3.5 text-amber-300" />
              <span>Pass-Through Checks</span>
            </button>
            <button
              onClick={handlePrint}
              className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm border border-amber-400/40"
            >
              <Printer className="w-3.5 h-3.5 text-amber-300" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={handleDownloadJSON}
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition border border-neutral-700"
              title="Download JSON Export"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">JSON</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-white text-neutral-900 space-y-6 text-xs print:p-0 print:overflow-visible">
          
          {/* Official Letterhead */}
          <div className="text-center space-y-1 pb-4 border-b-2 border-neutral-900">
            <h1 className="font-serif-title text-2xl font-bold uppercase tracking-wider text-neutral-900">
              Benta's Funeral Home, Inc.
            </h1>
            <p className="text-[11px] font-semibold text-neutral-700 uppercase tracking-widest">
              630 Saint Nicholas Avenue • New York, NY 10030 • (212) 281-8850
            </p>
            <p className="text-[10px] text-neutral-500 font-mono">
              NYS Bureau of Funeral Directing Registration #08850 • Established 1928
            </p>
            <div className="pt-2 text-xs font-bold uppercase tracking-wide bg-neutral-100 py-1 rounded border border-neutral-300 mt-2">
              Itemized Statement of Funeral Goods and Services Selected (NYS Form AP-47)
            </div>
          </div>

          {/* Case & Purchaser Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
            <div className="space-y-1">
              <p><strong>Name of Deceased:</strong> {caseData.decedent.legalName}</p>
              <p><strong>Date of Death:</strong> {caseData.decedent.dateOfDeath}</p>
              <p><strong>Place of Death:</strong> {caseData.decedent.placeOfDeath}</p>
              <p><strong>Selected Service:</strong> {caseData.serviceSelections.packageTitle}</p>
            </div>
            <div className="space-y-1">
              <p><strong>Contract Date:</strong> {sog.agreementDate}</p>
              <p><strong>Case Number:</strong> <span className="font-mono font-bold">{caseData.caseNumber}</span></p>
              <p><strong>Purchaser / Informant:</strong> {caseData.informant.fullName} ({caseData.informant.relationship})</p>
              <p><strong>Licensed Funeral Director:</strong> {sog.sectionIV.licensedFuneralDirector.name} ({sog.sectionIV.licensedFuneralDirector.licenseNumber})</p>
            </div>
          </div>

          {/* SECTION I: ITEMIZED SERVICES */}
          <div className="space-y-2">
            <h2 className="font-bold text-xs uppercase tracking-wider bg-neutral-900 text-white px-2.5 py-1 rounded">
              Section I — Itemized Funeral Home Service Charges
            </h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-300 text-[10px] text-neutral-500 uppercase">
                  <th className="py-1">Description of Service Category</th>
                  <th className="py-1 text-right">Amount ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {sog.sectionI.B_transferOfRemainsAmount > 0 && (
                  <tr>
                    <td className="py-1.5">B. Transfer of Remains to Funeral Establishment (NYC Radius)</td>
                    <td className="py-1.5 text-right font-mono">${sog.sectionI.B_transferOfRemainsAmount.toFixed(2)}</td>
                  </tr>
                )}
                {sog.sectionI.C1_embalmingAmount > 0 && (
                  <tr>
                    <td className="py-1.5">C1. Embalming & Sanitary Preservation (Explicit Authorization Acknowledged)</td>
                    <td className="py-1.5 text-right font-mono">${sog.sectionI.C1_embalmingAmount.toFixed(2)}</td>
                  </tr>
                )}
                {sog.sectionI.C2_dressingCasketingAmount > 0 && (
                  <tr>
                    <td className="py-1.5">C2. Other Preparation of the Remains (Cosmetology, Dressing, Casketing)</td>
                    <td className="py-1.5 text-right font-mono">${sog.sectionI.C2_dressingCasketingAmount.toFixed(2)}</td>
                  </tr>
                )}
                <tr>
                  <td className="py-1.5">D. Basic Services of Funeral Director & Staff (Non-Declinable Overhead)</td>
                  <td className="py-1.5 text-right font-mono">${sog.sectionI.D_basicArrangementsAmount.toFixed(2)}</td>
                </tr>
                {sog.sectionI.E1_supervisionVisitationAmount > 0 && (
                  <tr>
                    <td className="py-1.5">E1. Supervision for Visitation / Wake</td>
                    <td className="py-1.5 text-right font-mono">${sog.sectionI.E1_supervisionVisitationAmount.toFixed(2)}</td>
                  </tr>
                )}
                {sog.sectionI.F1_facilitiesVisitationAmount > 0 && (
                  <tr>
                    <td className="py-1.5">F1. Facilities for Visitation / Viewing ({caseData.serviceSelections.viewingParlor})</td>
                    <td className="py-1.5 text-right font-mono">${sog.sectionI.F1_facilitiesVisitationAmount.toFixed(2)}</td>
                  </tr>
                )}
                {sog.sectionI.F2_facilitiesFuneralServiceAmount > 0 && (
                  <tr>
                    <td className="py-1.5">F2. Facilities & Staff for Funeral Ceremony ({caseData.serviceSelections.serviceVenueName || "Benta's Main Sanctuary"})</td>
                    <td className="py-1.5 text-right font-mono">${sog.sectionI.F2_facilitiesFuneralServiceAmount.toFixed(2)}</td>
                  </tr>
                )}
                {sog.sectionI.F3_repastRoomAmount > 0 && (
                  <tr>
                    <td className="py-1.5">F3. Fellowship Repast Reception Facility</td>
                    <td className="py-1.5 text-right font-mono">${sog.sectionI.F3_repastRoomAmount.toFixed(2)}</td>
                  </tr>
                )}
                {sog.sectionI.G_totalLiveryAmount > 0 && (
                  <tr>
                    <td className="py-1.5">G. Livery & Transportation Fleet (Hearse, Lead, Limousines)</td>
                    <td className="py-1.5 text-right font-mono">${sog.sectionI.G_totalLiveryAmount.toFixed(2)}</td>
                  </tr>
                )}
                {sog.sectionI.H1_casketAmount > 0 && (
                  <tr>
                    <td className="py-1.5">
                      H1. Casket / Alternative Container: <strong>{sog.sectionI.H1_casketModelNameOrNumber || "Selected Casket"}</strong>
                    </td>
                    <td className="py-1.5 text-right font-mono">${sog.sectionI.H1_casketAmount.toFixed(2)}</td>
                  </tr>
                )}
                {sog.sectionI.H2_outerReceptacleAmount > 0 && (
                  <tr>
                    <td className="py-1.5">
                      H2. Outer Burial Container / Vault: <strong>{sog.sectionI.H2_outerReceptacleModelName || "Burial Vault"}</strong>
                    </td>
                    <td className="py-1.5 text-right font-mono">${sog.sectionI.H2_outerReceptacleAmount.toFixed(2)}</td>
                  </tr>
                )}
                {sog.sectionI.H3_urnAmount > 0 && (
                  <tr>
                    <td className="py-1.5">
                      H3. Cremation Urn / Keepsake: <strong>{sog.sectionI.H3_urnModelName || "Memorial Urn"}</strong>
                    </td>
                    <td className="py-1.5 text-right font-mono">${sog.sectionI.H3_urnAmount.toFixed(2)}</td>
                  </tr>
                )}
                {sog.sectionI.I6_totalFlowersAmount > 0 && (
                  <tr>
                    <td className="py-2" colSpan={2}>
                      <div className="flex justify-between font-semibold border-b border-neutral-200 pb-1">
                        <span>I6. Floral Arrangements &amp; Custom Tributes (Benta&apos;s Florist Collection):</span>
                        <span className="font-mono font-bold">${sog.sectionI.I6_totalFlowersAmount.toFixed(2)}</span>
                      </div>
                      <div className="pt-1.5 space-y-1.5 pl-3">
                        {(sog.sectionI.I6_flowerItems || []).map((f) => (
                          <div key={f.id} className="flex items-center justify-between text-[11px] text-neutral-700 bg-neutral-50/70 p-1.5 rounded border border-neutral-200/60">
                            <div className="flex items-center space-x-2">
                              {f.imageUrl && (
                                <img
                                  src={f.imageUrl}
                                  alt={f.description}
                                  className="w-8 h-8 rounded object-cover border border-neutral-300 shrink-0"
                                />
                              )}
                              <div>
                                <span className="font-semibold text-neutral-900">
                                  {f.code ? `[${f.code}] ` : ''}{f.name || f.description}
                                </span>
                                <div className="text-[10px] text-neutral-500">
                                  {f.size && <span className="uppercase font-bold text-neutral-700">{f.size}</span>}
                                  {f.ribbonText && <span className="text-[#991b1b] italic ml-1.5 font-medium">&quot;{f.ribbonText}&quot;</span>}
                                </div>
                              </div>
                            </div>
                            <div className="text-right font-mono font-medium">
                              {f.quantity} &times; ${f.unitPrice.toFixed(2)} = ${(f.quantity * f.unitPrice).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}

              </tbody>
              <tfoot>
                <tr className="font-bold border-t-2 border-neutral-900">
                  <td className="pt-2">Subtotal — Section I (Funeral Home Charges):</td>
                  <td className="pt-2 text-right font-mono text-sm">${sog.sectionI.totalFuneralHomeCharges.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* SECTION II: CASH ADVANCES */}
          <div className="space-y-2">
            <div className="flex justify-between items-center bg-neutral-900 text-white px-2.5 py-1 rounded">
              <h2 className="font-bold text-xs uppercase tracking-wider">
                Section II — Cash Advance Items (Disbursements Paid on Behalf of Family)
              </h2>
              <button
                onClick={handleOpenChecks}
                className="bg-[#991b1b] hover:bg-red-800 text-white font-bold text-[10px] px-2.5 py-0.5 rounded transition flex items-center gap-1 border border-amber-400/40 print:hidden"
              >
                <HandCoins className="w-3 h-3 text-amber-300" />
                <span>Print Checks (${sog.sectionII.totalCashAdvances.toFixed(2)})</span>
              </button>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-300 text-[10px] text-neutral-500 uppercase">
                  <th className="py-1">Cash Advance Category</th>
                  <th className="py-1 text-right">Amount ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {sog.sectionII.cemeteryOrCrematoryAmount > 0 && (
                  <tr>
                    <td className="py-1.5">
                      Cemetery / Crematory Fee ({sog.sectionII.cemeteryOrCrematoryName || caseData.serviceSelections.crematoryOrCemeteryName || "Woodlawn Crematory"})
                    </td>
                    <td className="py-1.5 text-right font-mono">${sog.sectionII.cemeteryOrCrematoryAmount.toFixed(2)}</td>
                  </tr>
                )}
                {sog.sectionII.deathCertificateTranscriptsAmount > 0 && (
                  <tr>
                    <td className="py-1.5">
                      Certified Death Certificate Transcripts ({sog.sectionII.deathCertificateTranscriptsCount} Copies @ NYC Health Dept)
                    </td>
                    <td className="py-1.5 text-right font-mono">${sog.sectionII.deathCertificateTranscriptsAmount.toFixed(2)}</td>
                  </tr>
                )}
                {sog.sectionII.clergyHonorariaAmount > 0 && (
                  <tr>
                    <td className="py-1.5">
                      Clergy Honorarium / Church Officiant ({sog.sectionII.clergyChurchName || "Harlem Minister Guild"})
                    </td>
                    <td className="py-1.5 text-right font-mono">${sog.sectionII.clergyHonorariaAmount.toFixed(2)}</td>
                  </tr>
                )}
                {sog.sectionII.organistMusicianAmount > 0 && (
                  <tr>
                    <td className="py-1.5">
                      Organist / Vocalist ({sog.sectionII.organistMusicianName || "Sanctuary Organist"})
                    </td>
                    <td className="py-1.5 text-right font-mono">${sog.sectionII.organistMusicianAmount.toFixed(2)}</td>
                  </tr>
                )}
                {sog.sectionII.pallbearersAmount > 0 && (
                  <tr>
                    <td className="py-1.5">
                      Pallbearers Professional Service Crew ({sog.sectionII.pallbearersCount || 4} Staff)
                    </td>
                    <td className="py-1.5 text-right font-mono">${sog.sectionII.pallbearersAmount.toFixed(2)}</td>
                  </tr>
                )}
                {(sog.sectionII.bridgeAndRoadTollsAmount > 0 || sog.sectionII.gratuitiesLiveryAndStaffAmount > 0) && (
                  <tr>
                    <td className="py-1.5">
                      Bridge &amp; Road Tolls / Chauffeur Service Pool
                    </td>
                    <td className="py-1.5 text-right font-mono">${(sog.sectionII.bridgeAndRoadTollsAmount + sog.sectionII.gratuitiesLiveryAndStaffAmount).toFixed(2)}</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="font-bold border-t-2 border-neutral-900">
                  <td className="pt-2">Subtotal — Section II (Cash Advances):</td>
                  <td className="pt-2 text-right font-mono text-sm">${sog.sectionII.totalCashAdvances.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* SECTION III: SUMMARY OF CHARGES */}
          <div className="space-y-2">
            <h2 className="font-bold text-xs uppercase tracking-wider bg-neutral-900 text-white px-2.5 py-1 rounded">
              Section III — Summary of Total Charges & Balance Due
            </h2>
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-300 space-y-2">
              <div className="flex justify-between">
                <span>1. Total Funeral Home Charges (Section I):</span>
                <span className="font-mono font-bold">${sog.sectionIII.funeralHomeChargesTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>2. Total Cash Advances (Section II):</span>
                <span className="font-mono font-bold">${sog.sectionIII.cashAdvancesTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-neutral-300 pt-2 text-sm font-bold text-neutral-900">
                <span>TOTAL ESTIMATED FUNERAL CHARGES:</span>
                <span className="font-mono text-[#991b1b]">${sog.sectionIII.totalFuneralCharges.toFixed(2)}</span>
              </div>
              {sog.sectionIII.lessCreditsAndInsurance > 0 && (
                <div className="flex justify-between text-emerald-800 font-semibold">
                  <span>Less: Verified Insurance / HRA / Deposit Credits:</span>
                  <span className="font-mono">-${sog.sectionIII.lessCreditsAndInsurance.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between border-t-2 border-neutral-900 pt-2 text-base font-bold text-neutral-950">
                <span>ESTIMATED BALANCE DUE:</span>
                <span className="font-mono text-[#991b1b]">${sog.sectionIII.balanceDue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* TOTAL SUMMARY & SETTLEMENT */}
          <div className="p-4 bg-neutral-100 rounded-xl border border-neutral-300 space-y-2">
            <div className="flex justify-between text-sm font-bold text-neutral-900">
              <span>TOTAL ESTIMATED FUNERAL CONTRACT AMOUNT:</span>
              <span className="font-mono text-base text-[#991b1b]">${caseData.totalAmountDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            {caseData.splitBilling && caseData.splitBilling.length > 0 && (
              <div className="pt-2 border-t border-neutral-200 text-[11px] text-neutral-600 space-y-1">
                <span className="font-bold block text-neutral-800">Approved Split-Billing Allocations:</span>
                {caseData.splitBilling.map((b, i) => (
                  <div key={i} className="flex justify-between">
                    <span>• {b.payerType} ({b.providerName})</span>
                    <span className="font-mono font-semibold">${b.amountAllocated.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* STATUTORY DISCLOSURES & SIGNATURE BLOCK */}
          <div className="pt-4 border-t-2 border-neutral-900 space-y-4">
            <p className="text-[10px] text-neutral-500 leading-relaxed italic">
              <strong>Statutory Disclosure (10 NYCRR § 77.8):</strong> Embalming is not required by law. Embalming may be, however, in certain cases required by the funeral home. If embalming is selected, it is with the explicit consent of the family as recorded above. If charges are made for goods or services selected by you, you are entitled to a complete itemized explanation.
            </p>

            <div className="grid grid-cols-2 gap-8 pt-6">
              <div className="border-t border-neutral-900 pt-2 space-y-1">
                <p className="font-bold">Signature of Purchaser / Next of Kin</p>
                <p className="text-[10px] text-neutral-600">eSigned via BFH Family Portal: {caseData.informant.fullName}</p>
                <p className="text-[10px] text-neutral-400 font-mono">Timestamp: {sog.sectionIV.termsAcknowledgement.acknowledgedDate}</p>
              </div>

              <div className="border-t border-neutral-900 pt-2 space-y-1">
                <p className="font-bold">Licensed Funeral Director</p>
                <p className="text-[10px] text-neutral-600 font-serif-title italic font-bold">Jason Benta, LFD</p>
                <p className="text-[10px] text-neutral-400 font-mono">NYS LFD License #08850</p>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 3-Part Cash Advance Check Printer Modal */}
      {isInternalCheckPrinterOpen && (
        <CashAdvanceCheckPrinterModal
          isOpen={isInternalCheckPrinterOpen}
          onClose={() => setIsInternalCheckPrinterOpen(false)}
          caseData={caseData}
        />
      )}

    </div>
  );
};
