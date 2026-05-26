import { BrainSubnav } from "@/components/ai-brain/brain-subnav";

export default function AiBrainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <BrainSubnav />
      {children}
    </div>
  );
}
