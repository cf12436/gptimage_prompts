import type { Metadata } from "next";
import { PrivacyContent } from "@/components/document-content";
export const metadata: Metadata = {
  title: "隐私说明",
  alternates: { canonical: "/privacy/" },
};
export default function Privacy() {
  return <PrivacyContent />;
}
