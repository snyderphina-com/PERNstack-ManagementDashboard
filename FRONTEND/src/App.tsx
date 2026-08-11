import { Authenticated, Refine } from "@refinedev/core";
import { DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { useEffect } from "react";
import { loadSavedTheme } from "@/lib/theme";
import routerProvider, {
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";
import { BrowserRouter, Outlet, Route, Routes } from "react-router";
import "./App.css";
import { Toaster }               from "./components/refine-ui/notification/toaster";
import { useNotificationProvider } from "./components/refine-ui/notification/use-notification-provider";
import { ThemeProvider }          from "./components/refine-ui/theme/theme-provider";
import { BookOpen, Building2, ClipboardCheck, GraduationCap, Home, ShieldCheck, Users } from "lucide-react";

// Pages
import SubjectsList     from "./pages/subjects/list";
import SubjectsCreate   from "./pages/subjects/create";
import SubjectsShow     from "./pages/subjects/show";
import Dashboard        from "./pages/dashboard";
import ClassesList      from "./pages/classes/list";
import ClassesCreate    from "./pages/classes/create";
import ClassesShow      from "./pages/classes/show";
import DepartmentsList  from "./pages/departments/list";
import DepartmentsCreate from "./pages/departments/create";
import DepartmentShow   from "./pages/departments/show";
import FacultyList      from "./pages/faculty/list";
import FacultyShow      from "./pages/faculty/show";
import EnrollmentsCreate from "./pages/enrollments/create";
import EnrollmentsJoin  from "./pages/enrollments/join";
import EnrollmentConfirm from "./pages/enrollments/confirm";
import { Login }        from "./pages/login";
import { Register }     from "./pages/register";
import PendingApproval  from "./pages/pending-approval";
import AdminInvitationsPage from "./pages/admin/invitations";


// Layout + providers
import { Layout }        from "./components/refine-ui/layout/layout";
import { dataProvider }  from "./providers/data";
import { authProvider }  from "./providers/auth";
import { RoleGuard }     from "./components/auth/RoleGuard";

function App() {
  useEffect(() => {
    loadSavedTheme();
  }, []);

  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ThemeProvider>
          <DevtoolsProvider>
            <Refine
              dataProvider={dataProvider}
              authProvider={authProvider}
              notificationProvider={useNotificationProvider()}
              routerProvider={routerProvider}
              options={{
                syncWithLocation:       true,
                warnWhenUnsavedChanges: true,
                projectId:              "kkWuv7-GgBIfw-P8CGy0",
                title: {
                  text: (
                    <>
                      SNYDER<sup className="text-xs">®</sup>
                    </>
                  ),
                  icon: (
                    <img
                      src="/logo.png"
                      alt="SNYDER"
                      className="h-8 w-8 min-w-8 shrink-0 rounded-md object-cover"
                    />
                  ),
                },
              }}
              resources={[
                {
                  name: "dashboard",
                  list: "/",
                  meta: { label: "Home", icon: <Home /> },
                },
                {
                  name: "subjects",
                  list:   "/subjects",
                  create: "/subjects/create",
                  show:   "/subjects/show/:id",
                  meta: { label: "Subjects", icon: <BookOpen /> },
                },
                {
                  name: "departments",
                  list:   "/departments",
                  show:   "/departments/show/:id",
                  create: "/departments/create",
                  meta: { label: "Departments", icon: <Building2 /> },
                },
                {
                  name: "users",
                  list: "/faculty",
                  show: "/faculty/show/:id",
                  meta: { label: "Faculty", icon: <Users /> },
                },
                {
                  name: "enrollments",
                  list:   "/enrollments/create",
                  create: "/enrollments/create",
                  meta: { label: "Enrollments", icon: <ClipboardCheck /> },
                },
                {
                  name: "classes",
                  list:   "/classes",
                  create: "/classes/create",
                  show:   "/classes/show/:id",
                  meta: { label: "Classes", icon: <GraduationCap /> },
                },
                {
                name: "admin/invitations",
                list:   "/admin/invitations",
                create: "/admin/invitations",
                meta: {
                label:  "Invitations",
                icon:   <ShieldCheck />, 
                hide:   false,
                },
              },
              ]}
            >
              <Routes>
                {/* ── Public routes ── */}
                <Route
                  element={
                    <Authenticated key="public-routes" fallback={<Outlet />}>
                      <NavigateToResource fallbackTo="/" />
                    </Authenticated>
                  }
                >
                  <Route path="/login"    element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Route>

                <Route path="admin">
                  <Route path="invitations" element={
                    <RoleGuard allowedRoles={["admin"]}>
                      <AdminInvitationsPage />
                    </RoleGuard>
                  } />
                </Route>

                <Route
                  path="/pending-approval"
                  element={
                    <Authenticated key="pending" fallback={<Login />}>
                      <PendingApproval />
                    </Authenticated>
                  }
                />

                {/* ── Protected app routes ── */}
                <Route
                  element={
                    <Authenticated key="private-routes" fallback={<Login />}>
                      <Layout>
                        <Outlet />
                      </Layout>
                    </Authenticated>
                  }
                >
                  {/* Shared dashboard — each role sees their own */}
                  <Route path="/" element={<Dashboard />} />

                  {/* Role-specific dashboard roots */}
                  <Route
                    path="/student/dashboard"
                    element={
                      <RoleGuard allowedRoles={["student"]}>
                        <Dashboard />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="/teacher/dashboard"
                    element={
                      <RoleGuard allowedRoles={["teacher", "admin"]}>
                        <Dashboard />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="/admin/dashboard"
                    element={
                      <RoleGuard allowedRoles={["admin"]}>
                        <Dashboard />
                      </RoleGuard>
                    }
                  />

                  {/* Resource routes */}
                  <Route path="subjects">
                    <Route index element={<SubjectsList />} />
                    <Route path="create" element={
                      <RoleGuard allowedRoles={["teacher", "admin"]}>
                        <SubjectsCreate />
                      </RoleGuard>
                    } />
                    <Route path="show/:id" element={<SubjectsShow />} />
                  </Route>

                  <Route path="departments">
                    <Route index element={<DepartmentsList />} />
                    <Route path="create" element={
                      <RoleGuard allowedRoles={["admin"]}>
                        <DepartmentsCreate />
                      </RoleGuard>
                    } />
                    <Route path="show/:id" element={<DepartmentShow />} />
                  </Route>

                  <Route path="faculty">
                    <Route index element={
                      <RoleGuard allowedRoles={["teacher", "admin"]}>
                        <FacultyList />
                      </RoleGuard>
                    } />
                    <Route path="show/:id" element={<FacultyShow />} />
                  </Route>

                  <Route path="enrollments">
                    <Route path="create"  element={<EnrollmentsCreate />} />
                    <Route path="join"    element={<EnrollmentsJoin />} />
                    <Route path="confirm" element={<EnrollmentConfirm />} />
                  </Route>

                  <Route path="classes">
                    <Route index element={<ClassesList />} />
                    <Route path="create" element={
                      <RoleGuard allowedRoles={["teacher", "admin"]}>
                        <ClassesCreate />
                      </RoleGuard>
                    } />
                    <Route path="show/:id" element={<ClassesShow />} />
                  </Route>
                </Route>
              </Routes>

              <Toaster />
              <RefineKbar />
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
          </DevtoolsProvider>
        </ThemeProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;