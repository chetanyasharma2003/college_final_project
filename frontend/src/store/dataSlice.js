import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  schemes: [],
  kpis: [],
  kpiValues: [],
  states: [],
  selectedScheme: null,
  selectedState: null,
  selectedDistrict: null,
  loading: false,
  error: null,
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setSchemes: (state, action) => {
      state.schemes = action.payload;
    },
    setKPIs: (state, action) => {
      state.kpis = action.payload;
    },
    setKPIValues: (state, action) => {
      state.kpiValues = action.payload;
    },
    setStates: (state, action) => {
      state.states = action.payload;
    },
    setSelectedScheme: (state, action) => {
      state.selectedScheme = action.payload;
    },
    setSelectedState: (state, action) => {
      state.selectedState = action.payload;
    },
    setSelectedDistrict: (state, action) => {
      state.selectedDistrict = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setSchemes,
  setKPIs,
  setKPIValues,
  setStates,
  setSelectedScheme,
  setSelectedState,
  setSelectedDistrict,
  setLoading,
  setError,
} = dataSlice.actions;

export default dataSlice.reducer;
