import subprocess
from subprocess import CompletedProcess
import argparse
from argparse import Namespace

compat_string: str = """name = "garde"
main = "src/index.js"
compatibility_date = "2023-08-23"


[[r2_buckets]]
binding = "BUCKET"
bucket_name = "garde-fencing-videos"


"""

program_name: str = """
automate_setup.py
"""
program_usage: str = """
automate_setup.py [options] --destroy --db DB_NAME
"""
program_description: str = """description:
This is a python script to automate setup/destroy of D1 DB in Cloudflare
"""
program_epilog: str = """ 

"""
program_version: str = """
Version 1.0.0 2024-09-12
Created by Vikram Penumarti
"""

# SQL commands to create the tables
create_fencers_table = """
CREATE TABLE IF NOT EXISTS fencer (
    unique_id TEXT PRIMARY KEY, 
    name TEXT NOT NULL,                   
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    average_time_advance REAL DEFAULT 0,   
    average_time_retreat REAL DEFAULT 0,   
    average_time_lunge REAL DEFAULT 0,     
    average_time_enGuard REAL DEFAULT 0,   
    cumulative_accuracy REAL DEFAULT 0
);
"""

# consider changing session_id to uuid specified on client/server side rather than autoincrement
create_fencer_sessions_table = """
CREATE TABLE IF NOT EXISTS fencer_sessions (
    session_id INTEGER PRIMARY KEY AUTOINCREMENT, 
    fencer_id TEXT,                                
    speed REAL,                                    
    left_elbow REAL,                               
    right_elbow REAL,                              
    left_hip REAL,                                 
    right_hip REAL,                                
    left_knee REAL,                                
    right_knee REAL,                               
    feet_distance REAL,                            
    accuracy REAL,                                 
    FOREIGN KEY (fencer_id) REFERENCES fencer(unique_id) ON DELETE CASCADE
);
"""

create_coaches_table = """
CREATE TABLE IF NOT EXISTS coach (
    unique_id TEXT PRIMARY KEY, 
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT false
);
"""

create_coach_fencers_table = """
CREATE TABLE IF NOT EXISTS coach_fencer (
    coach_id TEXT,       
    fencer_id TEXT,
    fencer_name TEXT,
    fencer_email TEXT,
    PRIMARY KEY (coach_id, fencer_id),
    FOREIGN KEY (coach_id) REFERENCES coach(unique_id) ON DELETE CASCADE,
    FOREIGN KEY (fencer_id) REFERENCES fencer(unique_id) ON DELETE CASCADE
);
"""

create_whitelist_table = """
CREATE TABLE IF NOT EXISTS whitelist (
    email TEXT PRIMARY KEY
);
"""

insert_or_replace_whitelist = """
INSERT OR IGNORE INTO whitelist (email) 
VALUES 
    ('vikram.penumarti@gmail.com'),
    ('vpenumarti@ucdavis.edu'),
    ('haalexander@ucdavis.edu'),
    ('rdas@ucdavis.edu'),
    ('sjbarman@ucdavis.edu');
"""

# SQL command to create the ideal_angles table
create_ideal_angles_table = """
CREATE TABLE IF NOT EXISTS ideal_angles (
    name TEXT PRIMARY KEY,      
    elbow_left REAL,            
    hip_left REAL,              
    knee_left REAL,             
    elbow_right REAL,           
    hip_right REAL,             
    knee_right REAL             
);
"""

create_fencer_instruction_table = """
CREATE TABLE IF NOT EXISTS fencer_instructions (
    name TEXT PRIMARY KEY
);
"""

insert_or_replace_fencer_instructions = """
INSERT OR IGNORE INTO fencer_instructions (name) 
VALUES 
    ('Advance'),
    ('Retreat'),
    ('Pulling Double Advance'),
    ('Pulling Double Retreat'),
    ('Double Slow Advance'),
    ('Double Slow Retreat'),
    ('Double Quick Advance'),
    ('Double Quick Retreat'),
    ('Big Double Small Advance'),
    ('Big Double Small Retreat'),
    ('Righty-Lefty Advance'),
    ('Righty-Lefty Retreat'),
    ('Lefty Laps'),
    ('Double Advance'),
    ('Double Retreat'),
    ('Double Retreat followed by Fast Advance');
"""

