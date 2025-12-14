import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

const FALLBACK_QUOTES = [
  { text: "A reader lives a thousand lives before he dies. The man who never reads lives only one.", book: "George R.R. Martin" },
  { text: "The more that you read, the more things you will know. The more that you learn, the more places you'll go.", book: "Dr. Seuss" },
  { text: "Reading is essential for those who seek to rise above the ordinary.", book: "Jim Rohn" },
  { text: "Books are a uniquely portable magic.", book: "Stephen King" },
  { text: "So many books, so little time.", book: "Frank Zappa" },
  { text: "Reading is to the mind what exercise is to the body.", book: "Joseph Addison" },
  { text: "The reading of all good books is like conversation with the finest men of past centuries.", book: "René Descartes" },
  { text: "There is no friend as loyal as a book.", book: "Ernest Hemingway" },
  { text: "Ultra Hardcore > Hardcore", book: "Elon Musk" },
  { text: "The greatest gift is a passion for reading.", book: "Elizabeth Hardwick" },
  { text: "Reading is a discount ticket to everywhere.", book: "Mary Schmich" },
  { text: "Books are mirrors: you only see in them what you already have inside you.", book: "Carlos Ruiz Zafón" },
  { text: "Reading brings us unknown friends.", book: "Honoré de Balzac" },
  { text: "A book is a garden, an orchard, a storehouse, a party, a company by the way, a counselor, a multitude of counselors.", book: "Charles Baudelaire" },
  { text: "Reading is dreaming with open eyes.", book: "Anatole France" },
  { text: "The more you read, the more you know. The more you know, the smarter you grow.", book: "Seuss" },
  { text: "Books are the quietest and most constant of friends; they are the most accessible and wisest of counselors.", book: "Charles W. Eliot" },
  { text: "Reading is an exercise in empathy; an exercise in walking in someone else's shoes for a while.", book: "Malorie Blackman" },
  { text: "A reader without a book is like a soldier without a weapon.", book: "Proverb" },
  { text: "Books are the bees which carry the quickening pollen from one to another mind.", book: "James Russell Lowell" },
  { text: "Reading is the best way to prepare for life.", book: "Malala Yousafzai" },
  { text: "The world belongs to the readers because they alone can travel freely in time and space.", book: "Alberto Manguel" },
  { text: "Reading is a form of prayer, a sacred activity.", book: "Khalil Gibran" },
  { text: "Books are the perfect entertainment: no commercials, no batteries, no cords, no assembly required.", book: "Karin Slaughter" },
  { text: "Reading is an act of civilization; it's one of the greatest acts of civilization because it takes the free raw material of the mind and builds castles of possibilities.", book: "Ben Okri" },
  { text: "The man who does not read good books is no better than the man who can't.", book: "Mark Twain" },
  { text: "Reading is a means of thinking with another person's mind; it forces you to stretch your own.", book: "Charles Scribner Jr." },
  { text: "Books are not made for furniture, but there is nothing else that so beautifully furnishes a house.", book: "Henry Ward Beecher" },
  { text: "Reading is a possession, a march toward a possession.", book: "Thomas Merton" },
  { text: "The person who deserves most pity is a lonesome one on a rainy day who doesn't know how to read.", book: "Benjamin Franklin" },
  { text: "Reading is the key that opens doors to many good things in life.", book: "Unknown" },
  { text: "A book is a version of the world. If you do not like it, ignore it; or offer your own version in return.", book: "Salman Rushdie" },
  { text: "Reading is an active, imaginative act; it takes work.", book: "Khaled Hosseini" },
  { text: "Books are the treasured wealth of the world and the fit inheritance of generations and nations.", book: "Henry David Thoreau" },
  { text: "Reading is a way for us to expand our minds, transport to other worlds, and understand cultures, personalities, and places.", book: "Sonora Jha" },
  { text: "The best way to predict the future is to create it.", book: "Peter Drucker" },
  { text: "Reading is the best investment you can make.", book: "Warren Buffett" },
  { text: "Books are the legacy that the intelligent and the good leave to mankind.", book: "Edward Gibbon" },
  { text: "Reading is an art form, and like all art, it requires practice.", book: "Angela Carter" },
  { text: "The pleasure of all reading is doubled when one lives with another who shares the same books.", book: "Katherine Mansfield" },
  { text: "Reading is a conversation. All books talk. But a good book listens as well.", book: "Mark Haddon" },
  { text: "Books are the quietest and most constant of friends.", book: "Sydney Smith" },
  { text: "Reading is a form of resistance.", book: "bell hooks" },
  { text: "The world is a book and those who do not travel read only one page.", book: "Augustine of Hippo" },
  { text: "Reading is the work of the alert mind, is demanding, and under ideal conditions produces deeper satisfaction than TV.", book: "Edward P. Morgan" },
  { text: "Books are the carriers of civilization.", book: "Barbara Tuchman" },
  { text: "Reading is an active, productive, creative process.", book: "Louise Rosenblatt" },
  { text: "A book is like a garden carried in the pocket.", book: "Chinese Proverb" },
  { text: "Reading is a basic tool in the living of a good life.", book: "Joseph Addison" },
  { text: "Books are the plane, and the train, and the road. They are the destination, and the journey.", book: "Anna Quindlen" },
  { text: "Reading is a means of survival.", book: "Alice Walker" },
  { text: "The love of learning, the sequestered nooks, and all the sweet serenity of books.", book: "Henry Wadsworth Longfellow" },
  { text: "Reading is a gift to yourself.", book: "Oprah Winfrey" },
  { text: "Books are the compasses and telescopes and sextants and charts which other men have prepared to help us navigate the dangerous seas of human life.", book: "Jesse Lee Bennett" },
  { text: "Reading is the best medicine for a sick soul.", book: "Unknown" },
  { text: "A book is a dream that you hold in your hand.", book: "Neil Gaiman" },
  { text: "Reading is an exercise in empathy.", book: "Malorie Blackman" },
  { text: "Books are the windows through which the soul looks out.", book: "Henry Ward Beecher" },
  { text: "Reading is the gateway skill that makes all other learning possible.", book: "Barack Obama" },
  { text: "Books are a force for change.", book: "Malala Yousafzai" },
  { text: "Reading is a discount ticket to everywhere.", book: "Mary Schmich" },
  { text: "The world is a book, and those who do not travel read only a page.", book: "St. Augustine" },
  { text: "Books are the training weights of the mind.", book: "Epictetus" },
  { text: "Reading is an act of faith, not a trick of the mind.", book: "Madeleine L'Engle" },
  { text: "Books are the most patient teachers.", book: "Unknown" },
  { text: "Reading is a means of liberation.", book: "bell hooks" },
  { text: "Books are the foundation of any education.", book: "Unknown" },
  { text: "Reading is the best way to prepare for life.", book: "Malala Yousafzai" },
  { text: "Books are the quietest and most constant of friends.", book: "Sydney Smith" },
  { text: "Reading is dreaming with open eyes.", book: "Anatole France" },
  { text: "A book is a garden, an orchard, a storehouse.", book: "Charles Baudelaire" },
  { text: "Reading brings us unknown friends.", book: "Honoré de Balzac" },
  { text: "Books are mirrors: you only see in them what you already have inside you.", book: "Carlos Ruiz Zafón" },
  { text: "Reading is a discount ticket to everywhere.", book: "Mary Schmich" },
  { text: "Books are the quietest and most constant of friends.", book: "Sydney Smith" },
  { text: "Reading is dreaming with open eyes.", book: "Anatole France" },
  { text: "A book is a garden, an orchard, a storehouse.", book: "Charles Baudelaire" },
  { text: "Reading brings us unknown friends.", book: "Honoré de Balzac" },
  { text: "Books are mirrors: you only see in them what you already have inside you.", book: "Carlos Ruiz Zafón" },
  { text: "Reading is a discount ticket to everywhere.", book: "Mary Schmich" },
  { text: "Books are the quietest and most constant of friends.", book: "Sydney Smith" },
  { text: "Reading is dreaming with open eyes.", book: "Anatole France" },
  { text: "A book is a garden, an orchard, a storehouse.", book: "Charles Baudelaire" },
  { text: "Reading brings us unknown friends.", book: "Honoré de Balzac" },
  { text: "Books are mirrors: you only see in them what you already have inside you.", book: "Carlos Ruiz Zafón" },
  { text: "Reading is a discount ticket to everywhere.", book: "Mary Schmich" },
  { text: "Books are the quietest and most constant of friends.", book: "Sydney Smith" },
  { text: "Reading is dreaming with open eyes.", book: "Anatole France" },
  { text: "A book is a garden, an orchard, a storehouse.", book: "Charles Baudelaire" },
  { text: "Reading brings us unknown friends.", book: "Honoré de Balzac" },
  { text: "Books are mirrors: you only see in them what you already have inside you.", book: "Carlos Ruiz Zafón" },
  { text: "Reading is a discount ticket to everywhere.", book: "Mary Schmich" },
  { text: "Books are the quietest and most constant of friends.", book: "Sydney Smith" },
  { text: "Reading is dreaming with open eyes.", book: "Anatole France" },
  { text: "A book is a garden, an orchard, a storehouse.", book: "Charles Baudelaire" },
  { text: "Reading brings us unknown friends.", book: "Honoré de Balzac" },
  { text: "Books are mirrors: you only see in them what you already have inside you.", book: "Carlos Ruiz Zafón" },
  { text: "Reading is a discount ticket to everywhere.", book: "Mary Schmich" },
  { text: "Books are the quietest and most constant of friends.", book: "Sydney Smith" },
  { text: "Reading is dreaming with open eyes.", book: "Anatole France" },

  // MOTIVATION QUOTES
  { text: "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle.", book: "Steve Jobs" },
  { text: "Believe you can and you're halfway there.", book: "Theodore Roosevelt" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", book: "Eleanor Roosevelt" },
  { text: "Your time is limited, so don't waste it living someone else's life.", book: "Steve Jobs" },
  { text: "The way to get started is to quit talking and begin doing.", book: "Walt Disney" },
  { text: "Don't watch the clock; do what it does. Keep going.", book: "Sam Levenson" },
  { text: "The only limit to our realization of tomorrow will be our doubts of today.", book: "Franklin D. Roosevelt" },
  { text: "You miss 100% of the shots you don't take.", book: "Wayne Gretzky" },
  { text: "The best way to predict the future is to create it.", book: "Peter Drucker" },
  { text: "Don't be afraid to give up the good to go for the great.", book: "John D. Rockefeller" },
  { text: "Your most unhappy customers are your greatest source of learning.", book: "Bill Gates" },
  { text: "The only person you are destined to become is the person you decide to be.", book: "Ralph Waldo Emerson" },
  { text: "Go confidently in the direction of your dreams. Live the life you have imagined.", book: "Henry David Thoreau" },
  { text: "You must be the change you wish to see in the world.", book: "Mahatma Gandhi" },
  { text: "The journey of a thousand miles begins with one step.", book: "Lao Tzu" },

  // INSPIRATION QUOTES
  { text: "The mind is everything. What you think you become.", book: "Buddha" },
  { text: "The best and most beautiful things in the world cannot be seen or even touched - they must be felt with the heart.", book: "Helen Keller" },
  { text: "Keep your face always toward the sunshine—and shadows will fall behind you.", book: "Walt Whitman" },
  { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", book: "Ralph Waldo Emerson" },
  { text: "The only way to have a friend is to be one.", book: "Ralph Waldo Emerson" },
  { text: "In the middle of difficulty lies opportunity.", book: "Albert Einstein" },
  { text: "The purpose of life is a life of purpose.", book: "Robert Byrne" },
  { text: "You become what you believe.", book: "Oprah Winfrey" },
  { text: "The meaning of life is to find your gift. The purpose of life is to give it away.", book: "Pablo Picasso" },
  { text: "The best way to find yourself is to lose yourself in the service of others.", book: "Mahatma Gandhi" },
  { text: "What we achieve inwardly will change outer reality.", book: "Plutarch" },
  { text: "The soul always knows what to do to heal itself. The challenge is to silence the mind.", book: "Caroline Myss" },
  { text: "Your heart knows the way. Run in that direction.", book: "Rumi" },
  { text: "The wound is the place where the Light enters you.", book: "Rumi" },
  { text: "Be the change that you wish to see in the world.", book: "Mahatma Gandhi" },

  // REALIZATION & AWAKENING
  { text: "The truth is, unless you let go, unless you forgive yourself, unless you forgive the situation, unless you realize that the situation is over, you cannot move forward.", book: "Steve Maraboli" },
  { text: "Sometimes, to solve problems, you need to change your perception and thinking.", book: "Unknown" },
  { text: "The moment you realize that you are not present, you are present.", book: "Eckhart Tolle" },
  { text: "Reality is merely an illusion, albeit a very persistent one.", book: "Albert Einstein" },
  { text: "The only reason we don't open our hearts and minds to other people is that they trigger confusion in us that we don't feel brave enough to deal with.", book: "Pema Chödrön" },
  { text: "Everything that irritates us about others can lead us to an understanding of ourselves.", book: "Carl Jung" },
  { text: "The meeting of two personalities is like the contact of two chemical substances: if there is any reaction, both are transformed.", book: "Carl Jung" },
  { text: "Your visions will become clear only when you can look into your own heart. Who looks outside, dreams; who looks inside, awakes.", book: "Carl Jung" },
  { text: "The first step toward getting somewhere is to decide that you are not going to stay where you are.", book: "J.P. Morgan" },
  { text: "When one door of happiness closes, another opens; but often we look so long at the closed door that we do not see the one which has been opened for us.", book: "Helen Keller" },
  { text: "Sometimes it takes a heartbreak to shake us awake and help us see we are worth so much more than we're settling for.", book: "Mandy Hale" },
  { text: "The truth will set you free, but first it will piss you off.", book: "Gloria Steinem" },
  { text: "You can't change what's going on around you until you start changing what's going on within you.", book: "Unknown" },
  { text: "The key to realizing a dream is to focus not on success but significance, and then even the small steps and little victories along your path will take on greater meaning.", book: "Oprah Winfrey" },
  { text: "Sometimes the wrong choices bring us to the right places.", book: "Unknown" },

  // WISDOM QUOTES
  { text: "Knowing yourself is the beginning of all wisdom.", book: "Aristotle" },
  { text: "The only true wisdom is in knowing you know nothing.", book: "Socrates" },
  { text: "Wisdom is not a product of schooling but of the lifelong attempt to acquire it.", book: "Albert Einstein" },
  { text: "The wise man does not lay up his own treasures. The more he gives to others, the more he has for his own.", book: "Lao Tzu" },
  { text: "Wisdom is the right use of knowledge. To know is not to be wise. Many men know a great deal, and are all the greater fools for it. There is no fool so great a fool as a knowing fool. But to know how to use knowledge is to have wisdom.", book: "Charles Spurgeon" },
  { text: "The function of wisdom is to discriminate between good and evil.", book: "Marcus Tullius Cicero" },
  { text: "Wisdom is the supreme part of happiness.", book: "Sophocles" },
  { text: "A wise man learns from the mistakes of others, a fool from his own.", book: "Unknown" },
  { text: "The wise man speaks because he has something to say; the fool because he has to say something.", book: "Plato" },
  { text: "Wisdom comes from experience. Experience is often a result of lack of wisdom.", book: "Terry Pratchett" },
  { text: "The older I grow, the more I listen to people who don't say much.", book: "Germaine Greer" },
  { text: "Wisdom is knowing what to do next; virtue is doing it.", book: "David Starr Jordan" },
  { text: "The wise learn from experience, but the foolish are doomed to repeat it.", book: "Unknown" },
  { text: "Wisdom is the daughter of experience.", book: "Leonardo da Vinci" },
  { text: "True wisdom comes to each of us when we realize how little we understand about life, ourselves, and the world around us.", book: "Socrates" },

  // SUCCESS QUOTES
  { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", book: "Winston Churchill" },
  { text: "The road to success and the road to failure are almost exactly the same.", book: "Colin R. Davis" },
  { text: "Success usually comes to those who are too busy to be looking for it.", book: "Henry David Thoreau" },
  { text: "Don't be distracted by criticism. Remember—the only taste of success some people get is to take a bite out of you.", book: "Zig Ziglar" },
  { text: "Success is walking from failure to failure with no loss of enthusiasm.", book: "Winston Churchill" },
  { text: "The way to succeed is to double your error rate.", book: "Thomas J. Watson" },
  { text: "Success is not the key to happiness. Happiness is the key to success. If you love what you are doing, you will be successful.", book: "Albert Schweitzer" },
  { text: "Success is not in what you have, but who you are.", book: "Bo Bennett" },
  { text: "Success is not measured by what you accomplish, but by the opposition you have encountered, and the courage with which you have maintained the struggle against overwhelming odds.", book: "Orison Swett Marden" },
  { text: "The successful warrior is the average man, with laser-like focus.", book: "Bruce Lee" },
  { text: "Success is to be measured not so much by the position that one has reached in life as by the obstacles which he has overcome.", book: "Booker T. Washington" },
  { text: "Success is not for the chosen few, but for the few who choose it.", book: "Unknown" },
  { text: "The secret of success is to know something nobody else knows.", book: "Aristotle Onassis" },
  { text: "Success is getting what you want, happiness is wanting what you get.", book: "W.P. Kinsella" },
  { text: "Success is a journey, not a destination. The doing is often more important than the outcome.", book: "Arthur Ashe" },

  // CREATIVITY QUOTES
  { text: "Creativity is intelligence having fun.", book: "Albert Einstein" },
  { text: "The creative adult is the child who survived.", book: "Ursula K. Le Guin" },
  { text: "You can't use up creativity. The more you use, the more you have.", book: "Maya Angelou" },
  { text: "Creativity is allowing yourself to make mistakes. Art is knowing which ones to keep.", book: "Scott Adams" },
  { text: "The worst enemy to creativity is self-doubt.", book: "Sylvia Plath" },
  { text: "Creativity requires the courage to let go of certainties.", book: "Erich Fromm" },
  { text: "Creativity is a wild mind and a disciplined eye.", book: "Dorothy Parker" },
  { text: "To be creative means to be in love with life.", book: "Osho" },
  { text: "The chief enemy of creativity is 'good' sense.", book: "Pablo Picasso" },
  { text: "Creativity is the power to connect the seemingly unconnected.", book: "William Plomer" },
  { text: "Every child is an artist. The problem is how to remain an artist once we grow up.", book: "Pablo Picasso" },
  { text: "Creativity is contagious, pass it on.", book: "Albert Einstein" },
  { text: "The creative process is a process of surrender, not control.", book: "Julia Cameron" },
  { text: "Creativity is the way I share my soul with the world.", book: "Brene Brown" },
  { text: "Originality is nothing but judicious imitation.", book: "Voltaire" },

  // KNOWLEDGE QUOTES
  { text: "Knowledge is power.", book: "Francis Bacon" },
  { text: "The beautiful thing about learning is that no one can take it away from you.", book: "B.B. King" },
  { text: "Knowledge speaks, but wisdom listens.", book: "Jimi Hendrix" },
  { text: "The more I read, the more I acquire, the more certain I am that I know nothing.", book: "Voltaire" },
  { text: "Knowledge is the antidote to fear.", book: "Ralph Waldo Emerson" },
  { text: "The greatest enemy of knowledge is not ignorance, it is the illusion of knowledge.", book: "Stephen Hawking" },
  { text: "Knowledge is like money: to be of value it must circulate, and in circulating it can increase in quantity and, hopefully, in value.", book: "Louis L'Amour" },
  { text: "Knowledge is the eye of desire and can become the pilot of the soul.", book: "Will Durant" },
  { text: "The beginning of knowledge is the discovery of something we do not understand.", book: "Frank Herbert" },
  { text: "Knowledge is of no value unless you put it into practice.", book: "Anton Chekhov" },
  { text: "Knowledge is the treasure of a wise man.", book: "William Penn" },
  { text: "The more you know, the more you realize you know nothing.", book: "Socrates" },
  { text: "Knowledge is a weapon. I intend to be formidably armed.", book: "Terry Goodkind" },
  { text: "Knowledge is the key to opening the golden door of freedom.", book: "Marie Curie" },
  { text: "The goal of education is the advancement of knowledge and the dissemination of truth.", book: "John F. Kennedy" },

  // IMAGINATION QUOTES
  { text: "Imagination is more important than knowledge.", book: "Albert Einstein" },
  { text: "Imagination is the beginning of creation. You imagine what you desire, you will what you imagine, and at last you create what you will.", book: "George Bernard Shaw" },
  { text: "Logic will get you from A to B. Imagination will take you everywhere.", book: "Albert Einstein" },
  { text: "The true sign of intelligence is not knowledge but imagination.", book: "Albert Einstein" },
  { text: "Imagination is the voice of daring. If there is anything Godlike about God it is that. He dared to imagine everything.", book: "Henry Miller" },
  { text: "You can't depend on your eyes when your imagination is out of focus.", book: "Mark Twain" },
  { text: "Imagination is the highest kite one can fly.", book: "Lauren Bacall" },
  { text: "Reality leaves a lot to the imagination.", book: "John Lennon" },
  { text: "The world is but a canvas to the imagination.", book: "Henry David Thoreau" },
  { text: "Imagination is the eye of the soul.", book: "Joseph Joubert" },
  { text: "Without imagination, we wouldn't have the wheel, the light bulb, or even the printing press.", book: "Unknown" },
  { text: "Imagination will often carry us to worlds that never were, but without it we go nowhere.", book: "Carl Sagan" },
  { text: "The imagination is man's power over nature.", book: "Wallace Stevens" },
  { text: "Imagination is the living power and prime agent of all human perception.", book: "Samuel Taylor Coleridge" },
  { text: "Laughter is timeless, imagination has no age, and dreams are forever.", book: "Walt Disney" },

  // TRANSFORMATION QUOTES
  { text: "Change is the law of life. And those who look only to the past or present are certain to miss the future.", book: "John F. Kennedy" },
  { text: "The only way to make sense out of change is to plunge into it, move with it, and join the dance.", book: "Alan Watts" },
  { text: "If you don't like something, change it. If you can't change it, change your attitude.", book: "Maya Angelou" },
  { text: "Transformation is a process, and as life happens there are tons of ups and downs. It's a journey of discovery - there are moments on mountaintops and moments in deep valleys of despair.", book: "Rick Warren" },
  { text: "The caterpillar does all the work, but the butterfly gets all the publicity.", book: "George Carlin" },
  { text: "What the caterpillar calls the end of the world, the master calls a butterfly.", book: "Richard Bach" },
  { text: "Transformation literally means going beyond your form.", book: "Wayne Dyer" },
  { text: "The secret of change is to focus all of your energy, not on fighting the old, but on building the new.", book: "Socrates" },
  { text: "If nothing ever changed, there'd be no butterflies.", book: "Unknown" },
  { text: "Growth is the only evidence of life.", book: "John Henry Newman" },
  { text: "The world as we have created it is a process of our thinking. It cannot be changed without changing our thinking.", book: "Albert Einstein" },
  { text: "You must grow strong enough to love the world, yet empty enough to sit down at the same table with its worst horrors.", book: "Thich Nhat Hanh" },
  { text: "The day science begins to study non-physical phenomena, it will make more progress in one decade than in all the previous centuries of its existence.", book: "Nikola Tesla" },
  { text: "Transformation does not start with some one big drama, for transformation is not a process of the event, but a process of the soul.", book: "Elaine MacInnes" },
  { text: "The first step to getting what you want is having the courage to get rid of what you don't.", book: "Unknown" },

  // PERSEVERANCE QUOTES
  { text: "The difference between a successful person and others is not a lack of strength, not a lack of knowledge, but rather a lack in will.", book: "Vince Lombardi" },
  { text: "Our greatest glory is not in never falling, but in rising every time we fall.", book: "Confucius" },
  { text: "Perseverance is failing 19 times and succeeding the 20th.", book: "Julie Andrews" },
  { text: "The only way out is through.", book: "Robert Frost" },
  { text: "Fall seven times, stand up eight.", book: "Japanese Proverb" },
  { text: "Perseverance is not a long race; it is many short races one after the other.", book: "Walter Elliot" },
  { text: "The road to success is dotted with many tempting parking spaces.", book: "Will Rogers" },
  { text: "Courage doesn't always roar. Sometimes courage is the quiet voice at the end of the day saying, 'I will try again tomorrow.'", book: "Mary Anne Radmacher" },
  { text: "Success is no accident. It is hard work, perseverance, learning, studying, sacrifice and most of all, love of what you are doing or learning to do.", book: "Pelé" },
  { text: "The harder the battle, the sweeter the victory.", book: "Les Brown" },
  { text: "Perseverance, secret of all triumphs.", book: "Victor Hugo" },
  { text: "Keep on going, and the chances are that you will stumble on something, perhaps when you are least expecting it. I never heard of anyone ever stumbling on something sitting down.", book: "Charles F. Kettering" },
  { text: "It does not matter how slowly you go as long as you do not stop.", book: "Confucius" },
  { text: "The man who moves a mountain begins by carrying away small stones.", book: "Confucius" },
  { text: "Through perseverance many people win success out of what seemed destined to be certain failure.", book: "Benjamin Disraeli" },

  // ADDITIONAL MOTIVATIONAL QUOTES
  { text: "The pessimist complains about the wind; the optimist expects it to change; the realist adjusts the sails.", book: "William Arthur Ward" },
  { text: "What you get by achieving your goals is not as important as what you become by achieving your goals.", book: "Zig Ziglar" },
  { text: "The question isn't who is going to let me; it's who is going to stop me.", book: "Ayn Rand" },
  { text: "When everything seems to be going against you, remember that the airplane takes off against the wind, not with it.", book: "Henry Ford" },
  { text: "It's not whether you get knocked down, it's whether you get up.", book: "Vince Lombardi" },
  { text: "The only impossible journey is the one you never begin.", book: "Tony Robbins" },
  { text: "Your life does not get better by chance, it gets better by change.", book: "Jim Rohn" },
  { text: "The secret of getting ahead is getting started.", book: "Mark Twain" },
  { text: "Don't limit your challenges. Challenge your limits.", book: "Unknown" },
  { text: "The expert in anything was once a beginner.", book: "Helen Hayes" },
  { text: "The only limit to our realization of tomorrow will be our doubts of today.", book: "Franklin D. Roosevelt" },
  { text: "Action is the foundational key to all success.", book: "Pablo Picasso" },
  { text: "The successful man will profit from his mistakes and try again in a different way.", book: "Dale Carnegie" },
  { text: "Success is not how high you have climbed, but how you make a positive difference to the world.", book: "Roy T. Bennett" },
  { text: "The way to develop self-confidence is to do the thing you fear and get a record of successful experiences behind you.", book: "William Jennings Bryan" }
]

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const daily = searchParams.get("daily") === "true"

    if (daily) {
      // Get daily quote (random quote from user's quotes, or fallback)
      const userQuotes = await db.quote.findMany({
        where: { userId: session.user.id },
        include: {
          book: {
            select: {
              title: true,
              author: true,
            },
          },
        },
      })

      if (userQuotes.length > 0) {
        // Use date to get consistent daily quote
        const today = new Date()
        const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000)
        const quoteIndex = dayOfYear % userQuotes.length
        const selectedQuote = userQuotes[quoteIndex]

        return NextResponse.json({
          id: selectedQuote.id,
          quoteText: selectedQuote.quoteText,
          bookTitle: selectedQuote.book?.title || null,
          bookAuthor: selectedQuote.book?.author || null,
          pageNumber: selectedQuote.pageNumber,
          bookId: selectedQuote.bookId,
          isUserQuote: true,
        })
      } else {
        // Use fallback quote
        const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
        const fallbackIndex = dayOfYear % FALLBACK_QUOTES.length
        const fallback = FALLBACK_QUOTES[fallbackIndex]

        return NextResponse.json({
          quoteText: fallback.text,
          bookTitle: null,
          bookAuthor: fallback.book,
          pageNumber: null,
          isUserQuote: false,
        })
      }
    }

    // Get all user quotes
    const quotes = await db.quote.findMany({
      where: { userId: session.user.id },
      include: {
        book: {
          select: {
            title: true,
            author: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(quotes)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch quotes" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { quoteText, bookId, pageNumber } = body

    if (!quoteText) {
      return NextResponse.json(
        { error: "Quote text is required" },
        { status: 400 }
      )
    }

    // Verify book belongs to user if bookId is provided
    if (bookId) {
      const book = await db.book.findUnique({
        where: { id: bookId },
      })

      if (!book || book.userId !== session.user.id) {
        return NextResponse.json(
          { error: "Book not found" },
          { status: 404 }
        )
      }
    }

    const quote = await db.quote.create({
      data: {
        userId: session.user.id,
        quoteText,
        bookId: bookId || null,
        pageNumber: pageNumber ? parseInt(pageNumber) : null,
      },
      include: {
        book: {
          select: {
            title: true,
            author: true,
          },
        },
      },
    })

    return NextResponse.json(quote, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create quote" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Quote ID is required" },
        { status: 400 }
      )
    }

    const quote = await db.quote.findUnique({
      where: { id },
    })

    if (!quote || quote.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Quote not found" },
        { status: 404 }
      )
    }

    await db.quote.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete quote" },
      { status: 500 }
    )
  }
}