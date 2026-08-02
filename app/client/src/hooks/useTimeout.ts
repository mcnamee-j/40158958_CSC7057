import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";

const IDLE_TIMOUT_MS = 20 * 60 * 1000; //20mins
const CHECK_MS = 30 * 1000; //checks for activity every 30 seconds

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
        Date.now() - last_active.current > IDLE_TIMOUT_MS
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
