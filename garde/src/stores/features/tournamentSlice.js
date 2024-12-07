import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	selectedTournament: null,
};

const tournamentSlice = createSlice({
	name: "tournament",
	initialState,
	reducers: {
		selectTournament: (state, action) => {
			state.selectedTournament = action.payload;
		},
		clearTournament: (state) => {
			state.selectedTournament = null;
		},
	},
});

export const { selectTournament, clearTournament } = tournamentSlice.actions;
export default tournamentSlice.reducer;