# Insert or replace for ideal_angles table
insert_or_replace_ideal_angles = """
INSERT OR IGNORE INTO ideal_angles (name, elbow_left, hip_left, knee_left, elbow_right, hip_right, knee_right)
VALUES 
    ('En-Guarde', 96, 117, 121, 2, 170, 160),
    ('Advance', 87, 126, 132, 36, 170, 160),
    ('Retreat', 90, 127, 144, 8, 172, 170),
    ('Lunge', 178, 84, 110, 170, 151, 165);
"""


def set_parser(
    program_name: str,
    program_usage: str,
    program_description: str,
    program_epilog: str,
    program_version: str,
) -> argparse.ArgumentParser:
    parser: argparse.ArgumentParser = argparse.ArgumentParser(
        prog=program_name,
        usage=program_usage,
        description=program_description,
        epilog=program_epilog,
        formatter_class=argparse.RawTextHelpFormatter,
    )
    parser.add_argument(
        "--destroy",
        required=False,
        default=False,
        action="store_true",
        help="[Optional] When argument is used, destroy, else, create",
    )
    parser.add_argument(
        "--db", required=True, type=str, help="[Optional] Name of DB to create/destroy"
    )
    parser.add_argument("-v", "--version", action="version", version=program_version)

    return parser


def create_d1_database(database_name: str) -> None:
    try:
        result: CompletedProcess = subprocess.run(
            ["wrangler", "d1", "create", database_name],
            capture_output=True,
            text=True,
            check=True,
        )
        print(result.stdout)

        match: str = "[[d1_databases]]" + result.stdout.split("[[d1_databases]]")[-1]
        if match:
            with open("wrangler.toml", "w") as file:
                file.write(compat_string)
                file.write(match)
        else:
            raise Exception("Configuration not found in stdout, exiting")

    except subprocess.CalledProcessError as e:
        print(f"Error creating database '{database_name}':")
        print(e.stderr)


def delete_d1_database(database_name: str) -> None:
    try:
        # Run the wrangler command to delete the D1 database
        result: CompletedProcess = subprocess.run(
            ["wrangler", "d1", "delete", database_name],
            capture_output=True,
            text=True,
            check=True,
        )

        # Print the successful deletion message
        print(result.stdout)

    except subprocess.CalledProcessError as e:
        print(f"Error deleting database '{database_name}':")
        print(e.stderr)


# Function to execute the wrangler command with SQL commands
def execute_sql(database_id, sql_command):
    try:
        result = subprocess.run(
            [
                "wrangler",
                "d1",
                "execute",
                database_id,
                "--remote",
                "--command",
                sql_command,
            ],
            capture_output=True,
            text=True,
            check=True,
        )
        print(f"Success: {result.stdout}")
    except subprocess.CalledProcessError as e:
        print(f"Error: {e.stderr}")


def deploy_script():
    try:
        result = subprocess.run(
            ["wrangler", "deploy", "src/index.js"],
            capture_output=True,
            text=True,
            check=True,
        )
        print(f"Success: {result.stdout}")
    except subprocess.CalledProcessError as e:
        print(f"Error: {e.stderr}")


if __name__ == "__main__":
    parser: argparse.ArgumentParser = set_parser(
        program_name,
        program_usage,
        program_description,
        program_epilog,
        program_version,
    )
    args: Namespace = parser.parse_args()

    database_name: str = args.db

    if not args.destroy:
        create_d1_database(database_name)

        execute_sql(database_name, create_fencers_table)
        execute_sql(database_name, create_fencer_sessions_table)
        execute_sql(database_name, create_coaches_table)
        execute_sql(database_name, create_coach_fencers_table)
        execute_sql(database_name, create_fencer_instruction_table)
        execute_sql(database_name, create_ideal_angles_table)
        execute_sql(database_name, create_whitelist_table)
        execute_sql(database_name, insert_or_replace_fencer_instructions)
        execute_sql(database_name, insert_or_replace_ideal_angles)
        execute_sql(database_name, insert_or_replace_whitelist)
        deploy_script()
    else:
        delete_d1_database(database_name)
