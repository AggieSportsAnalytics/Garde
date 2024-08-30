resource "aws_iam_user" "s3_client_user" {
  name = "s3-client-user"
  
}

resource "aws_iam_policy" "s3_client_user_policy" {
  name        = "s3-client-user-policy"
  description = "A policy that grants put object access to a fencing videos bucket"
  policy      = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:PutObject",
      "Resource": "arn:aws:s3:::${aws_s3_bucket.fencing_videos.id}/*"
    },
    {
      "Effect": "Allow",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::${aws_s3_bucket.fencing_videos.id}/*"
    },
    {
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::${aws_s3_bucket.fencing_videos.id}"
    }
  ]
}
EOF
}

resource "aws_iam_user_policy_attachment" "s3_client_user_policy_attachment" {
  user       = aws_iam_user.s3_client_user.name
  policy_arn = aws_iam_policy.s3_client_user_policy.arn
}