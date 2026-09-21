"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ClassItem = {
  id: string;
  name: string;
  grade_level: string | number;
};

export default function GradePage() {
  const router = useRouter();
  const params = useParams();

  const grade = String(params.grade);

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadClasses();
  }, [grade]);

  async function loadClasses() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("classes")
      .select("id, name, grade_level")
      .eq("grade_level", grade)
      .order("name");

    if (error) {
      console.error(error);
      setError("Gagal mengambil daftar kelas.");
      setLoading(false);
      return;
    }

    setClasses(data ?? []);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#f6f9f6] text-[#172019]">
      {/* HEADER */}
      <header className="sticky top-0 z-20 border-b border-[#e3eae3] bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-[72px] max-w-6xl items-center px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.push("/")}
            className="mr-3 flex h-10 w-10 items-center justify-center rounded-full text-xl transition hover:bg-[#eef5ee] active:scale-95"
            aria-label="Kembali"
          >
            ←
          </button>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#397343]">
              Student Assessment
            </p>

            <h1 className="text-lg font-bold sm:text-xl">Tingkat {grade}</h1>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12 lg:px-8">
        {/* TITLE */}
        <div className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#eaf3ea] px-3 py-1.5 text-xs font-semibold text-[#397343]">
            <span>📚</span>
            Tingkat {grade}
          </div>

          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Pilih Nama Kelas
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
            Pilih nama kelas untuk melihat daftar peserta didik pada tingkat{" "}
            {grade}.
          </p>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[132px] animate-pulse rounded-3xl border border-[#e3eae3] bg-white"
              >
                <div className="flex h-full items-center gap-4 p-5">
                  <div className="h-14 w-14 rounded-2xl bg-[#edf3ed]" />

                  <div className="flex-1">
                    <div className="h-3 w-16 rounded bg-[#edf3ed]" />
                    <div className="mt-3 h-5 w-32 rounded bg-[#edf3ed]" />
                    <div className="mt-2 h-3 w-20 rounded bg-[#edf3ed]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl">
              ⚠️
            </div>

            <h3 className="mt-4 font-bold">Terjadi kesalahan</h3>

            <p className="mt-2 text-sm text-gray-500">{error}</p>

            <button
              onClick={loadClasses}
              className="mt-5 rounded-xl bg-[#397343] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2f6138] active:scale-95"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && classes.length === 0 && (
          <div className="rounded-3xl border border-[#e1e8e1] bg-white px-6 py-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#edf5ed] text-2xl">
              📚
            </div>

            <h3 className="mt-5 text-lg font-bold">Belum ada kelas</h3>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
              Belum ada kelas yang terdaftar untuk Tingkat {grade}.
            </p>

            <button
              onClick={() => router.push("/")}
              className="mt-5 rounded-xl border border-[#dce6dc] px-5 py-2.5 text-sm font-semibold text-[#397343] transition hover:bg-[#f1f7f1]"
            >
              ← Pilih Tingkat Lain
            </button>
          </div>
        )}

        {/* CLASS LIST */}
        {!loading && !error && classes.length > 0 && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">
                Daftar Kelas
              </p>

              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-500 shadow-sm ring-1 ring-[#e3eae3]">
                {classes.length} kelas
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {classes.map((item) => (
                <button
                  key={item.id}
                  onClick={() => router.push(`/kelas/${item.id}`)}
                  className="group relative overflow-hidden rounded-3xl border border-[#e0e8e0] bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#c9dccb] hover:shadow-lg active:scale-[0.98]"
                >
                  {/* Decorative circle */}
                  <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#f1f8f1] transition duration-300 group-hover:scale-125" />

                  <div className="relative">
                    <div className="flex items-start justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eaf3ea] text-2xl">
                        📚
                      </div>

                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f3f8f3] text-lg text-[#397343] transition group-hover:translate-x-1">
                        →
                      </div>
                    </div>

                    <div className="mt-5">
                      <p className="text-xs font-medium text-gray-400">Kelas</p>

                      <h3 className="mt-1 truncate text-xl font-bold">
                        {item.name}
                      </h3>

                      <div className="mt-3 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#397343]" />

                        <p className="text-sm text-gray-500">
                          Tingkat {item.grade_level}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 border-t border-[#edf1ed] pt-4">
                      <p className="text-xs font-medium text-[#397343]">
                        Lihat peserta didik →
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#e3e9e3] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center">
          <p className="text-xs text-gray-400">
            Student Assessment · Sistem Perkembangan Peserta Didik
          </p>
        </div>
      </footer>
    </main>
  );
}
