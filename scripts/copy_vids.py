import argparse
import os

import boto3
from dotenv import load_dotenv

load_dotenv()

program_name = """
copy_vids.py
"""
program_usage = """
copy_vids.py [options]
"""
program_description = """description:
This is a python script to move files under any prefix intrabucket 
"""
program_epilog = """ 
"""
program_version = """
Version 1.0.0 2024-12-05
Created by Vikram Penumarti
"""


def set_parser(
    program_name,
    program_usage,
    program_description,
    program_epilog,
    program_version,
):
    parser = argparse.ArgumentParser(
        prog=program_name,
        usage=program_usage,
        description=program_description,
        epilog=program_epilog,
        formatter_class=argparse.RawTextHelpFormatter,
    )
    parser.add_argument(
        "-d",
        "--dry",
        required=False,
        default=False,
        action="store_true",
        help="[Optional] Enabling flag performs dry run of action\nDefault: False",
    )
    parser.add_argument(
        "-b",
        "--bucket",
        type=str,
        required=True,
        help="[Required] Name of the bucket",
    )
    parser.add_argument(
        "-sp",
        "--source-prefix",
        type=str,
        default="",
        help="[Optional] Prefix of files to copy in the source bucket (default: root of the bucket)",
    )
    parser.add_argument(
        "-dp",
        "--destination-prefix",
        type=str,
        default="",
        help="[Optional] Prefix for copied files in the destination bucket (default: root of the bucket)",
    )
    parser.add_argument("-v", "--version", action="version", version=program_version)

    return parser


def list_all_objects(s3_client, bucket_name, prefix):
    objects = []
    continuation_token = None

    while True:
        params = {
            "Bucket": bucket_name,
            "Prefix": prefix,
            "MaxKeys": 1000,  # Max number of objects per request
        }
        if continuation_token:
            params["ContinuationToken"] = continuation_token

        response = s3_client.list_objects_v2(**params)

        if "Contents" in response:
            objects.extend(response["Contents"])

        # Check if there are more objects to fetch
        if response.get("IsTruncated"):  # True if more objects are available
            continuation_token = response["NextContinuationToken"]
        else:
            break

    return objects


def copy_files_in_bucket(dry, bucket, prefix, destination_prefix):
    # Initialize the S3 client for Cloudflare R2
    ID = os.getenv(f"{bucket.replace("-", "_").upper()}_ID")
    SECRET = os.getenv(f"{bucket.replace("-", "_").upper()}_SECRET")

    if not ID or not SECRET:
        print(f"Error: Environment variables for {bucket} are not set.")
        return

    s3_client = boto3.client(
        "s3",
        endpoint_url="https://aab5b28251de4c153b96e6f8d3179cbc.r2.cloudflarestorage.com",
        aws_access_key_id=ID,
        aws_secret_access_key=SECRET,
        region_name="auto",
    )

    try:
        # List objects under the source prefix
        videos = list_all_objects(s3_client, bucket, prefix)
        print(f"Copying {len(videos)} files")

        for obj in videos:
            source_key = obj["Key"]
            # Construct destination key
            destination_key = source_key.replace(prefix, destination_prefix, 1)

            print(f"Copying {source_key} to {destination_key}...")

            if dry:
                print("Dry run complete.")
            else:
                s3_client.copy_object(
                    Bucket=bucket,
                    CopySource={"Bucket": bucket, "Key": source_key},
                    Key=destination_key,
                )
                print("All files copied successfully.")

    except Exception as e:
        print(f"Error copying files: {e}")


if __name__ == "__main__":
    parser = set_parser(
        program_name,
        program_usage,
        program_description,
        program_epilog,
        program_version,
    )
    args = parser.parse_args()

    copy_files_in_bucket(
        dry=args.dry,
        bucket=args.bucket,
        prefix=args.source_prefix,
        destination_prefix=args.destination_prefix,
    )
