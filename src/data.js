export const MODULE_FLOW = [
  {
    id: 'learn',
    title: 'Learn',
    goal: 'Understand what AI is and how it works.',
    icon: 'Brain'
  },
  {
    id: 'prompt',
    title: 'Prompt',
    goal: 'Learn how to write great instructions for AI.',
    icon: 'Wand2'
  },
  {
    id: 'build',
    title: 'Build',
    goal: 'Create and play your own mini game!',
    icon: 'Gamepad2'
  },
  {
    id: 'share',
    title: 'Share',
    goal: 'Show your game to the class.',
    icon: 'Megaphone'
  }
];

export const LEARN_SLIDES = [
  {
    title: 'Welcome to AI!',
    content: 'AI is a smart helper for your brain. It can help you find ideas, learn new things, and be more creative!'
  },
  {
    title: 'What is a Prompt?',
    content: 'A prompt is just a message you send to AI. Think of it as a special instruction. The better you explain, the more AI helps!'
  },
  {
    title: 'AI is Everywhere!',
    content: 'You might know ChatGPT or Gemini. AI is also in games and apps that help you draw or learn!'
  },
  {
    title: 'Clear vs. Blurry',
    content: 'Blurry: "Make a game."\nClear: "Make a maze game with a hero and stars." Clear prompts get the best results!'
  },
  {
    title: 'Ways to Prompt',
    content: 'Direct: Ask for it.\nRole: Tell AI to act like a pro.\nSteps: Give clear steps.\nImprove: Ask AI to make it better.'
  },
  {
    title: 'Use AI Wisely',
    content: 'AI is smart but can make mistakes. Always check its work and use your own amazing thinking too!'
  }
];

export const PROMPT_SLIDES = [
  {
    title: 'Your Game Idea',
    content: 'Today, YOU are the boss. You will tell AI exactly how to build your very own maze game!'
  },
  {
    title: 'The Recipe',
    content: 'A great game needs: A hero, some obstacles, points to collect, and a way to win. What will yours have?'
  },
  {
    title: 'Adding Details',
    content: 'Instead of "A space game", try: "A space game where a rocket collects stars and avoids big aliens."'
  },
  {
    title: 'The Magic Formula',
    content: 'Formula: Who + What + Details.\nExample: "Act as a game dev. Make a game with a turtle hero and pearls."'
  }
];

export const QUIZZES = {
  learn: [
    {
      question: 'What is a prompt?',
      options: ['A snack', 'A message for AI', 'A virus'],
      answer: 1,
      explanation: 'You got it! It tells AI what to do.'
    },
    {
      question: 'Which prompt is better?',
      options: ['"Make a game."', '"Make a maze game with a hero."'],
      answer: 1,
      explanation: 'Great job! Details help AI understand.'
    },
    {
      question: 'Is AI always 100% correct?',
      options: ['Yes, always', 'No, we should check it'],
      answer: 1,
      explanation: 'Nice try! Wait, actually you got it! AI can make mistakes.'
    }
  ],
  prompt: [
    {
      question: 'How do you win?',
      options: ['Win condition', 'Wall colour', 'Keyboard'],
      answer: 0,
      explanation: 'Great job! That tells the player how to win.'
    },
    {
      question: 'What makes a prompt clear?',
      options: ['Just one word', 'Lots of useful details'],
      answer: 1,
      explanation: 'You got it! Details are the key.'
    },
    {
      question: 'Why be specific?',
      options: ['To be boring', 'To get exactly what you want'],
      answer: 1,
      explanation: 'Great job! AI loves details.'
    }
  ]
};

export const PROMPT_STARTERS = [
  'Create a space maze game where a rocket collects stars and avoids aliens.',
  'Create an ocean maze game where a turtle collects pearls and avoids sharks.',
  'Create a candy maze game where a hero collects sweets and avoids monsters.'
];

export const AMENDMENT_STARTERS = [
  'Change the colours to neon purple and blue.',
  'Make the character faster and the enemies slower.',
  'Change the theme to underwater with bubbles and treasure.'
];
