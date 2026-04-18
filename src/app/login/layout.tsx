import { LightModeWrapper } from "@/components/layout/light-mode-wrapper";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <LightModeWrapper>{children}</LightModeWrapper>;
}
