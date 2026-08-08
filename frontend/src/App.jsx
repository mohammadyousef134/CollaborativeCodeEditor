import {Routes, Route} from "react-router-dom";
import Login from "./pages/Login";
import Projects from "./pages/Projects";
import Documents from "./pages/Documents";
import DocumentEditor from "./pages/DocumentEditor";
import Invitations from "./pages/Invitations";

function App() {
  return (
    <Routes>

      <Route path="/" element={<Login />} />

      <Route path="/repos" element={<Projects />} />

      <Route path="/repos/:repoId/nodes" element={<Documents />} />
      
      <Route path="/repos/:repoId/nodes/:id" element={<DocumentEditor />} />

      <Route path="/invitations" element={<Invitations />} />

    </Routes>
  );
}


export default App;