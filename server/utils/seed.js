// Populates the database with realistic demo data so the app looks
// alive on first run. Run with: npm run seed  (from /server)
require('dotenv').config();
const mongoose = require('mongoose');
const slugify = require('slugify');

const User = require('../models/User');
const Circle = require('../models/Circle');
const Project = require('../models/Project');
const Chapter = require('../models/Chapter');
const ChapterVersion = require('../models/ChapterVersion');
const Critique = require('../models/Critique');
const Comment = require('../models/Comment');

const users = [
  { username: 'maya_ink', email: 'maya@example.com', displayName: 'Maya Alcaraz', bio: 'Fantasy writer chasing morally grey characters and slow-burn magic systems.', genres: ['Fantasy', 'Young Adult'], avatarColor: '#7A2E3B' },
  { username: 'devon_reeds', email: 'devon@example.com', displayName: 'Devon Reeds', bio: 'Sci-fi and speculative fiction. Currently obsessed with generation ships.', genres: ['Science Fiction'], avatarColor: '#3F6656' },
  { username: 'priya_writes', email: 'priya@example.com', displayName: 'Priya Nair', bio: 'Literary fiction about immigrant families and inherited silence.', genres: ['Literary Fiction'], avatarColor: '#C9A227' },
  { username: 'tobias_k', email: 'tobias@example.com', displayName: 'Tobias Kessler', bio: 'Mystery/thriller. I outline obsessively and still get surprised by my own villains.', genres: ['Mystery', 'Thriller'], avatarColor: '#1B1E2B' },
  { username: 'sana_writes', email: 'sana@example.com', displayName: 'Sana Farooqi', bio: 'Poet dabbling in flash fiction. Words should cost something.', genres: ['Poetry'], avatarColor: '#7A2E3B' },
  { username: 'admin_lee', email: 'admin@writecircle.app', displayName: 'Jordan Lee', bio: 'WriteCircle community moderator.', genres: [], avatarColor: '#1B1E2B', role: 'admin' },
];

const circleDefs = [
  { name: 'Fantasy Worldbuilders', description: 'For writers obsessing over magic systems, maps, and made-up governments.', genreFocus: 'Fantasy', coverAccent: '#7A2E3B' },
  { name: 'Flash Fiction Weekly', description: 'Tight, punchy stories under 1,000 words. New prompt every Monday.', genreFocus: 'Literary Fiction', coverAccent: '#3F6656' },
  { name: 'Speculative Futures', description: 'Science fiction that takes its "what if" seriously.', genreFocus: 'Science Fiction', coverAccent: '#C9A227' },
];

const chapterOne = `The letter arrived on a Tuesday, which Maren would later think was the least dramatic day for her life to end.

She almost didn't open it. The seal was wax, real wax, pressed with a sigil she hadn't seen since her mother's funeral: a crow mid-flight, wings bent like a question mark. Her hands knew the shape before her mind caught up.

"You're being summoned," her brother said from the doorway, not a question.

"I know what it is."

"Then why haven't you opened it."

She had, eventually. The ink was the color of dried blood, which felt less like a stylistic choice and more like a threat. Three lines. That was all it took to undo six years of quiet.

*Return to the Hollow before the frost breaks. Your seat is still yours. So is your debt.*

Maren folded the letter along its original creases, as if that could put the last six years back the way they'd been. It couldn't. Nothing could. The frost was already breaking, and some debts don't care how far you've run.`;

const chapterTwo = `The road to the Hollow hadn't changed, which somehow made it worse.

Maren recognized the crooked signpost at the fork, the one that had been pointing the wrong way toward Bellmoor for as long as anyone could remember. She recognized the smell of the pines, sharp and cold, and the particular grey of the sky here that never quite committed to rain.

What she didn't recognize was the silence.

The Hollow used to hum. Even from the ridge, a mile out, you could hear the market bells and the low drone of the mill wheel and, underneath it all, the sound fifty families make just by existing in the same square mile. Now there was nothing. Not even birds.

She stopped walking. Her horse, sensing something she couldn't name yet, stopped too.

"Something's wrong," she said, mostly to herself.

The debt in the letter suddenly felt like the smaller problem.`;

