export async function login(email: string, password: string) {
  const response = await fetch("https://music-minds-backend.onrender.com/api/v1/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized: Invalid email or password");
    }
    const errorData = await response.json();
    throw new Error(errorData.message || "Login failed");
  }

  return response.json();
}

// function for OTP verification
export async function verifyOTP(email: string, otp: string) {
  const response = await fetch("https://music-minds-backend.onrender.com/api/v1/auth/verify-email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, otp }),
  });

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error("Invalid OTP or email");
    }
    const errorData = await response.json();
    throw new Error(errorData.message || "OTP verification failed");
  }

  return response.json();
}

export async function resendOTP(email: string) {
  const response = await fetch("https://music-minds-backend.onrender.com/api/v1/auth/resend-otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error("Invalid email");
    }
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to resend OTP");
  }

  return response.json();
}

// Mock implementation for reset password (to be replaced with real API call)
export async function resetPassword(token: string, newPassword: string) {
  // Simulate a delay to mimic API call
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Mock validation
  if (!token) {
    throw new Error("Invalid reset token");
  }
  if (!newPassword || newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }

  // Mock successful response
  return {
    success: true,
    message: "Password reset successfully",
  };
}