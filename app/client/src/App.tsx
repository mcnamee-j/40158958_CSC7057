import "./index.css";
import { AuthProvider } from "./context/AuthProvider";

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-surface-light flex items-center justify-center">
        <div className="bg-green-700 text-white px-6 py-3 rounded-lg">
          Tailwind is connected
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;
