import { Link } from "wouter";
import { Zap, CheckCircle } from "lucide-react";
import tableChatScreenshot from "@/assets/table-chat-screenshot.png";
import chartChatScreenshot from "@/assets/chart-chat-screenshot.png";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white overflow-x-hidden">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col">
        <div className="container mx-auto px-4 py-12 md:py-20 flex flex-col items-center text-center">
          {/* Alpha Launch Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-sky-500/20 text-sky-100 border border-sky-500/30 mb-8">
            <Zap size={16} className="w-4 h-4 mr-2" />
            Alpha Launch: Auto-forecast coming soon!
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl font-bold text-sky-400 mb-6">
            Stackifier
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-3xl">
            Stop drowning in spreadsheets. Upload your financial documents and
            get instant summaries, interactive charts, and organized tables—all
            through seamless integration and intelligent automation.
          </p>

          {/* CTA Button */}
          <Link href="/login" className="btn btn-primary btn-lg px-10 mb-12">
            <Zap size={20} className="mr-2" /> Login
          </Link>

          {/* Custom Solution Text */}
          <div className="text-center mb-10">
            <p className="text-slate-400 mb-2">
              Need a custom solution? We build{" "}
              <span className="font-semibold text-white">
                tailored automation tools
              </span>{" "}
              for your workflow.
            </p>
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=stackifier@gmail.com"
              className="font-semibold text-sky-400 hover:text-sky-300 transition-colors"
            >
              stackifier@gmail.com
            </a>
          </div>

          {/* Chart Image */}
          <div className="w-full max-w-4xl mx-auto relative">
            <div className="absolute inset-0 bg-sky-500/20 rounded-xl blur-2xl"></div>
            <img
              src={chartChatScreenshot || "/placeholder.svg"}
              alt="AI CFO Chat Interface with Interactive Chart"
              className="relative rounded-xl shadow-2xl w-full border border-slate-700/50"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-slate-800 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            {/* Text Content */}
            <div className="md:w-1/2 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Structured Data, Effortlessly
              </h2>
              <p className="text-lg md:text-xl mb-8 text-slate-300">
                Say goodbye to manual data sifting. Our AI intelligently
                extracts and organizes financial data into clean,
                easy-to-understand tables directly within your chat.
              </p>
              <ul className="space-y-4 mb-8 text-left max-w-md mx-auto md:mx-0">
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-sky-400 mr-3 shrink-0 mt-0.5" />
                  <span className="text-slate-200">
                    Automated extraction from PDFs
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-sky-400 mr-3 shrink-0 mt-0.5" />
                  <span className="text-slate-200">
                    Clear presentation of key financial metrics
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-sky-400 mr-3 shrink-0 mt-0.5" />
                  <span className="text-slate-200">
                    Quickly identify trends and anomalies
                  </span>
                </li>
              </ul>
            </div>

            {/* Image */}
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-xl">
                <div className="absolute inset-0 bg-sky-500/10 rounded-xl blur-xl"></div>
                <img
                  src={tableChatScreenshot || "/placeholder.svg"}
                  alt="Chat with Structured Table View"
                  className="relative rounded-xl shadow-xl w-full border border-slate-700/50"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section id="about" className="bg-white text-slate-800 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Designed for{" "}
            <span className="text-sky-500">Reliability and Trust</span>
          </h2>
          <p className="text-lg md:text-xl mb-12 max-w-3xl mx-auto text-slate-600">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-center">
                  <div className="aspect-[3/2] bg-slate-100 rounded-lg flex items-center justify-center w-full max-w-[180px] sm:max-w-[220px] md:max-w-none">
                    <span className="text-slate-400 font-medium">
                      Company {i}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-slate-400 mt-8">
              Future partners' logos will appear here
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center space-x-6 mb-6">
            <a
              href="#"
              className="text-slate-400 hover:text-sky-400 transition-colors"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-slate-400 hover:text-sky-400 transition-colors"
            >
              Privacy
            </a>
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=stackifier@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-sky-400 transition-colors"
            >
              Contact
            </a>
          </div>
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Stackifier. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
