import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { UserCheck, GraduationCap, ClipboardCheck, History, Radio, CheckCircle2, Smartphone, Monitor, Bell, LayoutDashboard } from 'lucide-react'
import axios from 'axios'

// Supabase Setup
const SUPABASE_URL = 'https://tmrsdvtdtbuqjhedtmqp.supabase.co'
const SUPABASE_KEY = 'sb_publishable_304VG6Qmgh5cUvz3RTjSEg_DUSBVb3a'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const API_BASE = 'http://localhost:5000/api'

interface AttendanceRecord {
  id: string
  student_name: string
  status: string
  created_at: string
}

function App() {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [name, setName] = useState('')
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [connStatus, setConnStatus] = useState('Connecting...')

  const fetchRecords = async () => {
    try {
      const response = await axios.get(`${API_BASE}/attendance`)
      setRecords(response.data)
      setConnStatus('Connected')
    } catch (error) {
      setConnStatus('Offline')
    }
  }

  const markAttendance = async () => {
    if (!name.trim()) return
    setLoading(true)
    try {
      await axios.post(`${API_BASE}/attendance`, {
        student_name: name,
        status: 'Present'
      })
      setName('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      alert('Error: Ensure Backend Server is running!')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords()
    const channel = supabase
      .channel('attendance-sync')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'attendance' }, (payload) => {
        setRecords((prev) => [payload.new as AttendanceRecord, ...prev].slice(0, 10))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-50 font-sans antialiased">
      
      {/* View Toggle */}
      <div className="fixed top-6 right-6 z-50 flex bg-slate-900 border border-slate-800 p-1 rounded-2xl shadow-2xl">
        <button 
          onClick={() => setViewMode('desktop')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${viewMode === 'desktop' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Monitor size={18} />
          <span className="text-sm font-bold">Desktop</span>
        </button>
        <button 
          onClick={() => setViewMode('mobile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${viewMode === 'mobile' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Smartphone size={18} />
          <span className="text-sm font-bold">Mobile</span>
        </button>
      </div>

      {viewMode === 'desktop' ? (
        /* DESKTOP DASHBOARD */
        <div className="max-w-6xl mx-auto px-4 py-12 animate-in fade-in duration-500">
          <header className="text-center mb-16 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-400">
              <Radio size={12} className={connStatus === 'Offline' ? 'text-red-500' : 'text-green-500 animate-pulse'} />
              {connStatus}
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
              Attendance Dashboard
            </h1>
          </header>

          <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5">
              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-2xl">
                    <UserCheck className="text-blue-400" size={24} />
                  </div>
                  <h2 className="text-xl font-bold">Teacher Panel</h2>
                </div>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Student Name..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                  />
                  <button onClick={markAttendance} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
                    {success ? <CheckCircle2 size={20} /> : <ClipboardCheck size={20} />}
                    {loading ? 'Marking...' : success ? 'Marked!' : 'Mark Attendance'}
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl min-h-[500px]">
                <h2 className="text-xl font-bold mb-8 flex items-center gap-4">
                  <GraduationCap className="text-purple-400" size={24} />
                  Live Feed
                </h2>
                <div className="space-y-3">
                  {records.map((r) => (
                    <div key={r.id} className="bg-slate-950/50 border border-slate-800/50 p-4 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-blue-400">{r.student_name[0]}</div>
                        <div>
                          <div className="font-semibold">{r.student_name}</div>
                          <div className="text-xs text-slate-500">{new Date(r.created_at).toLocaleTimeString()}</div>
                        </div>
                      </div>
                      <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-lg border border-emerald-500/20 uppercase tracking-widest">Present</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      ) : (
        /* MOBILE APP SIMULATOR */
        <div className="flex justify-center items-center py-12 animate-in slide-in-from-bottom-8 duration-500">
          <div className="w-[375px] h-[750px] bg-slate-950 border-[8px] border-slate-800 rounded-[3rem] overflow-hidden relative shadow-[0_0_80px_rgba(0,0,0,0.5)] flex flex-col">
            
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-7 bg-slate-800 rounded-b-2xl z-20"></div>

            <div className="flex-1 overflow-y-auto p-6 pt-10">
              <header className="mb-8 flex justify-between items-start">
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Attendance App</p>
                  <h1 className="text-2xl font-bold">Hello, Teacher! 👋</h1>
                </div>
                <div className="relative">
                  <Bell className="text-slate-400" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                </div>
              </header>

              <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl p-6 mb-8 shadow-xl">
                <p className="text-white/60 text-xs font-bold uppercase mb-1">Today's Total</p>
                <p className="text-4xl font-black">{records.length}</p>
                <div className="mt-4 flex gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <div className="w-2 h-2 bg-white/30 rounded-full"></div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Quick Mark Name..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                />
                <button 
                  onClick={markAttendance}
                  className="w-full bg-white text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg"
                >
                  <ClipboardCheck size={20} />
                  {loading ? 'Syncing...' : success ? 'Success!' : 'Mark Attendance'}
                </button>
              </div>

              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-300">Live Activity</h3>
                <span className="text-[10px] bg-slate-900 px-2 py-1 rounded text-slate-500 font-bold uppercase">Newest First</span>
              </div>

              <div className="space-y-3 pb-20">
                {records.map((r) => (
                  <div key={r.id} className="bg-slate-900/50 border border-slate-800/30 p-3 rounded-2xl flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-purple-400">{r.student_name[0]}</div>
                    <div className="flex-1">
                      <p className="text-sm font-bold">{r.student_name}</p>
                      <p className="text-[10px] text-slate-500">{new Date(r.created_at).toLocaleTimeString()}</p>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_#10b981]"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Nav */}
            <div className="h-20 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 flex justify-around items-center px-6 pb-4">
              <div className="text-purple-500"><LayoutDashboard size={24} /></div>
              <div className="text-slate-600"><History size={24} /></div>
              <div className="text-slate-600"><Radio size={24} /></div>
              <div className="text-slate-600"><Smartphone size={24} /></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
