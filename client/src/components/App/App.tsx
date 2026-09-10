import { Routes, Route } from "react-router-dom";
import "./App.css"
import AppLayout from "../AppLayout/AppLayout";
import Intro from "../../pages/Intro/Intro";
import KnowledgeBase from "../../pages/KnowledgeBase/KnowledgeBase";
import Chat from "../../pages/Chat/Chat";
import Login from "../../pages/Login/Login";
import Register from "../../pages/Register/Register";
import { ProtectedRoute, PublicRoute } from "../ProtectedRoute/ProtectedRoute";

function App() {
  return (
    <div className="app">
      <Routes>
        {/* Intro route appears at "/" */}
        <Route path="/" element={<Intro />} />

        <Route element={<AppLayout />}>
          <Route element={<ProtectedRoute />}>
            {/* KnowledgeBase route appears at "/knowledge" */}
            <Route path="/knowledge" element={<KnowledgeBase />} />
            {/* Chat route appears at "/chat" */}
            <Route path="/chat" element={<Chat />} />
          </Route>
        </Route>

        <Route element={<PublicRoute />}>
          {/* Login route appears at "/login" */}
          <Route path="/login" element={<Login />} />
          {/* Register route appears at "/register" */}
          <Route path="/register" element={<Register />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
