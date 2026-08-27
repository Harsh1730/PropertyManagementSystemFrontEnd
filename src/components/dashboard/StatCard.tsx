import type { LucideIcon } from "lucide-react";

interface StatCardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    color?: "blue" | "green" | "purple" | "amber" | "rose";
    footerText?: string;
    onClick?: () => void;
}

export function StatCard({
    label,
    value,
    icon: Icon,
    footerText,
    onClick,
}: StatCardProps) {
    return (
        <div
            className="stat-card"
            onClick={onClick}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span className="stat-label">{label}</span>
                <div style={{ color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
                    <Icon size={18} />
                </div>
            </div>

            <div className="stat-value">{value}</div>

            {footerText && (
                <div className="stat-footer-text">
                    {footerText}
                </div>
            )}
        </div>
    );
}

export default StatCard;