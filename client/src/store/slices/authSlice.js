
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';

const getStoredUser = () => {
  try {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

const getStoredToken = () => {
  try {
    return localStorage.getItem('accessToken') || null;
  } catch {
    return null;
  }
};

const saveSession = (user, accessToken) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
  }
};

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      const result = response.data?.data;

      if (!result?.user || !result?.accessToken) {
        return rejectWithValue(
          'Invalid registration response from server'
        );
      }

      saveSession(result.user, result.accessToken);
      return result;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, 'Registration failed')
      );
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      const result = response.data?.data;

      if (!result?.user || !result?.accessToken) {
        return rejectWithValue(
          'Invalid login response from server'
        );
      }

      saveSession(result.user, result.accessToken);
      return result;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, 'Login failed')
      );
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    try {
      await authService.logout();
    } catch {
      // Clear the local session even if the server is unreachable.
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
    }
  }
);

const initialUser = getStoredUser();
const initialToken = getStoredToken();

const initialState = {
  user: initialUser,
  accessToken: initialToken,
  isAuthenticated: Boolean(initialUser && initialToken),
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },

    setUser: (state, action) => {
      state.user = action.payload;

      if (action.payload) {
        localStorage.setItem(
          'user',
          JSON.stringify(action.payload)
        );
      } else {
        localStorage.removeItem('user');
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || 'Registration failed';
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || 'Login failed';
      })
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.isError = false;
        state.isSuccess = false;
        state.message = '';
      });
  },
});

export const { reset, setUser } = authSlice.actions;
export default authSlice.reducer;
