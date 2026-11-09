import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const CheckoutSteps = ({ step1, step2, step3, step4 }) => {
  const steps = [
    { name: 'Sign In', link: '/login', active: step1 },
    { name: 'Shipping', link: '/shipping', active: step2 },
    { name: 'Payment', link: '/payment', active: step3 },
    { name: 'Place Order', link: '/placeorder', active: step4 },
  ];

  return (
    <div className="w-full py-6 mb-8">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => (
          <div key={step.name} className="flex items-center">
            <div className="relative flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                  step.active
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'bg-background border-muted-foreground text-muted-foreground'
                }`}
              >
                {step.active ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-bold">{index + 1}</span>
                )}
              </div>
              <div className="absolute top-10 w-32 text-center">
                {step.active ? (
                  <Link
                    to={step.link}
                    className="text-sm font-bold text-primary hover:underline"
                  >
                    {step.name}
                  </Link>
                ) : (
                  <span className="text-sm font-medium text-muted-foreground">
                    {step.name}
                  </span>
                )}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-12 sm:w-24 h-0.5 mx-2 ${
                  steps[index + 1].active ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="h-8" /> {/* Spacer for absolute positioned labels */}
    </div>
  );
};

export default CheckoutSteps;
