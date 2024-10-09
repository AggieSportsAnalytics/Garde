import subprocess
from subprocess import CompletedProcess
import argparse
from argparse import Namespace

compat_string: str = """name = "garde"
main = "src/index.js"
compatibility_date = "2023-08-23"


"""

program_name: str = """
automate_setup.py
"""
program_usage: str = """
automate_setup.py [options] --destroy --db DB_NAME
"""
program_description: str = """description:
This is a python script to automate setup/destroy of R2 Buckets in Cloudflare
"""
program_epilog: str = """ 

"""
program_version: str = """
Version 1.0.0 2024-09-12
Created by Vikram Penumarti
"""

# SQL commands to create the tables


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
        "--db",
        required=True,
        type=str,
        help="[Optional] Name of R2 Bucket to create/destroy",
    )
    parser.add_argument("-v", "--version", action="version", version=program_version)

    return parser


def create_r2_bucket(bucket_name: str) -> None:
    try:
        result: CompletedProcess = subprocess.run(
            ["wrangler", "r2", "bucket", "create", bucket_name],
            capture_output=True,
            text=True,
            check=True,
        )
        print(result.stdout)

        # match: str = "[[d1_databases]]" + result.stdout.split("[[d1_databases]]")[-1]
        # if match:
        #     with open("wrangler.toml", "w") as file:
        #         file.write(compat_string)
        #         file.write(match)
        # else:
        #     raise Exception("Configuration not found in stdout, exiting")

    except subprocess.CalledProcessError as e:
        print(f"Error creating database '{bucket_name}':")
        print(e.stderr)


def delete_r2_bucket(bucket_name: str) -> None:
    try:
        # Run the wrangler command to delete the D1 database
        result: CompletedProcess = subprocess.run(
            ["wrangler", "r2", "bucket", "delete", bucket_name],
            capture_output=True,
            text=True,
            check=True,
        )

        # Print the successful deletion message
        print(result.stdout)

    except subprocess.CalledProcessError as e:
        print(f"Error deleting database '{bucket_name}':")
        print(e.stderr)


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

    bucket_name: str = args.db

    if not args.destroy:
        create_r2_bucket(bucket_name)
        deploy_script()
    else:
        delete_r2_bucket(bucket_name)
