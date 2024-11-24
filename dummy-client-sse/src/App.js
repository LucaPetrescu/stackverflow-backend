import React, { useState, useEffect } from "react";
import "./App.css";
function App() {
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:7004/sse");

    eventSource.onmessage = (event) => {
      const newUpdate = event.data;
      setUpdates((prevUpdates) => [...prevUpdates, newUpdate]);
    };

    eventSource.onerror = (err) => {
      console.error("SSE error:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="App">
      <header>Real-Time Updates Test</header>
      <div className="live-updates">
        {updates.map((update, index) => (
          <div key={index} className="update-item">
            <span>Update {index + 1}:</span> {update}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
