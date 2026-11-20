import type { PracticeTopic } from './topics';

export interface Passage {
  topic: PracticeTopic;
  title: string;
  text: string;
}

/**
 * The passages practice texts are assembled from. Each one stands alone, so
 * they can be combined in any order. To add material, add passages here:
 * about eighty words, one idea, nothing that depends on another passage.
 */
export const PASSAGES: Passage[] = [
  {
    topic: 'nature',
    title: 'Why leaves change color',
    text: 'Leaves are green because they are full of chlorophyll, the pigment that captures sunlight. All summer a tree keeps making it, replacing what the sun wears out. When the days shorten in autumn, the tree stops, and the green fades. Yellow and orange pigments that were there the whole time finally show through. Reds and purples are different: they are made fresh in autumn from sugars trapped in the leaf, which is why bright days and cool nights produce the most vivid color.',
  },
  {
    topic: 'nature',
    title: 'How bees give directions',
    text: 'A honeybee that finds a rich patch of flowers flies home and dances. She runs in a straight line across the comb, waggling her body, then circles back and repeats it. The angle of the run, measured against straight up, matches the angle between the flowers and the sun. The length of the waggle tells the distance. Other bees follow her in the dark of the hive, read the dance by touch, and fly out to the right place.',
  },
  {
    topic: 'nature',
    title: 'What tree rings record',
    text: 'Cut across a tree trunk and you see rings, one for each year of growth. Where the seasons differ, a tree adds wide, pale wood in spring and narrow, dark wood in late summer, and the pair makes one ring. A wet year leaves a broad ring and a dry year a thin one, so a trunk is a diary of the weather. By matching patterns between living trees and old timber, scientists have built records that run back thousands of years.',
  },
  {
    topic: 'nature',
    title: 'Why the sea is salty',
    text: 'Rain is slightly acidic, and as it runs over rock it dissolves tiny amounts of minerals. Rivers carry them to the sea. A river never tastes salty because its water keeps moving on, but the ocean has no outlet. Water leaves it only by evaporating, and the salts stay behind. Over billions of years they have built up, until every liter of seawater now holds about thirty-five grams of salt, most of it the same sodium chloride found in a kitchen.',
  },
  {
    topic: 'nature',
    title: 'How birds find their way',
    text: 'Each year billions of birds travel thousands of miles between summer and winter homes, often returning to the very same tree. They steer by several compasses at once. They read the position of the sun by day and the pattern of the stars by night. They sense the magnetic field of the Earth, and they remember coastlines, rivers and mountains. The Arctic tern makes the longest journey of all, flying from the Arctic to the Antarctic and back every year.',
  },
  {
    topic: 'nature',
    title: 'The mind of an octopus',
    text: 'An octopus has about five hundred million nerve cells, far more than any other animal without a backbone, but most of them are not in its head. Two thirds lie in its eight arms, which can taste what they touch and solve small problems on their own. The animal has three hearts and blue blood. It can change the color and texture of its skin in less than a second, squeeze through any gap wider than its beak, and learn to unscrew a jar.',
  },
  {
    topic: 'nature',
    title: 'What makes a desert',
    text: 'A desert is defined by dryness, not heat. Any place that receives less than about twenty-five centimeters of rain or snow a year counts as one. By that measure the largest desert on Earth is Antarctica, where what little snow falls never melts. The Sahara is the largest hot desert. Desert life is built around waiting: seeds lie in the ground for years, and when rain finally comes, plants sprout, flower and scatter new seed within a few weeks.',
  },
  {
    topic: 'nature',
    title: 'The hidden partners of trees',
    text: 'Beneath a forest floor, fine threads of fungus wrap around the roots of trees and reach out into the soil. The threads are far thinner than roots and can explore spaces roots cannot. They gather water and minerals such as phosphorus and pass them to the tree. In return the tree pays in sugar made in its leaves. Most land plants depend on a partnership like this, and it is one of the oldest alliances in the living world.',
  },
  {
    topic: 'nature',
    title: 'Why volcanoes erupt',
    text: 'Deep underground, rock melts into magma, which is lighter than the solid rock around it and slowly rises. Magma holds dissolved gas, much as a sealed bottle of soda does. Near the surface the pressure drops and the gas comes out as bubbles. If the magma is runny, the gas escapes easily and lava pours out in rivers. If it is thick and sticky, the gas is trapped until it bursts free, and the eruption is an explosion.',
  },
  {
    topic: 'nature',
    title: 'Why the tide comes in',
    text: 'The gravity of the Moon pulls on the Earth, and the oceans, being free to move, bulge toward it. A second bulge forms on the far side of the planet. As the Earth turns, most coasts pass through both bulges each day, which gives two high tides and two low ones. The Sun pulls too. When Sun and Moon line up, at new and full moon, their pulls combine and the tides are at their highest. A week later they are at their weakest.',
  },

  {
    topic: 'science',
    title: 'Why the sky is blue',
    text: 'Sunlight looks white but is a mix of every color. When it enters the atmosphere, it strikes molecules of air, which scatter it in all directions. Blue light is scattered several times more strongly than red, so blue reaches your eyes from every part of the sky. At sunset the light has to cross far more air to reach you. Most of the blue is scattered away before it arrives, and what is left is orange and red.',
  },
  {
    topic: 'science',
    title: 'What temperature measures',
    text: 'Everything is made of atoms and molecules that never stop moving. Temperature is a measure of that motion: the faster the particles jiggle on average, the hotter the object. Heat always flows from faster particles to slower ones, which is why a hot drink cools and a cold one warms. There is a lowest possible temperature, called absolute zero, where the motion is as small as it can be. It lies at minus 273.15 degrees Celsius.',
  },
  {
    topic: 'science',
    title: 'How a vaccine works',
    text: 'A vaccine shows the body a harmless piece of a germ, or a weakened form of it. The immune system reacts as if the threat were real. It makes antibodies that fit the invader, and it keeps memory cells that remember the shape for years. If the real germ arrives later, the defense starts at once instead of from nothing. The first vaccine, against smallpox, was tested in 1796. By 1980 the disease had been wiped out worldwide.',
  },
  {
    topic: 'science',
    title: 'The speed of light',
    text: 'Light travels at about three hundred thousand kilometers every second, fast enough to circle the Earth more than seven times in that second. Even so, it takes time to cross space. Sunlight is a little over eight minutes old when it reaches you. The light of the nearest other star left it more than four years ago. To look far out into the night sky is to look into the past, and nothing made of matter can travel as fast.',
  },
  {
    topic: 'science',
    title: 'Why ice floats',
    text: 'Most substances shrink and grow denser when they freeze. Water does the opposite. As it turns to ice, its molecules lock into an open pattern of six-sided rings that takes up more room than the liquid did. Ice is about nine percent lighter than the same volume of water, so it floats. This matters to every pond. A lake freezes from the top down, and the layer of ice shields the water below, where fish and plants survive the winter.',
  },
  {
    topic: 'science',
    title: 'What DNA is for',
    text: 'Inside nearly every cell of your body is a copy of your DNA, a long molecule shaped like a twisted ladder. Each rung is a pair of chemical letters, and there are only four letters in all. Their order spells out the instructions for building the proteins that do most of the work of a living thing. A human set of instructions runs to about three billion pairs of letters. Stretched out, the DNA from one cell would be about two meters long.',
  },
  {
    topic: 'science',
    title: 'How old the Earth is',
    text: 'Some atoms are unstable and change into other atoms at a steady, known rate. Uranium, for example, slowly turns into lead. By measuring how much of each is locked inside a crystal, scientists can tell how long ago the crystal formed, the way sand in an hourglass tells how long it has been running. The oldest minerals found on Earth are about 4.4 billion years old. Meteorites left over from the birth of the planets give the age of the Earth itself: about 4.5 billion years.',
  },
  {
    topic: 'science',
    title: 'What sleep does',
    text: 'Sleep looks like doing nothing, but the brain is busy. It replays what happened during the day and stores some of it for the long term, which is one reason a lesson is easier to recall after a night of rest. Research suggests that fluid also washes through the brain and carries away waste that built up while you were awake. The body repairs muscle and releases growth hormone. Most adults need seven to nine hours, and losing even a little dulls attention the next day.',
  },
  {
    topic: 'science',
    title: 'The placebo effect',
    text: 'Give people a pill with no medicine in it, tell them it may help, and many will feel better. This is the placebo effect, and it is not imaginary: expecting relief changes how the brain handles pain and other symptoms. It is the reason new drugs are tested against dummy pills. In a fair trial neither the patients nor their doctors know who received which, so that hope alone cannot be mistaken for a cure. A drug must beat the placebo to count.',
  },
  {
    topic: 'science',
    title: 'How sound travels',
    text: 'Sound is a vibration passed from one particle to the next. A clap pushes the air beside your hands, that air pushes the air next to it, and a wave of pressure spreads outward. In air it moves at about 340 meters a second. It travels more than four times faster through water and faster still through steel, because their particles are bound more tightly and pass the push along more quickly. In empty space there is nothing to push, so there is no sound.',
  },

  {
    topic: 'history',
    title: 'The first writing',
    text: 'The oldest writing we know of comes from the city of Uruk, in what is now Iraq, and it is more than five thousand years old. It was not poetry or law. It was bookkeeping: marks pressed into wet clay to count sheep, grain and jars of beer. Over centuries the marks grew into a full script that could record anything people said. Writing was later invented again, quite independently, in China and in Central America.',
  },
  {
    topic: 'history',
    title: 'The printing press',
    text: 'Around 1450, in the German city of Mainz, Johannes Gutenberg began printing with metal letters that could be arranged, inked, pressed and used again. Until then most European books were copied by hand, and one could take a scribe months. The press could turn out hundreds of copies in the same time. Within fifty years, millions of printed books were in circulation. Ideas that once reached a few scholars could now reach whole towns, and they spread faster than anyone could control.',
  },
  {
    topic: 'history',
    title: 'Roman roads',
    text: 'At its height the Roman Empire was tied together by about eighty thousand kilometers of paved road. Builders dug a trench, filled it with layers of stone and gravel, and capped it with fitted slabs, raised in the middle so that rain ran off. The roads were made for marching armies, and they ran as straight as the land allowed. Traders, messengers and travelers used them too. Many modern European highways still follow the lines the Roman surveyors chose.',
  },
  {
    topic: 'history',
    title: 'The Silk Road',
    text: 'For more than a thousand years, a web of trade routes joined China to the Mediterranean. Silk traveled west along it, and so did paper, spices and porcelain, while glass, silver and horses went east. Hardly anyone made the whole journey. Goods passed from one merchant to the next, growing dearer at every stop. Religions, inventions and diseases moved along the same paths. The name Silk Road is recent. A German geographer coined it in 1877.',
  },
  {
    topic: 'history',
    title: 'The first cities',
    text: 'Farming let people stay in one place and grow more food than they needed themselves. That surplus made cities possible. By about five thousand years ago, Uruk, on the river Euphrates, held tens of thousands of people behind its walls. Not everyone had to work the fields any longer. Some became potters, weavers, priests or soldiers, and some became officials who kept track of it all. With the city came taxes, laws, monuments and, before long, the first written records.',
  },
  {
    topic: 'history',
    title: 'The Library of Alexandria',
    text: 'Soon after 300 BCE, the Greek rulers of Egypt set out to gather all the books of the world in one place. Their library at Alexandria bought and borrowed scrolls from everywhere. Ships entering the harbor were searched, and any book on board was copied. Scholars who worked there measured the size of the Earth and mapped the stars. The library was not lost in a single famous fire. It faded over centuries, as money, peace and interest ran out.',
  },
  {
    topic: 'history',
    title: 'Why there is a leap day',
    text: 'The Earth takes about 365 and a quarter days to circle the Sun. In 46 BCE Julius Caesar fixed the calendar at 365 days, with an extra day every fourth year. That was slightly too much, by about eleven minutes a year. By the 1500s the calendar had slipped ten days out of step with the seasons. In 1582 Pope Gregory the Thirteenth dropped those ten days and adjusted the rule: century years are leap years only if they divide by four hundred.',
  },
  {
    topic: 'history',
    title: 'The Black Death',
    text: 'In 1347 ships from the Black Sea brought plague to the ports of Italy. Within five years it had swept across Europe and killed somewhere between a third and a half of the people. Nobody then knew the cause, a bacterium spread by the fleas of rats. The loss changed how the survivors lived. With so few hands left to work the land, laborers could demand higher wages, and the old system that tied peasants to a lord began to break down.',
  },
  {
    topic: 'history',
    title: 'The first flight',
    text: 'On December 17, 1903, on a windy beach in North Carolina, Orville Wright flew a powered airplane for twelve seconds and covered thirty-seven meters. He and his brother Wilbur made four flights that day, the longest lasting almost a minute. Others had built engines and wings. The real breakthrough of the brothers was control: a way to twist the wings so the pilot could balance and turn. Sixty-six years later, people walked on the Moon.',
  },
  {
    topic: 'history',
    title: 'The Rosetta Stone',
    text: 'For more than a thousand years nobody could read Egyptian hieroglyphs. Then, in 1799, French soldiers in Egypt dug up a broken slab of dark stone. It carried the same announcement three times: in hieroglyphs, in a simpler Egyptian script, and in Greek, which scholars could read. Using the Greek as a key, Jean-François Champollion worked out the hieroglyphs in 1822. Three thousand years of Egyptian writing could suddenly speak again.',
  },

  {
    topic: 'technology',
    title: 'How a message crosses the internet',
    text: 'When you send a photo, it does not travel in one piece. It is cut into small packets, each labeled with the address it is going to and its place in the sequence. The packets set off separately and may take different routes, handed from one router to the next. At the far end they are put back in order, and any that went missing are sent again. The method was designed in the 1960s so that a network could keep working when parts of it failed.',
  },
  {
    topic: 'technology',
    title: 'What a transistor does',
    text: 'A transistor is a switch with no moving parts. A small electrical signal at one terminal decides whether current can flow between the other two. On means one and off means zero, and from those two values every calculation is built. The first transistor, made in 1947, was the size of a thumb. The ones in a modern phone are a few billionths of a meter across, and a single chip holds more than ten billion of them.',
  },
  {
    topic: 'technology',
    title: 'How GPS finds you',
    text: 'About thirty satellites circle the Earth, each carrying an atomic clock and broadcasting the exact time. Your phone listens. Because the signals travel at the speed of light, the tiny delay before each one arrives tells how far away that satellite is. With distances to four satellites, the phone can work out where it must be. The clocks have to be astonishingly precise. An error of one millionth of a second would put you three hundred meters off.',
  },
  {
    topic: 'technology',
    title: 'Why batteries wear out',
    text: 'A rechargeable battery works by moving lithium ions back and forth between two electrodes. Charging pushes them one way, and using the battery lets them flow back. The trip is never perfectly clean. Each cycle, a little lithium gets locked up in unwanted side reactions and can no longer move. After a few hundred cycles the loss becomes noticeable. Heat speeds it up, and so does keeping the battery completely full, which is why many devices now pause charging at eighty percent.',
  },
  {
    topic: 'technology',
    title: 'How a touchscreen feels a finger',
    text: 'Under the glass of a phone lies a grid of transparent wires holding a faint electric charge. Your body conducts electricity, so when a fingertip comes close, it draws a little of that charge toward itself. A chip checks the grid hundreds of times a second, notices where the charge dipped, and reports the spot. That is why the screen ignores a pencil or an ordinary glove. They do not conduct, so as far as the grid can tell, nothing touched it.',
  },
  {
    topic: 'technology',
    title: 'What the cloud really is',
    text: 'The cloud is not in the sky. It is a set of very large buildings, filled with rows of computers and cooled day and night. When you save a file to the cloud, it is copied onto several of those machines, often in different cities, so that one failure cannot destroy it. Almost all the data moving between continents travels not by satellite but through cables laid on the sea floor, each no thicker than a garden hose.',
  },
  {
    topic: 'technology',
    title: 'How a search engine reads the web',
    text: 'A search engine does not search the web when you type. It has already read it. Programs called crawlers follow links from page to page, copying what they find. The copies are turned into an index, much like the one at the back of a book, listing every word and the pages where it appears. Your question is looked up in that index. Then the matches are ranked, partly by how many other pages link to them, all in a fraction of a second.',
  },
  {
    topic: 'technology',
    title: 'The square code on everything',
    text: 'The QR code was invented in 1994 at a Japanese company that needed a better way to track car parts. An ordinary barcode stores a few dozen characters in one direction. The square version stores information across and down, and can hold thousands. The three large squares in its corners tell a camera which way up it is. The code also carries extra data for correcting errors, so it can still be read when it is scratched, dirty or partly torn away.',
  },
  {
    topic: 'technology',
    title: 'How headphones cancel noise',
    text: 'Sound is a wave of rising and falling air pressure. Noise-canceling headphones use that fact. Small microphones on the outside listen to the sound around you. A chip then makes the speakers play the same wave turned upside down, with a dip wherever the noise has a peak. When the two meet in your ear they cancel, and you hear much less. It works best on steady, low sounds like an engine, and less well on sudden ones like a shout.',
  },
  {
    topic: 'technology',
    title: 'How a website keeps your password',
    text: 'A careful website never stores your password. It runs the password through a mathematical scrambler called a hash and stores only the result. The scrambling works in one direction: easy to do, practically impossible to undo. When you log in, the site scrambles what you typed and checks whether the results match. A thief who steals the list gets only scrambles, and must guess passwords one by one to find a match. Every extra character you add multiplies the guesses needed.',
  },

  {
    topic: 'everyday',
    title: 'Why coffee wakes you up',
    text: 'While you are awake, a chemical called adenosine slowly builds up in your brain, and the more of it there is, the sleepier you feel. Caffeine has a similar shape. It slips into the places where adenosine would attach and blocks them, so the brain does not get the message that it is tired. The tiredness is hidden, not removed. Caffeine also lingers. About half of it is still in your body five hours after the cup.',
  },
  {
    topic: 'everyday',
    title: 'How soap cleans',
    text: 'Water alone cannot wash away grease, because oil and water do not mix. A soap molecule solves this by being two things at once. One end is attracted to water and the other to oil. The oil-loving ends bury themselves in a spot of grease, the water-loving ends stay outside, and the grease is wrapped in a tiny bubble that rinses away. The same action pulls apart the fatty coating of many germs, which is why washing your hands works.',
  },
  {
    topic: 'everyday',
    title: 'Why bread rises',
    text: 'Bread rises because of yeast, a living, single-celled fungus. Mixed into dough, the yeast feeds on sugars in the flour and gives off carbon dioxide gas. Meanwhile, kneading has turned the proteins in the flour into gluten, a stretchy net that traps the gas in thousands of small pockets. The dough swells. In the oven the gas expands further, the heat sets the net in place, and the pockets become the holes you see in a slice.',
  },
  {
    topic: 'everyday',
    title: 'How a habit forms',
    text: 'A habit has three parts: a cue, a routine and a reward. The cue might be a time of day, the routine a walk, the reward the feeling afterward. Each repetition ties the three more closely together, until the cue starts the routine with hardly any thought. That is why habits are easiest to build when the cue never changes. It takes time. In one study, a new daily habit took about two months on average to become automatic.',
  },
  {
    topic: 'everyday',
    title: 'Why onions make you cry',
    text: 'An onion defends itself with chemistry. Its cells hold two ingredients in separate compartments, and a knife breaks the walls between them. They react, and within seconds the onion releases a gas that drifts up to your face. When the gas touches the surface of your eye it stings, and your eyes produce tears to wash it away. A sharp knife crushes fewer cells and makes less gas. Chilling the onion first slows the reaction down.',
  },
  {
    topic: 'everyday',
    title: 'How a microwave heats food',
    text: 'A microwave oven fills its metal box with radio waves of a particular kind. Water molecules are slightly lopsided in their electric charge, so the waves make them twist back and forth billions of times a second. All that jostling is heat. The waves pass straight through glass and most plastic, which is why the plate stays cooler than the soup. They do not reach evenly into every corner, so the food turns on a plate to even things out.',
  },
  {
    topic: 'everyday',
    title: 'How money grows on itself',
    text: 'Put money where it earns interest and leave the interest in, and next year you earn interest on the interest too. The growth feeds itself. At first the effect is small, but it speeds up with every year. A handy rule gives the pace: divide seventy-two by the yearly rate, and the answer is roughly how many years the money takes to double. At six percent, that is twelve years. The same arithmetic works against you on a debt.',
  },
  {
    topic: 'everyday',
    title: 'Why you get goosebumps',
    text: 'At the base of every body hair is a tiny muscle. When you are cold or suddenly afraid, a signal from your nerves tightens these muscles, the hairs stand up, and the skin around each one rises into a bump. For an animal with thick fur this is useful. Raised fur traps a layer of warm air, and it makes the animal look larger to an enemy. Humans kept the reflex but lost most of the fur, so only the bumps remain.',
  },
  {
    topic: 'everyday',
    title: 'Why the world has time zones',
    text: 'Until the 1800s every town set its clocks by its own noon, so a city a hundred miles away ran a few minutes ahead or behind. Nobody minded until railways arrived and needed timetables. Railway companies began keeping one standard time along their lines. In 1884 an international conference chose the line through Greenwich, in London, as the starting point for the whole world. The globe was divided into zones about an hour apart, bent here and there to follow borders.',
  },
  {
    topic: 'everyday',
    title: 'How a refrigerator makes cold',
    text: 'A refrigerator does not create cold. It moves heat from the inside to the outside. A liquid called a refrigerant flows through pipes in the walls. Inside the cabinet it evaporates, and evaporating soaks up heat, the way sweat cools your skin. A pump then squeezes the vapor back into a liquid, which releases that heat through coils at the back. This is why the back of a refrigerator feels warm, and why leaving its door open will never cool a kitchen.',
  },
];
