import { Link } from "wouter";
import { Zap, CheckCircle } from "lucide-react"; // Updated import
import tableChatScreenshot from "@/assets/table-chat-screenshot.png";
import chartChatScreenshot from "@/assets/chart-chat-screenshot.png";

export default function Home() {
  return (
    <>
      {/* Hero Section - Updated */}
      <div className="hero min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="hero-content container mx-auto px-6 py-16 flex flex-col lg:flex-row items-center lg:justify-around">
          {/* Text Content */}
          <div className="lg:w-1/2 xl:w-2/5 text-center lg:text-left mb-12 lg:mb-0">
            <div className="mb-4">
              <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-sky-500/20 text-sky-300 border border-sky-500/30">
                <Zap size={16} className="w-4 h-4 mr-2" />
                Alpha Launch: Now with Interactive Charts!
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-main">
              Instant Financial Insights, Visually.
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 mb-8 leading-relaxed">
              Transform your documents into actionable intelligence. Get clear
              summaries, dynamic charts, and organized tables—all within an
              intuitive chat interface.
            </p>
            <Link
              href="/login"
              className="btn btn-primary btn-lg px-10 py-3 text-lg font-semibold flex items-center justify-center lg:justify-start w-auto sm:w-auto"
            >
              <Zap size={22} className="mr-2.5" /> Explore Features
            </Link>
            {/* Updated Contact Section */}
            <div className="mt-8 lg:text-left text-center text-base">
              <p className="mb-2">
                Building this for you and would love your feedback!
              </p>
              <p className="mb-3">
                Help us shape the products future to work for you:
              </p>
              <a
                href="mailto:owner@stackifier.com"
                className="font-semibold text-sky-400 hover:text-sky-300 text-lg block lg:inline-block"
              >
                owner@stackifier.com
              </a>
            </div>
          </div>

          {/* Image Content */}
          <div className="lg:w-1/2 xl:w-3/5 flex justify-center lg:pl-10">
            <img
              src={chartChatScreenshot}
              alt="AI CFO Chat Interface with Interactive Chart"
              className="rounded-xl shadow-2xl w-full max-w-2xl object-contain"
            />
          </div>
        </div>
      </div>

      {/* Features Showcase Section - Updated (Focus on Table View) */}
      <div
        id="features"
        className="py-16 md:py-24 bg-base-200 text-base-content"
      >
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row-reverse items-center gap-10 lg:gap-16">
            {/* Text for Table View Feature */}
            <div className="md:w-1/2 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Structured Data, Effortlessly
              </h2>
              <p className="text-lg md:text-xl mb-6 text-base-content/80">
                Say goodbye to manual data sifting. Our AI intelligently extracts
                and organizes financial data into clean, easy-to-understand tables
                directly within your chat.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 shrink-0" />
                  <span>
                    Automated extraction from PDFs
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 shrink-0" />
                  <span>Clear presentation of key financial metrics</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-primary mr-3 shrink-0" />
                  <span>Quickly identify trends and anomalies</span>
                </li>
              </ul>
              <Link
                href="/login" // Or a more specific link like /features/tables
                className="btn btn-secondary btn-md px-8 text-md"
              >
                See Tables in Action
              </Link>
            </div>
            {/* Image for Table View */}
            <div className="md:w-1/2 flex justify-center">
              <img
                src={tableChatScreenshot}
                alt="Chat with Structured Table View"
                className="rounded-xl shadow-xl w-full max-w-xl object-contain"
              />
            </div>
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
            Accuracy is paramount. Every insight and piece of data presented in
            chat is directly backed by your uploaded documents, ensuring verifiable
            sources and truly grounded answers. Combined with precise calculation
            tools (coming soon) and robust data privacy through multi-tenancy, you
            can confidently rely on the financial intelligence provided.
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
