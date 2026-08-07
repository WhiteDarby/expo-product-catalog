import { useColorScheme } from 'react-native';
import { useAppSelector } from '../store/hooks';

export type ThemePreference = 'system' | 'light' | 'dark';
export type ThemeMode = 'light' | 'dark';

export type ThemeColors = {
  background: string;
  surface: string;
  input: string;
  text: string;
  mutedText: string;
  subtleText: string;
  border: string;
  accent: string;
  accentSoft: string;
  danger: string;
  dangerSoft: string;
  success: string;
  successSoft: string;
  imageBackground: string;
  tabInactive: string;
};

export const lightColors: ThemeColors = {
  accent: '#8B6215',
  accentSoft: '#F3EADF',
  background: '#FBFBF9',
  border: '#E7E8E5',
  danger: '#B44837',
  dangerSoft: '#FBE8E4',
  imageBackground: '#F5F5F2',
  input: '#F2F3F5',
  mutedText: '#777D86',
  success: '#3B6B39',
  successSoft: '#F2F5EC',
  subtleText: '#8A8F98',
  surface: '#FFFFFF',
  tabInactive: '#9A9EA4',
  text: '#17191C',
};

export const darkColors: ThemeColors = {
  accent: '#D7AE59',
  accentSoft: '#3A3021',
  background: '#111315',
  border: '#30343A',
  danger: '#E47E6C',
  dangerSoft: '#422622',
  imageBackground: '#24282C',
  input: '#252A2E',
  mutedText: '#A7ADB5',
  success: '#8CC486',
  successSoft: '#263829',
  subtleText: '#9BA2AA',
  surface: '#1B1E21',
  tabInactive: '#808890',
  text: '#F5F5F2',
};

export function useAppTheme() {
  const preference = useAppSelector((state) => state.settings.preference);
  const systemScheme = useColorScheme();
  const mode: ThemeMode = preference === 'system'
    ? systemScheme === 'dark' ? 'dark' : 'light'
    : preference;

  return {
    colors: mode === 'dark' ? darkColors : lightColors,
    mode,
    preference,
  };
}
