import React, { useState } from 'react';
import axios from 'axios';
import { NODE_TYPES } from './config';


function NodeForm({ parentId, onCancel, onSuccess }) {
  const [type, setType] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [other, setOther] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("NodeForm handleSubmit triggered with:", { parentId, title, content, other });
    await axios.post('http://127.0.0.1:5000/api/add_node', {
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
          <button
            type="button"
            className="btn btn-info me-2"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
          <div className="mb-3">
            <label htmlFor="node-other">Other</label>
            <input
              id="node-other"
              className="form-control"
              value={other}
              onChange={e => setOther(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-success me-2">Add Node</button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        </form>
      </div>
    </div>
  );
}

export default NodeForm;
