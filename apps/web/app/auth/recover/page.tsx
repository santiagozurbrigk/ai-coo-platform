"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { paths } from "@/routes";

function hashType(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.hash.slice(1)).get("type");
}

export default function RecoverPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        router.replace(paths.auth.updatePassword);
      } else if (session && hashType() === "recovery") {
        router.replace(paths.auth.updatePassword);
      } else if (session) {
        router.replace(paths.platform.dashboard);
      }
    });

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;

      if (hashType() === "recovery") {
        router.replace(paths.auth.updatePassword);
        return;
      }

      router.replace(paths.platform.dashboard);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return (
    <p className="text-center text-sm text-muted-foreground">Verificando…</p>
  );
}
