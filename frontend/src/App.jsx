import {Routes, Route} from "react-router-dom";
import Login from "./pages/Login";
import Repos from "./pages/Repos";
import Nodes from "./pages/Nodes";
import DocumentEditor from "./pages/DocumentEditor";
import Invitations from "./pages/Invitations";
import Register from "./pages/Register";

function App() {
  return (
    <Routes>

      <Route path="/" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/repos" element={<Repos />} />

      <Route path="/repos/:repoId/nodes/:folderId" element={<Nodes />} />

      <Route path="/repos/:repoId/nodes" element={<Nodes />} />
      
      <Route path="/repos/:repoId/nodes/:id" element={<DocumentEditor />} />

      <Route path="/invitations" element={<Invitations />} />

    </Routes>
  );
}


export default App;