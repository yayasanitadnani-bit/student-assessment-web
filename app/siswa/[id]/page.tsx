"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Student = {
  id: string;
  name: string;
  nis: string | null;
  nisn: string | null;
  class_name: string | null;
  gender: string | null;
};

type Variable = {
  id: string;
  name: string;
  description: string | null;
};

type Point = {
  id: string;
  variable_id: string;
  name: string;
  description: string | null;
};

type Indicator = {
  id: string;
  point_id: string;
  name: string;
  description: string | null;
};

type Assessment = {
  id: string;
  student_id: string;
  variable_id: string;
  point_id: string | null;
  indicator_id: string | null;
  score: number | null;
  note: string | null;
  assessment_date: string | null;
  week_start: string | null;
  created_at: string;
};

type WeekOption = {
  key: string;
  start: string;
  end: string;
  label: string;
};

type VariableGroup = {
  variable: Variable;
  assessments: Assessment[];
  average: number;
};

const CATEGORY_ORDER = ["SIKAP", "KEHADIRAN", "TUGAS", "UH"];

function getStatus(score: number) {
  if (score < 60) {
    return {
      label: "Perlu Bimbingan",
      color: "text-red-500",
      bg: "bg-red-50",
      dot: "bg-red-500",
    };
  }

  if (score < 75) {
    return {
      label: "Cukup",
      color: "text-orange-500",
      bg: "bg-orange-50",
      dot: "bg-orange-500",
    };
  }

  if (score < 90) {
    return {
      label: "Baik",
      color: "text-blue-600",
      bg: "bg-blue-50",
      dot: "bg-blue-500",
    };
  }

  return {
    label: "Sangat Baik",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    dot: "bg-emerald-500",
  };
}

function formatDate(date: string | null) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function formatShortDate(date: string) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function getWeekEnd(start: string) {
  const date = new Date(`${start}T00:00:00`);
  date.setDate(date.getDate() + 4);

  return date.toISOString().slice(0, 10);
}

function getWeekStart(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);

  const day = date.getDay();

  const diff = day === 0 ? -6 : 1 - day;

  date.setDate(date.getDate() + diff);

  return date.toISOString().slice(0, 10);
}

function getVariableIcon(name: string) {
  const value = name.toUpperCase();

  if (value.includes("KEHADIR")) return "📅";
  if (value.includes("TUGAS")) return "📝";
  if (value.includes("UH")) return "📊";
  if (value.includes("SIKAP")) return "🌱";
  if (value.includes("DISIPLIN")) return "📊";

  return "📊";
}

function getCategoryName(variableName: string) {
  const name = variableName.toUpperCase();

  if (name.includes("SIKAP") || name.includes("AKHLAK")) {
    return "Sikap";
  }

  if (name.includes("KEHADIR")) {
    return "Kehadiran";
  }

  if (name.includes("TUGAS")) {
    return "Tugas";
  }

  if (
    name.includes("UH") ||
    name.includes("ULANGAN") ||
    name.includes("HARIAN")
  ) {
    return "UH";
  }

  if (name.includes("DISIPLIN")) {
    return "Disiplin";
  }

  return variableName;
}

