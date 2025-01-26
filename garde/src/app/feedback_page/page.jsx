"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe("pk_test_51QkxRkP5D7WqTYQ8sjwDeSroNy6MIB53eO87oBYZX0iUPJtrYebY8ZZGbb6TRBISHzIcw9hHQmqise8y4IFFdxMy00J0bnbDb4");

const FeedbackPage = () => {
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [name, setName] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDate, setVideoDate] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [specificFeedback, setSpecificFeedback] = useState("");
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [viewingProfile, setViewingProfile] = useState(false); //profile modal state
  const [profileCoach, setProfileCoach] = useState(null); //selected coach profile being viewed
  const [amountToPay, setAmountToPay] = useState(5000); // set amount to pay (in cents)
  const router = useRouter();

  const coaches = [
    {
      id: 1,
      name: "Coach A",
      level: "Beginner",
      yearsExperience: 5,
      specialty: "Footwork",
      description: "Specializes in improving footwork and agility. Has worked with beginner fencers for over 5 years.",
    },
    {
      id: 2,
      name: "Coach B",
      level: "Advanced",
      yearsExperience: 10,
      specialty: "Competitive Strategy",
      description: "Helps advanced fencers refine their techniques and strategies for competitive matches.",
    },
  ];

  // handle form fields changes...
  const handleCoachSelection = (coach) => {
    setSelectedCoach(coach);
  };



  const handleVideoUpload = (e) => {
    setVideoFile(e.target.files[0]);
  };

  const handleTitleChange = (e) => {
    setVideoTitle(e.target.value);
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleSkillLevelChange = (e) => {
    setSkillLevel(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setVideoDescription(e.target.value);
  };

  const handleSpecificFeedbackChange = (e) => {
    setSpecificFeedback(e.target.value);
  };

  //PAYMENT LOGIC HANDLER --> calls create-payment-intent
  const handlePayment = async (stripe, elements) => {
    if (!stripe || !elements) return;

    try {
      //xall the server to create a payment intent
      const response = await fetch("/api/payments/create-payment-intent", {
        method: "POST",
        body: JSON.stringify({ amount: amountToPay }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const { clientSecret } = await response.json();

      //confirm the payment using clientSecret
      const { error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: name,
          },
        },
      });

      if (error) {
        alert(error.message);
      } else {
        setPaymentConfirmed(true);
      }
    } catch (error) {
      alert("Payment failed: " + error.message);
    }
  };

  //toggle profile open/closed
  const openProfile = (coach) => {
    setProfileCoach(coach);
    setViewingProfile(true);
  };

  const closeProfile = () => {
    setViewingProfile(false);
    setProfileCoach(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white py-16 px-6 sm:px-8 lg:px-12">
      <div className="max-w-5xl mx-auto bg-gray-800 shadow-xl rounded-lg p-10">
        <h1 className="text-4xl font-extrabold text-center text-white mb-10">
          Get Personalized Feedback from a Coach
        </h1>

        {/* select coach */}
        <div className="mb-10">
          <h2 className="text-3xl font-semibold text-gray-300 mb-6">Select a Coach</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {coaches.map((coach) => (
              <div
                key={coach.id}
                className={`border-2 border-transparent p-6 rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                  selectedCoach?.id === coach.id
                    ? "bg-blue-600 border-blue-400"
                    : "bg-gray-700 hover:bg-gray-600"
                }`}
              >
                <img
                  src={`/coaches/${coach.id}.jpg`}
                  alt={coach.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
                <h3 className="text-xl font-semibold text-white">{coach.name}</h3>
                <p className="text-sm text-gray-400">{coach.level}</p>
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => openProfile(coach)}
                    className="text-blue-400 hover:underline"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => handleCoachSelection(coach)}
                    className="text-green-400 hover:underline"
                  >
                    Select Coach
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upload media + descriptions */}
        {selectedCoach && (
          <div className="mb-10">
            <h2 className="text-3xl font-semibold text-gray-300 mb-6">Upload Your Video</h2>
            <div className="flex flex-col space-y-6">
              <input
                type="file"
                onChange={handleVideoUpload}
                className="border-2 border-gray-600 p-4 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <input
                type="Name"
                placeholder="What is your name?"
                value={name}
                onChange={handleNameChange}
                className="border-2 border-gray-600 p-4 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <input
                type="Skill level"
                placeholder="What is your skill level? (for ex: Intermediate level fencer who has been fencing for 3 years)"
                value={skillLevel}
                onChange={handleSkillLevelChange}
                className="border-2 border-gray-600 p-4 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <input
                type="text"
                placeholder="Video Title (ie. Practice, Bout, Training, ...etc.)"
                value={videoTitle}
                onChange={handleTitleChange}
                className="border-2 border-gray-600 p-4 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <textarea
                placeholder="Describe your video. What is the context of the video? Where was it taken? etc."
                value={videoDescription}
                onChange={handleDescriptionChange}
                className="border-2 border-gray-600 p-4 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                rows="6"
              />
              <textarea
                placeholder="Request specific feedback. What type of feedback do you want? Is there a specific area that you'd like help with?"
                value={specificFeedback}
                onChange={handleSpecificFeedbackChange}
                className="border-2 border-gray-600 p-4 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                rows="6"
              />
              
              {/* Stripe Card Input */}
              <div className="mb-6">
                <label className="text-lg font-semibold">Payment Information</label>
                <CardElement className="border-2 border-gray-600 p-4 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              
              <button
                onClick={handlePayment}
                className="w-full py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Submit and Pay
              </button>
            </div>
          </div>
        )}

        {/* confirm payment */}
        {paymentConfirmed && (
          <div className="mt-6 text-center text-green-500 text-xl">
            <p>Payment confirmed. You will be assigned to {selectedCoach.name} shortly!</p>
          </div>
        )}

        {/* refunds */}
        <p className="mt-8 text-center text-sm text-gray-400">
          If you have not received feedback within 5 business days, we offer a money-back guarantee. Please contact support@gardeai.com for any inquiries related to refunds.
        </p>
      </div>

      {/* coach profile modal */}
      {viewingProfile && profileCoach && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-900 text-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">{profileCoach.name}</h2>
            <p><strong>Level:</strong> {profileCoach.level}</p>
            <p><strong>Years of Experience:</strong> {profileCoach.yearsExperience}</p>
            <p><strong>Specialty:</strong> {profileCoach.specialty}</p>
            <p className="mt-4">{profileCoach.description}</p>
            <button
              onClick={closeProfile}
              className="mt-6 w-full py-2 bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default function WrappedFeedbackPage() {
  return (
    <Elements stripe={stripePromise}>
      <FeedbackPage />
    </Elements>
  );
}
