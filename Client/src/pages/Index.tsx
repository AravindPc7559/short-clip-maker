import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Upload, Activity, PlayCircle, ArrowRight, CheckCircle, Star } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Video className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">VideoAI</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button variant="gradient">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="relative py-20 lg:py-32 overflow-hidden"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 hero-gradient opacity-95" />
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            Transform Videos into
            <span className="block text-primary-glow">Viral Short Clips</span>
          </h2>
          <p className="text-xl lg:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            AI-powered video editing that turns your long-form content into engaging short clips ready for social media
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button variant="hero" size="lg" className="text-lg px-8">
                Start Creating Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/dashboard/upload">
              <Button variant="outline" size="lg" className="text-lg px-8 glass">
                Try Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl lg:text-4xl font-bold mb-4">Powerful Features</h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to create viral content from your existing videos
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="transition-smooth hover:shadow-lg border-0 shadow-md">
              <CardHeader>
                <Upload className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Easy Upload</CardTitle>
                <CardDescription>
                  Upload videos directly or paste YouTube links for instant processing
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="transition-smooth hover:shadow-lg border-0 shadow-md">
              <CardHeader>
                <Activity className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Real-time Processing</CardTitle>
                <CardDescription>
                  Track your video processing status with live updates and progress indicators
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="transition-smooth hover:shadow-lg border-0 shadow-md">
              <CardHeader>
                <PlayCircle className="w-12 h-12 text-primary mb-4" />
                <CardTitle>Instant Results</CardTitle>
                <CardDescription>
                  Download multiple short clips ready for social media platforms
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <h3 className="text-3xl lg:text-4xl font-bold mb-6">
                Why Choose VideoAI?
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-success mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-2">AI-Powered Editing</h4>
                    <p className="text-muted-foreground">
                      Advanced algorithms identify the best moments and create engaging clips automatically
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-success mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-2">Save Hours of Work</h4>
                    <p className="text-muted-foreground">
                      What used to take hours of manual editing now happens in minutes
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-success mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold mb-2">Multiple Formats</h4>
                    <p className="text-muted-foreground">
                      Support for all major video formats and direct YouTube integration
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:text-center">
              <div className="inline-block p-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl">
                <Star className="w-16 h-16 text-primary mx-auto mb-4" />
                <h4 className="text-2xl font-bold mb-2">4.8/5 Rating</h4>
                <p className="text-muted-foreground">From 1000+ satisfied creators</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Transform Your Videos?
          </h3>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of creators who are already using VideoAI to grow their audience
          </p>
          <Link to="/signup">
            <Button variant="gradient" size="lg" className="text-lg px-8">
              Start Free Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <Video className="w-6 h-6 text-primary" />
              <span className="font-semibold">VideoAI</span>
            </div>
            <p className="text-muted-foreground text-center md:text-right">
              © 2024 VideoAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
