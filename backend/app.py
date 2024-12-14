from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId

#MONGO_URI = "mongodb+srv://bonnaf:P6bDpagknUASd7a1@firstcluster.xzp9a.mongodb.net/db?retryWrites=true&w=majority&appName=FirstCluster"
MONGO_URI = "mongodb://127.0.0.1:27017/course"
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://127.0.0.1:3000"}})

client = MongoClient(MONGO_URI)
db = client['db']
nodes_collection = db['nodes']

# Each node structure:
# {
#   _id: ObjectId,
#   parentId: ObjectId or None,
#   type: string,
#   title: string,
#   content: string,
#   other: string
# }

# Initially, let's ensure there is one root node if not present
root_node = nodes_collection.find_one({"parentId": None})
if not root_node:
    # Creates one if not found
    root_id = nodes_collection.insert_one({
        "parentId": None,
        "type": "root",
        "title": "Root Node",
        "content": "This is the root of the knowledge graph",
        "other": ""
    }).inserted_id


def serialize_node(node):
    return {
        "_id": str(node["_id"]),
        "parentId": str(node["parentId"]) if node["parentId"] else None,
        "type": node["type"],
        "title": node["title"],
        "content": node["content"],
        "other": node["other"]
    }

def build_graph(root_id):
    # Recursively build a tree of nodes starting from the given root_id.
    root_node = nodes_collection.find_one({"_id": ObjectId(root_id)})
    if not root_node:
        return None
    
    # For graph visualization libraries like react-d3-tree, a node structure is often:
    # {
    #   name: "title",
    #   attributes: {...},
    #   children: [...]
    # }
    # We can store our node fields as attributes and the title as `name`.
    
    node_serialized = serialize_node(root_node)
    
    children_cursor = nodes_collection.find({"parentId": ObjectId(root_id)})
    children = []
    for child in children_cursor:
        children.append(build_graph(str(child["_id"])))
    
    # Format the node data for the frontend visualization
    node_data = {
        "name": node_serialized["title"],
        "nodeId": node_serialized["_id"],
        "attributes": {
            "type": node_serialized["type"],
            "content": node_serialized["content"],
            "other": node_serialized["other"]
        },
        "children": children if children else []
    }
    return node_data

@app.route("/api/get_graph", methods=["GET"])
def get_graph():
    # Fetch the root node again, just in case
    root = nodes_collection.find_one({"parentId": None})
    if not root:
        return jsonify({"error": "No root node found"}), 404
    graph = build_graph(str(root["_id"]))
    return jsonify(graph), 200

@app.route("/api/add_node", methods=["POST"])
def add_node():
    data = request.get_json()
    parentId = data.get("parentId")
    node_type = data.get("type")
    title = data.get("title")
    content = data.get("content")
    other = data.get("other", "")

    if not parentId or not title:
        return jsonify({"error": "parentId and title are required"}), 400

    # Insert the new node
    new_node_id = nodes_collection.insert_one({
        "parentId": ObjectId(parentId),
        "type": node_type,
        "title": title,
        "content": content,
        "other": other
    }).inserted_id

    return jsonify({"success": True, "nodeId": str(new_node_id)}), 200

@app.route("/api/update_node", methods=["PUT"])
def update_node():
    data = request.get_json()
    node_id = data.get("nodeId")
    if not node_id:
        return jsonify({"error": "nodeId is required"}), 400
    
    updates = {}
    for field in ["type", "title", "content", "other"]:
        if field in data:
            updates[field] = data[field]

    if not updates:
        return jsonify({"error": "No update fields provided"}), 400

    res = nodes_collection.update_one({"_id": ObjectId(node_id)}, {"$set": updates})
    if res.matched_count == 0:
        return jsonify({"error": "No node found"}), 404
    
    return jsonify({"success": True}), 200

@app.route("/api/delete_node", methods=["DELETE"])
def delete_node():
    # We also need to delete children recursively, or disallow deleting a node that has children
    node_id = request.args.get("nodeId")
    if not node_id:
        return jsonify({"error": "nodeId is required"}), 400

    # Check if this is the root node
    node = nodes_collection.find_one({"_id": ObjectId(node_id)})
    if not node:
        return jsonify({"error": "No node found"}), 404
    if node["parentId"] is None:
        return jsonify({"error": "Cannot delete the root node"}), 400

    # Delete all descendants
    def delete_subtree(n_id):
        children = nodes_collection.find({"parentId": ObjectId(n_id)})
        for child in children:
            delete_subtree(str(child["_id"]))
        nodes_collection.delete_one({"_id": ObjectId(n_id)})
    
    delete_subtree(node_id)
    return jsonify({"success": True}), 200


if __name__ == "__main__":
    app.run(debug=True)
