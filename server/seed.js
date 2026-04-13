require('dotenv').config();
const mongoose = require('mongoose');
const Problem = require('./models/Problem');
const AptitudeQuestion = require('./models/AptitudeQuestion');

const MONGO_URI = process.env.MONGO_URI;

const problems = [
  { title: "Two Sum", description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.", difficulty: "Easy", tags: ["Array", "Hash Table"], exampleInput: "nums = [2,7,11,15], target = 9", exampleOutput: "[0,1]", constraints: ["2 <= nums.length <= 10^4"] },
  { title: "Reverse String", description: "Write a function that reverses a string.", difficulty: "Easy", tags: ["String", "Two Pointers"], exampleInput: 's = ["h","e","l","l","o"]', exampleOutput: '["o","l","l","e","h"]', constraints: ["1 <= s.length <= 10^5"] },
  { title: "Valid Palindrome", description: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.", difficulty: "Easy", tags: ["Two Pointers", "String"], exampleInput: "s = 'A man, a plan, a canal: Panama'", exampleOutput: "true", constraints: [] },
  { title: "Longest Substring Without Repeating Characters", description: "Given a string s, find the length of the longest substring without repeating characters.", difficulty: "Medium", tags: ["Hash Table", "String", "Sliding Window"], exampleInput: "s = 'abcabcbb'", exampleOutput: "3", constraints: [] },
  { title: "Merge Intervals", description: "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals.", difficulty: "Medium", tags: ["Array", "Sorting"], exampleInput: "intervals = [[1,3],[2,6],[8,10],[15,18]]", exampleOutput: "[[1,6],[8,10],[15,18]]", constraints: [] },
  { title: "Maximum Subarray", description: "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.", difficulty: "Medium", tags: ["Array", "Dynamic Programming"], exampleInput: "nums = [-2,1,-3,4,-1,2,1,-5,4]", exampleOutput: "6", constraints: [] },
  { title: "Climbing Stairs", description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?", difficulty: "Easy", tags: ["Math", "Dynamic Programming"], exampleInput: "n = 2", exampleOutput: "2", constraints: [] },
  { title: "Find Minimum in Rotated Sorted Array", description: "Given the sorted rotated array nums of unique elements, return the minimum element of this array.", difficulty: "Medium", tags: ["Array", "Binary Search"], exampleInput: "nums = [3,4,5,1,2]", exampleOutput: "1", constraints: [] },
  { title: "Container With Most Water", description: "Given n non-negative integers a1, a2, ..., an , where each represents a point at coordinate (i, ai). n vertical lines are drawn such that the two endpoints of the line i is at (i, ai) and (i, 0). Find two lines, which, together with the x-axis forms a container, such that the container contains the most water.", difficulty: "Medium", tags: ["Array", "Two Pointers"], exampleInput: "height = [1,8,6,2,5,4,8,3,7]", exampleOutput: "49", constraints: [] },
  { title: "Valid Parentheses", description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.", difficulty: "Easy", tags: ["String", "Stack"], exampleInput: "s = '()'", exampleOutput: "true", constraints: [] }
];

const aptitudeQuestions = [
  { question: "If A is faster than B, and B is faster than C, who is the slowest?", options: ["A", "B", "C", "Cannot be determined"], correctAnswer: 2, topic: "Logic", category: "Mental Ability", difficulty: "Easy" },
  { question: "What comes next in the sequence: 2, 4, 8, 16, ...?", options: ["24", "32", "64", "128"], correctAnswer: 1, topic: "Math", category: "Quant", difficulty: "Easy" },
  { question: "If 5 machines make 5 widgets in 5 minutes, how long for 100 machines to make 100 widgets?", options: ["100 minutes", "50 minutes", "5 minutes", "10 minutes"], correctAnswer: 2, topic: "Logic", category: "Mental Ability", difficulty: "Medium" },
  { question: "Which word does not belong?", options: ["Apple", "Banana", "Carrot", "Mango"], correctAnswer: 2, topic: "Verbal", category: "Language", difficulty: "Easy" },
  { question: "Solve for x: 2x + 5 = 15", options: ["5", "10", "15", "20"], correctAnswer: 0, topic: "Math", category: "Algebra", difficulty: "Easy" },
  { question: "The day after tomorrow is Thursday. What day was yesterday?", options: ["Sunday", "Monday", "Tuesday", "Wednesday"], correctAnswer: 0, topic: "Logic", category: "Reasoning", difficulty: "Hard" },
  { question: "What is 15% of 200?", options: ["15", "20", "30", "45"], correctAnswer: 2, topic: "Math", category: "Quant", difficulty: "Easy" },
  { question: "If a train travels 60 miles in 1 hour, how far will it travel in 2.5 hours?", options: ["120 miles", "150 miles", "180 miles", "200 miles"], correctAnswer: 1, topic: "Math", category: "Quant", difficulty: "Medium" },
  { question: "A is the brother of B. B is the sister of C. C is the father of D. How is D related to A?", options: ["Nephew/Niece", "Son", "Brother", "Uncle"], correctAnswer: 0, topic: "Logic", category: "Relations", difficulty: "Hard" },
  { question: "Find the odd one out: 4, 9, 16, 25, 30, 36", options: ["16", "25", "30", "36"], correctAnswer: 2, topic: "Math", category: "Quant", difficulty: "Medium" }
];

async function seed() {
    try {
        if (!MONGO_URI) {
            console.error("MONGO_URI not set.");
            process.exit(1);
        }
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        await Problem.deleteMany({});
        await AptitudeQuestion.deleteMany({});

        await Problem.insertMany(problems);
        await AptitudeQuestion.insertMany(aptitudeQuestions);

        console.log("Seeding complete: 10 Problems, 10 Aptitude Questions added.");
        process.exit(0);
    } catch (err) {
        console.error("Seeding error:", err);
        process.exit(1);
    }
}

seed();
