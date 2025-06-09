import { motion } from 'framer-motion';
import { ShieldCheckIcon, ShieldExclamationIcon, PlayIcon } from '@heroicons/react/24/outline';

const ViewToggle = ({ 
  isAttackerView, 
  onToggle, 
  onSimulateTraffic,
  isSimulating,
  obfuscationLevel,
  setObfuscationLevel,
  selectedSource,
  selectedTarget,
  graphData,
  setGraphData,
  setSelectedPath,
  setStats
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="cyber-card"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-cyber-blue font-semibold">
          {isAttackerView ? 'Attacker View' : 'User View'}
        </span>
        <button
          onClick={onToggle}
          className="cyber-button flex items-center gap-2"
        >
          {isAttackerView ? (
            <>
              <ShieldExclamationIcon className="w-5 h-5" />
              Switch to User View
            </>
          ) : (
            <>
              <ShieldCheckIcon className="w-5 h-5" />
              Switch to Attacker View
            </>
          )}
        </button>
      </div>

      {!isAttackerView && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-cyber-blue">Obfuscation Level</label>
            <select
              value={obfuscationLevel}
              onChange={(e) => setObfuscationLevel(e.target.value)}
              className="cyber-input w-full"
            >
              <option value="low">Low (1 dummy path)</option>
              <option value="medium">Medium (2 dummy paths)</option>
              <option value="high">High (all paths)</option>
            </select>
          </div>

          <button
            onClick={onSimulateTraffic}
            disabled={!selectedSource || !selectedTarget}
            className={`cyber-button w-full flex items-center justify-center gap-2 ${
              (!selectedSource || !selectedTarget) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <PlayIcon className="w-5 h-5" />
            {isSimulating ? 'Stop Simulation' : 'Simulate Traffic'}
          </button>
        </div>
      )}

      {isAttackerView && (
        <div className="text-cyber-pink text-sm">
          <p>As an attacker, you can see all network traffic but cannot determine which path contains the real data.</p>
          <p className="mt-2">Try to identify the real path by analyzing the traffic patterns!</p>
        </div>
      )}
    </motion.div>
  );
};

export default ViewToggle; 