"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
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
    <div className="min-h-screen w-full overflow-x-hidden" style={{ background: "#FFFEF0" }}>
      <Navbar />
      <div className="w-full">
        <BuyNumber />
      </div>
    </div>
  );
}
