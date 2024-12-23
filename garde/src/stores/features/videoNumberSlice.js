import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	videoNumber: null,
};

const videoNumberSlice = createSlice({
	name: "videoNumber",
	initialState,
	reducers: {
		selectVideoNumber: (state, action) => {
			state.videoNumber = action.payload;
		},
		clearVideoNumber: (state) => {
			state.videoNumber = null;
		},
	},
});

export const { selectVideoNumber, clearVideoNumber } = videoNumberSlice.actions;
export default videoNumberSlice.reducer;
