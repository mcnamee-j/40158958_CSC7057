// Automatically logs the user out after a period of inactivity -
// 20 mins
// (no mouse/keyboard/scroll activity) for session security

import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";

const IDLE_TIMEOUT_MS = 20 * 60 * 1000; //20mins
const CHECK_MS = 30 * 1000; //checks for activity every 30 seconds

// covers common forms of user interaction
const ACTIVE_EVENTS = ["mousemove", "keydown", "click", "scroll"];

export const useTimeout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const last_active = useRef<number | null>(null);

  useEffect(() => {
    if (!user) return;

    last_active.current = Date.now();

    const reset_timer = () => {
      last_active.current = Date.now();
    };

    ACTIVE_EVENTS.forEach((event) =>
      document.addEventListener(event, reset_timer),
    );

    const interval = setInterval(async () => {
      if (
        last_active.current !== null &&
        Date.now() - last_active.current > IDLE_TIMEOUT_MS
      ) {
        await logout();
        navigate("/login?expired=true", { replace: true });
      }
    }, CHECK_MS);

    return () => {
      ACTIVE_EVENTS.forEach((event) =>
        document.removeEventListener(event, reset_timer),
      );
      clearInterval(interval);
    };
  }, [user, logout, navigate]);
};