export default function StudentPage() {
  const router = useRouter();
  const params = useParams();

  const studentId = String(params.id);

  const [student, setStudent] = useState<Student | null>(null);
  const [variables, setVariables] = useState<Variable[]>([]);
  const [points, setPoints] = useState<Point[]>([]);
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  const [selectedWeek, setSelectedWeek] = useState("");
  const [openVariables, setOpenVariables] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, [studentId]);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [
        studentResult,
        variablesResult,
        pointsResult,
        indicatorsResult,
        assessmentsResult,
      ] = await Promise.all([
        supabase
          .from("students")
          .select("id, name, nis, nisn, class_name, gender")
          .eq("id", studentId)
          .single(),

        supabase
          .from("assessment_variables")
          .select("id, name, description")
          .order("created_at"),

        supabase
          .from("assessment_points")
          .select("id, variable_id, name, description")
          .order("created_at"),

        supabase
          .from("assessment_indicators")
          .select("id, point_id, name, description")
          .order("created_at"),

        supabase
          .from("assessments")
          .select(
            "id, student_id, variable_id, point_id, indicator_id, score, note, assessment_date, week_start, created_at",
          )
          .eq("student_id", studentId)
          .order("assessment_date", {
            ascending: false,
          }),
      ]);

      if (studentResult.error) {
        console.error("STUDENT ERROR:", studentResult.error);
        throw new Error("Gagal mengambil data peserta didik.");
      }

      if (variablesResult.error) {
        console.error("VARIABLE ERROR:", variablesResult.error);
        throw new Error("Gagal mengambil data variabel penilaian.");
      }

      if (pointsResult.error) {
        console.error("POINT ERROR:", pointsResult.error);
        throw new Error("Gagal mengambil data kelompok penilaian.");
      }

      if (indicatorsResult.error) {
        console.error("INDICATOR ERROR:", indicatorsResult.error);
        throw new Error("Gagal mengambil data indikator.");
      }

      if (assessmentsResult.error) {
        console.error("ASSESSMENT ERROR:", assessmentsResult.error);
        throw new Error("Gagal mengambil data penilaian.");
      }

      const loadedAssessments = (assessmentsResult.data ?? []) as Assessment[];

      setStudent(studentResult.data as Student);
      setVariables((variablesResult.data ?? []) as Variable[]);
      setPoints((pointsResult.data ?? []) as Point[]);
      setIndicators((indicatorsResult.data ?? []) as Indicator[]);
      setAssessments(loadedAssessments);

      const weekKeys = loadedAssessments
        .map((item) => {
          if (item.week_start) {
            return item.week_start;
          }

          if (item.assessment_date) {
            return getWeekStart(item.assessment_date);
          }

          return null;
        })
        .filter(Boolean) as string[];

      const uniqueWeeks = [...new Set(weekKeys)].sort().reverse();

      if (uniqueWeeks.length > 0) {
        setSelectedWeek(uniqueWeeks[0]);
      }
    } catch (err) {
      console.error(err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan.");
      }
    } finally {
      setLoading(false);
    }
  }

  /*
   * ==========================================
   * DAFTAR MINGGU
   * ==========================================
   */

  /*
   * ==========================================
   * HELPER MINGGU ASSESSMENT
   * ==========================================
   */

  function getAssessmentWeekStart(assessment: Assessment) {
    // Prioritas utama: week_start
    if (assessment.week_start) {
      return assessment.week_start;
    }

    // Fallback kalau week_start kosong
    if (assessment.assessment_date) {
      return getWeekStart(assessment.assessment_date);
    }

    return null;
  }

  /*
   * ==========================================
   * DAFTAR MINGGU
   * ==========================================
   */

  const weeks = useMemo<WeekOption[]>(() => {
    const map = new Map<string, WeekOption>();

    assessments.forEach((assessment) => {
      const start = getAssessmentWeekStart(assessment);

      if (!start) return;

      const end = getWeekEnd(start);

      if (!map.has(start)) {
        map.set(start, {
          key: start,
          start,
          end,
          label: `${formatShortDate(start)} – ${formatShortDate(end)}`,
        });
      }
    });

    return [...map.values()].sort((a, b) => b.start.localeCompare(a.start));
  }, [assessments]);

  /*
   * ==========================================
   * PENILAIAN MINGGU TERPILIH
   * ==========================================
   */

  const selectedAssessments = useMemo(() => {
    if (!selectedWeek) return [];

    return assessments.filter((assessment) => {
      const week = getAssessmentWeekStart(assessment);

      return week === selectedWeek;
    });
  }, [assessments, selectedWeek]);

  /*
   * ==========================================
   * GROUP VARIABLE
   * ==========================================
   */

  const variableGroups = useMemo<VariableGroup[]>(() => {
    return variables
      .map((variable) => {
        const items = selectedAssessments.filter(
          (assessment) => assessment.variable_id === variable.id,
        );

        // Ambil hanya assessment yang memiliki nilai
        const scores = items
          .map((item) => item.score)
          .filter((score): score is number => score !== null);

        const average =
          scores.length > 0
            ? scores.reduce((sum, score) => sum + score, 0) / scores.length
            : 0;

        return {
          variable,
          assessments: items,
          average,
        };
      })
      .filter((group) => group.assessments.length > 0)
      .sort((a, b) => {
        const aName = getCategoryName(a.variable.name).toUpperCase();
        const bName = getCategoryName(b.variable.name).toUpperCase();

        const aIndex = CATEGORY_ORDER.indexOf(aName);
        const bIndex = CATEGORY_ORDER.indexOf(bName);

        return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
      });
  }, [variables, selectedAssessments]);
  function getPointName(pointId: string | null) {
    if (!pointId) return "";

    return points.find((point) => point.id === pointId)?.name ?? "";
  }

  function getPointCategory(pointId: string | null) {
    const name = getPointName(pointId).toUpperCase();

    if (name.includes("SIKAP") || name.includes("AKHLAK")) {
      return "SIKAP";
    }

    if (name.includes("KEHADIR")) {
      return "KEHADIRAN";
    }

    if (name.includes("TUGAS")) {
      return "TUGAS";
    }

    if (
      name.includes("UH") ||
      name.includes("ULANGAN") ||
      name.includes("HARIAN")
    ) {
      return "UH";
    }

    return "";
  }
  /*
   * ==========================================
   * SUMMARY
   * ==========================================
   */

  const summary = useMemo(() => {
    const result = CATEGORY_ORDER.map((category) => {
      const categoryAssessments = selectedAssessments.filter((assessment) => {
        const pointCategory = getPointCategory(assessment.point_id);

        return pointCategory === category;
      });

      const scores = categoryAssessments
        .map((assessment) => assessment.score)
        .filter((score): score is number => score !== null);

      const average =
        scores.length > 0
          ? scores.reduce((sum, score) => sum + score, 0) / scores.length
          : null;

      return {
        category,
        label:
          category === "SIKAP"
            ? "Sikap"
            : category === "KEHADIRAN"
              ? "Kehadiran"
              : category === "TUGAS"
                ? "Tugas"
                : "UH",
        average,
        count: scores.length,
      };
    });

    return result;
  }, [selectedAssessments, points]);

  /*
   * ==========================================
   * TOGGLE ACCORDION
   * ==========================================
   */

  function toggleVariable(id: string) {
    setOpenVariables((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  /*
   * ==========================================
   * LOADING
   * ==========================================
   */

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f9f6]">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="h-8 w-56 animate-pulse rounded-xl bg-white" />

          <div className="mt-8 h-36 animate-pulse rounded-3xl bg-white" />

          <div className="mt-8 grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-3xl bg-white"
              />
            ))}
          </div>

          <div className="mt-8 h-32 animate-pulse rounded-3xl bg-white" />
        </div>
      </main>
    );
  }

  /*
   * ==========================================
   * ERROR
   * ==========================================
   */

  if (error || !student) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f9f6] px-4">
        <div className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-2xl">
            ⚠️
          </div>

          <h2 className="mt-4 text-lg font-bold">Gagal Membuka Data</h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            {error || "Data peserta didik tidak ditemukan."}
          </p>

          <button
            onClick={loadData}
            className="mt-6 rounded-2xl bg-[#397343] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2f6238]"
          >
            Coba Lagi
          </button>
        </div>
      </main>
    );
  }

  /*
   * ==========================================
   * DETAIL VARIABLE
   * ==========================================
   */

  function getPoint(pointId: string | null) {
    if (!pointId) return null;

    return points.find((point) => point.id === pointId) ?? null;
  }

  function getIndicator(indicatorId: string | null) {
    if (!indicatorId) return null;

    return indicators.find((indicator) => indicator.id === indicatorId) ?? null;
  }

  return (
    <main className="min-h-screen bg-[#f6f9f6] text-[#172019]">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-[#e3eae3] bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-[72px] max-w-6xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl transition hover:bg-[#f0f4f0]"
          >
            ←
          </button>

          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#397343]">
              Student Assessment
            </p>

            <h1 className="truncate text-lg font-bold sm:text-xl">
              Perkembangan
            </h1>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-8 lg:px-8">
        {/* STUDENT */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-400">Peserta Didik</p>

          <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
            {student.name}
          </h2>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
            {student.nis && <span>NIS: {student.nis}</span>}

            {student.class_name && <span>Kelas: {student.class_name}</span>}
          </div>
        </div>

        {/* WEEK SELECTOR */}
        <div className="rounded-3xl border border-[#e1e8e1] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#edf5ed] text-xl">
              📅
            </div>

            <div className="min-w-0">
              <h3 className="font-bold sm:text-lg">Pilih Minggu Penilaian</h3>

              <p className="mt-1 text-sm text-gray-400">
                Lihat perkembangan berdasarkan minggu
              </p>
            </div>
          </div>

          <div className="relative mt-5">
            <label className="absolute left-4 top-[-9px] bg-white px-1 text-xs text-gray-500">
              Minggu
            </label>

            <select
              value={selectedWeek}
              onChange={(event) => setSelectedWeek(event.target.value)}
              className="w-full appearance-none rounded-2xl border border-[#dce4dc] bg-white px-4 py-4 pr-12 text-base font-semibold outline-none transition focus:border-[#397343] focus:ring-2 focus:ring-[#397343]/10"
            >
              {weeks.length === 0 ? (
                <option value="">Belum ada minggu penilaian</option>
              ) : (
                weeks.map((week) => (
                  <option key={week.key} value={week.key}>
                    {week.label}
                  </option>
                ))
              )}
            </select>

            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
              ▼
            </div>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="mt-8">
          <div className="mb-5">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Ringkasan Perkembangan
            </h2>

            <p className="mt-2 text-sm text-gray-500 sm:text-base">
              Rata-rata nilai berdasarkan kelompok penilaian.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {summary.map((item) => {
              const status =
                item.average !== null ? getStatus(item.average) : null;

              return (
                <div
                  key={item.category}
                  className="rounded-3xl border border-[#e1e8e1] bg-white p-4 shadow-sm sm:p-5"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-base font-bold sm:h-16 sm:w-16 ${
                        status?.bg ?? "bg-gray-50"
                      } ${status?.color ?? "text-gray-400"}`}
                    >
                      {item.average !== null ? item.average.toFixed(1) : "-"}
                    </div>

                    <h3 className="text-base font-bold sm:text-lg">
                      {item.label}
                    </h3>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-2">
                    {status ? (
                      <div
                        className={`flex min-w-0 items-center gap-2 text-xs font-bold sm:text-sm ${status.color}`}
                      >
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${status.dot}`}
                        />

                        <span className="truncate">{status.label}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">
                        Belum ada penilaian
                      </span>
                    )}

                    <span className="shrink-0 text-xs text-gray-400">
                      {item.count} penilaian
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* HISTORY */}
        <div className="mt-10">
          <div className="mb-5">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Riwayat Perkembangan
            </h2>

            <p className="mt-2 text-sm text-gray-500 sm:text-base">
              Hasil penilaian peserta didik.
            </p>
          </div>

          {variableGroups.length === 0 ? (
            <div className="rounded-3xl border border-[#e1e8e1] bg-white p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#edf5ed] text-2xl">
                📊
              </div>

              <h3 className="mt-4 font-bold">Belum Ada Penilaian</h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Belum ada data penilaian pada minggu yang dipilih.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {variableGroups.map((group) => {
                const isOpen = openVariables.includes(group.variable.id);

                const status = getStatus(group.average);

                const pointsForVariable = points.filter(
                  (point) => point.variable_id === group.variable.id,
                );

                return (
                  <div
                    key={group.variable.id}
                    className="overflow-hidden rounded-3xl border border-[#e0e8e0] bg-white shadow-sm"
                  >
                    {/* VARIABLE HEADER */}
                    <button
                      onClick={() => toggleVariable(group.variable.id)}
                      className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-[#fbfdfb] sm:p-6"
                    >
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#edf4ed] text-xl">
                        {getVariableIcon(group.variable.name)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-[#397343]">
                          {getCategoryName(group.variable.name)}
                        </p>

                        <h3 className="mt-1 truncate text-lg font-bold sm:text-xl">
                          {group.variable.name}
                        </h3>

                        <p className="mt-1 truncate text-sm text-gray-400">
                          {group.variable.description ||
                            `${group.assessments.length} penilaian`}
                        </p>
                      </div>

                      <div className="hidden shrink-0 text-right sm:block">
                        <p className="text-xs text-gray-400">Rata-rata</p>

                        <p className="text-xl font-bold">
                          {group.average.toFixed(1)}
                        </p>

                        <p className={`text-xs font-bold ${status.color}`}>
                          {status.label}
                        </p>
                      </div>

                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f4f7f4] text-[#397343] transition ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      >
                        ↓
                      </div>
                    </button>

                    {/* MOBILE SCORE */}
                    <div className="border-t border-[#edf0ed] px-5 py-4 sm:hidden">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-400">Rata-rata</p>

                          <p className="text-2xl font-bold">
                            {group.average.toFixed(1)}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${status.bg} ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </div>
                    </div>

                    {/* ACCORDION */}
                    {isOpen && (
                      <div className="border-t border-[#edf0ed] bg-[#fbfdfb]">
                        <div className="p-4 sm:p-6">
                          {group.assessments.length === 0 ? (
                            <p className="text-sm text-gray-400">
                              Belum ada penilaian.
                            </p>
                          ) : (
                            <div className="space-y-4">
                              {/*
                               * GROUP ASSESSMENT BERDASARKAN POINT
                               */}
                              {Object.entries(
                                group.assessments.reduce<
                                  Record<string, Assessment[]>
                                >((result, assessment) => {
                                  const key =
                                    assessment.point_id || "tanpa-point";

                                  if (!result[key]) {
                                    result[key] = [];
                                  }

                                  result[key].push(assessment);

                                  return result;
                                }, {}),
                              ).map(([pointId, pointAssessments]) => {
                                const point = getPoint(
                                  pointId === "tanpa-point" ? null : pointId,
                                );

                                return (
                                  <div
                                    key={pointId}
                                    className="overflow-hidden rounded-2xl border border-[#e1e8e1] bg-white"
                                  >
                                    {/* POINT HEADER */}
                                    <div className="flex items-center justify-between border-b border-[#edf0ed] bg-[#f7faf7] px-4 py-4">
                                      <div className="min-w-0">
                                        <p className="text-[11px] font-bold uppercase tracking-wider text-[#397343]">
                                          Kelompok Penilaian
                                        </p>

                                        <h4 className="mt-1 text-base font-bold text-gray-800">
                                          {point?.name || group.variable.name}
                                        </h4>

                                        {point?.description && (
                                          <p className="mt-1 text-xs text-gray-400">
                                            {point.description}
                                          </p>
                                        )}
                                      </div>

                                      <div className="ml-3 shrink-0 rounded-full bg-[#edf4ed] px-3 py-1 text-xs font-bold text-[#397343]">
                                        {pointAssessments.length} indikator
                                      </div>
                                    </div>

                                    {/* INDICATORS */}
                                    <div className="divide-y divide-[#edf0ed]">
                                      {pointAssessments.map(
                                        (assessment, index) => {
                                          const indicator = getIndicator(
                                            assessment.indicator_id,
                                          );

                                          const score = assessment.score;
                                          const assessmentStatus =
                                            score !== null
                                              ? getStatus(score)
                                              : null;

                                          return (
                                            <div
                                              key={assessment.id}
                                              className="px-4 py-4 transition hover:bg-[#fbfdfb]"
                                            >
                                              <div className="flex items-center gap-3">
                                                {/* NOMOR */}
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f0f5f0] text-sm font-bold text-[#397343]">
                                                  {index + 1}
                                                </div>

                                                {/* INDICATOR */}
                                                <div className="min-w-0 flex-1">
                                                  <h5 className="font-semibold text-gray-800">
                                                    {indicator?.name ||
                                                      "Indikator Penilaian"}
                                                  </h5>

                                                  {indicator?.description && (
                                                    <p className="mt-1 text-xs leading-5 text-gray-400">
                                                      {indicator.description}
                                                    </p>
                                                  )}

                                                  {assessment.note && (
                                                    <p className="mt-1 text-xs text-gray-500">
                                                      {assessment.note}
                                                    </p>
                                                  )}
                                                </div>

                                                {/* NILAI */}
                                                <div className="shrink-0 text-right">
                                                  <div
                                                    className={`flex h-12 w-12 items-center justify-center rounded-xl text-base font-bold ${
                                                      assessmentStatus?.bg ??
                                                      "bg-gray-50"
                                                    } ${
                                                      assessmentStatus?.color ??
                                                      "text-gray-400"
                                                    }`}
                                                  >
                                                    {score !== null
                                                      ? score
                                                      : "-"}
                                                  </div>
                                                </div>
                                              </div>

                                              {/* STATUS + TANGGAL */}
                                              <div className="mt-3 flex items-center justify-between pl-12">
                                                <span
                                                  className={`text-xs font-bold ${
                                                    assessmentStatus?.color ??
                                                    "text-gray-400"
                                                  }`}
                                                >
                                                  {assessmentStatus?.label ??
                                                    "Belum dinilai"}
                                                </span>

                                                <span className="text-xs text-gray-400">
                                                  {formatDate(
                                                    assessment.assessment_date ||
                                                      assessment.created_at,
                                                  )}
                                                </span>
                                              </div>
                                            </div>
                                          );
                                        },
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* POINT LIST */}
                          {pointsForVariable.length > 0 && (
                            <div className="mt-6">
                              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                                Kelompok Penilaian
                              </p>

                              <div className="flex flex-wrap gap-2">
                                {pointsForVariable.map((point) => (
                                  <span
                                    key={point.id}
                                    className="rounded-full bg-[#edf4ed] px-3 py-1.5 text-xs font-semibold text-[#397343]"
                                  >
                                    {point.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
