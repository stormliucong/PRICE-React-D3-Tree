import React from 'react';
import { v4 as uuidv4 } from 'uuid';

export const drawerWidth = 500;

export const renderCustomNodeElement = ({ nodeDatum, toggleNode, selectedNode }) => {
  let color;
  let word;
  let text_color = 'black';
  let stroke_width = 2;
  let radius = selectedNode && selectedNode.id === nodeDatum.id ? 25 : 20; // Larger radius for selected node

  switch (nodeDatum.nodeType) {
    case nodeTypes.START:
      word = 'S'
      color = nodeColors.START;
      break;
    case nodeTypes.DECISION:
      word = 'D'
      color = nodeColors.DECISION;
      break;
    case nodeTypes.ACTION:
      word = 'A'
      color = nodeColors.ACTION;
      break;
    case nodeTypes.OUTCOME:
      word = 'O'
      color = nodeColors.OUTCOME;
      break;
    default:
      word = 'E'
      color = nodeColors.EXIT;
  }

  if (nodeDatum.valid_prob === false){
    text_color = 'red';
    stroke_width = 5;
  }

  return (
    <g>
      {/* Add word into the circle */}
      <text fill="black" strokeWidth="1" x="-10">
      </text>
      <circle fill={color} r={radius} stroke={text_color} strokeWidth={stroke_width} onClick={() => toggleNode(nodeDatum)} />
      
      <text fill={text_color} stroke={text_color} strokeWidth="1" x="30">
        {nodeDatum.name}
      </text>
    </g>
  );
};

export const nodeTypes = {
  START: 'start', // start is a special decision node can not be deleted.
  DECISION: 'decision', // decision node can have parent of one outcome or null, and children of one or more actions.
  ACTION: 'action', // action node can have parent of one decision, and children of one or more outcomes.
  OUTCOME: 'outcome', // outcome node can have parent of one action, and children of one decision.
  EXIT: 'exit', // exit is a special outcome node can not have children.
};

export const nodeColors = {
  START: '#4A90E2',    // A cool, professional blue
  DECISION: '#7ED321', // A vibrant yet muted green
  ACTION: '#F5A623',   // A warm, energetic orange
  OUTCOME: '#D0021B',  // A strong, impactful red
  EXIT: '#9B9B9B',     // A neutral, soft gray
};

export const initialTreeData = {
  id: uuidv4(), // Unique identifier for the node
  name: 'Start',
  nodeType: nodeTypes.START,
  probability: 1,
  cost: 0,
  time: 0,
  cumulative_time: 0,
  valid_prob: true,
  expected_cost: 0,
  children: [
  ],
};

export const d3ContainerStyles = {
  width: '100%',
  height: '100vh',
  position: 'relative', // Allows absolute positioning of the legend
};

export const version = '0.1.0';