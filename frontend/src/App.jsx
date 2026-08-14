import {Routes, Route} from "react-router-dom";
import Login from "./pages/Login";
import Repos from "./pages/Repos";
import Nodes from "./pages/Nodes";
import FileEditor from "./pages/FileEditor";
import Invitations from "./pages/Invitations";
import Register from "./pages/Register";
import OAuthCallback from "./pages/OAuthCallback";

function App() {
  return (
    <Routes>

      <Route path="/" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/repos" element={<Repos />} />

      <Route path="/repos/:repoId/nodes/:folderId" element={<Nodes />} />

      <Route path="/repos/:repoId/nodes" element={<Nodes />} />

      <Route path="/repos/:repoId/files/:fileId" element={<FileEditor />} />

      <Route path="/invitations" element={<Invitations />} />

      <Route path="/oauth-callback" element={<OAuthCallback />} />

    </Routes>
  );
}


export default App;