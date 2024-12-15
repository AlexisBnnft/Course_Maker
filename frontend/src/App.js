import React, { useState, useEffect } from 'react';
import GraphView from './GraphView';
import axios from 'axios';
import './App.css';
import OutlineView from './OutlineView'; // Import the new component

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:5000/api';

// The App component fetches the graph data and passes it to GraphView
function App() {
  const [trees, setTrees] = useState([]);
  const [selectedTreeId, setSelectedTreeId] = useState(''); // Initialize to empty string or null
  const [data, setData] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');



  const fetchGraph = async () => {
    const res = await axios.get(`${API_BASE_URL}/get_graph`);
    setData(res.data);
  };

  useEffect(() => {
    const fetchTrees = async () => {
      const res = await axios.get(`${API_BASE_URL}/get_all_trees`);
      setTrees(res.data);
    };
    fetchTrees();
  }, []);

  useEffect(() => {
    if (selectedTreeId) {
      const fetchGraph = async () => {
        const res = await axios.get(`${API_BASE_URL}/get_graph?rootId=${selectedTreeId}`);
        setData(res.data);
      };
      fetchGraph();
    }
  }, [selectedTreeId]);


  const importTree = async (file) => {
    setStatusMessage("Importing...");
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      try {
        const jsonData = JSON.parse(text);
        const res = await axios.post(`${API_BASE_URL}/import_tree`, jsonData);
        if (res.data.success) {
          // Refresh the tree list
          const treesRes = await axios.get(`${API_BASE_URL}/get_all_trees`);
          setTrees(treesRes.data);
          setSelectedTreeId(res.data.rootId); // select the newly imported tree
          setStatusMessage("Import successful!");
        } else {
          setStatusMessage("Import failed: Unexpected response.");
        }
      } catch (err) {
        console.error("Invalid JSON file", err);
        setStatusMessage("Import failed: Invalid JSON.");
      }
    };
    reader.readAsText(file);
  };




  const createNewTree = async () => {
    const title = prompt("Enter a title for the new tree:");
    if (!title) return;
    const res = await axios.post(`${API_BASE_URL}/create_tree`, { title });
    if (res.data.success) {
      // Refresh the list of trees
      const treesRes = await axios.get(`${API_BASE_URL}/get_all_trees`);
      setTrees(treesRes.data);
      setSelectedTreeId(res.data.rootId); // select the newly created tree
    }
  };

  const refreshCurrentTree = async () => {
    if (!selectedTreeId) return;
    const res = await axios.get(`${API_BASE_URL}/get_graph?rootId=${selectedTreeId}`);
    setData(res.data);
  };

  const refresh = () => {
    fetchGraph();
  };

  return (
    <div className="container">
      <h1 className="mt-3" style={{fontSize: 50,textAlign: "center"}}>Course Knowledge Graph Editor</h1>
      <div className="mb-3">
      <label>Select a Tree:</label>
        <select value={selectedTreeId} onChange={(e) => setSelectedTreeId(e.target.value)}>
          <option value="">--Select a tree--</option>
          {trees.map(t => <option key={t.rootId} value={t.rootId}>{t.title}</option>)}
        </select>
        <button className="btn-primary create" onClick={createNewTree}>Create New Tree</button>
        <input
          type="file"
          accept=".json"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              importTree(file);
            }
          }}
        />
        <button className="btn-primary export" onClick={() => {
          // Export current tree
          if (!data) return;
          const jsonString = JSON.stringify(data, null, 2);
          const blob = new Blob([jsonString], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = "exported_tree.json";
          a.click();
          URL.revokeObjectURL(url);
        }}>Export Current Tree</button>

    </div>
      <h2 style={{fontSize: 20,textAlign: "center"}}>This tool allows you to add, edit, and remove nodes from our course knowledge graph.</h2>
      <h2 style={{fontSize: 20,textAlign: "center"}}>To get started, simply click on a node:</h2>
      {selectedTreeId && data && <GraphView data={data} onRefresh={refreshCurrentTree} />}
      {selectedTreeId && data && <OutlineView rootId={selectedTreeId}/>}

      <button onClick={() => {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "exported_tree.json";
        a.click();
        URL.revokeObjectURL(url);
      }}>
        Export Tree
      </button>

    </div>
    
  );
}

export default App;
