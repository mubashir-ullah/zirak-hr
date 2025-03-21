require('dotenv').config();
const path = require('path');

// This is needed to handle TypeScript imports in Node.js
require('@babel/register')({
  extensions: ['.ts', '.tsx'],
  presets: ['@babel/preset-env', '@babel/preset-typescript'],
});

// Now we can import the TypeScript module
const { connectToDatabase } = require('../lib/mongodb');

// Sample skill tests data
const skillTests = [
  {
    title: 'JavaScript Fundamentals',
    description: 'Test your knowledge of JavaScript basics including variables, functions, arrays, and objects.',
    skillCategory: 'JavaScript',
    timeLimit: 30, // minutes
    passingScore: 70,
    difficulty: 'beginner',
    questions: [
      {
        text: 'What is the output of: console.log(typeof [])?',
        options: ['array', 'object', 'undefined', 'null'],
        correctAnswer: 1,
        explanation: 'In JavaScript, arrays are actually objects, so typeof [] returns "object".'
      },
      {
        text: 'Which method adds an element to the end of an array?',
        options: ['push()', 'pop()', 'shift()', 'unshift()'],
        correctAnswer: 0,
        explanation: 'The push() method adds one or more elements to the end of an array and returns the new length.'
      },
      {
        text: 'What does the following code return: "5" + 2?',
        options: ['7', '"52"', '52', 'Error'],
        correctAnswer: 1,
        explanation: 'When a string is added to a number, JavaScript converts the number to a string and concatenates them.'
      },
      {
        text: 'Which statement creates a variable that cannot be reassigned?',
        options: ['var x = 5', 'let x = 5', 'const x = 5', 'static x = 5'],
        correctAnswer: 2,
        explanation: 'const creates a variable with a constant reference, meaning it cannot be reassigned to a different value.'
      },
      {
        text: 'What is the correct way to check if a variable is an array?',
        options: ['typeof x === "array"', 'x instanceof Array', 'Array.isArray(x)', 'Both B and C'],
        correctAnswer: 3,
        explanation: 'Both instanceof Array and Array.isArray() can be used to check if a variable is an array.'
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'React Components',
    description: 'Test your knowledge of React components, props, state, and lifecycle methods.',
    skillCategory: 'React',
    timeLimit: 45,
    passingScore: 70,
    difficulty: 'intermediate',
    questions: [
      {
        text: 'What is the correct way to create a functional component in React?',
        options: [
          'function MyComponent() { return <div>Hello</div>; }',
          'class MyComponent { render() { return <div>Hello</div>; } }',
          'const MyComponent = () => { <div>Hello</div> }',
          'function MyComponent() { render(<div>Hello</div>); }'
        ],
        correctAnswer: 0,
        explanation: 'A functional component is just a JavaScript function that returns JSX.'
      },
      {
        text: 'How do you pass data from a parent component to a child component?',
        options: ['Using state', 'Using props', 'Using context', 'Using Redux'],
        correctAnswer: 1,
        explanation: 'Props are used to pass data from a parent component to a child component.'
      },
      {
        text: 'Which hook is used to perform side effects in a functional component?',
        options: ['useState', 'useEffect', 'useContext', 'useReducer'],
        correctAnswer: 1,
        explanation: 'useEffect is used for side effects like data fetching, subscriptions, or manually changing the DOM.'
      },
      {
        text: 'What is the correct way to update state in a functional component?',
        options: [
          'this.state.count = this.state.count + 1',
          'setState({ count: state.count + 1 })',
          'setCount(count + 1)',
          'count++'
        ],
        correctAnswer: 2,
        explanation: 'In functional components, you use the state setter function returned by useState to update state.'
      },
      {
        text: 'What is the purpose of the key prop when rendering a list of elements?',
        options: [
          'It is required for styling list items',
          'It helps React identify which items have changed, are added, or are removed',
          'It determines the order of elements in the list',
          'It is used to access the element in JavaScript'
        ],
        correctAnswer: 1,
        explanation: 'Keys help React identify which items have changed, are added, or are removed, which helps in efficient rendering.'
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Node.js and Express',
    description: 'Test your knowledge of Node.js fundamentals and Express framework for building web applications.',
    skillCategory: 'Node.js',
    timeLimit: 40,
    passingScore: 70,
    difficulty: 'intermediate',
    questions: [
      {
        text: 'What is the package manager for Node.js?',
        options: ['npm', 'yarn', 'both A and B', 'pip'],
        correctAnswer: 2,
        explanation: 'Both npm (Node Package Manager) and yarn are package managers for Node.js.'
      },
      {
        text: 'Which of the following is NOT a core module in Node.js?',
        options: ['fs', 'http', 'path', 'express'],
        correctAnswer: 3,
        explanation: 'Express is a third-party framework, not a core module in Node.js.'
      },
      {
        text: 'What does the following code do: app.use(express.json())?',
        options: [
          'Parses incoming JSON requests',
          'Sends JSON responses',
          'Creates a JSON file',
          'Validates JSON data'
        ],
        correctAnswer: 0,
        explanation: 'express.json() is middleware that parses incoming requests with JSON payloads.'
      },
      {
        text: 'Which HTTP method is typically used for updating resources?',
        options: ['GET', 'POST', 'PUT', 'DELETE'],
        correctAnswer: 2,
        explanation: 'PUT is typically used for updating existing resources.'
      },
      {
        text: 'What is middleware in Express?',
        options: [
          'A function that has access to the request and response objects',
          'A database connector',
          'A template engine',
          'A routing mechanism'
        ],
        correctAnswer: 0,
        explanation: 'Middleware functions have access to the request and response objects and the next middleware function in the application\'s request-response cycle.'
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Python Advanced',
    description: 'Test your knowledge of advanced Python concepts including decorators, generators, and OOP principles.',
    skillCategory: 'Python',
    timeLimit: 50,
    passingScore: 75,
    difficulty: 'advanced',
    questions: [
      {
        text: 'What is a generator in Python?',
        options: [
          'A function that returns multiple values',
          'A function that yields values one at a time',
          'A class that generates random numbers',
          'A built-in method to create lists'
        ],
        correctAnswer: 1,
        explanation: 'A generator is a function that returns an iterator that yields values one at a time, rather than returning them all at once.'
      },
      {
        text: 'What is the output of: [x*2 for x in range(3)]?',
        options: ['[0, 2, 4]', '[0, 1, 2]', '[1, 2, 3]', '[2, 4, 6]'],
        correctAnswer: 0,
        explanation: 'The list comprehension multiplies each value in range(3) (which is 0, 1, 2) by 2, resulting in [0, 2, 4].'
      },
      {
        text: 'Which of the following is a decorator in Python?',
        options: [
          '@property',
          '@staticmethod',
          '@classmethod',
          'All of the above'
        ],
        correctAnswer: 3,
        explanation: '@property, @staticmethod, and @classmethod are all decorators in Python.'
      },
      {
        text: 'What is the purpose of __init__ method in a Python class?',
        options: [
          'To initialize class variables',
          'To create a new instance of the class',
          'To destroy an instance of the class',
          'To import required modules'
        ],
        correctAnswer: 0,
        explanation: 'The __init__ method is used to initialize attributes of a class instance when it is created.'
      },
      {
        text: 'What is the difference between a shallow copy and a deep copy?',
        options: [
          'Shallow copy creates references to nested objects, deep copy creates new copies of nested objects',
          'Shallow copy is faster, deep copy is slower',
          'Shallow copy works only with lists, deep copy works with all data types',
          'Both A and B'
        ],
        correctAnswer: 3,
        explanation: 'Shallow copy creates references to nested objects while deep copy creates new copies of nested objects. Additionally, shallow copy is generally faster than deep copy.'
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'React Basics',
    description: 'Test your knowledge of React basics including JSX, components, and props.',
    skillCategory: 'React',
    timeLimit: 30,
    passingScore: 70,
    difficulty: 'beginner',
    questions: [
      {
        text: 'What is JSX?',
        options: [
          'A JavaScript library',
          'A syntax extension for JavaScript that looks similar to HTML',
          'A programming language',
          'A database query language'
        ],
        correctAnswer: 1,
        explanation: 'JSX is a syntax extension for JavaScript that looks similar to HTML and makes it easier to write and add HTML in React.'
      },
      {
        text: 'What is the virtual DOM in React?',
        options: [
          'A complete copy of the real DOM',
          'A lightweight copy of the real DOM that React uses for performance optimization',
          'A DOM that exists only in virtual reality',
          'A DOM that is visible only to developers'
        ],
        correctAnswer: 1,
        explanation: 'The virtual DOM is a lightweight JavaScript representation of the real DOM that React uses to improve performance by minimizing direct manipulation of the real DOM.'
      },
      {
        text: 'Which of the following is NOT a rule of React Hooks?',
        options: [
          'Hooks can only be called at the top level',
          'Hooks can only be called from React function components',
          'Hooks can be called conditionally',
          'Hooks can be called from custom Hooks'
        ],
        correctAnswer: 2,
        explanation: 'Hooks should NOT be called conditionally. They must be called at the top level of your components.'
      },
      {
        text: 'What is the correct way to render a list in React?',
        options: [
          'Using a for loop inside the render method',
          'Using the map() function to create elements from array items',
          'Using the forEach() method',
          'Using a while loop'
        ],
        correctAnswer: 1,
        explanation: 'In React, you typically use the map() function to create elements from array items when rendering lists.'
      },
      {
        text: 'What is the purpose of React fragments?',
        options: [
          'To group a list of children without adding extra nodes to the DOM',
          'To create reusable components',
          'To optimize performance',
          'To handle form submissions'
        ],
        correctAnswer: 0,
        explanation: 'React fragments let you group a list of children without adding extra nodes to the DOM.'
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seedDatabase() {
  try {
    // Use the project's MongoDB connection
    const { db } = await connectToDatabase();
    console.log('Connected to MongoDB');

    const skillTestCollection = db.collection('skilltests');

    // Check if collection already has data
    const count = await skillTestCollection.countDocuments();
    if (count > 0) {
      console.log('Skill tests already exist in the database. Skipping seed.');
      return;
    }

    // Insert skill tests
    const result = await skillTestCollection.insertMany(skillTests);
    console.log(`${result.insertedCount} skill tests inserted successfully.`);

  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase().then(() => {
  console.log('Seed process completed.');
  process.exit(0);
}).catch(err => {
  console.error('Seed process failed:', err);
  process.exit(1);
});
