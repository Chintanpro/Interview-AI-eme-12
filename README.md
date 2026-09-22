# InterviewIQ

**InterviewIQ is an AI-powered interview practice platform that helps you prepare for real interviews by actually letting you practice them.**

Instead of just reading interview questions, you can sit through a realistic mock interview, answer questions, get instant feedback, see where you went wrong, and keep track of your progress over time.

The goal of this project is simple:

> **Practice like it's a real interview, learn from every answer, and become better before the actual interview.**

---

## What can you do with InterviewIQ?

### 🎯 Practice AI Mock Interviews

Choose the company, role, experience level, interview round, and type of interviewer you want to practice with.

You can practice with different interviewer styles:

* **Recruiter** – focuses on communication, motivation, culture fit, and your career story.
* **Hiring Manager** – asks tougher questions about decisions, ownership, failures, and results.
* **Technical Interviewer** – focuses on technical knowledge, system design, debugging, and trade-offs.
* **Panel Interview** – simulates an interview with multiple interviewers.

You can also choose different interview rounds:

* HR
* Behavioral
* Technical
* Case Study
* Managerial
* Final

---

## 🧠 Get feedback on every answer

After you answer a question, the AI analyzes your response instead of simply moving to the next question.

It looks at things like:

* Clarity
* Confidence
* Relevance
* Structure
* Completeness
* Depth

You also get:

* An overall score
* What you did well
* What was missing
* Suggestions for improvement
* A better version of your answer
* STAR/CAR/PAR framework detection
* Filler-word detection
* Detection of specific numbers and examples

This makes it easier to understand **why an answer worked or didn't work**.

---

## 🎤 Practice with your voice

InterviewIQ also has a voice interview mode.

You can:

* Speak your answers instead of typing
* See your speech converted into text
* Hear the AI interviewer ask questions
* Replay questions
* Turn automatic question reading on or off
* Switch between text and voice whenever you want

Voice mode uses the browser's built-in Speech Recognition and Speech Synthesis APIs.

For the best experience, use **Chrome or Edge**.

---

## 🏢 Prepare for a specific company

Preparing for a company is different from preparing for a generic interview.

The **Company Prep** feature generates questions based on the company, role, and experience level you're targeting.

It can provide:

* Company insights
* Interview style
* Culture and values
* HR questions
* Behavioral questions
* Technical questions
* Case-study questions
* Managerial questions
* Final-round questions
* Why the question might be asked
* What the interviewer is testing
* Tips for answering
* Talking points
* Things to be prepared for

---

## 📄 Analyze your resume

You can upload your resume and compare it with a job description.

InterviewIQ can identify:

* Skills that match the job
* Skills you may be missing
* Additional skills on your resume
* Potential red flags
* Keywords worth mentioning
* Questions an interviewer might ask based on your resume
* Overall resume-to-job match

This is especially useful for finding things an interviewer might notice before you walk into the interview.

---

## 💰 Practice salary negotiations

Salary negotiations can be uncomfortable, especially when you haven't practiced them.

InterviewIQ includes a salary negotiation simulator where the AI acts as an HR manager.

You can set things like:

* Company
* Role
* Location
* Current salary
* Target salary
* Years of experience

Then you can practice responding to offers and counteroffers in a realistic conversation.

---

## 📊 Track your progress

Interview practice shouldn't be a one-time thing.

InterviewIQ keeps track of your previous sessions so you can see how you're improving.

The dashboard includes things such as:

* Interview history
* Overall scores
* Performance trends
* Strengths
* Weak areas
* Achievements
* Dimension-level performance

You can use this to figure out what you should focus on before your next interview.

---

## 📋 Detailed interview reports

After finishing an interview, you get a complete breakdown of your performance.

The report includes:

* Overall score
* Performance radar
* Individual skill scores
* AI-generated summary
* Strengths
* Areas to improve
* Question-by-question review
* Your original answers
* Improved answers
* Missing points

So instead of simply getting a score, you can actually understand **what to work on next**.

---

# 🛠️ Tech Stack

InterviewIQ is built as a full-stack application.

### Frontend

* React
* React Router
* Tailwind CSS
* CRACO
* Framer Motion
* Zustand
* Axios
* Recharts
* Radix UI
* Lucide React
* Sonner

### Backend

* Python
* FastAPI
* MongoDB
* Motor
* Pydantic
* JWT
* bcrypt
* Uvicorn
* PDFPlumber

### AI

The AI functionality currently uses the Emergent LLM integration layer with Anthropic Claude models.

AI is used for:

