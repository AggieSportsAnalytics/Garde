import { NextResponse } from 'next/server';

export async function POST(request) {
  // Get the data from the request body
  const data = await request.json();

  // Log the incoming data from the client
  console.log("Received data from client:", data);

  // Forward the request to the external API
  const externalResponse = await fetch('http://54.86.241.80/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  // Get the response data
  const result = await externalResponse.json();

  // Log the response from the external API
  console.log("Response from external API:", result);

  // Return the response data
  return NextResponse.json(result);
} 