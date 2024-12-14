import React, { useState } from 'react';
import axios from 'axios';

function EditNodeModal({ node, onCancel, onSuccess }) {
  const [type, setType] = useState(node.attributes.type);
  const [title, setTitle] = useState(node.name);
  const [content, setContent] = useState(node.attributes.content);
  const [other, setOther] = useState(node.attributes.other);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("EditNodeModal props:", { node, onCancel, onSuccess });
    await axios.put('http://127.0.0.1:5000/api/update_node', {
      nodeId: node.nodeId,
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
        <h4>Edit Node</h4>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Type</label>
            <input className="form-control" value={type} onChange={e => setType(e.target.value)} />
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
          <button type="submit" className="btn btn-primary me-2">Save</button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        </form>
      </div>
    </div>
  );
}

export default EditNodeModal;
