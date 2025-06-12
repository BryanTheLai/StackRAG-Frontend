import { Link } from "wouter";
import { Zap, CheckCircle } from "lucide-react";
import tableChatScreenshot from "@/assets/table-chat-screenshot.png";
import chartChatScreenshot from "@/assets/chart-chat-screenshot.png";

export default function Home() {
  return (
    <>
      <div
        id="home"
        className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 "
      >
        <div className="container mx-auto px-6 py-16">
          <div className="flex flex-col lg:flex-row items-center min-h-[80vh]">
            {/* Text Content */}
            <div className="lg:w-1/2 text-center lg:text-left  lg:mb-0 lg:pr-12">
              {/* Update Badge */}
              <div className="mb-6">
                <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-sky-500/20 text-sky-100 border border-sky-500/30">
                  <Zap size={16} className="w-4 h-4 mr-2" />
                  Alpha Launch: Now with Interactive Charts!
                </div>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
                  Stackifier
                </span>{" "}
              </h1>

              {/* Subtitle */}
              <p className="text-xl text-slate-300 mb-8 leading-relaxed max-w-2xl">
                Stop drowning in spreadsheets. Upload your financial documents
                and get instant summaries, interactive charts, and organized
                tables—all through seamless integration and intelligent
                automation.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link
                  href="/login"
                  className="btn btn-primary btn-lg px-8 py-4 text-lg font-semibold"
                >
                  <Zap size={22} className="mr-2" /> Login
                </Link>
              </div>

              {/* Contact Section */}
              <div className="text-left">
                <p className="text-slate-400 mb-2">
                  Need a custom solution? We build{" "}
                  <span className="font-semibold text-white">
                    tailored automation tools
                  </span>{" "}
                  for your workflow.
                </p>
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=stackifier@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-sky-400 hover:text-sky-300 transition-colors"
                >
                  stackifier@gmail.com
                </a>
              </div>
            </div>

            {/* Image Content */}
            <div className="lg:w-1/2 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 to-blue-500/20 rounded-2xl blur-3xl"></div>
                <img
                  src={chartChatScreenshot || "/placeholder.svg"}
                  alt="AI-powered financial dashboard with interactive charts"
                  className="relative rounded-2xl shadow-2xl w-full max-w-2xl object-contain border border-slate-700/50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            {/* Text Content */}
            <div className="lg:w-1/2 text-center lg:text-left">
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-slate-900">
                Structured Data,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-600">
                  Effortlessly
                </span>
              </h2>
              <p className="text-xl mb-8 text-slate-600 leading-relaxed">
                Say goodbye to manual data sifting. Our AI intelligently
                extracts and organizes financial data into clean,
                easy-to-understand tables directly within your chat interface.
              </p>

              <ul className="space-y-4 mb-10">
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-sky-600 mr-4 shrink-0 mt-1" />
                  <span className="text-lg text-slate-700">
                    Automated extraction from PDFs and documents
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-sky-600 mr-4 shrink-0 mt-1" />
                  <span className="text-lg text-slate-700">
                    Clear presentation of key financial metrics
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-sky-600 mr-4 shrink-0 mt-1" />
                  <span className="text-lg text-slate-700">
                    Instantly identify trends and anomalies
                  </span>
                </li>
              </ul>

              <Link
                href="/login"
                className="btn btn-primary btn-lg px-8 py-3 text-lg"
              >
                See Tables in Action
              </Link>
            </div>

            {/* Image Content */}
            <div className="lg:w-1/2 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 to-blue-500/10 rounded-2xl blur-2xl"></div>
                <img
                  src={tableChatScreenshot || "/placeholder.svg"}
                  alt="Structured table view in chat interface"
                  className="relative rounded-2xl shadow-xl w-full max-w-xl object-contain border border-slate-200"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust & Reliability Section */}
      <div id="about" className="py-24 bg-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-slate-900">
            Designed for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-600">
              Reliability and Trust
            </span>
          </h2>
          <p className="text-xl mb-16 max-w-4xl mx-auto text-slate-600 leading-relaxed">
            Accuracy is paramount. Every insight and piece of data presented is
            directly backed by your uploaded documents, ensuring verifiable
            sources and truly grounded answers. Combined with precise
            calculation tools and robust data privacy through multi-tenancy, you
            can confidently rely on the financial intelligence provided.
          </p>

          {/* Partners Section */}
          <div id="contact" className="mt-16">
            <h3 className="text-2xl font-semibold mb-8 text-slate-500">
              Our Partners
            </h3>
            <div className="flex justify-center items-center space-x-12 flex-wrap gap-8">
              <div className="flex items-center justify-center w-32 h-16 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                <span className="text-2xl font-bold text-slate-400"></span>
              </div>
              <div className="flex items-center justify-center w-32 h-16 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                <span className="text-2xl font-bold text-slate-400"></span>
              </div>
              <div className="flex items-center justify-center w-32 h-16 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                <span className="text-2xl font-bold text-slate-400"></span>
              </div>
              <div className="flex items-center justify-center w-32 h-16 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                <span className="text-2xl font-bold text-slate-400"></span>
              </div>
              <div className="flex items-center justify-center w-32 h-16 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                <span className="text-2xl font-bold text-slate-400"></span>
              </div>
            </div>
            <p className="text-slate-400 mt-6">
              Future partners' logos will appear here
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
