"use client";

import { FormEvent, useMemo, useState } from "react";

const WEEKDAY_OPTIONS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type SkillLevel = "Beginner" | "Intermediate" | "Advanced";

interface StudyPlan {
  weeks: number;
  sessionsPerWeek: number;
  sessionLengthHours: number;
  totalHours: number;
  weeklyFocus: Array<{
    week: number;
    phase: "Foundation" | "Practice" | "Revision";
    topic: string;
    checkpoint: string;
  }>;
  recommendations: string[];
}

function createStudyPlan(params: {
  topicsInput: string;
  goalDate: string;
  hoursPerWeek: number;
  studyDays: string[];
  level: SkillLevel;
}): StudyPlan {
  const topics = params.topicsInput
    .split(/[\n,]/)
    .map((topic) => topic.trim())
    .filter(Boolean);
  const topicPool = topics.length > 0 ? topics : ["Core concepts"];

  const now = new Date();
  const target = params.goalDate ? new Date(params.goalDate) : now;
  const msInWeek = 1000 * 60 * 60 * 24 * 7;
  const weeks = Math.max(1, Math.ceil((target.getTime() - now.getTime()) / msInWeek));
  const sessionsPerWeek = Math.max(1, params.studyDays.length);
  const sessionLengthHours = Number((params.hoursPerWeek / sessionsPerWeek).toFixed(1));
  const totalHours = Number((weeks * params.hoursPerWeek).toFixed(1));

  const foundationWeeks = Math.max(1, Math.round(weeks * 0.4));
  const revisionStart = Math.max(foundationWeeks + 1, weeks - Math.max(1, Math.round(weeks * 0.2)) + 1);

  const weeklyFocus = Array.from({ length: weeks }, (_, index) => {
    const week = index + 1;
    const phase =
      week <= foundationWeeks
        ? "Foundation"
        : week >= revisionStart
          ? "Revision"
          : "Practice";
    const topic = topicPool[index % topicPool.length];
    const checkpoint =
      phase === "Foundation"
        ? `Build notes + flashcards for ${topic}`
        : phase === "Practice"
          ? `Complete timed practice set on ${topic}`
          : `Mock test and error review for ${topic}`;

    return { week, phase, topic, checkpoint };
  });

  const recommendations = [
    `Study on ${params.studyDays.join(", ")} with ${sessionsPerWeek} focused sessions weekly.`,
    `Start every session with a 5-minute recall warmup to improve retention.`,
    `Use a weekly review block to revisit weak areas before moving on.`,
    params.level === "Beginner"
      ? "Prioritize concept clarity before speed-focused drills."
      : params.level === "Intermediate"
        ? "Blend theory review with exam-style problem solving."
        : "Use mixed-difficulty mock sets and post-test error logs.",
  ];

  return {
    weeks,
    sessionsPerWeek,
    sessionLengthHours,
    totalHours,
    weeklyFocus,
    recommendations,
  };
}

export function StudyPlannerAgent() {
  const [subject, setSubject] = useState("Mathematics");
  const [goalDate, setGoalDate] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState(8);
  const [level, setLevel] = useState<SkillLevel>("Beginner");
  const [topics, setTopics] = useState("Algebra, Geometry, Trigonometry");
  const [studyDays, setStudyDays] = useState<string[]>(["Mon", "Tue", "Thu", "Sat"]);
  const [submitted, setSubmitted] = useState(false);

  const plan = useMemo(
    () =>
      createStudyPlan({
        topicsInput: topics,
        goalDate,
        hoursPerWeek,
        studyDays,
        level,
      }),
    [goalDate, hoursPerWeek, level, studyDays, topics]
  );

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  function toggleStudyDay(day: string) {
    setStudyDays((prev) =>
      prev.includes(day)
        ? prev.length === 1
          ? prev
          : prev.filter((d) => d !== day)
        : [...prev, day]
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">AI Study Support</p>
          <h1 className="text-3xl sm:text-4xl font-semibold">Study Planner Agent</h1>
          <p className="text-zinc-400 max-w-2xl">
            Share your timeline and topics, then get a structured weekly plan with practical checkpoints.
          </p>
        </header>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 sm:p-6">
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
            <label className="space-y-1">
              <span className="text-sm text-zinc-300">Subject</span>
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-emerald-400"
                placeholder="e.g. Biology"
                required
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm text-zinc-300">Target date</span>
              <input
                type="date"
                value={goalDate}
                onChange={(event) => setGoalDate(event.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-emerald-400"
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm text-zinc-300">Hours per week</span>
              <input
                type="number"
                min={1}
                max={60}
                value={hoursPerWeek}
                onChange={(event) => setHoursPerWeek(Math.max(1, Number(event.target.value) || 1))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-emerald-400"
                required
              />
            </label>

            <label className="space-y-1">
              <span className="text-sm text-zinc-300">Current level</span>
              <select
                value={level}
                onChange={(event) => setLevel(event.target.value as SkillLevel)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-emerald-400"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </label>

            <label className="space-y-1 sm:col-span-2">
              <span className="text-sm text-zinc-300">Topics (comma or line separated)</span>
              <textarea
                value={topics}
                onChange={(event) => setTopics(event.target.value)}
                rows={3}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-emerald-400"
                placeholder="e.g. Photosynthesis, Cell cycle, Genetics"
              />
            </label>

            <div className="space-y-2 sm:col-span-2">
              <span className="text-sm text-zinc-300">Study days</span>
              <div className="flex flex-wrap gap-2">
                {WEEKDAY_OPTIONS.map((day) => {
                  const active = studyDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleStudyDay(day)}
                      className={`rounded-md px-3 py-1.5 text-xs border transition-colors ${
                        active
                          ? "border-emerald-400 bg-emerald-500/15 text-emerald-300"
                          : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="sm:col-span-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-black hover:bg-emerald-400 transition-colors"
            >
              Generate study plan
            </button>
          </form>
        </section>

        {submitted && (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-300">
              <p><span className="text-zinc-500">Subject:</span> {subject}</p>
              <p><span className="text-zinc-500">Duration:</span> {plan.weeks} week(s)</p>
              <p><span className="text-zinc-500">Total planned time:</span> {plan.totalHours} hrs</p>
              <p><span className="text-zinc-500">Session length:</span> {plan.sessionLengthHours} hrs</p>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-medium">Weekly roadmap</h2>
              <div className="grid gap-2">
                {plan.weeklyFocus.map((item) => (
                  <div key={item.week} className="rounded-lg border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-sm">
                    <p className="text-zinc-200 font-medium">
                      Week {item.week} · {item.phase} · {item.topic}
                    </p>
                    <p className="text-zinc-400">{item.checkpoint}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-medium">Agent recommendations</h2>
              <ul className="list-disc list-inside space-y-1 text-sm text-zinc-300">
                {plan.recommendations.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
