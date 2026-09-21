"use client";

import { useRouter } from "next/navigation";

const grades = [
  { id: "1", name: "Kelas 1", level: "Tingkat Dasar" },
  { id: "2", name: "Kelas 2", level: "Tingkat Dasar" },
  { id: "3", name: "Kelas 3", level: "Tingkat Dasar" },
  { id: "4", name: "Kelas 4", level: "Tingkat Lanjutan" },
  { id: "5", name: "Kelas 5", level: "Tingkat Lanjutan" },
  { id: "6", name: "Kelas 6", level: "Tingkat Lanjutan" },
];

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#f7faf7] text-[#172019]">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-[#e3ebe3] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          {/* BRAND */}
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f3e9] text-2xl shadow-sm">
              📚
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#397343]">
                Student Assessment
              </p>

              <h1 className="mt-0.5 text-lg font-extrabold tracking-tight sm:text-xl">
                Perkembangan Siswa
              </h1>
            </div>
          </div>

          {/* PROFILE */}
          <button
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e2ebe2] bg-[#edf5ed] text-lg transition hover:scale-105 hover:bg-[#e3f0e3]"
            aria-label="Profil"
          >
            👤
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-5 pb-20 pt-10 sm:px-8 sm:pt-14 lg:px-10">
        {/* HERO */}
        <div className="relative mb-10 overflow-hidden rounded-[2rem] border border-[#dfe9df] bg-white px-6 py-8 shadow-sm sm:px-9 sm:py-10">
          {/* Decorative circles */}
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-[#eef7ee]" />
          <div className="absolute -bottom-24 right-32 h-40 w-40 rounded-full bg-[#f5faf5]" />

          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#edf6ed] px-3.5 py-1.5 text-xs font-bold text-[#397343]">
              <span className="h-2 w-2 rounded-full bg-[#397343]" />
              Sistem Penilaian Peserta Didik
            </div>

            <p className="text-sm font-semibold text-[#397343]">
              Selamat datang Orang tua wali 👋
            </p>

            <h2 className="mt-2 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Pilih Tingkat Kelas
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-500 sm:text-base">
              Pilih tingkat kelas terlebih dahulu untuk melihat daftar kelas dan
              perkembangan peserta didik.
            </p>
          </div>
        </div>

        {/* SECTION TITLE */}
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h3 className="text-xl font-extrabold tracking-tight sm:text-2xl">
              Daftar Tingkat
            </h3>

            <p className="mt-1 text-sm text-gray-400">
              Pilih kelas untuk melanjutkan
            </p>
          </div>

          <div className="hidden rounded-full bg-white px-4 py-2 text-xs font-semibold text-gray-400 shadow-sm sm:block">
            {grades.length} Tingkat
          </div>
        </div>

        {/* GRADE GRID */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {grades.map((grade) => (
            <button
              key={grade.id}
              onClick={() => router.push(`/tingkat/${grade.id}`)}
              className="group relative overflow-hidden rounded-[1.75rem] border border-[#dfe8df] bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#bdd4be] hover:shadow-xl active:scale-[0.98]"
            >
              {/* Background decoration */}
              <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#eef7ee] transition-all duration-500 group-hover:scale-125" />

              <div className="absolute -bottom-16 -right-5 h-32 w-32 rounded-full bg-[#f8fbf8] transition-all duration-500 group-hover:translate-x-3" />

              <div className="relative">
                {/* TOP */}
                <div className="flex items-start justify-between">
                  {/* NUMBER */}
                  <div className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-[#eaf4ea] text-2xl font-extrabold text-[#397343] shadow-sm transition duration-300 group-hover:scale-105 group-hover:bg-[#397343] group-hover:text-white">
                    {grade.id}
                  </div>

                  {/* ARROW */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f4f8f4] text-lg text-[#397343] transition-all duration-300 group-hover:translate-x-1 group-hover:bg-[#eaf4ea]">
                    →
                  </div>
                </div>

                {/* TEXT */}
                <div className="mt-7">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {grade.level}
                  </p>

                  <h4 className="mt-1 text-2xl font-extrabold tracking-tight text-[#172019]">
                    {grade.name}
                  </h4>

                  <p className="mt-2 text-sm text-gray-400">
                    Lihat daftar kelas
                  </p>
                </div>

                {/* BOTTOM LINE */}
                <div className="mt-6 flex items-center gap-2 text-xs font-bold text-[#397343]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#397343]" />
                  Buka tingkat kelas
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* INFO */}
        <div className="mt-8 rounded-2xl border border-[#e2ebe2] bg-white px-5 py-4 shadow-sm sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#edf6ed]">
              ℹ️
            </div>

            <div>
              <p className="text-sm font-bold text-gray-700">Informasi</p>

              <p className="mt-1 text-xs leading-5 text-gray-400 sm:text-sm">
                Pilih tingkat kelas untuk melihat rombel dan daftar peserta
                didik yang tersedia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#e2e9e2] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-7 text-center sm:px-8">
          <p className="text-xs font-medium text-gray-400">
            Student Assessment
            <span className="mx-2">·</span>
            Sistem Perkembangan Peserta Didik
          </p>
        </div>
      </footer>
    </main>
  );
}
