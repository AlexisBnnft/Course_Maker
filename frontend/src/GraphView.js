import React, { useState } from 'react';
import Tree from 'react-d3-tree';
import axios from 'axios';
import NodeForm from './NodeForm';
import EditNodeModal from './EditNodeModal';

function GraphView({ data, onRefresh }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [parentNodeId, setParentNodeId] = useState(null);

  const [editNode, setEditNode] = useState(null);

  const handleNodeClick = (nodeData) => {
    const nodeId = nodeData.data.nodeId;
    // Show options: Edit or Add child or Delete (if not root)
    setSelectedNode(nodeData.data);
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
          onSuccess={() => { 
            setEditNode(null); 
            onRefresh(); 
          }}
        />
      )}
      {selectedNode && (
        <div className="col-12 mb-3">
          <h3>Selected Node: {selectedNode.name}</h3>
          <p>Type: {selectedNode.attributes.type}</p>
          <p>Content: {selectedNode.attributes.content}</p>
          <p>Other: {selectedNode.attributes.other}</p>
          <button className="btn btn-primary me-2" onClick={handleAddChild}>Add Child</button>
          {selectedNode.attributes.type !== 'root' && 
            <button className="btn btn-danger me-2" onClick={handleDeleteNode}>Delete Node</button>
          }
          <button className="btn btn-secondary" onClick={handleEditNode}>Edit Node</button>
        </div>
      )}
        

    </div>
  );
}

export default GraphView;
