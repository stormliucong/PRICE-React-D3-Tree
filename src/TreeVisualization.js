import React, { useState, useEffect, useRef } from 'react';
import Tree from 'react-d3-tree';
import { v4 as uuidv4 } from 'uuid';
import { Alert, Stack, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InputIcon from '@mui/icons-material/Input';
import FigureLegend from './FigureLegend';
import SelectedNodeDetails from './SelectedNodeDetails';
import { nodeTypes, initialTreeData, renderCustomNodeElement } from './appConfig';
 

const TreeVisualization = () => {
  const [treeData, setTreeData] = useState(initialTreeData);
  const [newNode, setNewNode] = useState({});
  const [allowAddNodeType, setAllowAddNodeType] = useState([false, false, false, false]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [showEditNodeDialog, setShowEditNodeDialog] = useState(false);
  const [showAddNodeDialog, setShowAddNodeDialog] = useState(false);
  const [showDeleteNodeDialog, setShowDeleteNodeDialog] = useState(false);
  const [showProbabilityError, setShowProbabilityError] = useState(false);
  const [showCostError, setShowCostError] = useState(false);
  const [showTimeError, setShowTimeError] = useState(false);
  const [showUpdateExpectedCostAlert, setShowUpdateExpectedCostAlert] = useState(false);
  const treeContainerRef = useRef(null);

  useEffect(() => {
    if (treeContainerRef.current) {
      const dimensions = treeContainerRef.current.getBoundingClientRect();
      setTranslate({
        x: dimensions.width / 2,
        y: dimensions.height / 4,
      });
    }
  }, []);

  const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
  });

  const setAllStateDefault = () => {
    setSelectedNode(null);
    setAllowAddNodeType([false, false, false, false]);
    setNewNode({});
    setShowProbabilityError(false);
    setShowCostError(false);
    setShowTimeError(false);
    setShowEditNodeDialog(false);
    setShowAddNodeDialog(false);
    setShowDeleteNodeDialog(false);
    setShowUpdateExpectedCostAlert(false);
  }

  const editNode = () => {
    setShowProbabilityError(false);
    setShowCostError(false);
    setShowTimeError(false);
    let returnDueToError = false;
    // Validate the probability value
    selectedNode.probability = parseFloat(selectedNode.probability);
    // Ensure cost is a number
    selectedNode.cost = parseFloat(selectedNode.cost);
    if (selectedNode.probability < 0 || selectedNode.probability > 1) {
      setShowProbabilityError(true);
      returnDueToError = true;
    }
    // Validate the cost value
    if (selectedNode.cost < 0) {
      setShowCostError(true);
      returnDueToError = true;
    }
    // Validate the time value
    if (selectedNode.time < 0) {
      setShowTimeError(true);
      returnDueToError = true;
    }
    if (returnDueToError) {
      return;
    }
    const updatedTree = { ...treeData };
    console.log('updatedTree:', updatedTree);
    console.log('selectedNode:', selectedNode);
    const { ...nodeDetails } = selectedNode;
    console.log('Edit nodeDetails:', nodeDetails);
    console.log('selectedNode:', selectedNode);
    // Force cost to 0 and probability to 1 for start nodes
    if (nodeDetails.nodeType === nodeTypes.START) {
      nodeDetails.cost = 0;
      nodeDetails.probability = 1;
    }
    // Force probability to 1 for decision nodes
    if (nodeDetails.nodeType === nodeTypes.DECISION) {
      nodeDetails.probability = 1;
    }
    const editNodeRecursive = (node) => {
      if (node.id === selectedNode.id) {
        node.name = nodeDetails.name;
        node.cost = parseFloat(nodeDetails.cost);
        node.probability = nodeDetails.probability;
        node.time = nodeDetails.time;
      } else if (node.children) {
        node.children.forEach(editNodeRecursive);
      }
    };
    editNodeRecursive(updatedTree);
    setTreeData(updatedTree);
    setSelectedNode(null);
    setShowEditNodeDialog(false)
  };

  const addNode = () => {
    setShowProbabilityError(false);
    setShowCostError(false);
    setShowTimeError(false);
    let returnDueToError = false;
    // Validate the probability value
    console.log('newNode:', newNode);
    newNode.probability = parseFloat(newNode.probability);
    // Ensure cost is a number
    newNode.cost = parseFloat(newNode.cost);
    if (newNode.probability < 0 || newNode.probability > 1) {
      setShowProbabilityError(true);
      returnDueToError = true;
    }
    // Validate the cost value
    if (newNode.cost < 0) {
      setShowCostError(true);
      returnDueToError = true;
    }
    // Validate the time value
    if (newNode.time < 0) {
      setShowTimeError(true);
      returnDueToError = true;
    }
    if (returnDueToError) {
      return;
    }
    const updatedTree = { ...treeData };
    console.log('updatedTree:', updatedTree);
    const { ...nodeDetails } = newNode;
    if (newNode.nodeType === nodeTypes.EXIT) {
      nodeDetails.name = 'Exit';
    }
    nodeDetails.name = nodeDetails.name || 'New Node';
    // Force cost to 0 and probability to 1 for start nodes
    if (nodeDetails.nodeType === nodeTypes.START) {
      nodeDetails.cost = 0;
      nodeDetails.probability = 1;
    } else {
      nodeDetails.cost = parseFloat(nodeDetails.cost) || 0;
      // Force probability to 1 for decision nodes
      nodeDetails.probability = nodeDetails.nodeType === nodeTypes.DECISION ? 1 : (nodeDetails.probability || 0);
    }
    // Set default time based on node type
    nodeDetails.time = nodeDetails.time || (() => {
      switch (nodeDetails.nodeType) {
        case nodeTypes.START:
          return 0;
        case nodeTypes.DECISION:
          return 1;
        case nodeTypes.ACTION:
          return 2;
        case nodeTypes.EXIT:
          return 0;
        default:
          return 0;
      }
    })();
    nodeDetails.id = uuidv4();
    nodeDetails.children = []
    console.log('Add nodeDetails:', nodeDetails);
    console.log('selectedNode:', selectedNode);

    // insert node into the selectedNode in the tree
    const addNodeRecursive = (node) => {
      if (node.id === selectedNode.id) {
        node.children.push(nodeDetails);
      } else if (node.children) {
        node.children.forEach(addNodeRecursive);
      }
    };

    addNodeRecursive(updatedTree);
    setTreeData(updatedTree);
    setShowAddNodeDialog(false);
    setSelectedNode(null);
  };

  const deleteNode = () => {
    // Can't delete start node
    if (selectedNode.nodeType === nodeTypes.START) {
      alert('Cannot delete start node');
      return;
    }
    const updatedTree = { ...treeData };

    const deleteNodeRecursive = (node) => {
      if (node.children) {
        node.children = node.children.filter((child) => child.id !== selectedNode.id);
        node.children.forEach(deleteNodeRecursive);
      }
    };

    deleteNodeRecursive(updatedTree);
    setTreeData(updatedTree);
    setSelectedNode(null);
  };

  const handleNodeClick = (nodeDatum) => {
    console.log('Node clicked:', nodeDatum);
    setSelectedNode(nodeDatum);
    setShowCostError(false);
    setShowProbabilityError(false);
    HandleAllowAddNodeType(nodeDatum);
    // re-initialize newNode as empty
    setNewNode({});
  };

  const handleAddNodeChange = (e) => {
    const { name, value } = e.target;
    setNewNode((prevNode) => ({ ...prevNode, [name]: value }));
    setShowCostError(false);
    setShowProbabilityError(false);
  };

  const handleSelectedNodeChange = (e) => {
    const { name, value } = e.target;
    setSelectedNode((prevNode) => ({ ...prevNode, [name]: value }));
    setShowCostError(false);
    setShowProbabilityError(false);
  };

  const allowEdit = (nodeDatum) => {
    return (nodeDatum.nodeType !== nodeTypes.START) && (nodeDatum.nodeType !== nodeTypes.EXIT);
  }

  const allowDelete = (nodeDatum) => {
    return (nodeDatum.nodeType !== nodeTypes.START);
  }

  const allowAdd = (nodeDatum) => {
    
    // if all false return false, o/w return true
    return allowAddNodeType.some((element) => element === true);
  }

  const updateExpectedCost = () => {
    const updatedTree = { ...treeData };
    // calculate expected cost bottom up. 
    // The expected cost of a node is the weighted sum of the expected cost of its children plus the cost of the node.
    // The child probability should be normalized to sum to 1.
    const calculateExpectedCost = (node) => {
      // node.children is an array of children, if not empty, calculate the expected cost
      if (node.children.length > 0) {
        let totalProbability = 0;
        let totalExpectedCost = 0;

        // Calculate the total probability
        node.children.forEach((child) => {
          totalProbability += child.probability;
        });

        // Normalize the probability
        if (totalProbability !== 1) {
          node.children.forEach((child) => {
            if (totalProbability === 0) {
              child.probability = 0;
            }
            else{
              child.probability = child.probability / totalProbability;
            }
          });
          setShowUpdateExpectedCostAlert(true);
        }

        // Calculate the expected cost
        node.children.forEach((child) => {
          calculateExpectedCost(child);
          totalExpectedCost += child.expected_cost * child.probability;
        });

        node.expected_cost = totalExpectedCost + node.cost;
      } else {
        node.expected_cost = node.cost;
      }
    };

    // start from the root node
    calculateExpectedCost(updatedTree);
    setTreeData(updatedTree);
    setSelectedNode(null);
  }

  const HandleAllowAddNodeType = (nodeDatum) => {
    let showAction = false;
    let showOutcome = false;
    let showDecision = false;
    let showExit = false;

    // If parent is a result node, allow action, decision, and exit
    if (nodeDatum.nodeType === nodeTypes.OUTCOME) {
      showAction = true;
      showDecision = true;
      showExit = true;
    }
    // If parent is a start node, only allow decision
    else if (nodeDatum.nodeType === nodeTypes.START) {
      showDecision = true;
    }
    // If parent is a decision node, allow action and exit
    else if (nodeDatum.nodeType === nodeTypes.DECISION) {
      showAction = true;
      showExit = true;
    }
    // If parent is an action node, allow result and decision
    else if (nodeDatum.nodeType === nodeTypes.ACTION) {
      showOutcome = true;
      showDecision = true;
    }
    // If parent is an exit node, don't allow any children
    else if (nodeDatum.nodeType === nodeTypes.EXIT) {
      // No children allowed for exit nodes
    }

    setAllowAddNodeType([showDecision, showAction, showOutcome, showExit]);
  };


  


  return (
    <div className='container'>

      <Dialog open={showAddNodeDialog} onClose={() => { setShowAddNodeDialog(false) }}>
        <DialogTitle>Add a new Node</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter the details of the new node.
          </DialogContentText>
          {selectedNode && 
          <>
          <RadioGroup row aria-label="nodeType" name="nodeType" value={newNode.nodeType} onChange={(e) => { setNewNode({ ...newNode, nodeType: e.target.value }) }}>
            {allowAddNodeType[0] && <FormControlLabel value={nodeTypes.DECISION} control={<Radio />} label="Decision" />}
            {allowAddNodeType[1] && <FormControlLabel value={nodeTypes.ACTION} control={<Radio />} label="Action" />}
            {allowAddNodeType[2] && <FormControlLabel value={nodeTypes.OUTCOME} control={<Radio />} label="Outcome" />}
            {allowAddNodeType[3] && <FormControlLabel value={nodeTypes.EXIT} control={<Radio />} label="Exit" />}
          </RadioGroup>
          </>
          }
          {newNode.nodeType && (
            <>
              <label>
                Node Name:
                <input 
                  type="text" 
                  name="name" 
                  onChange={handleAddNodeChange} 
                  defaultValue={newNode.nodeType === nodeTypes.EXIT ? "Exit" : ""} 
                />
              </label>

              <label>
                Cost:
                <input 
                  type="number" 
                  name="cost" 
                  onChange={handleAddNodeChange} 
                  defaultValue={(() => {
                    if (newNode.nodeType === nodeTypes.OUTCOME) return 0;
                    if (newNode.nodeType === nodeTypes.EXIT) return 0;
                    return 0;
                  })()} 
                  min={0} 
                  disabled={newNode.nodeType === nodeTypes.OUTCOME || newNode.nodeType === nodeTypes.EXIT}
                />
              </label>
              {showCostError && <Alert severity="error">The value of cost must be greater than or equal to 0.</Alert>}

              <label>
                Time (weeks):
                <input 
                  type="number" 
                  name="time" 
                  onChange={handleAddNodeChange} 
                  defaultValue={(() => {
                    switch (newNode.nodeType) {
                      case nodeTypes.START:
                        return 0;
                      case nodeTypes.DECISION:
                        return 1;
                      case nodeTypes.ACTION:
                        return 2;
                      case nodeTypes.EXIT:
                        return 0;
                      default:
                        return 0;
                    }
                  })()} 
                  min={0} 
                  disabled={newNode.nodeType === nodeTypes.EXIT}
                />
              </label>
              {showTimeError && <Alert severity="error">The value of time must be greater than or equal to 0.</Alert>}

              <label>
                Probability:
                <input 
                  type="number" 
                  name="probability" 
                  onChange={handleAddNodeChange} 
                  defaultValue={(() => {
                    if (newNode.nodeType === nodeTypes.DECISION) return 1;
                    if (newNode.nodeType === nodeTypes.EXIT) return 1;
                    return 0;
                  })()} 
                  min={0} 
                  max={1} 
                  step={0.1} 
                  disabled={newNode.nodeType === nodeTypes.DECISION || newNode.nodeType === nodeTypes.EXIT}
                />
              </label>
              {showProbabilityError && <Alert severity="error">The value of probability must be between 0 and 1.</Alert>}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setShowAddNodeDialog(false) }} color="error" variant="contained">Cancel</Button>
          {/* disable button when newNode is empty */}
          <Button onClick={() => { addNode() }} color="primary" autoFocus variant="contained" disabled={Object.keys(newNode).length === 0}>Add Node</Button>

        </DialogActions>
      </Dialog>

      <Dialog open={showDeleteNodeDialog} onClose={() => { setShowDeleteNodeDialog(false) }}>
        <DialogTitle>Delete Node</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the selected node?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setShowDeleteNodeDialog(false) }} color="error" variant="contained" autoFocus>Cancel</Button>
          <Button onClick={() => { deleteNode(); setShowDeleteNodeDialog(false) }} color="primary" variant="contained">Delete Node</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showEditNodeDialog} onClose={() => { setShowEditNodeDialog(false) }}>
        <DialogTitle>Edit Node</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter the details of the selected node.
          </DialogContentText>
          {/* if selectedNode is not null */}
          {selectedNode && <>
            <label> Node Type: <input type="text" name="nodeType" value={selectedNode.nodeType} disabled /></label>
            <label> Name: <input type="text" name="name" value={selectedNode.name} onChange={handleSelectedNodeChange} /></label>
            <label>
              Cost:
              <input 
                type="number" 
                name="cost" 
                value={selectedNode.cost} 
                onChange={handleSelectedNodeChange} 
                min={0} 
                disabled={selectedNode.nodeType === nodeTypes.OUTCOME}
              />
            </label>
            {showCostError && <Alert severity="error">The value of cost must be greater than or equal to 0.</Alert>}
            <label>
              Time (weeks):
              <input 
                type="number" 
                name="time" 
                value={selectedNode.time} 
                onChange={handleSelectedNodeChange} 
                min={0} 
              />
            </label>
            {showTimeError && <Alert severity="error">The value of time must be greater than or equal to 0.</Alert>}
            <label>
              Probability:
              <input 
                type="number" 
                name="probability" 
                value={selectedNode.probability} 
                onChange={handleSelectedNodeChange} 
                min={0} 
                max={1} 
                step={0.1} 
                disabled={selectedNode.nodeType === nodeTypes.DECISION}
              />
            </label>
            {showProbabilityError && <Alert severity="error">The value of probability must be between 0 and 1.</Alert>}
          </>
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setShowEditNodeDialog(false) }} color="error" variant="contained">Cancel</Button>
          <Button onClick={() => { editNode() }} color="primary" autoFocus variant="contained">Edit Node</Button>
        </DialogActions>
      </Dialog>
        
        
      
      <div className='modal-panel'>

      
        <Stack spacing={2} direction="column">
          {/* A button with download icon to download treeData as a json file */}
          

          {/* Load demo_tree.json */}
          <Button onClick={() => {
            try {
              setAllStateDefault();
              setTreeData(require('./demo_tree.json'));
            }
            catch (error) {
              alert('Error loading demo tree');
            } 
          }} 
          variant="contained" 
          color="primary"
          startIcon={<InputIcon />}>Load an Expert-Alone Tree</Button>

          {/* Load demo_tree_2.json */}
          <Button onClick={() => {
            try {
              setAllStateDefault();
              setTreeData(require('./demo_tree_2.json'));
            }
            catch (error) {
              alert('Error loading demo tree');
            } 
          }} 
          variant="contained" 
          color="primary"
          startIcon={<InputIcon />}>Load an AI-Delegate Tree</Button>

          <Button onClick={() => {
            const element = document.createElement("a");
            const file = new Blob([JSON.stringify(treeData)], { type: 'text/plain' });
            element.href = URL.createObjectURL(file);
            element.download = "decision_tree.json";
            document.body.appendChild(element); // Required for this to work in FireFox
            element.click();
          }} 
          variant="contained" 
          color="primary"
          startIcon={<CloudDownloadIcon />}>Download Tree</Button>

        {/* A material ui style button to with upload icon to upload json file to setTreeData */}
        <Button
          component="label"
          role={undefined}
          variant="outlined"
          tabIndex={-1}
          startIcon={<CloudUploadIcon />}
        >
          Upload files
          <VisuallyHiddenInput
            type="file"
            onChange={(event) => {
              const file = event.target.files[0];
              const reader = new FileReader();
              reader.onload = (e) => {
                const contents = e.target.result;
                try { 
                  setAllStateDefault();
                  setTreeData(JSON.parse(contents));  
                } catch (error) {
                  alert('Invalid file format');
                }
              };
              reader.readAsText(file);
            }
            }
          /></Button>

        {/* Reset tree to start node only */}
        <Button onClick={() => {
          setAllStateDefault();
          setTreeData(initialTreeData);
        }} variant="contained" color="error">Reset Tree</Button>
    
        {/* warning banner to indicate the probability of the children of a node should sum to 1 */}
        {showUpdateExpectedCostAlert && <Alert severity="warning" onClose={() => { setShowUpdateExpectedCostAlert(false) }}> The probability of the children of a node should sum to 1. The probabilities have been normalized.</Alert>}
        {/* infomation banner to show current expected cost at root node , if it is not null */}
        {treeData.expected_cost !== null && <Alert severity="info">The expected cost of the tree is {parseInt(treeData.expected_cost)}</Alert>}
        {/* warning banner to indicate current expected cost is not available if it is null */}
        {treeData.expected_cost === null && <Alert severity="warning">The expected cost is not available. </Alert>}
        <Alert> Please click update expected cost button for START node.</Alert>

        {selectedNode && (
          <>
                  <SelectedNodeDetails selectedNode={selectedNode} />


            {/* provide a nice layout of three buttons */}

              
              {allowAdd(selectedNode) && <Button onClick={() => { setShowCostError(false); setShowProbabilityError(false); setShowAddNodeDialog(true) }} color='secondary' variant="contained">Add Node</Button>}
              {allowDelete(selectedNode) && <Button onClick={() => { setShowCostError(false); setShowProbabilityError(false); setShowDeleteNodeDialog(true) }} color="error" variant="contained">Delete Node</Button>}
              {allowEdit(selectedNode) && <Button onClick={() => { setShowCostError(false); setShowProbabilityError(false); setShowEditNodeDialog(true) }} color="success" variant="contained">Edit Node</Button>}
              <Button onClick={updateExpectedCost} color="primary" variant="contained">Update Expected Cost</Button>
            
          </>
         
        )
        }
        </Stack>

        
      
      </div>
      
      <div className="tree-panel" ref={treeContainerRef}>
      <div className='tree-stats-container'>
        <FigureLegend />
      </div>
        <Tree data={treeData} collapsible={false} translate={translate} onNodeClick={handleNodeClick} orientation={"vertical"} renderCustomNodeElement={(rd3tProps) => renderCustomNodeElement({ ...rd3tProps, toggleNode: handleNodeClick })} />
      
      </div>
      
      

    </div>
  );
};

export default TreeVisualization;
