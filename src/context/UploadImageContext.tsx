import React, { createContext, useContext, useState } from "react";

type UploadImageContextType = {
  triggerCamera: () => void;
  setTriggerCamera: (fn: () => void) => void;
};

const UploadImageContext = createContext<UploadImageContextType>({
  triggerCamera: () => {},
  setTriggerCamera: () => {},
});

export const UploadImageProvider = ({ children }: { children: React.ReactNode }) => {
  const [cameraTrigger, setCameraTrigger] = useState<() => void>(() => () => {});

  return (
    <UploadImageContext.Provider
      value={{ triggerCamera: cameraTrigger, setTriggerCamera: setCameraTrigger }}
    >
      {children}
    </UploadImageContext.Provider>
  );
};

export const useUploadImage = () => useContext(UploadImageContext);