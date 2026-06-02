export interface BookLink {
  label: string;
  url: string;
}

export interface Resource {
  _id: string;
  title: string;
  type: string;
  description: string;
  file?: string;
  tags?: string[];
  createdAt?: string;
  readAt?: BookLink[];
  borrowAt?: BookLink[];
  generated?: boolean;
}

export const RESOURCES: Resource[] = [
  {
    _id: '1',
    title: 'Pelvic Pain',
    type: 'website',
    description:
      'University of Rochester Medical Center Health Encyclopedia page about pelvic pain symptoms, causes, diagnosis, and treatment.',
    file:
      'https://www.urmc.rochester.edu/encyclopedia/content.aspx?ContentTypeID=85&ContentID=P01550',
    tags: ['pelvic pain'],
  },

  {
    _id: '2',
    title: 'What is Endometriosis?',
    type: 'website',
    description:
      'Educational overview from EndoFound about endometriosis symptoms, diagnosis, and treatment.',
    file: 'https://www.endofound.org/endometriosis',
    tags: ['endometriosis'],
  },

  {
    _id: '3',
    title: 'What is Polycystic Ovarian Syndrome?',
    type: 'website',
    description:
      'PCOS Awareness Association overview of polycystic ovarian syndrome (PCOS).',
    file:
      'https://www.pcosaa.org/about-polycystic-ovarian-syndrome',
    tags: ['PCOS'],
  },

  {
    _id: '4',
    title: 'What is Vulvodynia?',
    type: 'website',
    description:
      'National Vulvodynia Association educational guide to vulvodynia.',
    file: 'https://www.nva.org/what-is-vulvodynia/',
    tags: ['vulvodynia'],
  },

  {
    _id: '5',
    title: 'The Period Repair Manual',
    type: 'book',
    description:
      'Book by Lara Briden about hormones, menstrual health, and period management.',
    file: 'https://www.larabriden.com/period-repair-manual/',
    tags: [
      'hormones',
      'periods',
      'nonfiction',
      'self-help book',
    ],
    readAt: [
      {
        label: 'Amazon',
        url:
          'https://www.amazon.com/s?k=The+Period+Repair+Manual+Lara+Briden',
      },
      {
        label: 'Apple Books',
        url:
          'https://books.apple.com/us/book/period-repair-manual/id1283003825',
      },
      {
        label: 'Kindle',
        url:
          'https://www.amazon.com/s?k=The+Period+Repair+Manual+Kindle+Lara+Briden',
      },
    ],
    borrowAt: [
      {
        label: 'Tompkins County Public Library',
        url:
          'https://catalog.flls.org/polaris/search/title.aspx?ctx=59.1033.0.0.3&pos=1&cn=1209546',
      },
    ],
  },

  {
    _id: '6',
    title: 'Hormone Intelligence',
    type: 'book',
    description:
      'Book by Aviva Romm about hormones and reproductive health.',
    tags: ['hormones', 'nonfiction'],
    readAt: [
      {
        label: 'Amazon',
        url:
          'https://www.amazon.com/s?k=Hormone+Intelligence+Aviva+Romm',
      },
      {
        label: 'Apple Audiobook',
        url:
          'https://books.apple.com/us/audiobook/hormone-intelligence/id1569482283',
      },
      {
        label: 'Kindle',
        url:
          'https://www.amazon.com/s?k=Hormone+Intelligence+Kindle+Aviva+Romm',
      },
    ],
    borrowAt: [
      {
        label: 'Cornell Library',
        url:
          'https://catalog.library.cornell.edu/catalog/15000123',
      },
      {
        label: 'Tompkins County Public Library',
        url:
          'https://catalog.flls.org/polaris/search/title.aspx?ctx=59.1033.0.0.3&pos=1&cn=1276652',
      },
    ],
  },

  {
    _id: '7',
    title: 'The Hormone Cure',
    type: 'book',
    description:
      'Book by Sara Gottfried focused on hormone health and balance.',
    tags: ['hormones', 'nonfiction'],
    readAt: [
      {
        label: 'Amazon',
        url:
          'https://www.amazon.com/s?k=The+Hormone+Cure+Sara+Gottfried',
      },
      {
        label: 'Apple Book',
        url:
          'https://books.apple.com/us/book/the-hormone-cure/id543374007',
      },
      {
        label: 'Kindle',
        url:
          'https://www.amazon.com/s?k=The+Hormone+Cure+Kindle+Sara+Gottfried',
      },
    ],
  },

  {
    _id: '8',
    title:
      'Vagina Problems: Endometriosis, Painful Sex, and Other Taboo Topics',
    type: 'book',
    description:
      'Book by Lara Parker discussing endometriosis, painful sex, pelvic pain, and reproductive health.',
    tags: [
      'pelvic pain',
      'endometriosis',
      'painful sex',
      'memoir',
    ],
    readAt: [
      {
        label: 'Amazon',
        url:
          'https://www.amazon.com/s?k=Vagina+Problems+Lara+Parker',
      },
      {
        label: 'Apple Book',
        url:
          'https://books.apple.com/us/book/vagina-problems/id6670453428',
      },
      {
        label: 'Kindle',
        url:
          'https://www.amazon.com/s?k=Vagina+Problems+Kindle+Lara+Parker',
      },
    ],
  },

  {
    _id: '9',
    title: 'Ask Me About My Uterus',
    type: 'book',
    description:
      'Memoir by Abby Norman about endometriosis and chronic pelvic pain.',
    tags: ['memoir', 'endometriosis', 'pelvic pain'],
    readAt: [
      {
        label: 'Amazon',
        url:
          'https://www.amazon.com/s?k=Ask+Me+About+My+Uterus+Abby+Norman',
      },
      {
        label: 'Apple Books',
        url:
          'https://books.apple.com/us/book/ask-me-about-my-uterus/id1255064655',
      },
      {
        label: 'Kindle',
        url:
          'https://www.amazon.com/s?k=Ask+Me+About+My+Uterus+Kindle+Abby+Norman',
      },
    ],
    borrowAt: [
      {
        label: 'Cornell Library',
        url:
          'https://catalog.library.cornell.edu/catalog/10317245',
      },
      {
        label: 'Tompkins County Public Library',
        url:
          'https://catalog.flls.org/polaris/search/title.aspx?ctx=59.1033.0.0.3&pos=1&cn=1081337',
      },
    ],
  },

  {
    _id: '10',
    title: 'Tight-Lipped',
    type: 'podcast',
    description:
      'Podcast focused on vulvovaginal pain and chronic reproductive health experiences.',
    file:
      'https://tightlippedpod.squarespace.com/episodes-list',
    tags: ['vulvovaginal pain'],
  },

  {
    _id: '11',
    title: 'Bodies',
    type: 'podcast',
    description:
      'Podcast discussing hormones, painful sex, fertility, PCOS, birth control, and fibroids.',
    file: 'https://www.bodiespodcast.com/',
    tags: [
      'painful sex',
      'hormones',
      'PCOS',
      'fertility',
      'birth control',
      'fibroids',
    ],
  },

  {
    _id: '12',
    title: 'Trumble Physical Therapy',
    type: 'local resource',
    description:
      'Physical therapy provider in Ithaca for pelvic floor concerns.',
    tags: ['pelvic floor'],
    file: "https://www.trumblephysicaltherapy.com/"
  },

  {
    _id: '13',
    title: 'University of Rochester Medical Center',
    type: 'local resource',
    description:
      'Rochester-based provider referenced for gynecologic and chronic pain-related care.',
    file: 'https://www.urmc.rochester.edu/',
    tags: ['endometriosis', 'chronic pain'],
  },

  {
    _id: '14',
    title: 'Yale Reproductive Endocrinology',
    type: 'local resource',
    description:
      'Yale reproductive endocrinology and infertility services in New Haven.',
    file:
      'https://www.yalemedicine.org/departments/reproductive-endocrinology-and-infertility',
    tags: ['endometriosis', 'fertility'],
  },

  {
    _id: '15',
    title: 'Ob-Gyn Associates of Ithaca',
    type: 'local resource',
    description:
      'Gynecology provider serving the Ithaca area.',
    tags: ['gynecology'],
    file: 'https://www.obgynithaca.com/',
  },

  {
    _id: '16',
    title: "Women's Health of CMA",
    type: 'local resource',
    description:
      'Women’s health and gynecology services through Cayuga Medical Associates.',
    file:
      'https://www.cayugamed.org/specialties/womens-health/',
    tags: ['gynecology'],
  },

  {
    _id: '17',
    title: 'Guthrie Cortland',
    type: 'local resource',
    description:
      'Cortland-area healthcare provider with urology services.',
    tags: ['urology'],
    file: 'https://www.guthrie.org/locations/cortland',
  },

  {
    _id: '18',
    title: 'PPAC Informational Resources',
    type: 'informational',
    description:
      'Pelvic pain and advocacy resources collected by Cornell PPAC.',
    file:
      'https://cornell.campusgroups.com/ppac/useful-links/',
    tags: ['patient advocacy', 'pelvic pain'],
  },
];
