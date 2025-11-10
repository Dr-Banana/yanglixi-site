import Layout from '@/components/Layout';
import { getCookieName, verifySessionToken } from '@/lib/auth';
import type { GetServerSideProps } from 'next';

interface ContactProps {
  isAdmin: boolean;
}

export default function Contact({ isAdmin }: ContactProps) {
  return (
    <Layout title="Contact - Lixi's Kitchen" isAdmin={isAdmin}>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-sage-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-6xl font-serif font-bold mb-6">
              Let's Connect
            </h1>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              I'd love to hear from you! Share your cooking experiences, ask questions, or just say hello.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:yanglixi2018@gmail.com"
                className="bg-white text-primary-700 px-8 py-3 rounded-full font-semibold hover:bg-primary-50 transition-colors inline-flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Email
              </a>
              <a 
                href="https://www.instagram.com/ciciyang_0102?igsh=NTc4MTIwNjQ2YQ=="
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-primary-700 transition-colors inline-flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Instagram
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-neutral-800 mb-2">Email</h3>
            <p className="text-neutral-600 text-sm">yanglixi2018@gmail.com</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="font-semibold text-neutral-800 mb-2">Phone</h3>
            <p className="text-neutral-600 text-sm">614-260-0911</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-neutral-800 mb-2">Location</h3>
            <p className="text-neutral-600 text-sm">Los Angeles, CA</p>
          </div>

          <a 
            href="https://www.instagram.com/ciciyang_0102?igsh=NTc4MTIwNjQ2YQ==" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow block"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>
            <h3 className="font-semibold text-neutral-800 mb-2">Instagram</h3>
            <p className="text-neutral-600 text-sm">@ciciyang_0102</p>
          </a>
        </div>

        {/* Skills & Certifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Skills */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="text-2xl font-serif font-bold text-neutral-800">Skills</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-primary-50 rounded-lg p-3 text-center">
                <span className="text-sm font-medium text-primary-700">Kitchen Equipment</span>
              </div>
              <div className="bg-sage-50 rounded-lg p-3 text-center">
                <span className="text-sm font-medium text-sage-700">Knife Skills</span>
              </div>
              <div className="bg-primary-50 rounded-lg p-3 text-center">
                <span className="text-sm font-medium text-primary-700">Protein Temperatures</span>
              </div>
              <div className="bg-sage-50 rounded-lg p-3 text-center">
                <span className="text-sm font-medium text-sage-700">Mother Sauces</span>
              </div>
              <div className="bg-primary-50 rounded-lg p-3 text-center">
                <span className="text-sm font-medium text-primary-700">Food Safety</span>
              </div>
              <div className="bg-sage-50 rounded-lg p-3 text-center">
                <span className="text-sm font-medium text-sage-700">Time Management</span>
              </div>
              <div className="bg-primary-50 rounded-lg p-3 text-center">
                <span className="text-sm font-medium text-primary-700">Team Collaboration</span>
              </div>
              <div className="bg-sage-50 rounded-lg p-3 text-center">
                <span className="text-sm font-medium text-sage-700">Microsoft Office</span>
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-sage-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h2 className="text-2xl font-serif font-bold text-neutral-800">Certifications</h2>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <div>
                  <h3 className="font-semibold text-neutral-800">SERV Safe - California Food Handler's Certificate</h3>
                  <p className="text-sm text-neutral-600">Received February 2025</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Background */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Education */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-8 h-full">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h2 className="text-2xl font-serif font-bold text-neutral-800">Education</h2>
              </div>
              
              <div className="space-y-6">
                <div className="border-l-4 border-primary-200 pl-4">
                  <h3 className="font-semibold text-neutral-800 mb-1">Culinary Arts Diploma</h3>
                  <p className="text-neutral-600 text-sm mb-1">Institution of Culinary Education Los Angeles</p>
                  <p className="text-xs text-neutral-500">Pasadena, CA • Currently Enrolled</p>
                </div>
                
                <div className="border-l-4 border-sage-200 pl-4">
                  <h3 className="font-semibold text-neutral-800 mb-1">BS Business Administration</h3>
                  <p className="text-neutral-600 text-sm mb-1">The Ohio State University</p>
                  <p className="text-xs text-neutral-500">Finance Specialization</p>
                  <p className="text-xs text-neutral-500">2018 - 2023</p>
                </div>
                
                <div className="border-l-4 border-primary-200 pl-4">
                  <h3 className="font-semibold text-neutral-800 mb-1">BS Mathematics</h3>
                  <p className="text-neutral-600 text-sm mb-1">The Ohio State University</p>
                  <p className="text-xs text-neutral-500">2018 - 2022</p>
                </div>
              </div>
            </div>
          </div>

          {/* Experience */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8 h-full">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-sage-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                  </svg>
                </div>
                <h2 className="text-2xl font-serif font-bold text-neutral-800">Experience</h2>
              </div>
              
              <div className="space-y-6">
                <div className="bg-primary-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-neutral-800">Culinary Volunteer</h3>
                    <span className="text-xs text-neutral-500">Oct 2025</span>
                  </div>
                  <p className="text-neutral-600 text-sm mb-2">LA Loves Alex's Lemonade Stand</p>
                  <p className="text-xs text-neutral-600">Executed plating and food running, delivered 30 pizzas (240 portions) with refined presentation. Earned recognition for professionalism under pressure.</p>
                </div>
                
                <div className="bg-sage-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-neutral-800">Accounting Clerk</h3>
                    <span className="text-xs text-neutral-500">Mar 2024 - Jan 2025</span>
                  </div>
                  <p className="text-neutral-600 text-sm mb-2">Drew Child Development Corporation</p>
                  <p className="text-xs text-neutral-600">Managed high-volume transactions and collaborated with vendors for inventory price comparisons.</p>
                </div>
                
                <div className="bg-primary-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-neutral-800">Financial Admin Assistant</h3>
                    <span className="text-xs text-neutral-500">Aug 2023 - Nov 2023</span>
                  </div>
                  <p className="text-neutral-600 text-sm mb-2">Creating Central Ohio Futures</p>
                  <p className="text-xs text-neutral-600">Utilized Excel to analyze spending patterns, transferable skills for food cost tracking.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Download Resume */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-primary-500 to-sage-500 rounded-2xl p-8 text-white">
            <h3 className="text-3xl font-serif font-bold mb-4">
              Download My Resume
            </h3>
            <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
              Get a detailed copy of my professional background, culinary education, and work experience.
            </p>
            <a 
              href="/resume/Lixi Yang culinary.pdf" 
              download="Lixi Yang culinary.pdf"
              className="inline-flex items-center px-8 py-4 bg-white text-primary-600 rounded-full font-semibold hover:bg-primary-50 transition-colors shadow-lg"
            >
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF Resume
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  // Check if admin session exists
  const cookie = ctx.req.headers.cookie || '';
  const token = cookie.split(';').map(s => s.trim()).find(s => s.startsWith(getCookieName() + '='))?.split('=')[1];
  const session = token ? await verifySessionToken(token) : null;
  const isAdmin = !!session;

  return { props: { isAdmin } };
};