const critiquesSeed = [
  {
    ratings: { plot: 5, characters: 4, pacing: 5, prose: 5 },
    overallComment: 'This opening does so much work in so few words — the wax seal detail alone tells us this world has history and ceremony. The line about the debt not caring how far you\'ve run is a great hook. My only note is I want one more sensory beat before the letter, just to ground us before the shock.',
    lineComments: [
      { quote: 'wings bent like a question mark', comment: 'Beautiful image — ties the mystery directly to the visual.' },
    ],
  },
  {
    ratings: { plot: 4, characters: 5, pacing: 4, prose: 4 },
    overallComment: 'Maren feels real immediately — the detail about folding the letter along its creases as if that could undo six years is exactly the kind of small, specific gesture that makes a character land. Pacing dips slightly in the middle paragraph; consider trimming the description of the ink.',
    lineComments: [],
  },
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Wiping existing demo collections...');

  await Promise.all([
    User.deleteMany({}),
    Circle.deleteMany({}),
    Project.deleteMany({}),
    Chapter.deleteMany({}),
    ChapterVersion.deleteMany({}),
    Critique.deleteMany({}),
    Comment.deleteMany({}),
  ]);

  console.log('Creating users...');
  const createdUsers = [];
  for (const u of users) {
    const user = await User.create({ ...u, passwordHash: 'Password123!' });
    createdUsers.push(user);
  }
  const [maya, devon, priya, tobias, sana] = createdUsers;

  console.log('Creating circles...');
  const createdCircles = [];
  for (const [i, c] of circleDefs.entries()) {
    const founder = createdUsers[i % createdUsers.length];
    const circle = await Circle.create({
      ...c,
      slug: slugify(c.name, { lower: true, strict: true }),
      createdBy: founder._id,
      members: [
        { user: founder._id, role: 'moderator' },
        { user: createdUsers[(i + 1) % createdUsers.length]._id, role: 'member' },
        { user: createdUsers[(i + 2) % createdUsers.length]._id, role: 'member' },
      ],
      memberCount: 3,
    });
    createdCircles.push(circle);
    await User.updateMany(
      { _id: { $in: circle.members.map((m) => m.user) } },
      { $addToSet: { circles: circle._id } }
    );
  }

  console.log('Creating projects + chapters...');
  const project = await Project.create({
    title: 'The Hollow Debt',
    slug: slugify('The Hollow Debt', { lower: true, strict: true }) + '-' + Date.now().toString(36),
    synopsis: 'Six years after fleeing her hometown and the seat of power she was born into, Maren is summoned back by a debt she thought she\'d outrun — only to find the Hollow silent, and the debt far older than she was told.',
    genre: 'Fantasy',
    tags: ['magic-system', 'found-family', 'slow-burn'],
    author: maya._id,
    circle: createdCircles[0]._id,
    status: 'seeking-feedback',
    coverAccent: '#7A2E3B',
  });

  const ch1 = await Chapter.create({ project: project._id, title: 'The Wax Seal', content: chapterOne, order: 1, status: 'published' });
  await ChapterVersion.create({ chapter: ch1._id, versionNumber: 1, title: ch1.title, content: ch1.content, wordCount: ch1.wordCount });

  const ch2 = await Chapter.create({ project: project._id, title: 'The Silent Hollow', content: chapterTwo, order: 2, status: 'published' });
  await ChapterVersion.create({ chapter: ch2._id, versionNumber: 1, title: ch2.title, content: ch2.content, wordCount: ch2.wordCount });

  project.chapterCount = 2;
  project.totalWordCount = ch1.wordCount + ch2.wordCount;
  project.followers = [devon._id, priya._id];
  project.followerCount = 2;
  await project.save();

  console.log('Creating critiques...');
  const reviewers = [devon, tobias];
  for (const [i, c] of critiquesSeed.entries()) {
    const critique = await Critique.create({
      chapter: ch1._id,
      project: project._id,
      reviewer: reviewers[i]._id,
      ...c,
    });
    ch1.critiqueCount += 1;
    await User.findByIdAndUpdate(reviewers[i]._id, { $inc: { 'stats.critiquesGiven': 1 } });
  }
  await ch1.save();
  await User.findByIdAndUpdate(maya._id, { $inc: { 'stats.critiquesReceived': 2 } });

  const secondProject = await Project.create({
    title: 'Signal Drift',
    slug: slugify('Signal Drift', { lower: true, strict: true }) + '-' + Date.now().toString(36),
    synopsis: 'Three generations into a century-long voyage, a comms officer discovers the ship\'s founding charter was built on a lie — and the crew is about to find out.',
    genre: 'Science Fiction',
    tags: ['generation-ship', 'hard-scifi'],
    author: devon._id,
    circle: createdCircles[2]._id,
    status: 'drafting',
    coverAccent: '#C9A227',
  });
  const sdCh1 = await Chapter.create({
    project: secondProject._id,
    title: 'Deck Nine',
    content: 'The charter said one hundred years. Renn had done the math three times now, and it never came out to one hundred.',
    order: 1,
    status: 'published',
  });
  await ChapterVersion.create({ chapter: sdCh1._id, versionNumber: 1, title: sdCh1.title, content: sdCh1.content, wordCount: sdCh1.wordCount });
  secondProject.chapterCount = 1;
  secondProject.totalWordCount = sdCh1.wordCount;
  await secondProject.save();

  console.log('Creating a project comment...');
  await Comment.create({
    project: project._id,
    author: priya._id,
    body: 'The pacing in chapter one is so tight — I read it twice just for the rhythm of the sentences. Following this one closely.',
  });

  console.log('Seed complete.');
  console.log('Demo login: maya@example.com / devon@example.com / priya@example.com / tobias@example.com / sana@example.com — all use password: Password123!');
  console.log('Admin login: admin@writecircle.app / Password123!');

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
