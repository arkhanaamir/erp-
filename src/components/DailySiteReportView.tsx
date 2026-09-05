import React, { useState } from 'react';
import { useCasabuild } from '../context/CasabuildContext';
import { DailySiteReport } from '../types';
import {
  ClipboardCheck,
  Plus,
  Sun,
  CloudRain,
  Wind,
  Cloud,
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Camera,
  Download,
  Filter,
  Layers,
  ArrowRight,
  HardHat
} from 'lucide-react';

export const DailySiteReportView: React.FC = () => {
  const {
    dailyReports,
    addDailyReport,
    projects,
    activeProjectId,
    activeProject,
    currentRole
  } = useCasabuild();

  const [showNewReportModal, setShowNewReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<DailySiteReport | null>(null);

  // Form states
  const [reportProject, setReportProject] = useState(activeProjectId);
  const [weather, setWeather] = useState<'Sunny' | 'Rainy' | 'Windy' | 'Cloudy' | 'Extreme Heat'>('Sunny');
  const [temperature, setTemperature] = useState('28°C');
  const [workersCount, setWorkersCount] = useState('24');
  const [todaysWork, setTodaysWork] = useState('');
  const [progressPercent, setProgressPercent] = useState(activeProject.overallProgress);
  const [issues, setIssues] = useState('');
  const [issueSeverity, setIssueSeverity] = useState<'None' | 'Low' | 'Moderate' | 'Critical'>('None');
  const [tomorrowPlan, setTomorrowPlan] = useState('');
  const [supervisorName, setSupervisorName] = useState('Tariq (Site Supervisor)');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoList, setPhotoList] = useState<string[]>([
    'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=600&q=80'
  ]);

  const handleAddPhoto = () => {
    if (!photoUrl) return;
    setPhotoList(prev => [...prev, photoUrl]);
    setPhotoUrl('');
  };

  const handleSubmitDSR = (e: React.FormEvent) => {
    e.preventDefault();
    if (!todaysWork) return;

    addDailyReport({
      projectId: reportProject,
      weather,
      temperature,
      workersCount: Number(workersCount) || 20,
      todaysWork,
      progressPercentage: progressPercent,
      issues: issues || 'None reported.',
      issueSeverity,
      tomorrowPlan,
      supervisorName,
      photos: photoList
    });

    setShowNewReportModal(false);
    setTodaysWork('');
    setIssues('');
    setTomorrowPlan('');
  };

  const weatherIcons: Record<string, any> = {
    Sunny: Sun,
    Rainy: CloudRain,
    Windy: Wind,
    Cloudy: Cloud,
    'Extreme Heat': Thermometer
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 border border-amber-500/20">
              Module 2
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl font-['Outfit',sans-serif]">
              Daily Site Reports (DSR)
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-zinc-400">
            Real-time on-site logging of daily tasks, weather conditions, snag issues, and photo proof. No Excel required.
          </p>
        </div>

        <button
          id="dsr-new-report-btn"
          onClick={() => {
            setProgressPercent(activeProject.overallProgress);
            setShowNewReportModal(true);
          }}
          className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 px-4 py-2.5 text-xs font-semibold text-zinc-950 shadow-lg shadow-amber-500/20 active:scale-95 transition"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>New Daily Report</span>
        </button>
      </div>

      {/* Reports Feed & Detail Modal */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Report Feed */}
        <div className="space-y-4 lg:col-span-2">
          {dailyReports.map(report => {
            const WeatherIcon = weatherIcons[report.weather] || Sun;
            return (
              <div
                key={report.id}
                id={`dsr-card-${report.id}`}
                onClick={() => setSelectedReport(report)}
                className="group cursor-pointer rounded-2xl border border-zinc-800 bg-[#161922] p-5 sm:p-6 transition hover:border-amber-500/40 shadow-xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-zinc-800">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800/80 text-amber-400 border border-zinc-700/60">
                      <WeatherIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-100 group-hover:text-amber-300 transition font-['Outfit',sans-serif]">
                        {report.projectName}
                      </h4>
                      <p className="text-[11px] text-zinc-400">
                        {report.date} • Logged by <span className="text-zinc-200 font-medium">{report.supervisorName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-xs">
                    <span className="rounded-xl bg-zinc-800/80 px-2.5 py-1 text-[11px] text-zinc-300 border border-zinc-700/60">
                      {report.workersCount} Workers
                    </span>
                    <span className="rounded-xl bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-400 border border-amber-500/20">
                      {report.progressPercentage}% Done
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-2.5 text-xs text-zinc-300">
                  <div>
                    <span className="font-semibold text-zinc-400 uppercase text-[10px] tracking-wider block mb-0.5">
                      Today's Work Completed:
                    </span>
                    <p className="line-clamp-2 leading-relaxed text-zinc-200">
                      {report.todaysWork}
                    </p>
                  </div>

                  {report.issues && report.issues !== 'None reported.' && (
                    <div className={`mt-2.5 flex items-start space-x-2 rounded-xl p-3 border ${
                      report.issueSeverity === 'Critical'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                    }`}>
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                      <div>
                        <span className="font-bold uppercase text-[10px] tracking-wider">
                          Site Issue ({report.issueSeverity}):
                        </span>
                        <p className="text-[11px] mt-0.5">{report.issues}</p>
                      </div>
                    </div>
                  )}

                  {report.tomorrowPlan && (
                    <div className="pt-2 text-[11px] text-zinc-400 border-t border-zinc-800">
                      <span className="font-semibold text-zinc-300">Tomorrow's Target:</span> {report.tomorrowPlan}
                    </div>
                  )}

                  {report.photos && report.photos.length > 0 && (
                    <div className="flex items-center space-x-2.5 pt-2">
                      {report.photos.slice(0, 3).map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt="Site thumbnail"
                          className="h-14 w-20 rounded-xl object-cover border border-zinc-700"
                        />
                      ))}
                      {report.photos.length > 3 && (
                        <span className="text-[10px] text-zinc-400 font-medium">
                          +{report.photos.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 1 Col: Quick Tips & Daily Site Snapshot */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-[#161922] p-6 shadow-xl">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 pb-2 border-b border-zinc-800">
              DSR Guidelines for Field Teams
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-300 leading-relaxed">
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Submit daily report prior to 6:00 PM before site shutdown.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Attach minimum 2 geo-tagged photos showing key activities.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Flag critical snags immediately to alert Architect & Client.</span>
              </li>
            </ul>
          </div>

          {/* Quick Weather Forecast */}
          <div className="rounded-2xl border border-zinc-800 bg-[#161922] p-6 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Site Conditions (NCR / Gurugram)
              </h4>
              <span className="text-xs font-bold text-amber-400">28°C Sunny</span>
            </div>
            <p className="mt-3 text-xs text-zinc-400 leading-relaxed">
              Optimal humidity for concrete curing & plaster drying. No rain delays expected for the next 72 hours.
            </p>
          </div>
        </div>
      </div>

      {/* New Report Modal (Matches Video Blueprint Form) */}
      {showNewReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-[#161922] p-6 shadow-2xl my-8 text-zinc-100">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-400 border border-amber-500/20">
                  Supervisor Field Entry
                </span>
                <h3 className="text-lg font-bold text-zinc-100 mt-1 font-['Outfit',sans-serif]">
                  Log Daily Site Report
                </h3>
              </div>
              <button
                onClick={() => setShowNewReportModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitDSR} className="mt-4 space-y-3.5 text-xs">
              {/* Field 1: Project Dropdown */}
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Project</label>
                <select
                  value={reportProject}
                  onChange={e => setReportProject(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2.5 text-zinc-100 focus:border-amber-500/60 outline-none"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                  ))}
                </select>
              </div>

              {/* Field 2: Weather & Workers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Weather Condition</label>
                  <select
                    value={weather}
                    onChange={e => setWeather(e.target.value as any)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2.5 text-zinc-100 focus:border-amber-500/60 outline-none"
                  >
                    <option value="Sunny">☀️ Sunny</option>
                    <option value="Clear">🌤️ Clear</option>
                    <option value="Rainy">🌧️ Rainy</option>
                    <option value="Windy">💨 Windy</option>
                    <option value="Extreme Heat">🔥 Extreme Heat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Total Workers on Site</label>
                  <input
                    type="number"
                    value={workersCount}
                    onChange={e => setWorkersCount(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2.5 text-zinc-100 focus:border-amber-500/60 outline-none"
                  />
                </div>
              </div>

              {/* Field 3: Today's Work Completed */}
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Today's Work (Tasks Accomplished)</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail masonry progress, electrical conduit fixing, tile laying, curing..."
                  value={todaysWork}
                  onChange={e => setTodaysWork(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2.5 text-zinc-100 placeholder-zinc-500 focus:border-amber-500/60 outline-none"
                />
              </div>

              {/* Field 4: Progress % Slider */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-zinc-400 font-medium">Updated Project Progress %</label>
                  <span className="font-bold text-amber-400 text-sm">{progressPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressPercent}
                  onChange={e => setProgressPercent(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer accent-amber-500 bg-zinc-800 rounded-lg"
                />
              </div>

              {/* Field 5: Issues / Snags & Severity */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-zinc-400 mb-1 font-medium">Issues / Delays (if any)</label>
                  <input
                    type="text"
                    placeholder="Material delay, power outage, revision required..."
                    value={issues}
                    onChange={e => setIssues(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2.5 text-zinc-100 focus:border-amber-500/60 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">Severity</label>
                  <select
                    value={issueSeverity}
                    onChange={e => setIssueSeverity(e.target.value as any)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2.5 text-zinc-100 focus:border-amber-500/60 outline-none"
                  >
                    <option value="None">None</option>
                    <option value="Low">Low</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Field 6: Tomorrow's Plan */}
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Tomorrow's Execution Plan</label>
                <input
                  type="text"
                  placeholder="Target activities for next work shift..."
                  value={tomorrowPlan}
                  onChange={e => setTomorrowPlan(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2.5 text-zinc-100 focus:border-amber-500/60 outline-none"
                />
              </div>

              {/* Field 7: Upload Photos (URL or Camera) */}
              <div>
                <label className="block text-zinc-400 mb-1 font-medium">Upload Site Photos</label>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    placeholder="Paste image URL (Unsplash or camera upload)"
                    value={photoUrl}
                    onChange={e => setPhotoUrl(e.target.value)}
                    className="w-full rounded-xl border border-zinc-700 bg-zinc-900/80 p-2 text-zinc-100 text-xs focus:border-amber-500/60 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddPhoto}
                    className="shrink-0 rounded-xl bg-zinc-800/80 hover:bg-zinc-800 px-3 py-2 text-xs font-semibold text-zinc-200 border border-zinc-700 transition"
                  >
                    Add
                  </button>
                </div>

                {photoList.length > 0 && (
                  <div className="mt-2.5 flex space-x-2">
                    {photoList.map((p, i) => (
                      <div key={i} className="relative">
                        <img src={p} alt="upload" className="h-12 w-16 rounded-xl object-cover border border-zinc-700" />
                        <button
                          type="button"
                          onClick={() => setPhotoList(prev => prev.filter((_, idx) => idx !== i))}
                          className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] text-white"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowNewReportModal(false)}
                  className="rounded-xl border border-zinc-700 px-4 py-2 text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 px-5 py-2 font-semibold text-zinc-950 shadow-lg shadow-amber-500/20 transition"
                >
                  Submit Daily Site Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal for Selected Report */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#161922] p-6 shadow-2xl text-zinc-100">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-zinc-100 font-['Outfit',sans-serif]">{selectedReport.projectName}</h3>
                <p className="text-xs text-zinc-400">{selectedReport.date} • Logged by {selectedReport.supervisorName}</p>
              </div>
              <button onClick={() => setSelectedReport(null)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
            <div className="mt-4 space-y-3 text-xs text-zinc-300">
              <div>
                <span className="font-semibold text-zinc-400">Weather & Temperature:</span>
                <p className="text-zinc-100">{selectedReport.weather} ({selectedReport.temperature || '28°C'})</p>
              </div>
              <div>
                <span className="font-semibold text-zinc-400">Work Done:</span>
                <p className="mt-0.5 text-zinc-200 leading-relaxed">{selectedReport.todaysWork}</p>
              </div>
              <div>
                <span className="font-semibold text-zinc-400">Issues & Resolution:</span>
                <p className="mt-0.5 text-amber-300">{selectedReport.issues}</p>
              </div>
              <div>
                <span className="font-semibold text-zinc-400">Tomorrow's Target:</span>
                <p className="mt-0.5 text-zinc-200">{selectedReport.tomorrowPlan}</p>
              </div>
              {selectedReport.photos && selectedReport.photos.length > 0 && (
                <div>
                  <span className="font-semibold text-zinc-400 block mb-1.5">Attached Site Photos:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedReport.photos.map((img, i) => (
                      <img key={i} src={img} alt="site" className="h-28 w-full rounded-xl object-cover border border-zinc-700" />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedReport(null)}
                className="rounded-xl bg-zinc-800 hover:bg-zinc-700 px-4 py-2 text-xs text-zinc-200 border border-zinc-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
