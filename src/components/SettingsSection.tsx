import { ReactNode } from "react";

export default function SettingsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0">
      <div className="font-semibold">{title}:</div>

      <div className="px-2 flex flex-col gap-0">{children}</div>
    </div>
  );
}
