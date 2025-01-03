from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv
import os


load_dotenv()  # This will load variables from the .env file if present

MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/db")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://127.0.0.1:3000")

print("MONGO_URI:", MONGO_URI)
print("FRONTEND_URL:", FRONTEND_URL)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": FRONTEND_URL}})

client = MongoClient(MONGO_URI)
db = client["db"]
nodes_collection = db["nodes"]

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
    root_id = nodes_collection.insert_one(
        {
            "parentId": None,
            "type": "root",
            "title": "Root Node",
            "content": "This is the root of the knowledge graph",
            "other": "",
        }
    ).inserted_id


def serialize_node(node):
    try:
        return {
            "_id": str(node["_id"]),
            "parentId": str(node["parentId"]) if node["parentId"] else None,
            "type": node["type"],
            "title": node["title"],
            "content": node["content"],
            "other": node["other"],
        }
    except Exception as e:
        return {
            "_id": str(node["_id"]),
            "parentId": str(node["parentId"]) if node["parentId"] else None,
            "type": node["type"],
            "title": node["title"],
            "url": node["url"],
            "caption": node["caption"],
            "content": node.get("content", ""),
            "width": node["width"],
            "alt": node["alt"],
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
    try:
        node_data = {
            "name": node_serialized["title"],
            "nodeId": node_serialized["_id"],
            "attributes": {
                "type": node_serialized["type"],
                "content": node_serialized["content"],
                "other": node_serialized["other"],
            },
            "children": children if children else [],
        }
    except Exception as e:
        node_data = {
            "name": node_serialized["title"],
            "nodeId": node_serialized["_id"],
            "attributes": {
                "type": node_serialized["type"],
                "url": node_serialized["url"],
                "content": node_serialized["url"],
                "caption": node_serialized["caption"],
                "width": node_serialized["width"],
                "alt": node_serialized["alt"],
            },
            "children": children if children else [],
        }
    return node_data


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
    new_node_id = nodes_collection.insert_one(
        {
            "parentId": ObjectId(parentId),
            "type": node_type,
            "title": title,
            "content": content,
            "other": other,
        }
    ).inserted_id

    return jsonify({"success": True, "nodeId": str(new_node_id)}), 200


@app.route("/api/update_node", methods=["PUT"])
def update_node():
    data = request.get_json()
    node_id = data.get("nodeId")
    if not node_id:
        return jsonify({"error": "nodeId is required"}), 400

    updates = {}
    if data["type"] == "Figure":
        for field in ["type", "title", "content", "other"]:
            if field in data:
                if field == "content":
                    updates["url"] = data[field]
                    updates["content"] = data[field]
                else:
                    updates[field] = data[field]
    else:
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


@app.route("/api/update_node_parent", methods=["PUT"])
def update_node_parent():
    data = request.get_json()
    node_id = data.get("nodeId")
    new_parent_id = data.get("newParentId")

    if not node_id or not new_parent_id:
        return jsonify({"error": "nodeId and newParentId are required"}), 400

    # Vérifier que le nouveau parent existe
    new_parent = nodes_collection.find_one({"_id": ObjectId(new_parent_id)})
    if not new_parent:
        return jsonify({"error": "New parent not found"}), 404

    # Mettre à jour le parent
    res = nodes_collection.update_one(
        {"_id": ObjectId(node_id)}, {"$set": {"parentId": ObjectId(new_parent_id)}}
    )
    if res.matched_count == 0:
        return jsonify({"error": "Node not found"}), 404

    return jsonify({"success": True}), 200


def generate_outline_html(node):
    # node: dict with keys: name, attributes, children
    # Start with a list item for this node
    html = f"<li><strong>{node['name']}</strong>"
    # If you want to show some attributes inline, you can:
    # html += f" - {node['attributes'].get('content', '')}"

    # If there are children, recursively render them
    if node.get("children"):
        # Sort children if needed
        # children = sorted(node['children'], key=lambda c: c['attributes'].get('order', 0))
        children = node["children"]
        html += "<ul>"
        for child in children:
            html += generate_outline_html(child)
        html += "</ul>"

    html += "</li>"
    return html


@app.route("/api/get_outline", methods=["GET"])
def get_outline():
    root_id = request.args.get("rootId", None)
    if not root_id:
        return "rootId is required", 400

    root = nodes_collection.find_one({"_id": ObjectId(root_id), "parentId": None})
    if not root:
        return "No root node found", 404
    graph = build_graph(str(root["_id"]))
    outline_html = "<ul>" + generate_outline_html(graph) + "</ul>"
    return outline_html, 200, {"Content-Type": "text/html"}


@app.route("/api/get_all_trees", methods=["GET"])
def get_all_trees():
    # Tous les noeuds avec parentId: None sont des racines (donc des arbres)
    roots = nodes_collection.find({"parentId": None})
    tree_list = []
    for root in roots:
        tree_list.append({"rootId": str(root["_id"]), "title": root["title"]})
    return jsonify(tree_list), 200


@app.route("/api/create_tree", methods=["POST"])
def create_tree():
    data = request.get_json()
    title = data.get("title")
    if not title:
        return jsonify({"error": "title is required"}), 400
    # Créer un nœud racine
    new_root_id = nodes_collection.insert_one(
        {
            "parentId": None,
            "type": "root",
            "title": title,
            "content": "Root content",
            "other": "",
        }
    ).inserted_id
    return jsonify({"success": True, "rootId": str(new_root_id)}), 200


@app.route("/api/get_graph", methods=["GET"])
def get_graph():
    root_id = request.args.get("rootId", None)
    if not root_id:
        return jsonify({"error": "rootId is required"}), 400

    root = nodes_collection.find_one({"_id": ObjectId(root_id), "parentId": None})
    if not root:
        return jsonify({"error": "No root node found with given rootId"}), 404

    graph = build_graph(str(root["_id"]))
    return jsonify(graph), 200


@app.route("/api/import_tree", methods=["POST"])
def import_tree():
    tree_data = request.get_json()
    if not tree_data:
        return jsonify({"error": "No tree data provided"}), 400

    # tree_data structure is same as the one returned by build_graph:
    # {
    #   "name": "Root Node",
    #   "nodeId": "...",
    #   "attributes": { "type": "...", "content": "...", "other": "..." },
    #   "children": [...]
    # }

    # Insert nodes recursively
    def insert_node(node, parent_id=None):
        # Insert this node in db
        try:
            new_id = nodes_collection.insert_one(
                {
                    "parentId": ObjectId(parent_id) if parent_id else None,
                    "type": node["attributes"]["type"],
                    "title": node["name"],
                    "content": node["attributes"]["content"],
                    "other": node["attributes"]["other"],
                }
            ).inserted_id
        except Exception as e:
            new_id = nodes_collection.insert_one(
                {
                    "parentId": ObjectId(parent_id) if parent_id else None,
                    "type": node["attributes"]["type"],
                    "title": node["name"],
                    "url": node["attributes"]["url"],
                    "content": node["attributes"]["url"],
                    "caption": node["attributes"]["caption"],
                    "width": node["attributes"]["width"],
                    "alt": node["attributes"]["alt"],
                }
            ).inserted_id

        # Insert children
        for child in node.get("children", []):
            insert_node(child, new_id)

        return new_id

    new_root_id = insert_node(tree_data, None)
    return jsonify({"success": True, "rootId": str(new_root_id)}), 200


@app.route("/api/delete_tree", methods=["DELETE"])
def delete_tree():
    root_id = request.args.get("rootId")
    if not root_id:
        return jsonify({"error": "rootId is required"}), 400

    root_node = nodes_collection.find_one({"_id": ObjectId(root_id), "parentId": None})
    if not root_node:
        return jsonify({"error": "Root node not found"}), 404

    # Recursively delete the tree
    def delete_subtree(node_id):
        children = nodes_collection.find({"parentId": ObjectId(node_id)})
        for child in children:
            delete_subtree(str(child["_id"]))
        nodes_collection.delete_one({"_id": ObjectId(node_id)})

    delete_subtree(root_id)

    return jsonify({"success": True}), 200


if __name__ == "__main__":
    app.run(debug=True)
