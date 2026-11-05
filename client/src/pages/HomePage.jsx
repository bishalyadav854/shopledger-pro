import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiFileText, FiUsers, FiDollarSign, FiBarChart2, FiShield, FiCloud, FiPrinter, FiSmartphone, FiArrowRight, FiCheckCircle, FiStar, FiTrendingUp, FiGrid } from 'react-icons/fi';

const features = [
  {
    icon: FiFileText,
    title: 'Smart Invoicing',
    description: 'Create professional invoices with auto-calculation, discounts, tax support, and multiple payment tracking.',
    color: 'from-indigo-500 to-purple-600',
  },
  {
    icon: FiUsers,
    title: 'Customer Management',
    description: 'Maintain customer ledger, track dues, view purchase history, and manage loyalty points effortlessly.',
    color: 'from-green-500 to-emerald-600',
  },
  {
    icon: FiDollarSign,
    title: 'Due & Payment Tracking',
    description: 'Real-time tracking of pending payments, partial payments, and automated due reminders.',
    color: 'from-orange-500 to-red-600',
  },
  {
    icon: FiBarChart2,
    title: 'Reports & Analytics',
    description: 'Comprehensive sales reports, customer insights, profit analysis, and business performance metrics.',
    color: 'from-blue-500 to-cyan-600',
  },
  {
    icon: FiPrinter,
    title: 'Print & PDF Ready',
    description: 'Print-ready invoices for A4 and thermal printers. Generate PDF invoices with QR codes.',
    color: 'from-pink-500 to-rose-600',
  },
  {
    icon: FiCloud,
    title: 'Cloud Sync',
    description: 'Access your data anywhere, anytime. Automatic cloud backup with secure authentication.',
    color: 'from-violet-500 to-purple-600',
  },
];

const stats = [
  { label: 'Invoices Generated', value: '10K+', icon: FiFileText },
  { label: 'Active Users', value: '500+', icon: FiUsers },
  { label: 'Transactions', value: '50K+', icon: FiDollarSign },
  { label: 'Uptime', value: '99.9%', icon: FiCloud },
];

const testimonials = [
  {
    name: 'Rajesh Kumar',
    role: 'Electronics Shop Owner',
    content: 'ShopLedger Pro transformed how I manage my business. The due tracking feature alone saved me hours every week.',
    rating: 5,
  },
  {
    name: 'Priya Sharma',
    role: 'Fashion Boutique Owner',
    content: 'The invoicing is super quick and professional. My customers love the digital receipts!',
    rating: 5,
  },
  {
    name: 'Amit Patel',
    role: 'Grocery Store Owner',
    content: 'Best investment for my shop. Customer management and reports help me make better business decisions.',
    rating: 5,
  },
];

export default function HomePage() {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                SL
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">ShopLedger</h1>
                <p className="text-xs text-slate-500">Pro</p>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="btn-primary text-sm flex items-center gap-2"
                >
                  <FiGrid className="w-4 h-4" />
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="btn-ghost text-sm"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary text-sm flex items-center gap-2"
                  >
                    Get Started
                    <FiArrowRight className="w-4 h-4" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="hero-gradient absolute inset-0" />
        <div className="bg-grid absolute inset-0 opacity-30" />
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-indigo-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-green-500/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-purple-500/10 rounded-full blur-3xl animate-float" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-8 animate-fade-in">
              <FiStar className="w-4 h-4" />
              Trusted by 500+ Shop Owners
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 animate-fade-in">
              <span className="gradient-text">Smart Billing</span>
              <br />
              <span className="text-white">For Modern Shopkeepers</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 animate-fade-in">
              The all-in-one billing, customer management, and due tracking system 
              designed to grow your business. Simple, powerful, and professional.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="btn-primary text-lg px-8 py-4 flex items-center gap-2"
                >
                  Go to Dashboard
                  <FiArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn-primary text-lg px-8 py-4 flex items-center gap-2"
                  >
                    Start Free Trial
                    <FiArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="btn-secondary text-lg px-8 py-4"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>

            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-slate-500 animate-fade-in">
              <span className="flex items-center gap-2">
                <FiCheckCircle className="text-green-500" />
                No credit card
              </span>
              <span className="flex items-center gap-2">
                <FiCheckCircle className="text-green-500" />
                Free setup
              </span>
              <span className="flex items-center gap-2">
                <FiCheckCircle className="text-green-500" />
                Cancel anytime
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center p-6 rounded-2xl glass card-hover">
                  <Icon className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
                  <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-500">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything You Need to{' '}
              <span className="gradient-text">Run Your Shop</span>
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Powerful features designed specifically for shopkeepers and small business owners.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="feature-glow p-6 rounded-2xl glass card-hover group"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-4">
              <FiStar className="w-4 h-4" />
              What Shop Owners Say
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Trusted by{' '}
              <span className="gradient-text">Shop Owners</span> Like You
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="p-6 rounded-2xl glass card-hover">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FiStar key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-slate-300 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{testimonial.name}</p>
                    <p className="text-xs text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="p-12 rounded-3xl glass border border-indigo-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-green-500/10 rounded-full blur-3xl" />
            
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 relative">
              Ready to Transform Your{' '}
              <span className="gradient-text">Shop Management</span>?
            </h2>
            <p className="text-lg text-slate-400 mb-8 max-w-xl mx-auto relative">
              Join 500+ shop owners who are already using ShopLedger Pro 
              to streamline their billing and grow their business.
            </p>
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2 relative"
              >
                Go to Dashboard
                <FiArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <Link
                to="/register"
                className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2 relative"
              >
                Get Started Free
                <FiArrowRight className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                SL
              </div>
              <span className="text-sm text-slate-500">
                © 2026 ShopLedger Pro. All rights reserved to Bishal Kumar Yadav.
              </span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-sm text-slate-500 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

