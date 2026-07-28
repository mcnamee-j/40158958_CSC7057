type BadgeVariant = "danger" | "warning" | "success" | "accent" | "neutral";

interface BadgeProps {
  label: string;
  variant: BadgeVariant;
}

//using Record type as its stricter than using an object - will flag errors
const variant_badges: Record<BadgeVariant, string> = {
  danger: "bg-status-danger-bg text-status-danger-text",
  warning: "bg-status-warning-bg text-status-warning-text",
  success: "bg-status-success-bg text-status-success-text",
  accent: "bg-status-accent-bg text-status-accent-text",
  neutral: "bg-status-accent-bg text-status-accent-text",
};

const Badge = ({ label, variant }: BadgeProps) => {
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-xs whitespace-nowrap ${variant_badges[variant]}`}
    >
      {label}
    </span>
  );
};

export default Badge;
