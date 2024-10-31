import React, { useState, useEffect, useRef } from 'react';
import Tree from 'react-d3-tree';
import { v4 as uuidv4 } from 'uuid';
import { Alert, Stack, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
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

  const editNode = () => {
    setShowProbabilityError(false);
    setShowCostError(false);
    let returnDueToError = false;
    selectedNode.probability = parseFloat(selectedNode.probability);
    selectedNode.cost = parseFloat(selectedNode.cost);
    // Validate the probability value
    if (selectedNode.probability <= 0 || selectedNode.probability > 1) {
      setShowProbabilityError(true);
      returnDueToError = true;
    }
    // Validate the cost value
    if (selectedNode.cost < 0) {
      setShowCostError(true);
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
    const editNodeRecursive = (node) => {
      if (node.id === selectedNode.id) {
        node.name = nodeDetails.name;
        node.cost = nodeDetails.cost;
        node.probability = nodeDetails.probability;
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
    let returnDueToError = false;
    // Validate the probability value
    console.log('newNode:', newNode);
    newNode.probability = parseFloat(newNode.probability);
    if (newNode.probability <= 0 || newNode.probability > 1) {
      setShowProbabilityError(true);
      returnDueToError = true;
    }
    // Validate the cost value
    if (newNode.cost < 0) {
      setShowCostError(true);
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
    nodeDetails.cost = nodeDetails.cost || 0;
    nodeDetails.probability = nodeDetails.probability || 0;
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
            child.probability = child.probability / totalProbability;
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
    let showAction = false
    let showOutcome = false
    let showDecision = false
    let showExit = false
    // if node type is decision and if there is already a child attached, only same type of node are allowed, otherwise allow action and exit
    if (nodeDatum.nodeType === nodeTypes.DECISION){
      if (nodeDatum.children.length > 0) {
        if (nodeDatum.children[0].nodeType === nodeTypes.DECISION) {
          showDecision = true;
        } else if (nodeDatum.children[0].nodeType === nodeTypes.ACTION) {
          showAction = true;
          showExit = true;
        } else if (nodeDatum.children[0].nodeType === nodeTypes.OUTCOME) {
          showOutcome = true;
        } else if (nodeDatum.children[0].nodeType === nodeTypes.EXIT) {
          showAction = true;
        }
      } else {
        showAction = true;
        showExit = true;
      }
    }
    // if node type is action, and if there is already a child outcome attached, only outcome is allowed, otherwise allow decision, exit and action
    if (nodeDatum.nodeType === nodeTypes.ACTION) {
      if (nodeDatum.children.length > 0) {
        if (nodeDatum.children[0].nodeType === nodeTypes.OUTCOME) {
          showOutcome = true;
        }
      } else {
        showDecision = true;
        showExit = true;
        showAction = true;
        showOutcome = true;
      }
    }

    // if node type is outcome or start, and if there is already a child attached, not allowed for adding new nodes, otherwise, allow decision, action and exit.
    if (nodeDatum.nodeType === nodeTypes.OUTCOME || nodeDatum.nodeType === nodeTypes.START) {
      if (nodeDatum.children.length === 0) {
        showDecision = true;
        showAction = true;
        showExit = true;
      }
    }

    // if node type is exit, not allow to adding new nodes

    // if none are true, allowAdd is false, otherwise, allowAdd is true

    setAllowAddNodeType([showDecision, showAction, showOutcome, showExit])
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
          {(newNode.nodeType === nodeTypes.EXIT) && (
            <Alert severity="info">
              Add an exit node
            </Alert>
          )}
          {(newNode.nodeType === nodeTypes.DECISION) && (
            <label>
              Decision Point:
              <input type="text" name="name" onChange={(handleAddNodeChange)} />
            </label>
          )}
          {((newNode.nodeType === nodeTypes.ACTION) || (newNode.nodeType === nodeTypes.OUTCOME)) && (
            <>
              <label>
                {newNode.nodeType === nodeTypes.ACTION ? "Action Name" : "Outcome Name"}
                <input type="text" name="name" onChange={handleAddNodeChange} defaultValue={newNode.name} />
              </label>

              {newNode.nodeType === nodeTypes.ACTION && (
                <>
                  <label>Cost:<input type="number" name="cost" onChange={handleAddNodeChange} defaultValue={newNode.cost} min={0} /></label>
                  {showCostError && <Alert severity="error" > The value of cost must be greater than or equal to 0.</Alert>}
                </>
              )}

              <label>Probability:<input type="number" name="probability" onChange={handleAddNodeChange} defaultValue={newNode.probability} min={0.01} max={1} step={0.1} /></label>
              {showProbabilityError && <Alert severity="error" > The value of probability must be between 0 and 1.</Alert>}
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
            {/* Default cost is 0 */}
            <label>Cost:<input type="number" name="cost" value={selectedNode.cost} onChange={handleSelectedNodeChange} defaultValue={0} min={0} /></label>
            {showCostError && <Alert severity="error" > The value of cost must be greater than or equal to 0.</Alert>}
            {/* Default probability is 1 */}
            <label>Probability:<input type="number" name="probability" value={selectedNode.probability} onChange={handleSelectedNodeChange} defaultValue={1} min={0.01} max={1} step={0.1} /></label>
            {showProbabilityError && <Alert severity="error" > The value of probability must be between 0 and 1.</Alert>}
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
          startIcon={<CloudDownloadIcon />}>Download Tree
          </Button>
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
                setTreeData(JSON.parse(contents));
              };
              reader.readAsText(file);
            }
            }
          />
        </Button>
    
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
