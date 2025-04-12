import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import AdjacentGigs from "@/pages/AdjacentGigs";
import LearningPaths from "@/pages/LearningPaths";
import FinancialTools from "@/pages/FinancialTools";
import Community from "@/pages/Community";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";
import SkillsAssessment from "@/pages/SkillsAssessment";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    onError: () => {
      setIsAuthenticated(false);
    },
    onSuccess: () => {
      setIsAuthenticated(true);
    },
    retry: false,
  });

  // Redirect to login if not authenticated
  const AuthenticatedRoute = ({ component: Component, ...props }: { component: React.ComponentType<any>, [key: string]: any }) => {
    if (isLoading) {
      return <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>;
    }

    if (!isAuthenticated && isAuthenticated !== null) {
      return <Login />;
    }

    return <Component {...props} />;
  };

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <div className="flex-grow">
        <Switch>
          <Route path="/" component={() => <AuthenticatedRoute component={Dashboard} />} />
          <Route path="/adjacent-gigs" component={() => <AuthenticatedRoute component={AdjacentGigs} />} />
          <Route path="/learning-paths" component={() => <AuthenticatedRoute component={LearningPaths} />} />
          <Route path="/financial-tools" component={() => <AuthenticatedRoute component={FinancialTools} />} />
          <Route path="/community" component={() => <AuthenticatedRoute component={Community} />} />
          <Route path="/profile" component={() => <AuthenticatedRoute component={Profile} />} />
          <Route path="/skills-assessment" component={() => <AuthenticatedRoute component={SkillsAssessment} />} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <Footer />
      <Toaster />
    </div>
  );
}

export default App;
