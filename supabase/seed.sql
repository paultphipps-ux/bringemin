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

-- One service page per topic the old site ranked for (see /mnt/project-files/seo/redirect-map.csv).
insert into public.services (slug, name, summary, audience, sort, seo_title) values
('fugitive-recovery-skip-tracing', 'Fugitive recovery & skip tracing', 'Locate and recover defendants who skipped bail, fast.', 'bail', 0, 'Fugitive recovery & skip tracing in Dallas, TX | Bring ''Em In Investigations'),
('infidelity', 'Infidelity & divorce investigations', 'Discreet surveillance and documented answers.', 'individual', 1, 'Infidelity & divorce investigations in Dallas, TX | Bring ''Em In Investigations'),
('child-custody', 'Child custody & child support', 'Evidence of a child''s living conditions for family court.', 'individual', 2, 'Child custody & child support in Dallas, TX | Bring ''Em In Investigations'),
('family-law', 'Family law investigations', 'Evidence and locates for family law matters.', 'individual', 3, 'Family law investigations in Dallas, TX | Bring ''Em In Investigations'),
('surveillance', 'Surveillance', 'Photo and video documentation by experienced investigators.', 'individual', 4, 'Surveillance in Dallas, TX | Bring ''Em In Investigations'),
('video-surveillance', 'Video surveillance', 'Covert video documentation that stands up in court.', 'individual', 5, 'Video surveillance in Dallas, TX | Bring ''Em In Investigations'),
('electronic-surveillance', 'Electronic surveillance & bug sweeps', 'Find hidden trackers, cameras and listening devices.', 'business', 6, 'Electronic surveillance & bug sweeps in Dallas, TX | Bring ''Em In Investigations'),
('background-checks', 'Background checks', 'Verify identities, histories and records.', 'attorney', 7, 'Background checks in Dallas, TX | Bring ''Em In Investigations'),
('deep-background', 'Deep background investigations', 'In-depth histories beyond public databases.', 'business', 8, 'Deep background investigations in Dallas, TX | Bring ''Em In Investigations'),
('pre-employment-screening', 'Pre-employment screening', 'Screen candidates before you hire.', 'business', 9, 'Pre-employment screening in Dallas, TX | Bring ''Em In Investigations'),
('identity-theft', 'Identity theft investigations', 'Find out who is using your identity and stop it.', 'individual', 10, 'Identity theft investigations in Dallas, TX | Bring ''Em In Investigations'),
('asset-financial', 'Asset & financial investigations', 'Hidden assets for divorce, judgments and litigation.', 'attorney', 11, 'Asset & financial investigations in Dallas, TX | Bring ''Em In Investigations'),
('computer-mobile-forensics', 'Computer & mobile forensics', 'Recover and preserve evidence from phones and computers.', 'business', 12, 'Computer & mobile forensics in Dallas, TX | Bring ''Em In Investigations'),
('corporate', 'Employment & corporate investigations', 'Employee theft, fraud and misconduct.', 'business', 13, 'Employment & corporate investigations in Dallas, TX | Bring ''Em In Investigations'),
('due-diligence', 'Due diligence', 'Vet partners, investments and acquisitions.', 'business', 14, 'Due diligence in Dallas, TX | Bring ''Em In Investigations'),
('security-assessments', 'Security assessments', 'Find the weak points in your home or business security.', 'business', 15, 'Security assessments in Dallas, TX | Bring ''Em In Investigations'),
('executive-protection', 'Executive protection', 'Licensed protection for executives and public figures.', 'business', 16, 'Executive protection in Dallas, TX | Bring ''Em In Investigations'),
('witness-defendant-location', 'Witness & defendant location', 'Find witnesses and parties so the case can move.', 'attorney', 17, 'Witness & defendant location in Dallas, TX | Bring ''Em In Investigations'),
('civil-investigations', 'Civil investigations', 'Evidence and interviews for civil litigation.', 'attorney', 18, 'Civil investigations in Dallas, TX | Bring ''Em In Investigations'),
('criminal-investigations', 'Criminal defense investigations', 'Independent investigation for criminal defense.', 'attorney', 19, 'Criminal defense investigations in Dallas, TX | Bring ''Em In Investigations');

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
('Bail recovery', 'bail-recovery'), ('Background investigations', 'background-investigations'), ('Debt recovery', 'debt-recovery'),
('Divorce & infidelity', 'divorce'), ('Family law', 'family-law'), ('Financial investigations', 'financial'),
('Mobile forensics', 'mobile-forensics'), ('Surveillance', 'surveillance'), ('Business', 'business'), ('Legal', 'legal'), ('Private investigators', 'private-investigators');
