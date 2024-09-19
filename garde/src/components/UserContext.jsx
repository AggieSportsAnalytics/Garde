import { createContext, useState, useContext } from "react";

// Create the UserContext
const UserContext = createContext();

// Create a provider component
export function UserProvider({ children }) {
	const [userData, setUserData] = useState(null);

	return (
		<UserContext.Provider value={{ userData, setUserData }}>
			{children}
		</UserContext.Provider>
	);
}

// Custom hook to use the UserContext
export function useUser() {
	return useContext(UserContext);
}
