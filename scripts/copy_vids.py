import argparse
import os
from concurrent.futures import ThreadPoolExecutor, as_completed

import boto3
from botocore.config import Config
from dotenv import load_dotenv
from tqdm import tqdm

# Load environment variables
load_dotenv()

# Program metadata
program_name = "copy_vids.py"
program_usage = "copy_vids.py [options]"
program_description = """description:
This is a Python script to copy files under any prefix cross/intra bucket."""
program_epilog = """
You must create an AWS access key id and secret from Cloudflare for whatever buckets 
you need access to, please set TTL to 1 day only for security reasons."""
program_version = "Version 1.0.0 2024-12-05 Created by Vikram Penumarti"


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
    parser.add_argument(
        "--delete",
        type=str,
        default="",
        help="[Optional] Whether to delete the files from the source bucket/prefix or not (default: false)",
    )
    parser.add_argument("-v", "--version", action="version", version=program_version)

    return parser


def list_all_objects(s3_client, bucket_name, prefix):
    """List all objects under a given prefix in the bucket."""
    objects = []
    continuation_token = None

    while True:
        params = {
            "Bucket": bucket_name,
            "Prefix": prefix,
            "MaxKeys": 1000,
        }
        if continuation_token:
            params["ContinuationToken"] = continuation_token

        response = s3_client.list_objects_v2(**params)

        if "Contents" in response:
            objects.extend(response["Contents"])

        # Check if there are more objects to fetch
        if response.get("IsTruncated"):
            continuation_token = response["NextContinuationToken"]
        else:
            break

    return objects


def copy_file(
    s3_client,
    source_bucket,
    source_key,
    destination_bucket,
    destination_key,
    dry,
    delete,
):
    """Copy a single file from the source bucket to the destination bucket."""

    try:
        if not dry:
            s3_client.copy_object(
                Bucket=destination_bucket,
                CopySource={"Bucket": source_bucket, "Key": source_key},
                Key=destination_key,
            )

            if delete:
                s3_client.delete_object(
                    Bucket=source_bucket,
                    Key=source_key,
                )
        tqdm.write(
            f"Copying file from {source_bucket}/{source_key} to {destination_bucket}/{destination_key}"
        )
        return True
    except Exception as e:
        print(f"Failed to copy {source_key}: {e}")
        return False


def copy_files_in_bucket(
    dry, source_bucket, destination_bucket, prefix, destination_prefix, delete
):
    """Copy files in a bucket from one prefix to another."""
    # Initialize the S3 client
    ID = os.getenv("AWS_ACCESS_KEY_ID")
    SECRET = os.getenv("AWS_SECRET_ACCESS_KEY")

    if not ID or not SECRET:
        print("Error: Environment variables are not set.")
        return

    s3_config = Config(max_pool_connections=50)  # Increase connection pool
    s3_client = boto3.client(
        "s3",
        endpoint_url="https://aab5b28251de4c153b96e6f8d3179cbc.r2.cloudflarestorage.com",
        aws_access_key_id=ID,
        aws_secret_access_key=SECRET,
        region_name="auto",
        config=s3_config,
    )

    try:
        # List objects under the source prefix
        videos = list_all_objects(s3_client, source_bucket, prefix)
        print(f"Found {len(videos)} files to copy.")

        # Use ThreadPoolExecutor for concurrency
        with ThreadPoolExecutor(max_workers=10) as executor, tqdm(
            total=len(videos), desc="Copying files", unit="file", dynamic_ncols=True
        ) as pbar:
            futures = []
            for obj in videos:
                source_key = obj["Key"]
                destination_key = source_key.replace(prefix, destination_prefix, 1)

                futures.append(
                    executor.submit(
                        copy_file,
                        s3_client,
                        source_bucket,
                        source_key,
                        destination_bucket,
                        destination_key,
                        dry,
                        delete,
                    )
                )

            # Wait for all futures to complete
            for future in as_completed(futures):
                pbar.update(1)
                future.result()

        if dry:
            print(
                f"Dry run complete. No files were copied.\n{len(videos)} files audited successfully."
            )
        else:
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
        delete=args.delete,
    )
