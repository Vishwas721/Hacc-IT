import { extendTheme } from '@chakra-ui/react';

// 1. Define custom colors inspired by your example
const colors = {
  brand: {
    50: '#e6f7ff',
    100: '#bae7ff',
    200: '#91d5ff',
    300: '#69c0ff',
    400: '#40a9ff',
    500: '#1890ff', // A professional blue accent
    600: '#096dd9',
    700: '#0050b3',
    800: '#003a8c',
    900: '#002766',
  },
  background: {
    light: '#F7FAFC', // A very light gray for the page background
    white: '#FFFFFF', // For cards
  },
};

// 2. Extend the theme
const theme = extendTheme({
  colors,
  fonts: {
    heading: `'Inter', sans-serif`,
    body: `'Inter', sans-serif`,
  },
  styles: {
    global: {
      'body': {
        bg: 'background.light',
        color: 'gray.800',
      },
    },
  },
});

export default theme;