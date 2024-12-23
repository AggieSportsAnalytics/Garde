import { configureStore } from "@reduxjs/toolkit";
import tournamentReducer from "./features/tournamentSlice";
import videoNumberReducer from "./features/videoNumberSlice";

const store = configureStore({
	reducer: {
		tournament: tournamentReducer,
		videoNumber: videoNumberReducer,
		// Other reducers can go here
	},
});

export default store;
