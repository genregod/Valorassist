import React from "react";
import { MessageCircle } from "lucide-react";

export function TestChatPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f0f0f0", position: "relative" }}>
      <h1 style={{ padding: "20px", fontSize: "24px" }}>Test Chat Button Page</h1>
      
      {/* Test different button implementations */}
      
      {/* Button 1: Absolute positioning */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          width: "60px",
          height: "60px",
          backgroundColor: "red",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 1000
        }}
        onClick={() => alert("Absolute button clicked!")}
      >
        <span style={{ color: "white", fontSize: "12px" }}>ABS</span>
      </div>
      
      {/* Button 2: Fixed positioning */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "100px",
          width: "60px",
          height: "60px",
          backgroundColor: "blue",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 1000
        }}
        onClick={() => alert("Fixed button clicked!")}
      >
        <span style={{ color: "white", fontSize: "12px" }}>FIX</span>
      </div>
      
      {/* Button 3: Navy with icon */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "180px",
          width: "60px",
          height: "60px",
          backgroundColor: "#001c3d",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 1000,
          boxShadow: "0 4px 8px rgba(0,0,0,0.3)"
        }}
        onClick={() => alert("Navy button clicked!")}
      >
        <MessageCircle size={24} color="white" />
      </div>
      
      {/* Button 4: Using button element */}
      <button
        style={{
          position: "fixed",
          bottom: "20px",
          right: "260px",
          width: "60px",
          height: "60px",
          backgroundColor: "green",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 1000,
          border: "none"
        }}
        onClick={() => alert("Button element clicked!")}
      >
        <span style={{ color: "white", fontSize: "12px" }}>BTN</span>
      </button>
    </div>
  );
}