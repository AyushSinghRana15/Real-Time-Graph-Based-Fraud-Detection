import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Wifi, WifiOff, Cpu, HardDrive } from 'lucide-react';

interface TelemetryData {
  latency: number;
  throughput: number;
  activeConnections: number;
}

export function TopNavigation() {
  const [blockCount, setBlockCount] = useState(14782934);
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    latency: 12,
    throughput: 8472,
    activeConnections: 3421,
  });
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const blockInterval = setInterval(() => {
      if (Math.random() > 0.3) {
        setBlockCount(prev => prev + Math.floor(Math.random() * 3) + 1);
      }
    }, 500);

    const telemetryInterval = setInterval(() => {
      setTelemetry(prev => ({
        latency: Math.max(1, prev.latency + (Math.random() - 0.5) * 10),
        throughput: Math.max(1000, prev.throughput + (Math.random() - 0.5) * 500),
        activeConnections: Math.max(100, prev.activeConnections + Math.floor((Math.random() - 0.5) * 50)),
      }));
    }, 2000);

    const onlineInterval = setInterval(() => {
      setIsOnline(Math.random() > 0.05);
    }, 5000);

    return () => {
      clearInterval(blockInterval);
      clearInterval(telemetryInterval);
      clearInterval(onlineInterval);
    };
  }, []);

  const formatNumber = (num: number) => {
    return num.toString().padStart(8, '0');
  };

  const Digits = ({ value }: { value: string }) => (
    <div className="flex gap-0.5">
      {value.split('').map((digit, i) => (
        <div
          key={i}
          className="w-6 h-10 bg-black border border-zinc-800 flex items-center justify-center font-mono text-xl text-lime-400"
          style={{ 
            boxShadow: 'inset 0 0 10px rgba(163, 230, 53, 0.2), 0 0 5px rgba(163, 230, 53, 0.1)',
            textShadow: '0 0 10px #a3e635'
          }}
        >
          {digit}
        </div>
      ))}
    </div>
  );

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="h-16 glass glass-border flex items-center justify-between px-6"
    >
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-lime-500/20 border border-lime-500/50 flex items-center justify-center">
            <span className="text-lime-400 font-mono font-bold text-sm">FIU</span>
          </div>
          <div>
            <h1 className="text-sm font-mono font-semibold text-white tracking-wider">FIU_SENTINEL_V4</h1>
            <p className="text-[10px] text-zinc-500 font-mono">CYBER-COMMAND HUD</p>
          </div>
        </div>

        <div className="h-8 w-px bg-zinc-800" />

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Blocks</span>
          <Digits value={formatNumber(blockCount)} />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-lime-400" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-400 animate-pulse" />
          )}
          <span className={`text-xs font-mono ${isOnline ? 'text-lime-400' : 'text-red-400'}`}>
            {isOnline ? 'CONNECTED' : 'OFFLINE'}
          </span>
        </div>

        <div className="h-8 w-px bg-zinc-800" />

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <div className="text-right">
              <p className="text-[10px] text-zinc-500 font-mono uppercase">Latency</p>
              <p className="text-xs font-mono text-white">{telemetry.latency.toFixed(0)}ms</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <div className="text-right">
              <p className="text-[10px] text-zinc-500 font-mono uppercase">Throughput</p>
              <p className="text-xs font-mono text-white">{telemetry.throughput.toLocaleString()}/s</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-cyan-400" />
            <div className="text-right">
              <p className="text-[10px] text-zinc-500 font-mono uppercase">Connections</p>
              <p className="text-xs font-mono text-white">{telemetry.activeConnections.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="h-8 w-px bg-zinc-800" />

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
          <span className="text-xs font-mono text-lime-400">SYSTEM ACTIVE</span>
        </div>
      </div>
    </motion.header>
  );
}
