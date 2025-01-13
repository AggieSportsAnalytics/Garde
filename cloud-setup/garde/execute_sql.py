import argparse
import subprocess
from argparse import Namespace

program_name: str = """
execute_sql.py
"""
program_usage: str = """
execute_sql.py [options] --db DB_NAME
"""
program_description: str = """description:
This is a python script to execute sql commands on D1 DB in Cloudflare
"""
program_epilog: str = """ 

"""
program_version: str = """
Version 1.0.0 2024-12-22
Created by Vikram Penumarti
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
        "--db", required=True, type=str, help="[Required] Name of DB to execute SQL on"
    )
    parser.add_argument(
        "--path",
        "-p",
        required=False,
        type=str,
        help="[Optional] Path to file containing sql command to execute",
    )
    parser.add_argument("-v", "--version", action="version", version=program_version)

    return parser


def read_file(path):
    if path is None:
        path = "./command.sql"

    with open(path, "r") as file:
        command = file.read().strip()

    return command


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

    sql_command = read_file(args.path)
    execute_sql(database_name, sql_command)
