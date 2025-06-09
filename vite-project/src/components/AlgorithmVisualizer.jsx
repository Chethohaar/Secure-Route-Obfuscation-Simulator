import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline';

const AlgorithmVisualizer = ({ graphData, source, target, onPathFound }) => {
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000); // ms per step

  useEffect(() => {
    if (source && target) {
      const algorithmSteps = runDijkstraWithSteps(graphData, source, target);
      setSteps(algorithmSteps);
      setCurrentStep(0);
    }
  }, [graphData, source, target]);

  useEffect(() => {
    let interval;
    if (isPlaying && currentStep < steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => prev + 1);
      }, playbackSpeed);
    } else if (currentStep === steps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps.length, playbackSpeed]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStep = (direction) => {
    if (direction === 'next' && currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else if (direction === 'prev' && currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const currentStepData = steps[currentStep] || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="cyber-card mt-4"
    >
      <h2 className="text-xl font-bold text-cyber-blue mb-4">Algorithm Visualization</h2>
      
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleStep('prev')}
              disabled={currentStep === 0}
              className="cyber-button"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            
            <button
              onClick={handlePlayPause}
              className="cyber-button"
            >
              {isPlaying ? (
                <PauseIcon className="w-5 h-5" />
              ) : (
                <PlayIcon className="w-5 h-5" />
              )}
            </button>
            
            <button
              onClick={() => handleStep('next')}
              disabled={currentStep === steps.length - 1}
              className="cyber-button"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>

          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            className="cyber-input"
          >
            <option value={500}>Fast</option>
            <option value={1000}>Normal</option>
            <option value={2000}>Slow</option>
          </select>
        </div>

        {/* Step Information */}
        <div className="grid grid-cols-2 gap-4">
          <div className="cyber-card bg-opacity-50">
            <h3 className="text-cyber-pink mb-2">Current Node</h3>
            <p className="text-cyber-blue font-mono">
              {currentStepData.currentNode || 'N/A'}
            </p>
          </div>

          <div className="cyber-card bg-opacity-50">
            <h3 className="text-cyber-pink mb-2">Distance</h3>
            <p className="text-cyber-blue font-mono">
              {currentStepData.distance || 'N/A'}
            </p>
          </div>
        </div>

        {/* Distance Table */}
        <div className="cyber-card bg-opacity-50">
          <h3 className="text-cyber-pink mb-2">Distance Table</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-cyber-blue px-2">Node</th>
                  <th className="text-cyber-blue px-2">Distance</th>
                  <th className="text-cyber-blue px-2">Previous</th>
                </tr>
              </thead>
              <tbody>
                {currentStepData.distances && Object.entries(currentStepData.distances).map(([node, data]) => (
                  <tr key={node} className={data.visited ? 'text-cyber-green' : 'text-cyber-blue'}>
                    <td className="px-2">{node}</td>
                    <td className="px-2">{data.distance === Infinity ? '∞' : data.distance}</td>
                    <td className="px-2">{data.previous || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-cyber-black rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-cyber-blue"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-cyber-pink text-sm">
            {currentStep + 1} / {steps.length}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// Modified Dijkstra's algorithm that returns steps
const runDijkstraWithSteps = (graph, start, end) => {
  const steps = [];
  const distances = {};
  const previous = {};
  const unvisited = new Set();

  // Initialize
  graph.nodes.forEach(node => {
    distances[node.data.id] = {
      distance: Infinity,
      previous: null,
      visited: false
    };
    unvisited.add(node.data.id);
  });
  distances[start].distance = 0;

  // First step
  steps.push({
    currentNode: start,
    distance: 0,
    distances: { ...distances }
  });

  while (unvisited.size > 0) {
    // Find unvisited node with smallest distance
    let current = null;
    let smallestDistance = Infinity;
    unvisited.forEach(node => {
      if (distances[node].distance < smallestDistance) {
        current = node;
        smallestDistance = distances[node].distance;
      }
    });

    if (current === null || current === end) break;

    unvisited.delete(current);
    distances[current].visited = true;

    // Update distances to neighbors
    graph.edges
      .filter(edge => edge.data.source === current)
      .forEach(edge => {
        const neighbor = edge.data.target;
        const distance = distances[current].distance + edge.data.weight;

        if (distance < distances[neighbor].distance) {
          distances[neighbor].distance = distance;
          distances[neighbor].previous = current;
        }
      });

    // Add step
    steps.push({
      currentNode: current,
      distance: distances[current].distance,
      distances: { ...distances }
    });
  }

  return steps;
};

export default AlgorithmVisualizer; 