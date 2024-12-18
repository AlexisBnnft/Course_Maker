import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:5000/api';


function OutlineView({ rootId }) {
    const [outlineHTML, setOutlineHTML] = useState('');
  
    useEffect(() => {
      const fetchOutline = async () => {
        if (!rootId) return;
        const res = await axios.get(`${API_BASE_URL}/get_outline?rootId=${rootId}`, { responseType: 'text' });
        setOutlineHTML(res.data);
      };
      fetchOutline();
    }, [rootId]);
  
    return (
      <div className="outline-container">
        <h3>Course Outline</h3>
        <div dangerouslySetInnerHTML={{ __html: outlineHTML }} />
      </div>
    );
  }

export default OutlineView;