* Generating interview questions
* Evaluating answers
* Generating company preparation
* Resume analysis
* Salary negotiation
* Interview summaries

### Payments

* Stripe Checkout
* Stripe webhooks
* Payment transaction tracking

---

# 📁 Project Structure

```text
Interview-AI-eme-12/
│
├── backend/
│   ├── ai_service.py
│   ├── models.py
│   ├── requirements.txt
│   └── server.py
│
├── frontend/
│   ├── public/
│   ├── plugins/
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       └── pages/
│
├── tests/
│   └── test_core_ai.py
│
├── test_reports/
├── memory/
├── plan.md
├── design_guidelines.md
├── backend_test.py
├── test_result.md
└── README.md
```

---

# 🚀 Running the Project Locally

## 1. Clone the repository

```bash
git clone https://github.com/Chintanpro/Interview-AI-eme-12.git
cd Interview-AI-eme-12
```

---

## 2. Set up the backend

Go into the backend folder:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### macOS / Linux

```bash
source venv/bin/activate
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file inside the `backend` folder.

Example:

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=interviewiq
JWT_SECRET=your-secret-key

EMERGENT_LLM_KEY=your-ai-key

STRIPE_API_KEY=your-stripe-key
```

Start the backend:

```bash
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:

```text
http://localhost:8000
```

FastAPI also provides interactive API documentation at:

```text
http://localhost:8000/docs
```

---

# 💻 Frontend

Open another terminal and go to the frontend:

```bash
cd frontend
```

Install the dependencies:

```bash
npm install
```

or:

```bash
yarn install
```

Create a `.env` file if needed:

```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

Start the frontend:

```bash
npm start
```

or:

```bash
yarn start
```

The application should then be available at:

```text
http://localhost:3000
```

---

# 🧪 Testing

The repository includes tests for the AI and backend functionality.

Run the Python tests with:

```bash
pytest
```

Core AI tests are located here:

```text
tests/test_core_ai.py
```

There are also test reports in:

```text
test_reports/
```

---

# 🔐 Environment Variables

Don't commit your API keys or other secrets to GitHub.

The main environment variables used by the project are:

| Variable                | Used for                      |
| ----------------------- | ----------------------------- |
| `MONGO_URL`             | MongoDB connection            |
| `DB_NAME`               | Database name                 |
| `JWT_SECRET`            | Authentication tokens         |
| `EMERGENT_LLM_KEY`      | AI functionality              |
| `STRIPE_API_KEY`        | Stripe payments               |
| `REACT_APP_BACKEND_URL` | Frontend → backend connection |

---

# 💳 Plans & Payments

InterviewIQ has support for different subscription levels:

* **Free**
* **Pro**
* **Premium**

The backend handles plan restrictions, while Stripe is used for the payment flow.

For example, some features such as voice interviews are restricted to paid plans.

If you're deploying this project for real users, make sure to replace development/test Stripe configuration with production credentials and properly configure webhook security.

---

# ⚠️ A few things to know

This is an actively developed project, so some parts may still need additional production hardening.

AI response times can vary depending on the external AI service.

Company preparation can sometimes take longer than other AI requests.

Voice functionality depends on browser support for the Web Speech APIs.

The Stripe setup also needs production configuration before being used for real payments.

---

# 🔮 What's next?

Some areas I'd like to improve further include:

* Better AI response reliability
* Faster company preparation
* More detailed interview analytics
* Better mobile experience
* More interviewer personalities
* More realistic company-specific interviews
* Improved voice conversations
* Better AI observability and error handling
* More personalized interview preparation
* Stronger production security
* More advanced interview simulations

---

# 📚 Project Documentation

Some of the project planning and development notes can be found here:

* [`plan.md`](./plan.md)
* [`design_guidelines.md`](./design_guidelines.md)
* [`test_result.md`](./test_result.md)

---

# 🤝 Contributing

If you have an idea, find a bug, or want to improve something, feel free to open an issue or submit a pull request.

Before submitting a PR, please make sure your changes don't break the existing interview flow.

---

# 📌 Why I Built This

Interview preparation is often repetitive.

You read hundreds of questions, watch videos, and try to prepare answers — but that doesn't necessarily mean you're comfortable when someone actually starts asking you questions.

InterviewIQ is my attempt to make that preparation more interactive.

Instead of only **studying interviews**, you can actually **practice being interviewed**.

---

## ⭐ Project

**InterviewIQ**

An AI-powered interview practice platform built with React, FastAPI, MongoDB, and Claude.

GitHub:

https://github.com/Chintanpro/Interview-AI-eme-12
