# Decision Tree Visualization Tool

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)

A React-based application for creating and visualizing decision trees with D3.js. This tool allows users to build complex decision trees with different types of nodes, each having specific properties and connection rules.

## Demo

You can access the live demo of the application at:
```
http://165.22.13.117:4833
```
## Node Types and Properties

### Node Types
1. **Start Node**
   - Special decision node that cannot be deleted
   - Cost: Always 0
   - Probability: Always 1
   - Time: 0 weeks
   - Can only have Decision nodes as children

2. **Decision Node**
   - Probability: Always 1
   - Time: Default 1 week
   - Can have Action and Exit nodes as children

3. **Action Node**
   - Time: Default 2 weeks
   - Can have Result (Outcome) and Decision nodes as children

4. **Result (Outcome) Node**
   - Cost: Always 0
   - Time: Default 0 weeks
   - Can have Action, Decision, and Exit nodes as children

5. **Exit Node**
   - Cost: Always 0
   - Time: Always 0 weeks
   - Probability: Always 1
   - Cannot have any children

### Node Connection Rules
- **Start Node** → Decision
- **Decision Node** → Action, Exit
- **Action Node** → Result, Decision
- **Result Node** → Action, Decision, Exit
- **Exit Node** → No children allowed

## Features

### Node Management
- Add new nodes with specific types based on parent node rules
- Edit node properties (name, cost, time, probability)
- Delete nodes (except Start node)
- Automatic validation of node properties
- Default values based on node type

### Tree Operations
- Load predefined demo trees
- Upload custom tree JSON files
- Download current tree as JSON
- Reset tree to initial state
- Calculate expected cost for the entire tree

### Visualization
- Interactive tree visualization using D3.js
- Color-coded nodes based on type
- Node type indicators (S, D, A, O, E)
- Node details display on selection
- Automatic tree layout and scaling

## Usage

1. **Adding Nodes**
   - Click on a node to select it
   - Click "Add Node" to add a child node
   - Select the appropriate node type based on parent node rules
   - Fill in the required properties

2. **Editing Nodes**
   - Click on a node to select it
   - Click "Edit Node" to modify its properties
   - Some properties may be disabled based on node type

3. **Deleting Nodes**
   - Click on a node to select it
   - Click "Delete Node" to remove it
   - Note: Start node cannot be deleted

4. **Calculating Expected Cost**
   - Click on the Start node
   - Click "Update Expected Cost" to calculate the expected cost for the entire tree

## File Management

- **Load Demo Trees**: Predefined trees demonstrating different decision scenarios
- **Upload Tree**: Load a custom tree from a JSON file
- **Download Tree**: Save the current tree as a JSON file
- **Reset Tree**: Clear the current tree and start fresh

## Technical Details

### Dependencies
- React
- D3.js
- Material-UI
- UUID
- Docker
- Nginx

### Data Structure
Each node in the tree has the following properties:
- `id`: Unique identifier
- `name`: Node name
- `nodeType`: Type of node (start, decision, action, outcome, exit)
- `probability`: Probability value (0-1)
- `cost`: Cost value (≥ 0)
- `time`: Time in weeks (≥ 0)
- `expected_cost`: Calculated expected cost
- `children`: Array of child nodes

## Contributing

Feel free to submit issues and enhancement requests.

## License

This project is licensed under the MIT License.

