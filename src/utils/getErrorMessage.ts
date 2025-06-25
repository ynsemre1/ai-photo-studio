export function getErrorMessage(error: any): string {
    // Firebase error
    if (error?.code?.startsWith("auth/")) {
      return getFirebaseAuthErrorMessage(error.code);
    }
  
    // Network error
    if (error?.message?.includes("Network request failed")) {
      return "İnternet bağlantısı yok.";
    }
  
    // Private application error
    if (typeof error === "string") {
      return error;
    }
  
    if (error instanceof Error) {
      return error.message;
    }
  
    return "Beklenmeyen bir hata oluştu.";
  }
  
  // Firebase authentication error messages
  function getFirebaseAuthErrorMessage(code: string): string {
    switch (code) {
      case "auth/invalid-email":
        return "Geçersiz e-posta adresi.";
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "E-posta adresi veya şifre hatalı.";
      case "auth/email-already-in-use":
        return "Bu e-posta adresi zaten kullanılıyor.";
      case "auth/weak-password":
        return "Zayıf şifre. Daha güçlü bir şifre belirleyin.";
      case "auth/network-request-failed":
        return "İnternet bağlantısı yok.";
      default:
        return "Bir hata oluştu.";
    }
  }