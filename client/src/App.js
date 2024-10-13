
import { Route, Routes } from "react-router-dom";
import Hero from './components/Hero';
import AppointmentModal from "./components/AccountPage/AccountAddClient";
import Navbar from "./components/Navbar";
import AppointmentDetailsPage from "./components/AccountPage/AccountsDetailsPage";
import AdminDashboard from "./components/Admin/AdminDashboard";
import EngineerDetailsPage from "./components/EngineerPage/EngineerDetailsPage";
import Login from "./components/Authentication/Login";
import AccountantPage from './components/Admin/AccountantPage';
import EngineerPage from './components/Admin/EngineerPage';
import ChecklistPage from "./components/EngineerPage/ChecklistPage";

import QuotationGenerator from "./components/Pdf Generator/QuotationGenerator";
import { AuthProvider } from "./Store/AuthContext";
import PrivateRoute from "./PrivateRoute"; // Import PrivateRoute component
// import ServiceRequestPage from "./components/Admin/ServiceRequest";
import ResetPassword from "./components/Authentication/ResetPassword";
import ClientPage from "./components/Admin/ClientPage";
import MachinePage from "./components/Admin/MachinePage";
import AdminList from "./components/Admin/AdminList";
import QuotationPage from "./components/EngineerPage/QuotationPage";
import ServiceRequestDocPage from "./components/EngineerPage/ServiceRequestDocPage";
import ServiceadminRequestDocPage from "./components/Admin/ServiceRequestDocPage";

import QuotationAdminPage from "./components/Admin/QuotationAdminPage";
import ReportPage from "./components/Admin/ReportPage";

import TemplateManager from "./components/MessageTemplate/TemplateManager";
import EditQuotation from "./components/EngineerPage/EditQuotation";
import EditAdminQuotation from "./components/Admin/EditAdminQuotation";


function App() {
  // const role = localStorage.getItem("role");
  // console.log(role);
  return (
    <AuthProvider>
      <div>
        <Routes>
          <Route index path="/" element={<Hero />} />
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}

          {/* Admin */}
          <Route
            path="/admin"
            element={<PrivateRoute element={AdminDashboard} roles={["admin"]} />}
          />
            <Route
            path="/accountants"
            element={<PrivateRoute element={AccountantPage} roles={["admin"]} />}
          />
          <Route
            path="/engineer-list"
            element={<PrivateRoute element={EngineerPage} roles={["admin"]} />}
          />
          {/* <Route
            path="/service-request"
            element={<PrivateRoute element={ServiceRequestPage} roles={["admin"]} />}
          /> */}
          <Route
            path="/admin-service-record"
            element={<PrivateRoute element={ServiceadminRequestDocPage} roles={["admin"]} />}
          />
          <Route
            path="/admin-quotation-record"
            element={<PrivateRoute element={QuotationAdminPage} roles={["admin"]} />}
          />
          <Route
            path="/admin/quotations/edit/:id"
            element={<PrivateRoute element={EditAdminQuotation} roles={["admin"]} />}
          />
          <Route
            path="/report-page"
            element={<PrivateRoute element={ReportPage} roles={["admin"]} />}
          />

          {/* Accountant */}
          <Route
            path="/accountspage"
            element={<PrivateRoute element={AppointmentDetailsPage} roles={["accountant"]} />}
          />
          <Route
            path="/account-add-client"
            element={<PrivateRoute element={AppointmentModal} roles={["accountant"]} />}
          />

          {/* Engineer */}
          <Route
            path="/engineerservice"
            element={<PrivateRoute element={EngineerDetailsPage} roles={["engineer"]} />}
          />
          <Route
            path="/checklist"
            element={<PrivateRoute element={ChecklistPage} roles={["engineer"]} />}
          />
          
          
          <Route
            path="/quotation-generate"
            element={<PrivateRoute element={QuotationGenerator} roles={["engineer"]} />}
          />
          <Route
            path="/quotation-list"
            element={<PrivateRoute element={QuotationPage} roles={["engineer"]} />}
          />


          <Route
            path="/quotations/edit/:id"
            element={<PrivateRoute element={EditQuotation} roles={["engineer"]} />}
          />
          <Route
            path="/servicerequestcheck-list"
            element={<PrivateRoute element={ServiceRequestDocPage} roles={["engineer"]} />}
          />
          
        

          {/* PDF generation route, assuming anyone can access */}
      
          <Route path="/client-list" element={<ClientPage />} />
          <Route path="/machine-list" element={<MachinePage />} />
          <Route path="/admin-list" element={<AdminList />} />
          <Route path="/reset/:token" element={<ResetPassword />} />
         
          <Route path="/templatemanager" element={<TemplateManager />} />
         
          
         
          
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
