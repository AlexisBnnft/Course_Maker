# Course Knowledge Graph Editor

The Course Knowledge Graph Editor is a web application that enables users to create, edit, and visualize hierarchical course structures in the form of a knowledge graph. This tool is designed to assist educators and content creators in organizing complex course content into a manageable and interactive format.

<img width="1499" alt="Capture d’écran 2024-12-15 à 10 07 51" src="https://github.com/user-attachments/assets/ebd29013-9fce-4021-bbbf-308da0e4f84d" />


---

## Features

- **Interactive Graph Editor**: Add, edit, delete, and reorganize nodes in a graph-based interface.
- **Outline View**: Automatically generate an outline of the course structure.
- **Content Preview**: Render content in a LaTeX-compatible format.
- **Export and Import**: Export the entire graph as JSON or import existing graphs.
- **Multi-level Nodes**: Support for various node types like Definitions, Theorems, Exercises, and more.

---

## Prerequisites

### Backend
- Python 3.x
- MongoDB
- `pip` for Python package management

### Frontend
- Node.js (v16 or higher)
- npm or yarn for JavaScript package management

---

## Installation

### Clone the Repository

```bash
git clone https://github.com/your-repository/course-knowledge-graph-editor.git
cd course-knowledge-graph-editor
```

## Backend Setup

### Create a Virtual Environment:

```
python -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
```

### Install Dependencies:

```
pip install -r requirements.txt
```

### Environment Variables:

Create a `.env` file in the root directory with the following content:

```
MONGO_URI=mongodb://127.0.0.1:27017/course
FRONTEND_URL=http://127.0.0.1:3000
```

### Run the Backend Server:

```
python app.py
```

The backend runs at `http://127.0.0.1:5000` by default.

---

## Frontend Setup

### Navigate to the `frontend` Directory:

```
cd frontend
```

### Install Dependencies:

```
npm install
```

### Environment Variables:

Create a `.env` file in the `frontend` directory with the following content:

```
REACT_APP_API_BASE_URL=http://127.0.0.1:5000/api
```

### Run the Frontend:

```
npm start
```

The frontend runs at `http://127.0.0.1:3000` by default.

---

## Usage

### Access the Application:

Open your browser and navigate to `http://127.0.0.1:3000`.

### Create a New Tree:

Use the "Create New Tree" button to start a new knowledge graph.

### Interact with Nodes:

- Click on a node to edit its details or add child nodes.
    
- Drag nodes to restructure the graph.
    

### Import and Export:

- Use the "Import" option to upload a JSON file of an existing graph.
    
- Use the "Export" button to download the current graph structure.
    

---

## API Endpoints

### Backend APIs

|Method|Endpoint|Description|
|---|---|---|
|`POST`|`/api/add_node`|Add a child node.|
|`PUT`|`/api/update_node`|Update an existing node.|
|`DELETE`|`/api/delete_node`|Delete a node and its children.|
|`GET`|`/api/get_graph`|Retrieve the graph structure.|
|`GET`|`/api/get_outline`|Generate an outline of the graph.|
|`POST`|`/api/import_tree`|Import a graph from JSON.|
|`GET`|`/api/get_all_trees`|Retrieve all root trees.|
|`POST`|`/api/create_tree`|Create a new tree.|

---

## File Structure

### Backend

- `**app.py**`: Flask application with RESTful APIs.
    
- `**.env**`: Configuration file for environment variables.
    

### Frontend

- `**src/App.js**`: Main React application.
    
- `**src/GraphView.js**`: Graph visualization component.
    
- `**src/NodeForm.js**`: Form for adding/editing nodes.
    
- `**src/OutlineView.js**`: Component for generating the outline view.
    
- `**src/config.js**`: Configuration file for node types and colors.
    
- `**src/index.js**`: Entry point for React.
    

---

## Deployment

### Backend

Use a process manager like `gunicorn` or `supervisor` for production deployment. Example using Gunicorn:

```
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Frontend

Build the production-ready React application:

```
npm run build
```

Serve the static files using `nginx` or any static file server.

---

## Contributing

1. Fork the repository.
    
2. Create a feature branch.
    
3. Commit your changes and push them to your fork.
    
4. Submit a pull request.
