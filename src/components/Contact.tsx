import React, { useState } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { translations } from '../data/translations';
import { MapPin, Mail, Clock, Send } from 'lucide-react';

const Contact: React.FC = () => {
  console.log('Contact component rendering...');
  
  const { currentLanguage, t } = useLanguage();
  console.log('Language:', currentLanguage);
  
  console.log('Translations:', t);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Thank you for your message! We will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">

          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {t.contact?.title || 'Get in Touch'}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t.contact?.subtitle || 'Have questions about investing? We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t.contact?.contactInfo || 'Contact Information'}
              </h2>
              
              <div className="space-y-6">
                {/* Office Address */}
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                    <MapPin className="h-6 w-6 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {t.contact?.officeAddress || 'Office Address'}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      A106, World Of Mother, Behind Jai Ganesh Vision,<br />
                      Akurdi, Pune 411035
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-3 rounded-lg flex-shrink-0">
                    <Mail className="h-6 w-6 text-green-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {t.contact?.email || 'Email'}
                    </h3>
                    <a 
                      href="mailto:wealth@investright.club" 
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      wealth@investright.club
                    </a>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 p-3 rounded-lg flex-shrink-0">
                    <Clock className="h-6 w-6 text-purple-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {t.contact?.businessHours || 'Business Hours'}
                    </h3>
                    <p className="text-gray-600">
                      {t.contact?.hours || 'Monday - Friday: 9:00 AM - 6:00 PM'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Maps - Hidden as requested */}
            {/* 
            <div className="rounded-lg overflow-hidden shadow-lg">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3780.349308550257!2d73.77971248193175!3d18.64831473727079!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2b9dbbfffffff%3A0x43f6def612a3f49d!2sAkurdi%2C%20Pune%2C%20Maharashtra%2C%20India!5e0!3m2!1sen!2sin!4v1755864957739!5m2!1sen!2sin" 
                width="100%" 
                height="400" 
                style={{border:0}} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="InvestRight Office Location - Akurdi, Pune"
                className="w-full h-64"
              ></iframe>
            </div>
            */}
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t.contact?.sendMessage || 'Send us a Message'}
            </h2>
            

            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    {t.contact?.name || 'Full Name'}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder={t.contact?.namePlaceholder || 'Enter your full name'}
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    {t.contact?.emailLabel || 'Email Address'}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder={t.contact?.emailPlaceholder || 'Enter your email'}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.contact?.subject || 'Subject'}
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder={t.contact?.subjectPlaceholder || 'What is this about?'}
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.contact?.message || 'Message'}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                  placeholder={t.contact?.messagePlaceholder || 'Tell us more about your inquiry...'}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {t.contact?.sending || 'Sending...'}
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    {t.contact?.sendButton || 'Send Message'}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
