import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/Layout/MainLayout";
import StartCreation from "./pages/StartCreation";
import TaskManagement from "./pages/TaskManagement";
import Materials from "./pages/Materials";
import MaterialPreprocessing from "./pages/MaterialPreprocessing";
import MaterialReview from "./pages/MaterialReview";
import VideoLibraryNew from "./pages/VideoLibraryNew";
import Editor from "./pages/Editor";
import NotFound from "./pages/NotFound";

const App = () => (
  <TooltipProvider>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<StartCreation />} />
          <Route path="tasks" element={<TaskManagement />} />
          <Route path="materials" element={<Materials />} />
          <Route path="material-preprocessing" element={<MaterialPreprocessing />} />
          <Route path="material-review" element={<MaterialReview />} />
          <Route path="video-library" element={<VideoLibraryNew />} />
          <Route path="editor/:id?" element={<Editor />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;