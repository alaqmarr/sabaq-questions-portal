'use client'
import { app } from '@/lib/firebase';
import { useParams } from 'next/navigation';
import React, { ReactElement, useEffect, useState } from 'react';
import { getDatabase, get, ref } from 'firebase/database';
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Divider } from '@nextui-org/divider';

const Questions = () => {
  const [questions, setQuestions] = useState<ReactElement[]>([]);
  const [vocab, setVocab] = useState<ReactElement[]>([]);
  const { transactionId: transaction } = useParams();
  const db = getDatabase(app);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const transactionRef = ref(db, `transactions/${transaction}`);
        const transactionSnapshot = await get(transactionRef);

        if (!transactionSnapshot.exists()) {
          setQuestions([<h1>No data available</h1>]);
          return;
        }

        const { sabaqId, date } = transactionSnapshot.val();

        const [questionsSnapshot, vocabSnapshot] = await Promise.all([
          get(ref(db, `asbaaq/${sabaqId}/questions/${date}`)),
          get(ref(db, `asbaaq/${sabaqId}/vocab/${date}`))
        ]);

        if (questionsSnapshot.exists()) {
          const questionsData = questionsSnapshot.val();
          const questionsArray: ReactElement[] = (await Promise.all(
            Object.keys(questionsData).map(async (userId) => {
              const muminNameSnapshot = await get(ref(db, `mumineen/${userId}/mumin_name`));
              const muminName = muminNameSnapshot.exists() ? muminNameSnapshot.val() : "Unknown";
              const userQuestionsSnapshot = await get(ref(db, `asbaaq/${sabaqId}/questions/${date}/${userId}`));

              if (userQuestionsSnapshot.exists()) {
                const userQuestions = userQuestionsSnapshot.val();
                return Object.keys(userQuestions).map((questionId) => (
                  <Card key={questionId}>
                    <CardHeader>{userQuestions[questionId]}</CardHeader>
                    <Divider />
                    <CardFooter>
                      Question by: {userId}, {muminName}
                    </CardFooter>
                  </Card>
                ));
              } else {
                return [<h1 key={`${userId}-no-data`}>No data available</h1>];
              }
            })
          )).flat();
          setQuestions(questionsArray);
        } else {
          setQuestions([<h1>No data available</h1>]);
        }

        if (vocabSnapshot.exists()) {
          const vocabData = vocabSnapshot.val();
          const vocabArray = Object.keys(vocabData).map((wordId) => (
            <Card key={wordId} className='w-300px'>
              <CardHeader>{vocabData[wordId].word}</CardHeader>
              <Divider />
              <CardBody>
                Asked By: {vocabData[wordId].count} mumineen
              </CardBody>
            </Card>
          ));
          setVocab(vocabArray);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [transaction, db]);

  return (
    <div className='flex flex-col items-center justify-center gap-y-3'>
      {questions}
      {vocab}
    </div>
  );
};

export default Questions;
