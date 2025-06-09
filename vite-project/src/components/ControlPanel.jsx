import { useState } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, TrashIcon, PlayIcon, ArrowPathIcon, TableCellsIcon } from '@heroicons/react/24/outline';

const ControlPanel = ({
  graphData,
  setGraphData,
  setSelectedPath,
  setStats,
  selectedSource,
  setSelectedSource,
  selectedTarget,
  setSelectedTarget,
  isAttackerView,
  findAllPaths
}) => {
  const [sourceNode, setSourceNode] = useState('');
  const [targetNode, setTargetNode] = useState('');
  const [edgeWeight, setEdgeWeight] = useState('');
  const [costMatrix, setCostMatrix] = useState('');
  const [showMatrixInput, setShowMatrixInput] = useState(false);

  const addNode = () => {
    const newNodeId = `node${graphData.nodes.length + 1}`;
    setGraphData(prev => ({
      ...prev,
      nodes: [...prev.nodes, { data: { id: newNodeId, label: newNodeId } }]
    }));
  };

  const addEdge = () => {
    if (!sourceNode || !targetNode || !edgeWeight) return;

    const newEdgeId = `edge${graphData.edges.length + 1}`;
    setGraphData(prev => ({
      ...prev,
      edges: [...prev.edges, {
        data: {
          id: newEdgeId,
          source: sourceNode,
          target: targetNode,
          weight: parseInt(edgeWeight)
        }
      }]
    }));

    setSourceNode('');
    setTargetNode('');
    setEdgeWeight('');
  };

  const applyCostMatrix = () => {
    try {
      const matrix = costMatrix.trim().split('\n').map(row => 
        row.trim().split(/\s+/).map(Number)
      );

      // Validate matrix
      const n = matrix.length;
      if (matrix.some(row => row.length !== n)) {
        throw new Error('Matrix must be square');
      }

      let newEdges = [];
      let edgeId = graphData.edges.length + 1; // Start ID after existing edges

      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (matrix[i][j] > 0) {
            const sourceNode = `node${i + 1}`;
            const targetNode = `node${j + 1}`;
            newEdges.push({
              data: {
                id: `edge${edgeId++}`,
                source: sourceNode,
                target: targetNode,
                weight: matrix[i][j]
              }
            });
          }
        }
      }

      // Only update graphData once after all edges are processed
      setGraphData(prev => ({
        ...prev,
        edges: [...prev.edges, ...newEdges]
      }));

      setCostMatrix('');
      setShowMatrixInput(false);
    } catch (error) {
      alert('Invalid cost matrix format. Please enter a valid square matrix with numbers.');
    }
  };

  const clearGraph = () => {
    setGraphData({ nodes: [], edges: [] });
    setSelectedPath(null);
    setStats({ totalHops: 0, totalCost: 0, obfuscationLevel: 'low' });
    setSelectedSource(null);
    setSelectedTarget(null);
  };

  const findShortestPath = () => {
    if (!selectedSource || !selectedTarget) {
      alert('Please select both source and destination nodes');
      return;
    }

    const allPossiblePaths = findAllPaths(graphData, selectedSource, selectedTarget);

    if (allPossiblePaths.length === 0) {
      alert('No path found between the selected nodes');
      return;
    }

    console.log('All possible paths:', allPossiblePaths);

    // Select a random path from all possible paths
    const randomIndex = Math.floor(Math.random() * allPossiblePaths.length);
    const randomPath = allPossiblePaths[randomIndex];

    console.log('Randomly selected path (actual path):', randomPath);

    setSelectedPath(randomPath);
    
    // Update stats
    setStats(prev => ({
      ...prev,
      totalHops: randomPath.length,
      totalCost: randomPath.reduce((sum, edge) => sum + edge.data.weight, 0),
    }));
  };

  if (isAttackerView) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="cyber-card space-y-4"
      >
        <h2 className="text-xl font-bold text-cyber-blue">Network Analysis</h2>
        <div className="text-cyber-pink text-sm">
          <p>As an attacker, you can observe the network traffic but cannot control the routing.</p>
          <p className="mt-2">Try to identify patterns in the traffic to determine the real path!</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="cyber-card space-y-4"
    >
      <h2 className="text-xl font-bold text-cyber-blue">Controls</h2>

      <div className="space-y-2">
        <button
          onClick={addNode}
          className="cyber-button w-full flex items-center justify-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Add Node
        </button>

        <button
          onClick={() => setShowMatrixInput(!showMatrixInput)}
          className="cyber-button w-full flex items-center justify-center gap-2"
        >
          <TableCellsIcon className="w-5 h-5" />
          {showMatrixInput ? 'Hide Cost Matrix' : 'Show Cost Matrix'}
        </button>

        {showMatrixInput ? (
          <div className="space-y-2">
            <textarea
              value={costMatrix}
              onChange={(e) => setCostMatrix(e.target.value)}
              placeholder="Enter cost matrix (one row per line, space-separated numbers)"
              className="cyber-input w-full h-32"
            />
            <button
              onClick={applyCostMatrix}
              className="cyber-button w-full flex items-center justify-center gap-2"
            >
              <ArrowPathIcon className="w-5 h-5" />
              Apply Cost Matrix
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={sourceNode}
                onChange={(e) => setSourceNode(e.target.value)}
                placeholder="Source Node"
                className="cyber-input"
              />
              <input
                type="text"
                value={targetNode}
                onChange={(e) => setTargetNode(e.target.value)}
                placeholder="Target Node"
                className="cyber-input"
              />
            </div>

            <input
              type="number"
              value={edgeWeight}
              onChange={(e) => setEdgeWeight(e.target.value)}
              placeholder="Edge Weight"
              className="cyber-input w-full"
            />

            <button
              onClick={addEdge}
              className="cyber-button w-full flex items-center justify-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Add Edge
            </button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-cyber-blue">Select Source Node</label>
        <select
          value={selectedSource || ''}
          onChange={(e) => setSelectedSource(e.target.value)}
          className="cyber-input w-full"
        >
          <option value="">Select a node</option>
          {graphData.nodes.map(node => (
            <option key={node.data.id} value={node.data.id}>
              {node.data.label}
            </option>
          ))}
        </select>

        <label className="block text-cyber-blue">Select Destination Node</label>
        <select
          value={selectedTarget || ''}
          onChange={(e) => setSelectedTarget(e.target.value)}
          className="cyber-input w-full"
        >
          <option value="">Select a node</option>
          {graphData.nodes.map(node => (
            <option key={node.data.id} value={node.data.id}>
              {node.data.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <button
          onClick={findShortestPath}
          className="cyber-button w-full flex items-center justify-center gap-2"
        >
          <PlayIcon className="w-5 h-5" />
          Find Path
        </button>

        <button
          onClick={clearGraph}
          className="cyber-button w-full flex items-center justify-center gap-2"
        >
          <TrashIcon className="w-5 h-5" />
          Clear Graph
        </button>
      </div>
    </motion.div>
  );
};

export default ControlPanel; 