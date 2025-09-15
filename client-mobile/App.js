// File: client-mobile/App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './context/AuthContext';

// Import all screens
import MyReportsScreen from './screens/MyReportsScreen';
import ReportDetailsScreen from './screens/ReportDetailsScreen';
import SubmitReportScreen from './screens/SubmitReportScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

const AppStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

const AppNavigator = () => {
    const { token, loading } = useAuth();

    if (loading) return null; // Or a loading spinner

    return (
        <NavigationContainer>
            {token ? (
                <AppStack.Navigator>
                    <AppStack.Screen name="MyReports" component={MyReportsScreen} />
                    <AppStack.Screen name="ReportDetails" component={ReportDetailsScreen} />
                    <AppStack.Screen name="SubmitReport" component={SubmitReportScreen} />
                </AppStack.Navigator>
            ) : (
                <AuthStack.Navigator>
                    <AuthStack.Screen name="Login" component={LoginScreen} />
                    <AuthStack.Screen name="Register" component={RegisterScreen} />
                </AuthStack.Navigator>
            )}
        </NavigationContainer>
    );
};

export default function App() {
    return (
        <AuthProvider>
            <AppNavigator />
        </AuthProvider>
    );
}