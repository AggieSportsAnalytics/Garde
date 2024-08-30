locals {
  bucket_name = "${var.product_abbreviation}-${var.environment}-${var.feature}"
}

resource "aws_s3_bucket" "fencing_videos" {
  bucket        = local.bucket_name
  force_destroy = true
  tags          = var.common_tags
}

resource "aws_s3_bucket_lifecycle_configuration" "fencing_videos_expiration" {
  bucket = aws_s3_bucket.fencing_videos.id
  rule {
    id     = "expire_all_files"
    status = "Disabled"
    expiration {
      days = 10
    }
  }
}

resource "aws_s3_bucket_metric" "s3_put_metrics" {
  bucket = aws_s3_bucket.fencing_videos.id
  name   = "${aws_s3_bucket.fencing_videos.id}-put-metrics"
}