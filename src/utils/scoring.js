import { FLAVORS } from '../data/flavors';
import { QUIZ_QUESTIONS } from '../data/quizQuestions';

/**
 * Menghitung rekomendasi rasa es krim dan paket topping berdasarkan jawaban 6 pertanyaan kuis:
 * - Rasa es krim: jumlahkan poin dari Q1 dan Q2, ambil yang tertinggi. Kalau seri, ikuti jawaban Q1.
 * - Topping tabur: dari Q3 (Q6 sebagai pelengkap).
 * - Topping buah: dari Q4 (kecuali jika Q4 memilih D "Lagi nggak pengin buah").
 * - Topping selai: dari Q5 (Q6 sebagai pelengkap).
 */
export function calculateRecommendation(answers, soldOutFlavors = [], soldOutToppings = []) {
  const scores = {};
  FLAVORS.forEach(f => {
    scores[f.id] = 0;
  });

  // 1. Hitung poin Rasa Es Krim dari Q1 & Q2
  const q1Obj = QUIZ_QUESTIONS.find(q => q.id === 'q1');
  const q2Obj = QUIZ_QUESTIONS.find(q => q.id === 'q2');

  const q1Option = q1Obj?.options.find(opt => opt.id === answers.q1);
  const q2Option = q2Obj?.options.find(opt => opt.id === answers.q2);

  if (q1Option?.flavorId && scores[q1Option.flavorId] !== undefined) {
    scores[q1Option.flavorId] += 1;
  }
  if (q2Option?.flavorId && scores[q2Option.flavorId] !== undefined) {
    scores[q2Option.flavorId] += 1;
  }

  // Filter varian yang tersedia (tidak sold out)
  const availableFlavors = FLAVORS.filter(f => !soldOutFlavors.includes(f.id));
  const pool = availableFlavors.length > 0 ? availableFlavors : FLAVORS;

  // Cari skor tertinggi; jika seri (misal Q1 dan Q2 pilih rasa berbeda sehingga masing-masing 1 poin),
  // ikuti jawaban Q1 (selama tersedia di pool).
  let bestFlavorId = pool[0].id;
  let highestScore = -1;

  pool.forEach(f => {
    const total = scores[f.id] ?? 0;
    if (total > highestScore) {
      highestScore = total;
      bestFlavorId = f.id;
    }
  });

  // Tie-breaker: jika jawaban Q1 memiliki skor yang sama dengan highestScore dan ada di pool, prioritaskan Q1!
  if (
    q1Option?.flavorId &&
    pool.some(f => f.id === q1Option.flavorId) &&
    (scores[q1Option.flavorId] ?? 0) === highestScore
  ) {
    bestFlavorId = q1Option.flavorId;
  }

  const matchedFlavor = FLAVORS.find(f => f.id === bestFlavorId) || FLAVORS[0];

  // 2. Kumpulkan rekomendasi Topping dari Q3 (Tabur), Q4 (Buah), Q5 (Selai), dan Q6 (Pelengkap)
  const recommendedToppingsSet = new Set();

  const q3Option = QUIZ_QUESTIONS.find(q => q.id === 'q3')?.options.find(o => o.id === answers.q3);
  const q4Option = QUIZ_QUESTIONS.find(q => q.id === 'q4')?.options.find(o => o.id === answers.q4);
  const q5Option = QUIZ_QUESTIONS.find(q => q.id === 'q5')?.options.find(o => o.id === answers.q5);
  const q6Option = QUIZ_QUESTIONS.find(q => q.id === 'q6')?.options.find(o => o.id === answers.q6);

  // Topping tabur dari Q3
  (q3Option?.toppings || []).forEach(t => recommendedToppingsSet.add(t));

  // Topping buah dari Q4
  const noFruitWanted = answers.q4 === 'D';
  (q4Option?.toppings || []).forEach(t => recommendedToppingsSet.add(t));

  // Topping selai dari Q5
  (q5Option?.toppings || []).forEach(t => recommendedToppingsSet.add(t));

  // Pelengkap dari Q6
  (q6Option?.toppings || []).forEach(t => {
    // Jika di Q4 memilih "Lagi nggak pengin buah", jangan tambahkan topping buah dari Q6
    if (noFruitWanted && t.startsWith('buah-')) return;
    recommendedToppingsSet.add(t);
  });

  // Filter topping yang sedang habis (sold out)
  const recommendedToppings = Array.from(recommendedToppingsSet).filter(
    tId => !soldOutToppings.includes(tId)
  );

  return {
    flavor: matchedFlavor,
    toppings: recommendedToppings,
    scoreMap: scores,
  };
}

