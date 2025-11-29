import { useStore } from '../store';
import { CheckCircle2, Circle, Loader2, XCircle, Map } from 'lucide-react';
import { PlanStep } from '../types';

const StepIcon = ({ status }: { status: PlanStep['status'] }) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 size={20} className="text-dark-success" />;
    case 'in-progress':
      return <Loader2 size={20} className="text-dark-accent animate-spin" />;
    case 'error':
      return <XCircle size={20} className="text-dark-error" />;
    default:
      return <Circle size={20} className="text-dark-text-secondary" />;
  }
};

const PlanView = () => {
  const { planSteps } = useStore();

  if (planSteps.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-dark-text-secondary">
        <div className="text-center">
          <Map size={48} className="mx-auto mb-4 opacity-50" />
          <p>Nenhum plano ativo</p>
          <p className="text-sm mt-2">O agente criará um plano quando você iniciar uma tarefa</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <h2 className="text-xl font-semibold mb-6 text-dark-text flex items-center gap-2">
        <Map size={24} />
        Plano de Execução
      </h2>

      <div className="space-y-4">
        {planSteps.map((step, index) => (
          <div
            key={step.id}
            className="panel p-4 hover:border-dark-accent transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <StepIcon status={step.status} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-dark-text-secondary text-sm">
                    Passo {index + 1}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      step.status === 'completed'
                        ? 'bg-dark-success/20 text-dark-success'
                        : step.status === 'in-progress'
                        ? 'bg-dark-accent/20 text-dark-accent'
                        : step.status === 'error'
                        ? 'bg-dark-error/20 text-dark-error'
                        : 'bg-dark-hover text-dark-text-secondary'
                    }`}
                  >
                    {step.status === 'completed'
                      ? 'Concluído'
                      : step.status === 'in-progress'
                      ? 'Em andamento'
                      : step.status === 'error'
                      ? 'Erro'
                      : 'Pendente'}
                  </span>
                </div>
                <h3 className="text-dark-text font-medium mt-1">{step.title}</h3>
                {step.description && (
                  <p className="text-sm text-dark-text-secondary mt-2">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlanView;
