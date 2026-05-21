import { SalesInboxLayout } from "@/components/sales";
import { mockConversations } from "@/mocks";

export default function SalesInboxPage() {
  return <SalesInboxLayout conversations={mockConversations} />;
}
