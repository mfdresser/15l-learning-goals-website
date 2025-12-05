"use client"
import React, { useState, useEffect, useRef } from 'react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, onSnapshot, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';

// Use lucide-react icons for visual appeal
import { BookOpen, FlaskConical, BarChart3, Code, MessageSquare, Briefcase, Send, User, Edit, Eye } from 'lucide-react';

// Declare global variables that may be injected at runtime
declare global {
  var __app_id: string | undefined;
  var __firebase_config: string | undefined;
  var __initial_auth_token: string | undefined;
}

// --- INITIAL CONTENT CONSTANTS ---

// New Project Summary content - UPDATED: Last two sentences are now correctly wrapped in ** markdown
const INITIAL_PROJECT_SUMMARY = "Ri has spent the semester developing a new introductory physics lab course in collaboration with the Physics Department. Under the supervision of the Associate Director of Instructional Physics Labs, Ri is building the course from the ground up.\n\nCurrently, physics concentrators at Harvard receive only a brief exposure to experimental physics within their introductory lecture course. We have found that this limited time prevents students from meeting our learning goals. This new lab course is designed to provide a much more comprehensive introduction to experimental physics and, to our knowledge, is the first course of its kind at Harvard.\n\nOur aim is to create a course that can be adopted by a wide range of instructors at Harvard and beyond. Ri’s primary work this semester has focused on developing detailed learning objectives and goals. **Use this webpage to explore the course description and learning goals developed so far. Please leave a comment at the bottom of this page with any ideas or feedback you have.**";

// Initial content for the main course description
const INITIAL_COURSE_DESCRIPTION = "In this class, you will engage in experimental physics to build the foundational skills needed to design, conduct, and communicate research in physics. The course includes weekly lectures introducing coding and statistical tools and weekly labs for data collection and analysis where you will measure the speed of light, measure the radioactivity of different objects, and more! The class will culminate with two mini-projects that you can choose from a physics subfield of your interest, such as condensed matter, optics, and others! Throughout the semester, you will learn to identify key variables in physical systems, design and carry out measurements using real experimental apparatuses, and recognize the limitations and sources of error in your experiments. Through guided instruction in statistics and coding, you will analyze and visualize experimental and simulated data using Python, quantify uncertainty, and compare results to analytical physical models. Emphasis is placed on clear scientific communication—documenting experimental methods, interpreting data, and presenting findings in both written and oral formats.";

// Initial content for the Experiment section
const INITIAL_EXPERIMENT_DESCRIPTION = "Based on a research question, identify the important variables in the physical system, design a method to measure and manipulate those variables, construct or use an apparatus to carry out the measurement, understand the limitations of your apparatus, and iterate your experiments and models to achieve reasonable results.";

// Initial content for the Statistics section
const INITIAL_STATISTICS_DESCRIPTION = "Quantitatively interpret experimental data by accounting for the inherent uncertainty of physical experiments and compare your results with analytical physical models.";

// Initial content for the Code section
const INITIAL_CODE_DESCRIPTION = "Record and manipulate large amounts of experimental and simulated data and create representations of that data using Python.";

// Initial content for the Communication section
const INITIAL_COMMUNICATION_DESCRIPTION = "Clearly communicate your experimental approach and your reasoning for that approach. Articulate the conclusions you made and the reasoning behind those conclusions.";

// Sub-learning goals (bullet points)
const SUB_GOALS: { [key: string]: string[] } = {
  experiment: [
    "Identify sources of error for a given apparatus or experimental set-up",
    "Identify relevant variables in a physical system",
    "Use real experimental instruments you may encounter in a research lab.",
    "Develop and implement a systematic plan for carrying out an experiment based on a research question.",
    "Predict or hypothesize how changing variables in a physical system will change the outcome",
  ],
  statistics: [
    "Recognize and understand appropriate statistical methods for a given set of experimental data",
    "Calculate and interpret statistical and systematic uncertainty in experimental data and use error propagation.",
    "Calculate and interpret p-values, standard errors, means, medians, modes, relevant distributions",
    "Use curve-fitting methods and interpret results",
    "Compare experimental data to pre-existing physical model and draw conclusions from the comparison. Based on these comparisons, implement iterative improvements to experimental methods and analytical models.",
    "Compare multiple physical models"
  ],
  code: [
    "Recognize, describe, write, and execute fundamental Python syntax and use structures (variables, functions, conditionals, loops, lists, dictionaries, and packages) to solve physics problems without the use of AI.",
    "Write code that is annotated, clear, well documented, understandable to another classmate, and utilizes stylistic best practices",
    "Identify common Python error messages and what they indicate.",
    "Write code to convert between different representations of data: tables, plots, arrays, variables",
    "Analyze experimental data using Python, applying appropriate libraries (e.g., NumPy, pandas, matplotlib).",
    "Design and implement Python programs to simulate physical systems or test physical models. (we may consider allowing them to us AI for this after they have built coding fundamentals)",
    "Create plots of experimental data in Python"
  ],
  communication: [
    "Document experimental procedures such that they are replicable",
    "Clearly communicate through text and figures your conclusions based on experimental data.",
    "Clearly communicate in writing, diagrams, and drawings in detail your systematic plan for carrying out an experiment",
    "Articulate troubleshooting approach when experiment isn't going to plan",
    "Present scientific results in conference-style presentation",
  ],
};


