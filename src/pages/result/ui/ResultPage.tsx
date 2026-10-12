interface ResultPageProps {
  readonly onRestart: () => void;
}

export function ResultPage({ onRestart }: ResultPageProps) {
  return (
    <section aria-labelledby="result-title">
      <h1 id="result-title">Результат</h1>
      <p>Тут буде підсумок розслідування.</p>
      <button type="button" onClick={onRestart}>
        Грати знову
      </button>
    </section>
  );
}
