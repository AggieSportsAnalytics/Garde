import argparse
import subprocess
from argparse import Namespace
from subprocess import CompletedProcess

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

## SQL commands to create the tables

create_users_table = """
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('fencer', 'coach')),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT false
);
"""

create_coach_fencers_table = """
CREATE TABLE IF NOT EXISTS coach_fencer (
    coach_id TEXT,       
    fencer_id TEXT,
    fencer_name TEXT NOT NULL,
    fencer_email TEXT NOT NULL,
    PRIMARY KEY (coach_id, fencer_id),
    FOREIGN KEY (coach_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (fencer_id) REFERENCES users(id) ON DELETE CASCADE
);
"""

create_fencer_sessions_table = """
CREATE TABLE IF NOT EXISTS fencer_sessions (
    fencer_id TEXT NOT NULL,
    video_id TEXT NOT NULL,
    pose TEXT,
    feet_distance REAL,
    speed REAL,
    elbow_left REAL, 
    hip_left REAL, 
    knee_left REAL, 
    elbow_right REAL, 
    hip_right REAL, 
    knee_right REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fencer_id) REFERENCES users(id) ON DELETE CASCADE
);
"""

create_tournaments_table = """
CREATE TABLE IF NOT EXISTS tournaments (
    tournament_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    event_name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    prize_pool REAL,
    organizer_name TEXT NOT NULL,
    organizer_email TEXT NOT NULL,
    organizer_phone TEXT,
    location TEXT NOT NULL,
    privacy TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    signup_deadline TEXT NOT NULL,
    registration_fee REAL,
    max_participants INTEGER,
    eligibility TEXT,
    is_team_based BOOLEAN,
    rules TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
"""

create_tournament_users_table = """
CREATE TABLE IF NOT EXISTS tournament_users (
    user_id TEXT,
    tournament_id TEXT,
    user_type TEXT NOT NULL CHECK (user_type IN ('fencer', 'coach')),
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    relation TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, tournament_id),
    FOREIGN KEY (tournament_id) REFERENCES tournaments(tournament_id) ON DELETE CASCADE
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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

create_attempted_signins_table = """
CREATE TABLE IF NOT EXISTS attempted_signins (
    name TEXT NOT NULL,
    email TEXT NOT NULL
);
"""

create_fencer_instruction_table = """
CREATE TABLE IF NOT EXISTS fencer_instructions (
    name TEXT PRIMARY KEY
);
"""

create_mailing_list_table = """
CREATE TABLE IF NOT EXISTS mailing_list (
    name TEXT NOT NULL,
    email TEXT NOT NULL
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

insert_or_replace_ideal_angles = """
INSERT OR IGNORE INTO ideal_angles (name, elbow_left, hip_left, knee_left, elbow_right, hip_right, knee_right)
VALUES 
    ('En-Guarde', 96, 117, 121, 2, 170, 160),
    ('Advance', 87, 126, 132, 36, 170, 160),
    ('Retreat', 90, 127, 144, 8, 172, 170),
    ('Lunge', 178, 84, 110, 170, 151, 165);
"""

insert_or_replace_mailing_list = """
INSERT INTO mailing_list (name, event, email, fencing_tracker_rating) VALUES
('Vikram Penumarti', NULL, 'vikram.penumarti@gmail.com', NULL),
('Honoré Alexander', NULL, 'haalexander@ucdavis.edu', NULL),
('Sujash Barman', NULL, 'sjbarman@ucdavis.edu', NULL),
('Rishit Das', NULL, 'rdas@ucdavis.edu', NULL),
('Daniel Mazza', 'Foil', 'info@mazzadentalcare.com', 'U'),
('Andrew Scheuerman', 'Foil', 'awsch829@gmail.com', 'D24'),
('Jay Bhatt', 'Foil', 'Jaylaal@gmail.com', 'D24'),
('Dylan Heins', 'Épée', 'trunkssword505@gmail.com', 'B24'),
('James Helge', 'Épée', 'jrhelge@hotmail.com', 'A22'),
('Oliver Kenny', 'Épée', 'orkenny774@gmail.com', 'C24'),
('Jonathan Levitsky', 'Épée', 'jlevitsky05@gmail.com', 'B24'),
('Zachary R. Hicks', 'Épée', 'k4rnavor@gmail.com', 'A24'),
('Ronen DeMontigny', 'Épée', 'rdemon531@gmail.com', 'U'),
('Clara Cheung', 'Épée', 'cheungclarah@gmail.com', 'U'),
('Masaya Takahashi', 'Sabre', 'masaryashi@gmail.com', 'E24'),
('Morgane Bhatt', 'Foil', 'morgane.bhatt@gmail.com', 'B23'),
('Lucas Peterson', 'Foil', 'L.peterson06@icloud.com', 'D24'),
('Tomer Kibbar', 'Sabre', 'tomer.kibbar@gmail.com', NULL),
('Edward Posada', NULL, 'edfences@yahoo.com', NULL),
('Feifei Sune', NULL, 'elisa18900@gmail.com', NULL),
('Corina Mafesan', NULL, 'corince@yahoo.com', NULL),
('Ken Flores', NULL, 'calfencer@gmail.com', NULL),
('Maxx Zander', 'Épée', 'zoe.z.zander@icloud.com', NULL),
('Jennifer Oakes', NULL, 'oakesjemac@gmail.com', NULL),
('Ashley Retsosamudra', NULL, 'iaretsosamudra@ucdavis.edu', NULL),
('Jay Park', NULL, 'misc.mail00@gmail.com', NULL),
('Amy Sternad', NULL, 'amy.sternad@gmail.com', NULL),
('Arjun Bhanot', 'Épée', 'arjunb2829@gmail.com', NULL),
('Theo Ahn', NULL, 'roscoeahn@yahoo.com', NULL),
('Nathan V', NULL, 'vizcarmb@yahoo.com', NULL),
('Mateo Dobins', NULL, 'grioir@sbcglobal.net', NULL),
('Saanvi Divate', NULL, 'rishi.divate@gmail.com', NULL),
('Winston Wei', NULL, 'ipearlge@gmail.com', NULL),
('Ethan Becker', NULL, 'ethanbecker@gmail.com', NULL),
('Joey Guo', 'Épée', '4ourlife@gmail.com', NULL),
('Sarah Beut', NULL, 'sarahmbeut@gmail.com', NULL),
('Desmond Nelson', 'Sabre', 'thedailydesmond@gmail.com', NULL),
('Arnav Talatam', NULL, 'sunshine_8n@yahoo.com', NULL);
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

        execute_sql(database_name, create_users_table)
        execute_sql(database_name, create_tournaments_table)
        execute_sql(database_name, create_tournament_users_table)
        execute_sql(database_name, create_fencer_sessions_table)
        execute_sql(database_name, create_coach_fencers_table)
        execute_sql(database_name, create_fencer_instruction_table)
        execute_sql(database_name, create_ideal_angles_table)
        execute_sql(database_name, create_whitelist_table)
        execute_sql(database_name, create_attempted_signins_table)
        execute_sql(database_name, create_mailing_list_table)
        execute_sql(database_name, insert_or_replace_fencer_instructions)
        execute_sql(database_name, insert_or_replace_ideal_angles)
        execute_sql(database_name, insert_or_replace_whitelist)
        execute_sql(database_name, insert_or_replace_mailing_list)
        deploy_script()
    else:
        delete_d1_database(database_name)
