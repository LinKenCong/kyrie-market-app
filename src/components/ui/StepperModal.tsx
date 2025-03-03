import { ReactNode, useEffect, useState } from "react";
import { BaseModalBox } from "./ModalBox";

export interface BaseStep {
  title: string;
  description: string;
  status: "pending" | "success" | "failure";
}

export interface BaseStepperModalProps {
  isOpen: boolean;
  onClose: () => void;
  steps: BaseStep[];
  currentStep: number;
  children: ReactNode;
}

export const BaseStepperModal = ({
  isOpen,
  onClose,
  steps,
  currentStep,
  children,
}: BaseStepperModalProps) => {
  if (!isOpen) return null;

  return (
    <BaseModalBox isOpen={isOpen} onClose={onClose} className="km-border">
      <>
        <h2 className="text-2xl font-semibold mb-4">Confirm</h2>

        <div className="mb-4">
          <ol className="km-border font-bold flex items-center w-full p-3 space-x-2 text-sm text-center text-gray-500 bg-white shadow-xs sm:text-base sm:p-4 sm:space-x-4 rtl:space-x-reverse">
            {steps.map((step, index) => (
              <li
                key={index}
                className={`flex items-center ${(() => {
                  if (index === currentStep && step.status === "pending") {
                    return "text-blue-600";
                  } else {
                    switch (step.status) {
                      case "success":
                        return "text-green-500";
                      case "failure":
                        return "text-red-500";
                      default:
                        return "text-gray-500";
                    }
                  }
                })()}`}
              >
                <span
                  className={`flex items-center justify-center w-5 h-5 me-2 text-xs border rounded-full shrink-0 ${(() => {
                    if (index === currentStep && step.status === "pending") {
                      return "text-blue-600 border-blue-600";
                    } else {
                      switch (step.status) {
                        case "success":
                          return "text-green-500 border-green-500";
                        case "failure":
                          return "text-red-500 border-red-500";
                        default:
                          return "text-gray-500 border-gray-500";
                      }
                    }
                  })()}`}
                >
                  {index + 1}
                </span>
                {step.title}
                {index < steps.length - 1 && (
                  <svg
                    className="w-3 h-3 ms-2 sm:ms-4 rtl:rotate-180"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 12 10"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m7 9 4-4-4-4M1 9l4-4-4-4"
                    />
                  </svg>
                )}
              </li>
            ))}
          </ol>
        </div>
        <div className="mb-4">{children}</div>

        <div className="flex gap-2 justify-end mt-4">
          <button
            type="button"
            onClick={onClose}
            className="km-border font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 px-4 py-2"
          >
            Cancel
          </button>
        </div>
      </>
    </BaseModalBox>
  );
};

export interface PayStep {
  title: string;
  description: string;
  action: () => Promise<boolean>;
  requiresAction: boolean;
}

export const PayStepperModal = ({
  isOpen,
  onClose,
  steps,
  overFunc,
}: {
  isOpen: boolean;
  onClose: () => void;
  steps: PayStep[];
  overFunc: () => void;
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepStatus, setStepStatus] = useState<BaseStep["status"][]>(
    steps.map(() => "pending")
  );

  useEffect(() => {
    if (currentStep < steps.length && !steps[currentStep].requiresAction) {
      steps[currentStep]
        .action()
        .then((result) => {
          if (result) {
            setStepStatus((prev) => {
              const newStatus = [...prev];
              newStatus[currentStep] = "success";
              return newStatus;
            });
            setCurrentStep((prev) => {
              const nextStep = prev + 1;
              return nextStep;
            });
          } else {
            setStepStatus((prev) => {
              const newStatus = [...prev];
              newStatus[currentStep] = "failure";
              return newStatus;
            });
          }
        })
        .catch(() => {
          setStepStatus((prev) => {
            const newStatus = [...prev];
            newStatus[currentStep] = "failure";
            return newStatus;
          });
        });
    }
  }, [currentStep]);

  const handleProceed = async () => {
    const result = await steps[currentStep].action();
    if (result) {
      setStepStatus((prev) => {
        const newStatus = [...prev];
        newStatus[currentStep] = "success";
        return newStatus;
      });
      setCurrentStep((prev) => {
        const nextStep = prev + 1;
        return nextStep;
      });
    } else {
      setStepStatus((prev) => {
        const newStatus = [...prev];
        newStatus[currentStep] = "failure";
        return newStatus;
      });
    }
  };

  const currentStepData = currentStep < steps.length && {
    title: steps[currentStep].title,
    description: steps[currentStep].description,
    status: stepStatus[currentStep],
  };

  return (
    <BaseStepperModal
      isOpen={isOpen}
      onClose={onClose}
      steps={steps.map((step, index) => ({
        title: step.title,
        description: step.description,
        status: stepStatus[index],
      }))}
      currentStep={currentStep}
    >
      {currentStep < steps.length && currentStepData && (
        <div>
          {steps[currentStep].requiresAction && (
            <>
              <button
                onClick={handleProceed}
                className="km-border font-bold text-white bg-blue-700 hover:bg-blue-800 px-4 py-2 w-full"
              >
                {`Next Step`}
                <span aria-hidden="true" className="ml-2">
                  →
                </span>
              </button>
              <p className="text-gray-600 mt-2">
                {currentStepData.description}
              </p>
            </>
          )}
        </div>
      )}
    </BaseStepperModal>
  );
};
