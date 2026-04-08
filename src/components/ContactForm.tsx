'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface ContactFormProps {
  labels: {
    title: string;
    subtitle: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    submit: string;
    sending: string;
    success: string;
    error: string;
  };
}

export default function ContactForm({ labels }: ContactFormProps) {
  const [formState, setFormState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState('sending');
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Form submitted:', Object.fromEntries(formData));
      setFormState('success');
      form.reset();
    } catch {
      setFormState('error');
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-4">{labels.title}</h1>
        <p className="text-lg text-gray-600 mb-12">{labels.subtitle}</p>
      </motion.div>

      {formState === 'success' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 p-4 bg-green-50 text-green-800 rounded-lg"
        >
          {labels.success}
        </motion.div>
      )}

      {formState === 'error' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 p-4 bg-red-50 text-red-800 rounded-lg"
        >
          {labels.error}
        </motion.div>
      )}

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            {labels.name}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-shadow"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            {labels.email}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-shadow"
          />
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium mb-2">
            {labels.subject}
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-shadow"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-2">
            {labels.message}
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-shadow resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={formState === 'sending'}
          className="w-full bg-black text-white py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {formState === 'sending' ? labels.sending : labels.submit}
        </button>
      </motion.form>

      <div className="mt-16 pt-8 border-t border-gray-100">
        <p className="text-center text-gray-600">
          {labels.subtitle} <a href="mailto:contrasteditions@yahoo.fr" className="text-black font-medium hover:underline">
            contrasteditions@yahoo.fr
          </a>
        </p>
      </div>
    </div>
  );
}
