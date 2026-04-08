'use client';

import { motion } from 'framer-motion';
import { Locale } from '@/lib/i18n';
import { useParams } from 'next/navigation';

const content = {
  fr: {
    title: 'À propos',
    subtitle: 'Maison d\'édition indépendante',
    intro: `Spécialisée dans les domaines du patrimoine tunisien, des arts, de la poésie, du théâtre et du soufisme (collection Itinéraires soufis), Contraste Éditions se distingue par des ouvrages soignés, tant pour leur contenu expert que pour la qualité de leur impression, souvent avec des illustrations et des standards internationaux. Elle met aussi en valeur la traduction, avec des titres disponibles en plusieurs langues pour promouvoir la culture tunisienne à l'international.`,
    quote: `« Il y a dans chaque pierre effondrée de Carthage, dans chaque coup de pinceau des fresques de Kairouan, un récit que le temps a voulu taire, mais que le livre, lui, peut encore traduire. »`,
    quoteAuthor: '— Abderrazak Khéchine, fondateur',
    founderMessage: `Lorsqu'en fondant Contraste, je me suis tourné vers l'édition, ce n'était pas pour courir après l'actualité, mais pour écouter les voix anciennes, celles que la poussière du temps a recouvrées sans jamais les faire taire. L'archéologie, en Tunisie, n'est pas qu'une science. Elle est une lutte douce contre l'amnésie. L'histoire, elle, n'est pas qu'une suite de dates : c'est un tissu de regards oubliés, de gestes répétés, de tragédies et de renaissances. Et l'art, enfin, est notre manière de continuer à parler, quand les langues se brisent et que les mondes s'effondrent. Chez Contraste, nous publions des poètes parce qu'ils savent regarder les ruines. Nous éditons des historiens parce qu'ils savent fouiller sous les mots. Nous imprimons des images parce qu'elles crient là où les archives se taisent. C'est pourquoi je crois à une édition artisanale, patiente, savante et enracinée. Une édition qui ne suit pas la mode, mais les échos. Une édition qui marche dans les pas d'Ibn Khaldoun autant que dans ceux de Noureddine Khayachi. Ce que nous construisons, ce ne sont pas que des livres. Ce sont des lieux de mémoire portables. Des musées de papier. Des archéologies d'âme.`,
    awards: {
      title: 'Prix et reconnaissance',
      items: [
        { year: '2022', title: "Prix Abdelwaheb Ben Ayed", book: "D'une oasis à l'autre", author: 'Abdellatif Mrabet', category: 'Roman' },
        { year: '2022', title: "Prix Abdelwaheb Ben Ayed", book: 'استجب إن دعتك الجبال', author: 'Mohamed Ghozzi', category: 'Poésie' },
        { year: '2020', title: 'Comar d\'or', book: 'Merminus Infinitif', author: 'Samir Makhlouf', category: 'Roman' },
      ],
    },
    authors: {
      title: 'Auteurs notables',
      description: 'Des auteurs et titres notables ont marqué l\'histoire de Contraste Éditions :',
      list: [
        { name: 'Ali Louati', desc: 'Figure pluridisciplinaire (poète, historien de l\'art, scénariste), auteur de Héraclès (2001) et Sawwah al-\'ishq (2009)' },
        { name: 'Moëz Majed', desc: 'Poète francophone, auteur des Rêveries d\'un cerisier en fleurs (2008)' },
        { name: 'Lassaad Ben Abdallah', desc: 'Metteur en scène et dramaturge, auteur de La fin tragique du théâtre (2020)' },
        { name: 'Samir Makhlouf', desc: 'Lauréat du Prix Comar d\'or 2020 pour Merminus Infinitif' },
      ],
    },
    domains: {
      title: 'Domaines d\'édition',
      items: ['Patrimoine tunisien', 'Arts', 'Poésie', 'Théâtre', 'Soufisme (Itinéraires soufis)'],
    },
    contact: {
      address: '1, rue Saad ibn Oubada, Khezama Est – Sousse, Tunisie',
      phone: '+216 73 241 704',
      email: 'contrasteditions@yahoo.fr',
    },
  },
  en: {
    title: 'About Us',
    subtitle: 'Independent Publishing House',
    intro: `Specialized in Tunisian heritage, arts, poetry, theater and Sufism (Itinéraires soufis collection), Contraste Éditions stands out for carefully crafted books, both in expert content and print quality, often with illustrations meeting international standards. It also emphasizes translation, with titles available in multiple languages to promote Tunisian culture internationally.`,
    quote: `« In every fallen stone of Carthage, in every brushstroke of Kairouan's frescoes, is a story that time wanted to silence, but that the book can still translate. »`,
    quoteAuthor: '— Abderrazak Khéchine, founder',
    founderMessage: `When I founded Contraste and turned to publishing, it wasn't to chase the news, but to listen to ancient voices, those that time's dust has covered without ever silencing them. Archaeology in Tunisia is not just a science. It's a gentle fight against amnesia. History is not just a series of dates: it's a fabric of forgotten glances, repeated gestures, tragedies and renaissances. And art, finally, is our way of continuing to speak, when languages break and worlds collapse. At Contraste, we publish poets because they know how to look at ruins. We edit historians because they know how to dig beneath words. We print images because they shout where archives fall silent. That's why I believe in artisanal, patient, learned, and rooted publishing. Publishing that doesn't follow trends, but echoes. Publishing that walks in the footsteps of Ibn Khaldoun as much as Noureddine Khayachi. What we build are not just books. They're portable memory places. Paper museums. Archaeologies of the soul.`,
    awards: {
      title: 'Awards & Recognition',
      items: [
        { year: '2022', title: 'Prix Abdelwaheb Ben Ayed', book: "D'une oasis à l'autre", author: 'Abdellatif Mrabet', category: 'Novel' },
        { year: '2022', title: 'Prix Abdelwaheb Ben Ayed', book: 'استجب إن دعتك الجبال', author: 'Mohamed Ghozzi', category: 'Poetry' },
        { year: '2020', title: 'Comar d\'or', book: 'Merminus Infinitif', author: 'Samir Makhlouf', category: 'Novel' },
      ],
    },
    authors: {
      title: 'Notable Authors',
      description: 'Notable authors and titles that have marked Contraste Éditions:',
      list: [
        { name: 'Ali Louati', desc: 'Multidisciplinary figure (poet, art historian, screenwriter), author of Héraclès (2001)' },
        { name: 'Moëz Majed', desc: 'Francophone poet, author of The Dreams of a Cherry Tree (2008)' },
        { name: 'Lassaad Ben Abdallah', desc: 'Stage director and playwright, author of The Tragic End of Theater (2020)' },
        { name: 'Samir Makhlouf', desc: 'Winner of the 2020 Comar d\'or for Merminus Infinitif' },
      ],
    },
    domains: {
      title: 'Publishing Domains',
      items: ['Tunisian Heritage', 'Arts', 'Poetry', 'Theater', 'Sufism (Itinéraires soufis)'],
    },
    contact: {
      address: '1, rue Saad ibn Oubada, Khezama Est – Sousse, Tunisia',
      phone: '+216 73 241 704',
      email: 'contrasteditions@yahoo.fr',
    },
  },
  ar: {
    title: 'من نحن',
    subtitle: 'دار نشر مستقلة',
    intro: 'متخصصة في التراث التونسي والفنون والشعر والمسرح والصوفية (مجموعة مسارات صوفية)، تتميز دار كونتراست إيديشنز بكتب مصقولة بعناية، سواء من حيث المحتوى المتخصص أو جودة الطباعة، غالباً مع رسوم توضيحية بمعايير دولية.',
    quote: '« في كل حجر ساقط من قرطاج، في كل ضربة فرشاة من fresques القيروان، هناك قصة أراد الوقت أن يسكت عنها، لكن الكتاب لا يزال يترجمها.»',
    quoteAuthor: '— عبد الرزاق خشيني، المؤسس',
    founderMessage: 'عندما أسست كونتراست وتوجهت للنشر، لم يكن ذلك خلفاً للأخبار بل للاستماع للأصوات القديمة، تلك التي غطتها غبار الوقت دون أن يسكتورها أبداً.',
    awards: {
      title: 'الجوائز والتقدير',
      items: [
        { year: '2022', title: 'جائزة عبد الوهاب بن AYED', book: 'من واحة لأخرى', author: 'عبد اللطيف مبروك', category: 'رواية' },
        { year: '2020', title: 'كومار دور', book: 'ميرمينوس إنفينيتيف', author: 'سمير مخلوف', category: 'رواية' },
      ],
    },
    authors: {
      title: 'مؤلفون بارزون',
      description: '',
      list: [
        { name: 'علي اللواتي', desc: 'شخصية متعددة التخصصات (شاعر، مؤرخ فن، سيناريست)' },
        { name: 'معاذ ماجد', desc: 'شاعر فرنكوفوني' },
        { name: 'لسعد بن عبد الله', desc: 'مخرج مسرحي ودراماتيك' },
      ],
    },
    domains: {
      title: 'مجالات النشر',
      items: ['التراث التونسي', 'الفنون', 'الشعر', 'المسرح', 'الصوفية'],
    },
    contact: {
      address: '1، شارع سعد بن عبادة، خزامة الشرقية – سوسة، تونس',
      phone: '+216 73 241 704',
      email: 'contrasteditions@yahoo.fr',
    },
  },
};

