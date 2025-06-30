import sys
import time
from typing import Dict, List, Set, Tuple
import random
from dataclasses import dataclass
import json

@dataclass
class Edge:
    source: str
    target: str
    weight: float

class Graph:
    def __init__(self):
        self.nodes: Set[str] = set()
        self.edges: List[Edge] = []
        self.adj_list: Dict[str, List[Tuple[str, float]]] = {}

    def add_node(self, node: str) -> None:
        self.nodes.add(node)
        if node not in self.adj_list:
            self.adj_list[node] = []

    def add_edge(self, source: str, target: str, weight: float) -> None:
        self.add_node(source)
        self.add_node(target)
        self.edges.append(Edge(source, target, weight))
        self.adj_list[source].append((target, weight))

    def get_neighbors(self, node: str) -> List[Tuple[str, float]]:
        return self.adj_list.get(node, [])

def dijkstra_with_steps(graph: Graph, start: str, end: str) -> Tuple[List[dict], Dict[str, float], Dict[str, str]]:
    steps = []
    distances = {node: float('infinity') for node in graph.nodes}
    previous = {node: None for node in graph.nodes}
    unvisited = set(graph.nodes)
    distances[start] = 0

    # First step
    steps.append({
        'current_node': start,
        'distance': 0,
        'distances': distances.copy(),
        'previous': previous.copy(),
        'unvisited': unvisited.copy()
    })

    while unvisited:
        # Find unvisited node with smallest distance
        current = min(unvisited, key=lambda x: distances[x])
        
        if distances[current] == float('infinity'):
            break

        unvisited.remove(current)

        # Update distances to neighbors
        for neighbor, weight in graph.get_neighbors(current):
            distance = distances[current] + weight
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                previous[neighbor] = current

        # Add step
        steps.append({
            'current_node': current,
            'distance': distances[current],
            'distances': distances.copy(),
            'previous': previous.copy(),
            'unvisited': unvisited.copy()
        })

        if current == end:
            break

    return steps, distances, previous

def generate_all_paths(graph: Graph, start: str, end: str, shortest_path: List[str], num_paths: int) -> List[List[str]]:
    """Generate all required paths: dummy paths and actual traffic path"""
    all_paths = []
    attempts = 0
    max_attempts = num_paths * 5  # Allow multiple attempts to find valid paths
    
    while len(all_paths) < num_paths and attempts < max_attempts:
        attempts += 1
        path = []
        current = start
        visited = set()
        
        while current != end and current not in visited:
            visited.add(current)
            path.append(current)
            neighbors = [n for n, _ in graph.get_neighbors(current) if n not in visited or n == end]
            if not neighbors:
                break
            current = random.choice(neighbors)
        
        if current == end:
            path.append(end)
            # Remove any duplicates while preserving order
            seen = set()
            path = [x for x in path if not (x in seen or seen.add(x))]
            # Check if this path is unique and different from shortest path
            if path not in all_paths and path != shortest_path:
                all_paths.append(path)
    
    # Generate one more path for actual traffic that's different from both shortest and dummy paths
    while attempts < max_attempts:
        attempts += 1
        path = []
        current = start
        visited = set()
        
        while current != end and current not in visited:
            visited.add(current)
            path.append(current)
            neighbors = [n for n, _ in graph.get_neighbors(current) if n not in visited or n == end]
            if not neighbors:
                break
            current = random.choice(neighbors)
        
        if current == end:
            path.append(end)
            seen = set()
            path = [x for x in path if not (x in seen or seen.add(x))]
            # Check if this path is unique from both shortest path and dummy paths
            if path != shortest_path and path not in all_paths:
                return all_paths, path  # Return dummy paths and actual traffic path separately
    
    return all_paths, None  # Return None for actual path if we couldn't find a unique one

def select_random_path(main_path: List[str], dummy_paths: List[List[str]]) -> Tuple[List[str], str]:
    # Combine main path and dummy paths, giving preference to dummy paths
    all_paths = dummy_paths + [main_path]  # Put main path last to prefer dummy paths
    path_types = ['dummy'] * len(dummy_paths) + ['main']
    
    # Randomly select a path and its type
    selected_idx = random.randrange(len(all_paths))
    return all_paths[selected_idx], path_types[selected_idx]

def calculate_max_possible_paths(graph: Graph, start: str, end: str) -> int:
    # Simple DFS to count possible paths
    def dfs(current: str, visited: set) -> int:
        if current == end:
            return 1
        if current in visited:
            return 0
        
        count = 0
        visited.add(current)
        for neighbor, _ in graph.get_neighbors(current):
            count += dfs(neighbor, visited.copy())
        return count
    
    return max(0, dfs(start, set()) - 1)  # Subtract 1 to exclude the main path

def reconstruct_path(previous: Dict[str, str], start: str, end: str) -> List[str]:
    path = []
    current = end
    
    while current is not None:
        path.append(current)
        current = previous[current]
    
    return list(reversed(path))

def print_step(step: dict, show_details: bool = True) -> None:
    print(f"\nCurrent Node: {step['current_node']}")
    print(f"Distance to current node: {step['distance']}")
    
    if show_details:
        print("\nDistance Table:")
        print("Node\tDistance\tPrevious")
        print("-" * 40)
        for node, dist in step['distances'].items():
            prev = step['previous'][node] or '-'
            dist_str = '∞' if dist == float('infinity') else str(dist)
            print(f"{node}\t{dist_str}\t\t{prev}")

