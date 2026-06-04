export default function Stepper({ step }: { step: number }) {
  const steps = ["Subir PDF", "Revisar", "Generar"];
  return (
    <ol className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs sm:text-sm">
      {steps.map((s, i) => {
        const n = i + 1, active = n === step, done = n < step;
        return (
          <li key={s} className="flex items-center gap-1.5 sm:gap-2">
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-xs ${
              active ? "bg-teal text-white" : done ? "bg-teal-sf text-teal-dk" : "border border-line bg-card text-faint"}`}>{n}</span>
            <span className={`whitespace-nowrap ${active ? "text-ink" : "text-muted"}`}>{s}</span>
            {i < steps.length - 1 && <span className="mx-0.5 h-px w-4 bg-line sm:mx-1 sm:w-8" />}
          </li>
        );
      })}
    </ol>
  );
}
