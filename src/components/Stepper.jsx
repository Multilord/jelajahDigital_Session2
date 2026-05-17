import { Brain, Wand2, Gamepad2, Megaphone, ChevronRight } from 'lucide-react';

const ICON_MAP = {
  Brain: Brain,
  Wand2: Wand2,
  Gamepad2: Gamepad2,
  Megaphone: Megaphone
};

export default function Stepper({ steps, activeNav }) {
  const activeIndex = steps.findIndex(s => s.id === activeNav);

  return (
    <nav className="stepper-nav">
      {steps.map((step, index) => {
        const Icon = ICON_MAP[step.icon];
        const isActive = step.id === activeNav;
        const isDone = index < activeIndex;

        return (
          <div key={step.id} className={`step-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
            <div className="step-circle">
              <Icon size={20} />
            </div>
            <span className="step-title">{step.title}</span>
            {index < steps.length - 1 && <ChevronRight className="step-arrow" size={16} />}
          </div>
        );
      })}
    </nav>
  );
}
