'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface ManuscriptFormProps {
  labels: {
    authorName: string;
    email: string;
    manuscriptTitle: string;
    description: string;
    fileLabel: string;
    submit: string;
    sending: string;
    success: string;
    error: string;
  };
}

export default function ManuscriptForm({ labels }: ManuscriptFormProps) {
  const [formState, setFormState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState('sending');
    
    // Pour une vraie application, vous enverrez FormData avec un fichier multipart vers une API
    // const form = e.currentTarget;
    // const formData = new FormData(form);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFormState('success');
      e.currentTarget.reset();
    } catch {
      setFormState('error');
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      {formState === 'success' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-center"
        >
          {labels.success}
        </motion.div>
      )}

      {formState === 'error' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 p-4 bg-red-50 text-red-800 border border-red-200 rounded-lg text-center"
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
          <label htmlFor="authorName" className="block text-sm font-medium mb-2">
            {labels.authorName}
          </label>
          <input
            type="text"
            id="authorName"
            name="authorName"
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
          <label htmlFor="manuscriptTitle" className="block text-sm font-medium mb-2">
            {labels.manuscriptTitle}
          </label>
          <input
            type="text"
            id="manuscriptTitle"
            name="manuscriptTitle"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-shadow"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            {labels.description}
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            required
            placeholder="Une courte présentation de l'œuvre..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-shadow resize-vertical"
          />
        </div>

        <div>
          <label htmlFor="manuscriptFile" className="block text-sm font-medium mb-2">
            {labels.fileLabel}
          </label>
          <input
            type="file"
            id="manuscriptFile"
            name="manuscriptFile"
            accept=".pdf,.doc,.docx"
            required
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-shadow cursor-pointer file:cursor-pointer file:border-0 file:py-2 file:px-4 file:mr-4 file:bg-slate-100 file:hover:bg-slate-200 file:rounded-md file:text-sm file:font-semibold"
          />
          <p className="text-xs text-grat-500 mt-2">Formats acceptés : PDF, DOC, DOCX. Max 10MB.</p>
        </div>

        <button
          type="submit"
          disabled={formState === 'sending'}
          className="w-full bg-black text-white py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {formState === 'sending' ? labels.sending : labels.submit}
        </button>
      </motion.form>
    </div>
  );
}
