import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ModeToggle";
import { ArrowRight, Shield, Users, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-semibold">
            <div className="bg-primary text-primary-foreground p-2 rounded">
              <span className="font-bold">PromisePay</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <ModeToggle />
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-32 text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
          Decentralized Escrow for a{" "}
          <span className="text-primary">Borderless Workforce</span>
        </h1>
        <p className="mx-auto mt-8 max-w-[700px] text-lg text-muted-foreground md:text-xl">
          Secure payments, transparent contracts, and seamless collaboration for freelancers and clients worldwide.
        </p>
        <div className="mt-12 flex justify-center gap-6">
          <Link href="/sign-up">
            <Button size="lg" className="gap-2">
              Get Started <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/about">
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-32">
        <div className="grid gap-12 md:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 rounded-full bg-primary/10 p-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-4 text-2xl font-bold">Secure Escrow</h3>
            <p className="text-muted-foreground">
              Your funds are protected until work is completed to your satisfaction.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 rounded-full bg-primary/10 p-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-4 text-2xl font-bold">Global Network</h3>
            <p className="text-muted-foreground">
              Connect with talented professionals from around the world.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 rounded-full bg-primary/10 p-4">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-4 text-2xl font-bold">Fast Payments</h3>
            <p className="text-muted-foreground">
              Get paid quickly and securely with our streamlined payment system.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-32">
        <div className="rounded-xl bg-primary/5 p-12 text-center">
          <h2 className="text-4xl font-bold">Ready to Get Started?</h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Join thousands of freelancers and clients who trust PromisePay for their projects.
          </p>
          <div className="mt-10 flex justify-center gap-6">
            <Link href="/sign-up">
              <Button size="lg" className="gap-2">
                Create Account <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 PromisePay. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}