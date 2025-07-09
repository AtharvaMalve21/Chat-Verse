import { createContext, useState } from "react";

export const MessageContext = createContext({});

export const MessageContextProvider = ({ children }) => {

    const [messages, setMessages] = useState([]);

    return (
        <MessageContext.Provider value={{ messages, setMessages }}>
            {children}
        </MessageContext.Provider>
    )
}