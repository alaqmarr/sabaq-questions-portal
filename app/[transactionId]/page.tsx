'use client'
import { app } from '@/lib/firebase';
import { useParams } from 'next/navigation'
import React, { ReactElement, useEffect, useState } from 'react'
import { getDatabase, get, ref, set } from 'firebase/database';
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Divider } from '@nextui-org/divider';

const Questions = () => {
  const [questions, setQuestions] = useState<ReactElement<any>[]>()
  const [vocab, setVocab] = useState<ReactElement<any>[]>()
  const search = useParams();
  const transaction = search.transactionId;
  const db = getDatabase(app);
  useEffect(() => {
    const refer = ref(db, `transactions/${transaction}`);
    get(refer).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const sabaqId = data.sabaqId;
        const date = data.date;

        const quesRef = ref(db, `asbaaq/${sabaqId}/questions/${date}`);
        const vocabRef = ref(db, `asbaaq/${sabaqId}/vocab/${date}`);
        get(quesRef).then((snapshot) => {
          let questionsArray: any = [];
          if (snapshot.exists()) {
            const data = snapshot.val();
            console.log(data);
            for (const userId in data) {
              const mumin_name_ref = ref(db, `mumineen/${userId}/mumin_name`)
              get(mumin_name_ref).then((snapshot) => {
                if (snapshot.exists()) {
                  const data = snapshot.val();
                  console.log(data);
                  const mumin_name = data;
                  const newRef = ref(db, `asbaaq/${sabaqId}/questions/${date}/${userId}`);
                  get(newRef).then((snapshot) => {
                    if (snapshot.exists()) {
                      const data = snapshot.val();
                      console.log(data);
                      for (const question in data) {
                        questionsArray.push(
                          <Card key={question}>
                            <CardHeader>{data[question]}</CardHeader>
                            <Divider/>
                            <CardFooter>
                              Question by: {userId}, {mumin_name}
                            </CardFooter>
                          </Card>
                        )
                      }
                    } else {
                      console.log("No data available");
                      setQuestions([<h1>No data available</h1>]);
                    }
                  }).catch((error) => {
                    console.error(error);
                  });
                } else {
                  console.log("No data available");
                  setQuestions([<h1>No data available</h1>]);
                }
              }).catch((error) => {
                console.error(error);
              });

            }
            setQuestions(questionsArray);
          } else {
            console.log("No data available");
            setQuestions([<h1>No data available</h1>]);
          }
        }).catch((error) => {
          console.error(error);
        });

        get(vocabRef).then((snapshot) => {
          let vocabArray: any = [];
          const data = snapshot.val();
          console.log(data);
          for (const wordId in data){
            const word = data[wordId].word;
            const count = data[wordId].count;
            vocabArray.push(
              <Card key={wordId} className='w-300px'>
                <CardHeader>{word}</CardHeader>
                <Divider/>
                <CardBody>
                  Asked By: {count} mumineen
                </CardBody>
              </Card>
            )

            setVocab(vocabArray);

          }
        }).catch((error) => {
          console.error(error);

        });

      } else {
        console.log("No data available");
        setQuestions([<h1>No data available</h1>]);
      }
    }).catch((error) => {
      console.error(error);
    });
  }, [transaction])


  return (
    <div className='flex flex-col items-center justify-center gap-y-3'>
      {questions}
      {vocab}
    </div>
  )
}

export default Questions