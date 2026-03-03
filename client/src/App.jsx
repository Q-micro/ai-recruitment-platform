import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Jobs from "./pages/Jobs";
import Login from "./pages/Login";
import Signup from "./pages/Signup";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Jobs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>



  );
}

export default App; 