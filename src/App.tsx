import React, { useState } from "react";
import "./App.css";

function App() {
  const [hoveredElementId, setHoveredElementId] = useState("");

  const elements = [];

  for (let i = 0; i < 500; i++) {
    const elementId = String(i);
    const isHovered = hoveredElementId === elementId;

    elements.push(
      <div 
        key={i}
        style={{ marginBottom: 8, backgroundColor: isHovered ? "#eee" : "" }}
        onMouseEnter={() => {
          setHoveredElementId(elementId);
        }}
        onMouseLeave={()=> {
          if (elementId == hoveredElementId) {
            setHoveredElementId("");
          }
        }}
      >
        div
      </div>
    );
  }

  return <>{elements}</>;
}

export default App;
