-- Starter content so the site renders before the client fills in real copy.
-- Anything in [brackets] is a placeholder the client must replace from /admin.

update public.site_settings set
  license_number = '[LICENSE #]',
  default_seo_title = 'Bring ''Em In Investigations | Licensed Private Investigators in Dallas, TX',
  default_seo_description = 'Licensed Texas private investigators in Dallas–Fort Worth: fugitive recovery and skip tracing for bail bond companies, litigation support for attorneys, and discreet investigations for families and businesses.'
where id = 1;

insert into public.page_sections (key, page, label, eyebrow, heading, body, cta_label, cta_href, sort) values
('home.hero', 'home', 'Home: hero', 'Licensed Texas private investigators · Dallas–Fort Worth', 'We find people. We find the truth. We bring ''em in.', 'Fugitive recovery for bail bond companies, court-ready evidence for attorneys, and discreet investigations for families and businesses across North Texas.', 'Free confidential consultation', '/contact', 0),
('home.about', 'home', 'Home: who we are', null, 'Who we are', 'Bring ''Em In Investigations is a licensed Texas private investigation agency founded by Lidio Ortiz and [CO-FOUNDER NAME]. [X] years of combined experience in [BACKGROUND].', 'Meet the team', '/about', 1),
('home.contact', 'home', 'Home: consultation', null, 'Free confidential consultation', 'Tell us a little about your situation. Only our investigators see your message, and we contact you the way you choose.', null, null, 2),
('bail.hero', 'bail', 'Bail bond agents: hero', 'For bail bond companies', 'Your defendant skipped. We bring ''em in.', 'Licensed Texas investigators handling skip tracing and fugitive recovery across Dallas–Fort Worth, so you don''t forfeit the bond.', null, null, 0),
('attorneys.hero', 'attorneys', 'Attorneys: hero', 'For attorneys', 'Investigations that hold up in court.', 'Witness locates, surveillance, asset searches and digital forensics, documented in reports built for litigation.', 'Discuss a case', '/contact', 0),
('about.intro', 'about', 'About: intro', 'About us', 'Licensed. Discreet. Relentless.', 'Every investigation follows Texas law, so the evidence we collect is admissible in court.', null, null, 0);

insert into public.services (slug, name, summary, audience, sort) values
('fugitive-recovery-skip-tracing', 'Fugitive recovery & skip tracing', 'Locate and recover defendants who skipped bail, fast.', 'bail', 0),
('infidelity', 'Infidelity investigations', 'Discreet surveillance and documented answers.', 'individual', 1),
('child-custody', 'Child custody investigations', 'Evidence of a child''s living conditions for family court.', 'individual', 2),
('surveillance', 'Surveillance', 'Photo and video documentation by experienced investigators.', 'individual', 3),
('background-checks', 'Background checks & locates', 'Find people, verify histories, serve the right address.', 'attorney', 4),
('asset-financial', 'Asset & financial searches', 'Hidden assets for divorce, judgments and litigation.', 'attorney', 5),
('computer-mobile-forensics', 'Computer & mobile forensics', 'Recover and preserve evidence from phones and computers.', 'business', 6),
('corporate', 'Corporate investigations', 'Employee theft, fraud and due diligence.', 'business', 7);

insert into public.team_members (name, title, sort) values
('Lidio Ortiz', 'Co-founder · Licensed Private Investigator', 0),
('[CO-FOUNDER NAME]', 'Co-founder · Licensed Private Investigator', 1);

insert into public.faqs (question, answer, page, sort) values
('How much does a private investigator cost?', '[Answer: typical ranges, hourly vs flat fee, what affects price.]', 'faq', 0),
('Is everything I tell you confidential?', 'Yes. Only our investigators see what you share, and we contact you only the way you choose.', 'faq', 1),
('Is your evidence admissible in court?', 'We follow Texas law in every investigation so the evidence we collect can be used in court.', 'faq', 2),
('How fast do you start on a skip?', '[Answer: e.g. same day for skips submitted before X pm.]', 'bail', 0),
('What do you charge for recovery?', '[Answer: fee structure and when it is due.]', 'bail', 1),
('Which counties do you cover?', '[Answer: Dallas, Tarrant, Collin, Denton… statewide by arrangement?]', 'bail', 2),
('Are you licensed for bail recovery in Texas?', 'Yes. Our investigators hold Texas private investigator licenses.', 'bail', 3);

insert into public.categories (name, slug) values
('Bail recovery', 'bail-recovery'), ('Family', 'family'), ('Legal', 'legal'), ('Business', 'business');
