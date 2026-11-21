export interface Theme {
  name: string;
  /** Words of three to eight capital letters, so any of them fits the smallest grid. */
  words: string[];
}

/** The word lists puzzles are drawn from. A puzzle takes all its words from one theme. */
export const THEMES: Theme[] = [
  {
    name: 'Animals',
    words: [
      ...['TIGER', 'HORSE', 'EAGLE', 'ZEBRA', 'OTTER', 'WHALE', 'PANDA', 'KOALA', 'LLAMA', 'MOUSE'],
      ...['SHEEP', 'GOOSE', 'RABBIT', 'MONKEY', 'DONKEY', 'PARROT', 'TURTLE', 'LIZARD', 'FALCON'],
      ...['BADGER', 'DOLPHIN', 'GIRAFFE', 'PENGUIN', 'HAMSTER'],
    ],
  },
  {
    name: 'Food',
    words: [
      ...['BREAD', 'APPLE', 'LEMON', 'HONEY', 'PASTA', 'SALAD', 'MELON', 'MANGO', 'PEACH', 'ONION'],
      ...['CHEESE', 'BUTTER', 'CARROT', 'TOMATO', 'BANANA', 'COOKIE', 'PEPPER', 'CHERRY', 'NOODLE'],
      ...['WAFFLE', 'PANCAKE', 'AVOCADO', 'POPCORN', 'YOGURT'],
    ],
  },
  {
    name: 'Nature',
    words: [
      ...['RIVER', 'OCEAN', 'CLOUD', 'STORM', 'STONE', 'FOREST', 'MEADOW', 'VALLEY', 'ISLAND'],
      ...[
        'DESERT',
        'CANYON',
        'GLACIER',
        'BREEZE',
        'SUNSET',
        'THUNDER',
        'FLOWER',
        'GARDEN',
        'STREAM',
      ],
      ...['JUNGLE', 'VOLCANO', 'RAINBOW', 'PEBBLE', 'LAGOON', 'FROST'],
    ],
  },
  {
    name: 'Space',
    words: [
      ...['PLANET', 'COMET', 'ORBIT', 'ROCKET', 'GALAXY', 'NEBULA', 'SATURN', 'VENUS', 'EARTH'],
      ...['SOLAR', 'LUNAR', 'METEOR', 'COSMOS', 'PLUTO', 'PULSAR', 'ECLIPSE', 'GRAVITY', 'JUPITER'],
      ...['MERCURY', 'NEPTUNE', 'CRATER', 'SHUTTLE', 'PROBE', 'QUASAR'],
    ],
  },
  {
    name: 'Reading',
    words: [
      ...['STORY', 'NOVEL', 'AUTHOR', 'READER', 'LETTER', 'CHAPTER', 'LIBRARY', 'PENCIL', 'PAPER'],
      ...['VERSE', 'INDEX', 'SHELF', 'WRITER', 'FABLE', 'POETRY', 'LEGEND', 'MYSTERY'],
      ...['JOURNAL', 'COMIC', 'SONNET', 'RHYME', 'PREFACE', 'FICTION'],
    ],
  },
  {
    name: 'Music',
    words: [
      ...['PIANO', 'GUITAR', 'VIOLIN', 'DRUMS', 'FLUTE', 'TEMPO', 'CHORD', 'MELODY', 'RHYTHM'],
      ...['OPERA', 'CHOIR', 'TRUMPET', 'CELLO', 'BANJO', 'LYRICS', 'CONCERT', 'HARMONY', 'BALLAD'],
      ...['ENCORE', 'TREBLE', 'WALTZ', 'ORGAN', 'CHORUS', 'STUDIO'],
    ],
  },
  {
    name: 'Sports',
    words: [
      ...['SOCCER', 'TENNIS', 'HOCKEY', 'RUGBY', 'BOXING', 'SKIING', 'SURFING', 'CYCLING'],
      ...['ROWING', 'KARATE', 'GOLF', 'BASEBALL', 'FENCING', 'ARCHERY', 'SAILING', 'DIVING'],
      ...['RUNNING', 'SKATING', 'JUDO', 'CRICKET', 'SQUASH', 'BOWLING', 'CLIMBING', 'SWIMMING'],
      ...['YOGA', 'POLO'],
    ],
  },
  {
    name: 'Weather',
    words: [
      ...['SUNNY', 'CLOUDY', 'WINDY', 'STORMY', 'FOGGY', 'SNOW', 'RAIN', 'HAIL'],
      ...['SLEET', 'FROST', 'BREEZE', 'THUNDER', 'DRIZZLE', 'SHOWER', 'BLIZZARD', 'TORNADO'],
      ...['CYCLONE', 'HUMID', 'MISTY', 'CLEAR', 'DROUGHT', 'MONSOON', 'TYPHOON', 'RAINBOW'],
      ...['FLOOD', 'CHILLY'],
    ],
  },
  {
    name: 'Colours',
    words: [
      ...['SCARLET', 'CRIMSON', 'ORANGE', 'YELLOW', 'GREEN', 'PURPLE', 'VIOLET', 'INDIGO'],
      ...['MAROON', 'SILVER', 'GOLDEN', 'BRONZE', 'COPPER', 'PINK', 'BLACK', 'WHITE'],
      ...['BROWN', 'BEIGE', 'IVORY', 'OLIVE', 'LILAC', 'MAGENTA', 'CYAN', 'AMBER'],
      ...['CORAL', 'KHAKI', 'NAVY', 'TEAL'],
    ],
  },
  {
    name: 'Travel',
    words: [
      ...['AIRPORT', 'TICKET', 'HOTEL', 'LUGGAGE', 'JOURNEY', 'VOYAGE', 'CRUISE', 'TOURIST'],
      ...['CAMERA', 'BEACH', 'RESORT', 'SAFARI', 'HOSTEL', 'GUIDE', 'FLIGHT', 'BORDER'],
      ...['CUSTOMS', 'TRAIN', 'FERRY', 'SUITCASE', 'HOLIDAY', 'VISA', 'MUSEUM', 'POSTCARD'],
      ...['SOUVENIR'],
    ],
  },
  {
    name: 'Home',
    words: [
      ...['KITCHEN', 'BEDROOM', 'GARAGE', 'WINDOW', 'CARPET', 'CURTAIN', 'PILLOW', 'BLANKET'],
      ...['MIRROR', 'CABINET', 'DRAWER', 'SHELF', 'COUCH', 'TABLE', 'CHAIR', 'LAMP'],
      ...['STAIRS', 'ATTIC', 'CELLAR', 'BALCONY', 'CHIMNEY', 'DOOR', 'FLOOR', 'CEILING'],
      ...['HALLWAY'],
    ],
  },
  {
    name: 'Jobs',
    words: [
      ...['DOCTOR', 'NURSE', 'TEACHER', 'FARMER', 'BAKER', 'PILOT', 'LAWYER', 'ARTIST'],
      ...['CHEF', 'WAITER', 'DENTIST', 'PLUMBER', 'BUILDER', 'ENGINEER', 'JUDGE', 'SAILOR'],
      ...['TAILOR', 'BARBER', 'DRIVER', 'ACTOR', 'SINGER', 'PAINTER', 'EDITOR', 'FLORIST'],
    ],
  },
  {
    name: 'Body',
    words: [
      ...['HEART', 'BRAIN', 'LUNGS', 'LIVER', 'KIDNEY', 'STOMACH', 'MUSCLE', 'ELBOW'],
      ...['KNEE', 'ANKLE', 'WRIST', 'FINGER', 'THUMB', 'SHOULDER', 'NECK', 'SPINE'],
      ...['SKULL', 'RIBS', 'CHEEK', 'TONGUE', 'THROAT', 'EYEBROW', 'FOREHEAD', 'PALM'],
    ],
  },
  {
    name: 'Clothes',
    words: [
      ...['SHIRT', 'JACKET', 'SWEATER', 'TROUSERS', 'SKIRT', 'DRESS', 'SCARF', 'GLOVES'],
      ...['BOOTS', 'SOCKS', 'SANDALS', 'HOODIE', 'JEANS', 'SHORTS', 'COAT', 'BELT'],
      ...['PYJAMAS', 'SLIPPERS', 'APRON', 'BLOUSE', 'VEST', 'MITTENS', 'UNIFORM', 'CARDIGAN'],
    ],
  },
  {
    name: 'Science',
    words: [
      ...['ATOM', 'MOLECULE', 'ENERGY', 'FORCE', 'MAGNET', 'GRAVITY', 'CELL', 'GENE'],
      ...['PROTON', 'NEUTRON', 'ELECTRON', 'LASER', 'PRISM', 'FOSSIL', 'VOLTAGE', 'CIRCUIT'],
      ...['ENZYME', 'THEORY', 'OXYGEN', 'CARBON', 'HELIUM', 'PLASMA', 'BEAKER', 'MICROBE'],
    ],
  },
  {
    name: 'Ocean',
    words: [
      ...['CORAL', 'SHARK', 'WHALE', 'SQUID', 'OCTOPUS', 'LOBSTER', 'SHRIMP', 'OYSTER'],
      ...['SEAWEED', 'DOLPHIN', 'ANCHOR', 'HARBOR', 'TIDE', 'WAVE', 'REEF', 'URCHIN'],
      ...['TURTLE', 'SEAL', 'WALRUS', 'PELICAN', 'STARFISH', 'MUSSEL', 'CURRENT', 'LAGOON'],
      ...['KELP'],
    ],
  },
  {
    name: 'School',
    words: [
      ...['TEACHER', 'PUPIL', 'LESSON', 'DESK', 'PENCIL', 'ERASER', 'RULER', 'NOTEBOOK'],
      ...['HOMEWORK', 'GRAMMAR', 'HISTORY', 'SCIENCE', 'MATHS', 'RECESS', 'LIBRARY', 'EXAM'],
      ...['GRADE', 'CHALK', 'BACKPACK', 'COLLEGE', 'STUDENT', 'DIPLOMA', 'QUIZ', 'ATLAS'],
      ...['LOCKER'],
    ],
  },
  {
    name: 'Garden',
    words: [
      ...['ROSE', 'TULIP', 'DAISY', 'LILY', 'ORCHID', 'VIOLET', 'JASMINE', 'POPPY'],
      ...['IRIS', 'LAVENDER', 'SEED', 'ROOT', 'STEM', 'PETAL', 'LEAF', 'BLOSSOM'],
      ...['SHOVEL', 'RAKE', 'COMPOST', 'WEED', 'HEDGE', 'LAWN', 'FERN', 'MOSS'],
      ...['BAMBOO', 'CACTUS', 'SOIL'],
    ],
  },
  {
    name: 'Transport',
    words: [
      ...['BICYCLE', 'SCOOTER', 'TRUCK', 'TRAIN', 'SUBWAY', 'TRAM', 'FERRY', 'YACHT'],
      ...['CANOE', 'KAYAK', 'ROCKET', 'TAXI', 'JEEP', 'PLANE', 'GLIDER', 'TRACTOR'],
      ...['MOPED', 'WAGON', 'SLEDGE', 'BALLOON', 'TANKER', 'TROLLEY', 'AIRSHIP', 'CARRIAGE'],
    ],
  },
  {
    name: 'Feelings',
    words: [
      ...['HAPPY', 'PROUD', 'CALM', 'BRAVE', 'EAGER', 'JOLLY', 'CHEERFUL', 'GLAD'],
      ...['CURIOUS', 'HOPEFUL', 'GRUMPY', 'SLEEPY', 'ANGRY', 'WORRIED', 'LONELY', 'EXCITED'],
      ...['NERVOUS', 'RELAXED', 'PUZZLED', 'AMAZED', 'KIND', 'GENTLE', 'TENDER', 'JOYFUL'],
    ],
  },
  {
    name: 'Countries',
    words: [
      ...['FRANCE', 'SPAIN', 'ITALY', 'GREECE', 'NORWAY', 'SWEDEN', 'POLAND', 'TURKEY'],
      ...['EGYPT', 'KENYA', 'INDIA', 'CHINA', 'JAPAN', 'BRAZIL', 'CHILE', 'PERU'],
      ...['MEXICO', 'CANADA', 'ICELAND', 'IRELAND', 'PORTUGAL', 'GERMANY', 'AUSTRIA', 'VIETNAM'],
      ...['NEPAL', 'MOROCCO'],
    ],
  },
  {
    name: 'Kitchen',
    words: [
      ...['SPOON', 'FORK', 'KNIFE', 'PLATE', 'BOWL', 'KETTLE', 'TOASTER', 'OVEN'],
      ...['FRIDGE', 'FREEZER', 'BLENDER', 'WHISK', 'GRATER', 'LADLE', 'SPATULA', 'SAUCEPAN'],
      ...['TEAPOT', 'TRAY', 'SINK', 'STOVE', 'COLANDER', 'NAPKIN', 'PANTRY'],
    ],
  },
  {
    name: 'Fantasy',
    words: [
      ...['DRAGON', 'WIZARD', 'CASTLE', 'KNIGHT', 'PRINCESS', 'GIANT', 'FAIRY', 'GOBLIN'],
      ...['TROLL', 'UNICORN', 'MERMAID', 'PHOENIX', 'SPELL', 'POTION', 'WAND', 'CROWN'],
      ...['SWORD', 'SHIELD', 'QUEST', 'DWARF', 'OGRE', 'GRIFFIN', 'TREASURE', 'KINGDOM'],
    ],
  },
  {
    name: 'Calendar',
    words: [
      ...['MONDAY', 'TUESDAY', 'FRIDAY', 'SUNDAY', 'JANUARY', 'MARCH', 'APRIL', 'JUNE'],
      ...['JULY', 'AUGUST', 'OCTOBER', 'WINTER', 'SPRING', 'SUMMER', 'AUTUMN', 'MORNING'],
      ...['EVENING', 'MIDNIGHT', 'MINUTE', 'SECOND', 'HOUR', 'WEEK', 'MONTH', 'YEAR'],
      ...['DECADE', 'CENTURY'],
    ],
  },
];
