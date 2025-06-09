import { motion } from 'framer-motion';
import { ChartBarIcon, ArrowPathIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const StatsPanel = ({ stats }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="cyber-card"
    >
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-2">
          <ChartBarIcon className="w-6 h-6 text-cyber-blue" />
          <div>
            <p className="text-sm text-cyber-pink">Total Hops</p>
            <p className="text-xl font-bold text-cyber-blue">{stats.totalHops}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ArrowPathIcon className="w-6 h-6 text-cyber-blue" />
          <div>
            <p className="text-sm text-cyber-pink">Total Cost</p>
            <p className="text-xl font-bold text-cyber-blue">{stats.totalCost}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ShieldCheckIcon className="w-6 h-6 text-cyber-blue" />
          <div>
            <p className="text-sm text-cyber-pink">Obfuscation</p>
            <p className="text-xl font-bold text-cyber-blue capitalize">{stats.obfuscationLevel}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatsPanel; 