import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/lib/AuthContext';
import PageNotFound from './lib/PageNotFound';
import ScrollToTop from './components/ScrollToTop';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import NewMessage from '@/pages/NewMessage';
import Editor from '@/pages/Editor';
import MessageView from '@/pages/MessageView';
import History from '@/pages/History';
import Fleet from '@/pages/Fleet';
import Settings from '@/pages/Settings';
import Help from '@/pages/Help';

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/rediger" element={<NewMessage />} />
              <Route path="/rediger/:type" element={<Editor />} />
              <Route path="/message/:id" element={<MessageView />} />
              <Route path="/historique" element={<History />} />
              <Route path="/flotte" element={<Fleet />} />
              <Route path="/parametres" element={<Settings />} />
              <Route path="/aide" element={<Help />} />
            </Route>
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App