import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { fetchETicketPdfMobile } from '@workspace/ui';

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result).split(',')[1] ?? '');
    reader.onerror = () => reject(new Error("Couldn't read the e-ticket."));
    reader.readAsDataURL(blob);
  });
}

// Downloads the booking's e-ticket PDF to the app's cache and opens the share
// sheet, from which it can be opened in a PDF viewer, saved or sent on.
export async function downloadETicket(tripBookingId: string, bookingRefNo: string): Promise<void> {
  const pdf = await fetchETicketPdfMobile(tripBookingId);
  const fileUri = `${FileSystem.cacheDirectory}GoVoylo-ETicket-${bookingRefNo}.pdf`;
  await FileSystem.writeAsStringAsync(fileUri, await blobToBase64(pdf), {
    encoding: FileSystem.EncodingType.Base64,
  });

  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing is not available on this device.');
  }
  await Sharing.shareAsync(fileUri, {
    mimeType: 'application/pdf',
    dialogTitle: `E-ticket ${bookingRefNo}`,
    UTI: 'com.adobe.pdf',
  });
}
