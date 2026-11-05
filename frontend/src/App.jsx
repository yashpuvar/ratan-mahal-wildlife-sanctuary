import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import About from "./pages/About";
import Posts from "./pages/Posts";
import PostDetail from "./pages/PostDetail";
import Gallery from "./pages/Gallery";
import Videos from "./pages/Videos";
import Stay from "./pages/Stay";
import Contact from "./pages/Contact";
import Developer from "./pages/Developer";

import CreatePost from "./admin/CreatePost";
import Dashboard from "./admin/Dashboard";
import AdminManage from "./admin/AdminManage";
import CreateGallery from "./admin/CreateGallery";
import CreateVideo from "./admin/CreateVideo";
import Login from "./admin/Login";
import ChangePassword from "./admin/ChangePassword";
import GoogleLogin from "./pages/GoogleLogin";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import SanctuaryStatusProvider from "./components/SanctuaryStatusProvider";
import SanctuaryHours from "./admin/SanctuaryHours";
import VisitorPhotoManagement from "./admin/VisitorPhotoManagement";





function App() {
  return (
    <BrowserRouter>
      <SanctuaryStatusProvider>
      <div className="flex min-h-screen flex-col bg-white">
        <Navbar />

        <div className="flex-1">

<Routes>
  {/* Website Pages */}
  <Route path="/" element={<Home />} />
  <Route path="/about" element={<About />} />
  <Route path="/posts" element={<Posts />} />
  <Route path="/posts/:id" element={<PostDetail />} />
  <Route path="/gallery" element={<Gallery />} />
  <Route path="/videos" element={<Videos />} />
  <Route path="/stay" element={<Stay />} />
  <Route path="/contact" element={<Contact />} />
  <Route path="/developer" element={<Developer />} />

  {/* Public Login */}
  <Route path="/login" element={<GoogleLogin />} />

  {/* Admin Login */}
  <Route path="/admin/login" element={<Login />} />
  <Route path="/admin/change-password" element={<ChangePassword />} />

  {/* Protected Admin Pages */}
  <Route element={<AdminProtectedRoute />}>
    <Route path="/admin" element={<Dashboard />} />
    <Route path="/admin/posts" element={<CreatePost />} />
    <Route path="/admin/manage" element={<AdminManage />} />
    <Route path="/admin/gallery" element={<CreateGallery />} />
    <Route path="/admin/videos" element={<CreateVideo />} />
    <Route path="/admin/sanctuary-hours" element={<SanctuaryHours />} />
    <Route path="/admin/visitor-photos" element={<VisitorPhotoManagement />} />
  </Route>
</Routes>

        </div>

        <Footer />
      </div>
      </SanctuaryStatusProvider>
    </BrowserRouter>
  );
}

export default App;
