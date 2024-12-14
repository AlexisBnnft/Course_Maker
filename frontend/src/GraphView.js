import React, { useState, useEffect } from 'react';
import Tree from 'react-d3-tree';
import axios from 'axios';
import NodeForm from './NodeForm';
import EditNodeModal from './EditNodeModal';
import { NODE_TYPES_COLORS } from './config';
import { DISPLAYED_NODE_FIELDS } from './config';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css'; // Import KaTeX CSS
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:5000/api';

function GraphView({ data, onRefresh }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [parentNodeId, setParentNodeId] = useState(null);
  const [isSelectingNewParent, setIsSelectingNewParent] = useState(false);
  const [nodeToReparent, setNodeToReparent] = useState(null);
  const [editNode, setEditNode] = useState(null);
  const [reselectNodeId, setReselectNodeId] = useState(null);

    // Quand on clique sur un nœud
    const handleNodeClick = (nodeData) => {
        const nodeId = nodeData.data.nodeId;
        if (isSelectingNewParent && nodeToReparent) {
        // On est en phase de sélection du nouveau parent
        axios.put('${API_BASE_URL}/update_node_parent', {
            nodeId: nodeToReparent.nodeId,
            newParentId: nodeId
        }).then(() => {
            setIsSelectingNewParent(false);
            setNodeToReparent(null);
            onRefresh();
        });
        } else {
        // Sinon, sélection normale de nœud
        setSelectedNode(nodeData.data);
        if (!nodeToReparent) setNodeToReparent(nodeData.data); // Le nœud qu'on veut reparent
        }
    };
  const handleAddChild = () => {
    console.log("Add Child button clicked");    
    if (!selectedNode) return;   
    setParentNodeId(selectedNode.nodeId);
    setShowAddForm(true);
  };

  const handleDeleteNode = async () => {
    if (!selectedNode || !selectedNode.nodeId) return;
    const nodeId = selectedNode.nodeId;
    const confirmDelete = window.confirm("Are you sure you want to delete this node and its children?");
    if (confirmDelete) {
      await axios.delete(`http://127.0.0.1:5000/api/delete_node?nodeId=${nodeId}`);
      onRefresh();
    }
  };

  const renderCustomNode = ({ nodeDatum }) => {
    const displayedFields = DISPLAYED_NODE_FIELDS
      .map(field => nodeDatum.attributes && nodeDatum.attributes[field] ? nodeDatum.attributes[field] : null)
      .filter(Boolean);
  

    const fillColor = NODE_TYPES_COLORS[nodeDatum.attributes.type];

    // Check if this node is the selected one
    const isSelected = selectedNode && selectedNode.nodeId === nodeDatum.nodeId;
    
    // Apply a different style if selected
    const circleStyle = isSelected 
      ? { fill: fillColor, stroke: 'black', strokeWidth: 8 } 
      : { fill: fillColor, stroke: 'black', strokeWidth: 1 };
    

    // Add an onClick handler here:
    return (
      <g onClick={() => handleNodeClick({ data: nodeDatum })}>
        <circle r={15} {...circleStyle}></circle>
        <text fill="black" strokeWidth="1" x="-20" dy="2em">
          {nodeDatum.name}
        </text>
        {displayedFields.map((fieldValue, i) => (
          <text key={i} fill="black" x="20" dy={`${-1.35 + i*1.2}em`}>
            {fieldValue}
          </text>
        ))}
      </g>
    );
  };
  
    
    useEffect(() => {
        // If we have a node to reselect and fresh data, find it and update selectedNode
        if (reselectNodeId && data) {
        const updatedNode = findNodeById(data, reselectNodeId);
        if (updatedNode) {
            setSelectedNode(updatedNode.data);
        }
        setReselectNodeId(null);
        }
    }, [data, reselectNodeId]);

    function findNodeById(node, nodeIdToFind) {
        if (node.nodeId === nodeIdToFind) return node;
        if (node.children) {
        for (const child of node.children) {
            const found = findNodeById(child, nodeIdToFind);
            if (found) return found;
        }
        }
        return null;
    }

  const handleEditNode = () => {
    if (!selectedNode) return;
    setEditNode(selectedNode);
  };

  return (
    <div className="row row-cols-2 row-cols-md-2">
      <div className="col-12" style={{ height: '500px', color: "white", width : "630px", border: '1px solid #ccc', marginBottom: '20px', marginLeft: '-20px', marginRight: '20px' }}>
        <Tree 
          data={data} 
          orientation="horizontal"
          translate={{ x: 100, y: 200 }}
          onNodeClick={handleNodeClick}
          renderCustomNodeElement={(rd3tProps) => renderCustomNode(rd3tProps)}
          />
      </div>
      {showAddForm && (
        console.log("Rendering NodeForm"),
        <NodeForm 
          parentId={parentNodeId} 
          onCancel={() => setShowAddForm(false)} 
          onSuccess={() => { 
            setShowAddForm(false); 
            onRefresh(); 
          }}
        />
        )}
              
        {editNode && (
        <EditNodeModal
            node={editNode}
            onCancel={() => setEditNode(null)}
            onSuccess={(editedNodeId) => {
            setEditNode(null); 
            setReselectNodeId(editedNodeId); // set the node ID to reselect
            onRefresh(); 
            }}
        />
        )}

      {selectedNode && (
        <div className="col-12 mb-3">
            <h3>Selected Node: {selectedNode.name}</h3>
            <p>Type: {selectedNode.attributes.type}</p>
            <p>Content: <Latex>{selectedNode.attributes.content}</Latex></p>
            <p>Other: {selectedNode.attributes.other}</p>
            <button className="btn-primary adding me-2" onClick={handleAddChild}>Add Child</button>
            {selectedNode.attributes.type !== 'root' && 
            <button className="btn-primary delete me-2" onClick={handleDeleteNode}>Delete Node</button>
            }
            <button className="btn-primary edit me-2" onClick={handleEditNode}>Edit Node</button>
            <button className="btn-primary changeparent" onClick={() => setIsSelectingNewParent(true)}>Change Parent</button>
        </div>
        )}

    </div>
  );
}

export default GraphView;
