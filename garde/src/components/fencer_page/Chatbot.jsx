import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Chatbot({ darkMode, hash_file, initialAnalysis, session_id }) {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  
  //DUMMY INITIAL ANALYSIS
  const dummyAnalysis = `
    **Fencing Analysis:**
    Analyzing your onguard position:
    - Left elbow angle: 163° (good extension)
    - Right elbow angle: 173° (excellent position)
    - Feet distance: 1.88m (slightly wide)
    - Hip angles well balanced
    
    Recommendations:
    1. Maintain your arm extension
    2. Consider reducing stance width by ~10cm
    3. Keep your weight distribution even between feet
  `;
  
  //DUMMY CHAT BOT RESPONSES
  const dummyResponses = {
    default: "I'm analyzing your technique. Your onguard position looks solid, with good arm extension and weight distribution. It seems like you're overextending your arm a bit, which can leave you open to attacks and quick counters. I would try to maintain control of your joints.",
  };
  
  // Function to sanitize and format the bot's response
  const formatResponse = (response) => {
    if (!response) return "";
    
    return response
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Convert bold markdown to HTML
      .replace(/__(.*?)__/g, "<em>$1</em>") // Convert italic markdown to HTML
      .replace(/\n/g, "<br />") // Replace newlines with HTML line breaks
      .replace(/-\s(.*?)$/gm, "<li>$1</li>") // Convert hyphens to list items
      .replace(/<li>/g, "<ul><li>").replace(/<\/li>\s*(?!<li>)/g, "</li></ul>"); // Wrap lists
  };

  //use either real initialAnalysis or dummy data in debug mode
  useEffect(() => {
    const analysisData = debugMode ? dummyAnalysis : initialAnalysis;
    
    if (analysisData) {
      console.log("Analysis data being processed:", debugMode ? "dummy data" : "real data");
      const formattedAnalysis = formatResponse(analysisData);
      
      setChatHistory([
        { sender: "bot", message: formattedAnalysis }
      ]);
    }
  }, [initialAnalysis, debugMode]);

  //scroll to bottom whenever chat history updates
  useEffect(() => {
    const chatContainer = document.querySelector('.chat-messages');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [chatHistory]);


  const triggerDebugMode = () => {
    setDebugMode(true);
    console.log("Debug mode activated");
  };
  //from gpt
  const getDummyResponse = (input) => {
    return dummyResponses.default;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userInput.trim()) return;
    
    const currentInput = userInput;
    
    setChatHistory((prevHistory) => [
      ...prevHistory,
      { sender: "user", message: currentInput }
    ]);
    

    setUserInput("");
    setLoading(true);
    
    if (debugMode) {
      //NOT REAL DATA!! Reminder for future Honoré
      setTimeout(() => {
        const response = getDummyResponse(currentInput);
        
        setChatHistory((prevHistory) => [
          ...prevHistory,
          { sender: "bot", message: formatResponse(response) }
        ]);
        setLoading(false);
      }, 800);
      
      return;
    }
    
    try {
      //real API call
      const response = await axios.post(
        `${process.env.CHAT_URL}/chat`,
        {
          query: currentInput,
		  fencerId: fencerId,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
            'X-Session-ID': session_id,
            'X-hash-file': hash_file,
          },
          withCredentials: true,
        }
      );

      const formattedMessage = formatResponse(response.data.response);

      setChatHistory((prevHistory) => [
        ...prevHistory,
        { sender: "bot", message: formattedMessage }
      ]);
    } catch (error) {
      console.error("Chat API error:", error);
      
      let errorMessage = "Sorry, something went wrong.";
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Authentication error. Please try refreshing the page.";
        } else if (error.response.status === 404) {
          errorMessage = "The analysis service couldn't be reached. Please try again later.";
        } else if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        }
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      }

      setChatHistory((prevHistory) => [
        ...prevHistory,
        { sender: "bot", message: errorMessage }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col h-full p-4 rounded-lg border border-gray-300"
      style={{ pointerEvents: "auto" }}
    >
      {/* Debug Controls */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="mb-2 text-xs text-gray-500 flex justify-between items-center">
          <button 
            onClick={triggerDebugMode}
            className={`px-2 py-1 rounded text-xs ${
              debugMode 
                ? "bg-green-200 text-green-800" 
                : "bg-gray-200 hover:bg-gray-300 text-gray-700"
            }`}
          >
            {debugMode ? "Debug Mode ON" : "Enable Debug Mode"}
          </button>
          {debugMode && (
            <span className="ml-2 text-xs italic">Using dummy data for testing</span>
          )}
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto mb-4 chat-messages">
        {chatHistory.length === 0 ? (
          <div className="text-center text-gray-500 my-4">
            {loading ? "Analyzing video..." : "Waiting for analysis to complete..."}
            {process.env.NODE_ENV !== 'production' && !debugMode && (
              <div className="mt-2 text-xs">
                <button 
                  onClick={triggerDebugMode}
                  className="underline text-blue-500"
                >
                  Use test data
                </button>
              </div>
            )}
          </div>
        ) : (
          chatHistory.map((chat, index) => (
            <div
              key={index}
              className={`mb-3 ${
                chat.sender === "user" ? "text-right" : "text-left"
              }`}
            >
              <div
                className={`inline-block px-4 py-2 rounded-lg max-w-[85%] ${
                  chat.sender === "user"
                    ? darkMode
                      ? "bg-blue-600 text-white"
                      : "bg-blue-500 text-white"
                    : darkMode
                      ? "bg-gray-700 text-white"
                      : "bg-gray-200 text-black"
                }`}
              >
                {chat.sender === "user" ? (
                  <div>{chat.message}</div>
                ) : (
                  <div 
                    className="bot-message"
                    dangerouslySetInnerHTML={{ __html: chat.message }}
                  />
                )}
              </div>
              {chat.sender === "bot" && index === chatHistory.length - 1 && (
                <div className="mt-1 ml-1 text-xs text-gray-500">
                  {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              )}
            </div>
          ))
        )}
        
        {loading && (
          <div className="text-left my-3">
            <div className="inline-block px-4 py-2 rounded-lg bg-gray-200 text-black animate-pulse">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                <div className="w-2 h-2 rounded-full bg-gray-500"></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className={`flex-1 px-3 py-2 rounded-l-lg focus:outline-none ${
            darkMode ? "bg-gray-700 text-white" : "bg-gray-100 text-black border border-gray-300"
          }`}
          placeholder="Ask about your fencing technique..."
          disabled={loading || chatHistory.length === 0}
        />
        <button
          type="submit"
          className={`px-4 py-2 rounded-r-lg ${
            darkMode ? "bg-blue-600" : "bg-blue-500"
          } text-white ${
            (loading || chatHistory.length === 0) ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
          }`}
          disabled={loading || chatHistory.length === 0}
        >
          Send
        </button>
      </form>
      
      {chatHistory.length === 0 && !debugMode && (
        <div className="text-center text-xs text-gray-500 mt-2">
          Chat will be enabled after video analysis completes
        </div>
      )}
    </div>
  );
}