def print_path_info(path_list: List[str], path_type: str = "", distance: float = None) -> None:
    """Helper function to print path information with consistent formatting"""
    path_str = " -> ".join(path_list)
    if distance is not None:
        print(f"{path_type}: {path_str} (distance: {distance})")
    else:
        print(f"{path_type}: {path_str}")

def calculate_path_cost(graph: Graph, path: List[str]) -> float:
    """Calculate the total cost of a path"""
    total_cost = 0
    for i in range(len(path) - 1):
        current = path[i]
        next_node = path[i + 1]
        # Find the edge weight between current and next node
        for neighbor, weight in graph.get_neighbors(current):
            if neighbor == next_node:
                total_cost += weight
                break
    return total_cost

def main():
    # Example graph or load from file
    print("Welcome to the Secure DAA CLI Tool")
    print("==================================")
    
    while True:
        print("\nMenu:")
        print("1. Use example graph")
        print("2. Input custom graph")
        print("3. Load graph from JSON file")
        print("4. Exit")
        
        choice = input("\nEnter your choice (1-4): ")
        
        graph = Graph()
        
        if choice == '1':
            # Example graph
            edges = [
                ('A', 'B', 4), ('A', 'C', 2),
                ('B', 'D', 3), ('C', 'B', 1),
                ('C', 'D', 5), ('D', 'E', 2),
                ('B', 'E', 6)
            ]
            for source, target, weight in edges:
                graph.add_edge(source, target, weight)
        
        elif choice == '2':
            print("\nEnter edges in format 'source target weight' (e.g., 'A B 4')")
            print("Enter 'done' when finished")
            
            while True:
                edge_input = input("\nEnter edge: ").strip()
                if edge_input.lower() == 'done':
                    break
                
                try:
                    source, target, weight = edge_input.split()
                    graph.add_edge(source, target, float(weight))
                except ValueError:
                    print("Invalid input format. Please use 'source target weight'")
        
        elif choice == '3':
            filename = input("\nEnter JSON file path: ")
            try:
                with open(filename, 'r') as f:
                    data = json.load(f)
                    for edge in data['edges']:
                        graph.add_edge(edge['source'], edge['target'], float(edge['weight']))
            except Exception as e:
                print(f"Error loading file: {e}")
                continue
        
        elif choice == '4':
            print("\nGoodbye!")
            sys.exit(0)
        
        else:
            print("\nInvalid choice. Please try again.")
            continue
        
        # Get source and target nodes
        print("\nAvailable nodes:", sorted(list(graph.nodes)))
        start = input("Enter start node: ").strip()
        end = input("Enter target node: ").strip()
        
        if start not in graph.nodes or end not in graph.nodes:
            print("Invalid start or end node!")
            continue
        
        # Run algorithm
        print("\nRunning Dijkstra's algorithm...")
        steps, distances, previous = dijkstra_with_steps(graph, start, end)
        
        # Show steps
        show_steps = input("\nShow step-by-step process? (y/n): ").lower() == 'y'
        if show_steps:
            for i, step in enumerate(steps, 1):
                print(f"\nStep {i}")
                print_step(step)
                if i < len(steps):
                    input("Press Enter for next step...")
        
        # Show final path
        shortest_path = reconstruct_path(previous, start, end)
        print("\nPath Analysis:")
        print("=" * 50)
        print_path_info(shortest_path, "Shortest Path (Used as Reference Only)", distances[end])
        
        # Calculate maximum possible paths
        max_paths = calculate_max_possible_paths(graph, start, end)
        if max_paths < 2:  # Need at least 2 paths: 1 for traffic and 1 for dummy
            print("\nNot enough possible paths between these nodes for secure routing.")
            continue
            
        print(f"\nMaximum possible additional paths: {max_paths}")
        num_dummy = input(f"How many dummy paths to generate (0-{max_paths-1})? ").strip()
        
        try:
            num_dummy = int(num_dummy)
            if num_dummy < 0 or num_dummy >= max_paths:
                print(f"Invalid number. Please enter a value between 0 and {max_paths-1}")
                continue
        except ValueError:
            print("Please enter a valid number")
            continue
        
        if num_dummy > 0:
            # Generate dummy paths and actual traffic path
            dummy_paths, actual_traffic_path = generate_all_paths(graph, start, end, shortest_path, num_dummy)
            
            if len(dummy_paths) < num_dummy or actual_traffic_path is None:
                print("\nCouldn't generate enough unique paths. Try with fewer dummy paths.")
                continue
            
            print("\nGenerated Paths:")
            print("=" * 50)
            print("NOTE: These paths are used to confuse potential attackers")
            print("-" * 50)
            print_path_info(shortest_path, "Reference - Shortest Path (NOT used)", distances[end])
            print("\nDummy Paths (Decoys):")
            print("-" * 50)
            for i, dummy_path in enumerate(dummy_paths, 1):
                cost = calculate_path_cost(graph, dummy_path)
                print_path_info(dummy_path, f"Dummy Path {i} (Decoy)", cost)
            
            print("\nTraffic Routing Decision:")
            print("=" * 50)
            print("The following path will be used for actual traffic routing:")
            print("(Different from both shortest and dummy paths)")
            print("-" * 50)
            actual_cost = calculate_path_cost(graph, actual_traffic_path)
            print_path_info(actual_traffic_path, "SELECTED FOR TRAFFIC - Actual Path", actual_cost)
        
        print("\n" + "="*50)

if __name__ == "__main__":
    main()