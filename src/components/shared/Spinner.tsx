export function Spinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="loading">
      <div className="spinner"></div>
      <div>{text}</div>
    </div>
  );
}
