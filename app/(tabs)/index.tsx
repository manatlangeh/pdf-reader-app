import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { Button } from 'react-native-paper';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#333',
          borderTopColor: '#444',
        },
        headerStyle: {
          backgroundColor: '#333',
        },
        headerTintColor: '#fff',
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#888',
      }}
    >
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color }) => (
            <View style={{ width: 24, height: 24 }} />
          ),
        }}
      />
      <Tabs.Screen
        name="reader"
        options={{
          title: 'Reader',
          tabBarIcon: ({ color }) => (
            <View style={{ width: 24, height: 24 }} />
          ),
        }}
      />
    </Tabs>
  );
}
