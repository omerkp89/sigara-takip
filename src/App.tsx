import { useState, useEffect } from 'react';
import { Cigarette, Clock, Calendar, Plus, RotateCcw, History } from 'lucide-react';

interface CigaretteLog {
  date: string;
  count: number;
  lastSmoked: number | null;
}

export default function App() {
  const [todayCount, setTodayCount] = useState(0);
  const [lastSmokedTime, setLastSmokedTime] = useState<number | null>(null);
  const [timeSinceLastCigarette, setTimeSinceLastCigarette] = useState<string>('');
  const [history, setHistory] = useState<CigaretteLog[]>([]);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const storedData = localStorage.getItem('cigaretteLog');
    if (storedData) {
      const logs: CigaretteLog[] = JSON.parse(storedData);
      const todayLog = logs.find(log => log.date === today);

      if (todayLog) {
        setTodayCount(todayLog.count);
        setLastSmokedTime(todayLog.lastSmoked);
      }

      // Geçmiş günleri al (bugün hariç) ve tarih sırasına göre sırala
      const pastLogs = logs
        .filter(log => log.date !== today)
        .sort((a, b) => b.date.localeCompare(a.date));
      setHistory(pastLogs);
    }
  }, [today]);

  useEffect(() => {
    if (lastSmokedTime) {
      const interval = setInterval(() => {
        const now = Date.now();
        const diff = now - lastSmokedTime;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeSinceLastCigarette(`${hours}s ${minutes}d ${seconds}sn`);
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setTimeSinceLastCigarette('Henüz sigara içilmedi');
    }
  }, [lastSmokedTime]);

  const addCigarette = () => {
    const now = Date.now();
    const newCount = todayCount + 1;

    setTodayCount(newCount);
    setLastSmokedTime(now);

    const storedData = localStorage.getItem('cigaretteLog');
    let logs: CigaretteLog[] = storedData ? JSON.parse(storedData) : [];

    const todayLogIndex = logs.findIndex(log => log.date === today);

    if (todayLogIndex >= 0) {
      logs[todayLogIndex] = { date: today, count: newCount, lastSmoked: now };
    } else {
      logs.push({ date: today, count: newCount, lastSmoked: now });
    }

    localStorage.setItem('cigaretteLog', JSON.stringify(logs));

    // Geçmiş kayıtları güncelle
    const pastLogs = logs
      .filter(log => log.date !== today)
      .sort((a, b) => b.date.localeCompare(a.date));
    setHistory(pastLogs);
  };

  const resetDay = () => {
    if (window.confirm('Bugünün verilerini sıfırlamak istediğinize emin misiniz?')) {
      setTodayCount(0);
      setLastSmokedTime(null);

      const storedData = localStorage.getItem('cigaretteLog');
      if (storedData) {
        let logs: CigaretteLog[] = JSON.parse(storedData);
        logs = logs.filter(log => log.date !== today);
        localStorage.setItem('cigaretteLog', JSON.stringify(logs));

        // Geçmiş kayıtları güncelle
        const pastLogs = logs.sort((a, b) => b.date.localeCompare(a.date));
        setHistory(pastLogs);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const daysDiff = Math.floor((new Date(today).getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) return 'Dün';
    if (daysDiff === 2) return 'Önceki Gün';

    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('tr-TR', options);
  };

  return (
    <div className="size-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md mx-4">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-full">
                <Cigarette className="w-6 h-6 text-red-600" />
              </div>
              <h1 className="text-2xl font-semibold text-slate-800">Sigara Takip</h1>
            </div>
            <button
              onClick={resetDay}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              title="Bugünü sıfırla"
            >
              <RotateCcw className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-red-500 to-red-600 rounded-full mb-4 shadow-lg">
              <span className="text-5xl font-bold text-white">{todayCount}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-slate-600">
              <Calendar className="w-4 h-4" />
              <p>Bugün içilen sigara</p>
            </div>
          </div>

          <button
            onClick={addCigarette}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl flex items-center justify-center gap-3 transition-colors shadow-lg hover:shadow-xl mb-6"
          >
            <Plus className="w-6 h-6" />
            <span className="text-lg font-semibold">Sigara İçtim</span>
          </button>

          <div className="bg-slate-50 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-slate-600" />
              <h2 className="font-medium text-slate-700">Son Sigaradan Beri</h2>
            </div>
            <p className="text-2xl font-semibold text-slate-800">
              {timeSinceLastCigarette}
            </p>
          </div>

          {history.length > 0 && (
            <div className="bg-slate-50 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-5 h-5 text-slate-600" />
                <h2 className="font-medium text-slate-700">Geçmiş Kayıtlar</h2>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {history.map((log) => (
                  <div
                    key={log.date}
                    className="flex items-center justify-between p-3 bg-white rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Calendar className="w-4 h-4 text-slate-600" />
                      </div>
                      <span className="text-slate-700">{formatDate(log.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-red-600">{log.count}</span>
                      <Cigarette className="w-4 h-4 text-red-600" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
