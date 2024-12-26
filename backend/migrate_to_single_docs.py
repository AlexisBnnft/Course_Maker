import os
from dotenv import load_dotenv
from pymongo import MongoClient
from bson import ObjectId

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/db")

client = MongoClient(MONGO_URI)
db = client["db"]
nodes_collection = db["nodes"]
course_graphs = db["course_graphs"]  # new collection for single-doc courses
course_graphs.delete_many({})
print("Cleared course_graphs collection")


def build_graph(node_id):
    """Same logic as in your Flask code.
    Recursively build a tree of nodes starting from node_id.
    Returns a dict structure suitable for storing in graph_data.
    """
    root_node = nodes_collection.find_one({"_id": ObjectId(node_id)})
    if not root_node:
        return None

    # Basic attributes from your current 'serialize_node' + build_graph usage
    if root_node["type"] == "Figure":
        name = root_node["title"]
        node_data = {
            "name": name,
            "nodeId": str(root_node["_id"]),
            "attributes": {
                "type": root_node["type"],
                "content": root_node["content"],
                "caption": root_node.get("caption", ""),
                "other": root_node.get("other", ""),
                "url": root_node.get("url", ""),
                "width": root_node.get("width", 0),
                "alt": root_node.get("alt", ""),
            },
            "children": [],
        }
    else:
        name = root_node["title"]
        node_data = {
            "name": name,
            "nodeId": str(root_node["_id"]),
            "attributes": {
                "type": root_node["type"],
                "content": root_node["content"],
                "other": root_node.get("other", ""),
            },
            "children": [],
        }

    # Get all children
    children_cursor = nodes_collection.find({"parentId": ObjectId(node_id)})
    for child in children_cursor:
        child_tree = build_graph(str(child["_id"]))
        if child_tree:
            node_data["children"].append(child_tree)

    return node_data


def migrate_all_root_nodes():
    """Migrate each tree (root node + its descendants) from `nodes`
    into a single doc in `course_graphs`.
    """
    all_roots = nodes_collection.find({"parentId": None})
    count = 0
    for root in all_roots:
        # Build the entire tree from this root
        entire_tree = build_graph(str(root["_id"]))

        # Insert into course_graphs as a single doc
        # You can store root["title"], root["type"], or any other fields you like
        doc = {
            "type": root["type"],  # e.g. "root"
            "title": root["title"],
            "graph_data": entire_tree,
        }
        course_graphs.insert_one(doc)
        count += 1
        print(f"Migrated root {root['_id']} -> new doc in course_graphs")

    print(f"Migration complete! Migrated {count} root nodes.")


if __name__ == "__main__":
    migrate_all_root_nodes()
