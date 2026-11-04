/* English content for grades 1–6. */
(function () {
  const { pick, sample, choices, fromPairs, pairsOf, shuffle } = U;

  // Picture words: [word, emoji]
  const easyPics = [['cat', '🐱'], ['dog', '🐶'], ['sun', '☀️'], ['hat', '🎩'], ['bus', '🚌'], ['egg', '🥚'], ['pig', '🐷'], ['cow', '🐮'],
    ['bee', '🐝'], ['bed', '🛏️'], ['fox', '🦊'], ['car', '🚗'], ['fish', '🐟'], ['frog', '🐸'], ['duck', '🦆'], ['star', '⭐'],
    ['moon', '🌙'], ['cake', '🎂'], ['tree', '🌳'], ['bird', '🐦'], ['book', '📖'], ['ball', '⚽'], ['milk', '🥛'], ['lion', '🦁']];
  const midPics = [['apple', '🍎'], ['house', '🏠'], ['horse', '🐴'], ['train', '🚆'], ['zebra', '🦓'], ['tiger', '🐯'], ['lemon', '🍋'],
    ['pizza', '🍕'], ['robot', '🤖'], ['clock', '🕐'], ['snake', '🐍'], ['mouse', '🐭'], ['banana', '🍌'], ['rabbit', '🐰'], ['flower', '🌸'],
    ['rocket', '🚀'], ['pencil', '✏️'], ['monkey', '🐵'], ['turtle', '🐢'], ['orange', '🍊'], ['carrot', '🥕'], ['cookie', '🍪'], ['castle', '🏰'], ['spider', '🕷️']];
  const hardPics = [['elephant', '🐘'], ['umbrella', '☂️'], ['dinosaur', '🦕'], ['computer', '💻'], ['penguin', '🐧'], ['octopus', '🐙'],
    ['kangaroo', '🦘'], ['volcano', '🌋'], ['butterfly', '🦋'], ['giraffe', '🦒'], ['pineapple', '🍍'], ['strawberry', '🍓'], ['crocodile', '🐊'],
    ['helicopter', '🚁'], ['microscope', '🔬'], ['telescope', '🔭'], ['watermelon', '🍉'], ['hamburger', '🍔'], ['snowflake', '❄️'], ['sandwich', '🥪']];

  const picWord = (list) => ({
    id: 'picword', name: 'Picture words',
    gen: () => { const [w, e] = pick(list); return { prompt: 'What is this?', big: e, bigClass: 'emoji', answer: w, choices: choices(w, list.map(p => p[0])), explain: `${e} is a ${w}.` }; },
    pair: () => { const [w, e] = pick(list); return [e, w]; },
  });
  const startsWith = (list) => ({
    id: 'starts', name: 'First letter',
    gen: () => {
      const [w, e] = pick(list), L = w[0].toUpperCase();
      return { prompt: 'Which letter does this word start with?', big: e, bigClass: 'emoji', say: w, answer: L, choices: choices(L, 'ABCDEFGHIJKLMNOPRSTW'.split('')), explain: `${e} is "${w}". It starts with ${L}.` };
    },
  });
  const missing = (list) => ({
    id: 'missing', name: 'Missing letter',
    gen: () => {
      const [w, e] = pick(list), i = Math.floor(Math.random() * w.length), L = w[i];
      const tiles = w.split('').map((c, j) => (j === i ? '_' : c));
      return { prompt: 'Which letter is missing?', big: e, bigClass: 'emoji small', tiles, answer: L, choices: choices(L, 'abcdefghiklmnoprstuw'.split('')), explain: `The word is "${w}".` };
    },
  });

  const rhymes = [['cat', 'hat'], ['dog', 'log'], ['sun', 'run'], ['bee', 'tree'], ['cake', 'lake'], ['star', 'car'], ['bug', 'rug'],
    ['pig', 'wig'], ['fox', 'box'], ['ring', 'king'], ['goat', 'boat'], ['bell', 'shell'], ['mouse', 'house'], ['bed', 'red']];
  const plurals = [['cat', 'cats'], ['box', 'boxes'], ['baby', 'babies'], ['bus', 'buses'], ['dish', 'dishes'], ['fox', 'foxes'], ['city', 'cities'],
    ['toy', 'toys'], ['dog', 'dogs'], ['apple', 'apples'], ['peach', 'peaches'], ['lady', 'ladies'], ['book', 'books'], ['glass', 'glasses']];
  const opposites = [['hot', 'cold'], ['big', 'small'], ['up', 'down'], ['happy', 'sad'], ['fast', 'slow'], ['day', 'night'], ['open', 'closed'],
    ['wet', 'dry'], ['full', 'empty'], ['old', 'new'], ['light', 'dark'], ['loud', 'quiet'], ['hard', 'soft'], ['early', 'late'], ['top', 'bottom']];
  const synonyms = [['big', 'large'], ['small', 'tiny'], ['happy', 'glad'], ['fast', 'quick'], ['smart', 'clever'], ['begin', 'start'],
    ['shut', 'close'], ['jump', 'leap'], ['angry', 'mad'], ['sick', 'ill'], ['gift', 'present'], ['scared', 'afraid'], ['rock', 'stone'],
    ['end', 'finish'], ['shout', 'yell']];
  const past = [['walk', 'walked'], ['play', 'played'], ['jump', 'jumped'], ['go', 'went'], ['eat', 'ate'], ['see', 'saw'], ['run', 'ran'],
    ['swim', 'swam'], ['sing', 'sang'], ['write', 'wrote'], ['come', 'came'], ['take', 'took'], ['make', 'made'], ['give', 'gave'],
    ['sleep', 'slept'], ['drink', 'drank']];
  const pos3 = [['dog', 'Noun'], ['run', 'Verb'], ['happy', 'Adjective'], ['table', 'Noun'], ['jump', 'Verb'], ['tall', 'Adjective'],
    ['school', 'Noun'], ['sing', 'Verb'], ['red', 'Adjective'], ['apple', 'Noun'], ['swim', 'Verb'], ['soft', 'Adjective'], ['teacher', 'Noun'],
    ['eat', 'Verb'], ['brave', 'Adjective'], ['river', 'Noun'], ['write', 'Verb'], ['cold', 'Adjective']];
  const homophones = [
    ['I can ___ the music.', 'hear', ['hear', 'here']], ['Come over ___!', 'here', ['hear', 'here']],
    ['___ dog is very friendly.', 'Their', ['Their', 'There', "They're"]], ['Put the box over ___.', 'there', ['their', 'there', "they're"]],
    ["___ going to the park.", "They're", ['Their', 'There', "They're"]], ['I have ___ cats.', 'two', ['to', 'too', 'two']],
    ['We walked ___ school.', 'to', ['to', 'too', 'two']], ['I want to come ___!', 'too', ['to', 'too', 'two']],
    ["___ my best friend.", "You're", ['Your', "You're"]], ['Is this ___ bag?', 'your', ['your', "you're"]],
    ['I ___ the answer.', 'know', ['know', 'no']], ['Please ___ your name.', 'write', ['write', 'right']],
    ['We swam in the ___.', 'sea', ['sea', 'see']], ['The bee sat on the ___.', 'flower', ['flower', 'flour']],
    ['I ___ a big lunch.', 'ate', ['ate', 'eight']], ['The dog wagged ___ tail.', 'its', ['its', "it's"]]];
  const compounds = [['sun', 'flower'], ['rain', 'bow'], ['foot', 'ball'], ['butter', 'fly'], ['star', 'fish'], ['cup', 'cake'],
    ['tooth', 'brush'], ['snow', 'man'], ['pop', 'corn'], ['bed', 'room'], ['play', 'ground'], ['sun', 'shine'], ['home', 'work']];
  const irregular = [['child', 'children'], ['mouse', 'mice'], ['foot', 'feet'], ['tooth', 'teeth'], ['man', 'men'], ['woman', 'women'],
    ['goose', 'geese'], ['sheep', 'sheep'], ['person', 'people'], ['leaf', 'leaves'], ['knife', 'knives'], ['wolf', 'wolves'], ['ox', 'oxen']];
  const affixes = [['unhappy', 'not happy'], ['rebuild', 'build again'], ['careless', 'without care'], ['helpful', 'full of help'],
    ['teacher', 'a person who teaches'], ['unkind', 'not kind'], ['preheat', 'heat before'], ['misread', 'read wrongly'],
    ['fearless', 'without fear'], ['joyful', 'full of joy'], ['impossible', 'not possible'], ['replay', 'play again'], ['painter', 'a person who paints']];
  const antonyms5 = [['ancient', 'modern'], ['generous', 'selfish'], ['brave', 'cowardly'], ['victory', 'defeat'], ['increase', 'decrease'],
    ['accept', 'refuse'], ['expand', 'shrink'], ['rough', 'smooth'], ['permanent', 'temporary'], ['arrive', 'depart'], ['polite', 'rude'],
    ['frequent', 'rare'], ['include', 'exclude'], ['major', 'minor']];
  const pos5 = [['quickly', 'Adverb'], ['slowly', 'Adverb'], ['loudly', 'Adverb'], ['she', 'Pronoun'], ['they', 'Pronoun'], ['we', 'Pronoun'],
    ['under', 'Preposition'], ['between', 'Preposition'], ['across', 'Preposition'], ['beautiful', 'Adjective'], ['enormous', 'Adjective'],
    ['happiness', 'Noun'], ['kingdom', 'Noun'], ['explore', 'Verb'], ['whisper', 'Verb']];
  const idioms = [['a piece of cake', 'very easy'], ['break the ice', 'start a friendly conversation'], ['under the weather', 'feeling sick'],
    ['hit the books', 'study hard'], ['cost an arm and a leg', 'very expensive'], ['let the cat out of the bag', 'tell a secret'],
    ['once in a blue moon', 'very rarely'], ['on cloud nine', 'very happy'], ['when pigs fly', 'it will never happen'],
    ['hold your horses', 'wait and be patient'], ['the ball is in your court', "it's your decision"]];
  const analogies = [['Bird is to fly as fish is to ___', 'swim'], ['Hot is to cold as up is to ___', 'down'],
    ['Puppy is to dog as kitten is to ___', 'cat'], ['Pen is to write as knife is to ___', 'cut'],
    ['Doctor is to hospital as teacher is to ___', 'school'], ['Foot is to shoe as hand is to ___', 'glove'],
    ['Day is to night as summer is to ___', 'winter'], ['Bee is to hive as bird is to ___', 'nest'],
    ['Page is to book as brick is to ___', 'wall'], ['Eye is to see as ear is to ___', 'hear']];
  const tenses = [['She will travel tomorrow.', 'Future'], ['They are playing now.', 'Present continuous'], ['He walked to school.', 'Past simple'],
    ['I have finished my homework.', 'Present perfect'], ['We were watching TV.', 'Past continuous'], ['She reads every day.', 'Present simple'],
    ['The baby is sleeping.', 'Present continuous'], ['We visited Grandma last week.', 'Past simple'], ['I will call you later.', 'Future'],
    ['He plays football on Fridays.', 'Present simple'], ['They have seen that movie.', 'Present perfect'], ['It was raining all night.', 'Past continuous']];
  const tenseNames = ['Past simple', 'Past continuous', 'Present simple', 'Present continuous', 'Present perfect', 'Future'];

  const T = (id, name, list, makeQ, extra = {}) => Object.assign({ id, name, gen: fromPairs(list, makeQ), pair: pairsOf(list) }, extra);
  const W = w => w.toUpperCase();
  const POS_WHY = {
    Noun: 'a noun is a person, place, animal or thing', Verb: 'a verb is an action word (something you do)', Adjective: 'an adjective describes a noun (how it looks or feels)',
    Adverb: 'an adverb tells how, when or where something happens (often ends in -ly)', Pronoun: 'a pronoun takes the place of a name (he, she, we, they…)',
    Preposition: 'a preposition shows where something is (under, between, across…)',
  };
  const TENSE_WHY = {
    Future: '"will" + verb talks about the future', 'Present continuous': 'am/is/are + -ing is happening right now', 'Past simple': 'the verb is in the past form (often -ed)',
    'Present perfect': 'have/has + past participle (finished, seen…)', 'Past continuous': 'was/were + -ing was happening in the past', 'Present simple': 'the verb shows a habit or something that is always true',
  };

  /* Reading: a short text and a question about it. [text, question, answer, other choices] */
  const reading = {
    easy: [
      ['Sam has a red ball. He plays with it in the park.', 'What color is the ball?', 'red', ['blue', 'green', 'yellow']],
      ['The cat is on the bed. It is sleeping.', 'Where is the cat?', 'on the bed', ['in the box', 'under the table', 'in the tree']],
      ['Lina likes apples. She eats one every day.', 'What does Lina eat every day?', 'an apple', ['a banana', 'a cake', 'an egg']],
      ['I see three birds in the tree.', 'How many birds are there?', 'three', ['two', 'four', 'five']],
      ['Dad drives a big blue bus.', 'What does Dad drive?', 'a bus', ['a car', 'a bike', 'a train']],
      ['The sun is hot. We go to the beach.', 'Where do they go?', 'to the beach', ['to school', 'to the park', 'to bed']],
    ],
    mid: [
      ['Omar woke up early. He brushed his teeth, ate breakfast and walked to school with his sister.', 'Who did Omar walk to school with?', 'his sister', ['his dad', 'his friend', 'his teacher']],
      ['Bees live in hives. They collect nectar from flowers and turn it into honey.', 'What do bees make?', 'honey', ['milk', 'bread', 'juice']],
      ['It was raining, so Mona took her umbrella. She did not want to get wet.', 'Why did Mona take her umbrella?', 'it was raining', ['it was sunny', 'it was windy', 'it was dark']],
      ['The library opens at nine o\'clock. Yusuf arrived at ten, so he did not wait.', 'When does the library open?', 'at nine o\'clock', ['at ten o\'clock', 'at eight o\'clock', 'at noon']],
      ['Penguins cannot fly, but they are excellent swimmers. They live in cold places.', 'What are penguins good at?', 'swimming', ['flying', 'climbing', 'running']],
      ['Sara planted a seed. She watered it every day, and after two weeks a small green plant appeared.', 'What did Sara do every day?', 'watered the seed', ['picked flowers', 'painted the pot', 'ate the plant']],
    ],
    hard: [
      ['The camel is well suited to the desert. It can travel for days without water and its wide feet stop it from sinking into the sand.', 'Why don\'t camels sink into the sand?', 'they have wide feet', ['they are very light', 'they walk slowly', 'they drink a lot']],
      ['Although the team lost the first match, they practised every afternoon and won the final.', 'What helped the team win the final?', 'practising every afternoon', ['a new coach', 'luck', 'new shoes']],
      ['Recycling paper saves trees, water and energy. One tonne of recycled paper can save about 17 trees.', 'What is the main idea?', 'recycling paper helps the environment', ['trees are very tall', 'paper is expensive', 'water is heavy']],
      ['Ali was nervous before his speech, but when he saw his friends smiling in the audience, he relaxed.', 'How did Ali feel at the end?', 'relaxed', ['nervous', 'angry', 'bored']],
      ['The ancient Egyptians built pyramids as tombs for their kings. The largest, the Great Pyramid, took about 20 years to build.', 'Why were the pyramids built?', 'as tombs for kings', ['as schools', 'as markets', 'as houses for farmers']],
    ],
  };
  const readTopic = (list) => ({
    id: 'read', name: 'Reading', long: true, pair: null,
    gen: () => {
      const [text, q, a, o] = pick(list);
      return { prompt: 'Read, then answer: ' + q, big: text, bigClass: 'passage', say: text, answer: a, choices: shuffle([a, ...o]), explain: `Look back at the text: it tells us "${a}".` };
    },
  });
  /* Listening: hear a word, choose how it is spelled. */
  const listenTopic = (list) => ({
    id: 'listen', name: 'Listening', needsVoice: 'en', pair: null,
    gen: () => {
      const [w] = pick(list);
      return { prompt: 'Listen and choose the word you hear:', listen: w, say: w, autoSay: true, answer: w, choices: choices(w, list.map(p => p[0]).filter(x => x[0] === w[0] || x.length === w.length).concat(list.map(p => p[0]))), explain: `The word was "${w}".` };
    },
  });

  /* Sentences for the "Put in Order" game. */
  const sentences = {
    1: ['I see a cat', 'The dog is big', 'I like red apples', 'We go to school', 'The sun is hot', 'I can run fast'],
    2: ['My cat likes to sleep', 'We play in the park', 'The bird can fly high', 'She has a blue bag', 'I read a book every day', 'He drinks cold milk'],
    3: ['The children are playing football', 'My mother bakes a cake', 'Tom walked to school yesterday', 'Elephants have long trunks', 'We visited the zoo last week'],
    4: ['The little girl found a shiny coin', 'Our class planted three trees', 'Please close the door quietly', 'My brother is taller than me', 'The train arrived at the station'],
    5: ['The scientist looked through the microscope', 'Bees make honey from flower nectar', 'Our teacher explained the lesson clearly', 'The brave firefighter rescued the kitten'],
    6: ['The ancient city was discovered by explorers', 'Healthy food gives our bodies energy', 'The museum displays paintings from many countries', 'Reading every day improves your vocabulary'],
  };
  const orderFor = g => () => {
    const s = pick(sentences[g]), words = s.split(' ');
    return { prompt: 'Put the words in order to make a sentence:', items: shuffle(words), answer: words, explain: 'The sentence is: "' + s + '."' };
  };

  const grades = {
    1: {
      topics: [
        picWord(easyPics.slice(0, 16)),
        startsWith(easyPics),
        T('rhyme', 'Rhyming words', rhymes, (a, b) => ({ prompt: 'Which word rhymes with…', big: W(a), say: a, explain: `${a} and ${b} rhyme: they both end with "-${b.slice(-2)}".` })),
        listenTopic(easyPics.slice(0, 16)),
        readTopic(reading.easy.slice(0, 4)),
      ],
      words: easyPics.slice(0, 12),
      order: orderFor(1),
    },
    2: {
      topics: [
        picWord(easyPics),
        missing(easyPics),
        T('plural', 'Plurals', plurals, (a, b) => ({ prompt: 'More than one…', big: `one ${a} → two ___`, bigClass: 'sentence', wrong: [a + 's', a + 'es', a.replace(/y$/, 'ies')],
          explain: /ies$/.test(b) ? `${a} ends in a consonant + y, so change y to i and add -es: ${b}.` : /es$/.test(b) ? `${a} ends in s, x, sh or ch, so add -es: ${b}.` : `Most words just add -s: ${b}.` })),
        T('opp', 'Opposites', opposites.slice(0, 10), (a, b) => ({ prompt: 'What is the opposite of…', big: W(a), say: a, explain: `The opposite of ${a} is ${b}.` })),
        listenTopic(easyPics),
        readTopic(reading.easy),
      ],
      words: easyPics.slice(10),
      order: orderFor(2),
    },
    3: {
      topics: [
        picWord(midPics),
        T('syn', 'Synonyms', synonyms, (a, b) => ({ prompt: 'Which word means the same as…', big: W(a), say: a, explain: `"${a}" and "${b}" mean almost the same thing.` })),
        T('past', 'Past tense', past, (a, b) => ({ prompt: 'Today I ' + a + '. Yesterday I…', big: W(a), say: a, wrong: [a + 'ed', a.replace(/e$/, '') + 'ed', a + 's'],
          explain: b === a + 'ed' || b === a.replace(/e$/, '') + 'ed' ? `Regular verb: add -ed → ${b}.` : `${a} is irregular: its past tense is ${b} (not "${a}ed").` })),
        { id: 'pos', name: 'Nouns, verbs & adjectives', gen: () => { const [w, p] = pick(pos3); return { prompt: 'What kind of word is this?', big: w, say: w, answer: p, choices: ['Noun', 'Verb', 'Adjective'], explain: `"${w}" is a ${p.toLowerCase()}: ${POS_WHY[p]}.` }; } },
        listenTopic(midPics),
        readTopic(reading.mid),
      ],
      words: midPics.slice(0, 12),
      order: orderFor(3),
    },
    4: {
      topics: [
        { id: 'homo', name: 'Homophones', gen: () => { const [s, a, c] = pick(homophones); return { prompt: 'Choose the right word:', big: s, bigClass: 'sentence', answer: a, choices: shuffle(c), explain: `These words sound the same but mean different things. Here we need "${a}": ${s.replace('___', a)}` }; } },
        { id: 'compound', name: 'Compound words', gen: () => { const [a, b] = pick(compounds), ans = a + b; return { prompt: 'Put the words together:', big: `${a} + ${b}`, answer: ans, choices: choices(ans, compounds.map(p => p[0] + p[1]).concat([b + a])), explain: `A compound word joins two words in order: ${a} + ${b} = ${ans}.` }; }, pair: () => { const [a, b] = pick(compounds); return [`${a} + ${b}`, a + b]; } },
        T('irr', 'Irregular plurals', irregular, (a, b) => ({ prompt: 'One… many?', big: W(a), say: a, wrong: [a + 's', a + 'es', a.replace(/f$/, 'ves')], explain: `${a} is irregular: one ${a}, many ${b}.` })),
        T('past', 'Past tense', past, (a, b) => ({ prompt: 'What is the past tense of…', big: W(a), say: a, wrong: [a + 'ed', a.replace(/e$/, '') + 'ed', a + 'ing'], explain: `The past tense of ${a} is ${b}.` })),
        readTopic(reading.mid),
      ],
      words: midPics.slice(12),
      order: orderFor(4),
    },
    5: {
      topics: [
        T('affix', 'Prefixes & suffixes', affixes, (a, b) => ({ prompt: 'What does this word mean?', big: a, say: a,
          explain: /^(un|im|dis|non)/.test(a) ? `The prefix "${a.match(/^(un|im|dis|non)/)[1]}-" means "not": ${a} = ${b}.` : /^re/.test(a) ? `"re-" means "again": ${a} = ${b}.` : /^pre/.test(a) ? `"pre-" means "before": ${a} = ${b}.` : /^mis/.test(a) ? `"mis-" means "wrongly": ${a} = ${b}.` : /less$/.test(a) ? `"-less" means "without": ${a} = ${b}.` : /ful$/.test(a) ? `"-ful" means "full of": ${a} = ${b}.` : `"-er" means "a person who does it": ${a} = ${b}.` }), { long: true }),
        T('ant', 'Antonyms', antonyms5, (a, b) => ({ prompt: 'Choose the opposite of…', big: a, say: a, explain: `${a} and ${b} are opposites (antonyms).` })),
        { id: 'pos5', name: 'Parts of speech', gen: () => { const [w, p] = pick(pos5); return { prompt: 'What part of speech is this word?', big: w, say: w, answer: p, choices: choices(p, ['Noun', 'Verb', 'Adjective', 'Adverb', 'Pronoun', 'Preposition']), explain: `"${w}" is ${/^[AEIOU]/.test(p) ? 'an' : 'a'} ${p.toLowerCase()}: ${POS_WHY[p]}.` }; } },
        T('syn', 'Synonyms', synonyms, (a, b) => ({ prompt: 'Which word means the same as…', big: W(a), say: a, explain: `"${a}" and "${b}" mean almost the same thing.` })),
        readTopic(reading.hard),
      ],
      words: hardPics.slice(0, 10),
      order: orderFor(5),
    },
    6: {
      topics: [
        T('idiom', 'Idioms', idioms, (a, b) => ({ prompt: 'What does this idiom mean?', big: `“${a}”`, bigClass: 'sentence', explain: `An idiom doesn't mean exactly what the words say. "${a}" means ${b}.` }), { long: true }),
        T('analogy', 'Analogies', analogies, (a, b) => ({ prompt: 'Complete the analogy:', big: a, bigClass: 'sentence', explain: `Find how the first pair is linked, then use the same link: ${a.replace('___', b)}.` }), { pair: null }),
        { id: 'tense', name: 'Verb tenses', long: true, gen: () => { const [s, t] = pick(tenses); return { prompt: 'Which tense is this sentence?', big: s, bigClass: 'sentence', answer: t, choices: choices(t, tenseNames), explain: `${t}: ${TENSE_WHY[t]}.` }; } },
        T('ant', 'Antonyms', antonyms5, (a, b) => ({ prompt: 'Choose the opposite of…', big: a, say: a, explain: `${a} and ${b} are opposites (antonyms).` })),
        readTopic(reading.hard),
      ],
      words: hardPics.slice(8),
      order: orderFor(6),
    },
  };

  SUBJECTS.english = { id: 'english', name: 'English', nameAr: 'الإنجليزية', icon: '🔤', lang: 'en', grades };
})();