/**
 * A responsive input form component for defining various aspects of a course and a project.
 * Uses Tailwind CSS for styling and React hooks for state management.
 */
const App = () => {
  // --- STATE FOR CONTENT ---
  const [projectSummary, setProjectSummary] = useState(INITIAL_PROJECT_SUMMARY);
  const [courseDescription, setCourseDescription] = useState(INITIAL_COURSE_DESCRIPTION);
  const [experiment, setExperiment] = useState(INITIAL_EXPERIMENT_DESCRIPTION);
  const [statistics, setStatistics] = useState(INITIAL_STATISTICS_DESCRIPTION);
  const [code, setCode] = useState(INITIAL_CODE_DESCRIPTION);
  const [communication, setCommunication] = useState(INITIAL_COMMUNICATION_DESCRIPTION);
  
  // New state to manage the display/edit mode for the Project Summary
  const [isEditingSummary, setIsEditingSummary] = useState(false);

  // --- STATE FOR INTERACTIVITY/FIREBASE ---
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const dbRef = useRef<any>(null);
  const authRef = useRef<any>(null);
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
  
  // Parse Firebase Config
  const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');

  // 1. Initialize Firebase and Authenticate User
  useEffect(() => {
    let unsubscribe = () => {};
    
    try {
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);
        
        dbRef.current = db;
        authRef.current = auth;

        const attemptAuth = async () => {
          if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
              await signInWithCustomToken(auth, __initial_auth_token);
          } else {
              await signInAnonymously(auth);
          }
        };

        // Listen for auth state changes and set the user ID
        unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                // Fallback for unauthenticated users, though Firebase handles anon sign-in
                setUserId(crypto.randomUUID());
            }
            setIsAuthReady(true);
        });

        attemptAuth();

    } catch (error) {
        console.error("Firebase Initialization or Auth Failed:", error);
        setIsAuthReady(true);
    }
    
    return () => unsubscribe();
  }, []); // Run only once on mount

  // 2. Load Comments in Real-time
  useEffect(() => {
    if (!isAuthReady || !dbRef.current) return;

    // Public collection path
    const commentsCollectionPath = `artifacts/${appId}/public/data/comments`;
    const q = query(collection(dbRef.current, commentsCollectionPath));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedComments = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Ensure timestamp is converted to a readable format if it exists
            timestamp: doc.data().timestamp ? doc.data().timestamp.toDate().toLocaleString() : 'Just now',
        }));
        // Sort by timestamp (in memory, as orderBy is avoided)
        fetchedComments.sort((a: any, b: any) => {
            const timeA = new Date(a.timestamp).getTime();
            const timeB = new Date(b.timestamp).getTime();
            return timeB - timeA;
        });
        setComments(fetchedComments);
    }, (error) => {
        console.error("Error fetching comments:", error);
    });

    return () => unsubscribe();
  }, [isAuthReady, appId]); // Rerun when auth is ready or app ID changes

  // 3. Function to post a new comment
  const handlePostComment = async () => {
    if (newComment.trim() === '' || !dbRef.current || !userId) return;

    const commentData = {
        text: newComment.trim(),
        userId: userId,
        timestamp: serverTimestamp(),
        // Only display the full userId as per instructions
        userNickname: userId, 
    };

    try {
        const commentsCollectionPath = `artifacts/${appId}/public/data/comments`;
        await addDoc(collection(dbRef.current, commentsCollectionPath), commentData);
        setNewComment('');
    } catch (error) {
        console.error("Error posting comment:", error);
    }
  };


  // Define the structure for the four smaller inputs
  const smallerInputs = [
    {
      title: 'Experiment',
      key: 'experiment',
      state: experiment,
      setter: setExperiment,
      icon: FlaskConical,
      // Blue -> Cyan gradient border
      gradientBorder: 'from-blue-600 via-blue-500 to-cyan-400',
      text: 'text-blue-700',
      ring: 'ring-blue-500',
      secondaryText: 'text-blue-600',
    },
    {
      title: 'Statistics',
      key: 'statistics',
      state: statistics,
      setter: setStatistics,
      icon: BarChart3,
      // Emerald -> Lime gradient border
      gradientBorder: 'from-emerald-600 via-green-500 to-lime-400',
      text: 'text-emerald-800',
      ring: 'ring-emerald-500',
      secondaryText: 'text-emerald-700',
    },
    {
      title: 'Code',
      key: 'code',
      state: code,
      setter: setCode,
      icon: Code,
      // Purple -> Pink gradient border
      gradientBorder: 'from-purple-700 via-purple-500 to-fuchsia-400',
      text: 'text-purple-800',
      ring: 'ring-purple-500',
      secondaryText: 'text-purple-700',
    },
    {
      title: 'Scientific Communication',
      key: 'communication',
      state: communication,
      setter: setCommunication,
      icon: MessageSquare,
      // Orange -> Yellow gradient border
      gradientBorder: 'from-orange-600 via-orange-500 to-yellow-400',
      text: 'text-orange-800',
      ring: 'ring-orange-500',
      secondaryText: 'text-orange-700',
    },
  ];

  // Component to render the formatted summary text
  const FormattedSummary = ({ text }: { text: string }) => {
    // Logic to split by ** and render bold sections
    return (
        <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
            {text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
                // Check if the part starts and ends with ** (is a bold segment)
                if (part.startsWith('**') && part.endsWith('**')) {
                    // Render bold, stripping the ** markers
                    return <strong key={index}>{part.slice(2, -2)}</strong>;
                }
                // Render plain text
                return part;
            })}
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* --- GLOBAL HEADER --- */}
        <div className="bg-indigo-900 text-white shadow-2xl p-6 rounded-2xl mb-8 border-b-8 border-yellow-400">
          <h1 className="text-5xl font-extrabold text-center">
            Ri's BGF Showcase
          </h1>
          {/* Display User ID for identification in a collaborative app */}
          {isAuthReady && userId && (
            <p className="text-xs text-center mt-2 opacity-75 break-words">
              Your User ID: {userId}
            </p>
          )}
        </div>

        {/* --- 1. Project Summary Text Box (Toggled between read/edit) --- */}
        <div className="bg-white shadow-2xl rounded-2xl p-8 mb-10 border-t-8 border-red-600">
          
          <div className="flex justify-between items-center mb-4">
              <label htmlFor="project-summary" className="flex items-center text-3xl font-extrabold text-indigo-800">
                <Briefcase className="w-8 h-8 mr-3 text-red-600" />
                Summary of Ri's Project
              </label>
              <button
                onClick={() => setIsEditingSummary(!isEditingSummary)}
                className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-200 transition duration-150"
                aria-label={isEditingSummary ? "View formatted summary" : "Edit summary source text"}
              >
                {isEditingSummary ? (
                    <>
                        <Eye className="w-5 h-5" />
                        <span>View Mode</span>
                    </>
                ) : (
                    <>
                        <Edit className="w-5 h-5" />
                        <span>Edit Source</span>
                    </>
                )}
              </button>
          </div>
          
          <div className="w-full p-4 border-2 border-red-200 rounded-xl bg-gray-50 shadow-inner resize-none">
            {isEditingSummary ? (
                // EDIT MODE: Show the textarea to edit the markdown source
                <textarea
                    id="project-summary"
                    rows={15}
                    className="w-full h-full p-0 border-none focus:ring-0 resize-none text-gray-800 whitespace-pre-wrap"
                    placeholder="Describe the project, its goals, and key deliverables here."
                    value={projectSummary}
                    onChange={(e) => setProjectSummary(e.target.value)}
                />
            ) : (
                // READ MODE: Show the formatted text
                <FormattedSummary text={projectSummary} />
            )}
          </div>
          
        </div>


        {/* --- Secondary Header --- */}
        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-6 text-center pt-4">
          Introductory Physics Laboratory
        </h2>

        {/* --- 2. Central Course Description Text Box (RAINBOW BORDER) --- */}
        {/* The outer div provides the rainbow gradient "Border" by having padding */}
        <div className="rounded-3xl p-3 bg-gradient-to-r from-red-500 via-orange-500 via-yellow-500 via-green-500 via-blue-500 via-indigo-500 to-purple-500 shadow-2xl mb-12">
            <div className="bg-white rounded-2xl p-6 h-full">
                <label htmlFor="course-desc" className="flex items-center text-2xl font-bold text-gray-800 mb-3">
                    <BookOpen className="w-8 h-8 mr-2 text-indigo-600" />
                    Course Description
                </label>
                <textarea
                    id="course-desc"
                    rows={17}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out text-gray-800 shadow-inner resize-none"
                    placeholder="Review and edit the draft description below."
                    value={courseDescription}
                    onChange={(e) => setCourseDescription(e.target.value)}
                />
            </div>
        </div>

        {/* --- 3. Grid for the Four Smaller Text Boxes (GRADIENT BORDERS) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {smallerInputs.map((input) => {
            
            return (
              <div key={input.key} className="relative group">
                {/* Gradient Border Wrapper */}
                <div className={`absolute -inset-0.5 bg-gradient-to-br ${input.gradientBorder} rounded-2xl blur-none opacity-100`}></div>
                
                {/* Content Card */}
                <div className="relative bg-white rounded-xl p-5 flex flex-col h-full hover:shadow-xl transition-shadow duration-300">
                    
                    {/* Header (No longer clickable) */}
                    <div
                    // Changed from button to div, removed click and accessibility attributes
                    className="flex items-center justify-between text-lg font-semibold mb-3 w-full text-left"
                    >
                        <span className={`flex items-center ${input.text} font-bold text-xl`}>
                            <input.icon className={`w-6 h-6 mr-2`} />
                            {input.title}
                        </span>
                        {/* Removed Chevron icons */}
                    </div>

                    {/* Main Text Area */}
                    <textarea
                    id={input.key}
                    rows={10}
                    className={`w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:${input.ring} transition duration-150 ease-in-out text-sm text-gray-800 shadow-inner resize-none mb-3`}
                    value={input.state}
                    onChange={(e) => input.setter(e.target.value)}
                    />

                    {/* Learning Goals (Always Visible) */}
                    <div
                    id={`${input.key}-content`}
                    className={`overflow-visible pt-3`} // Removed conditional visibility classes
                    >
                    <h4 className={`text-sm font-black uppercase tracking-wide ${input.secondaryText} border-t pt-3 mt-1 border-gray-200`}>
                        Learning Goals:
                    </h4>
                    <ul className="list-disc pl-5 text-sm text-gray-700 mt-2 space-y-2 marker:text-gray-400">
                        {SUB_GOALS[input.key].map((goal, i) => (
                        <li key={i}>{goal}</li>
                        ))}
                    </ul>
                    </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* --- 4. Real-time Comments Section --- */}
        <div className="mt-16 bg-white p-8 rounded-2xl shadow-2xl border border-gray-200">
            <h3 className="text-3xl font-bold text-indigo-800 mb-6 flex items-center">
                <MessageSquare className="w-7 h-7 mr-2 text-indigo-500" />
                Comments & Feedback
            </h3>

            {/* Comment Input */}
            <div className="mb-8 flex space-x-3">
                <textarea
                    className="flex-grow p-3 border-2 border-gray-300 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 resize-none shadow-inner"
                    rows={3}
                    placeholder={isAuthReady ? "Leave your feedback here..." : "Loading authentication..."}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={!isAuthReady}
                ></textarea>
                <button
                    onClick={handlePostComment}
                    disabled={!isAuthReady || newComment.trim() === ''}
                    className={`
                        self-start p-4 rounded-xl text-white font-bold transition-all duration-300 shadow-lg
                        ${isAuthReady && newComment.trim() !== ''
                            ? 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800'
                            : 'bg-gray-400 cursor-not-allowed'
                        }
                    `}
                >
                    <Send className="w-6 h-6" />
                </button>
            </div>

            {/* Comments List */}
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {comments.length === 0 && isAuthReady ? (
                    <p className="text-gray-500 text-center py-4 border-dashed border-2 border-gray-300 rounded-lg">
                        No comments yet. Be the first!
                    </p>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="bg-slate-50 p-4 rounded-lg border-l-4 border-indigo-400 shadow-sm">
                            <div className="flex justify-between items-start mb-1">
                                <span className="flex items-center font-semibold text-sm text-indigo-700 break-words">
                                    <User className="w-4 h-4 mr-1 text-indigo-500" />
                                    {comment.userId}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {comment.timestamp}
                                </span>
                            </div>
                            <p className="text-gray-800 whitespace-pre-wrap">{comment.text}</p>
                        </div>
                    ))
                )}
                {!isAuthReady && (
                    <p className="text-center text-indigo-500 animate-pulse">
                        Connecting to database...
                    </p>
                )}
            </div>
        </div>
        
        {/* Simple output visualization (moved to bottom) */}
        <div className="mt-12 p-6 bg-slate-200 rounded-xl shadow-inner border border-slate-300 opacity-70 hover:opacity-100 transition-opacity">
            <h3 className="text-xl font-bold text-slate-700 mb-4">Input Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-slate-600">
                <p>Summary: {projectSummary.length} chars</p>
                <p>Description: {courseDescription.length} chars</p>
                <p>Experiment: {experiment.length} chars</p>
                <p>Statistics: {statistics.length} chars</p>
                <p>Code: {code.length} chars</p>
                <p>Communication: {communication.length} chars</p>
            </div>
        </div>

      </div>
    </div>
  );
};

export default App;