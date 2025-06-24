import { createRoot } from "react-dom/client";

function TestApp() {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>🌱 WUCOLS Test App</h1>
      <p>If you can see this, React is working with Vite!</p>
      <p>Current time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<TestApp />);
} else {
  console.error('Root container not found');
}
