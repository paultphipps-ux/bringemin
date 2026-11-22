import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "sonner";
import { AuthProvider } from "@/hooks/useAuth";
import { Layout } from "@/components/site/Layout";
import Home from "@/pages/Home";
import Services from "@/pages/Services";
import ServiceDetail from "@/pages/ServiceDetail";
import BailBond from "@/pages/BailBond";
import Attorneys from "@/pages/Attorneys";
import About from "@/pages/About";
import Faq from "@/pages/Faq";
import Contact from "@/pages/Contact";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Privacy from "@/pages/Privacy";
import NotFound from "@/pages/NotFound";

// Admin is code-split so public visitors never download the editor.
const AdminLayout = lazy(() => import("@/pages/admin/AdminLayout"));
const Login = lazy(() => import("@/pages/admin/Login"));
const ResetPassword = lazy(() => import("@/pages/admin/ResetPassword"));
const Dashboard = lazy(() => import("@/pages/admin/Dashboard"));
const LeadsPage = lazy(() => import("@/pages/admin/Leads"));
const Posts = lazy(() => import("@/pages/admin/Posts"));
const PostEditor = lazy(() => import("@/pages/admin/PostEditor"));
const PageContent = lazy(() => import("@/pages/admin/PageContent"));
const Settings = lazy(() => import("@/pages/admin/Settings"));
const MediaLibrary = lazy(() => import("@/pages/admin/MediaLibrary"));
const Users = lazy(() => import("@/pages/admin/Users"));
const ServicesAdmin = lazy(() => import("@/pages/admin/resources").then((m) => ({ default: m.ServicesAdmin })));
const TeamAdmin = lazy(() => import("@/pages/admin/resources").then((m) => ({ default: m.TeamAdmin })));
const TestimonialsAdmin = lazy(() => import("@/pages/admin/resources").then((m) => ({ default: m.TestimonialsAdmin })));
const FaqsAdmin = lazy(() => import("@/pages/admin/resources").then((m) => ({ default: m.FaqsAdmin })));
const CategoriesAdmin = lazy(() => import("@/pages/admin/resources").then((m) => ({ default: m.CategoriesAdmin })));

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 60_000, retry: 1 } } });

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<div className="p-10 text-bone-dim">Loading…</div>}>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/services/:slug" element={<ServiceDetail />} />
                  <Route path="/bail-bond-agents" element={<BailBond />} />
                  <Route path="/attorneys" element={<Attorneys />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/faq" element={<Faq />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/category/:category" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
                <Route path="/admin/login" element={<Login />} />
                <Route path="/admin/reset-password" element={<ResetPassword />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="leads" element={<LeadsPage kind="leads" />} />
                  <Route path="skips" element={<LeadsPage kind="skips" />} />
                  <Route path="posts" element={<Posts />} />
                  <Route path="posts/:id" element={<PostEditor />} />
                  <Route path="categories" element={<CategoriesAdmin />} />
                  <Route path="pages" element={<PageContent />} />
                  <Route path="services" element={<ServicesAdmin />} />
                  <Route path="team" element={<TeamAdmin />} />
                  <Route path="testimonials" element={<TestimonialsAdmin />} />
                  <Route path="faqs" element={<FaqsAdmin />} />
                  <Route path="media" element={<MediaLibrary />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="users" element={<Users />} />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
