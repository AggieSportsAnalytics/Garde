import { configureStore } from "@reduxjs/toolkit";
import tournamentReducer from "./features/tournamentSlice";

const store = configureStore({
	reducer: {
		tournament: tournamentReducer,
		// Other reducers can go here
	},
});

export default store;
