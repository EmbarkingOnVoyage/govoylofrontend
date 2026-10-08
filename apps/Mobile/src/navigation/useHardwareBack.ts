import { useEffect, useRef } from 'react';
import { BackHandler, type NativeEventSubscription } from 'react-native';

// Android hardware back for a state-driven app (no navigation library).
//
// Every screen that can go back registers a handler. Handlers are ordered by
// when their component first rendered, newest first: a parent always renders
// before its children, and a screen navigated to later renders later, so the
// deepest visible screen gets the press first. (React runs effects
// child-first, so ordering by BackHandler registration would let a parent such
// as the tab shell jump ahead of the screen inside it.)
//
// A handler returns false to pass the press on to the next one; when nobody
// handles it, Android's default runs (the app closes).

type Handler = () => boolean | void;

let nextOrder = 0;
const handlers = new Map<number, { current: Handler }>();
let subscription: NativeEventSubscription | null = null;

function onHardwareBack(): boolean {
  const orders = [...handlers.keys()].sort((a, b) => b - a);
  for (const order of orders) {
    if (handlers.get(order)!.current() !== false) return true;
  }
  return false;
}

export function useHardwareBack(handler: Handler, enabled = true): void {
  const order = useRef<number | null>(null);
  if (order.current === null) {
    nextOrder += 1;
    order.current = nextOrder;
  }

  const latest = useRef<Handler>(handler);
  latest.current = enabled ? handler : () => false;

  useEffect(() => {
    const id = order.current!;
    handlers.set(id, latest);
    if (!subscription) {
      subscription = BackHandler.addEventListener('hardwareBackPress', onHardwareBack);
    }
    return () => {
      handlers.delete(id);
      if (handlers.size === 0 && subscription) {
        subscription.remove();
        subscription = null;
      }
    };
  }, []);
}
