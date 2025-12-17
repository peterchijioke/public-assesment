import Navbar from "@/components/Navbar";
import { Building, Users, Award, TrendingUp } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      
      <div className="pt-24 pb-16 px-4 w-full">
        <div className="container mx-auto max-w-4xl w-full">
          <h1 className="text-5xl font-bold mb-6">About Globassets</h1>
          <p className="text-xl text-muted-foreground mb-12">
            Your trusted partner in Nigerian real estate
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <div className="bg-card p-8 rounded-xl border border-border">
              <Building className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">20K+ Properties</h3>
              <p className="text-muted-foreground">
                Verified listings across Nigeria
              </p>
            </div>
            
            <div className="bg-card p-8 rounded-xl border border-border">
              <Users className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">7M+ Deals</h3>
              <p className="text-muted-foreground">
                Successfully closed transactions
              </p>
            </div>
            
            <div className="bg-card p-8 rounded-xl border border-border">
              <Award className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Trusted Platform</h3>
              <p className="text-muted-foreground">
                Industry-leading verification
              </p>
            </div>
            
            <div className="bg-card p-8 rounded-xl border border-border">
              <TrendingUp className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Growing Network</h3>
              <p className="text-muted-foreground">
                Expanding across all states
              </p>
            </div>
          </div>
          
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-muted-foreground mb-6">
              To make property transactions in Nigeria simple, transparent, and accessible to everyone. 
              We connect property seekers with verified listings and trusted property owners across the nation.
            </p>
            
            <h2 className="text-3xl font-bold mb-4">Why Choose Us</h2>
            <p className="text-muted-foreground">
              Our platform combines cutting-edge technology with deep local knowledge to provide the best 
              real estate experience in Nigeria. Every property is verified, every transaction is secure, 
              and every user is supported throughout their journey.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
