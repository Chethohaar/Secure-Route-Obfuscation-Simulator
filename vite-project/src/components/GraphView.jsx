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
  selectedTarget
}) => {
  const containerRef = useRef(null);
  const cyRef = useRef(null);

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
          selector: '.selected',
          style: {
            'line-color': '#00ff9d',
            'target-arrow-color': '#00ff9d',
            'width': '3px'
          }
        },
        {
          selector: '.real-traffic',
          style: {
            'line-color': '#00ff9d',
            'target-arrow-color': '#00ff9d',
            'width': '3px',
            'opacity': 1
          }
        },
        {
          selector: '.dummy-traffic',
          style: {
            'line-color': '#ff0066',
            'target-arrow-color': '#ff0066',
            'width': '3px',
            'opacity': 1
          }
        },
        {
          selector: '.attacker-visible-traffic',
          style: {
            'line-color': '#00bfff',
            'target-arrow-color': '#00bfff',
            'width': '3px',
            'opacity': 1,
            'transition-duration': '0s'
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
        },
        {
          selector: '.packet-moving-animation',
          style: {
            'line-dash-pattern': [15, 15],
            'line-dash-offset': '0',
            'transition-property': 'line-dash-offset',
            'transition-duration': '1s',
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

  // Handle path highlighting and traffic simulation
  useEffect(() => {
    if (!cyRef.current) return;

    console.log('GraphView useEffect triggered:', { selectedPath, dummyPaths, isSimulating, isAttackerView });

    // Clear all traffic-related classes and reset direct styles to default
    cyRef.current.elements().removeClass('selected real-traffic dummy-traffic packet-moving-animation');
    cyRef.current.edges().style({
      'line-color': '#ccc',
      'target-arrow-color': '#ccc',
      'width': '2px',
      'opacity': 1
    });

    if (isAttackerView) {
      if (isSimulating) {
        // In Attacker View during simulation, override colors to blue directly
        const pathsToHighlight = [];
        if (selectedPath) {
          pathsToHighlight.push(...selectedPath);
        }
        dummyPaths.forEach(path => pathsToHighlight.push(...path));

        pathsToHighlight.forEach(edge => {
          const edgeElement = cyRef.current.getElementById(edge.data.id);
          if (edgeElement.length > 0) {
            edgeElement.style({
              'line-color': '#00bfff',
              'target-arrow-color': '#00bfff'
            });
            console.log(`Attacker View: Applied blue style to edge ${edge.data.id}. Computed style:`, edgeElement.style());
          }
        });
      }
      // If not simulating in attacker view, paths remain default (grey)
    } else {
      // In User View, apply real/dummy traffic or selected path styles via classes
      if (isSimulating) {
        // Apply real traffic highlight
        if (selectedPath) {
          selectedPath.forEach(edge => {
            const edgeElement = cyRef.current.getElementById(edge.data.id);
            if (edgeElement.length > 0) {
              edgeElement.addClass('real-traffic');
            }
          });
        }

        // Apply dummy traffic highlights
        dummyPaths.forEach(path => {
          path.forEach(edge => {
            const edgeElement = cyRef.current.getElementById(edge.data.id);
            if (edgeElement.length > 0) {
              edgeElement.addClass('dummy-traffic');
            }
          });
        });
      } else if (selectedPath) {
        // If not simulating, only show the selected path
        selectedPath.forEach(edge => {
          const edgeElement = cyRef.current.getElementById(edge.data.id);
          if (edgeElement.length > 0) {
            edgeElement.addClass('selected');
          }
        });
      }
    }
  }, [selectedPath, dummyPaths, isSimulating, isAttackerView]);

  // Effect to toggle edge label visibility based on isAttackerView
  useEffect(() => {
    if (!cyRef.current) return;
    if (isAttackerView) {
      cyRef.current.edges().addClass('hide-label');
    } else {
      cyRef.current.edges().removeClass('hide-label');
    }
  }, [isAttackerView]);

  // Cleanup: Remove any lingering traffic styles when the component unmounts or when animation stops from App.jsx
  useEffect(() => {
    return () => {
      if (cyRef.current) {
        // Reset all styles on unmount
        cyRef.current.elements().removeClass('selected real-traffic dummy-traffic hide-label source-node target-node packet-moving-animation');
        cyRef.current.edges().style({
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