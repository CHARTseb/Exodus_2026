import { useEffect, useState } from "react";
import type { DayEntry } from "../types";

export function useDays() {
  const [days, setDays] = useState<DayEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/data/days.json")
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return (await r.json()) as DayEntry[];
      })
      .then(setDays)
      .catch((e: any) => setError(String(e?.message ?? e)));
  }, []);

  return { days, error };
}
