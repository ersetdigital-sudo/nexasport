"use client";

/**
 * Store demo /penawaran — in-memory module singleton (TANPA localStorage,
 * TANPA database/API). Hilang saat tab ditutup; "Reset Demo" mengembalikan
 * seed awal. Sengaja terisolasi dari data & session app asli.
 */
import { useEffect, useState, useSyncExternalStore } from "react";
import { seedDemo, type DemoState } from "@/lib/demo-seed";

let state: DemoState = seedDemo();
const subs = new Set<() => void>();

const notify = () => subs.forEach((l) => l());

export function setDemo(patch: Partial<DemoState>) {
  state = { ...state, ...patch };
  notify();
}

export function resetDemo() {
  state = seedDemo();
  notify();
}

export function useDemo(): DemoState {
  return useSyncExternalStore(
    (cb) => {
      subs.add(cb);
      return () => subs.delete(cb);
    },
    () => state,
    // Server snapshot: state modul juga ada di sisi server (seed deterministik
    // dari Date.now(), jadi cukup aman untuk render awal).
    () => state
  );
}

/* ── Toast demo (ephemeral, in-memory) ── */
type ToastFn = (msg: string) => void;
const toastSubs = new Set<ToastFn>();

export function demoToast(msg: string) {
  toastSubs.forEach((f) => f(msg));
}

export function useDemoToast(): string {
  const [msg, setMsg] = useState("");
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const fn: ToastFn = (m) => {
      setMsg(m);
      clearTimeout(timer);
      timer = setTimeout(() => setMsg(""), 2_600);
    };
    toastSubs.add(fn);
    return () => {
      toastSubs.delete(fn);
      clearTimeout(timer);
    };
  }, []);
  return msg;
}

/* ── Product tour: tampil sekali per kunjungan (in-memory, bukan localStorage) ── */
let tourSudah = false;
export const tourSudahDitampilkan = () => tourSudah;
export function tandaiTourSelesai() {
  tourSudah = true;
}
