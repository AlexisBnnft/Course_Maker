import React, { useState, useEffect } from 'react';
import GraphView from './GraphView';
import axios from 'axios';
import './App.css';

// The App component fetches the graph data and passes it to GraphView
function App() {
  const [data, setData] = useState(null);

  const fetchGraph = async () => {
    const res = await axios.get('http://127.0.0.1:5000/api/get_graph');
    setData(res.data);
  };

  useEffect(() => {
    fetchGraph();
  }, []);

  const refresh = () => {
    fetchGraph();
  };

  return (
    <div className="container">
      <h1 className="mt-3" style={{fontSize: 50,textAlign: "center"}}>Course Knowledge Graph Editor</h1>
      <h2 style={{fontSize: 20,textAlign: "center"}}>This tool allows you to add, edit, and remove nodes from our course knowledge graph.</h2>
      <h2 style={{fontSize: 20,textAlign: "center"}}>To get started, simply click on a node:</h2>
      {data ? (
        <GraphView data={data} onRefresh={refresh} />
      ) : (
        <p>Loading graph...</p>
      )}
    </div>
  );
}

export default App;
