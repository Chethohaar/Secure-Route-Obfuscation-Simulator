import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import GraphView from './components/GraphView'
import ControlPanel from './components/ControlPanel'
import ViewToggle from './components/ViewToggle'
import StatsPanel from './components/StatsPanel'
import AlgorithmVisualizer from './components/AlgorithmVisualizer'
import './App.css'

function App() {
  const [isAttackerView, setIsAttackerView] = useState(false)
  const [graphData, setGraphData] = useState({
    nodes: [],
    edges: [],
  })
  const [selectedPath, setSelectedPath] = useState(null)
  const [dummyPaths, setDummyPaths] = useState([])
  const [stats, setStats] = useState({
    totalHops: 0,
    totalCost: 0,
    obfuscationLevel: 'low',
  })
  const [animatedEdgeStates, setAnimatedEdgeStates] = useState({});
  const [selectedSource, setSelectedSource] = useState(null)
  const [selectedTarget, setSelectedTarget] = useState(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [obfuscationLevel, setObfuscationLevel] = useState('low')
  const cyRef = useRef(null)

  const handleCytoscapeInit = (cy) => {
    cyRef.current = cy
  }

  const handlePathFound = (path) => {
    setSelectedPath(path)
    setStats(prev => ({
      ...prev,
      totalHops: path.length,
      totalCost: path.reduce((sum, edge) => sum + edge.data.weight, 0),
    }))
  }

  const simulateTraffic = () => {
    if (isSimulating) {
      // Stop the simulation
      if (window.trafficIntervals) {
        window.trafficIntervals.forEach(clearInterval);
      }
      window.trafficIntervals = [];
      setIsSimulating(false);
      setAnimatedEdgeStates({});
      
      return;
    }

    // Start the simulation
    if (!selectedPath || !selectedSource || !selectedTarget) {
      alert('Please select source, destination, and calculate a path first');
      return;
    }

    setIsSimulating(true);
    setDummyPaths([]); // Clear previous dummy paths
    setAnimatedEdgeStates({});

    // Generate dummy paths based on obfuscation level
    const allPaths = findAllPaths(graphData, selectedSource, selectedTarget);
    
    // Filter out the real path and select random dummy paths
    const availablePaths = allPaths.filter(path => 
      !path.every((edge, index) => edge.data.id === selectedPath[index]?.data.id)
    );

    const dummyCount = obfuscationLevel === 'low' ? 1 : obfuscationLevel === 'medium' ? 2 : availablePaths.length;
    
    const selectedDummyPaths = [];
    // Shuffle available paths and select dummyCount paths
    const shuffledAvailablePaths = [...availablePaths].sort(() => 0.5 - Math.random());
    for (let i = 0; i < dummyCount && i < shuffledAvailablePaths.length; i++) {
      selectedDummyPaths.push(shuffledAvailablePaths[i]);
    }

    setDummyPaths(selectedDummyPaths);

    // Clear any existing intervals
    if (window.trafficIntervals) {
      window.trafficIntervals.forEach(clearInterval);
    }
    window.trafficIntervals = [];

    // DEBUG: Final selectedPath for animation:', selectedPath.map(e => e.data.id));
    // DEBUG: Final selectedDummyPaths for animation:', selectedDummyPaths.map(p => p.map(e => e.data.id)));

    // Animate ONLY the main path in user view. Dummy paths are static.
    const interval = animatePath(selectedPath, true, setAnimatedEdgeStates, 0); // dummyIdx is not used for main path
    if (interval) window.trafficIntervals.push(interval);

  };

  // Refactored animatePath to update state, not direct classes
  const animatePath = (path, isMain, setAnimatedEdgeStates, dummyIdx) => {
    if (!path || path.length === 0) return;

    const speed = 700; // ms per edge (adjust as needed)
    let currentIndex = 0;

    const interval = setInterval(() => {
      setAnimatedEdgeStates(prevStates => {
        const newStates = { ...prevStates };

        // Clear previous main edge's animation state
        const prevIdx = (currentIndex - 1 + path.length) % path.length;
        const prevEdge = path[prevIdx];
        if (prevEdge && newStates[prevEdge.data.id]) {
          newStates[prevEdge.data.id].main = false;
        }

        // Set current main edge's animation state
        const currentEdge = path[currentIndex];
        if (currentEdge) {
          if (!newStates[currentEdge.data.id]) {
            newStates[currentEdge.data.id] = { main: false, dummy: [] }; // dummy array will not be used for animation
          }
          newStates[currentEdge.data.id].main = true;
        }

        // DEBUG: Log the entire animatedEdgeStates object at each step
        // console.log('DEBUG: animatedEdgeStates at step', JSON.stringify(newStates));
        return newStates;
      });

      currentIndex = (currentIndex + 1) % path.length;
    }, speed);

    // Initial state update
    setAnimatedEdgeStates(prevStates => {
      const newStates = { ...prevStates };
      const initialEdge = path[currentIndex];
      if (initialEdge) {
        if (!newStates[initialEdge.data.id]) {
          newStates[initialEdge.data.id] = { main: false, dummy: [] };
        }
        newStates[initialEdge.data.id].main = true;
      }
      // DEBUG: Log the initial animatedEdgeStates object with full content
      // console.log('DEBUG: Initial animatedEdgeStates', JSON.stringify(newStates));
      return newStates;
    });

    return interval;
  };

  // Cleanup intervals and clear pulsing state when component unmounts or simulation stops
  useEffect(() => {
    return () => {
      if (window.trafficIntervals) {
        window.trafficIntervals.forEach(clearInterval)
      }
    }
  }, [])

  // Stop simulation, clear traffic classes, and pulsing state when switching views
  useEffect(() => {
    if (window.trafficIntervals) {
      window.trafficIntervals.forEach(clearInterval)
      window.trafficIntervals = []
    }
  }, [isAttackerView])

  const findAllPaths = (graph, start, end) => {
    const paths = []
    const visited = new Set()

    const dfs = (current, path) => {
      if (current === end) {
        paths.push([...path])
        return
      }

      visited.add(current)

      graph.edges
        .filter(edge => edge.data.source === current)
        .forEach(edge => {
          const next = edge.data.target
          if (!visited.has(next)) {
            path.push(edge)
            dfs(next, path)
            path.pop()
          }
        })

      visited.delete(current)
    }

    dfs(start, [])
    return paths
  }

  return (
    <div className="min-h-screen bg-cyber-black text-white p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-cyber-blue text-center">
            RouteShield
          </h1>
          <p className="text-cyber-pink text-center mt-2">
            Secure Route Obfuscation Simulator
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-3">
            <div className="cyber-card h-[600px]">
            <GraphView
  graphData={graphData}
  isAttackerView={isAttackerView}
  selectedPath={selectedPath}
  dummyPaths={dummyPaths}
  isSimulating={isSimulating}
  onCytoscapeInit={handleCytoscapeInit}
  selectedSource={selectedSource}
  selectedTarget={selectedTarget}
  animatedEdgeStates={animatedEdgeStates}
/>
            </div>
          </div>

          <div className="space-y-4">
            <ViewToggle
              isAttackerView={isAttackerView}
              onToggle={() => setIsAttackerView(!isAttackerView)}
              onSimulateTraffic={simulateTraffic}
              isSimulating={isSimulating}
              obfuscationLevel={obfuscationLevel}
              setObfuscationLevel={setObfuscationLevel}
              selectedSource={selectedSource}
              selectedTarget={selectedTarget}
              graphData={graphData}
              setGraphData={setGraphData}
              setSelectedPath={setSelectedPath}
              setStats={setStats}
            />
            <ControlPanel
              graphData={graphData}
              setGraphData={setGraphData}
              setSelectedPath={setSelectedPath}
              setStats={setStats}
              selectedSource={selectedSource}
              setSelectedSource={setSelectedSource}
              selectedTarget={selectedTarget}
              setSelectedTarget={setSelectedTarget}
              isAttackerView={isAttackerView}
              findAllPaths={findAllPaths}
            />
          </div>
        </div>

        <div className="mt-4">
          <StatsPanel stats={stats} />
      </div>

        {(selectedSource && selectedTarget) && (
          <AlgorithmVisualizer
            graphData={graphData}
            source={selectedSource}
            target={selectedTarget}
            onPathFound={handlePathFound}
          />
        )}
      </motion.div>
      </div>
  )
}

export default App
