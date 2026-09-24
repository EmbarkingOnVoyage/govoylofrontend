import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AppScreen,
  NavigationRule,
  NAVIGATION_FLOW_ENGINE,
  SCREEN_TO_PATH,
  PATH_TO_SCREEN,
} from '@workspace/core';

// Web-only, react-router-backed replacement for @workspace/core's
// useFlowNavigation. Same { currentScreen, navigateByRule } shape and the
// same "throw on illegal transition" contract-guard behavior, but resolves
// through real browser URLs instead of an in-memory history stack, so every
// screen with an entry in SCREEN_TO_PATH is bookmarkable/refreshable/back-
// button-able. Kept out of @workspace/core so the web-only react-router-dom
// dependency never touches the shared, cross-platform package.
export function useWebFlowNavigation(initialScreen: AppScreen = 'Landing') {
  const navigate = useNavigate();
  const location = useLocation();
  const currentScreen = PATH_TO_SCREEN[location.pathname] ?? initialScreen;

  const navigateByRule = useCallback((rule: NavigationRule) => {
    if (rule === 'ON_BACK') {
      navigate(-1);
      return;
    }

    const nextScreen = NAVIGATION_FLOW_ENGINE[currentScreen]?.[rule];

    if (!nextScreen) {
      const errorMsg = `CRITICAL VALIDATION ERROR: Trigger Rule "${rule}" is completely illegal from your current screen position "${currentScreen}". You must register this flow path in NavigationConfig.ts first.`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    const nextPath = SCREEN_TO_PATH[nextScreen];

    if (!nextPath) {
      const errorMsg = `CRITICAL ROUTING ERROR: Screen "${nextScreen}" has no registered URL path. Add it to SCREEN_TO_PATH in navigationConfig.ts.`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    navigate(nextPath);
  }, [currentScreen, navigate]);

  return { currentScreen, navigateByRule };
}
