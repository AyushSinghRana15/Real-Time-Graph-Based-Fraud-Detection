import { useState, useEffect } from 'react';
import { MiniKPICard } from './MiniKPICard';

export function KPIDock() {
  const [latency, setLatency] = useState(12);

  useEffect(() => {
    const t = setInterval(() => setLatency(p => Math.max(1, p + (Math.random() - 0.5) * 6 | 0)), 2000);
    return () => clearInterval(t);
  }, []);

  const sparkVolume = [65, 72, 68, 75, 78, 82, 85, 88, 84, 90, 87, 92];
  const sparkPrevention = [98, 98.5, 99, 98.8, 99.2, 99, 99.3, 99.1, 99.4, 99.2, 99.5, 99.2];
  const sparkRisk = [15, 18, 22, 19, 25, 28, 24, 30, 27, 23, 28, 23];
  const sparkLatency = [10, 12, 11, 14, 13, 15, 12, 14, 16, 13, 15, 12];

  return (
    <div className="fixed top-[80px] left-[340px] right-[400px] z-40 px-6 flex gap-3 overflow-x-auto pb-2">
      <MiniKPICard label="Transaction Vol" value="8.47M" trend="up" trendValue="+12.5%" color="#10b981" sparkData={sparkVolume} delay={0.1} />
      <MiniKPICard label="Prevention Rate" value="99.2%" trend="up" trendValue="+0.3%" color="#10b981" sparkData={sparkPrevention} delay={0.2} />
      <MiniKPICard label="Active High-Risk" value="23" trend="up" trendValue="+5" color="#f43f5e" sparkData={sparkRisk} delay={0.3} />
      <MiniKPICard label="System Latency" value={`${latency}ms`} trend="neutral" trendValue="OK" color="#f59e0b" sparkData={sparkLatency} delay={0.4} />
    </div>
  );
}
