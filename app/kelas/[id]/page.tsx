"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Student = {
  id: string;
  name: string;
  nis: string | null;
};

type ClassInfo = {
  id: string;
  name: string;
  grade_level: string | number;
};

export default function ClassPage() {
  const router = useRouter();
  const params = useParams();

  const classId = String(params.id);

  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (classId) {
      loadData();
    }
  }, [classId]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      // ============================
      // AMBIL DATA KELAS
      // ============================
      const { data: classData, error: classError } = await supabase
        .from("classes")
        .select("id, name, grade_level")
        .eq("id", classId)
        .single();

      if (classError) {
        console.error("CLASS ERROR:", classError);
        setError("Gagal mengambil informasi kelas.");
        return;
      }

      if (!classData) {
        setError("Kelas tidak ditemukan.");
        return;
      }

      setClassInfo(classData);

      console.log("CLASS DATA:", classData);

      // ============================
      // AMBIL DATA SISWA
      // ============================
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("id, name, nis")
        .eq("class_name", classData.name)
        .order("name");

      if (studentError) {
        console.error("STUDENT ERROR:", studentError);
        setError("Gagal mengambil daftar siswa.");
        return;
      }

      console.log("STUDENT DATA:", studentData);

      setStudents(studentData ?? []);
    } catch (e) {
      console.error("LOAD DATA ERROR:", e);
      setError("Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f9f6] text-[#172019]">
      {/* HEADER */}
      <header className="border-b border-[#e3eae3] bg-white">
        <div className="mx-auto flex min-h-[76px] max-w-6xl items-center px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="mr-4 flex h-10 w-10 items-center justify-center rounded-full text-xl hover:bg-gray-100"
          >
            ←
          </button>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#397343]">
              Student Assessment
            </p>

            <h1 className="text-lg font-bold sm:text-xl">
              {loading ? "Memuat..." : (classInfo?.name ?? "Kelas")}
            </h1>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-semibold text-[#397343]">
            Tingkat {classInfo?.grade_level ?? "-"}
          </p>

          <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
            Daftar Peserta Didik
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Pilih peserta didik untuk melihat perkembangan dan hasil penilaian.
          </p>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#397343]" />

            <p className="text-sm text-gray-500">Memuat daftar siswa...</p>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="rounded-3xl border border-red-100 bg-white p-8 text-center">
            <div className="text-4xl">⚠️</div>

            <h3 className="mt-4 font-bold">Terjadi Kesalahan</h3>

            <p className="mt-2 text-sm text-red-500">{error}</p>

            <button
              onClick={loadData}
              className="mt-5 rounded-xl bg-[#397343] px-5 py-2.5 text-sm font-semibold text-white"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && students.length === 0 && (
          <div className="rounded-3xl border border-[#e1e8e1] bg-white p-10 text-center">
            <div className="text-5xl">👨‍🎓</div>

            <h3 className="mt-4 font-bold">Belum Ada Siswa</h3>

            <p className="mt-2 text-sm text-gray-500">
              Belum ada peserta didik di kelas ini.
            </p>
          </div>
        )}

        {/* STUDENTS */}
        {!loading && !error && students.length > 0 && (
          <>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Jumlah peserta didik</p>

                <p className="text-xl font-bold">{students.length} Siswa</p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf3ea] text-xl">
                👨‍🎓
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {students.map((student, index) => (
                <button
                  key={student.id}
                  onClick={() => router.push(`/siswa/${student.id}`)}
                  className="group rounded-3xl border border-[#e0e8e0] bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#eaf3ea] font-bold text-[#397343]">
                      {index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-400">Peserta Didik</p>

                      <h3 className="mt-1 truncate font-bold">
                        {student.name}
                      </h3>

                      {student.nis && (
                        <p className="mt-1 text-xs text-gray-500">
                          NIS: {student.nis}
                        </p>
                      )}
                    </div>

                    <span className="text-lg text-[#397343]">→</span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </section>

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