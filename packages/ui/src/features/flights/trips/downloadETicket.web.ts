import { fetchETicketPdfMobile } from '../useMyTripsMobile';

// Fetches the booking's e-ticket PDF with the signed-in session and saves it
// through the browser as GoVoylo-ETicket-<ref>.pdf (the web counterpart of the
// mobile share sheet).
export async function downloadETicketWeb(tripBookingId: string, bookingRefNo: string): Promise<void> {
  const pdf = await fetchETicketPdfMobile(tripBookingId);
  const url = URL.createObjectURL(pdf);
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = `GoVoylo-ETicket-${bookingRefNo}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    // Give the browser a moment to start the download before freeing the blob.
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  }
}
