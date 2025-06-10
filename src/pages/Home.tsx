import { Link } from "wouter";
import { Zap } from "lucide-react";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <div className="hero min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="hero-content text-center">
          <div className="max-w-5xl mx-auto px-4">
            {/* Status Badge */}
            <div className="mb-6">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/20 border border-primary/30">
                <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                <span className=" font-medium text-sm text-white">
                  Alpha Launch
                </span>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8 text-main">
              Get insights from you documents with Grounded Sources.
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl lg:text-2xl text-slate-300 mb-10 leading-relaxed max-w-4xl mx-auto">
              Charts in chat coming soon!
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link
                href="/login"
                className="btn btn-primary btn-lg px-8 text-lg"
              >
                <Zap size={20} /> Login
              </Link>
            </div>

            {/* Scroll Indicator */}
            {/* <div className="mt-auto">
              <a
                href="#features"
                className="group inline-flex items-center text-slate-400 hover:text-white transition-colors"
              >
                Discover Features
                <ArrowDown className="w-5 h-5 ml-2 animate-bounce group-hover:animate-none transition-all" />
              </a>
            </div> */}
          </div>
        </div>
      </div>
      {/* Data You Can Trust Section */}

      {/* Built with Finance Professionals Section */}
      <div className="py-16 md:py-24 bg-base-100">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Designed for Reliability and Trust
          </h2>
          <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto text-base-content/80">
            Accuracy is paramount. Our system ensures grounded answers from your
            documents, uses precise calculation tools (future), provides
            verifiable sources, and guarantees data privacy through
            multi-tenancy.
          </p>{" "}
          <div className="flex justify-center space-x-4 md:space-x-8 mt-8 mb-4">
            <div className="w-24 h-12 md:w-32 md:h-16 bg-base-300 rounded-box flex items-center justify-center">
              <span className="text-base-content/50 text-sm">Logo</span>
            </div>
            <div className="w-24 h-12 md:w-32 md:h-16 bg-base-300 rounded-box flex items-center justify-center">
              <span className="text-base-content/50 text-sm">Logo</span>
            </div>
            <div className="w-24 h-12 md:w-32 md:h-16 bg-base-300 rounded-box flex items-center justify-center">
              <span className="text-base-content/50 text-sm">Logo</span>
            </div>
            <div className="w-24 h-12 md:w-32 md:h-16 bg-base-300 rounded-box flex items-center justify-center">
              <span className="text-base-content/50 text-sm">Logo</span>
            </div>
          </div>
          <p className="text-base-content/60">
            Future partners' logos will appear here
          </p>
        </div>
      </div>
    </>
  );
}
