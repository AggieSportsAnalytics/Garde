import argparse
import os

import boto3
from dotenv import load_dotenv
from tqdm import tqdm

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
You must create an AWS access key id and secret from cloudflare for whatever buckets 
you need access to, please set TTL to 1 day only for security reasons
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
        "-sb",
        "--source-bucket",
        type=str,
        required=True,
        help="[Required] Name of the source bucket",
    )
    parser.add_argument(
        "-db",
        "--destination-bucket",
        type=str,
        required=True,
        help="[Required] Name of the destination bucket",
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


def copy_files_in_bucket(
    dry, source_bucket, destination_bucket, prefix, destination_prefix
):
    # Initialize the S3 client for Cloudflare R2
    ID = os.getenv("AWS_ACCESS_KEY_ID")
    SECRET = os.getenv("AWS_SECRET_ACCESS_KEY")

    if not ID or not SECRET:
        print("Error: Environment variables are not set.")
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
        videos = list_all_objects(s3_client, source_bucket, prefix)
        print(f"Copying {len(videos)} files")

        with tqdm(total=len(videos), desc="Copying files", unit="file") as pbar:
            for obj in videos:
                source_key = obj["Key"]
                # Construct destination key
                destination_key = source_key.replace(prefix, destination_prefix, 1)

                print(f"Copying {source_key} to {destination_key}...")

                if not dry:
                    s3_client.copy_object(
                        Bucket=destination_bucket,
                        CopySource={"Bucket": source_bucket, "Key": source_key},
                        Key=destination_key,
                    )

                pbar.update(1)

        if dry:
            print("Dry run complete.")
        print(f"All {len(videos)} files copied successfully.")

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
        source_bucket=args.source_bucket,
        destination_bucket=args.destination_bucket,
        prefix=args.source_prefix,
        destination_prefix=args.destination_prefix,
    )
