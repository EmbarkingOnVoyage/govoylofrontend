import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { X, CircleAlert, CircleCheck, Info } from 'lucide-react-native';
import {
  useCancellationQuoteMobile,
  useCancelTripBookingMobile,
  type CancellationQuote,
  type TripBooking,
} from '@workspace/ui';
import { styles, RED } from './TripDetailsScreen.styles';
import { PURPLE, MUTED, GREEN } from './MyTripsScreen.styles';
import { REFUND_DESTINATION, formatCurrency, formatShortDate } from './myTripsHelpers';

interface CancelBookingModalProps {
  visible: boolean;
  booking: TripBooking;
  onClose: () => void;
}

// The four Figma "Cancel your booking?" variants, picked by the backend's quote:
// FreeCancellation, NonRefundable (taxes only), PartialRefund and Estimated (the
// supplier can't quote before cancelling, so the fee comes from its fare rules).
export const CancelBookingModal: React.FC<CancelBookingModalProps> = ({ visible, booking, onClose }) => {
  const quote = useCancellationQuoteMobile(booking.id, visible);
  const cancel = useCancelTripBookingMobile();

  const legs = [...booking.legs].sort((a, b) => a.legIndex - b.legIndex);
  const first = legs[0];
  const last = legs[legs.length - 1];
  const money = (amount: number) => formatCurrency(amount, booking.currencyCode);

  const handleConfirm = () => {
    cancel.mutate(
      { tripBookingId: booking.id },
      {
        onSuccess: (result) => {
          onClose();
          Alert.alert(
            'Booking cancelled',
            result.refundAmount != null
              ? `${money(result.refundAmount)} will be refunded to your original payment method within 5–7 working days.`
              : 'Your refund will be processed to your original payment method within 5–7 working days.'
          );
        },
        onError: (err) => Alert.alert('Could not cancel this booking', (err as Error)?.message || 'Please try again.'),
      }
    );
  };

  const renderNotice = (q: CancellationQuote) => {
    if (q.variant === 'NonRefundable') {
      return (
        <View style={[styles.noticeBox, { backgroundColor: '#FEF3E7' }]}>
          <CircleAlert size={18} color="#C2410C" strokeWidth={2} />
          <Text style={[styles.noticeText, { color: '#C2410C' }]}>
            The base fare won't be refunded. You'll only get back airport taxes and government fees.
          </Text>
        </View>
      );
    }
    if (q.variant === 'FreeCancellation') {
      return (
        <View style={[styles.noticeBox, { backgroundColor: '#E7F8EE' }]}>
          <CircleCheck size={18} color={GREEN} strokeWidth={2} />
          <Text style={[styles.noticeText, { color: GREEN }]}>
            <Text style={{ fontWeight: '700' }}>Free cancellation. </Text>
            Cancel now to get your full amount back, no fees.
          </Text>
        </View>
      );
    }
    return (
      <Text style={styles.modalIntro}>
        {q.variant === 'Estimated'
          ? "This action can't be undone. The airline sets the final refund, so this is our best estimate."
          : "This action can't be undone. Based on your fare rules, here's what you'll get back."}
      </Text>
    );
  };

  const renderBreakdown = (q: CancellationQuote) => {
    const feeLabel =
      q.variant === 'NonRefundable'
        ? 'Base fare (non-refundable)'
        : q.variant === 'FreeCancellation'
          ? 'Cancellation fees'
          : q.variant === 'Estimated'
            ? 'Est. airline cancellation fee'
            : 'Airline cancellation fee';
    // Whatever is neither refunded nor the airline's fee (add-ons, convenience fee).
    const other = q.amountPaid - q.cancellationCharges - q.refundAmount;
    const refundLabel =
      q.variant === 'NonRefundable'
        ? 'Taxes refunded to you'
        : q.variant === 'FreeCancellation'
          ? 'Full refund to you'
          : q.variant === 'Estimated'
            ? 'Estimated refund'
            : 'Refund to you';

    return (
      <View style={styles.breakdown}>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Amount paid</Text>
          <Text style={styles.breakdownValue}>{money(q.amountPaid)}</Text>
        </View>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>{feeLabel}</Text>
          {q.cancellationCharges > 0 ? (
            <Text style={styles.breakdownValue}>
              {q.isEstimate ? '~ ' : ''}−{money(q.cancellationCharges)}
            </Text>
          ) : (
            <Text style={[styles.breakdownValue, { color: GREEN }]}>{money(0)}</Text>
          )}
        </View>
        {other >= 1 ? (
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Add-ons & other charges (non-refundable)</Text>
            <Text style={styles.breakdownValue}>−{money(other)}</Text>
          </View>
        ) : null}
        <View style={[styles.fareDivider, { backgroundColor: '#D3DAE5' }]} />
        <View style={styles.refundRow}>
          <Text style={styles.refundLabel}>{refundLabel}</Text>
          <Text style={styles.refundAmount}>
            {q.isEstimate ? '~ ' : ''}
            {money(q.refundAmount)}
          </Text>
        </View>
        {q.isEstimate ? (
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
            <Info size={13} color={MUTED} strokeWidth={2} style={{ marginTop: 2 }} />
            <Text style={[styles.refundNote, { marginTop: 0, flex: 1 }]}>
              We'll confirm the final amount once the airline processes the cancellation. Refund goes to your
              original payment method.
            </Text>
          </View>
        ) : (
          <Text style={styles.refundNote}>{REFUND_DESTINATION}</Text>
        )}
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <TouchableOpacity style={styles.modalClose} onPress={onClose} disabled={cancel.isPending} hitSlop={8}>
            <X size={20} color="#3E4B64" strokeWidth={2} />
          </TouchableOpacity>
          <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Cancel your booking?</Text>
            {first ? (
              <View style={styles.modalRouteRow}>
                <Text style={styles.modalRoute}>
                  {first.origin} → {legs.length > 1 && last.destination === first.origin ? first.destination : last.destination}
                </Text>
                <Text style={styles.modalDate}>· {formatShortDate(first.travelDate)}</Text>
                {legs.length > 1 ? <Text style={styles.modalDate}>· Round trip</Text> : null}
                {quote.data?.variant === 'NonRefundable' ? (
                  <View style={[styles.fareChip, { backgroundColor: '#FDECEE' }]}>
                    <Text style={[styles.fareChipText, { color: RED }]}>Non-refundable fare</Text>
                  </View>
                ) : null}
              </View>
            ) : null}

            {quote.isLoading ? (
              <View style={styles.modalState}>
                <ActivityIndicator size="large" color={PURPLE} />
                <Text style={[styles.refundNote, { marginTop: 12 }]}>Checking your refund with the airline…</Text>
              </View>
            ) : quote.isError || !quote.data ? (
              <View style={[styles.noticeBox, { backgroundColor: '#FEF3E7' }]}>
                <CircleAlert size={18} color="#C2410C" strokeWidth={2} />
                <Text style={[styles.noticeText, { color: '#C2410C' }]}>
                  {(quote.error as Error)?.message || "We couldn't get the refund amount right now."} You can still
                  cancel — the refund will follow the airline's fare rules.
                </Text>
              </View>
            ) : (
              <>
                {renderNotice(quote.data)}
                {renderBreakdown(quote.data)}
              </>
            )}

            {/* No action yet — post-booking fare rules aren't available in the app. */}
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.fareRulesLink}>View fare rules</Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalKeepButton} onPress={onClose} disabled={cancel.isPending}>
                <Text style={styles.modalKeepText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalCancelButton, (cancel.isPending || quote.isLoading) && styles.disabled]}
                onPress={handleConfirm}
                disabled={cancel.isPending || quote.isLoading}
              >
                {cancel.isPending ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalCancelText}>Cancel Booking</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
