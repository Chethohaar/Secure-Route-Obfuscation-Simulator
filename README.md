# SECURE ROUTE OBFUSCATION SIMULATOR

![User View](/secureDAA/Userview.png)
![Algo Visualisation](/secureDAA/Algovisual.png)
![Attacker View](/secureDAA/Attackerview.png)

## Features Explained

1. **Dijkstra's Algorithm**: Finds the shortest path between two nodes in a weighted graph.

2. **Step-by-Step Visualization**: Shows how the algorithm works:

   - Current node being processed
   - Updated distances to all nodes
   - Previous nodes in the shortest paths

3. **Secure Routing**:

   - Generates dummy paths to obscure the actual path
   - Helps prevent traffic analysis attacks
   - Creates multiple believable alternative paths

4. **Distance Table**: Shows for each node:
   - Current known distance from start
   - Previous node in the shortest path
   - Whether the node has been visited

# CLI TOOL

This is a command-line interface (CLI) version of the Secure Route Obfuscation Simulator (Design and Analysis of Algorithms) project. It implements Dijkstra's algorithm with secure routing features, allowing users to find shortest paths in graphs while also generating dummy paths for security purposes.

## Features

- Interactive command-line interface
- Multiple ways to input graph data:
  - Use a pre-defined example graph
  - Input custom graph data manually
  - Load graph data from JSON files
- Step-by-step visualization of Dijkstra's algorithm
- Secure routing with dummy path generation
- Detailed distance tables and path information

## Requirements

- Python 3.6 or higher

## Usage

1. Run the program:

   ```bash
   python cli_version.py
   ```

2. Choose how to input your graph:

   - Option 1: Use the built-in example graph
   - Option 2: Input a custom graph manually
   - Option 3: Load a graph from a JSON file
   - Option 4: Exit the program

3. If inputting a custom graph manually:

   - Enter edges in the format: `source target weight`
   - Example: `A B 4` creates an edge from node A to node B with weight 4
   - Type 'done' when finished

4. If loading from a JSON file:

   - Use the format shown in `sample_graph.json`
   - The JSON file should contain an array of edges with source, target, and weight

5. Follow the prompts to:
   - Select start and end nodes
   - View step-by-step algorithm execution (optional)
   - Generate dummy paths for secure routing (optional)

## JSON File Format

```json
{
    "edges": [
        {"source": "A", "target": "B", "weight": 4},
        {"source": "A", "target": "C", "weight": 2},
        ...
    ]
}
```

## Example Usage

1. Using the example graph:

   ```
   Welcome to the Secure DAA CLI Tool
   ==================================

   Menu:
   1. Use example graph
   2. Input custom graph
   3. Load graph from JSON file
   4. Exit

   Enter your choice (1-4): 1

   Available nodes: ['A', 'B', 'C', 'D', 'E']
   Enter start node: A
   Enter target node: E
   ```

2. The program will show:
   - The shortest path from start to end
   - Total distance
   - Optional step-by-step process
   - Optional dummy paths for secure routing
