import React, { useState } from 'react';
import axios from 'axios';
import ContentPreview from './ContentPreview';
import { NODE_TYPES } from './config';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:5000/api';
  
function EditNodeModal({ node, onCancel, onSuccess }) {
  const [type, setType] = useState(node.attributes.type);
  const [title, setTitle] = useState(node.name);
  const [content, setContent] = useState(node.attributes.content);
  const [other, setOther] = useState(node.attributes.other);
  const [showPreview, setShowPreview] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("EditNodeModal props:", { node, onCancel, onSuccess });
    await axios.put(`${API_BASE_URL}/update_node`, {
      nodeId: node.nodeId,
      type,
      title,
      content,
      other
    });
    onSuccess(node.nodeId);
  };

  return (
    <div className="card mt-3">
      <div className="card-body">
        <h4>Edit Node</h4>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
              <label htmlFor="node-type">Type</label>
              <select
                id="node-type"
                className="form-control"
                value={type}
                onChange={e => setType(e.target.value)}
              >
                <option value="">Select a type</option>
                {NODE_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          <div className="mb-3">
            <label>Title</label>
            <input className="form-control" value={title} onChange={e => setTitle(e.target.value)} required/>
          </div>
          <div className="mb-3">
            <label>Content</label>
            <input className="form-control" value={content} onChange={e => setContent(e.target.value)} />
          </div>
          <div className="mb-3">
            <label>Other</label>
            <input className="form-control" value={other} onChange={e => setOther(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary adding me-2">Save</button>
          <button type="button" className="btn-primary delete" onClick={onCancel}>Cancel</button>
        </form>
        <button
          type="button"
          className="btn-primary changeparent mt-3"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </button>

        {/* Conditionally render the ContentPreview component */}
        {showPreview && <ContentPreview content={content} />}
      </div>
    </div>
  );
}

export default EditNodeModal;