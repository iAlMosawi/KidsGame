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
    gen: () => { const [w, e] = pick(list); return { prompt: 'What is this?', big: e, bigClass: 'emoji', answer: w, choices: choices(w, list.map(p => p[0])) }; },
    pair: () => { const [w, e] = pick(list); return [e, w]; },
  });
  const startsWith = (list) => ({
    id: 'starts', name: 'First letter',
    gen: () => {
      const [w, e] = pick(list), L = w[0].toUpperCase();
      return { prompt: 'Which letter does this word start with?', big: e, bigClass: 'emoji', say: w, answer: L, choices: choices(L, 'ABCDEFGHIJKLMNOPRSTW'.split('')) };
    },
  });
  const missing = (list) => ({
    id: 'missing', name: 'Missing letter',
    gen: () => {
      const [w, e] = pick(list), i = Math.floor(Math.random() * w.length), L = w[i];
      const tiles = w.split('').map((c, j) => (j === i ? '_' : c));
      return { prompt: 'Which letter is missing?', big: e, bigClass: 'emoji small', tiles, answer: L, choices: choices(L, 'abcdefghiklmnoprstuw'.split('')) };
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

  const grades = {
    1: {
      topics: [
        picWord(easyPics.slice(0, 16)),
        startsWith(easyPics),
        T('rhyme', 'Rhyming words', rhymes, a => ({ prompt: 'Which word rhymes with…', big: W(a), say: a })),
      ],
      words: easyPics.slice(0, 12),
    },
    2: {
      topics: [
        picWord(easyPics),
        missing(easyPics),
        T('plural', 'Plurals', plurals, a => ({ prompt: 'More than one…', big: `one ${a} → two ___`, bigClass: 'sentence', wrong: [a + 's', a + 'es', a.replace(/y$/, 'ies')] })),
        T('opp', 'Opposites', opposites.slice(0, 10), a => ({ prompt: 'What is the opposite of…', big: W(a), say: a })),
      ],
      words: easyPics.slice(10),
    },
    3: {
      topics: [
        picWord(midPics),
        T('syn', 'Synonyms', synonyms, a => ({ prompt: 'Which word means the same as…', big: W(a), say: a })),
        T('past', 'Past tense', past, a => ({ prompt: 'Today I ' + a + '. Yesterday I…', big: W(a), say: a, wrong: [a + 'ed', a.replace(/e$/, '') + 'ed', a + 's'] })),
        { id: 'pos', name: 'Nouns, verbs & adjectives', gen: () => { const [w, p] = pick(pos3); return { prompt: 'What kind of word is this?', big: w, say: w, answer: p, choices: ['Noun', 'Verb', 'Adjective'] }; } },
      ],
      words: midPics.slice(0, 12),
    },
    4: {
      topics: [
        { id: 'homo', name: 'Homophones', gen: () => { const [s, a, c] = pick(homophones); return { prompt: 'Choose the right word:', big: s, bigClass: 'sentence', answer: a, choices: shuffle(c) }; } },
        { id: 'compound', name: 'Compound words', gen: () => { const [a, b] = pick(compounds), ans = a + b; return { prompt: 'Put the words together:', big: `${a} + ${b}`, answer: ans, choices: choices(ans, compounds.map(p => p[0] + p[1]).concat([b + a])) }; }, pair: () => { const [a, b] = pick(compounds); return [`${a} + ${b}`, a + b]; } },
        T('irr', 'Irregular plurals', irregular, a => ({ prompt: 'One… many?', big: W(a), say: a, wrong: [a + 's', a + 'es', a.replace(/f$/, 'ves')] })),
        T('past', 'Past tense', past, a => ({ prompt: 'What is the past tense of…', big: W(a), say: a, wrong: [a + 'ed', a.replace(/e$/, '') + 'ed', a + 'ing'] })),
      ],
      words: midPics.slice(12),
    },
    5: {
      topics: [
        T('affix', 'Prefixes & suffixes', affixes, a => ({ prompt: 'What does this word mean?', big: a, say: a }), { long: true }),
        T('ant', 'Antonyms', antonyms5, a => ({ prompt: 'Choose the opposite of…', big: a, say: a })),
        { id: 'pos5', name: 'Parts of speech', gen: () => { const [w, p] = pick(pos5); return { prompt: 'What part of speech is this word?', big: w, say: w, answer: p, choices: choices(p, ['Noun', 'Verb', 'Adjective', 'Adverb', 'Pronoun', 'Preposition']) }; } },
        T('syn', 'Synonyms', synonyms, a => ({ prompt: 'Which word means the same as…', big: W(a), say: a })),
      ],
      words: hardPics.slice(0, 10),
    },
    6: {
      topics: [
        T('idiom', 'Idioms', idioms, a => ({ prompt: 'What does this idiom mean?', big: `“${a}”`, bigClass: 'sentence' }), { long: true }),
        T('analogy', 'Analogies', analogies, a => ({ prompt: 'Complete the analogy:', big: a, bigClass: 'sentence' }), { pair: null }),
        { id: 'tense', name: 'Verb tenses', long: true, gen: () => { const [s, t] = pick(tenses); return { prompt: 'Which tense is this sentence?', big: s, bigClass: 'sentence', answer: t, choices: choices(t, tenseNames) }; } },
        T('ant', 'Antonyms', antonyms5, a => ({ prompt: 'Choose the opposite of…', big: a, say: a })),
      ],
      words: hardPics.slice(8),
    },
  };

  SUBJECTS.english = { id: 'english', name: 'English', nameAr: 'الإنجليزية', icon: '🔤', lang: 'en', grades };
})();
