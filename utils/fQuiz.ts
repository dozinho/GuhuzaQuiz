interface QuizQuestion {
  question: string;
  comment: string;
  test_answer: number;
  answers: string[];
}

interface QuizTestGroup {
  test_group: number;
  next_test_group: number;
  question: QuizQuestion[];
}

interface QuizApiResponse {
  test: QuizTestGroup;
}

export const fetchQuiz = async (level: string): Promise<QuizApiResponse> => {
  const res = await fetch(`https://api-ghz-v2.azurewebsites.net/api/v2/quiz?level=${level}`);
  //const res = await fetch(`/api/quiz?level=${level}`);
  if (!res.ok) throw new Error('Failed to fetch quiz');
  return res.json();
};



const fetchQuestion = async() => { 
  const quresponse = await fetch("https://api-ghz-v2.azurewebsites.net/api/v2/quiz?level=8")
  const questions = quresponse.json()
}