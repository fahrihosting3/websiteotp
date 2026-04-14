"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import UserSidebar from "@/components/UserSidebar";
import BuyNumber from "@/components/BuyNumber";

export default function ServicesPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const current = getCurrentUser();
    if (!current) {
      router.push("/auth/login");
      return;
    }
    setUser(current);
  }, [router]);

  if (!user) {
    return null;
  }

  return (
    <UserSidebar>
      <div className="min-h-full">
        <BuyNumber />
      </div>
    </UserSidebar>
  );
}
