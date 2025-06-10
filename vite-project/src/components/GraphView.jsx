import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import { motion } from 'framer-motion';
import './GraphView.css';

const GraphView = ({
  graphData,
  isAttackerView,
  selectedPath,
  dummyPaths,
  isSimulating,
  onCytoscapeInit,
  selectedSource,
  selectedTarget,
  animatedEdgeStates
}) => {
  const containerRef = useRef(null);
  const cyRef = useRef(null);

  // Define colors and styles as constants
  const styles = {
    default: { 'line-color': '#ccc', 'target-arrow-color': '#ccc', 'width': '2px', 'opacity': 1 },
    main: { 'line-color': '#00ff9d', 'target-arrow-color': '#00ff9d', 'width': '3px', 'opacity': 1 },
    dummyColors: [
      { 'line-color': '#ff0066', 'target-arrow-color': '#ff0066', 'width': '3px', 'opacity': 1 }, // dummy-traffic-0
      { 'line-color': '#ffae00', 'target-arrow-color': '#ffae00', 'width': '3px', 'opacity': 1 }, // dummy-traffic-1
      { 'line-color': '#00bfff', 'target-arrow-color': '#00bfff', 'width': '3px', 'opacity': 1 }, // dummy-traffic-2
      { 'line-color': '#a259ff', 'target-arrow-color': '#a259ff', 'width': '3px', 'opacity': 1 }, // dummy-traffic-3
    ],
    overlap: { 'line-color': '#ff00ff', 'target-arrow-color': '#ff00ff', 'width': '8px', 'opacity': 1 },
    attacker: { 'line-color': '#00bfff', 'target-arrow-color': '#00bfff', 'width': '3px', 'opacity': 1 },
    selected: { 'line-color': '#00ff9d', 'target-arrow-color': '#00ff9d', 'width': '3px', 'opacity': 1 },
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Cytoscape
    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: {
        nodes: graphData.nodes,
        edges: graphData.edges
      },
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#1abc9c',
            'label': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'text-max-width': '80px',
            'color': '#fff',
            'font-size': '10px',
            'font-weight': 'bold',
            'text-outline-color': '#000',
            'text-outline-width': '2px',
            'width': '40px',
            'height': '40px',
            'min-width': '40px',
            'min-height': '40px',
            'border-width': '2px',
            'border-color': '#16a085',
            'border-opacity': '0.8'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': '2px',
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(weight)',
            'text-rotation': 'autorotate',
            'text-margin-y': -10,
            'font-size': '10px',
            'color': '#fff',
            'text-outline-color': '#000',
            'text-outline-width': '2px',
            'transition-property': 'line-color, target-arrow-color, width, opacity',
            'transition-duration': '0.3s'
          }
        },
        {
          selector: '.source-node',
          style: {
            'background-color': '#007bff',
            'border-color': '#0056b3'
          }
        },
        {
          selector: '.target-node',
          style: {
            'background-color': '#dc3545',
            'border-color': '#b02a37'
          }
        },
        {
          selector: '.hide-label',
          style: {
            'label': ''
          }
        }
      ],
      layout: {
        name: 'cose',
        idealEdgeLength: 100,
        nodeOverlap: 100,
        randomize: false,
        componentSpacing: 100,
        nodeRepulsion: 10000,
        edgeElasticity: 200,
        nestingFactor: 5,
        gravity: 20,
        numIter: 500,
        initialTemp: 100,
        coolingFactor: 0.99,
        minTemp: 1.0,
        animate: false,
        step: 1
      }
    });

    // Notify parent component about Cytoscape instance
    if (onCytoscapeInit) {
      onCytoscapeInit(cyRef.current);
    }

    // Cleanup
    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, []);

  // Update graph data
  useEffect(() => {
    if (!cyRef.current) return;

    // Clear existing elements
    cyRef.current.elements().remove();

    // Add new elements
    cyRef.current.add(graphData.nodes);
    cyRef.current.add(graphData.edges);

    // Apply layout and ensure centering/fitting once after data update
    const layoutRun = cyRef.current.layout({ name: 'cose' });
    layoutRun.run();
    layoutRun.promiseOn('layoutstop').then(() => {
      cyRef.current.center();
      cyRef.current.fit();
    });
  }, [graphData]);

  // Effect to apply source and target node styles
  useEffect(() => {
    if (!cyRef.current) return;

    // Clear previous source/target styles
    cyRef.current.nodes().removeClass('source-node target-node');

    if (selectedSource) {
      cyRef.current.getElementById(selectedSource).addClass('source-node');
    }
    if (selectedTarget) {
      cyRef.current.getElementById(selectedTarget).addClass('target-node');
    }
  }, [selectedSource, selectedTarget]);

  // NEW: Centralized Effect to apply animation styles based on animatedEdgeStates
  useEffect(() => {
    if (!cyRef.current) return;

    // Reset all edges to default style first
    cyRef.current.edges().style(styles.default);

    if (isSimulating) {
      // During simulation, apply styles based on animatedEdgeStates
      for (const edgeId in animatedEdgeStates) {
        const edgeState = animatedEdgeStates[edgeId];
        const edgeElement = cyRef.current.getElementById(edgeId);

        if (edgeElement.length > 0) {
          if (isAttackerView) {
            // In Attacker View, all active edges are blue
            if (edgeState.main || edgeState.dummy.length > 0) {
              edgeElement.style(styles.attacker);
            }
          } else {
            // In User View, apply specific colors and handle overlaps
            if (edgeState.main && edgeState.dummy.length > 0) {
              edgeElement.style(styles.overlap);
            } else if (edgeState.main) {
              edgeElement.style(styles.main);
            } else if (edgeState.dummy.length > 0) {
              // Apply the color based on the first dummy index animating this edge
              const dummyIdx = edgeState.dummy[0];
              edgeElement.style(styles.dummyColors[dummyIdx % styles.dummyColors.length]);
            }
          }
        }
      }
    } else if (selectedPath) {
      // If not simulating, but a path is selected, show it as 'selected'
      selectedPath.forEach(edge => {
        const edgeElement = cyRef.current.getElementById(edge.data.id);
        if (edgeElement.length > 0) {
          edgeElement.style(styles.selected);
        }
      });
    }
  }, [animatedEdgeStates, isAttackerView, isSimulating, selectedPath]);

  // Effect to toggle edge label visibility based on isAttackerView
  useEffect(() => {
    if (!cyRef.current) return;
    if (isAttackerView) {
      cyRef.current.edges().addClass('hide-label');
    } else {
      cyRef.current.edges().removeClass('hide-label');
    }
  }, [isAttackerView]);

  // Cleanup: Reset styles on unmount or when animation stops from App.jsx
  useEffect(() => {
    return () => {
      if (cyRef.current) {
        cyRef.current.elements().removeClass('hide-label source-node target-node'); // Only remove node-related classes here
        cyRef.current.edges().style({ // Reset all edge styles to default
          'line-color': '#ccc',
          'target-arrow-color': '#ccc',
          'width': '2px',
          'opacity': 1,
          'label': 'data(weight)',
          'transition-duration': '0.3s'
        });

        // Reset node styles to default
        cyRef.current.nodes().style({
          'background-color': '#1abc9c',
          'border-color': '#16a085'
        });
      }
    };
  }, [cyRef]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full h-full"
    >
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ background: 'linear-gradient(45deg, #1a1a1a 25%, #2a2a2a 25%, #2a2a2a 50%, #1a1a1a 50%, #1a1a1a 75%, #2a2a2a 75%, #2a2a2a 100%)', backgroundSize: '20px 20px' }}
      />
    </motion.div>
  );
};

export default GraphView; 