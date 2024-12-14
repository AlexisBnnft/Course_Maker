import React from 'react';
import Latex from 'react-latex-next';
import 'katex/dist/katex.min.css'; // Import KaTeX CSS

function ContentPreview({ content }) {
  return (
    <div>
      <h4>Node Content Preview</h4>
      <Latex>{content}</Latex>
    </div>
  );
}

export default ContentPreview;
