import React, { useRef } from "react";

interface OtpInputProps {
  otp: string;
  email: string;
  handleOtpChange: (otp: string) => void;
  handleStep: (step: number) => void;
  disabled?: boolean;
}

const OtpInput: React.FC<OtpInputProps> = ({
  otp = "",
  handleOtpChange,
  disabled = false,
  email,
  handleStep,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    const newValue = value.replace(/\D/g, ""); // Only allow numbers

    if (newValue) {
      const newOtp = otp.split("");
      newOtp[index] = newValue;

      const finalOtp = newOtp.join("").slice(0, 6);
      handleOtpChange(finalOtp); // Update parent state

      // Move focus to next input if available
      if (index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      // If current input is empty, move to previous input
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      // If current input has a value, clear it
      else if (otp[index]) {
        const newOtp = otp.split("");
        newOtp[index] = "";
        handleOtpChange(newOtp.join(""));

        // Optional: move focus to current input after clearing
        inputRefs.current[index]?.focus();
      }
    }
  };

  if (!email) {
    handleStep(1);
  }

  return (
    <div className="w-full max-w-md mx-auto px-2">
      <label className="block text-sm font-medium font-sans text-gray-300 mb-2">
        OTP Verification
      </label>
      <label className="block text-sm font-medium font-sans text-gray-300 mb-2 text-balance whitespace-nowrap">
        We have sent a 6-digit Otp on {email}.<br />
        It will expire in 10 mins.{" "}
        <span
          onClick={() => {
            handleStep(1);
            handleOtpChange("");
          }}
          className="underline"
        >
          Wrong email?
        </span>
      </label>

      <div className="flex items-center justify-between space-x-2 w-full">
        {Array.from({ length: 6 }).map((_, index) => (
          <input
            autoFocus
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            maxLength={1}
            className="
              flex-1
              aspect-square
              min-w-0
              text-center 
              rounded-lg 
              bg-[#1A1A1E]
              text-white 
              text-base 
              sm:text-sm
              font-bold 
              focus:outline-none 
            "
            value={otp[index] || ""} // Ensure controlled input
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={disabled}
            placeholder="•"
          />
        ))}
      </div>
    </div>
  );
};

export default OtpInput;
