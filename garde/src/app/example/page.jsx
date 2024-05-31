"use client"

import { useState } from "react";

export default function Example() {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            return;
        }
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch(('/api/s3-upload'), {
                method: "POST",
                body: formData
            });

            const data = await response.json();
            setUploading(false);
        } catch (error) {
            console.log(error);
            setUploading(false);
        }
    };

    return <>
        <p>Upload files to S3 bucket</p>
        <form onSubmit={handleSubmit}>
            <input type="file" accept="video/*" onChange={handleFileChange}></input>
            <button type="submit" disabled={!file || uploading}>{uploading ? "Upload..." : "Upload"}</button>
        </form>
    </>;
}