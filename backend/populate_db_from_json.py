import json
import os
import argparse
from dotenv import load_dotenv
from pymongo import MongoClient


def load_json_data(file_path):
    """Load and parse the JSON file"""
    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)


def insert_course_data(data, chapter_name, database_name):
    """Insert the course data into MongoDB"""
    # Load environment variables
    load_dotenv()

    # Connect to MongoDB
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/db")
    client = MongoClient(MONGO_URI)
    db = client[database_name]
    course_graphs = db["course_graphs"]

    print(f"Inserting into database: {database_name}")
    print(f"Using MongoDB URI: {MONGO_URI}")

    # Create the document
    doc = {"type": "Chapter", "title": chapter_name, "graph_data": data}

    # Insert into course_graphs
    result = course_graphs.insert_one(doc)
    return result.inserted_id


def main():
    # Set up argument parser
    parser = argparse.ArgumentParser(
        description="Populate MongoDB with course data from JSON"
    )
    parser.add_argument("--name", required=True, help="Name of the chapter")
    parser.add_argument(
        "--database", "-db", default="db", help="Name of the database (default: db)"
    )
    args = parser.parse_args()

    # Construct the path to courseData.json (assuming it's in the same directory)
    current_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(current_dir, "data/courseData.json")

    try:
        # Load the JSON data
        data = load_json_data(json_path)

        # Insert into MongoDB
        inserted_id = insert_course_data(data, args.name, args.database)
        print(f"Successfully inserted chapter '{args.name}' with ID: {inserted_id}")

    except FileNotFoundError:
        print(f"Error: Could not find courseData.json in {current_dir}")
    except json.JSONDecodeError:
        print("Error: Invalid JSON format in courseData.json")
    except Exception as e:
        print(f"Error: {str(e)}")


if __name__ == "__main__":
    main()
