// File: client-mobile/App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MyReportsScreen from './screens/MyReportsScreen';
import ReportDetailsScreen from './screens/ReportDetailsScreen';
import SubmitReportScreen from './screens/SubmitReportScreen'; // 1. Import the new screen

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="MyReports" 
          component={MyReportsScreen} 
          options={{ title: 'My Reports' }}
        />
        <Stack.Screen 
          name="ReportDetails" 
          component={ReportDetailsScreen}
          options={{ title: 'Report Details' }}
        />
        {/* 2. Add the SubmitReport screen to the navigator */}
        <Stack.Screen 
          name="SubmitReport" 
          component={SubmitReportScreen}
          options={{ title: 'Submit a New Report' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}