export default function AboutPage() {
  const params = useParams();
  const lang = params?.lang as Locale || 'fr';
  const c = content[lang] || content.fr;

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-b from-gray-50 to-white py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl sm:text-6xl font-serif font-bold mb-4 text-gray-900">{c.title}</h1>
            <p className="text-xl text-gray-600">{c.subtitle}</p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="prose prose-lg max-w-none"
        >
          <p className="text-lg text-gray-700 leading-relaxed mb-12">{c.intro}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-500 p-8 rounded-r-2xl mb-16"
        >
          <p className="text-xl italic text-gray-800 font-serif mb-4">{c.quote}</p>
          <p className="text-sm text-gray-600 font-medium">{c.quoteAuthor}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{c.founderMessage}</p>
        </motion.div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-3xl font-serif font-bold mb-8 text-center">{c.domains.title}</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {c.domains.items.map((domain, i) => (
                <span key={i} className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm">
                  {domain}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-3xl font-serif font-bold mb-8">{c.awards.title}</h2>
          <div className="space-y-4">
            {c.awards.items.map((award, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-white rounded-xl border border-amber-100">
                <div>
                  <span className="inline-block px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded-full mr-3">{award.year}</span>
                  <span className="font-semibold text-gray-900">{award.title}</span>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-800">{award.book}</p>
                  <p className="text-sm text-gray-500">{award.author}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-3xl font-serif font-bold mb-6">{c.authors.title}</h2>
            <p className="text-gray-600 mb-8">{c.authors.description}</p>
            <div className="grid md:grid-cols-2 gap-4">
              {c.authors.list.map((author, i) => (
                <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-2">{author.name}</h3>
                  <p className="text-sm text-gray-600">{author.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <h2 className="text-3xl font-serif font-bold mb-8">Contraste Éditions</h2>
          <div className="space-y-3 text-gray-600">
            <p>{c.contact.address}</p>
            <p>{c.contact.phone}</p>
            <p>{c.contact.email}</p>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
