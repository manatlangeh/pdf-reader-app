import { Stack } from 'expo-router';
import { useAppContext } from './context/AppContext';

export default function Index() {
  const { theme, toggleTheme } = useAppContext();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme === 'dark' ? '#333' : '#fff',
        },
        headerTintColor: theme === 'dark' ? '#fff' : '#000',
      }}
    >
      <Stack.Screen
        name="(tabs)"
        options={{
          headerRight: () => (
            <Button
              icon={theme === 'dark' ? 'weather-sunny' : 'weather-night'}
              onPress={toggleTheme}
              mode="text"
              color={theme === 'dark' ? '#fff' : '#000'}
            />
          ),
        }}
      />
    </Stack>
  );
}
