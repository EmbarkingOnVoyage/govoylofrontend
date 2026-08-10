import { useState, useCallback } from 'react';
import { AppScreen, NavigationRule, NAVIGATION_FLOW_ENGINE } from './NavigationConfig';

export function useFlowNavigation(initialScreen: AppScreen = 'Landing') {
  const [history, setHistory] = useState<AppScreen[]>([initialScreen]);
  const currentScreen = history[history.length - 1];

  const navigateByRule = useCallback((rule: NavigationRule) => {
    // 1. Handle standard back navigation tracking cleanly
    if (rule === 'ON_BACK') {
      if (history.length > 1) {
        setHistory(prev => prev.slice(0, -1));
      }
      return;
    }

    // 2. Automated Validation Check: Lookup destination based on CURRENT screen + TRIGGER rule
    const nextScreen = NAVIGATION_FLOW_ENGINE[currentScreen]?.[rule];

    // 3. Strict Contract Guard: If a developer tries an unmapped or illegal flow, crash immediately
    if (!nextScreen) {
      const errorMsg = `CRITICAL VALIDATION ERROR: Trigger Rule "${rule}" is completely illegal from your current screen position "${currentScreen}". You must register this flow path in NavigationConfig.ts first.`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    // 4. Update the memory engine layout state safely
    setHistory(prev => [...prev, nextScreen]);
  }, [currentScreen, history]);

  return { currentScreen, navigateByRule };
}
