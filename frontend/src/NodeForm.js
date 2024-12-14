import React, { useState } from 'react';
import axios from 'axios';
import { NODE_TYPES } from './config';
import ContentPreview from './ContentPreview';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:5000/api';


function NodeForm({ parentId, onCancel, onSuccess }) {
  const [type, setType] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [other, setOther] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("NodeForm handleSubmit triggered with:", { parentId, title, content, other });
    await axios.post(`${API_BASE_URL}/add_node`, {
      parentId,
      type,
      title,
      content,
      other
    });
    onSuccess();
  };

  return (
    <div className="card mt-3">
      <div className="card-body">
        <h4>Add Child Node</h4>
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
            <label htmlFor="node-title">Title (required)</label>
            <input
              id="node-title"
              className="form-control"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="node-content">Content</label>
            <input
              id="node-content"
              className="form-control"
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="node-other">Other</label>
            <input
              id="node-other"
              className="form-control"
              value={other}
              onChange={e => setOther(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary adding me-2">Add Node</button>
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

export default NodeForm;