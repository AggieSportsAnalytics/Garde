import requests
from requests.auth import HTTPDigestAuth
import os
import time
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

api_public_key = os.getenv("MONGODB_ATLAS_PUBLIC_KEY")
api_private_key = os.getenv("MONGODB_ATLAS_PRIVATE_KEY")

username = os.getenv("USERNAME")
password = os.getenv("PASSWORD")
cluster_name = os.getenv("CLUSTER")
project_name = os.getenv("PROJECT")
org_id = os.getenv("ORG_ID")
project_id = os.getenv("PROJECT_ID")
database_name = os.getenv("NAME")


collections = [
    "garde_user_angles",
    "coach",
    "fencer",
    "fencer_instructions",
    "garde_ideal_angles",
    "videos"
]

# MongoDB Atlas API base URL
base_url = "https://cloud.mongodb.com/api/atlas/v1.0"

def is_cluster_ready(project_id):
    url = f"{base_url}/groups/{project_id}/clusters/{cluster_name}"
    response = requests.get(url, auth=HTTPDigestAuth(api_public_key, api_private_key))

    if response.status_code == 200:
        cluster_info = response.json()
        return cluster_info['stateName'] == 'IDLE'
    else:
        print(f"Error checking cluster status: {response.status_code}")
        print(response.json())
        return False

def get_connection_string(project_id):
    url = f"{base_url}/groups/{project_id}/clusters/{cluster_name}"
    response = requests.get(url, auth=HTTPDigestAuth(api_public_key, api_private_key))

    if response.status_code == 200:
        cluster_info = response.json()
        standard_srv = cluster_info["connectionStrings"]["standardSrv"]
        modified = standard_srv.split("//")
        username_password = f"garde_user:NaturalBeautyLLM*&(@"
        options = "/?retryWrites=true&w=majority&appName=Garde-Cluster"
        
        beginning = modified[0] + "//"
        username_password += modified[1]
        username_password += options
        beginning += username_password
                
        return beginning
    else:
        print(f"Error fetching connection string: {response.status_code}")
        print(response.json())
        return None

def create_database_and_collections(connection_string):
    client = MongoClient(connection_string)
    db = client[database_name]

    for collection_name in collections:
        db.create_collection(collection_name)
        print(f"Collection '{collection_name}' created in database '{database_name}'.")

# Adding a comment in here so it gets refreshed
def main():
    print("Waiting for cluster to be ready...")
    while not is_cluster_ready(project_id):
        time.sleep(30)  # Wait 30 seconds before checking again

    # Step 1: Get the connection string once the cluster is ready
    connection_string = get_connection_string(project_id)
    
    if connection_string:
        print(f"Connection string fetched: {connection_string}")

        # Step 2: Use pymongo to create the database and collections
        create_database_and_collections(connection_string)
    else:
        print("Failed to fetch connection string.")

if __name__ == "__main__":
    main()
