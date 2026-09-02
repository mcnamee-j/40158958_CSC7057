//-time indicator goes here (elapsed seconds) - needs formatted
export const time_elapsed_format = (seconds?: number): string => {
  if (seconds === undefined) return "";

  const mins = Math.floor(seconds / 60);
  if (mins < 1) return `${Math.floor(seconds)}s ago`;

  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};
