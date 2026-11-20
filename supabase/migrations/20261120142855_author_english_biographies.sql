alter table public.authors add column bio_en text;

update public.authors as a set bio_en = t.english
from (values
  ('tanvir-rahman', 'তানভীর রহমান বিডি২৪নিউজের প্রধান সম্পাদক। দুই দশকেরও বেশি সময় ধরে সাংবাদিকতায় যুক্ত। ঢাকা বিশ্ববিদ্যালয় থেকে গণযোগাযোগে স্নাতক।', 'Tanvir Rahman is the chief editor of BD24News. He has worked in journalism for more than two decades and holds a degree in mass communication from the University of Dhaka.'),
  ('nusrat-jahan', 'নুসরাত জাহান রাজনীতি ও অর্থনীতি বিষয়ে লেখেন। রাজশাহী বিশ্ববিদ্যালয় থেকে অর্থনীতিতে স্নাতকোত্তর।', 'Nusrat Jahan writes about politics and the economy. She earned a master’s degree in economics from the University of Rajshahi.'),
  ('arif-chowdhury', 'আরিফ চৌধুরী খেলাধুলা ডেস্কের সম্পাদক। ক্রিকেট নিয়ে লেখার পাশাপাশি ফুটবলও কভার করেন।', 'Arif Chowdhury edits the sports desk. He writes about cricket and also covers football.'),
  ('sadia-islam', 'সাদিয়া ইসলাম প্রযুক্তি ও স্টার্টআপ নিয়ে লেখেন। বুয়েট থেকে কম্পিউটার প্রকৌশলে স্নাতক।', 'Sadia Islam writes about technology and startups. She graduated in computer engineering from the Bangladesh University of Engineering and Technology.'),
  ('rakib-hassan', 'রাকিব হাসান আন্তর্জাতিক ডেস্কের সংবাদদাতা। দক্ষিণ এশিয়া ও মধ্যপ্রাচ্য কভার করেন।', 'Rakib Hassan is an international correspondent covering South Asia and the Middle East.'),
  ('mim-akter', 'মিম আক্তার বিনোদন ডেস্কের প্রতিবেদক। চলচ্চিত্র ও সংস্কৃতি নিয়ে লেখেন।', 'Mim Akter reports for the entertainment desk and writes about film and culture.'),
  ('fahim-kabir', 'ফাহিম কবির স্বাস্থ্য ও চিকিৎসা বিষয়ে লেখেন। বঙ্গবন্ধু শেখ মুজিব মেডিক্যাল বিশ্ববিদ্যালয়ের চিকিৎসক।', 'Fahim Kabir writes about health and medicine. He is a physician at Bangabandhu Sheikh Mujib Medical University.'),
  ('isha-khan', 'ইশা খান লাইফস্টাইল ও ভ্রমণ নিয়ে লেখেন। সংস্কৃতি ও খাবারের প্রতি গভীর আগ্রহ।', 'Isha Khan writes about lifestyle and travel, with a particular interest in culture and food.'),
  ('mehedi-hasan', 'মেহেদী হাসান ফটোসাংবাদিক। তার ছবি দেশি-বিদেশি পত্রিকায় প্রকাশিত হয়েছে।', 'Mehedi Hasan is a photojournalist. His photographs have appeared in newspapers in Bangladesh and abroad.')
) as t(slug, original, english)
where a.slug = t.slug and a.bio = t.original and a.bio_en is null;
