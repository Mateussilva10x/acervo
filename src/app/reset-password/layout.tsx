import { LightModeWrapper } from "@/components/layout/light-mode-wrapper";

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <LightModeWrapper>{children}</LightModeWrapper>;
}
